import type { Movie } from "@/lib/tmdb"
import { MovieCard } from "./movie-card"

interface MovieGridProps {
  movies: Movie[]
  title?: string
}

export function MovieGrid({ movies, title }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="my-8 text-center">
        <h2 className="text-xl font-semibold">No movies found</h2>
      </div>
    )
  }

  return (
    <div className="my-8">
      {title && <h2 className="mb-4 text-2xl font-bold">{title}</h2>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
