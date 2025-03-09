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
import React, { useEffect, useState } from "react"

export default function SearchTabs() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") || "movie"
  const [activeTab, setActiveTab] = useState(tabParam)
  const router = useRouter()
  const initialSearchPerformedRef = React.useRef(false)

  // Get personId and personName from URL if available
  const personIdParam = searchParams.get("personId")
  const personNameParam = searchParams.get("personName")

  // Update activeTab when URL parameters change (browser navigation)
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Load search query from URL if present - but only on initial load
  useEffect(() => {
    const queryParam = searchParams.get("query")
    if (
      queryParam &&
      tabParam === "movie" &&
      !initialSearchPerformedRef.current
    ) {
      initialSearchPerformedRef.current = true
      setMovieQuery(queryParam)

      // Perform the search from URL params
      setIsSearching(true)
      setMovieSearchPerformed(true)

      tmdbSearchMovies(queryParam)
        .then((results) => {
          setMovieResults(results)
        })
        .catch((error) => {
          console.error("Error searching movies:", error)
          setMovieResults([])
        })
        .finally(() => {
          setIsSearching(false)
        })
    }
  }, [])

  useEffect(() => {
    const queryParam = searchParams.get("query")
    if (queryParam && tabParam === "movie") {
      setMovieQuery(queryParam)

      if (initialSearchPerformedRef.current) {
        setIsSearching(true)
        setMovieSearchPerformed(true)

        tmdbSearchMovies(queryParam)
          .then((results) => {
            setMovieResults(results)
          })
          .catch((error) => {
            console.error("Error searching movies:", error)
            setMovieResults([])
          })
          .finally(() => {
            setIsSearching(false)
          })
      }
    }
  }, [searchParams, tabParam])

  // Load person movies if personId is in URL
  useEffect(() => {
    if (personIdParam && personNameParam) {
      setSelectedPersonId(personIdParam)
      setSelectedPersonName(personNameParam)
      loadMoviesByPerson(personIdParam)
      setActiveTab("movie")
    }
  }, [personIdParam, personNameParam])

  // Load genre search results if genreId is in URL
  useEffect(() => {
    // Skip if we've already performed the initial search
    if (initialSearchPerformedRef.current) {
      return
    }

    const genreIdParam = searchParams.get("genreId")
    const yearFromParam = searchParams.get("yearFrom")
    const yearToParam = searchParams.get("yearTo")

    if (genreIdParam && yearFromParam && yearToParam && tabParam === "genre") {
      initialSearchPerformedRef.current = true

      const yearFromInt = parseInt(yearFromParam)
      const yearToInt = parseInt(yearToParam)

      // Set all state at once to minimize re-renders
      setSelectedGenre(genreIdParam)
      setYearRange([yearFromInt, yearToInt])
      setIsSearching(true)
      setGenreSearchPerformed(true)

      discoverMovies({
        genreId: genreIdParam,
        yearFrom: yearFromInt,
        yearTo: yearToInt,
      })
        .then(({ results, totalResults, totalPages }) => {
          setGenreResults(results)
          setTotalGenreResults(totalResults)
          setTotalGenrePages(totalPages)
          setCurrentGenrePage(3)
        })
        .catch((error) => {
          console.error("Error discovering movies:", error)
          setGenreResults([])
          setTotalGenreResults(0)
          setTotalGenrePages(0)
        })
        .finally(() => {
          setIsSearching(false)
        })
    }
  }, [searchParams, tabParam])

  // Reset search performed ref when tab changes
  useEffect(() => {
    initialSearchPerformedRef.current = false

    return () => {
      initialSearchPerformedRef.current = false
    }
  }, [activeTab])

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

    // Check if we're already searching with the same parameters from the URL
    const genreIdParam = searchParams.get("genreId")
    const yearFromParam = searchParams.get("yearFrom")
    const yearToParam = searchParams.get("yearTo")

    const sameParameters =
      genreIdParam === genreId &&
      yearFromParam === yearRange[0].toString() &&
      yearToParam === yearRange[1].toString()

    // If the search is already performed with the same parameters, don't repeat
    if (initialSearchPerformedRef.current && sameParameters) {
      return
    }

    initialSearchPerformedRef.current = true

    setIsSearching(true)
    setGenreSearchPerformed(true)

    try {
      console.log(
        `Searching for movies in genre ${genreId} with year range: ${yearRange[0]}-${yearRange[1]}`,
      )
      router.push(
        `/search?tab=genre&genreId=${genreId}&yearFrom=${yearRange[0]}&yearTo=${yearRange[1]}`,
        { scroll: false },
      )

      // @ts-ignore - Using updated API with object parameters
      const { results, totalResults, totalPages } = await discoverMovies({
        genreId,
        yearFrom: yearRange[0],
        yearTo: yearRange[1],
      })
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
    const genreIdParam = searchParams.get("genreId") || selectedGenre

    if (!genreIdParam || currentGenrePage > totalGenrePages) return

    setIsLoadingMore(true)

    try {
      // @ts-ignore - Using updated API with object parameters
      const additionalMovies = await loadMoreMoviesByGenre({
        genreId: genreIdParam,
        yearFrom: parseInt(
          searchParams.get("yearFrom") || yearRange[0].toString(),
        ),
        yearTo: parseInt(searchParams.get("yearTo") || yearRange[1].toString()),
        page: currentGenrePage,
      })

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
      // Update URL with search query
      router.push(`/search?tab=movie&query=${encodeURIComponent(query)}`, {
        scroll: false,
      })

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

    // Check if there was a previous search query
    const queryParam = searchParams.get("query")
    if (queryParam) {
      // If there was a previous search query, keep it in the URL
      router.push(
        `/search?tab=${activeTab}&query=${encodeURIComponent(queryParam)}`,
        { scroll: false },
      )
    } else {
      // Otherwise just remove the personId and personName
      router.push(`/search?tab=${activeTab}`, { scroll: false })
    }
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
    setIsSearching(true)
    try {
      const person = await getPersonById(personId)
      if (person) {
        const personName = person.name
        setSelectedPersonId(personId)
        setSelectedPersonName(personName)

        // Update URL with personId and personName
        router.push(
          `/search?tab=movie&personId=${personId}&personName=${encodeURIComponent(personName)}`,
          { scroll: false },
        )

        await loadMoviesByPerson(personId)
      }
    } catch (error) {
      console.error("Error selecting person:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const loadMoviesByPerson = async (personId: string) => {
    if (!personId) return

    setIsSearching(true)

    try {
      // Get person details including name
      const person = await getPersonById(personId)

      if (person) {
        setSelectedPersonName(person.name)
        setSelectedPersonId(personId)

        const movies = await getMoviesByPerson(personId)
        setMovieResults(movies)
        setMovieSearchPerformed(true)
      }
    } catch (error) {
      console.error("Error loading person movies:", error)
      setMovieResults([])
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

        {genreSearchPerformed && genreResults.length > 0 && !isSearching && (
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
