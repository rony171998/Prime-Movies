"use client"

import { useState } from "react"
import { createGuestSessionAction, clearGuestSession } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"

interface GuestSessionProps {
  guestSessionId?: string | null
}

export function GuestSession({ guestSessionId }: GuestSessionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(guestSessionId || null)
  const [error, setError] = useState<string | null>(null)

  const createSession = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await createGuestSessionAction()

      if (result.success) {
        setSessionId(result.guestSessionId)
      } else {
        setError(result.error || "Failed to create guest session")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      const result = await clearGuestSession()

      if (result.success) {
        setSessionId(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (sessionId) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-teal-400">
          <User size={14} />
          <span>Guest</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-gray-400 hover:text-white"
          onClick={handleLogout}
          disabled={isLoading}
          title="Sign out"
        >
          <LogOut size={14} />
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs bg-muted border-border hover:bg-muted/80 text-foreground"
      onClick={createSession}
      disabled={isLoading}
    >
      {isLoading ? "Creating..." : "Sign in as Guest"}
    </Button>
  )
}
