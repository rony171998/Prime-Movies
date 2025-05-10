"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Search, Filter, Play, X, Loader2, ChevronRight, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getImageUrl, getYearFromDate, type Movie, type Genre } from "@/lib/tmdb"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "@/contexts/theme-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getTrendingMovies, getMoviesByGenre, searchMoviesAction, discoverMoviesAction } from "@/app/explore-actions"

interface ExplorePageClientProps {
  initialGenres: Genre[]
  initialTrendingMovies: Movie[]
  initialTrendingTotalPages: number
  guestSessionId: string | null
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than our max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include first page
      pageNumbers.push(1)

      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4)
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3)
      }

      // Add ellipsis if needed before middle pages
      if (start > 2) {
        pageNumbers.push("...")
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis if needed after middle pages
      if (end < totalPages - 1) {
        pageNumbers.push("...")
      }

      // Always include last page if we have more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        className="bg-zinc-800 border-zinc-700 text-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-white light:bg-gray-200 light:border-gray-300 light:text-gray-800"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </Button>

      {pageNumbers.map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          className={
            page === currentPage
              ? "bg-teal-500 hover:bg-teal-600 text-white"
              : "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white light:bg-gray-200 light:border-gray-300 light:text-gray-800"
          }
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={typeof page !== "number"}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="bg-zinc-800 border-zinc-700 text-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-white light:bg-gray-200 light:border-gray-300 light:text-gray-800"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  )
}

export function ExplorePageClient({
  initialGenres,
  initialTrendingMovies,
  initialTrendingTotalPages,
  guestSessionId,
}: ExplorePageClientProps) {
  const { languageCode } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [genres, setGenres] = useState<Genre[]>(initialGenres)
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>(initialTrendingMovies)
  const [trendingTimeWindow, setTrendingTimeWindow] = useState<"day" | "week">("day")
  const [genreMovies, setGenreMovies] = useState<Record<number, Movie[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [sortBy, setSortBy] = useState("popularity.desc")
  const [yearFilter, setYearFilter] = useState<string>("any")
  const [ratingFilter, setRatingFilter] = useState<string>("")
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [activeTab, setActiveTab] = useState("trending")

  // Pagination state
  const [trendingPage, setTrendingPage] = useState(1)
  const [trendingTotalPages, setTrendingTotalPages] = useState(initialTrendingTotalPages)
  const [genrePages, setGenrePages] = useState<Record<number, number>>({})
  const [genreTotalPages, setGenreTotalPages] = useState<Record<number, number>>({})
  const [searchPage, setSearchPage] = useState(1)
  const [searchTotalPages, setSearchTotalPages] = useState(1)
  const [discoverPage, setDiscoverPage] = useState(1)
  const [discoverTotalPages, setDiscoverTotalPages] = useState(1)

  // Only show the toggle after hydration to avoid SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch trending movies when time window or page changes
  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true)
      try {
        const { results, totalPages } = await getTrendingMovies(trendingTimeWindow, trendingPage, languageCode)
        setTrendingMovies(results)
        setTrendingTotalPages(totalPages)
      } catch (error) {
        console.error("Error fetching trending movies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrending()
  }, [trendingTimeWindow, trendingPage, languageCode])

  // Fetch movies for a specific genre
  const loadGenreMovies = async (genreId: number, page = 1) => {
    setIsLoading(true)
    try {
      const { results, totalPages } = await getMoviesByGenre(genreId, page, languageCode)
      setGenreMovies((prev) => ({
        ...prev,
        [genreId]: results,
      }))
      setGenreTotalPages((prev) => ({
        ...prev,
        [genreId]: totalPages,
      }))
    } catch (error) {
      console.error(`Error fetching movies for genre ${genreId}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle genre selection
  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId)
      } else {
        // Load movies for this genre if not already loaded
        if (!genreMovies[genreId] || genreMovies[genreId].length === 0) {
          loadGenreMovies(genreId)
        }
        // Initialize pagination for this genre
        if (!genrePages[genreId]) {
          setGenrePages((prev) => ({ ...prev, [genreId]: 1 }))
        }
        return [...prev, genreId]
      }
    })
  }

  // Handle genre page change
  const handleGenrePageChange = (genreId: number, page: number) => {
    setGenrePages((prev) => ({ ...prev, [genreId]: page }))
    loadGenreMovies(genreId, page)
  }

  // Handle search
  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setActiveTab("search")
    setSearchPage(page)

    try {
      const { results, totalPages } = await searchMoviesAction(searchQuery, page, languageCode)
      setSearchResults(results)
      setSearchTotalPages(totalPages)
    } catch (error) {
      console.error("Error searching movies:", error)
      setSearchResults([])
      setSearchTotalPages(1)
    } finally {
      setIsSearching(false)
    }
  }

  // Apply filters
  const applyFilters = async (page = 1) => {
    setIsLoading(true)
    setActiveTab("discover")
    setIsFilterDialogOpen(false)
    setDiscoverPage(page)

    try {
      const { results, totalPages } = await discoverMoviesAction(
        {
          sortBy,
          year: yearFilter,
          withGenres: selectedGenres,
          ratingFilter,
          page,
        },
        languageCode,
      )

      setFilteredMovies(results)
      setDiscoverTotalPages(totalPages)
    } catch (error) {
      console.error("Error applying filters:", error)
      setFilteredMovies([])
      setDiscoverTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedGenres([])
    setSortBy("popularity.desc")
    setYearFilter("any")
    setRatingFilter("any")
    setFilteredMovies([])
    setDiscoverPage(1)
    setDiscoverTotalPages(1)
  }

  // Generate years for filter dropdown (current year down to 1990)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i)

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* Header */}
      <header
        className={`p-4 flex items-center justify-between rounded-3xl m-3 ${theme === "dark" ? "glass-darker" : "bg-white shadow-md"}`}
      >
        <div className="flex items-center">
          <Link
            href="/home"
            className={`${theme === "dark" ? "text-white hover:text-teal-400" : "text-gray-800 hover:text-teal-600"} transition-colors`}
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="ml-4 text-lg font-medium">Explore</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search movies..."
              className={`pl-9 ${theme === "dark" ? "bg-zinc-800 border-zinc-700 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              size={16}
            />
            {searchQuery && (
              <button
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                onClick={() => setSearchQuery("")}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className={`${theme === "dark" ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-gray-300 text-gray-800"}`}
            onClick={() => handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>

          {/* Enhanced Theme Toggle with Tooltip */}
          {mounted && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    className={`rounded-full transition-all duration-200 ${
                      theme === "dark"
                        ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-yellow-300"
                        : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-indigo-600"
                    }`}
                    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {theme === "dark" ? (
                      <Sun size={18} className="transition-transform hover:rotate-45 duration-300" />
                    ) : (
                      <Moon size={18} className="transition-transform hover:scale-110 duration-300" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Filter Dialog */}
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`${theme === "dark" ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-gray-300 text-gray-800"}`}
              >
                <Filter size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent
              className={`${theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-gray-200 text-gray-900"}`}
            >
              <DialogHeader>
                <DialogTitle>Filter Movies</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Sort By */}
                <div className="space-y-2">
                  <Label htmlFor="sort-by">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger
                      id="sort-by"
                      className={`${theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-gray-100 border-gray-300"}`}
                    >
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent
                      className={`${theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                    >
                      <SelectItem value="popularity.desc">Popularity (Desc)</SelectItem>
                      <SelectItem value="popularity.asc">Popularity (Asc)</SelectItem>
                      <SelectItem value="vote_average.desc">Rating (Desc)</SelectItem>
                      <SelectItem value="vote_average.asc">Rating (Asc)</SelectItem>
                      <SelectItem value="release_date.desc">Release Date (Desc)</SelectItem>
                      <SelectItem value="release_date.asc">Release Date (Asc)</SelectItem>
                      <SelectItem value="revenue.desc">Revenue (Desc)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Filter */}
                <div className="space-y-2">
                  <Label htmlFor="year-filter">Release Year</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger
                      id="year-filter"
                      className={`${theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-gray-100 border-gray-300"}`}
                    >
                      <SelectValue placeholder="Any Year" />
                    </SelectTrigger>
                    <SelectContent
                      className={`${theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-gray-200 text-gray-900"} max-h-60`}
                    >
                      <SelectItem value="any">Any Year</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <Label htmlFor="rating-filter">Minimum Rating</Label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger
                      id="rating-filter"
                      className={`${theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-gray-100 border-gray-300"}`}
                    >
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent
                      className={`${theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                    >
                      <SelectItem value="any">Any Rating</SelectItem>
                      <SelectItem value="9.0">9+</SelectItem>
                      <SelectItem value="8.0">8+</SelectItem>
                      <SelectItem value="7">7+</SelectItem>
                      <SelectItem value="6">6+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Genre Selection */}
                <div className="space-y-2">
                  <Label>Genres</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                    {genres.map((genre) => (
                      <div key={genre.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre.id}`}
                          checked={selectedGenres.includes(genre.id)}
                          onCheckedChange={() => toggleGenre(genre.id)}
                        />
                        <Label htmlFor={`genre-${genre.id}`} className="text-sm cursor-pointer">
                          {genre.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    className={`${theme === "dark" ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-gray-300 text-gray-800"}`}
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => applyFilters()}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Genre Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {genres.slice(0, 15).map((genre) => (
            <Badge
              key={genre.id}
              variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
              className={`cursor-pointer rounded-full px-3 py-1.5 ${
                selectedGenres.includes(genre.id)
                  ? "bg-teal-500/80 backdrop-filter backdrop-blur-sm hover:bg-teal-600/90 text-white"
                  : theme === "dark"
                    ? "glass text-white hover:glass-lighter"
                    : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
              }`}
              onClick={() => {
                toggleGenre(genre.id)
                if (!selectedGenres.includes(genre.id)) {
                  setActiveTab("genres")
                }
              }}
            >
              {genre.name}
            </Badge>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge
                variant="outline"
                className={`cursor-pointer ${
                  theme === "dark"
                    ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
                }`}
              >
                More...
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={`${theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-gray-200 text-gray-900"} max-h-60 overflow-y-auto`}
            >
              {genres.slice(15).map((genre) => (
                <DropdownMenuItem
                  key={genre.id}
                  className={`cursor-pointer ${
                    selectedGenres.includes(genre.id)
                      ? theme === "dark"
                        ? "bg-zinc-800 text-teal-400"
                        : "bg-gray-100 text-teal-600"
                      : ""
                  }`}
                  onClick={() => {
                    toggleGenre(genre.id)
                    if (!selectedGenres.includes(genre.id)) {
                      setActiveTab("genres")
                    }
                  }}
                >
                  {genre.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className={`${theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-gray-100 border-gray-300"}`}>
            <TabsTrigger
              value="trending"
              className={`${theme === "dark" ? "text-white" : "text-gray-800"} data-[state=active]:bg-teal-500 data-[state=active]:text-white`}
            >
              Trending
            </TabsTrigger>
            {selectedGenres.length > 0 && (
              <TabsTrigger
                value="genres"
                className={`${theme === "dark" ? "text-white" : "text-gray-800"} data-[state=active]:bg-teal-500 data-[state=active]:text-white`}
              >
                Genres
              </TabsTrigger>
            )}
            {searchResults.length > 0 && (
              <TabsTrigger
                value="search"
                className={`${theme === "dark" ? "text-white" : "text-gray-800"} data-[state=active]:bg-teal-500 data-[state=active]:text-white`}
              >
                Search Results
              </TabsTrigger>
            )}
            {filteredMovies.length > 0 && (
              <TabsTrigger
                value="discover"
                className={`${theme === "dark" ? "text-white" : "text-gray-800"} data-[state=active]:bg-teal-500 data-[state=active]:text-white`}
              >
                Discover
              </TabsTrigger>
            )}
          </TabsList>

          {/* Trending Tab Content */}
          <TabsContent value="trending" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Trending Movies</h2>
              <div className="flex gap-2">
                <Button
                  variant={trendingTimeWindow === "day" ? "default" : "outline"}
                  size="sm"
                  className={
                    trendingTimeWindow === "day"
                      ? "bg-teal-500 hover:bg-teal-600 text-white"
                      : theme === "dark"
                        ? "bg-zinc-800 border-zinc-700 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                  }
                  onClick={() => {
                    setTrendingTimeWindow("day")
                    setTrendingPage(1) // Reset to page 1 when changing time window
                  }}
                >
                  Today
                </Button>
                <Button
                  variant={trendingTimeWindow === "week" ? "default" : "outline"}
                  size="sm"
                  className={
                    trendingTimeWindow === "week"
                      ? "bg-teal-500 hover:bg-teal-600 text-white"
                      : theme === "dark"
                        ? "bg-zinc-800 border-zinc-700 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                  }
                  onClick={() => {
                    setTrendingTimeWindow("week")
                    setTrendingPage(1) // Reset to page 1 when changing time window
                  }}
                >
                  This Week
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {isLoading ? (
                // Loading skeletons
                Array(12)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-lg overflow-hidden aspect-[2/3] animate-pulse ${
                        theme === "dark" ? "bg-zinc-800" : "bg-gray-200"
                      }`}
                    >
                      <div className={`w-full h-full ${theme === "dark" ? "bg-zinc-700" : "bg-gray-300"}`}></div>
                    </div>
                  ))
              ) : trendingMovies.length > 0 ? (
                // Display trending movies
                trendingMovies.map((movie) => <MovieCard key={movie.id} movie={movie} theme={theme} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>No trending movies found</p>
                </div>
              )}
            </div>

            {/* Pagination for trending movies */}
            {trendingTotalPages > 1 && (
              <Pagination
                currentPage={trendingPage}
                totalPages={trendingTotalPages}
                onPageChange={(page) => setTrendingPage(page)}
              />
            )}
          </TabsContent>

          {/* Genres Tab Content */}
          <TabsContent value="genres" className="mt-6">
            {selectedGenres.map((genreId) => {
              const genre = genres.find((g) => g.id === genreId)
              const movies = genreMovies[genreId] || []
              const currentPage = genrePages[genreId] || 1
              const totalPages = genreTotalPages[genreId] || 1

              return (
                <div key={genreId} className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">{genre?.name}</h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {!genreMovies[genreId] ? (
                      // Loading skeletons
                      Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-lg overflow-hidden aspect-[2/3] animate-pulse ${
                              theme === "dark" ? "bg-zinc-800" : "bg-gray-200"
                            }`}
                          >
                            <div className={`w-full h-full ${theme === "dark" ? "bg-zinc-700" : "bg-gray-300"}`}></div>
                          </div>
                        ))
                    ) : movies.length > 0 ? (
                      // Display genre movies
                      movies.map((movie) => <MovieCard key={movie.id} movie={movie} theme={theme} />)
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                          No movies found for this genre
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pagination for genre movies */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => handleGenrePageChange(genreId, page)}
                    />
                  )}
                </div>
              )
            })}
          </TabsContent>

          {/* Search Results Tab Content */}
          <TabsContent value="search" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {isSearching ? (
                // Loading skeletons
                Array(12)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-lg overflow-hidden aspect-[2/3] animate-pulse ${
                        theme === "dark" ? "bg-zinc-800" : "bg-gray-200"
                      }`}
                    >
                      <div className={`w-full h-full ${theme === "dark" ? "bg-zinc-700" : "bg-gray-300"}`}></div>
                    </div>
                  ))
              ) : searchResults.length > 0 ? (
                // Display search results
                searchResults.map((movie) => <MovieCard key={movie.id} movie={movie} theme={theme} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                    No movies found matching your search
                  </p>
                </div>
              )}
            </div>

            {/* Pagination for search results */}
            {searchTotalPages > 1 && (
              <Pagination
                currentPage={searchPage}
                totalPages={searchTotalPages}
                onPageChange={(page) => handleSearch(page)}
              />
            )}
          </TabsContent>

          {/* Discover Tab Content */}
          <TabsContent value="discover" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Discover Movies</h2>
              <Button
                variant="outline"
                size="sm"
                className={
                  theme === "dark" ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-gray-300 text-gray-800"
                }
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <Filter size={16} className="mr-2" /> Edit Filters
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {isLoading ? (
                // Loading skeletons
                Array(12)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-lg overflow-hidden aspect-[2/3] animate-pulse ${
                        theme === "dark" ? "bg-zinc-800" : "bg-gray-200"
                      }`}
                    >
                      <div className={`w-full h-full ${theme === "dark" ? "bg-zinc-700" : "bg-gray-300"}`}></div>
                    </div>
                  ))
              ) : filteredMovies.length > 0 ? (
                // Display filtered movies
                filteredMovies.map((movie) => <MovieCard key={movie.id} movie={movie} theme={theme} />)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                    No movies found matching your filters
                  </p>
                </div>
              )}
            </div>

            {/* Pagination for discover results */}
            {discoverTotalPages > 1 && (
              <Pagination
                currentPage={discoverPage}
                totalPages={discoverTotalPages}
                onPageChange={(page) => applyFilters(page)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Movie Card Component
function MovieCard({ movie, theme }: { movie: Movie; theme: "dark" | "light" }) {
  return (
    <Link href={`/watch?id=${movie.id}`} key={movie.id}>
      <div
        className={`rounded-3xl overflow-hidden aspect-[2/3] group relative ${
          theme === "dark" ? "glass-lighter" : "bg-white shadow-md"
        }`}
      >
        <Image
          src={getImageUrl(movie.poster_path, "w500") || "/placeholder.svg?height=300&width=200"}
          alt={movie.title}
          width={200}
          height={300}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-center p-4">
            <h3 className="font-medium text-white mb-1 line-clamp-2">{movie.title}</h3>
            <p className="text-xs text-gray-300">{getYearFromDate(movie.release_date)}</p>
            <div className="mt-2">
              <Button size="sm" variant="outline" className="rounded-full text-xs border-white/30 text-white">
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="text-xs ml-1">{movie.vote_average?.toFixed(1) || "N/A"}</span>
          </div>
          <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {getYearFromDate(movie.release_date)}
          </span>
        </div>
      </div>
    </Link>
  )
}
