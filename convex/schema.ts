import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  movieCollection: defineTable({
    userId: v.string(),
    movieId: v.number(),
    title: v.string(),
    posterPath: v.optional(v.string()),
    releaseDate: v.optional(v.string()),
    voteAverage: v.optional(v.number()),
    genreIds: v.optional(v.array(v.number())),
    genres: v.optional(
      v.array(
        v.object({
          id: v.number(),
          name: v.string(),
        }),
      ),
    ),
    overview: v.optional(v.string()),
    userRating: v.optional(v.number()),
    addedAt: v.number(),
  }).index("by_user", ["userId"]),
})
