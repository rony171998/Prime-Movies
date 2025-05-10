"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define available languages
export type Language = {
  code: string
  name: string
  flag: string
}

export const languages: Language[] = [
  { code: "en-US", name: "English", flag: "🇺🇸" },
  { code: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷" },
  { code: "de-DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "it-IT", name: "Italiano", flag: "🇮🇹" },
  { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
  { code: "ko-KR", name: "한국어", flag: "🇰🇷" },
  { code: "pt-BR", name: "Português", flag: "🇧🇷" },
  { code: "ru-RU", name: "Русский", flag: "🇷🇺" },
  { code: "zh-CN", name: "中文", flag: "🇨🇳" },
]

type LanguageContextType = {
  currentLanguage: Language
  setLanguage: (language: Language) => void
  languageCode: string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to English, but check localStorage for saved preference
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0])

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguageCode = localStorage.getItem("preferredLanguage")
    if (savedLanguageCode) {
      const savedLanguage = languages.find((lang) => lang.code === savedLanguageCode)
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }
    }
  }, [])

  // Save language preference when it changes
  const setLanguage = (language: Language) => {
    setCurrentLanguage(language)
    localStorage.setItem("preferredLanguage", language.code)
  }

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        languageCode: currentLanguage.code,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
