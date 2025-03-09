"use client"

import CollectionContent from "@/components/collection-content"
import { CollectionProvider } from "@/components/collection-provider"
import { MovieSkeleton } from "@/components/ui/movie-skeleton"
import { Suspense } from "react"

export default function CollectionClient() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Collection</h1>
        <p className="text-muted-foreground">
          View and manage your saved movies
        </p>
      </div>

      <CollectionProvider>
        <Suspense fallback={<MovieSkeleton count={12} />}>
          <CollectionContent />
        </Suspense>
      </CollectionProvider>
    </div>
  )
}
