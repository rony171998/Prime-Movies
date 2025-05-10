"use client"

import { useState, useEffect } from "react"
import { validateSession, refreshSessionExpiry } from "@/app/auth-actions"

// Session refresh interval (every 30 minutes)
const SESSION_REFRESH_INTERVAL = 30 * 60 * 1000

export function useSession() {
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)

  // Validate session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsValidating(true)
      try {
        const result = await validateSession()
        setIsValid(result.valid)
      } catch (error) {
        console.error("Error validating session:", error)
        setIsValid(false)
      } finally {
        setIsValidating(false)
      }
    }

    checkSession()
  }, [])

  // Set up periodic session refresh
  useEffect(() => {
    if (!isValid) return

    // Refresh session immediately
    refreshSessionExpiry(true).catch(console.error)

    // Set up interval for refreshing
    const intervalId = setInterval(() => {
      refreshSessionExpiry(true).catch(console.error)
    }, SESSION_REFRESH_INTERVAL)

    return () => clearInterval(intervalId)
  }, [isValid])

  return {
    isValidating,
    isValid,
  }
}
