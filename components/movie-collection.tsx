"use client"

import { LoadMoreButton } from "@/components/search/load-more-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MovieSkeleton } from "@/components/ui/movie-skeleton"
import { api } from "@/convex/_generated/api"
import { getDiscoverMovies, loadMoreMoviesByGenre, TMDBMovie } from "@/lib/tmdb"
import { SignInButton, useAuth } from "@clerk/nextjs"
import { useConvexAuth, useQuery } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import CollectionButton from "./collection-button"

// Animation variants for the grid container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      duration: 0.3,
    },
  },
}

// Animation variants for each movie card
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

export default function MovieCollection({
  type,
}: {
  type: "collection" | "discover"
}) {
  // Create a unique cache key to force proper query subscription
  const [cacheKey] = useState(() => Date.now().toString())

  // Use the type as part of the component key to force remount when type changes
  useEffect(() => {
    // Force refresh on type change by logging it
    console.log(
      `[MovieCollection] Type changed to: ${type} with cacheKey: ${cacheKey}`,
    )
  }, [type, cacheKey])

  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [prevMovies, setPrevMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(3) // We start at 3 because we already load pages 1-2 in discoverMovies
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth()

  // Add authReady state to track when all auth checks are complete
  const authReady = clerkLoaded && !authLoading

  // Use simpler approach - normal useQuery without extra options
  const userMovies = useQuery(api.movies.getUserMovies)

  // Important: undefined means the query is still loading
  const isUserMoviesLoading = userMovies === undefined

  // Add debug logging to help track loading states
  useEffect(() => {
    if (type === "collection") {
      console.log("[MovieCollection] Loading state:", {
        type,
        cacheKey,
        authReady,
        isAuthenticated,
        isUserMoviesLoading,
        hasUserMovies: userMovies ? userMovies.length : 0,
      })
    }
  }, [
    type,
    cacheKey,
    authReady,
    isAuthenticated,
    isUserMoviesLoading,
    userMovies,
  ])

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
          // Only check if we're authenticated and auth is ready - don't wait for userMovies
          if (isAuthenticated && authReady) {
            // If userMovies is available, transform them
            if (userMovies) {
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
            // If userMovies is still loading, we'll keep the loading state true
          }
        } else if (type === "discover") {
          try {
            // For discover view, if we already have loaded movies and are just
            // refreshing due to a collection change, keep the existing movies
            if (prevMovies.length > 0 && userMovies !== undefined) {
              setLoading(false)
              return
            }

            const popularMovies = await getDiscoverMovies()

            if (isMounted && popularMovies) {
              result = popularMovies

              setTotalResults(1000) // Just a reasonable default
              setTotalPages(50) // Just a reasonable default
              setCurrentPage(2) // Start from page 2 for "load more"
            }
          } catch (error) {
            console.error("Error fetching discover movies:", error)
          }
        }

        if (isMounted) {
          setMovies(result)
          setLoading(false)
        }
      } catch (error) {
        console.error("Error fetching movies:", error)
        if (isMounted) {
          setLoading(false)
          // Use previous movies if available
          if (prevMovies.length > 0) {
            setMovies(prevMovies)
          }
        }
      }
    }

    fetchMovies()

    return () => {
      isMounted = false
    }
  }, [type, userMovies, isAuthenticated, authReady])

  // Add user ratings to movies after they're fetched
  useEffect(() => {
    if (movies.length > 0 && userMovies && Array.isArray(userMovies)) {
      const userRatingsMap = new Map<number, number>()
      userMovies.forEach((movie: any) => {
        if (movie.movieId && movie.userRating) {
          userRatingsMap.set(movie.movieId, movie.userRating)
        }
      })

      // Use functional update to avoid dependency on movies
      setMovies((currentMovies) => {
        const updatedMovies = currentMovies.map((movie) => {
          if (userRatingsMap.has(movie.id)) {
            return {
              ...movie,
              user_rating: userRatingsMap.get(movie.id),
            }
          }
          return movie
        })

        // Check if any rating has changed to avoid unnecessary updates
        if (
          updatedMovies.some(
            (movie, index) =>
              movie.user_rating !== currentMovies[index].user_rating,
          )
        ) {
          return updatedMovies
        }
        return currentMovies
      })
    }
  }, [userMovies]) // Only depend on userMovies

  // Add a separate effect to handle updates to userMovies without reloading all discover movies
  useEffect(() => {
    // This effect only handles updating existing movie objects with collection status
    // It doesn't reload the entire movie list for discover view
    if (
      type === "discover" &&
      movies.length > 0 &&
      userMovies &&
      Array.isArray(userMovies)
    ) {
      // Update user ratings without replacing the entire movie list
      setMovies((currentMovies) => {
        const updatedMovies = currentMovies.map((movie) => {
          const userMovie = userMovies.find(
            (um: any) => um.movieId === movie.id,
          )
          if (userMovie?.userRating) {
            return {
              ...movie,
              user_rating: userMovie.userRating,
            }
          }
          return movie
        })

        // Only update if there's an actual change
        if (
          updatedMovies.some(
            (movie, index) =>
              movie.user_rating !== currentMovies[index].user_rating,
          )
        ) {
          return updatedMovies
        }
        return currentMovies
      })
    }
  }, [userMovies, type])

  const handleLoadMore = async () => {
    if (type !== "discover" || isLoadingMore) return

    setIsLoadingMore(true)

    try {
      const nextPage = currentPage

      const additionalMovies = await loadMoreMoviesByGenre({
        page: nextPage,
      })

      if (additionalMovies && additionalMovies.length > 0) {
        // Filter out any movies that are already in the list to avoid duplicates
        const existingMovieIds = new Set(movies.map((movie) => movie.id))
        const uniqueNewMovies = additionalMovies.filter(
          (movie) => !existingMovieIds.has(movie.id),
        )

        // Only update if we have unique new movies
        if (uniqueNewMovies.length > 0) {
          setMovies([...movies, ...uniqueNewMovies])
          setCurrentPage(nextPage + 1)
        } else {
          setCurrentPage(nextPage + 1)
        }
      }
    } catch (error) {
      console.error("Error loading more movies:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // 1. FIRST - Show loading UI for all cases where data is loading
  // This should take precedence over authentication checks
  const isInitialLoading =
    type === "collection" && (loading || isUserMoviesLoading)

  // 2. THEN - If not initial loading, check authentication states for collection view
  // Only applicable to collection view
  const needsAuthentication = type === "collection" && authReady && !isSignedIn

  // 3. THEN - If authenticated and data is loaded, but collection is empty
  const hasEmptyCollection =
    type === "collection" &&
    !isInitialLoading &&
    !needsAuthentication &&
    movies.length === 0

  // 4. THEN - If discover view and still loading
  const isDiscoverLoading =
    type === "discover" && loading && prevMovies.length === 0

  // Main content display - actual data
  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {isInitialLoading ? (
          <MovieSkeleton count={12} key="skeletons" />
        ) : needsAuthentication ? (
          <motion.div
            className="rounded-xl border bg-card p-8 text-center"
            key="auth-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4">
              Sign In to View Collection
            </h2>
            <p className="text-muted-foreground mb-6">
              You need to sign in to view and manage your movie collection
            </p>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </motion.div>
        ) : hasEmptyCollection ? (
          <motion.div
            className="rounded-xl border bg-card p-8 text-center"
            key="empty-collection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4">
              Your Collection is Empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Start exploring and adding movies to your collection
            </p>
            <Button asChild>
              <Link href="/discover">Discover Movies</Link>
            </Button>
          </motion.div>
        ) : isDiscoverLoading ? (
          <MovieSkeleton count={12} key="discover-skeletons" />
        ) : (
          <motion.div
            className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            key="movie-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            layout
          >
            {movies &&
              movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  className="group relative overflow-hidden rounded-lg border bg-background"
                  variants={cardVariants}
                  layout
                  layoutId={`movie-${movie.id}`}
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
                    {movie.user_rating && (
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
                    <h3 className="font-semibold line-clamp-1">
                      {movie.title}
                    </h3>
                    <div className="mt-2 flex justify-between items-center">
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
                    <CollectionButton
                      movieId={movie.id}
                      movieTitle={movie.title}
                      movieDetails={{
                        poster_path: movie.poster_path,
                        release_date: movie.release_date,
                        vote_average: movie.vote_average,
                        genres: movie.genres,
                        overview: movie.overview,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {type === "discover" && (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={isLoadingMore}
          hasMoreResults={currentPage <= totalPages}
          totalResults={totalResults}
          loadedResults={movies ? movies.length : 0}
        />
      )}
    </div>
  )
}
