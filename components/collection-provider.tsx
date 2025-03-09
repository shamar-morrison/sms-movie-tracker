"use client"

import { api } from "@/convex/_generated/api"
import { useConvex } from "convex/react"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

type CollectionContextType = {
  collectionMovies: any[] | undefined
  isLoading: boolean
  refreshCollection: () => void
  removeMovieFromState: (movieId: number) => void
  isInitialized: boolean
}

const CollectionContext = createContext<CollectionContextType>({
  collectionMovies: undefined,
  isLoading: true,
  refreshCollection: () => {},
  removeMovieFromState: () => {},
  isInitialized: false,
})

export const useCollection = () => useContext(CollectionContext)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const convex = useConvex()
  const [collectionMovies, setCollectionMovies] = useState<any[] | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  // optimistically removes a movie from the state without triggering a full refresh
  const removeMovieFromState = (movieId: number) => {
    if (collectionMovies) {
      setCollectionMovies((prev) =>
        prev ? prev.filter((movie) => movie.movieId !== movieId) : prev,
      )
    }
  }

  // to force refresh - only use when absolutely necessary
  const refreshCollection = useCallback(() => {
    console.log("[CollectionProvider] Full refresh triggered")
    setIsLoading(true)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  // Fetch collection with retry logic
  const fetchCollectionData = useCallback(async () => {
    try {
      console.log("[CollectionProvider] Fetching collection data...")
      // Direct query using the Convex client - bypasses useQuery's caching
      const result = await convex.query(api.movies.getUserMovies)
      console.log(
        `[CollectionProvider] Collection data fetched:`,
        result ? result.length : 0,
        "items",
      )

      if (result && Array.isArray(result)) {
        setCollectionMovies(result)
        setIsInitialized(true)
        setIsLoading(false)
        setRetryCount(0)
      } else {
        setCollectionMovies([])
        setIsInitialized(true)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("[CollectionProvider] Error fetching collection:", error)

      // If we've retried less than 3 times, try again
      if (retryCount < 3) {
        console.log(`[CollectionProvider] Retrying... (${retryCount + 1}/3)`)
        setRetryCount((prev) => prev + 1)
        // Wait a bit longer between each retry
        setTimeout(
          () => {
            setRefreshTrigger((prev) => prev + 1)
          },
          1000 * (retryCount + 1),
        )
      } else {
        // After 3 retries, give up and show empty state
        setIsLoading(false)
        setIsInitialized(true)
      }
    }
  }, [convex, retryCount])

  // Effect to detect page refresh
  useEffect(() => {
    // This will run only on the first render after a refresh
    const pageRefreshed = sessionStorage.getItem("pageRefreshed") !== "true"
    if (pageRefreshed) {
      console.log("[CollectionProvider] Page was refreshed")
      sessionStorage.setItem("pageRefreshed", "true")

      setIsLoading(true)
      setIsInitialized(false)
    }

    return () => {
      sessionStorage.removeItem("pageRefreshed")
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    // Don't start fetching immediately, give Convex a moment to initialize
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        fetchCollectionData()
      }
    }, 100)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [fetchCollectionData, refreshTrigger])

  return (
    <CollectionContext.Provider
      value={{
        collectionMovies,
        isLoading,
        refreshCollection,
        removeMovieFromState,
        isInitialized,
      }}
    >
      {children}
    </CollectionContext.Provider>
  )
}
