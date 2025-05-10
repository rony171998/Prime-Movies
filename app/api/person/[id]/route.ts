import { fetchPersonDetails, fetchPersonMovieCredits } from "@/lib/tmdb"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const personId = Number.parseInt(params.id)
    if (isNaN(personId)) {
      return NextResponse.json({ error: "Invalid person ID" }, { status: 400 })
    }

    // Get the language from the request or default to en-US
    const searchParams = request.nextUrl.searchParams
    const language = searchParams.get("language") || "en-US"

    // Fetch person details and movie credits in parallel
    const [personDetails, movieCredits] = await Promise.all([
      fetchPersonDetails(personId, language),
      fetchPersonMovieCredits(personId, language),
    ])

    if (!personDetails) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    // Combine the data
    const response = {
      ...personDetails,
      movie_credits: movieCredits,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching person data:", error)
    return NextResponse.json({ error: "Failed to fetch person data" }, { status: 500 })
  }
}
