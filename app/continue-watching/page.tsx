import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ContinueWatchingPage } from "@/components/continue-watching-page"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ContinueWatchingRoute() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-foreground hover:text-teal-400 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="ml-4 text-lg font-medium">Continue Watching</h1>
        </div>

        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-6">
        <ContinueWatchingPage />
      </div>
    </div>
  )
}
