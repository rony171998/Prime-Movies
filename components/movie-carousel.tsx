"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getImageUrl, getYearFromDate, type Movie } from "@/lib/tmdb"

interface MovieCarouselProps {
  title: string
  movies: Movie[]
  isLoading?: boolean
}

export function MovieCarousel({ title, movies, isLoading = false }: MovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return

    const { scrollLeft, clientWidth } = carouselRef.current
    const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75

    carouselRef.current.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    if (!carouselRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setShowLeftButton(scrollLeft > 0)
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
  }

  if (isLoading) {
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-muted aspect-[2/3] animate-pulse">
                <div className="w-full h-full bg-zinc-700"></div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return null
  }

  return (
    <div className="mb-10 relative">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      {/* Carousel Navigation Buttons */}
      {showLeftButton && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 glass hover:glass-darker text-foreground rounded-full p-3 -ml-4"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {showRightButton && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 glass hover:glass-darker text-foreground rounded-full p-3 -mr-4"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Carousel Content */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
        onScroll={handleScroll}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie) => (
          <Link href={`/watch?id=${movie.id}`} key={movie.id} className="flex-none w-[180px]">
            <div className="rounded-3xl overflow-hidden glass-lighter aspect-[2/3] group relative">
              <Image
                src={getImageUrl(movie.poster_path, "w500") || "/placeholder.svg?height=270&width=180"}
                alt={movie.title}
                width={180}
                height={270}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center p-4">
                  <h3 className="font-medium text-foreground mb-1 text-sm line-clamp-2">{movie.title}</h3>
                  <p className="text-xs text-gray-300">{getYearFromDate(movie.release_date)}</p>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs border-white/30 text-foreground"
                    >
                      <Play size={12} className="mr-1" /> Watch
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium line-clamp-1">{movie.title}</h3>
              <div className="flex items-center mt-1">
                <div className="flex items-center text-yellow-400 mr-2">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  <span className="text-xs ml-1">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-xs text-gray-400">{getYearFromDate(movie.release_date)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
