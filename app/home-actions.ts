"use server"

import { fetchPopularMovies, fetchMovieDetails } from "@/lib/tmdb-api"

// Fetch popular movies for home page
export async function getPopularMovies(language = "en-US") {
  return fetchPopularMovies(language)
}

// Fetch movie details for home hero
export async function getMovieDetails(movieId: number, language = "en-US") {
  return fetchMovieDetails(movieId, language)
}
