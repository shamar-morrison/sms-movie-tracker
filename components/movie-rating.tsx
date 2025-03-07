"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/convex/_generated/api"
import { SignInButton, useAuth } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface MovieRatingProps {
  movieId: string
  movieDetails?: {
    title: string
    poster_path?: string | null
    release_date?: string
    vote_average?: number
    genres?: Array<{ id: number; name: string }>
    overview?: string
  }
}

export default function MovieRating({
  movieId,
  movieDetails,
}: MovieRatingProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const [userRating, setUserRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [hasRated, setHasRated] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const userMovie = useQuery(api.movies.getUserMovie, {
    movieId: parseInt(movieId, 10),
  })
  const isLoading = userMovie === undefined

  const rateMovieMutation = useMutation(api.movies.rateMovie)

  useEffect(() => {
    if (userMovie && userMovie?.userRating) {
      setUserRating(userMovie.userRating)
      setHasRated(true)
    } else {
      setUserRating(null)
      setHasRated(false)
    }
  }, [userMovie])

  const handleRating = async (rating: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in", {
        description: "You need to be signed in to rate movies",
      })
      return
    }

    // Optimistically update UI
    setUserRating(rating)
    setHasRated(true)
    setIsEditing(false)

    try {
      await rateMovieMutation({
        movieId: parseInt(movieId, 10),
        rating,
        movieDetails: movieDetails
          ? {
              title: movieDetails.title,
              poster_path: movieDetails.poster_path || undefined,
              release_date: movieDetails.release_date,
              vote_average: movieDetails.vote_average,
              genres: movieDetails.genres,
              overview: movieDetails.overview,
            }
          : undefined,
      })

      toast.success("Rating saved", {
        description: "Your rating has been saved to your collection",
      })
    } catch (error) {
      console.error("Error saving rating:", error)
      // Revert UI state on error
      setUserRating(userMovie?.userRating || null)
      setHasRated(!!userMovie?.userRating)

      toast.error("Rating failed", {
        description: "There was an error saving your rating. Please try again.",
      })
    }
  }

  const handleClearRating = async () => {
    if (!userMovie || !userMovie.userRating) return

    // Optimistically update UI
    setUserRating(null)
    setHasRated(false)
    setIsEditing(false)

    try {
      // Clear rating by setting it to 0
      await rateMovieMutation({
        movieId: parseInt(movieId, 10),
        rating: 0,
      })

      toast.success("Rating cleared", {
        description: "Your rating has been removed",
      })
    } catch (error) {
      console.error("Error clearing rating:", error)
      // Revert UI state on error
      setUserRating(userMovie.userRating)
      setHasRated(true)

      toast.error("Failed to clear rating", {
        description:
          "There was an error clearing your rating. Please try again.",
      })
    }
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Rating</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isSignedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Rating</CardTitle>
          <CardDescription>Sign in to rate this movie</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Rating</CardTitle>
          <CardDescription>Loading your rating...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Rating</CardTitle>
          <CardDescription>
            {hasRated && !isEditing
              ? "You've rated this movie."
              : isEditing
                ? "Update your rating below."
                : "Rate this movie to add it to your collection."}
          </CardDescription>
        </div>
        {hasRated && !isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Change
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearRating}>
              Clear
            </Button>
          </div>
        )}
        {isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-1 max-w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <Button
                key={rating}
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                disabled={hasRated && !isEditing}
                onClick={() => handleRating(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(null)}
              >
                <Star
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${
                    (
                      hoveredRating !== null
                        ? rating <= hoveredRating
                        : rating <= (userRating || 0)
                    )
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="sr-only">Rate {rating}</span>
              </Button>
            ))}
          </div>
        </div>
        {hasRated && !isEditing && (
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold">{userRating}/10</div>
            <p className="text-sm text-muted-foreground">Your rating</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
