"use client"

import { useState, useEffect } from "react"
import type { Movie } from "@/lib/tmdb"

const STORAGE_KEY = "favorite_movies"

export function useFavorites() {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      if (typeof window === "undefined") return

      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as Movie[]
          setFavoriteMovies(parsed)
        }
      } catch (error) {
        console.error("Error loading favorite movies:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadFavorites()
  }, [])

  // Save to localStorage whenever favoriteMovies changes
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteMovies))
    } catch (error) {
      console.error("Error saving favorite movies:", error)
    }
  }, [favoriteMovies, isLoaded])

  // Add a movie to favorites
  const addToFavorites = (movie: Movie) => {
    setFavoriteMovies((prev) => {
      // Check if movie already exists
      if (prev.some((m) => m.id === movie.id)) {
        return prev
      }
      return [...prev, movie]
    })
  }

  // Remove a movie from favorites
  const removeFromFavorites = (movieId: number) => {
    setFavoriteMovies((prev) => prev.filter((movie) => movie.id !== movieId))
  }

  // Toggle favorite status
  const toggleFavorite = (movie: Movie) => {
    const isFavorite = favoriteMovies.some((m) => m.id === movie.id)
    if (isFavorite) {
      removeFromFavorites(movie.id)
    } else {
      addToFavorites(movie)
    }
    return !isFavorite
  }

  // Check if a movie is in favorites
  const isFavorite = (movieId: number) => {
    return favoriteMovies.some((movie) => movie.id === movieId)
  }

  // Clear all favorites
  const clearFavorites = () => {
    setFavoriteMovies([])
  }

  return {
    favoriteMovies,
    isLoaded,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  }
}
