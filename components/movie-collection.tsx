"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MovieSkeleton } from "@/components/ui/movie-skeleton"
import { api } from "@/convex/_generated/api"
import { discoverMovies, getDiscoverMovies, TMDBMovie } from "@/lib/tmdb"
import { SignInButton, useAuth } from "@clerk/nextjs"
import { useConvexAuth, useQuery } from "convex/react"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import CollectionButton from "./collection-button"

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

  const userMovies = useQuery(api.movies.getUserMovies)

  // Important: undefined means the query is still loading
  const isUserMoviesLoading = userMovies === undefined

  useEffect(() => {
    if (userMovies && Array.isArray(userMovies)) {
      const movieIds = new Set(userMovies.map((movie: any) => movie.movieId))
      setMoviesInCollection(movieIds)
    }
  }, [userMovies])

  // Add user ratings to movies after they're fetched
  useEffect(() => {
    if (movies.length > 0 && userMovies && Array.isArray(userMovies)) {
      const userRatingsMap = new Map<number, number>()
      userMovies.forEach((movie: any) => {
        if (movie.movieId && movie.userRating) {
          userRatingsMap.set(movie.movieId, movie.userRating)
        }
      })

      const updatedMovies = movies.map((movie) => {
        if (userRatingsMap.has(movie.id)) {
          return {
            ...movie,
            user_rating: userRatingsMap.get(movie.id),
          }
        }
        return movie
      })

      // Only update if there's any difference
      if (
        updatedMovies.some(
          (movie, index) => movie.user_rating !== movies[index].user_rating,
        )
      ) {
        setMovies(updatedMovies)
      }
    }
  }, [movies, userMovies])

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

    // Only fetch movies if we're in discover mode OR if userMovies has loaded for collection mode
    if (type !== "collection" || !isUserMoviesLoading) {
      fetchMovies()
    }

    return () => {
      isMounted = false
    }
  }, [type, genreIdParam, isAuthenticated, userMovies, isUserMoviesLoading])

  // consider both the loading state and the Convex query loading state
  const isCollectionLoading =
    type === "collection" && (loading || isUserMoviesLoading)

  // 1. FIRST - Show loading UI for all cases where data is loading
  // This should take precedence over authentication checks
  if ((type === "discover" && loading) || isCollectionLoading || !authReady) {
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
    return <MovieSkeleton count={skeletonCount} />
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
    !isCollectionLoading &&
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
  if (movies.length === 0 && !loading && authReady && type !== "collection") {
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
            {movie.user_rating && (
              <div className="absolute top-2 right-2 z-20">
                <Badge variant="secondary" className="flex items-center gap-1">
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
        </div>
      ))}
    </div>
  )
}
