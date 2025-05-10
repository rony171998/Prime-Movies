"use client"

import { useState, useEffect } from "react"
import type { Movie } from "@/lib/tmdb"

export interface RatedMovie extends Movie {
  rating: number
}

const STORAGE_KEY = "rated_movies"

export function useRatedMovies() {
  const [ratedMovies, setRatedMovies] = useState<RatedMovie[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load rated movies from localStorage on mount
  useEffect(() => {
    const loadRatedMovies = () => {
      if (typeof window === "undefined") return

      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as RatedMovie[]
          setRatedMovies(parsed)
        }
      } catch (error) {
        console.error("Error loading rated movies:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadRatedMovies()
  }, [])

  // Save to localStorage whenever ratedMovies changes
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ratedMovies))
    } catch (error) {
      console.error("Error saving rated movies:", error)
    }
  }, [ratedMovies, isLoaded])

  // Add or update a movie rating
  const rateMovie = (movie: Movie, rating: number) => {
    setRatedMovies((prev) => {
      // Check if movie already exists
      const existingIndex = prev.findIndex((m) => m.id === movie.id)

      if (existingIndex !== -1) {
        // Update existing movie rating
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          rating,
        }
        return updated
      } else {
        // Add new rated movie
        const ratedMovie: RatedMovie = {
          ...movie,
          rating,
        }
        return [...prev, ratedMovie]
      }
    })
  }

  // Remove a movie rating
  const removeRating = (movieId: number) => {
    setRatedMovies((prev) => prev.filter((movie) => movie.id !== movieId))
  }

  // Get rating for a movie
  const getRating = (movieId: number): number | undefined => {
    const movie = ratedMovies.find((m) => m.id === movieId)
    return movie?.rating
  }

  // Clear all ratings
  const clearRatings = () => {
    setRatedMovies([])
  }

  return {
    ratedMovies,
    isLoaded,
    rateMovie,
    removeRating,
    getRating,
    clearRatings,
  }
}
