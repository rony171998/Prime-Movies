import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { FavoritesPage } from "@/components/favorites-page"
import { getGuestSessionId } from "@/app/actions"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function FavoritesRoute() {
  const guestSessionId = await getGuestSessionId()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-foreground hover:text-teal-400 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="ml-4 text-lg font-medium">My Favorites</h1>
        </div>

        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-6">
        <FavoritesPage guestSessionId={guestSessionId} />
      </div>
    </div>
  )
}
