import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { SessionProvider } from "@/contexts/session-context"
import { getSessionId, getAccountDetails } from "@/app/auth-actions"
import React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Prime Movie - Stream Movies Online",
  description: "Watch the latest movies and TV shows online",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get session and account details
  const sessionId = await getSessionId()
  const accountDetails = sessionId ? await getAccountDetails() : null

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <SessionProvider>
              {/* Pass session and account details to children via context or props */}
              {React.cloneElement(children as React.ReactElement, { sessionId, accountDetails })}
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
