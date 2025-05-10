"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only show the toggle after hydration to avoid SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-8 h-8" />
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full transition-all duration-300 ${
              theme === "dark"
                ? "bg-zinc-800 text-gray-400 hover:text-yellow-300 hover:bg-zinc-700"
                : "bg-gray-100 text-gray-600 hover:text-indigo-600 hover:bg-gray-200"
            }`}
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun size={16} className="transition-transform hover:rotate-45 duration-300" />
            ) : (
              <Moon size={16} className="transition-transform hover:scale-110 duration-300" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
