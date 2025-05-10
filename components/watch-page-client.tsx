"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Share2, Plus, Flag, Play, Bell, User, Star } from "lucide-react"
import { VideoPlayer, type SubtitleTrack } from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, getYearFromDate, type Movie, getTmdbOptions } from "@/lib/tmdb"
import { MovieRating } from "@/components/movie-rating"
import { useLanguage } from "@/contexts/language-context"
import { useSearchParams } from "next/navigation"
import { FavoriteButton } from "@/components/favorite-button"
import { MovieSearch } from "@/components/movie-search"
import { GuestSession } from "@/components/guest-session"
import { LanguageSelector } from "@/components/language-selector"
import { UserAccount } from "@/components/user-account"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"

interface MovieDetails {
  id: number
  title: string
  overview: string
  poster_path: string
  backdrop_path: string
  release_date: string
  runtime: number
  genres: { id: number; name: string }[]
  credits: {
    cast: {
      id: number
      name: string
      character: string
      profile_path: string | null
    }[]
    crew: {
      id: number
      name: string
      job: string
      department: string
      profile_path: string | null
    }[]
  }
  vote_average: number
  vote_count: number
  status: string
  tagline: string
  budget: number
  revenue: number
  original_language: string
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[]
  production_companies: {
    id: number
    logo_path: string | null
    name: string
    origin_country: string
  }[]
  production_countries: {
    iso_3166_1: string
    name: string
  }[]
  belongs_to_collection: {
    id: number
    name: string
    poster_path: string | null
    backdrop_path: string | null
  } | null
}

interface VideoResult {
  id: string
  key: string
  name: string
  site: string
  size: number
  type: string
  official: boolean
  published_at: string
}

interface VideosResponse {
  id: number
  results: VideoResult[]
}

interface WatchPageClientProps {
  movieId: string
  guestSessionId: string | null
  sessionId?: string | null
  accountDetails?: any
}

export function WatchPageClient({ movieId, guestSessionId, sessionId, accountDetails }: WatchPageClientProps) {
  const { languageCode } = useLanguage()

  const [isInList, setIsInList] = useState(false)
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [videos, setVideos] = useState<VideoResult[]>([])
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVideosLoading, setIsVideosLoading] = useState(true)
  const [isSimilarLoading, setIsSimilarLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTrailer, setSelectedTrailer] = useState<VideoResult | null>(null)

  const searchParams = useSearchParams()
  const initialTime = searchParams.get("t") ? Number.parseFloat(searchParams.get("t") as string) : 0

  // Fetch movie details
  useEffect(() => {
    if (!movieId) {
      setError("No movie ID provided")
      setIsLoading(false)
      return
    }

    async function fetchMovieDetails() {
      try {
        setIsLoading(true)
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?language=${languageCode}&append_to_response=credits,videos,recommendations,keywords,images`,
          getTmdbOptions(languageCode),
        )

        if (!response.ok) {
          throw new Error(`TMDB API request failed with status ${response.status}`)
        }

        const data = await response.json()
        setMovie(data)
      } catch (err) {
        setError("Error loading movie details")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovieDetails()
  }, [movieId, languageCode])

  // Fetch movie videos (trailers, teasers, etc.)
  useEffect(() => {
    if (!movieId) return

    async function fetchMovieVideos() {
      try {
        setIsVideosLoading(true)
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/videos?language=${languageCode}`,
          getTmdbOptions(languageCode),
        )

        if (!response.ok) {
          throw new Error(`TMDB API request failed with status ${response.status}`)
        }

        const data: VideosResponse = await response.json()
        setVideos(data.results)

        // Select the best trailer automatically
        const officialTrailer = data.results.find(
          (video) => video.type === "Trailer" && video.official && video.site === "YouTube",
        )
        const anyTrailer = data.results.find((video) => video.type === "Trailer" && video.site === "YouTube")
        const teaser = data.results.find((video) => video.type === "Teaser" && video.site === "YouTube")

        setSelectedTrailer(officialTrailer || anyTrailer || teaser || null)
      } catch (err) {
        console.error("Error loading movie videos:", err)
      } finally {
        setIsVideosLoading(false)
      }
    }

    fetchMovieVideos()
  }, [movieId, languageCode])

  // Fetch similar movies
  useEffect(() => {
    if (!movieId) return

    async function fetchSimilarMovies() {
      try {
        setIsSimilarLoading(true)
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar?language=${languageCode}&page=1`,
          getTmdbOptions(languageCode),
        )

        if (!response.ok) {
          throw new Error(`TMDB API request failed with status ${response.status}`)
        }

        const data = await response.json()
        setSimilarMovies(data.results.slice(0, 4)) // Get first 4 similar movies
      } catch (err) {
        console.error("Error loading similar movies:", err)
        setSimilarMovies([])
      } finally {
        setIsSimilarLoading(false)
      }
    }

    fetchSimilarMovies()
  }, [movieId, languageCode])

  // Format runtime to hours and minutes
  const formatRuntime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }, [])

  // Get YouTube video URL
  const getYouTubeUrl = useCallback((key: string) => {
    return `https://www.youtube.com/embed/${key}?autoplay=1&controls=1&modestbranding=1&rel=0`
  }, [])

  // Format budget and revenue to currency
  const formatCurrency = useCallback((amount: number) => {
    if (!amount || amount === 0) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }, [])

  // Get director and writers from crew
  const getDirector = useCallback(() => {
    if (!movie?.credits?.crew) return "Unknown"
    const director = movie.credits.crew.find((person) => person.job === "Director")
    return director ? director.name : "Unknown"
  }, [movie?.credits?.crew])

  const getWriters = useCallback(() => {
    if (!movie?.credits?.crew) return []
    return movie.credits.crew.filter((person) => ["Screenplay", "Writer", "Story"].includes(person.job)).slice(0, 3)
  }, [movie?.credits?.crew])

  // Format language code to full name
  const formatLanguage = useCallback((languageCode: string) => {
    const languages: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      ja: "Japanese",
      ko: "Korean",
      zh: "Chinese",
      ru: "Russian",
      pt: "Portuguese",
    }
    return languages[languageCode] || languageCode
  }, [])

  // Toggle isInList state
  const toggleInList = useCallback(() => {
    setIsInList((prev) => !prev)
  }, [])

  // Handle trailer selection
  const handleTrailerSelect = useCallback((video: VideoResult) => {
    setSelectedTrailer(video)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#212121] text-white flex items-center justify-center">
        <p>Loading movie details...</p>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#212121] text-white flex items-center justify-center">
        <p>{error || "Failed to load movie"}</p>
        <Link href="/" className="ml-2 text-teal-400 hover:underline">
          Return to home
        </Link>
      </div>
    )
  }

  // Convert MovieDetails to Movie type for the FavoriteButton
  const movieForFavorite: Movie = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    release_date: movie.release_date,
    vote_average: movie.vote_average || 0,
    genre_ids: movie.genres.map((g) => g.id),
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header/Navbar */}
      <header className="flex items-center justify-between p-4 glass-darker rounded-3xl m-3">
        <div className="flex items-center gap-2">
          <Link href="/home" className="text-white hover:text-teal-400 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="ml-2 text-lg font-medium">{movie.title}</h1>
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

          {/* Authentication components - only show one based on session state */}
          {sessionId ? (
            // User is logged in - show account dropdown
            <UserAccount sessionId={sessionId} accountDetails={accountDetails} />
          ) : (
            // User is not logged in - show login button and guest session
            <>
              {/* Login form with dialog */}
              <LoginForm
                trigger={
                  <Button variant="default" size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
                    <User size={16} className="mr-2" />
                    Login
                  </Button>
                }
              />

              {/* Guest session */}
              <GuestSession guestSessionId={guestSessionId} />
            </>
          )}

          <button className="text-white dark:text-white light:text-gray-800">
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

      {/* Movie Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Video Player */}
          {isVideosLoading ? (
            // Loading skeleton for video player
            <div className="w-full aspect-video bg-zinc-800 animate-pulse rounded-lg"></div>
          ) : selectedTrailer ? (
            // If we have a trailer, use an iframe for YouTube
            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden">
              <iframe
                src={getYouTubeUrl(selectedTrailer.key)}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
          ) : (
            // Fallback to the VideoPlayer component with a poster
            <VideoPlayer
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster={getImageUrl(movie.backdrop_path, "original")}
              title={`${movie.title} - Official Trailer`}
              subtitles={subtitleTracks}
              movie={movieForFavorite}
              initialTime={initialTime}
            />
          )}

          {/* Available Trailers Section (if multiple videos exist) */}
          {videos.length > 1 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Available Videos</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {videos
                  .filter((video) => video.site === "YouTube")
                  .map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleTrailerSelect(video)}
                      className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                        selectedTrailer?.id === video.id
                          ? "bg-teal-500 text-white"
                          : "bg-zinc-800 text-white hover:bg-zinc-700"
                      }`}
                    >
                      {video.type}: {video.name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Movie Details Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Poster and Quick Info */}
            <div className="md:col-span-1">
              <div className="rounded-3xl overflow-hidden glass-lighter mb-6">
                <Image
                  src={getImageUrl(movie.poster_path, "w500") || "/placeholder.svg?height=750&width=500"}
                  alt={movie.title}
                  width={500}
                  height={750}
                  className="w-full h-auto"
                />
              </div>

              <div className="glass rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
                  <p className="text-foreground">{movie.status || "Released"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Release Date</h3>
                  <p className="text-foreground">
                    {new Date(movie.release_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Runtime</h3>
                  <p className="text-foreground">{formatRuntime(movie.runtime)}</p>
                </div>

                {movie.budget > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Budget</h3>
                    <p className="text-foreground">{formatCurrency(movie.budget)}</p>
                  </div>
                )}

                {movie.revenue > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Revenue</h3>
                    <p className="text-foreground">{formatCurrency(movie.revenue)}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Original Language</h3>
                  <p className="text-foreground">
                    {movie.spoken_languages?.find((lang) => lang.iso_639_1 === movie.original_language)?.english_name ||
                      formatLanguage(movie.original_language)}
                  </p>
                </div>

                {/* Rating Component */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Rate This Movie</h3>
                  <MovieRating
                    movieId={Number.parseInt(movieId)}
                    guestSessionId={guestSessionId}
                    movie={movieForFavorite}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Main Content */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>

                {movie.tagline && <p className="text-lg text-gray-400 italic mb-4">"{movie.tagline}"</p>}

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={20} className="fill-yellow-400" />
                    <span className="text-foreground font-medium">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({movie.vote_count.toLocaleString()} votes)</span>
                  </div>

                  <div className="flex gap-2">
                    {movie.genres.map((genre) => (
                      <Badge
                        key={genre.id}
                        variant="outline"
                        className="bg-zinc-800/80 text-white border-zinc-700 rounded-full"
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  {/* Replace the like button with our FavoriteButton */}
                  <FavoriteButton movie={movieForFavorite} guestSessionId={guestSessionId} />

                  <Button
                    variant="ghost"
                    className="flex flex-col items-center gap-1 hover:bg-zinc-800"
                    onClick={toggleInList}
                  >
                    <Plus size={20} className={isInList ? "text-teal-400" : ""} />
                    <span className="text-xs">My List</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center gap-1 hover:bg-zinc-800">
                    <Share2 size={20} />
                    <span className="text-xs">Share</span>
                  </Button>
                  <Button variant="ghost" className="flex flex-col items-center gap-1 hover:bg-zinc-800">
                    <Flag size={20} />
                    <span className="text-xs">Report</span>
                  </Button>
                </div>

                <div className="glass rounded-3xl p-6 mb-8">
                  <h2 className="text-lg font-semibold mb-2">Overview</h2>
                  <p className="text-foreground leading-relaxed">{movie.overview}</p>
                </div>

                {/* Director and Writers */}
                <div className="glass rounded-3xl p-6 mb-8">
                  <h2 className="text-lg font-semibold mb-4">Crew</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Director</h3>
                      <p className="text-foreground font-medium">{getDirector()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Writers</h3>
                      <div>
                        {getWriters().length > 0 ? (
                          getWriters().map((writer, index) => (
                            <p key={writer.id} className="text-foreground">
                              {writer.name} <span className="text-gray-400">({writer.job})</span>
                              {index < getWriters().length - 1 ? ", " : ""}
                            </p>
                          ))
                        ) : (
                          <p className="text-foreground">Information not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Production Companies */}
                {movie.production_companies && movie.production_companies.length > 0 && (
                  <div className="glass rounded-3xl p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">Production Companies</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {movie.production_companies.map((company) => (
                        <div key={company.id} className="flex flex-col items-center text-center">
                          {company.logo_path ? (
                            <div className="h-16 flex items-center justify-center mb-2">
                              <Image
                                src={getImageUrl(company.logo_path, "w200") || "/placeholder.svg"}
                                alt={company.name}
                                width={100}
                                height={50}
                                className="max-h-16 w-auto object-contain"
                              />
                            </div>
                          ) : (
                            <div className="h-16 w-full flex items-center justify-center bg-zinc-800 rounded-lg mb-2">
                              <span className="text-gray-400 text-xs">No logo</span>
                            </div>
                          )}
                          <p className="text-sm font-medium">{company.name}</p>
                          <p className="text-xs text-gray-400">{company.origin_country}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collection Information */}
                {movie.belongs_to_collection && (
                  <div className="glass rounded-3xl p-6 mb-8 relative overflow-hidden">
                    {movie.belongs_to_collection.backdrop_path && (
                      <div className="absolute inset-0 opacity-20">
                        <Image
                          src={getImageUrl(movie.belongs_to_collection.backdrop_path, "w1280") || "/placeholder.svg"}
                          alt={movie.belongs_to_collection.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
                      </div>
                    )}
                    <div className="relative z-10">
                      <h2 className="text-lg font-semibold mb-2">Part of a Collection</h2>
                      <p className="text-xl font-bold mb-4">{movie.belongs_to_collection.name}</p>
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white">View Collection</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cast & Crew - Updated to make actors clickable */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Top Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.credits.cast.slice(0, 8).map((actor) => (
                    <Link
                      key={actor.id}
                      href={`/person/${actor.id}`}
                      className="glass-lighter rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="aspect-[2/3] relative">
                        <Image
                          src={
                            actor.profile_path
                              ? getImageUrl(actor.profile_path, "w500")
                              : `/placeholder.svg?height=300&width=200&text=${actor.name.charAt(0)}`
                          }
                          alt={actor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm line-clamp-1 group-hover:text-teal-400 transition-colors">
                          {actor.name}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1">{actor.character}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {movie.credits.cast.length > 8 && (
                  <Button variant="outline" className="mt-4 bg-zinc-800 border-zinc-700 text-white">
                    View All Cast
                  </Button>
                )}
              </div>

              {/* More Like This */}
              <div>
                <h2 className="text-xl font-semibold mb-4">More Like This</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {isSimilarLoading ? (
                    // Loading skeleton
                    Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="rounded-lg overflow-hidden bg-zinc-800 aspect-[2/3] animate-pulse">
                          <div className="w-full h-full bg-zinc-700"></div>
                        </div>
                      ))
                  ) : similarMovies.length > 0 ? (
                    // Display similar movies
                    similarMovies.map((movie) => (
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
                  ) : (
                    // No similar movies found
                    <div className="col-span-4 text-center py-8 text-gray-400">
                      <p>No similar movies found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sample subtitle tracks
const subtitleTracks: SubtitleTrack[] = [
  {
    src: "/subtitles/english.vtt",
    label: "English",
    srcLang: "en",
    default: true,
  },
  {
    src: "/subtitles/spanish.vtt",
    label: "Spanish",
    srcLang: "es",
  },
  {
    src: "/subtitles/french.vtt",
    label: "French",
    srcLang: "fr",
  },
  {
    src: "/subtitles/ukrainian.vtt",
    label: "Ukrainian",
    srcLang: "uk",
  },
]
