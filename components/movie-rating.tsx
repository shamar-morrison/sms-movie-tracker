"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserRating } from "@/lib/tmdb"

export default function MovieRating({ movieId }: { movieId: string }) {
  const [userRating, setUserRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [hasRated, setHasRated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)

 // Placeholder fetch
  useState(() => {
    const fetchRating = async () => {
      try {
        const rating = await getUserRating(movieId)
        if (rating) {
          setUserRating(rating)
          setHasRated(true)
        }
      } catch (error) {
        console.error("Error fetching user rating:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRating()
  })

  const handleRating = async (rating: number) => {
    if (!hasRated) {
      setUserRating(rating)
      setHasRated(true)

      try {
        // we need to would save this rating to a database
        // await fetch('/api/ratings', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ movieId, rating })
        // })
        console.log(`Rated movie ${movieId} with ${rating} stars`)
      } catch (error) {
        console.error("Error saving rating:", error)
        // Revert UI state on error
        setUserRating(null)
        setHasRated(false)
      }
    }
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
      <CardHeader>
        <CardTitle>Your Rating</CardTitle>
        <CardDescription>
          {hasRated
            ? "You've rated this movie. Your rating is saved to your collection."
            : "Rate this movie to add it to your collection."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <Button
                key={rating}
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                disabled={hasRated}
                onClick={() => handleRating(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(null)}
              >
                <Star
                  className={`h-6 w-6 ${
                    (hoveredRating !== null ? rating <= hoveredRating : rating <= (userRating || 0))
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="sr-only">Rate {rating}</span>
              </Button>
            ))}
          </div>
        </div>
        {hasRated && (
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold">{userRating}/10</div>
            <p className="text-sm text-muted-foreground">Your rating</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

