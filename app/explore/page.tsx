import { getGuestSessionId } from "@/app/actions"
import { ExplorePageClient } from "@/components/explore-page-client"
import { fetchGenres } from "@/lib/tmdb-api"
import { fetchTrendingMovies } from "@/app/explore-actions"

export default async function ExplorePage() {
  const guestSessionId = await getGuestSessionId()

  // Fetch genres and trending movies for the initial state
  const [genres, trendingData] = await Promise.all([fetchGenres(), fetchTrendingMovies("day", 1)])

  return (
    <ExplorePageClient
      initialGenres={genres}
      initialTrendingMovies={trendingData.results}
      initialTrendingTotalPages={trendingData.totalPages}
      guestSessionId={guestSessionId}
    />
  )
}
