import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tmdb/movie/popular`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: `Failed to fetch from TMDB: ${response.status} ${response.statusText}`,
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      status: "success",
      message: "TMDB API proxy is working correctly!",
      data: {
        // Only return the first result for this test
        firstResult: data.results?.[0] || null,
        totalResults: data.results?.length || 0,
      },
    })
  } catch (error) {
    console.error("Error testing TMDB API proxy:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to test TMDB API proxy",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
