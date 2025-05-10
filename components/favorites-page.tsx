"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Trash2 } from "lucide-react"
import { getImageUrl, getYearFromDate } from "@/lib/tmdb"
import { useFavorites } from "@/hooks/use-favorites"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/favorite-button"
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

interface FavoritesPageProps {
  guestSessionId: string | null
}

export function FavoritesPage({ guestSessionId }: FavoritesPageProps) {
  const { favoriteMovies, clearFavorites, isLoaded } = useFavorites()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
      </div>
    )
  }

  if (favoriteMovies.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Your favorites list is empty</h2>
        <p className="text-gray-400 mb-6">Add movies to your favorites to see them here</p>
        <Link href="/">
          <Button className="bg-teal-500 hover:bg-teal-600">Browse Movies</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Favorite Movies</h2>
        {favoriteMovies.length > 0 && (
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {favoriteMovies.map((movie) => (
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
            <div className="absolute top-2 right-2">
              <FavoriteButton movie={movie} variant="icon" guestSessionId={guestSessionId} />
            </div>
            <h3 className="mt-2 text-sm font-medium line-clamp-1">{movie.title}</h3>
            <div className="flex items-center mt-1">
              <div className="flex items-center text-yellow-400 mr-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-xs ml-1">{movie.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-400">{getYearFromDate(movie.release_date)}</span>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear favorites?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will remove all movies from your favorites list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                clearFavorites()
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
