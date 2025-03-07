"use client"

import CollectionButton from "@/components/collection-button"
import MovieRating from "@/components/movie-rating"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/convex/_generated/api"
import { getMovieById, TMDBMovie } from "@/lib/tmdb"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useQuery } from "convex/react"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

interface MovieCast {
  id: number
  name: string
  character: string
  profile_path: string | null
  known_for_department: string
  order: number
}

interface MovieCrew {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

interface ProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

interface Genre {
  id: number
  name: string
}

export default function MoviePage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<TMDBMovie | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const userMovie = useQuery(api.movies.getUserMovie, {
    movieId: parseInt(params.id, 10),
  })

  useEffect(() => {
    async function loadMovie() {
      try {
        const movieData = await getMovieById(params.id)
        setMovie(movieData)
      } catch (error) {
        console.error("Error loading movie:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMovie()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading movie details...</div>
      </div>
    )
  }

  if (!movie) {
    return <div className="container py-10">Movie not found</div>
  }

  if (userMovie && userMovie.userRating) {
    movie.user_rating = userMovie.userRating
  }

  return (
    <div className="min-h-screen bg-background pb-9">
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <Image
          src={
            movie.backdrop_path
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
              : "/placeholder-backdrop.svg"
          }
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute top-4 left-4 z-20">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
        </div>
      </div>

      <main className="container relative z-20 -mt-32">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 lg:gap-12">
          <div className="hidden md:block">
            <div className="sticky top-24">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border">
                <Image
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "/placeholder-movie.svg"
                  }
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-6 space-y-4">
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
                  size="default"
                  variant="default"
                />
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex md:hidden items-center gap-4">
              <div className="relative w-24 aspect-[2/3] overflow-hidden rounded-lg border">
                <Image
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "/placeholder-movie.svg"
                  }
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{movie.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                  <span>•</span>
                  <span>{movie.runtime} min</span>
                  <span>•</span>
                  <span>{movie.adult ? "R" : "PG-13"}</span>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <h1 className="text-4xl font-bold">{movie.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <span>{new Date(movie.release_date).getFullYear()}</span>
                <span>•</span>
                <span>{movie.runtime} min</span>
                <span>•</span>
                <span>{movie.adult ? "R" : "PG-13"}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre: Genre) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>

            <div className="flex md:hidden gap-2">
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
                className="flex-1"
                variant="default"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="text-muted-foreground">{movie.overview}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold">
                    {movie.vote_average.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    TMDB Rating
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold">{movie.vote_count}</div>
                  <div className="text-sm text-muted-foreground">
                    Vote Count
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold">
                    {movie.popularity.toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Popularity
                  </div>
                </CardContent>
              </Card>
            </div>

            <MovieRating
              movieId={movie.id.toString()}
              movieDetails={{
                title: movie.title,
                poster_path: movie.poster_path,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                genres: movie.genres,
                overview: movie.overview,
              }}
            />

            <Separator />

            <Tabs defaultValue="cast">
              <TabsList>
                <TabsTrigger value="cast">Cast</TabsTrigger>
                <TabsTrigger value="crew">Crew</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="cast" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Click on a cast member to see all their movies.
                </p>
                {movie.credits?.cast && movie.credits.cast.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {movie.credits.cast.slice(0, 8).map((person: MovieCast) => (
                      <div key={person.id} className="space-y-2">
                        <Link
                          href={`/search?tab=movie&personId=${person.id}&personName=${encodeURIComponent(person.name)}`}
                          className="block"
                        >
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group cursor-pointer">
                            <Image
                              src={
                                person.profile_path
                                  ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                                  : "/placeholder-user.svg"
                              }
                              alt={person.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <div className="font-medium hover:text-primary transition-colors">
                              {person.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {person.character}
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No cast information available for this movie.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="crew" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Click on a crew member to see all their movies.
                </p>
                {movie.credits?.crew && movie.credits.crew.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {movie.credits.crew.slice(0, 8).map((person: MovieCrew) => (
                      <div
                        key={`${person.id}-${person.job}`}
                        className="flex items-center gap-4"
                      >
                        <Link
                          href={`/search?tab=movie&personId=${person.id}&personName=${encodeURIComponent(person.name)}`}
                          className="flex items-center gap-4 w-full group cursor-pointer"
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={
                                person.profile_path
                                  ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                                  : "/placeholder-user.svg"
                              }
                              alt={person.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <div className="font-medium hover:text-primary transition-colors">
                              {person.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {person.job}
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No crew information available for this movie.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="details" className="space-y-4 mt-4">
                {movie.release_date ||
                movie.runtime ||
                movie.budget ||
                movie.revenue ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="font-medium">Release Date</div>
                      <div className="text-muted-foreground">
                        {formatDate(movie.release_date)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Production Companies</div>
                      <div className="text-muted-foreground">
                        {movie.production_companies
                          .map((company: ProductionCompany) => company.name)
                          .join(", ")}
                      </div>
                    </div>
                    {movie.budget > 0 && (
                      <div>
                        <div className="font-medium">Budget</div>
                        <div className="text-muted-foreground">
                          {formatCurrency(movie.budget)}
                        </div>
                      </div>
                    )}
                    {movie.revenue > 0 && (
                      <div>
                        <div className="font-medium">Revenue</div>
                        <div className="text-muted-foreground">
                          {formatCurrency(movie.revenue)}
                        </div>
                      </div>
                    )}
                    {movie.homepage && (
                      <div>
                        <div className="font-medium">Homepage</div>
                        <div className="text-muted-foreground">
                          <a
                            href={movie.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {movie.homepage}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No additional details available for this movie.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
