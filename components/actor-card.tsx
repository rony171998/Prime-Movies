import Image from "next/image"
import Link from "next/link"
import { getImageUrl } from "@/lib/tmdb"
import type { CastMember } from "@/lib/tmdb"

interface ActorCardProps {
  actor: CastMember
  size?: "small" | "medium" | "large"
}

export function ActorCard({ actor, size = "medium" }: ActorCardProps) {
  const sizeClasses = {
    small: {
      card: "w-24",
      image: "w-24 h-36",
      name: "text-xs",
      character: "text-xs",
    },
    medium: {
      card: "w-32",
      image: "w-32 h-48",
      name: "text-sm",
      character: "text-xs",
    },
    large: {
      card: "w-40",
      image: "w-40 h-60",
      name: "text-base",
      character: "text-sm",
    },
  }

  const classes = sizeClasses[size]

  return (
    <Link href={`/person/${actor.id}`} className={`${classes.card} flex flex-col gap-1 group`}>
      <div className="overflow-hidden rounded-lg transition-all duration-300 group-hover:shadow-lg">
        <Image
          src={getImageUrl(actor.profile_path, "w185") || "/placeholder.svg"}
          alt={actor.name}
          width={185}
          height={278}
          className={`${classes.image} object-cover transition-transform duration-300 group-hover:scale-105`}
        />
      </div>
      <div className="mt-1 flex flex-col">
        <span className={`${classes.name} font-semibold line-clamp-1 group-hover:text-primary`}>{actor.name}</span>
        {actor.character && (
          <span className={`${classes.character} text-muted-foreground line-clamp-1`}>{actor.character}</span>
        )}
      </div>
    </Link>
  )
}
