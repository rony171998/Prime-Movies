"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getImageUrl, getYearFromDate, getTmdbOptions } from "@/lib/tmdb"
import { useLanguage } from "@/contexts/language-context"

interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date: string
  vote_average: number
}

interface SearchResultsProps {
  results: Movie[]
  isLoading: boolean
  onClose: () => void
}

const SearchResults = ({ results, isLoading, onClose }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="absolute top-full mt-2 right-0 w-96 max-w-full glass-darker rounded-2xl shadow-lg p-4 z-50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Searching...</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-teal-400" />
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="absolute top-full mt-2 right-0 w-96 max-w-full glass-darker rounded-2xl shadow-lg p-4 z-50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">No results found</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-400 py-4">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="absolute top-full mt-2 right-0 w-96 max-w-full glass-darker rounded-2xl shadow-lg p-4 z-50 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Search Results</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-800"
        >
          <X size={18} />
        </button>
      </div>
      <div className="space-y-3">
        {results.map((movie) => (
          <Link
            href={`/watch?id=${movie.id}`}
            key={movie.id}
            className="flex gap-3 p-3 rounded-xl hover:glass-lighter transition-colors"
            onClick={onClose}
          >
            <div className="w-16 h-24 bg-zinc-800 dark:bg-zinc-800 light:bg-gray-200 rounded overflow-hidden flex-shrink-0">
              <Image
                src={getImageUrl(movie.poster_path, "w200") || "/placeholder.svg?height=96&width=64"}
                alt={movie.title}
                width={64}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-1">{movie.title}</h4>
              <p className="text-xs text-gray-400 mb-1">
                {movie.release_date ? getYearFromDate(movie.release_date) : "Unknown year"}
              </p>
              <p className="text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 line-clamp-3">
                {movie.overview || "No overview available"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function MovieSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { languageCode } = useLanguage()

  // Handle search query
  useEffect(() => {
    const searchMovies = async () => {
      if (!query.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
            query,
          )}&include_adult=false&language=${languageCode}&page=1`,
          getTmdbOptions(languageCode),
        )

        if (!response.ok) {
          throw new Error(`TMDB API request failed with status ${response.status}`)
        }

        const data = await response.json()
        setResults(data.results.slice(0, 10)) // Limit to 10 results for better UX
      } catch (error) {
        console.error("Error searching movies:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchMovies()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query, languageCode])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchFocus = () => {
    setIsOpen(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (e.target.value.trim()) {
      setIsOpen(true)
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center glass rounded-full px-4 py-2">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          className="bg-transparent text-foreground w-full focus:outline-none text-sm"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-800 ml-2"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (query.trim() || isLoading) && (
        <SearchResults results={results} isLoading={isLoading} onClose={() => setIsOpen(false)} />
      )}
    </div>
  )
}
