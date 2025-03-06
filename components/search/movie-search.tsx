"use client"

import type React from "react"

import MovieResults from "@/components/search/movie-results"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMoviesByPerson, getPersonById, searchMoviesByTitle } from "@/lib/tmdb"
import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function MovieSearch() {
  const searchParams = useSearchParams()
  const personId = searchParams.get("person")
  
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [personName, setPersonName] = useState<string | null>(null)

  useEffect(() => {
    if (personId) {
      searchByPerson(personId);
    }
  }, [personId]);

  const searchByPerson = async (id: string) => {
    setIsSearching(true);
    try {
      const personDetails = await getPersonById(id);

      const searchResults = await getMoviesByPerson(id);
      setResults(searchResults);

      setPersonName(personDetails?.name || "Selected Person");
    } catch (error) {
      console.error("Error fetching movies by person:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setPersonName(null) // Reset person name when searching by title

    try {
      const searchResults = await searchMoviesByTitle(query)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching movies:", error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
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
        <div className="text-center py-8">Searching...</div>
      ) : (
        <MovieResults results={results} />
      )}
    </div>
  )
}

