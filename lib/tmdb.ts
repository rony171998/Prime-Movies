// TMDB API types
export interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export interface MovieResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

// Guest Session Response
export interface GuestSessionResponse {
  success: boolean
  guest_session_id: string
  expires_at: string
}

// Favorite Response
export interface FavoriteResponse {
  success: boolean
  status_code: number
  status_message: string
}

// Actor/Person interfaces
export interface Person {
  id: number
  name: string
  profile_path: string | null
  character?: string
  known_for_department?: string
  biography?: string
  birthday?: string
  place_of_birth?: string
  popularity?: number
  gender?: number
  deathday?: string | null
  homepage?: string | null
  also_known_as?: string[]
}

export interface CastMember extends Person {
  character: string
  order: number
}

export interface MovieCredits {
  id: number
  cast: Array<{
    id: number
    title: string
    poster_path: string | null
    character: string
    release_date: string
  }>
  crew: Array<{
    id: number
    title: string
    poster_path: string | null
    job: string
    department: string
    release_date: string
  }>
}

// TMDB image URL builder - safe for client-side
export const getImageUrl = (path: string | null, size = "original"): string => {
  if (!path) return "/placeholder.svg?height=300&width=200"
  return `https://image.tmdb.org/t/p/${size}${path}`
}

// Get year from release date - safe for client-side
export const getYearFromDate = (dateString: string): string => {
  if (!dateString) return ""
  return new Date(dateString).getFullYear().toString()
}

// Map genre IDs to names (simplified version) - safe for client-side
export const genreMap: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
}

export const getGenreName = (id: number): string => {
  return genreMap[id] || "Unknown"
}

// Get TMDB API key from environment variables
const getTMDBApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
  if (!apiKey) {
    console.error("TMDB API key is not defined in environment variables")
    return ""
  }
  return apiKey
}

// TMDB API options with language parameter
export const getTmdbOptions = (language = "en-US") => ({
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${getTMDBApiKey()}`,
  },
  next: { revalidate: 3600 }, // Cache for 1 hour
})

// Fetch top rated movies
export async function fetchTopRatedMovies(language = "en-US"): Promise<Movie[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/top_rated?language=${language}&page=1`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching top rated movies:", error)
    return []
  }
}

// Fetch upcoming movies
export async function fetchUpcomingMovies(language = "en-US"): Promise<Movie[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/upcoming?language=${language}&page=1`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching upcoming movies:", error)
    return []
  }
}

// Create a new guest session
export async function createGuestSession(): Promise<GuestSessionResponse | null> {
  try {
    const response = await fetch("https://api.themoviedb.org/3/authentication/guest_session/new", getTmdbOptions())

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return null
    }

    const data: GuestSessionResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error creating guest session:", error)
    return null
  }
}

// Rate a movie as a guest
export async function rateMovie(
  movieId: number,
  rating: number,
  guestSessionId: string,
  language = "en-US",
): Promise<boolean> {
  try {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Bearer ${getTMDBApiKey()}`,
      },
      body: JSON.stringify({ value: rating }),
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/rating?guest_session_id=${guestSessionId}&language=${language}`,
      options,
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return false
    }

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("Error rating movie:", error)
    return false
  }
}

// Add this interface for rated movies
export interface RatedMovie extends Movie {
  rating: number
}

// Get rated movies for an account
export async function getAccountRatedMovies(
  accountId: string,
  sessionId: string,
  language = "en-US",
): Promise<RatedMovie[]> {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${getTMDBApiKey()}`,
      },
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/account/${accountId}/rated/movies?language=${language}&page=1&sort_by=created_at.desc`,
      options,
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: MovieResponse = await response.json()
    return data.results as RatedMovie[]
  } catch (error) {
    console.error("Error fetching account rated movies:", error)
    return []
  }
}

// Update the existing getRatedMovies function to return RatedMovie type
export async function getRatedMovies(guestSessionId: string, language = "en-US"): Promise<RatedMovie[]> {
  try {
    // Check if we have a valid guest session ID
    if (!guestSessionId) {
      console.error("No guest session ID provided")
      return []
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?language=${language}&sort_by=created_at.desc`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)

      // If we get a 404, it might mean the guest session hasn't rated any movies yet
      if (response.status === 404) {
        return []
      }

      return []
    }

    const data: MovieResponse = await response.json()
    return data.results as RatedMovie[]
  } catch (error) {
    console.error("Error fetching rated movies:", error)
    return []
  }
}

// Fetch popular movies
export async function fetchPopularMovies(language = "en-US"): Promise<Movie[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?language=${language}&page=1`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return []
  }
}

// Add this function to fetch now playing movies
export async function fetchNowPlayingMovies(language = "en-US"): Promise<Movie[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/now_playing?language=${language}&page=1`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching now playing movies:", error)
    return []
  }
}

// Add these new interfaces and functions to your existing tmdb.ts file

// Genre interface
export interface Genre {
  id: number
  name: string
}

export interface GenresResponse {
  genres: Genre[]
}

// Fetch all movie genres
export async function fetchGenres(language = "en-US"): Promise<Genre[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?language=${language}`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: GenresResponse = await response.json()
    return data.genres
  } catch (error) {
    console.error("Error fetching genres:", error)
    return []
  }
}

// Fetch trending movies (day or week)
export async function fetchTrendingMovies(timeWindow: "day" | "week" = "day", language = "en-US"): Promise<Movie[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/movie/${timeWindow}?language=${language}`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching trending movies:", error)
    return []
  }
}

// Fetch movies by genre
export async function fetchMoviesByGenre(genreId: number, page = 1, language = "en-US"): Promise<Movie[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=${language}&page=${page}&sort_by=popularity.desc`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error(`Error fetching movies for genre ${genreId}:`, error)
    return []
  }
}

// Discover movies with filters
export interface DiscoverFilters {
  sortBy?: string // popularity.desc, revenue.desc, vote_average.desc, etc.
  year?: number
  withGenres?: number[]
  voteAverageGte?: number // Greater than or equal to
  withOriginalLanguage?: string
  page?: number
}

export async function discoverMovies(filters: DiscoverFilters = {}, language = "en-US"): Promise<Movie[]> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      language,
      page: (filters.page || 1).toString(),
      sort_by: filters.sortBy || "popularity.desc",
    })

    if (filters.year) {
      queryParams.append("primary_release_year", filters.year.toString())
    }

    if (filters.withGenres && filters.withGenres.length > 0) {
      queryParams.append("with_genres", filters.withGenres.join(","))
    }

    if (filters.voteAverageGte) {
      queryParams.append("vote_average.gte", filters.voteAverageGte.toString())
    }

    if (filters.withOriginalLanguage) {
      queryParams.append("with_original_language", filters.withOriginalLanguage)
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?${queryParams.toString()}`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error("Error discovering movies:", error)
    return []
  }
}

// Fetch movie details including cast
export interface MovieDetails extends Movie {
  genres: Genre[]
  runtime: number
  tagline: string
  status: string
  budget: number
  revenue: number
  credits?: {
    cast: CastMember[]
    crew: Array<Person & { job: string; department: string }>
  }
}

export async function fetchMovieDetails(movieId: number, language = "en-US"): Promise<MovieDetails | null> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits&language=${language}`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return null
    }

    const data: MovieDetails = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching movie details for movie ${movieId}:`, error)
    return null
  }
}

// Fetch person/actor details
export async function fetchPersonDetails(personId: number, language = "en-US"): Promise<Person | null> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/person/${personId}?language=${language}`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return null
    }

    const data: Person = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching person details for person ${personId}:`, error)
    return null
  }
}

// Fetch person movie credits
export async function fetchPersonMovieCredits(personId: number, language = "en-US"): Promise<MovieCredits | null> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/person/${personId}/movie_credits?language=${language}`,
      getTmdbOptions(language),
    )

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return null
    }

    const data: MovieCredits = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching movie credits for person ${personId}:`, error)
    return null
  }
}
