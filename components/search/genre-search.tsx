"use client"

import { TMDBMovie } from "@/lib/tmdb"
import type React from "react"
import { Dispatch, SetStateAction } from "react"

import MovieResults from "@/components/search/movie-results"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface GenreSearchProps {
  selectedGenre: string
  setSelectedGenre: Dispatch<SetStateAction<string>>
  yearRange: number[]
  setYearRange: Dispatch<SetStateAction<number[]>>
  results: TMDBMovie[]
  isSearching: boolean
  searchPerformed: boolean
  onSearch: (genreId: string) => Promise<void>
}

export default function GenreSearch({
  selectedGenre,
  setSelectedGenre,
  yearRange,
  setYearRange,
  results,
  isSearching,
  searchPerformed,
  onSearch,
}: GenreSearchProps) {
  const genres = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
  ]

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGenre) return

    await onSearch(selectedGenre)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Discover by Genre and Year
        </h2>
        <p className="text-muted-foreground">
          Find movies by selecting a genre and release year range.
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium mb-1">
              Genre
            </label>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger id="genre" className="w-full max-w-xs">
                <SelectValue placeholder="Select a genre">
                  {genres.find((g) => g.id.toString() === selectedGenre)
                    ?.name || "Select a genre"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id.toString()}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="year-range"
              className="block text-sm font-medium mb-1"
            >
              Release Year Range: {yearRange[0]} - {yearRange[1]}
            </label>
            <Slider
              id="year-range"
              min={1900}
              max={new Date().getFullYear()}
              step={1}
              value={yearRange}
              onValueChange={setYearRange}
              className="max-w-md"
            />
          </div>
        </div>

        <Button type="submit" disabled={isSearching || !selectedGenre}>
          {isSearching ? "Searching..." : "Discover Movies"}
        </Button>
      </form>

      {isSearching ? (
        <div className="text-center py-12">Searching...</div>
      ) : !searchPerformed ? (
        <div className="text-center py-16 text-muted-foreground">
          Select a genre and year range above, then click "Discover Movies" to
          see results.
        </div>
      ) : (
        <MovieResults results={results} showEmptyMessage={searchPerformed} />
      )}
    </div>
  )
}
