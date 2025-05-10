"use server"

import { getMovieDetails } from "@/lib/tmdb-api"

export async function fetchMovieDetailsForHero(movieId: number) {
  return getMovieDetails(movieId)
}
