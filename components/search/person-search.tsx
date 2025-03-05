"use client"

import type React from "react"

import PersonResults from "@/components/search/person-results"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchPeople } from "@/lib/tmdb"
import { Search } from "lucide-react"
import { useState } from "react"

export default function PersonSearch() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)

    try {
      const searchResults = await searchPeople(query)
      setResults(searchResults)
      console.log("Found people:", searchResults.length)
    } catch (error) {
      console.error("Error searching people:", error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Search by Actor or Director</h2>
        <p className="text-muted-foreground">Find movies featuring specific actors or made by specific directors.</p>
      </div>

      <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Enter actor or director name..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      <PersonResults results={results} />
    </div>
  )
}

