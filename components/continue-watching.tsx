"use client"
import Image from "next/image"
import Link from "next/link"
import { Play, MoreHorizontal } from "lucide-react"
import { getImageUrl } from "@/lib/tmdb"
import { useContinueWatching, type WatchedMovie } from "@/hooks/use-continue-watching"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ContinueWatching() {
  const { watchedMovies, removeFromWatchedMovies, isLoaded } = useContinueWatching()

  if (!isLoaded) {
    return (
      <div className="p-6 border-t border-zinc-800/30 mt-auto">
        <h3 className="text-sm font-medium mb-4">Continue Watching</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 glass-lighter rounded-xl overflow-hidden flex-shrink-0 animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (watchedMovies.length === 0) {
    return (
      <div className="p-6 border-t border-zinc-800/30 mt-auto">
        <h3 className="text-sm font-medium mb-4">Continue Watching</h3>
        <p className="text-sm text-gray-400">No movies in your watch history yet.</p>
      </div>
    )
  }

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Format remaining time
  const formatRemainingTime = (movie: WatchedMovie) => {
    const remainingSeconds = movie.duration - movie.currentTime
    return formatTime(remainingSeconds)
  }

  return (
    <div className="p-6 border-t border-zinc-800/30 mt-auto">
      <h3 className="text-sm font-medium mb-4">Continue Watching</h3>
      <div className="space-y-4">
        {watchedMovies.slice(0, 3).map((movie) => (
          <div key={movie.id} className="flex items-center gap-3 group relative">
            <div className="w-12 h-12 glass-lighter rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={getImageUrl(movie.poster_path, "w200") || "/placeholder.svg?height=48&width=48"}
                alt={movie.title}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{movie.title}</p>
              <div className="flex items-center gap-2">
                <div className="w-full h-1.5 glass-lighter rounded-full overflow-hidden flex-1">
                  <div className="h-full bg-teal-400" style={{ width: `${movie.progress}%` }}></div>
                </div>
                <span className="text-xs text-gray-400">{formatRemainingTime(movie)} left</span>
              </div>
            </div>

            <Link href={`/watch?id=${movie.id}&t=${movie.currentTime}`} className="text-white p-1">
              <Play size={16} />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-400 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-zinc-800 text-red-400"
                  onClick={() => removeFromWatchedMovies(movie.id)}
                >
                  Remove from list
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {watchedMovies.length > 3 && (
          <Link href="/continue-watching" className="text-sm text-teal-400 hover:underline block text-center mt-2">
            View all ({watchedMovies.length})
          </Link>
        )}
      </div>
    </div>
  )
}
