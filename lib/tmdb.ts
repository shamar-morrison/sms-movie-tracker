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

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
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
    const data = await fetchFromTMDB(`/movie/${id}`, { append_to_response: "credits" })
    return data
  } catch (error) {
    console.error("Error fetching movie:", error)
    return null
  }
}

// Get the user's movie collection
export async function getMovieCollection(): Promise<TMDBMovie[]> {
  // we should fetch the user's collection IDs from your database
  // and then fetch the details for each movie from TMDB
  // For now, we'll just return some popular movies as a placeholder
  try {
    const data = await fetchFromTMDB("/movie/popular")
    return data.results
  } catch (error) {
    console.error("Error fetching movie collection:", error)
    return []
  }
}

// Get movies for discovery
export async function getDiscoverMovies(): Promise<TMDBMovie[]> {
  try {
    const data = await fetchFromTMDB("/discover/movie", { sort_by: "popularity.desc" })
    return data.results
  } catch (error) {
    console.error("Error discovering movies:", error)
    return []
  }
}

// Get a user's rating for a specific movie
export async function getUserRating(movieId: string): Promise<number | null> {
  // For now, we'll just return null
  return null
}

// Search movies by title
export async function searchMoviesByTitle(query: string): Promise<TMDBMovie[]> {
  try {
    const data = await fetchFromTMDB("/search/movie", { query: encodeURIComponent(query) })
    return data.results
  } catch (error) {
    console.error("Error searching movies:", error)
    return []
  }
}

// Search people (actors, directors)
export async function searchPeople(query: string): Promise<TMDBPerson[]> {
  try {
    const data = await fetchFromTMDB("/search/person", { query: encodeURIComponent(query) })
    return data.results
  } catch (error) {
    console.error("Error searching people:", error)
    return []
  }
}

// Get movies by genre and year range
export async function discoverMovies(genreId: string, startYear: number, endYear: number): Promise<TMDBMovie[]> {
  try {
    const data = await fetchFromTMDB("/discover/movie", {
      with_genres: genreId,
      "primary_release_date.gte": `${startYear}-01-01`,
      "primary_release_date.lte": `${endYear}-12-31`,
      sort_by: "popularity.desc",
    })
    return data.results
  } catch (error) {
    console.error("Error discovering movies:", error)
    return []
  }
}

// Get movies by person (actor or director)
export async function getMoviesByPerson(personId: string): Promise<TMDBMovie[]> {
  try {
    const data = await fetchFromTMDB(`/person/${personId}/movie_credits`)
    return [...data.cast, ...data.crew]
  } catch (error) {
    console.error("Error fetching movies by person:", error)
    return []
  }
}

// Get person details by ID
export async function getPersonById(personId: string): Promise<TMDBPerson | null> {
  try {
    const data = await fetchFromTMDB(`/person/${personId}`)
    return data
  } catch (error) {
    console.error("Error fetching person details:", error)
    return null
  }
}

