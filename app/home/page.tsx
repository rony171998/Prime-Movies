import Image from "next/image"
import Link from "next/link"
import { Bell, ChevronDown, Play, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getImageUrl,
  getYearFromDate,
  type Movie,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchPopularMovies,
  fetchNowPlayingMovies,
} from "@/lib/tmdb"
import { unstable_cache as cache, revalidatePath } from "next/cache"
import { MovieSearch } from "@/components/movie-search"
import { MovieCarousel } from "@/components/movie-carousel"
import { GuestSession } from "@/components/guest-session"
import { getGuestSessionId } from "@/app/actions"
import { LanguageSelector } from "@/components/language-selector"
import { ContinueWatching } from "@/components/continue-watching"
import { HomeHero } from "@/components/home-hero"
import { UserAccount } from "@/components/user-account"
import { getSessionId, getAccountDetails } from "@/app/auth-actions"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"

const getPopularMovies = cache(
  async (language = "en-US"): Promise<Movie[]> => {
    return fetchPopularMovies(language)
  },
  ["popular-movies"],
)

const getNowPlayingMovies = cache(
  async (language = "en-US"): Promise<Movie[]> => {
    return fetchNowPlayingMovies(language)
  },
  ["now-playing-movies"],
)

async function refreshPage() {
  "use server"
  revalidatePath("/home")
}

export default async function HomePage() {
  // Get the language from the server component
  // For server components, we'll use the default language (en-US)
  // Client components will use the language from the context
  const language = "en-US"

  // Fetch all movie data in parallel
  const [popularMovies, topRatedMovies, upcomingMovies, nowPlayingMovies] = await Promise.all([
    getPopularMovies(language),
    fetchTopRatedMovies(language),
    fetchUpcomingMovies(language),
    getNowPlayingMovies(language),
  ])

  // Get session and account details
  const sessionId = await getSessionId()
  const accountDetails = sessionId ? await getAccountDetails() : null
  const guestSessionId = !sessionId ? await getGuestSessionId() : null

  // Fallback data in case the API fails
  if (popularMovies.length === 0) {
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

  const featuredMovie = nowPlayingMovies.length > 0 ? nowPlayingMovies[0] : popularMovies[0]
  const recommendedMovies = popularMovies.slice(0, 4)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 glass rounded-3xl m-3 flex-shrink-0 flex flex-col overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-teal-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="text-xl font-semibold">Prime Vision</span>
            </Link>
          </div>

          {/* Add login button if not logged in */}
          {!sessionId && (
            <div className="mb-6">
              <LoginForm
                trigger={
                  <Button
                    variant="default"
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white border-none flex items-center gap-2 justify-center py-2"
                  >
                    <User size={16} />
                    <span>Login with TMDB</span>
                  </Button>
                }
              />
            </div>
          )}

          <nav className="space-y-6">
            <Link href="/home" className="flex items-center gap-3 text-teal-400">
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
            </Link>
            <Link href="/explore" className="flex items-center gap-3 text-gray-400 hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
              Explore
            </Link>
            <Link href="/favorites" className="flex items-center gap-3 text-gray-400 hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Favorites
            </Link>
            <Link href="/rated-movies" className="flex items-center gap-3 text-gray-400 hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Rated Movies
            </Link>
            <Link href="/continue-watching" className="flex items-center gap-3 text-gray-400 hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M10 8L16 12L10 16V8Z" fill="currentColor" />
              </svg>
              Continue Watching
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-6">
          {/* Show account info if logged in */}
          {sessionId && accountDetails ? (
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
                {accountDetails?.avatar?.tmdb?.avatar_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w200${accountDetails.avatar.tmdb.avatar_path}`}
                    alt={accountDetails.username || "Profile"}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <User className="h-full w-full text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium">{accountDetails.username}</p>
                <p className="text-xs text-gray-400">TMDB Account</p>
              </div>
            </div>
          ) : (
            <>
              <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-foreground">
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
            </>
          )}
          <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-foreground">
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
        <ContinueWatching />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 glass-lighter rounded-3xl mx-3 mt-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-muted border-border text-foreground rounded-full px-4">
              All
              <ChevronDown size={16} className="ml-1" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Add the language selector */}
            <LanguageSelector />

            {/* Add the theme toggle */}
            <ThemeToggle />

            {/* Movie search component */}
            <div className="w-64">
              <MovieSearch />
            </div>

            {/* Show either UserAccount or GuestSession, but not both */}
            {sessionId ? (
              <UserAccount sessionId={sessionId} accountDetails={accountDetails} />
            ) : (
              <GuestSession guestSessionId={guestSessionId} />
            )}

            <button className="text-foreground">
              <Bell size={20} />
            </button>

            {/* Only show this if not logged in with TMDB account */}
            {!sessionId && (
              <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </header>

        {/* Featured Content */}
        <div className="relative flex-1 overflow-auto">
          {/* Hero Section */}
          <HomeHero movies={[...nowPlayingMovies.slice(0, 4), ...popularMovies.slice(0, 4)].slice(0, 8)} />

          {/* Movie Carousels */}
          <div className="px-8 py-6">
            {/* Recommended Movies */}
            <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {recommendedMovies.length > 0
                ? recommendedMovies.map((movie) => (
                    <Link href={`/watch?id=${movie.id}`} key={movie.id}>
                      <div className="rounded-3xl overflow-hidden glass-lighter aspect-[2/3] group relative">
                        <Image
                          src={getImageUrl(movie.poster_path, "w500") || "/placeholder.svg?height=300&width=200"}
                          alt={movie.title}
                          width={200}
                          height={300}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-center p-4">
                            <h3 className="font-medium text-foreground mb-1">{movie.title}</h3>
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

            {/* Now Playing Movies Carousel */}
            <MovieCarousel title="Now Playing" movies={nowPlayingMovies} isLoading={nowPlayingMovies.length === 0} />

            {/* Top Rated Movies Carousel */}
            <MovieCarousel title="Top Rated Movies" movies={topRatedMovies} isLoading={topRatedMovies.length === 0} />

            {/* Upcoming Movies Carousel */}
            <MovieCarousel title="Coming Soon" movies={upcomingMovies} isLoading={upcomingMovies.length === 0} />
          </div>
        </div>
      </div>
    </div>
  )
}
