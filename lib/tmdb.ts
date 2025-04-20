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

// TMDB image URL builder
export const getImageUrl = (path: string | null, size = "original"): string => {
  if (!path) return "/placeholder.svg?height=300&width=200"
  return `https://image.tmdb.org/t/p/${size}${path}`
}

// Get year from release date
export const getYearFromDate = (dateString: string): string => {
  if (!dateString) return ""
  return new Date(dateString).getFullYear().toString()
}

// Map genre IDs to names (simplified version)
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
