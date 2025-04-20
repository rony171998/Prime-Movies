"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ThumbsUp, Share2, Plus, Flag, Play } from "lucide-react"
import { VideoPlayer, type SubtitleTrack } from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, getYearFromDate, type Movie } from "@/lib/tmdb"

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
  }
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

export default function WatchPage() {
  const searchParams = useSearchParams()
  const movieId = searchParams.get("id")

  const [isLiked, setIsLiked] = useState(false)
  const [isInList, setIsInList] = useState(false)
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [videos, setVideos] = useState<VideoResult[]>([])
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVideosLoading, setIsVideosLoading] = useState(true)
  const [isSimilarLoading, setIsSimilarLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTrailer, setSelectedTrailer] = useState<VideoResult | null>(null)

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

  // API request options
  const apiOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyOTIyMDY2YWJmZDRiOTk0NmM3ZmYxOTIyYWE4YWE4MyIsIm5iZiI6MTc0NTE1ODczMC42NzgwMDAyLCJzdWIiOiI2ODA1MDI0YTZlMWE3NjllODFlZTIwYzYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.utmv6MKXXxqkL4ih-FKV61LcXsezdSRb_fhhmXmZqO4",
    },
  }

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
          `https://api.themoviedb.org/3/movie/${movieId}?language=en-US&append_to_response=credits`,
          apiOptions,
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
  }, [movieId])

  // Fetch movie videos (trailers, teasers, etc.)
  useEffect(() => {
    if (!movieId) return

    async function fetchMovieVideos() {
      try {
        setIsVideosLoading(true)
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`, apiOptions)

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
  }, [movieId])

  // Fetch similar movies
  useEffect(() => {
    if (!movieId) return

    async function fetchSimilarMovies() {
      try {
        setIsSimilarLoading(true)
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar?language=en-US&page=1`,
          apiOptions,
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
  }, [movieId])

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Get release year
  const getReleaseYear = (dateString: string) => {
    return new Date(dateString).getFullYear()
  }

  // Get YouTube video URL
  const getYouTubeUrl = (key: string) => {
    return `https://www.youtube.com/embed/${key}?autoplay=1&controls=1&modestbranding=1&rel=0`
  }

  // Get trailer source URL for video player
  const getTrailerSource = () => {
    if (selectedTrailer && selectedTrailer.site === "YouTube") {
      return getYouTubeUrl(selectedTrailer.key)
    }
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading movie details...</p>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>{error || "Failed to load movie"}</p>
        <Link href="/" className="ml-2 text-teal-400 hover:underline">
          Return to home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-4 flex items-center">
        <Link href="/" className="text-white hover:text-teal-400 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="ml-4 text-lg font-medium">{movie.title}</h1>
      </header>

      {/* Video Player */}
      <div className="container mx-auto px-4 max-w-5xl">
        {isVideosLoading ? (
          // Loading skeleton for video player
          <div className="w-full aspect-video bg-zinc-800 animate-pulse rounded-lg"></div>
        ) : selectedTrailer ? (
          // If we have a trailer, use an iframe for YouTube
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
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
                    onClick={() => setSelectedTrailer(video)}
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

        {/* Video Info */}
        <div className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{movie.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <span>{getReleaseYear(movie.release_date)}</span>
                <span>•</span>
                <span>{formatRuntime(movie.runtime)}</span>
                <span>•</span>
                <span>PG-13</span>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
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

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1 hover:bg-zinc-800"
                onClick={() => setIsLiked(!isLiked)}
              >
                <ThumbsUp size={20} className={isLiked ? "text-teal-400 fill-teal-400" : ""} />
                <span className="text-xs">Like</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1 hover:bg-zinc-800"
                onClick={() => setIsInList(!isInList)}
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
          </div>

          <div className="bg-zinc-900 rounded-lg p-4">
            <p className="text-sm text-gray-300 leading-relaxed">{movie.overview}</p>
          </div>

          {/* Cast & Crew */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Cast & Crew</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {movie.credits.cast.slice(0, 4).map((actor) => (
                <div key={actor.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                    <Image
                      src={
                        actor.profile_path
                          ? getImageUrl(actor.profile_path, "w200")
                          : `/placeholder.svg?height=48&width=48&text=${actor.name.charAt(0)}`
                      }
                      alt={actor.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{actor.name}</p>
                    <p className="text-xs text-gray-400">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* More Like This */}
          <div>
            <h2 className="text-lg font-semibold mb-3">More Like This</h2>
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
                    <div className="rounded-lg overflow-hidden bg-zinc-800 aspect-[2/3] group relative">
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
  )
}
