import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyOTIyMDY2YWJmZDRiOTk0NmM3ZmYxOTIyYWE4YWE4MyIsIm5iZiI6MTc0NTE1ODczMC42NzgwMDAyLCJzdWIiOiI2ODA1MDI0YTZlMWE3NjllODFlZTIwYzYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.utmv6MKXXxqkL4ih-FKV61LcXsezdSRb_fhhmXmZqO4",
      },
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?language=en-US&append_to_response=credits,videos`,
      options,
    )

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching movie details:", error)
    return NextResponse.json({ error: "Failed to fetch movie details" }, { status: 500 })
  }
}
