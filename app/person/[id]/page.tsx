import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTmdbOptions, getImageUrl } from "@/lib/tmdb"

interface PersonPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  try {
    const person = await fetchPersonDetails(params.id)
    return {
      title: `${person.name} - Actor Profile`,
      description: person.biography?.slice(0, 160) || `Details about ${person.name}`,
    }
  } catch (error) {
    return {
      title: "Actor Profile",
      description: "View actor details and filmography",
    }
  }
}

async function fetchPersonDetails(personId: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3/person/${personId}?append_to_response=movie_credits`,
    getTmdbOptions("en-US"),
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch person details: ${response.status}`)
  }

  return response.json()
}

export default async function PersonPage({ params }: PersonPageProps) {
  try {
    const person = await fetchPersonDetails(params.id)

    // Sort movie credits by release date (newest first)
    const sortedMovieCredits = person.movie_credits?.cast
      ? [...person.movie_credits.cast].sort((a, b) => {
          if (!a.release_date) return 1
          if (!b.release_date) return -1
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        })
      : []

    // Calculate age
    const calculateAge = () => {
      if (!person.birthday) return null

      const birthDate = new Date(person.birthday)
      let endDate = new Date()

      if (person.deathday) {
        endDate = new Date(person.deathday)
      }

      let age = endDate.getFullYear() - birthDate.getFullYear()
      const m = endDate.getMonth() - birthDate.getMonth()

      if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
        age--
      }

      return age
    }

    const age = calculateAge()

    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/home"
          className="inline-flex items-center text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 mb-6 transition-colors"
        >
          ← Back to Home
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left column - Image and personal info */}
          <div className="md:col-span-1">
            <div className="rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-zinc-800 shadow-md">
              {person.profile_path ? (
                <Image
                  src={getImageUrl(person.profile_path, "w500") || "/placeholder.svg"}
                  alt={person.name}
                  width={500}
                  height={750}
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-[2/3] flex items-center justify-center bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400">
                  No image available
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-800/50 rounded-2xl p-6 space-y-4 shadow-md border border-gray-100 dark:border-zinc-700/30">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Personal Info</h2>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">Known For</h3>
                <p className="text-gray-900 dark:text-white">{person.known_for_department || "Acting"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">Gender</h3>
                <p className="text-gray-900 dark:text-white">
                  {person.gender === 1 ? "Female" : person.gender === 2 ? "Male" : "Not specified"}
                </p>
              </div>

              {person.birthday && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">Birthday</h3>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(person.birthday).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {age !== null && ` (${age} years old)`}
                  </p>
                </div>
              )}

              {person.deathday && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">Died</h3>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(person.deathday).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {person.place_of_birth && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">Place of Birth</h3>
                  <p className="text-gray-900 dark:text-white">{person.place_of_birth}</p>
                </div>
              )}

              {person.also_known_as && person.also_known_as.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">Also Known As</h3>
                  <ul className="list-none text-gray-900 dark:text-white">
                    {person.also_known_as.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Bio and filmography */}
          <div className="md:col-span-3">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{person.name}</h1>

            {person.biography && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Biography</h2>
                <div className="space-y-4">
                  {person.biography.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="text-gray-700 dark:text-zinc-200 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Filmography</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sortedMovieCredits.map((movie) => (
                  <Link
                    href={`/watch?id=${movie.id}`}
                    key={`${movie.id}-${movie.credit_id}`}
                    className="bg-white dark:bg-zinc-800/50 rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors shadow-sm border border-gray-100 dark:border-zinc-700/30"
                  >
                    <div className="aspect-[2/3] relative">
                      {movie.poster_path ? (
                        <Image
                          src={getImageUrl(movie.poster_path, "w500") || "/placeholder.svg"}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-500 text-xs text-center p-2">
                          No image available
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1 text-gray-900 dark:text-white">{movie.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : "TBA"}
                      </p>
                      {movie.character && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 line-clamp-1">
                          as {movie.character}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}

                {sortedMovieCredits.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-zinc-400">
                    No movie credits found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading person details:", error)
    notFound()
  }
}
