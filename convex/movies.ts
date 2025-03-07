import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get all movies in a user's collection
export const getUserMovies = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return []
    }

    const userId = identity.subject

    return await ctx.db
      .query("movieCollection")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
  },
})

// Get a specific movie from the user's collection
export const getUserMovie = query({
  args: { movieId: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return null
    }

    const userId = identity.subject

    const movies = await ctx.db
      .query("movieCollection")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("movieId"), args.movieId))
      .collect()

    return movies.length > 0 ? movies[0] : null
  },
})

// Check if a movie is in the user's collection
export const isMovieInCollection = query({
  args: { movieId: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return false
    }

    const userId = identity.subject

    const movies = await ctx.db
      .query("movieCollection")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("movieId"), args.movieId))
      .collect()

    return movies.length > 0
  },
})

// Add a movie to the user's collection
export const addMovieToCollection = mutation({
  args: {
    movie: v.object({
      id: v.number(),
      title: v.string(),
      poster_path: v.optional(v.string()),
      release_date: v.optional(v.string()),
      vote_average: v.optional(v.number()),
      genres: v.optional(
        v.array(
          v.object({
            id: v.number(),
            name: v.string(),
          }),
        ),
      ),
      overview: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Not authenticated")
    }

    const userId = identity.subject

    // Check if movie already exists in collection
    const existingMovies = await ctx.db
      .query("movieCollection")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("movieId"), args.movie.id))
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
  },
})

// Remove a movie from the user's collection
export const removeMovieFromCollection = mutation({
  args: { movieId: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Not authenticated")
    }

    const userId = identity.subject

    const movies = await ctx.db
      .query("movieCollection")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("movieId"), args.movieId))
      .collect()

    if (movies.length === 0) {
      throw new Error("Movie not in collection")
    }

    await ctx.db.delete(movies[0]._id)

    return { success: true }
  },
})

// Rate a movie in the user's collection
export const rateMovie = mutation({
  args: {
    movieId: v.number(),
    rating: v.number(),
    movieDetails: v.optional(
      v.object({
        title: v.string(),
        poster_path: v.optional(v.string()),
        release_date: v.optional(v.string()),
        vote_average: v.optional(v.number()),
        genres: v.optional(
          v.array(
            v.object({
              id: v.number(),
              name: v.string(),
            }),
          ),
        ),
        overview: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error("Not authenticated")
    }

    const userId = identity.subject

    // Check if movie already exists in collection
    const existingMovies = await ctx.db
      .query("movieCollection")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("movieId"), args.movieId))
      .collect()

    if (existingMovies.length > 0) {
      // Movie already in collection, update the rating
      // If rating is 0, remove the rating (set to undefined)
      return await ctx.db.patch(existingMovies[0]._id, {
        userRating: args.rating > 0 ? args.rating : undefined,
      })
    } else if (args.movieDetails && args.rating > 0) {
      // Only add to collection if rating is greater than 0
      // Movie is not in collection yet, add it with the rating
      return await ctx.db.insert("movieCollection", {
        userId,
        movieId: args.movieId,
        title: args.movieDetails.title,
        posterPath: args.movieDetails.poster_path,
        releaseDate: args.movieDetails.release_date,
        voteAverage: args.movieDetails.vote_average,
        genres: args.movieDetails.genres,
        overview: args.movieDetails.overview,
        userRating: args.rating,
        addedAt: Date.now(),
      })
    } else {
      throw new Error("Movie not in collection and no details provided")
    }
  },
})
