"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LogOut, User, UserCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/auth-actions"
import { useSession } from "@/hooks/use-session"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserAccountProps {
  sessionId?: string | null
  accountDetails?: any
}

export function UserAccount({ sessionId, accountDetails }: UserAccountProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isValidating, isValid } = useSession()

  // If session is being validated, show loading state
  if (isValidating) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full overflow-hidden bg-zinc-700 relative">
        <span className="animate-pulse bg-zinc-600 h-full w-full"></span>
      </Button>
    )
  }

  // If session is invalid or no session ID, don't render anything
  // The parent component should handle showing login button instead
  if (!isValid || !sessionId) {
    return null
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full overflow-hidden bg-zinc-700 relative">
          {accountDetails?.avatar?.tmdb?.avatar_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/w200${accountDetails.avatar.tmdb.avatar_path}`}
              alt={accountDetails.username || "Profile"}
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <UserCircle className="h-full w-full text-gray-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
        <DropdownMenuLabel className="flex items-center gap-2">
          <User size={16} className="text-teal-400" />
          <span>{accountDetails?.username || "TMDB User"}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem className="cursor-pointer focus:bg-zinc-800">
          <Settings size={16} className="mr-2" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer focus:bg-zinc-800" onClick={handleLogout} disabled={isLoading}>
          <LogOut size={16} className="mr-2" />
          {isLoading ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
