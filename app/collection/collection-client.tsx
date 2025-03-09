"use client"

import CollectionContent from "@/components/collection-content"
import { CollectionProvider } from "@/components/collection-provider"
import { MovieSkeleton } from "@/components/ui/movie-skeleton"
import { Suspense, useEffect, useState } from "react"

export default function CollectionClient() {
  // Use a key state to force remount of components when needed
  const [componentKey, setComponentKey] = useState(Date.now())

  // Force a remount on initial client-side render
  useEffect(() => {
    // Small delay to ensure all client-side code is ready
    const timer = setTimeout(() => {
      setComponentKey(Date.now())
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Collection</h1>
        <p className="text-muted-foreground">
          View and manage your saved movies
        </p>
      </div>

      <CollectionProvider key={componentKey}>
        <Suspense fallback={<MovieSkeleton count={12} />}>
          <CollectionContent />
        </Suspense>
      </CollectionProvider>
    </div>
  )
}
