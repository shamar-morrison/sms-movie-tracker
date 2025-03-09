"use client"

import { useCollection } from "@/components/collection-provider"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { showAuthToast } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export const ratingChangeEvent = new EventTarget()

// Allow forcing a refresh of Convex data
export function triggerConvexRefresh() {
  ratingChangeEvent.dispatchEvent(
    new CustomEvent("ratingChange", {
      detail: { timestamp: Date.now() },
    }),
  )
}

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
  const pathname = usePathname()
  const isCollectionPage = pathname === "/collection"

  const { removeMovieFromState } = useCollection()

  const userMovie = useQuery(api.movies.getUserMovie, { movieId })

  const addMovie = useMutation(api.movies.addMovieToCollection)
  const removeMovie = useMutation(api.movies.removeMovieFromCollection)

  useEffect(() => {
    if (userMovie) {
      setIsInCollection(true)
    } else {
      setIsInCollection(false)
    }
  }, [userMovie])

  // Loading state - undefined means the query is still loading
  const isLoading = userMovie === undefined && isSignedIn

  const handleAddToCollection = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault() // Prevent navigating to movie details
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

      const result = await addMovie({
        movie: convexMovie,
      })

      console.log("[CollectionButton] Movie added, triggering refresh", movieId)

      // Dispatch an event to notify components that a rating change occurred
      // Pass more details to help with debugging
      ratingChangeEvent.dispatchEvent(
        new CustomEvent("ratingChange", {
          detail: {
            movieId,
            action: "add",
            timestamp: Date.now(),
            result,
          },
        }),
      )

      // Force a small delay to ensure Convex has time to update its data
      setTimeout(() => {
        triggerConvexRefresh()
      }, 100)

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
    e.preventDefault() // Prevent navigating to movie details
    e.stopPropagation()

    // If we're on the collection page, use the optimistic removal approach
    if (isCollectionPage) {
      // Use our optimistic removal function to update the UI immediately
      removeMovieFromState(movieId)
    }

    const currentRating = userMovie?.userRating

    // Optimistically update UI state for this button
    setIsInCollection(false)

    try {
      const result = await removeMovie({
        movieId,
      })

      ratingChangeEvent.dispatchEvent(
        new CustomEvent("ratingChange", {
          detail: {
            movieId,
            action: "remove",
            previousRating: currentRating,
            timestamp: Date.now(),
            result,
          },
        }),
      )

      // Force a small delay to ensure Convex has time to update its data
      setTimeout(() => {
        triggerConvexRefresh()
      }, 100)

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
