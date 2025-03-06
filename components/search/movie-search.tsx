"use client"

import type React from "react"

import MovieResults from "@/components/search/movie-results"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

interface MovieSearchProps {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  results: any[]
  isSearching: boolean
  personName: string | null
  searchPerformed: boolean
  onSearch: (query: string) => Promise<void>
  onClearPerson: () => void
}

export default function MovieSearch({
  query,
  setQuery,
  results,
  isSearching,
  personName,
  searchPerformed,
  onSearch,
  onClearPerson
}: MovieSearchProps) {
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    await onSearch(query)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">
          {personName ? `Movies involving ${personName}` : "Search by Movie Title"}
        </h2>
        <p className="text-muted-foreground">
          {personName 
            ? `Showing movies featuring ${personName}.` 
            : "Find movies by their title. Enter a full or partial movie name."}
        </p>
        {personName && (
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={onClearPerson}
          >
            Back to Search
          </Button>
        )}
      </div>

      {!personName && (
        <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Enter movie title..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
      )}

      {isSearching ? (
        <div className="text-center py-12">Searching...</div>
      ) : (
        !searchPerformed ? (
          <div className="text-center py-16 text-muted-foreground">
            Enter a movie title above and click search to find movies.
          </div>
        ) : (
          <MovieResults 
            results={results} 
            showEmptyMessage={searchPerformed}
          />
        )
      )}
    </div>
  )
}

