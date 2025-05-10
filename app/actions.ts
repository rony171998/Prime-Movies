"use server"

import { cookies } from "next/headers"
import { createGuestSession, rateMovie as tmdbRateMovie, getRatedMovies as tmdbGetRatedMovies } from "@/lib/tmdb-api"
import { revalidatePath } from "next/cache"

const GUEST_SESSION_COOKIE = "tmdb_guest_session"
const GUEST_SESSION_EXPIRY = 60 * 60 * 24 * 7 // 7 days in seconds
const TMDB_ACCOUNT_ID = "21961044" // The account ID provided by the user

export async function refreshPage() {
  // This is a simple server action that doesn't do anything
  // but will cause the page to refresh when called
  return { success: true }
}

export async function createGuestSessionAction() {
  const cookieStore = cookies()
  const existingSession = cookieStore.get(GUEST_SESSION_COOKIE)

  if (existingSession) {
    return { success: true, guestSessionId: existingSession.value }
  }

  const session = await createGuestSession()

  if (!session || !session.success) {
    return { success: false, error: "Failed to create guest session" }
  }

  // Calculate expiry date from the API response
  const expiresAt = new Date(session.expires_at).getTime()
  const now = new Date().getTime()
  const maxAge = Math.floor((expiresAt - now) / 1000) // Convert to seconds

  // Set the cookie with the guest session ID
  cookieStore.set(GUEST_SESSION_COOKIE, session.guest_session_id, {
    maxAge: maxAge > 0 ? maxAge : GUEST_SESSION_EXPIRY,
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  })

  revalidatePath("/")
  return { success: true, guestSessionId: session.guest_session_id }
}

export async function getGuestSessionId() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(GUEST_SESSION_COOKIE)
  return sessionCookie?.value || null
}

export async function rateMovie(movieId: number, rating: number) {
  const guestSessionId = await getGuestSessionId()

  if (!guestSessionId) {
    const session = await createGuestSessionAction()
    if (!session.success) {
      return { success: false, error: "No guest session available" }
    }
  }

  const updatedSessionId = await getGuestSessionId()
  if (!updatedSessionId) {
    return { success: false, error: "Failed to create guest session" }
  }

  try {
    const success = await tmdbRateMovie(movieId, rating, updatedSessionId)

    if (success) {
      revalidatePath(`/watch?id=${movieId}`)
      revalidatePath(`/rated-movies`)
    }

    return { success }
  } catch (error) {
    console.error("Error rating movie:", error)
    return { success: false, error: "Failed to rate movie on the server" }
  }
}

export async function getRatedMovies() {
  const guestSessionId = await getGuestSessionId()

  if (!guestSessionId) {
    return { success: false, movies: [], error: "No guest session available" }
  }

  try {
    const movies = await tmdbGetRatedMovies(guestSessionId)
    return { success: true, movies }
  } catch (error) {
    console.error("Error fetching rated movies:", error)
    return {
      success: false,
      movies: [],
      error: "Failed to fetch rated movies from the server",
    }
  }
}

export async function clearGuestSession() {
  const cookieStore = cookies()
  cookieStore.delete(GUEST_SESSION_COOKIE)
  revalidatePath("/")
  return { success: true }
}
