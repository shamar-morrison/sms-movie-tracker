"use client"

import type React from "react"

import PersonResults from "@/components/search/person-results"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

interface PersonSearchProps {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  results: any[]
  isSearching: boolean
  searchPerformed: boolean
  onSearch: (query: string) => Promise<void>
  onSelectPerson: (id: string) => Promise<void>
}

export default function PersonSearch({
  query,
  setQuery,
  results,
  isSearching,
  searchPerformed,
  onSearch,
  onSelectPerson
}: PersonSearchProps) {

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    await onSearch(query)
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

      {isSearching ? (
        <div className="text-center py-12">Searching...</div>
      ) : (
        !searchPerformed ? (
          <div className="text-center py-16 text-muted-foreground">
            Enter an actor or director name above and click search to find people.
          </div>
        ) : (
          <PersonResults 
            results={results} 
            showEmptyMessage={searchPerformed} 
            onSelectPerson={onSelectPerson}
          />
        )
      )}
    </div>
  )
}

