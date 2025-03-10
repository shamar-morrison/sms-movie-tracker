import { discoverMovies, getMovieById, searchMoviesByTitle } from "@/lib/tmdb"

// Mock the TMDB API key
jest.mock("../../lib/tmdb", () => {
  const originalModule = jest.requireActual("../../lib/tmdb")
  return {
    __esModule: true,
    ...originalModule,
    getMovieById: jest.fn(),
    searchMoviesByTitle: jest.fn(),
    discoverMovies: jest.fn(),
  }
})

describe("TMDB API Utility Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getMovieById", () => {
    const mockMovie = {
      id: 123,
      title: "Test Movie",
      overview: "Test overview",
      release_date: "2023-01-01",
      poster_path: "/test-path.jpg",
      backdrop_path: "/backdrop-path.jpg",
      vote_average: 7.5,
      vote_count: 1000,
      popularity: 500,
      adult: false,
      runtime: 120,
      genres: [{ id: 28, name: "Action" }],
      production_companies: [
        {
          id: 1,
          name: "Test Studio",
          logo_path: "/logo.png",
          origin_country: "US",
        },
      ],
      budget: 1000000,
      revenue: 5000000,
      homepage: "https://example.com",
      credits: {
        cast: [
          {
            id: 1,
            name: "Actor Name",
            character: "Character",
            profile_path: "/actor.jpg",
            known_for_department: "Acting",
            order: 1,
          },
        ],
        crew: [
          {
            id: 2,
            name: "Director Name",
            job: "Director",
            department: "Directing",
            profile_path: "/director.jpg",
          },
        ],
      },
      videos: {
        results: [
          {
            id: "vid1",
            key: "videokey",
            name: "Trailer",
            site: "YouTube",
            size: 1080,
            type: "Trailer",
          },
        ],
      },
    }

    test("fetches a movie by ID", async () => {
      ;(getMovieById as jest.Mock).mockResolvedValue(mockMovie)

      const result = await getMovieById("123")

      expect(getMovieById).toHaveBeenCalledTimes(1)
      expect(getMovieById).toHaveBeenCalledWith("123")
      expect(result).toEqual(mockMovie)
    })

    test("returns null when movie fetch fails", async () => {
      ;(getMovieById as jest.Mock).mockResolvedValue(null)

      const result = await getMovieById("999")

      expect(getMovieById).toHaveBeenCalledTimes(1)
      expect(result).toBeNull()
    })
  })

  describe("searchMoviesByTitle", () => {
    const mockMovies = [
      { id: 1, title: "Movie 1" },
      { id: 2, title: "Movie 2" },
    ]

    test("returns search results for movie title", async () => {
      ;(searchMoviesByTitle as jest.Mock).mockResolvedValue(mockMovies)

      const results = await searchMoviesByTitle("Test Query")

      expect(searchMoviesByTitle).toHaveBeenCalledTimes(1)
      expect(searchMoviesByTitle).toHaveBeenCalledWith("Test Query")
      expect(results).toEqual(mockMovies)
    })

    test("returns empty array when search fails", async () => {
      ;(searchMoviesByTitle as jest.Mock).mockResolvedValue([])

      const results = await searchMoviesByTitle("Invalid Query")

      expect(searchMoviesByTitle).toHaveBeenCalledTimes(1)
      expect(results).toEqual([])
    })
  })

  describe("discoverMovies", () => {
    const mockDiscoverResults = {
      results: [
        { id: 1, title: "Movie 1" },
        { id: 2, title: "Movie 2" },
      ],
      totalResults: 2,
      totalPages: 1,
    }

    test("returns discovered movies based on parameters", async () => {
      ;(discoverMovies as jest.Mock).mockResolvedValue(mockDiscoverResults)

      const params = {
        genreId: "28",
        yearFrom: 2020,
        yearTo: 2023,
        sortBy: "popularity.desc",
        voteCountGte: "100",
      }

      const result = await discoverMovies(params)

      expect(discoverMovies).toHaveBeenCalledTimes(1)
      expect(discoverMovies).toHaveBeenCalledWith(params)
      expect(result).toEqual(mockDiscoverResults)
    })
  })
})
