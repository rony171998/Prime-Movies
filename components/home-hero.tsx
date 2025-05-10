"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, MoreHorizontal, Clock, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, getGenreName, type Movie } from "@/lib/tmdb"
import { fetchMovieDetailsForHero } from "@/app/home-hero-actions"

// Define an interface for the detailed movie information
interface MovieDetails {
  id: number
  runtime: number
  release_date: string
  vote_average: number
  vote_count: number
  status: string
  original_language: string
  budget: number
  revenue: number
  tagline: string
  production_companies: Array<{
    id: number
    name: string
    logo_path: string | null
  }>
}

interface HomeHeroProps {
  movies: Movie[]
}

export function HomeHero({ movies }: HomeHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"right" | "left">("right")
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Auto-rotate featured movies every 5 seconds unless user is hovering
  useEffect(() => {
    if (isHovering) return

    const interval = setInterval(() => {
      setSlideDirection("right")
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length)
        setIsTransitioning(false)
      }, 500) // Half of the transition duration
    }, 5000)

    return () => clearInterval(interval)
  }, [isHovering, movies.length])

  // Get the current movie to display
  const movie = movies[currentIndex]

  // Fetch additional movie details when the current movie changes
  useEffect(() => {
    if (!movie) return

    async function getMovieDetails() {
      setIsLoadingDetails(true)
      try {
        const details = await fetchMovieDetailsForHero(movie.id)
        setMovieDetails(details)
      } catch (error) {
        console.error("Error fetching movie details:", error)
        setMovieDetails(null)
      } finally {
        setIsLoadingDetails(false)
      }
    }

    getMovieDetails()
  }, [movie])

  if (!movies || movies.length === 0) {
    return (
      <div className="h-[500px] bg-zinc-900 flex items-center justify-center">
        <p>No featured movies available</p>
      </div>
    )
  }

  const navigateToSlide = (index: number) => {
    if (index === currentIndex) return

    setSlideDirection(index > currentIndex ? "right" : "left")
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 500) // Half of the transition duration
  }

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number | undefined) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Format date to readable format
  const formatReleaseDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div
      className="relative h-[500px] overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`w-full h-full transition-transform duration-1000 ease-in-out ${
            isTransitioning
              ? slideDirection === "right"
                ? "translate-x-[-100%]"
                : "translate-x-[100%]"
              : "translate-x-0"
          }`}
        >
          <Image
            src={getImageUrl(movie.backdrop_path, "original") || "/placeholder.svg?height=500&width=1000"}
            alt={movie.title}
            width={1000}
            height={500}
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </div>
      <div className="absolute inset-4 rounded-3xl bg-gradient-to-r from-black/70 via-black/40 to-transparent dark:from-black/70 dark:via-black/40 light:from-black/50 light:via-black/30"></div>

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Badge className="glass text-white border-none px-3 py-1.5 text-xs rounded-full">
          <span className="mr-1">🔥</span> Now Popular
        </Badge>
      </div>

      <div className="absolute bottom-16 left-16 max-w-lg">
        <div className="flex gap-2 mb-2">
          {movie.genre_ids.slice(0, 2).map((genreId) => (
            <Badge key={genreId} variant="outline" className="bg-zinc-800/80 text-white border-zinc-700 rounded-full">
              {getGenreName(genreId)}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
          {movie.title}
        </h1>

        {/* Movie Details Section */}
        {movieDetails && (
          <div className="flex items-center gap-4 mb-3">
            {movieDetails.vote_average > 0 && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={16} className="fill-yellow-400" />
                <span className="text-white font-medium">{movieDetails.vote_average.toFixed(1)}</span>
              </div>
            )}

            {movieDetails.runtime > 0 && (
              <div className="flex items-center gap-1 text-white">
                <Clock size={16} />
                <span>{formatRuntime(movieDetails.runtime)}</span>
              </div>
            )}

            {movieDetails.release_date && (
              <div className="flex items-center gap-1 text-white">
                <Calendar size={16} />
                <span>{new Date(movieDetails.release_date).getFullYear()}</span>
              </div>
            )}

            {movieDetails.tagline && (
              <Badge variant="outline" className="bg-zinc-800/50 text-white border-zinc-700">
                {movieDetails.tagline}
              </Badge>
            )}
          </div>
        )}

        <p className="text-sm text-gray-300 mb-6 leading-relaxed line-clamp-3">{movie.overview}</p>

        <div className="flex items-center gap-4">
          <Link href={`/watch?id=${movie.id}`}>
            <Button className="bg-white/90 backdrop-filter backdrop-blur-sm text-black hover:bg-white rounded-full px-8 py-6 text-base">
              <Play size={16} className="mr-2" />
              Watch Now
            </Button>
          </Link>
          {/* Download button removed */}
          <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full p-2">
            <MoreHorizontal size={20} />
          </Button>
        </div>
      </div>

      {/* Hero Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${currentIndex === index ? "bg-white" : "bg-white/30"} transition-all`}
            onClick={() => navigateToSlide(index)}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 glass hover:glass-darker text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          setSlideDirection("left")
          setIsTransitioning(true)
          setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
            setIsTransitioning(false)
          }, 500)
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 glass hover:glass-darker text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          setSlideDirection("right")
          setIsTransitioning(true)
          setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length)
            setIsTransitioning(false)
          }, 500)
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  )
}
