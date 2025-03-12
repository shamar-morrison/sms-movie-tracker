import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key is not configured" },
      { status: 500 },
    )
  }

  // Get the path segments and reconstruct the TMDB endpoint path
  const path = params.path.join("/")

  const searchParams = new URL(request.url).searchParams
  const queryString = Array.from(searchParams.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  const url = `https://api.themoviedb.org/3/${path}?api_key=${apiKey}${
    queryString ? `&${queryString}` : ""
  }`

  try {
    const response = await fetch(url)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying request to TMDB:", error)
    return NextResponse.json(
      { error: "Failed to fetch data from TMDB" },
      { status: 500 },
    )
  }
}
