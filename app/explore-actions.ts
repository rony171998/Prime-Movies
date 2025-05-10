"use server"

import { getTrendingMovies, getPopularMovies, getTopRatedMovies, searchMovies } from "@/lib/tmdb-api"

export async function fetchTrendingMovies(page = 1) {
  return getTrendingMovies(page)
}

export async function fetchPopularMovies(page = 1) {
  return getPopularMovies(page)
}

export async function fetchTopRatedMovies(page = 1) {
  return getTopRatedMovies(page)
}

export async function searchMoviesAction(query: string, page = 1) {
  return searchMovies(query, page)
}
