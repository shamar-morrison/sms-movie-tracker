"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { discoverMovies, getDiscoverMovies, getMovieCollection } from "@/lib/tmdb"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function MovieCollection({ type }: { type: "collection" | "discover" }) {
  const searchParams = useSearchParams()
  const genreIdParam = searchParams.get("genreId")
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true)
      try {
        let result = []
        if (type === "collection") {
          result = await getMovieCollection()
        } else if (type === "discover" && genreIdParam) {
          result = await discoverMovies(genreIdParam, 1900, new Date().getFullYear())
        } else {
          result = await getDiscoverMovies()
        }
        setMovies(result)
      } catch (error) {
        console.error(`Error fetching ${type} movies:`, error)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [type, genreIdParam])

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-600">Loading movies...</p>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-600">No movies found. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <div key={movie.id} className="group relative overflow-hidden rounded-lg border bg-background">
          <Link href={`/movies/${movie.id}`} className="absolute inset-0 z-10">
            <span className="sr-only">View {movie.title}</span>
          </Link>
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/placeholder.svg?height=450&width=300"
              }
              alt={movie.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {type === "collection" && movie.user_rating && (
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
              <div className="text-sm text-muted-foreground">{new Date(movie.release_date).getFullYear()}</div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-sm">{movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {movie.genres?.slice(0, 2).map((genre: any) => (
                <Badge key={genre.id} variant="outline" className="text-xs">
                  {genre.name}
                </Badge>
              ))}
            </div>
            {type === "discover" && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-3 w-full relative z-[5]"
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

