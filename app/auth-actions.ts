"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const TMDB_API_KEY = process.env.TMDB_API_KEY
const SESSION_COOKIE_NAME = "tmdb_session"
const ACCOUNT_COOKIE_NAME = "tmdb_account"
// Default session expiry: 30 days (in seconds)
const DEFAULT_SESSION_EXPIRY = 60 * 60 * 24 * 30

// Step 1: Create a request token
async function createRequestToken() {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    }

    const response = await fetch("https://api.themoviedb.org/3/authentication/token/new", options)

    if (!response.ok) {
      throw new Error(`Failed to create request token: ${response.status}`)
    }

    const data = await response.json()
    return data.request_token
  } catch (error) {
    console.error("Error creating request token:", error)
    throw error
  }
}

// Step 2: Validate the request token with login credentials
export async function loginWithCredentials(username: string, password: string, rememberMe = false) {
  try {
    // First, get a new request token
    const requestToken = await createRequestToken()

    // Then validate it with the user credentials
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
      body: JSON.stringify({
        username,
        password,
        request_token: requestToken,
      }),
    }

    const response = await fetch("https://api.themoviedb.org/3/authentication/token/validate_with_login", options)

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.status_message || "Invalid credentials" }
    }

    const data = await response.json()

    // Step 3: Create a session with the validated token
    if (data.success) {
      const sessionResponse = await fetch("https://api.themoviedb.org/3/authentication/session/new", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${TMDB_API_KEY}`,
        },
        body: JSON.stringify({
          request_token: data.request_token,
        }),
      })

      if (!sessionResponse.ok) {
        return { success: false, error: "Failed to create session" }
      }

      const sessionData = await sessionResponse.json()

      if (sessionData.success) {
        // Get account details
        const accountResponse = await fetch(
          `https://api.themoviedb.org/3/account?session_id=${sessionData.session_id}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${TMDB_API_KEY}`,
            },
          },
        )

        let accountData = null
        if (accountResponse.ok) {
          accountData = await accountResponse.json()
        }

        // Calculate session expiry time
        const expiryTime = rememberMe ? DEFAULT_SESSION_EXPIRY : 60 * 60 * 24 // 1 day if not remember me

        // Store the session ID in a cookie
        const cookieStore = cookies()

        // Set session cookie
        cookieStore.set(SESSION_COOKIE_NAME, sessionData.session_id, {
          maxAge: expiryTime,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })

        // Store account data in a separate cookie (non-sensitive data only)
        if (accountData) {
          // Only store non-sensitive account data
          const safeAccountData = {
            id: accountData.id,
            username: accountData.username,
            name: accountData.name,
            avatar: accountData.avatar,
            iso_639_1: accountData.iso_639_1,
            iso_3166_1: accountData.iso_3166_1,
          }

          cookieStore.set(ACCOUNT_COOKIE_NAME, JSON.stringify(safeAccountData), {
            maxAge: expiryTime,
            path: "/",
            httpOnly: false, // Allow JavaScript access for UI purposes
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          })
        }

        revalidatePath("/")
        return {
          success: true,
          sessionId: sessionData.session_id,
          account: accountData,
          expiresIn: expiryTime,
        }
      }
    }

    return { success: false, error: "Authentication failed" }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get the current session ID from cookies
export async function getSessionId() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  return sessionCookie?.value || null
}

// Get account details for the current session
export async function getAccountDetails() {
  // First try to get from the account cookie
  const cookieStore = cookies()
  const accountCookie = cookieStore.get(ACCOUNT_COOKIE_NAME)

  if (accountCookie?.value) {
    try {
      return JSON.parse(accountCookie.value)
    } catch (e) {
      console.error("Error parsing account cookie:", e)
    }
  }

  // If no account cookie or parsing failed, fetch from API
  const sessionId = await getSessionId()

  if (!sessionId) {
    return null
  }

  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    }

    const response = await fetch(`https://api.themoviedb.org/3/account?session_id=${sessionId}`, options)

    if (!response.ok) {
      return null
    }

    const accountData = await response.json()

    // Update the account cookie with fresh data
    if (accountData) {
      const safeAccountData = {
        id: accountData.id,
        username: accountData.username,
        name: accountData.name,
        avatar: accountData.avatar,
        iso_639_1: accountData.iso_639_1,
        iso_3166_1: accountData.iso_3166_1,
      }

      cookieStore.set(ACCOUNT_COOKIE_NAME, JSON.stringify(safeAccountData), {
        maxAge: DEFAULT_SESSION_EXPIRY,
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
    }

    return accountData
  } catch (error) {
    console.error("Error fetching account details:", error)
    return null
  }
}

// Validate the current session
export async function validateSession() {
  const sessionId = await getSessionId()

  if (!sessionId) {
    return { valid: false }
  }

  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    }

    // Try to access account details to validate the session
    const response = await fetch(`https://api.themoviedb.org/3/account?session_id=${sessionId}`, options)

    if (!response.ok) {
      // Session is invalid, clear cookies
      await logout()
      return { valid: false }
    }

    return { valid: true }
  } catch (error) {
    console.error("Error validating session:", error)
    return { valid: false }
  }
}

// Logout - clear the session
export async function logout() {
  const sessionId = await getSessionId()
  const cookieStore = cookies()

  if (sessionId) {
    try {
      // Delete the session on TMDB
      const options = {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${TMDB_API_KEY}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      }

      await fetch("https://api.themoviedb.org/3/authentication/session", options)
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  // Clear the cookies regardless of API response
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(ACCOUNT_COOKIE_NAME)

  revalidatePath("/")
  return { success: true }
}

// Refresh the session expiry time (called periodically to extend session)
export async function refreshSessionExpiry(rememberMe = true) {
  const sessionId = await getSessionId()

  if (!sessionId) {
    return { success: false }
  }

  const cookieStore = cookies()
  const expiryTime = rememberMe ? DEFAULT_SESSION_EXPIRY : 60 * 60 * 24 // 1 day if not remember me

  // Update session cookie with new expiry
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    maxAge: expiryTime,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })

  // Update account cookie with new expiry
  const accountCookie = cookieStore.get(ACCOUNT_COOKIE_NAME)
  if (accountCookie?.value) {
    cookieStore.set(ACCOUNT_COOKIE_NAME, accountCookie.value, {
      maxAge: expiryTime,
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
  }

  return { success: true }
}
