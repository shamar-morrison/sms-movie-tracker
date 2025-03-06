"use client"

import GenreSearch from "@/components/search/genre-search"
import { LoadMoreButton } from "@/components/search/load-more-button"
import MovieSearch from "@/components/search/movie-search"
import PersonSearch from "@/components/search/person-search"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TMDBMovie, TMDBPerson } from "@/lib/tmdb"
import {
  discoverMovies,
  getMoviesByPerson,
  getPersonById,
  loadMoreMoviesByGenre,
  searchMoviesByTitle as tmdbSearchMovies,
  searchPeople,
} from "@/lib/tmdb"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SearchTabs() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "movie"
  const [activeTab, setActiveTab] = useState(tabParam)
  const router = useRouter()

  // Get personId and personName from URL if available
  const personIdParam = searchParams.get("personId")
  const personNameParam = searchParams.get("personName")

  // Update activeTab when URL parameters change (browser navigation)
  useEffect(() => {
    setActiveTab(tabParam)
  }, [tabParam])

  // Load person movies if personId is in URL
  useEffect(() => {
    if (personIdParam && personNameParam) {
      setSelectedPersonId(personIdParam)
      setSelectedPersonName(personNameParam)
      loadMoviesByPerson(personIdParam)
    }
  }, [personIdParam, personNameParam])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/search?tab=${value}`, { scroll: false })
  }

  // pagination state for genre search
  const [currentGenrePage, setCurrentGenrePage] = useState(2) // Start at 2 since we already load pages 1-2 initially
  const [totalGenreResults, setTotalGenreResults] = useState(0)
  const [totalGenrePages, setTotalGenrePages] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Movie search state
  const [movieQuery, setMovieQuery] = useState("")
  const [movieResults, setMovieResults] = useState<TMDBMovie[]>([])
  const [movieSearchPerformed, setMovieSearchPerformed] = useState(false)

  // Person search state
  const [personQuery, setPersonQuery] = useState("")
  const [personResults, setPersonResults] = useState<TMDBPerson[]>([])
  const [personSearchPerformed, setPersonSearchPerformed] = useState(false)
  const [_, setSelectedPersonId] = useState<string | null>(null)
  const [selectedPersonName, setSelectedPersonName] = useState<string | null>(
    null,
  )

  // Shared loading state
  const [isSearching, setIsSearching] = useState(false)

  // Genre search state
  const [selectedGenre, setSelectedGenre] = useState("")
  const [yearRange, setYearRange] = useState([1990, new Date().getFullYear()])
  const [genreResults, setGenreResults] = useState<TMDBMovie[]>([])
  const [genreSearchPerformed, setGenreSearchPerformed] = useState(false)

  const searchMoviesByGenre = async (genreId: string) => {
    if (!genreId) return

    setIsSearching(true)
    setGenreSearchPerformed(true)

    try {
      console.log(
        `Searching for movies in genre ${genreId} with year range: ${yearRange[0]}-${yearRange[1]}`,
      )
      const { results, totalResults, totalPages } = await discoverMovies(
        genreId,
        yearRange[0],
        yearRange[1],
      )
      setGenreResults(results)
      setTotalGenreResults(totalResults)
      setTotalGenrePages(totalPages)
      setCurrentGenrePage(3) // Reset to page 3 for next load more (since we already loaded 1-2)
    } catch (error) {
      console.error("Error discovering movies:", error)
      setGenreResults([])
      setTotalGenreResults(0)
      setTotalGenrePages(0)
    } finally {
      setIsSearching(false)
    }
  }

  const loadMoreGenreResults = async () => {
    if (!selectedGenre || currentGenrePage > totalGenrePages) return

    setIsLoadingMore(true)

    try {
      const additionalMovies = await loadMoreMoviesByGenre(
        selectedGenre,
        yearRange[0],
        yearRange[1],
        currentGenrePage,
      )

      setGenreResults((prev) => [...prev, ...additionalMovies])
      setCurrentGenrePage((prev) => prev + 1)
    } catch (error) {
      console.error("Error loading more movies:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const searchMoviesByTitle = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    setMovieSearchPerformed(true)

    try {
      const results = await tmdbSearchMovies(query)
      setMovieResults(results)
    } catch (error) {
      console.error("Error searching movies:", error)
      setMovieResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const clearSelectedPerson = () => {
    setSelectedPersonId(null)
    setSelectedPersonName(null)
    setMovieResults([])
    setMovieSearchPerformed(false)
    // Update URL to remove personId and personName
    router.push(`/search?tab=${activeTab}`, { scroll: false })
  }

  const searchPeopleByName = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    setPersonSearchPerformed(true)

    try {
      const results = await searchPeople(query)
      setPersonResults(results)
    } catch (error) {
      console.error("Error searching people:", error)
      setPersonResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const selectPerson = async (personId: string) => {
    try {
      setIsSearching(true)

      const person = await getPersonById(personId)
      if (!person) {
        console.error("Person not found:", personId)
        return
      }

      setSelectedPersonId(personId)
      setSelectedPersonName(person.name)

      const movies = await getMoviesByPerson(personId)
      setMovieResults(movies)
      setMovieSearchPerformed(true)

      handleTabChange("movie")
    } catch (error) {
      console.error("Error selecting person:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const loadMoviesByPerson = async (personId: string) => {
    try {
      setIsSearching(true)

      const movies = await getMoviesByPerson(personId)
      setMovieResults(movies)
      setMovieSearchPerformed(true)

      // Switch to movie tab if we're on a different tab
      if (activeTab !== "movie") {
        setActiveTab("movie")
      }
    } catch (error) {
      console.error("Error loading movies for person:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="movie">Movie Title</TabsTrigger>
        <TabsTrigger value="person">Actor/Director</TabsTrigger>
        <TabsTrigger value="genre">Genre/Year</TabsTrigger>
      </TabsList>
      <TabsContent value="movie" className="space-y-6">
        <MovieSearch
          query={movieQuery}
          setQuery={setMovieQuery}
          results={movieResults}
          isSearching={isSearching}
          personName={selectedPersonName}
          searchPerformed={movieSearchPerformed}
          onSearch={searchMoviesByTitle}
          onClearPerson={clearSelectedPerson}
        />
      </TabsContent>
      <TabsContent value="person" className="space-y-6">
        <PersonSearch
          query={personQuery}
          setQuery={setPersonQuery}
          results={personResults}
          isSearching={isSearching}
          searchPerformed={personSearchPerformed}
          onSearch={searchPeopleByName}
          onSelectPerson={selectPerson}
        />
      </TabsContent>
      <TabsContent value="genre" className="space-y-4">
        <GenreSearch
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          yearRange={yearRange}
          setYearRange={setYearRange}
          results={genreResults}
          isSearching={isSearching}
          searchPerformed={genreSearchPerformed}
          onSearch={searchMoviesByGenre}
        />

        {genreSearchPerformed && genreResults.length > 0 && (
          <LoadMoreButton
            onClick={loadMoreGenreResults}
            isLoading={isLoadingMore}
            hasMoreResults={currentGenrePage <= totalGenrePages}
            totalResults={totalGenreResults}
            loadedResults={genreResults.length}
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
