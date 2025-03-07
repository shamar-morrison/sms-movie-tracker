"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { discoverMovies, getDiscoverMovies, TMDBMovie } from "@/lib/tmdb"
import { showAuthToast } from "@/lib/utils"
import { SignInButton, useAuth } from "@clerk/nextjs"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function MovieCollection({
  type,
}: {
  type: "collection" | "discover"
}) {
  const searchParams = useSearchParams()
  const genreIdParam = searchParams.get("genreId")
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [prevMovies, setPrevMovies] = useState<TMDBMovie[]>([]) // Keep previous movies to prevent flickering
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth()

  // Add authReady state to track when all auth checks are complete
  const authReady = clerkLoaded && !authLoading

  const [moviesInCollection, setMoviesInCollection] = useState<Set<number>>(
    new Set(),
  )

  const addMovie = useMutation(api.movies.addMovieToCollection)
  const removeMovie = useMutation(api.movies.removeMovieFromCollection)

  const userMovies = useQuery(api.movies.getUserMovies)

  // Update the list of movie IDs in the collection whenever userMovies changes
  useEffect(() => {
    if (userMovies && Array.isArray(userMovies)) {
      const movieIds = new Set(userMovies.map((movie: any) => movie.movieId))
      setMoviesInCollection(movieIds)
    }
  }, [userMovies])

  useEffect(() => {
    let isMounted = true

    async function fetchMovies() {
      if (!isMounted) return

      // Save current movies before setting loading state
      if (movies.length > 0) {
        setPrevMovies(movies)
      }

      setLoading(true)
      try {
        let result: TMDBMovie[] = []
        if (type === "collection") {
          if (isAuthenticated && userMovies) {
            // Transform Convex documents to TMDBMovie format
            result = userMovies.map(
              (movie: any): TMDBMovie => ({
                id: movie.movieId,
                title: movie.title,
                poster_path: movie.posterPath || null,
                backdrop_path: null,
                release_date: movie.releaseDate || "",
                vote_average: movie.voteAverage || 0,
                vote_count: 0,
                popularity: 0,
                adult: false,
                runtime: 0,
                genres: movie.genres || [],
                production_companies: [],
                budget: 0,
                revenue: 0,
                homepage: null,
                user_rating: movie.userRating,
                overview: movie.overview || "",
              }),
            )
          }
        } else if (type === "discover" && genreIdParam) {
          const response = await discoverMovies(
            genreIdParam,
            1900,
            new Date().getFullYear(),
          )
          result = response.results
        } else {
          result = await getDiscoverMovies()
        }

        if (isMounted) {
          // No longer need to update prevMovies here
          setMovies(result)
        }
      } catch (error) {
        console.error(`Error fetching ${type} movies:`, error)
        if (isMounted) {
          setMovies([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMovies()

    return () => {
      isMounted = false
    }
  }, [type, genreIdParam, isAuthenticated, userMovies])

  const handleAddToCollection = async (
    movie: TMDBMovie,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault() // Prevent navigating to movie details
    e.stopPropagation()

    if (!isSignedIn) {
      showAuthToast()
      return
    }

    // Optimistically update UI
    setMoviesInCollection((prev) => {
      const newSet = new Set(prev)
      newSet.add(movie.id)
      return newSet
    })

    try {
      // Convert null poster_path to undefined for Convex mutation
      const convexMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || undefined,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: movie.genres,
        overview: movie.overview,
      }

      await addMovie({ movie: convexMovie })

      toast.success("Added to your collection", {
        description: `${movie.title} has been added to your collection`,
      })
    } catch (error) {
      // Revert optimistic update on error
      setMoviesInCollection((prev) => {
        const newSet = new Set(prev)
        newSet.delete(movie.id)
        return newSet
      })

      console.error("Error adding movie to collection:", error)
      toast.error("Failed to add movie", {
        description: "There was an error adding the movie to your collection",
      })
    }
  }

  const handleRemoveFromCollection = async (
    movieId: number,
    movieTitle: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault() // Prevent navigating to movie details
    e.stopPropagation()

    // Optimistically update UI
    setMoviesInCollection((prev) => {
      const newSet = new Set(prev)
      newSet.delete(movieId)
      return newSet
    })

    try {
      await removeMovie({ movieId })

      toast.success("Removed from your collection", {
        description: `${movieTitle} has been removed from your collection`,
      })

      // Remove from current view if we're on the collection page
      if (type === "collection") {
        setMovies((prev) => prev.filter((m) => m.id !== movieId))
      }
    } catch (error) {
      // Revert optimistic update on error
      setMoviesInCollection((prev) => {
        const newSet = new Set(prev)
        newSet.add(movieId)
        return newSet
      })

      console.error("Error removing movie from collection:", error)
      toast.error("Failed to remove movie", {
        description:
          "There was an error removing the movie from your collection",
      })
    }
  }

  // 1. FIRST - Show loading UI for all cases where data is loading
  // This should take precedence over authentication checks
  if (loading || !authReady) {
    // Always show loading state with skeletons or previous content
    if (
      type === "discover" ||
      (type === "collection" && prevMovies.length > 0)
    ) {
      // Show previous movies during loading (discover or collection with previous data)
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {prevMovies.map((movie) => (
            <div
              key={movie.id}
              className="group relative overflow-hidden rounded-lg border bg-background"
            >
              <Link
                href={`/movies/${movie.id}`}
                className="absolute inset-0 z-10"
              >
                <span className="sr-only">View {movie.title}</span>
              </Link>
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "/placeholder-movie.svg"
                  }
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {(type as "collection" | "discover") === "collection" &&
                  movie.user_rating && (
                    <div className="absolute top-2 right-2 z-20">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span>{movie.user_rating}/10</span>
                      </Badge>
                    </div>
                  )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-sm text-muted-foreground">
                    {movie.release_date
                      ? new Date(movie.release_date).getFullYear()
                      : "N/A"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-sm">
                      {movie.vote_average?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {movie.genres?.slice(0, 2).map((genre: any) => (
                    <Badge key={genre.id} variant="outline" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
                {type === "collection" ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3 w-full z-20 relative"
                    disabled={true}
                  >
                    Remove from Collection
                  </Button>
                ) : moviesInCollection.has(movie.id) ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3 w-full z-20 relative"
                    disabled={true}
                  >
                    Remove from Collection
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-full z-20 relative"
                    disabled={true}
                  >
                    Add to Collection
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }

    // If no previous movies, show loading skeleton
    const skeletonCount = type === "collection" ? 8 : 12
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border bg-background animate-pulse"
          >
            <div className="aspect-[2/3] bg-muted"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-muted rounded"></div>
              <div className="flex justify-between">
                <div className="h-4 w-1/4 bg-muted rounded"></div>
                <div className="h-4 w-1/4 bg-muted rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-1/3 bg-muted rounded-full"></div>
                <div className="h-6 w-1/3 bg-muted rounded-full"></div>
              </div>
              <div className="h-8 w-full bg-muted rounded mt-3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 2. SECOND - Authentication check (only once loading is complete)
  // Only show sign in message for collection route when not signed in
  if (type === "collection" && !isSignedIn && authReady) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">
          Sign In to View Your Collection
        </h2>
        <p className="text-gray-600 mb-6">
          You need to be signed in to view and manage your movie collection
        </p>
        <SignInButton>
          <Button size="lg">Sign In</Button>
        </SignInButton>
      </div>
    )
  }

  // 3. THIRD - Empty collection check (only after loading and auth are confirmed)
  // Only show empty collection message when we're ABSOLUTELY CERTAIN the collection is empty
  if (
    !loading &&
    authReady &&
    isSignedIn &&
    movies.length === 0 &&
    type === "collection" &&
    userMovies !== undefined
  ) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Your Collection is Empty</h2>
        <p className="text-gray-600 mb-6">
          Start adding movies to build your collection
        </p>
        <Button asChild size="lg">
          <Link href="/discover">Discover Movies</Link>
        </Button>
      </div>
    )
  }

  // 4. FOURTH - Generic empty state for non-collection views
  if (movies.length === 0 && !loading && authReady) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-600">
          No movies found. Please try again later.
        </p>
      </div>
    )
  }

  // 5. FINALLY - Show the actual movie grid when everything is loaded properly
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="group relative overflow-hidden rounded-lg border bg-background"
        >
          <Link href={`/movies/${movie.id}`} className="absolute inset-0 z-10">
            <span className="sr-only">View {movie.title}</span>
          </Link>
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/placeholder-movie.svg"
              }
              alt={movie.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {(type as "collection" | "discover") === "collection" &&
              movie.user_rating && (
                <div className="absolute top-2 right-2 z-20">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span>{movie.user_rating}/10</span>
                  </Badge>
                </div>
              )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-muted-foreground">
                {movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "N/A"}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-sm">
                  {movie.vote_average?.toFixed(1) || "N/A"}
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {movie.genres?.slice(0, 2).map((genre: any) => (
                <Badge key={genre.id} variant="outline" className="text-xs">
                  {genre.name}
                </Badge>
              ))}
            </div>
            {isSignedIn ? (
              moviesInCollection.has(movie.id) ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3 w-full z-20 relative"
                  onClick={(e) =>
                    handleRemoveFromCollection(movie.id, movie.title, e)
                  }
                >
                  Remove from Collection
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3 w-full z-20 relative"
                  onClick={(e) => handleAddToCollection(movie, e)}
                >
                  Add to Collection
                </Button>
              )
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full z-20 relative"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  showAuthToast()
                }}
              >
                Add to Collection
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
