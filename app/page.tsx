import Image from "next/image"
import Link from "next/link"
import { Search, Bell, ChevronDown, Play, Download, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 flex-shrink-0 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <span className="text-teal-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="text-xl font-semibold">PrimeVision</span>
          </div>

          <nav className="space-y-6">
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Home
            </a>
            <a href="#" className="flex items-center gap-3 text-teal-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
              Explore
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Favourites
            </a>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-6">
          <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Profile
          </a>
          <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Settings
          </a>
        </div>

        {/* Continue Watching */}
        <div className="p-6 border-t border-zinc-800">
          <h3 className="text-sm font-medium mb-4">Continue Watching</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                <Image
                  src="/placeholder.svg?height=48&width=48"
                  alt="Chernobyl"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Chernobyl</p>
                <p className="text-xs text-gray-400">Episode 3</p>
              </div>
              <button className="text-white p-1">
                <Play size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                <Image
                  src="/placeholder.svg?height=48&width=48"
                  alt="Snowpiercer"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Snowpiercer</p>
                <p className="text-xs text-gray-400">Episode 7</p>
              </div>
              <button className="text-white p-1">
                <Play size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                <Image
                  src="/placeholder.svg?height=48&width=48"
                  alt="The Platform"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">The Platform</p>
                <p className="text-xs text-gray-400">55min 12sec</p>
              </div>
              <button className="text-white p-1">
                <Play size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-zinc-900">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-zinc-800 border-zinc-700 text-white rounded-full px-4">
              All
              <ChevronDown size={16} className="ml-1" />
            </Button>
            <div className="relative">
              <input type="text" placeholder="Search" className="bg-transparent text-white pl-2 focus:outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-white">
              <Search size={20} />
            </button>
            <button className="text-white">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="Profile"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          </div>
        </header>

        {/* Featured Content */}
        <div className="relative flex-1 overflow-auto">
          <div className="relative h-[500px] overflow-hidden">
            <Image
              src="/placeholder.svg?height=500&width=1000"
              alt="Mavka"
              width={1000}
              height={500}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge className="bg-orange-500/80 text-white border-none px-2 py-1 text-xs">
                <span className="mr-1">🔥</span> Now Popular
              </Badge>
            </div>

            <div className="absolute bottom-16 left-16 max-w-lg">
              <div className="flex gap-2 mb-2">
                <Badge variant="outline" className="bg-zinc-800/80 text-white border-zinc-700 rounded-full">
                  Drama
                </Badge>
                <Badge variant="outline" className="bg-zinc-800/80 text-white border-zinc-700 rounded-full">
                  Fantasy
                </Badge>
              </div>

              <h1 className="text-4xl font-bold mb-2">Mavka</h1>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                The already tumultuous and difficult lives of ordinary people in the Ukrainian countryside are turned
                upside down by war, revolution, and change of government.
              </p>

              <div className="flex items-center gap-4">
                <Link href="/watch">
                  <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6">
                    <Play size={16} className="mr-2" />
                    Watch Now
                  </Button>
                </Link>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full">
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full p-2">
                  <MoreHorizontal size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">You might like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="rounded-lg overflow-hidden bg-zinc-800 aspect-[2/3]">
                <Image
                  src="/placeholder.svg?height=300&width=200"
                  alt="Joker"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden bg-zinc-800 aspect-[2/3]">
                <Image
                  src="/placeholder.svg?height=300&width=200"
                  alt="Movie"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden bg-zinc-800 aspect-[2/3]">
                <Image
                  src="/placeholder.svg?height=300&width=200"
                  alt="Movie"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden bg-zinc-800 aspect-[2/3]">
                <Image
                  src="/placeholder.svg?height=300&width=200"
                  alt="Movie"
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
