"use client"

import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

export function SidebarLoginButton() {
  return (
    <LoginForm
      trigger={
        <Button
          variant="outline"
          className="w-full bg-teal-500 hover:bg-teal-600 text-white border-none flex items-center gap-2 justify-center py-2"
        >
          <User size={16} />
          <span>Login with TMDB</span>
        </Button>
      }
    />
  )
}
