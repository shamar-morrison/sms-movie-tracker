"use client"

import { api } from "@/convex/_generated/api"
import { useConvex } from "convex/react"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

type CollectionContextType = {
  collectionMovies: any[] | undefined
  isLoading: boolean
  refreshCollection: () => void
  removeMovieFromState: (movieId: number) => void
}

const CollectionContext = createContext<CollectionContextType>({
  collectionMovies: undefined,
  isLoading: true,
  refreshCollection: () => {},
  removeMovieFromState: () => {},
})

export const useCollection = () => useContext(CollectionContext)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const convex = useConvex()
  const [collectionMovies, setCollectionMovies] = useState<any[] | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // optimistically removes a movie from the state without triggering a full refresh
  const removeMovieFromState = (movieId: number) => {
    if (collectionMovies) {
      setCollectionMovies((prev) =>
        prev ? prev.filter((movie) => movie.movieId !== movieId) : prev,
      )
    }
  }

  // to force refresh - only use when absolutely necessary
  const refreshCollection = () => {
    console.log("[CollectionProvider] Full refresh triggered")
    setIsLoading(true)
    setRefreshTrigger((prev) => prev + 1)
  }

  // Direct query using the client instead of useQuery hook
  useEffect(() => {
    let isMounted = true

    async function fetchCollection() {
      // Only show loading indicator on first load, not during refreshes
      if (!collectionMovies) {
        setIsLoading(true)
      }

      try {
        // Direct query using the Convex client - bypasses useQuery's caching
        const result = await convex.query(api.movies.getUserMovies)

        if (isMounted) {
          setCollectionMovies(result)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("[CollectionProvider] Error fetching collection:", error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCollection()

    return () => {
      isMounted = false
    }
  }, [convex, refreshTrigger])

  return (
    <CollectionContext.Provider
      value={{
        collectionMovies,
        isLoading,
        refreshCollection,
        removeMovieFromState,
      }}
    >
      {children}
    </CollectionContext.Provider>
  )
}
