"use client"

import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { showAuthToast } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface CollectionButtonProps {
  movieId: number
  movieTitle: string
  movieDetails: {
    poster_path?: string | null
    release_date?: string
    vote_average?: number
    genres?: Array<{ id: number; name: string }>
    overview?: string
  }
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function CollectionButton({
  movieId,
  movieTitle,
  movieDetails,
  variant = "secondary",
  size = "sm",
  className = "mt-3 w-full z-20 relative",
}: CollectionButtonProps) {
  const { isSignedIn } = useAuth()
  const [isInCollection, setIsInCollection] = useState<boolean | null>(null)

  const userMovies = useQuery(api.movies.getUserMovies)

  const addMovie = useMutation(api.movies.addMovieToCollection)
  const removeMovie = useMutation(api.movies.removeMovieFromCollection)

  // Update isInCollection state when userMovies changes
  useEffect(() => {
    if (userMovies && Array.isArray(userMovies)) {
      const movieIds = new Set(userMovies.map((movie: any) => movie.movieId))
      setIsInCollection(movieIds.has(movieId))
    }
  }, [userMovies, movieId])

  // undefined means the query is still loading
  const isLoading = userMovies === undefined

  const handleAddToCollection = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isSignedIn) {
      showAuthToast()
      return
    }

    // Optimistically update UI
    setIsInCollection(true)

    try {
      // Convert null poster_path to undefined for Convex mutation
      const convexMovie = {
        id: movieId,
        title: movieTitle,
        poster_path: movieDetails.poster_path || undefined,
        release_date: movieDetails.release_date,
        vote_average: movieDetails.vote_average,
        genres: movieDetails.genres,
        overview: movieDetails.overview,
      }

      await addMovie({ movie: convexMovie })

      toast.success("Added to your collection", {
        description: `${movieTitle} has been added to your collection`,
      })
    } catch (error) {
      // Revert optimistic update on error
      setIsInCollection(false)
      console.error("Error adding movie to collection:", error)
      toast.error("Failed to add movie", {
        description: "There was an error adding the movie to your collection",
      })
    }
  }

  const handleRemoveFromCollection = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault()
    e.stopPropagation()

    setIsInCollection(false)

    try {
      await removeMovie({ movieId })

      toast.success("Removed from your collection", {
        description: `${movieTitle} has been removed from your collection`,
      })
    } catch (error) {
      // Revert optimistic update on error
      setIsInCollection(true)
      console.error("Error removing movie from collection:", error)
      toast.error("Failed to remove movie", {
        description:
          "There was an error removing the movie from your collection",
      })
    }
  }

  if (!isSignedIn) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          showAuthToast()
        }}
      >
        Add to Collection
      </Button>
    )
  }

  if (isLoading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        {isInCollection ? "Remove from Collection" : "Add to Collection"}
      </Button>
    )
  }

  return isInCollection ? (
    <Button
      variant="destructive"
      size={size}
      className={className}
      onClick={handleRemoveFromCollection}
    >
      Remove from Collection
    </Button>
  ) : (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCollection}
    >
      Add to Collection
    </Button>
  )
}
