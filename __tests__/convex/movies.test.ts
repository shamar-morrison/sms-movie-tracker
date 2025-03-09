import { beforeEach, describe, expect, test } from "@jest/globals"

const vi = { fn: jest.fn, clearAllMocks: jest.clearAllMocks }

// Mock Convex context
const mockCtx = {
  auth: {
    getUserIdentity: vi.fn(),
  },
  db: {
    query: vi.fn().mockReturnThis(),
    withIndex: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    collect: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}

// Mock the Convex function handlers directly
const getUserMoviesHandler = async (ctx: any, args: any) => {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    return []
  }

  const userId = identity.subject

  return await ctx.db
    .query("movieCollection")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect()
}

const getUserMovieHandler = async (ctx: any, args: any) => {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    return null
  }

  const userId = identity.subject

  const movies = await ctx.db
    .query("movieCollection")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("movieId"), args.movieId))
    .collect()

  return movies.length > 0 ? movies[0] : null
}

const addMovieToCollectionHandler = async (ctx: any, args: any) => {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new Error("Not authenticated")
  }

  const userId = identity.subject

  // Check if movie already exists in collection
  const existingMovies = await ctx.db
    .query("movieCollection")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("movieId"), args.movie.id))
    .collect()

  if (existingMovies.length > 0) {
    // Movie already in collection
    return existingMovies[0]._id
  }

  // Add the movie to the collection
  return await ctx.db.insert("movieCollection", {
    userId,
    movieId: args.movie.id,
    title: args.movie.title,
    posterPath: args.movie.poster_path,
    releaseDate: args.movie.release_date,
    voteAverage: args.movie.vote_average,
    genres: args.movie.genres,
    overview: args.movie.overview,
    addedAt: Date.now(),
  })
}

describe("Convex Database Queries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getUserMovies", () => {
    test("returns an empty array when user is not authenticated", async () => {
      mockCtx.auth.getUserIdentity.mockResolvedValue(null)

      const result = await getUserMoviesHandler(mockCtx, {})

      expect(result).toEqual([])
      expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled()
      expect(mockCtx.db.query).not.toHaveBeenCalled()
    })

    test("fetches movies for authenticated user", async () => {
      const mockMovies = [
        { _id: "123", title: "Test Movie 1", userId: "test-user-id" },
        { _id: "456", title: "Test Movie 2", userId: "test-user-id" },
      ]

      mockCtx.auth.getUserIdentity.mockResolvedValue({
        subject: "test-user-id",
      })
      mockCtx.db.collect.mockResolvedValue(mockMovies)

      const result = await getUserMoviesHandler(mockCtx, {})

      expect(result).toEqual(mockMovies)
      expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled()
      expect(mockCtx.db.query).toHaveBeenCalledWith("movieCollection")
      expect(mockCtx.db.withIndex).toHaveBeenCalledWith(
        "by_user",
        expect.any(Function),
      )
    })
  })

  describe("getUserMovie", () => {
    test("returns null when user is not authenticated", async () => {
      mockCtx.auth.getUserIdentity.mockResolvedValue(null)

      const result = await getUserMovieHandler(mockCtx, { movieId: 123 })

      expect(result).toBeNull()
      expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled()
      expect(mockCtx.db.query).not.toHaveBeenCalled()
    })

    test("returns null when movie is not found", async () => {
      mockCtx.auth.getUserIdentity.mockResolvedValue({
        subject: "test-user-id",
      })
      mockCtx.db.collect.mockResolvedValue([])

      const result = await getUserMovieHandler(mockCtx, { movieId: 123 })

      expect(result).toBeNull()
      expect(mockCtx.auth.getUserIdentity).toHaveBeenCalled()
    })

    test("returns the movie when found", async () => {
      const mockMovie = {
        _id: "123",
        title: "Test Movie",
        movieId: 123,
        userId: "test-user-id",
      }

      mockCtx.auth.getUserIdentity.mockResolvedValue({
        subject: "test-user-id",
      })
      mockCtx.db.collect.mockResolvedValue([mockMovie])

      const result = await getUserMovieHandler(mockCtx, { movieId: 123 })

      expect(result).toEqual(mockMovie)
    })
  })

  describe("addMovieToCollection", () => {
    test("throws error when user is not authenticated", async () => {
      mockCtx.auth.getUserIdentity.mockResolvedValue(null)

      await expect(
        addMovieToCollectionHandler(mockCtx, {
          movie: {
            id: 123,
            title: "Test Movie",
            poster_path: "/path.jpg",
            release_date: "2021-01-01",
            vote_average: 7.5,
            overview: "Test overview",
          },
        }),
      ).rejects.toThrow("Not authenticated")
    })

    test("adds movie to collection when it does not exist", async () => {
      const mockMovie = {
        id: 123,
        title: "Test Movie",
        poster_path: "/path.jpg",
        release_date: "2021-01-01",
        vote_average: 7.5,
        overview: "Test overview",
      }

      mockCtx.auth.getUserIdentity.mockResolvedValue({
        subject: "test-user-id",
      })
      mockCtx.db.collect.mockResolvedValue([])
      mockCtx.db.insert.mockResolvedValue("new-movie-id")

      await addMovieToCollectionHandler(mockCtx, { movie: mockMovie })

      expect(mockCtx.db.insert).toHaveBeenCalledWith(
        "movieCollection",
        expect.objectContaining({
          userId: "test-user-id",
          movieId: mockMovie.id,
          title: mockMovie.title,
          posterPath: mockMovie.poster_path,
          releaseDate: mockMovie.release_date,
          voteAverage: mockMovie.vote_average,
          overview: mockMovie.overview,
        }),
      )
    })
  })
})
