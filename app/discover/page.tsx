import MovieCollection from "@/components/movie-collection"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discover Movies | Movie Tracker",
  description: "Discover new movies to add to your collection",
}

export default function DiscoverPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Movies</h1>
        <p className="text-muted-foreground">
          Browse through popular movies and add them to your collection
        </p>
      </div>
      <MovieCollection type="discover" />
    </div>
  )
}
