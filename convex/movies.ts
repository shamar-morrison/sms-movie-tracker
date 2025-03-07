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
