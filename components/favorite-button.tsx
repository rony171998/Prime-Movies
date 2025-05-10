"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import type { Movie } from "@/lib/tmdb"

interface FavoriteButtonProps {
  movie: Movie
  variant?: "icon" | "button"
  size?: "sm" | "md" | "lg"
  guestSessionId?: string | null
}

export function FavoriteButton({ movie, variant = "button", size = "md", guestSessionId }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite: toggleLocalFavorite } = useFavorites()
  const [isLoading, setIsLoading] = useState(false)
  const [isFav, setIsFav] = useState(false)

  // Load initial favorite state
  useEffect(() => {
    setIsFav(isFavorite(movie.id))
  }, [movie.id, isFavorite])

  const handleToggleFavorite = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      // Toggle local state
      const newFavoriteState = toggleLocalFavorite(movie)
      setIsFav(newFavoriteState)
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={`rounded-full p-2 transition-colors ${
          isFav ? "text-red-500 hover:text-red-400" : "text-white hover:text-red-400"
        }`}
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart size={size === "sm" ? 16 : size === "md" ? 20 : 24} className={isFav ? "fill-current" : ""} />
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      className="flex flex-col items-center gap-1 hover:bg-zinc-800"
      onClick={handleToggleFavorite}
      disabled={isLoading}
    >
      <Heart size={20} className={isFav ? "text-red-500 fill-red-500" : ""} />
      <span className="text-xs">{isFav ? "Favorited" : "Favorite"}</span>
    </Button>
  )
}
