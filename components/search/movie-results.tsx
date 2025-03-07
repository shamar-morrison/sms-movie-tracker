import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import CollectionButton from "../collection-button"

interface MovieResultsProps {
  results: any[]
  showEmptyMessage?: boolean
}

export default function MovieResults({
  results,
  showEmptyMessage = false,
}: MovieResultsProps) {
  if (results.length === 0) {
    return showEmptyMessage ? (
      <div className="text-center py-8 text-muted-foreground">
        No results found. Try a different search.
      </div>
    ) : null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.map((movie) => (
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
