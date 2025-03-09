"use client"

import { api } from "@/convex/_generated/api"
import { useConvex } from "convex/react"
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

// Define the context type
type CollectionContextType = {
  collectionMovies: any[] | undefined
  isLoading: boolean
  refreshCollection: () => void
}

// Create context with defaults
const CollectionContext = createContext<CollectionContextType>({
  collectionMovies: undefined,
  isLoading: true,
  refreshCollection: () => {},
})

// Custom hook to use the collection context
export const useCollection = () => useContext(CollectionContext)

export function CollectionProvider({ children }: { children: ReactNode }) {
  const convex = useConvex()
  const [collectionMovies, setCollectionMovies] = useState<any[] | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // This effect will run whenever a collection button is clicked
  // and will listen for mutation events involving the collection
  useEffect(() => {
    // Function to detect for collection-related events
    const checkForCollectionChanges = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest("button")) {
        const buttonText = target.textContent?.toLowerCase() || ""

        // Check if this was a collection-related button click
        if (
          buttonText.includes("collection") ||
          buttonText.includes("remove")
        ) {
          // Wait a bit for the mutation to complete, then refresh
          setTimeout(() => {
            console.log(
              "[CollectionProvider] Collection change detected, refreshing...",
            )
            refreshCollection()
          }, 500)
        }
      }
    }

    // Add global click listener to detect collection button clicks
    document.addEventListener("click", checkForCollectionChanges)

    return () => {
      document.removeEventListener("click", checkForCollectionChanges)
    }
  }, [])

  // Function to force refresh
  const refreshCollection = () => {
    setIsLoading(true)
    setRefreshTrigger((prev) => prev + 1)
  }

  // Direct query using the client instead of useQuery hook
  useEffect(() => {
    let isMounted = true

    async function fetchCollection() {
      console.log("[CollectionProvider] Fetching collection directly...")
      setIsLoading(true)

      try {
        // Direct query using the Convex client - bypasses useQuery's caching
        const result = await convex.query(api.movies.getUserMovies)

        if (isMounted) {
          console.log(
            "[CollectionProvider] Collection fetched:",
            result?.length || 0,
            "items",
          )
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
      }}
    >
      {children}
    </CollectionContext.Provider>
  )
}
