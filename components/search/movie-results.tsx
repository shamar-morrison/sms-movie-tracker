import { Badge } from "@/components/ui/badge"
import { api } from "@/convex/_generated/api"
import { TMDBMovie } from "@/lib/tmdb"
import { useQuery } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import CollectionButton from "../collection-button"

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

interface MovieResultsProps {
  results: TMDBMovie[]
  showEmptyMessage?: boolean
}

export default function MovieResults({
  results,
  showEmptyMessage = false,
}: MovieResultsProps) {
  const [movieRatings, setMovieRatings] = useState<
    Record<number, number | null>
  >({})

  const userMovies = useQuery(api.movies.getUserMovies)

  // Extract user ratings for all movies when userMovies changes
  useEffect(() => {
    if (userMovies && Array.isArray(userMovies)) {
      const ratings: Record<number, number | null> = {}
      userMovies.forEach((movie: { movieId?: number; userRating?: number }) => {
        if (movie.movieId && movie.userRating) {
          ratings[movie.movieId] = movie.userRating
        }
      })
      setMovieRatings(ratings)
    }
  }, [userMovies])

  if (results.length === 0) {
    return showEmptyMessage ? (
      <div className="text-center py-8 text-muted-foreground">
        No results found. Try a different search.
      </div>
    ) : null
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        key="movie-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        layout
      >
        {results.map((movie) => (
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
              {/* Display user rating if available */}
              {movieRatings[movie.id] && (
                <div className="absolute top-2 right-2 z-20">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span>{movieRatings[movie.id]}/10</span>
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
                {movie.genres
                  ?.slice(0, 2)
                  .map((genre: { id: number; name: string }) => (
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
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
