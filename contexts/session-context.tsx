"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { validateSession, refreshSessionExpiry } from "@/app/auth-actions"

// Session refresh interval (every 30 minutes)
const SESSION_REFRESH_INTERVAL = 30 * 60 * 1000

type SessionContextType = {
  isLoading: boolean
  isAuthenticated: boolean
  checkSession: () => Promise<boolean>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkSession = async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      const result = await validateSession()
      setIsAuthenticated(result.valid)
      return result.valid
    } catch (error) {
      console.error("Error validating session:", error)
      setIsAuthenticated(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Validate session on mount
  useEffect(() => {
    checkSession()
  }, [])

  // Set up periodic session refresh
  useEffect(() => {
    if (!isAuthenticated) return

    // Refresh session immediately
    refreshSessionExpiry(true).catch(console.error)

    // Set up interval for refreshing
    const intervalId = setInterval(() => {
      refreshSessionExpiry(true).catch(console.error)
    }, SESSION_REFRESH_INTERVAL)

    return () => clearInterval(intervalId)
  }, [isAuthenticated])

  return (
    <SessionContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        checkSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
