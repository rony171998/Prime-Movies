// Server-side TMDB API utilities
const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3"

// Types
type GuestSessionResponse = {
  success: boolean
  guest_session_id: string
  expires_at: string
}

type Movie = {
  id: number
  title: string
  poster_path: string
  backdrop_path: string
  overview: string
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
  [key: string]: any
}

type MovieResponse = {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

type MovieDetailsResponse = Movie & {
  genres: { id: number; name: string }[]
  runtime: number
  tagline: string
  status: string
  budget: number
  revenue: number
  production_companies: { id: number; name: string; logo_path: string | null }[]
}

// Create a guest session for rating movies
export async function createGuestSession(): Promise<GuestSessionResponse> {
  try {
    const response = await fetch(`${TMDB_API_BASE_URL}/authentication/guest_session/new?api_key=${TMDB_API_KEY}`)
    return await response.json()
  } catch (error) {
    console.error("Error creating guest session:", error)
    return {
      success: false,
      guest_session_id: "",
      expires_at: "",
    }
  }
}

// Rate a movie
export async function rateMovie(movieId: number, rating: number, guestSessionId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${TMDB_API_BASE_URL}/movie/${movieId}/rating?api_key=${TMDB_API_KEY}&guest_session_id=${guestSessionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: rating }),
      },
    )
    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Error rating movie:", error)
    return false
  }
}

// Get rated movies
export async function getRatedMovies(guestSessionId: string): Promise<Movie[]> {
  try {
    const response = await fetch(
      `${TMDB_API_BASE_URL}/guest_session/${guestSessionId}/rated/movies?api_key=${TMDB_API_KEY}&sort_by=created_at.desc`,
    )
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching rated movies:", error)
    return []
  }
}

// Get trending movies
export async function getTrendingMovies(page = 1): Promise<MovieResponse> {
  try {
    const response = await fetch(
      `${TMDB_API_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )
    return await response.json()
  } catch (error) {
    console.error("Error fetching trending movies:", error)
    return { page: 1, results: [], total_pages: 0, total_results: 0 }
  }
}

// Get popular movies
export async function getPopularMovies(page = 1): Promise<MovieResponse> {
  try {
    const response = await fetch(
      `${TMDB_API_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )
    return await response.json()
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return { page: 1, results: [], total_pages: 0, total_results: 0 }
  }
}

// Get top rated movies
export async function getTopRatedMovies(page = 1): Promise<MovieResponse> {
  try {
    const response = await fetch(
      `${TMDB_API_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )
    return await response.json()
  } catch (error) {
    console.error("Error fetching top rated movies:", error)
    return { page: 1, results: [], total_pages: 0, total_results: 0 }
  }
}

// Get movie details
export async function getMovieDetails(movieId: number, language = "en-US") {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=${language}`, {
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
        accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching movie details:", error)
    return null
  }
}

// Search movies
export async function searchMovies(query: string, page = 1): Promise<MovieResponse> {
  try {
    const response = await fetch(
      `${TMDB_API_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )
    return await response.json()
  } catch (error) {
    console.error("Error searching movies:", error)
    return { page: 1, results: [], total_pages: 0, total_results: 0 }
  }
}
