import Image from "next/image"
import Link from "next/link"
import { Bell, ChevronDown, Play, Download, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, getYearFromDate, getGenreName, type Movie, type MovieResponse } from "@/lib/tmdb"
import { unstable_cache as cache, revalidatePath } from "next/cache"
import { MovieSearch } from "@/components/movie-search"

const getPopularMovies = cache(async (): Promise<Movie[]> => {
  try {
    // Fetch directly from TMDB API instead of going through our own API route
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyOTIyMDY2YWJmZDRiOTk0NmM3ZmYxOTIyYWE4YWE4MyIsIm5iZiI6MTc0NTE1ODczMC42NzgwMDAyLCJzdWIiOiI2ODA1MDI0YTZlMWE3NjllODFlZTIwYzYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.utmv6MKXXxqkL4ih-FKV61LcXsezdSRb_fhhmXmZqO4",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }

    const response = await fetch("https://api.themoviedb.org/3/movie/popular?language=en-US&page=1", options)

    if (!response.ok) {
      console.error(`TMDB API request failed with status ${response.status}`)
      return []
    }

    const data: MovieResponse = await response.json()
    return data.results
  } catch (error) {
    console.error("Error fetching movies:", error)
    return []
  }
}, ["popular-movies"])

async function refreshPage() {
  "use server"
  revalidatePath("/")
}

export default async function Home() {
  const movies = await getPopularMovies()

  // Fallback data in case the API fails
  if (movies.length === 0) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Unable to load movies</h1>
          <p className="mb-6">We're having trouble connecting to the movie database. Please try again later.</p>
          <form action={refreshPage}>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white">
              Retry
            </Button>
          </form>
        </div>
      </div>
    )
  }
  const featuredMovie = movies.length > 0 ? movies[0] : null
  const recommendedMovies = movies.slice(1, 5)

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 flex-shrink-0 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <span className="text-teal-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="text-xl font-semibold">Prime Movie</span>
          </div>

          <nav className="space-y-6">
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Home
            </a>
            <a href="#" className="flex items-center gap-3 text-teal-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
              Explore
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Favourites
            </a>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-6">
          <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Profile
          </a>
          <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Settings
          </a>
        </div>

        {/* Continue Watching */}
        <div className="p-6 border-t border-zinc-800">
          <h3 className="text-sm font-medium mb-4">Continue Watching</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                <Image
                  src="/placeholder.svg?height=48&width=48"
                  alt="Chernobyl"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Chernobyl</p>
                <p className="text-xs text-gray-400">Episode 3</p>
              </div>
              <button className="text-white p-1">
                <Play size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                <Image
                  src="/placeholder.svg?height=48&width=48"
                  alt="Snowpiercer"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Snowpiercer</p>
                <p className="text-xs text-gray-400">Episode 7</p>
              </div>
              <button className="text-white p-1">
                <Play size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                <Image
                  src="/placeholder.svg?height=48&width=48"
                  alt="The Platform"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">The Platform</p>
                <p className="text-xs text-gray-400">55min 12sec</p>
              </div>
              <button className="text-white p-1">
                <Play size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-zinc-900">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-zinc-800 border-zinc-700 text-white rounded-full px-4">
              All
              <ChevronDown size={16} className="ml-1" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Replace the old search with our new MovieSearch component */}
            <div className="w-64">
              <MovieSearch />
            </div>
            <button className="text-white">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="Profile"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          </div>
        </header>

        {/* Featured Content */}
        <div className="relative flex-1 overflow-auto">
          {featuredMovie ? (
            <div className="relative h-[500px] overflow-hidden">
              <Image
                src={getImageUrl(featuredMovie.backdrop_path, "original") || "/placeholder.svg"}
                alt={featuredMovie.title}
                width={1000}
                height={500}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge className="bg-orange-500/80 text-white border-none px-2 py-1 text-xs">
                  <span className="mr-1">🔥</span> Now Popular
                </Badge>
              </div>

              <div className="absolute bottom-16 left-16 max-w-lg">
                <div className="flex gap-2 mb-2">
                  {featuredMovie.genre_ids.slice(0, 2).map((genreId) => (
                    <Badge
                      key={genreId}
                      variant="outline"
                      className="bg-zinc-800/80 text-white border-zinc-700 rounded-full"
                    >
                      {getGenreName(genreId)}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-4xl font-bold mb-2">{featuredMovie.title}</h1>
                <p className="text-sm text-gray-300 mb-6 leading-relaxed">{featuredMovie.overview}</p>

                <div className="flex items-center gap-4">
                  <Link href={`/watch?id=${featuredMovie.id}`}>
                    <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6">
                      <Play size={16} className="mr-2" />
                      Watch Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full">
                    <Download size={16} className="mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full p-2">
                    <MoreHorizontal size={20} />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[500px] bg-zinc-900 flex items-center justify-center">
              <p>No featured movie available</p>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">You might like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendedMovies.length > 0
                ? recommendedMovies.map((movie) => (
                    <Link href={`/watch?id=${movie.id}`} key={movie.id}>
                      <div className="rounded-lg overflow-hidden bg-zinc-800 aspect-[2/3] group relative">
                        <Image
                          src={getImageUrl(movie.poster_path, "w500") || "/placeholder.svg"}
                          alt={movie.title}
                          width={200}
                          height={300}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-center p-4">
                            <h3 className="font-medium text-white mb-1">{movie.title}</h3>
                            <p className="text-xs text-gray-300">{getYearFromDate(movie.release_date)}</p>
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full text-xs border-white/30 text-white"
                              >
                                <Play size={12} className="mr-1" /> Watch
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                : Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-zinc-800 aspect-[2/3]">
                        <Image
                          src="/placeholder.svg?height=300&width=200"
                          alt="Loading"
                          width={200}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
