import { fetchMovieDetails, getImageUrl, getYearFromDate } from "@/lib/tmdb"
import { MovieCast } from "@/components/movie-cast"
import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"

interface MoviePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const movieId = Number.parseInt(params.id)
  if (isNaN(movieId)) {
    return {
      title: "Movie Not Found",
    }
  }

  const movie = await fetchMovieDetails(movieId)
  if (!movie) {
    return {
      title: "Movie Not Found",
    }
  }

  return {
    title: `${movie.title} (${getYearFromDate(movie.release_date)}) | PrimeVision`,
    description: movie.overview || `Details about ${movie.title}`,
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movieId = Number.parseInt(params.id)
  if (isNaN(movieId)) {
    notFound()
  }

  const movie = await fetchMovieDetails(movieId)
  if (!movie) {
    notFound()
  }

  // Format runtime
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Movie Poster */}
        <div className="flex justify-center md:justify-start">
          <div className="overflow-hidden rounded-lg shadow-lg">
            <Image
              src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"}
              alt={movie.title}
              width={342}
              height={513}
              className="h-auto max-w-full object-cover"
              priority
            />
          </div>
        </div>

        {/* Movie Info */}
        <div className="md:col-span-2">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            {movie.title} <span className="text-muted-foreground">({getYearFromDate(movie.release_date)})</span>
          </h1>

          {movie.tagline && <p className="mb-4 text-lg italic text-muted-foreground">{movie.tagline}</p>}

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">Overview</h2>
            <p className="text-muted-foreground">{movie.overview}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Genres</h3>
                <p>{movie.genres.map((g) => g.name).join(", ")}</p>
              </div>
            )}

            {movie.runtime > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Runtime</h3>
                <p>{formatRuntime(movie.runtime)}</p>
              </div>
            )}

            {movie.status && (
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Status</h3>
                <p>{movie.status}</p>
              </div>
            )}

            {movie.vote_average > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Rating</h3>
                <p>{movie.vote_average.toFixed(1)} / 10</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && <MovieCast cast={movie.credits.cast} />}
    </div>
  )
}
