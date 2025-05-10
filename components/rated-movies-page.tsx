"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Trash2, Star } from "lucide-react"
import { getImageUrl, getYearFromDate, type RatedMovie } from "@/lib/tmdb"
import { useRatedMovies } from "@/hooks/use-rated-movies"
import { getRatedMovies } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RatedMoviesPageProps {
  guestSessionId: string | null
}

export function RatedMoviesPage({ guestSessionId }: RatedMoviesPageProps) {
  const { ratedMovies, clearRatings, isLoaded } = useRatedMovies()
  const [serverRatedMovies, setServerRatedMovies] = useState<RatedMovie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"date" | "rating" | "title">("date")
  const [apiError, setApiError] = useState<string | null>(null)

  // Fetch rated movies from server if we have a guest session
  useEffect(() => {
    const fetchRatedMovies = async () => {
      if (!guestSessionId) {
        setIsLoading(false)
        return
      }

      try {
        const result = await getRatedMovies()
        if (result.success) {
          setServerRatedMovies(result.movies)
        } else if (result.error) {
          setApiError(result.error)
          console.error("API Error:", result.error)
        }
      } catch (error) {
        console.error("Error fetching rated movies:", error)
        setApiError("Failed to fetch rated movies from the server")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRatedMovies()
  }, [guestSessionId])

  // Combine local and server rated movies, removing duplicates
  const allRatedMovies = [...ratedMovies]
  if (guestSessionId && serverRatedMovies.length > 0) {
    serverRatedMovies.forEach((movie) => {
      if (!allRatedMovies.some((m) => m.id === movie.id)) {
        allRatedMovies.push(movie)
      }
    })
  }

  // Sort rated movies
  const sortedRatedMovies = [...allRatedMovies].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title)
    } else {
      // Default sort by date (newest first)
      return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    }
  })

  if (isLoading || !isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    )
  }

  if (allRatedMovies.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">You haven't rated any movies yet</h2>
        <p className="text-gray-400 mb-6">
          {apiError
            ? "We couldn't fetch your ratings from the server, but you can still rate movies locally."
            : "Rate movies to see them appear here"}
        </p>
        <Link href="/">
          <Button className="bg-teal-500 hover:bg-teal-600">Browse Movies</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Rated Movies</h2>
        <div className="flex gap-4">
          <div className="w-48">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {allRatedMovies.length > 0 && (
            <Button
              variant="outline"
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
              onClick={() => setIsDialogOpen(true)}
            >
              <Trash2 size={16} className="mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {apiError && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-md p-4 mb-6">
          <p className="text-red-400 text-sm">{apiError} Your local ratings are still available.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sortedRatedMovies.map((movie) => (
          <div key={movie.id} className="group relative">
            <Link href={`/watch?id=${movie.id}`}>
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
                      <Button size="sm" variant="outline" className="rounded-full text-xs border-white/30 text-white">
                        <Play size={12} className="mr-1" /> Watch
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1 flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-white">{movie.rating}/10</span>
            </div>
            <h3 className="mt-2 text-sm font-medium line-clamp-1">{movie.title}</h3>
            <div className="flex items-center mt-1">
              <div className="flex items-center text-yellow-400 mr-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-xs ml-1">{movie.vote_average?.toFixed(1) || "N/A"}</span>
              </div>
              <span className="text-xs text-gray-400">{getYearFromDate(movie.release_date)}</span>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear ratings?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will remove all your movie ratings from local storage. This action cannot be undone.
              {guestSessionId && " Note: Ratings saved to your guest session on the server will not be affected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                clearRatings()
                setIsDialogOpen(false)
              }}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
