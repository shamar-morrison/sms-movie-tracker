"use client"

import DiscoverFilters from "@/components/discover-filters"
import MovieCollection from "@/components/movie-collection"
import { MovieSkeleton } from "@/components/ui/movie-skeleton"
import { Suspense } from "react"

export default function DiscoverPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Movies</h1>
        <p className="text-muted-foreground">
          Browse through movies and add them to your collection
        </p>
      </div>
      <DiscoverFilters />
      <Suspense fallback={<MovieSkeleton count={12} />}>
        <MovieCollection type="discover" />
      </Suspense>
    </div>
  )
}
