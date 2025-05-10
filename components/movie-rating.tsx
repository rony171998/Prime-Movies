"use client"

import { useState, useEffect, useRef } from "react"
import { Star } from "lucide-react"
import { rateMovie } from "@/app/actions"
import { useLanguage } from "@/contexts/language-context"
import { useRatedMovies } from "@/hooks/use-rated-movies"
import type { Movie } from "@/lib/tmdb"

interface MovieRatingProps {
  movieId: number
  guestSessionId?: string | null
  userRating?: number
  movie?: Movie
}

export function MovieRating({ movieId, guestSessionId, userRating, movie }: MovieRatingProps) {
  const [rating, setRating] = useState<number>(userRating || 0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { languageCode } = useLanguage()
  const { rateMovie: rateMovieLocally, getRating } = useRatedMovies()
  const initialLoadRef = useRef(true)

  // Check for local rating only once on initial mount
  useEffect(() => {
    if (initialLoadRef.current && !userRating) {
      initialLoadRef.current = false
      const localRating = getRating(movieId)
      if (localRating) {
        setRating(localRating)
      }
    }
  }, [movieId, getRating, userRating])

  const handleRating = async (value: number) => {
    if (isSubmitting || value === rating) return

    try {
      setIsSubmitting(true)

      // Update local state immediately for better UX
      setRating(value)

      // Save to local storage if we have the movie object
      if (movie) {
        rateMovieLocally(movie, value)
        setMessage("Rating saved locally")
      }

      // If we have a guest session, also update on the server
      if (guestSessionId) {
        try {
          const result = await rateMovie(movieId, value)

          if (result.success) {
            setMessage("Rating submitted successfully!")
          } else {
            console.error("Server rating failed:", result.error)
            // We already saved locally, so this is just a warning
            setMessage("Rating saved locally only")
          }
        } catch (error) {
          console.error("Error submitting rating to server:", error)
          setMessage("Rating saved locally only")
        }
      }

      // Clear message after 3 seconds
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    } catch (error) {
      setMessage("An error occurred while saving your rating")
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <button
            key={value}
            className="relative"
            disabled={isSubmitting}
            onClick={() => handleRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
          >
            <Star
              size={20}
              className={`transition-colors ${
                (hoveredRating ? value <= hoveredRating : value <= rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-500"
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && !hoveredRating && (
        <div className="text-sm text-yellow-400 font-medium">Your rating: {rating}/10</div>
      )}

      {hoveredRating > 0 && <div className="text-sm text-gray-400">{hoveredRating}/10</div>}

      {message && (
        <div className={`text-sm mt-2 ${message.includes("success") ? "text-green-400" : "text-amber-400"}`}>
          {message}
        </div>
      )}
    </div>
  )
}
