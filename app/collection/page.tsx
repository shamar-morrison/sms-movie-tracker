import MovieCollection from "@/components/movie-collection"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Collection | Movie Tracker",
  description: "View and manage your movie collection",
}

export default function CollectionPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Collection</h1>
        <p className="text-muted-foreground">
          View and manage your saved movies
        </p>
      </div>
      <MovieCollection type="collection" />
    </div>
  )
}
