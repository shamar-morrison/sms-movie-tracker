const TMDB_API_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  adult: boolean
  runtime: number
  genres: {
    id: number
    name: string
  }[]
  production_companies: {
    id: number
    name: string
    logo_path: string | null
    origin_country: string
  }[]
  budget: number
  revenue: number
  homepage: string | null
  credits?: {
    cast: {
      id: number
      name: string
      character: string
      profile_path: string | null
      known_for_department: string
      order: number
    }[]
    crew: {
      id: number
      name: string
      job: string
      department: string
      profile_path: string | null
    }[]
  }
  videos?: {
    results: {
      id: string
      key: string
      name: string
      site: string
      size: number
      type: string
    }[]
  }
  // Additional field for user's personal rating
  user_rating?: number | null
}

export interface TMDBPerson {
  id: number
  name: string
  profile_path: string | null
  known_for_department: string
  known_for: TMDBMovie[]
}

async function fetchFromTMDB(
  endpoint: string,
  params: Record<string, string> = {},
) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key is not set")
  }

  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`)
  url.searchParams.append("api_key", TMDB_API_KEY)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value)
  }

  console.log(`Fetching from TMDB: ${url.toString()}`) // Log the URL (remove in prod)

  const response = await fetch(url.toString())
  if (!response.ok) {
    const errorBody = await response.text()
    console.error(`TMDB API error: ${response.status} ${response.statusText}`)
    console.error(`Error body: ${errorBody}`)
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

// Get a movie by ID
export async function getMovieById(id: string): Promise<TMDBMovie | null> {
  try {
    return await fetchFromTMDB(`/movie/${id}`, {
      append_to_response: "credits,videos",
    })
  } catch (error) {
    console.error("Error fetching movie:", error)
    return null
  }
}

// Get movies for discovery
export async function getDiscoverMovies(): Promise<TMDBMovie[]> {
  try {
    const data = await fetchFromTMDB("/discover/movie", {
      sort_by: "popularity.desc",
    })

    // Fetch detailed information for each movie to include genres
    const moviesWithDetails = await Promise.all(
      data.results.map(async (movie: any) => {
        try {
          const details = await fetchFromTMDB(`/movie/${movie.id}`, {
            append_to_response: "credits,videos",
          })
          return {
            ...movie,
            genres: details.genres || [],
          }
        } catch (error) {
          console.error(`Error fetching details for movie ${movie.id}:`, error)
          return {
            ...movie,
            genres: [],
          }
        }
      }),
    )

    return moviesWithDetails
  } catch (error) {
    console.error("Error discovering movies:", error)
    return []
  }
}

// Search movies by title
export async function searchMoviesByTitle(query: string): Promise<TMDBMovie[]> {
  try {
    const data = await fetchFromTMDB("/search/movie", {
      query: encodeURIComponent(query),
    })
    return data.results
  } catch (error) {
    console.error("Error searching movies:", error)
    return []
  }
}

// Search people (actors, directors)
export async function searchPeople(query: string): Promise<TMDBPerson[]> {
  try {
    const data = await fetchFromTMDB("/search/person", {
      query: encodeURIComponent(query),
    })
    return data.results
  } catch (error) {
    console.error("Error searching people:", error)
    return []
  }
}

// Get movies by genre and year range with additional filter parameters
export async function discoverMovies(
  params: {
    genreId?: string
    yearFrom?: number
    yearTo?: number
    sortBy?: string
    voteCountGte?: string
  } = {},
): Promise<{
  results: TMDBMovie[]
  totalResults: number
  totalPages: number
}> {
  try {
    const {
      genreId,
      yearFrom = 1900,
      yearTo = new Date().getFullYear(),
      sortBy = "popularity.desc",
      voteCountGte = "0",
    } = params

    // Prepare API parameters
    const apiParams: Record<string, string> = {
      sort_by: sortBy,
      "vote_count.gte": voteCountGte,
      "primary_release_date.gte": `${yearFrom}-01-01`,
      "primary_release_date.lte": `${yearTo}-12-31`,
      include_adult: "false",
    }

    // Only add genre filter if specified
    if (genreId) {
      apiParams.with_genres = genreId
    }

    // First page
    const firstPageData = await fetchFromTMDB("/discover/movie", {
      ...apiParams,
      page: "1",
    })

    // For better results, we'll fetch the second page too
    const secondPageData = await fetchFromTMDB("/discover/movie", {
      ...apiParams,
      page: "2",
    })

    // Combine results from both pages
    const combinedResults = [
      ...firstPageData.results,
      ...secondPageData.results,
    ]

    // Log the number of results and year range for debugging
    console.log(`Found ${combinedResults.length} movies with applied filters`)
    console.log(
      `Total results available: ${firstPageData.total_results}, Total pages: ${firstPageData.total_pages}`,
    )

    return {
      results: combinedResults,
      totalResults: firstPageData.total_results,
      totalPages: firstPageData.total_pages,
    }
  } catch (error) {
    console.error("Error discovering movies:", error)
    return {
      results: [],
      totalResults: 0,
      totalPages: 0,
    }
  }
}

// Get movies by person (actor or director)
export async function getMoviesByPerson(
  personId: string,
): Promise<TMDBMovie[]> {
  try {
    const data = await fetchFromTMDB(`/person/${personId}/movie_credits`)
    return [...data.cast, ...data.crew]
  } catch (error) {
    console.error("Error fetching movies by person:", error)
    return []
  }
}

/**
 * Discovers more movies by filters for a specific page
 */
export async function loadMoreMoviesByGenre(params: {
  genreId?: string
  yearFrom?: number
  yearTo?: number
  sortBy?: string
  voteCountGte?: string
  page: number
}): Promise<TMDBMovie[]> {
  try {
    const {
      genreId,
      yearFrom = 1900,
      yearTo = new Date().getFullYear(),
      sortBy = "popularity.desc",
      voteCountGte = "0",
      page,
    } = params

    // Prepare API parameters
    const apiParams: Record<string, string> = {
      sort_by: sortBy,
      "vote_count.gte": voteCountGte,
      "primary_release_date.gte": `${yearFrom}-01-01`,
      "primary_release_date.lte": `${yearTo}-12-31`,
      page: page.toString(),
      include_adult: "false",
    }

    // Only add genre filter if specified
    if (genreId) {
      apiParams.with_genres = genreId
    }

    const response = await fetchFromTMDB("/discover/movie", apiParams)

    if (!response.results) {
      console.error("No results found in API response:", response)
      return []
    }

    console.log(
      `Found ${response.results.length} additional movies on page ${page}`,
    )
    console.log(
      `Total results available: ${response.total_results}, Total pages: ${response.total_pages}`,
    )

    return response.results
  } catch (error) {
    console.error("Error discovering more movies:", error)
    return []
  }
}

/**
 * Get details for a specific person by ID
 */
export async function getPersonById(
  personId: string,
): Promise<TMDBPerson | null> {
  try {
    return await fetchFromTMDB(`/person/${personId}`)
  } catch (error) {
    console.error("Error fetching person details:", error)
    return null
  }
}

// Get movie videos (trailers, teasers, etc.)
export async function getMovieVideos(id: string): Promise<
  {
    id: string
    key: string
    name: string
    site: string
    size: number
    type: string
  }[]
> {
  try {
    const data = await fetchFromTMDB(`/movie/${id}/videos`)
    return data.results
  } catch (error) {
    console.error("Error fetching movie videos:", error)
    return []
  }
}
