import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import { NextRequest, NextResponse } from "next/server"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

export async function POST(request: NextRequest) {
  try {
    // This call forces a fresh query to Convex, bypassing any caching
    await convex.query(api.movies.getUserMovies)

    return NextResponse.json({ success: true, refreshed: true })
  } catch (error) {
    console.error("Error refreshing movies data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to refresh movies data" },
      { status: 500 },
    )
  }
}
