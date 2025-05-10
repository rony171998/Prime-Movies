import type { CastMember } from "@/lib/tmdb"
import { ActorCard } from "./actor-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface MovieCastProps {
  cast: CastMember[]
  title?: string
}

export function MovieCast({ cast, title = "Top Cast" }: MovieCastProps) {
  // Sort cast by order and take the first 20
  const topCast = [...cast].sort((a, b) => a.order - b.order).slice(0, 20)

  return (
    <div className="my-6">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-4 p-1">
          {topCast.map((actor) => (
            <ActorCard key={actor.id} actor={actor} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
