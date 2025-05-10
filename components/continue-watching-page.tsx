"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, X, Clock, Trash2 } from "lucide-react"
import { getImageUrl } from "@/lib/tmdb"
import { useContinueWatching } from "@/hooks/use-continue-watching"
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

export function ContinueWatchingPage() {
  const { watchedMovies, removeFromWatchedMovies, clearWatchedMovies, isLoaded } = useContinueWatching()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    )
  }

  if (watchedMovies.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Your continue watching list is empty</h2>
        <p className="text-gray-400 mb-6">Start watching movies to see them appear here</p>
        <Link href="/">
          <Button className="bg-teal-500 hover:bg-teal-600">Browse Movies</Button>
        </Link>
      </div>
    )
  }

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Continue Watching</h2>
        {watchedMovies.length > 0 && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchedMovies.map((movie) => (
          <div key={movie.id} className="bg-zinc-900 rounded-lg overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={getImageUrl(movie.poster_path, "w500") || "/placeholder.svg?height=300&width=500"}
                alt={movie.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-medium mb-1">{movie.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock size={14} />
                  <span>{formatDate(movie.lastWatched)}</span>
                </div>
              </div>
              <Link
                href={`/watch?id=${movie.id}&t=${movie.currentTime}`}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-colors"
              >
                <Play size={24} className="ml-1" />
              </Link>
              <button
                onClick={() => removeFromWatchedMovies(movie.id)}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70 transition-colors"
                title="Remove from list"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                <span>
                  {formatTime(movie.currentTime)} / {formatTime(movie.duration)}
                </span>
                <span>{movie.progress}% completed</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400" style={{ width: `${movie.progress}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear watch history?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will remove all items from your continue watching list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                clearWatchedMovies()
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
