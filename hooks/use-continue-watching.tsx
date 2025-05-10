"use client"

import { useState, useEffect } from "react"
import type { Movie } from "@/lib/tmdb"

export interface WatchedMovie {
  id: number
  title: string
  poster_path: string | null
  progress: number // 0-100 percentage
  lastWatched: number // timestamp
  duration: number // in seconds
  currentTime: number // in seconds
}

const STORAGE_KEY = "continue_watching"
const MAX_ITEMS = 10

export function useContinueWatching() {
  const [watchedMovies, setWatchedMovies] = useState<WatchedMovie[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load watched movies from localStorage on mount
  useEffect(() => {
    const loadWatchedMovies = () => {
      if (typeof window === "undefined") return

      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as WatchedMovie[]
          // Sort by last watched, most recent first
          const sorted = parsed.sort((a, b) => b.lastWatched - a.lastWatched)
          setWatchedMovies(sorted)
        }
      } catch (error) {
        console.error("Error loading watched movies:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadWatchedMovies()
  }, [])

  // Save to localStorage whenever watchedMovies changes
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedMovies))
    } catch (error) {
      console.error("Error saving watched movies:", error)
    }
  }, [watchedMovies, isLoaded])

  // Add or update a movie in the continue watching list
  const addToWatchedMovies = (movie: Movie, currentTime: number, duration: number, autoSave = true) => {
    const progress = Math.round((currentTime / duration) * 100)

    setWatchedMovies((prev) => {
      // Check if movie already exists
      const exists = prev.findIndex((m) => m.id === movie.id)

      let updated: WatchedMovie[]

      if (exists !== -1) {
        // Update existing movie
        updated = [...prev]
        updated[exists] = {
          ...updated[exists],
          progress,
          lastWatched: Date.now(),
          currentTime,
          duration,
        }
      } else {
        // Add new movie
        const newMovie: WatchedMovie = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          progress,
          lastWatched: Date.now(),
          currentTime,
          duration,
        }

        updated = [newMovie, ...prev].slice(0, MAX_ITEMS)
      }

      // Sort by last watched
      return updated.sort((a, b) => b.lastWatched - a.lastWatched)
    })

    // Auto save to localStorage
    if (autoSave && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedMovies))
      } catch (error) {
        console.error("Error auto-saving watched movies:", error)
      }
    }
  }

  // Remove a movie from the continue watching list
  const removeFromWatchedMovies = (movieId: number) => {
    setWatchedMovies((prev) => prev.filter((movie) => movie.id !== movieId))
  }

  // Clear all watched movies
  const clearWatchedMovies = () => {
    setWatchedMovies([])
  }

  return {
    watchedMovies,
    isLoaded,
    addToWatchedMovies,
    removeFromWatchedMovies,
    clearWatchedMovies,
  }
}
