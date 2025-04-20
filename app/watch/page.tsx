"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ThumbsUp, Share2, Plus, Flag } from "lucide-react"
import { VideoPlayer, type SubtitleTrack } from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function WatchPage() {
  const [isLiked, setIsLiked] = useState(false)
  const [isInList, setIsInList] = useState(false)

  // Sample subtitle tracks
  const subtitleTracks: SubtitleTrack[] = [
    {
      src: "/subtitles/english.vtt",
      label: "English",
      srcLang: "en",
      default: true,
    },
    {
      src: "/subtitles/spanish.vtt",
      label: "Spanish",
      srcLang: "es",
    },
    {
      src: "/subtitles/french.vtt",
      label: "French",
      srcLang: "fr",
    },
    {
      src: "/subtitles/ukrainian.vtt",
      label: "Ukrainian",
      srcLang: "uk",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-4 flex items-center">
        <Link href="/" className="text-white hover:text-teal-400 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="ml-4 text-lg font-medium">Mavka</h1>
      </header>

      {/* Video Player */}
      <div className="container mx-auto px-4 max-w-5xl">
        <VideoPlayer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          poster="/placeholder.svg?height=720&width=1280"
          title="Mavka - Official Trailer"
          subtitles={subtitleTracks}
        />

        {/* Video Info */}
        <div className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Mavka</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <span>2023</span>
                <span>•</span>
                <span>1h 45m</span>
                <span>•</span>
                <span>PG-13</span>
              </div>
              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="bg-zinc-800/80 text-white border-zinc-700 rounded-full">
                  Drama
                </Badge>
                <Badge variant="outline" className="bg-zinc-800/80 text-white border-zinc-700 rounded-full">
                  Fantasy
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1 hover:bg-zinc-800"
                onClick={() => setIsLiked(!isLiked)}
              >
                <ThumbsUp size={20} className={isLiked ? "text-teal-400 fill-teal-400" : ""} />
                <span className="text-xs">Like</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1 hover:bg-zinc-800"
                onClick={() => setIsInList(!isInList)}
              >
                <Plus size={20} className={isInList ? "text-teal-400" : ""} />
                <span className="text-xs">My List</span>
              </Button>
              <Button variant="ghost" className="flex flex-col items-center gap-1 hover:bg-zinc-800">
                <Share2 size={20} />
                <span className="text-xs">Share</span>
              </Button>
              <Button variant="ghost" className="flex flex-col items-center gap-1 hover:bg-zinc-800">
                <Flag size={20} />
                <span className="text-xs">Report</span>
              </Button>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              The already tumultuous and difficult lives of ordinary people in the Ukrainian countryside are turned
              upside down by war, revolution, and change of government. Mavka, a forest spirit, falls in love with a
              human musician named Lukash, but their relationship is threatened by the arrival of a wood-cutting
              enterprise owned by the evil Kilina.
            </p>
          </div>

          {/* Cast & Crew */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Cast & Crew</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                    <Image
                      src={`/placeholder.svg?height=48&width=48&text=Actor${i}`}
                      alt={`Actor ${i}`}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Actor Name</p>
                    <p className="text-xs text-gray-400">Character</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* More Like This */}
          <div>
            <h2 className="text-lg font-semibold mb-3">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg overflow-hidden bg-zinc-800">
                  <Image
                    src={`/placeholder.svg?height=200&width=150&text=Movie${i}`}
                    alt={`Similar Movie ${i}`}
                    width={150}
                    height={200}
                    className="w-full aspect-[2/3] object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
