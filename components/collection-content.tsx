"use client"

import CollectionButton from "@/components/collection-button"
import { useCollection } from "@/components/collection-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MovieSkeleton } from "@/components/ui/movie-skeleton"
import { TMDBMovie } from "@/lib/tmdb"
import { AnimatePresence, motion } from "framer-motion"
import { RefreshCw, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

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

export default function CollectionContent() {
  const { collectionMovies, isLoading, refreshCollection } = useCollection()
  const [movies, setMovies] = useState<TMDBMovie[]>([])

  useEffect(() => {
    if (collectionMovies) {
      // Transform Convex documents to TMDBMovie format
      const transformedMovies = collectionMovies.map(
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
      setMovies(transformedMovies)
    }
  }, [collectionMovies])

  if (isLoading) {
    return <MovieSkeleton count={12} />
  }

  if (!movies || movies.length === 0) {
    return (
      <motion.div
        className="rounded-xl border bg-card p-8 text-center"
        key="empty-collection"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Your Collection is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Start exploring and adding movies to your collection
        </p>
        <Button asChild>
          <Link href="/discover">Discover Movies</Link>
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-muted-foreground">
          {movies.length} {movies.length === 1 ? "movie" : "movies"} in your
          collection
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshCollection}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="movie-grid"
          className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          layout
        >
          {movies.map((movie) => (
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
                <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
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
      </AnimatePresence>
    </div>
  )
}
