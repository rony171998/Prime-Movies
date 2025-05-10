import { type Movie, getImageUrl, getYearFromDate } from "@/lib/tmdb"
import Image from "next/image"
import Link from "next/link"

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`} className="group">
      <div className="overflow-hidden rounded-lg transition-all duration-300 group-hover:shadow-lg">
        <Image
          src={getImageUrl(movie.poster_path, "w342") || "/placeholder.svg"}
          alt={movie.title}
          width={342}
          height={513}
          className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-2">
        <h3 className="font-semibold line-clamp-1 group-hover:text-primary">{movie.title}</h3>
        {movie.release_date && <p className="text-sm text-muted-foreground">{getYearFromDate(movie.release_date)}</p>}
      </div>
    </Link>
  )
}
