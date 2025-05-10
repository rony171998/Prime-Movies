"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage, languages, type Language } from "@/contexts/language-context"

export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectLanguage = (language: Language) => {
    setLanguage(language)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-gray-400 hover:text-white"
          title="Select language"
        >
          <Globe size={16} />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-white">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={`flex items-center gap-2 cursor-pointer focus:bg-zinc-800 ${
              currentLanguage.code === language.code ? "bg-zinc-800" : ""
            }`}
            onClick={() => handleSelectLanguage(language)}
          >
            <span className="mr-1">{language.flag}</span>
            <span>{language.name}</span>
            {currentLanguage.code === language.code && <span className="ml-auto text-teal-400">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
