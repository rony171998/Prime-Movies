import { NextResponse } from "next/server"

export async function GET() {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyOTIyMDY2YWJmZDRiOTk0NmM3ZmYxOTIyYWE4YWE4MyIsIm5iZiI6MTc0NTE1ODczMC42NzgwMDAyLCJzdWIiOiI2ODA1MDI0YTZlMWE3NjllODFlZTIwYzYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.utmv6MKXXxqkL4ih-FKV61LcXsezdSRb_fhhmXmZqO4",
      },
    }

    const response = await fetch("https://api.themoviedb.org/3/movie/popular?language=en-US&page=1", options)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return NextResponse.json({ error: "Failed to fetch popular movies" }, { status: 500 })
  }
}
