"use client"

import { useState, useRef, useEffect } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface SubtitleTrack {
  src: string
  label: string
  srcLang: string
  default?: boolean
}

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  className?: string
  autoPlay?: boolean
  subtitles?: SubtitleTrack[]
}

export function VideoPlayer({
  src,
  poster,
  title = "Video Title",
  className,
  autoPlay = false,
  subtitles = [],
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false)
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(!!subtitles.find((track) => track.default))
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(
    subtitles.find((track) => track.default)?.srcLang || (subtitles.length > 0 ? subtitles[0].srcLang : null),
  )
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)

    if (autoPlay) {
      video.play().catch((err) => console.log("Autoplay prevented:", err))
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [autoPlay])

  // Handle time updates
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      setProgress((video.currentTime / video.duration) * 100)
    }

    video.addEventListener("timeupdate", handleTimeUpdate)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [])

  // Handle play state changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
    }
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }

      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      container.addEventListener("mouseleave", () => {
        if (isPlaying) {
          setShowControls(false)
        }
      })
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove)
        container.removeEventListener("mouseleave", () => {})
      }

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  // Update subtitle tracks when subtitles change
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Enable/disable subtitle tracks based on current selection
    const textTracks = video.textTracks
    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i]
      if (subtitlesEnabled && track.language === currentSubtitle) {
        track.mode = "showing"
      } else {
        track.mode = "hidden"
      }
    }
  }, [subtitlesEnabled, currentSubtitle])

  // Play/Pause toggle
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  // Seek functionality
  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * video.duration
    video.currentTime = newTime
    setProgress(value[0])
    setCurrentTime(newTime)
  }

  // Volume control
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
      video.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      video.muted = false
    }
  }

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.muted = false
      setIsMuted(false)
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Toggle subtitles
  const toggleSubtitles = () => {
    setSubtitlesEnabled(!subtitlesEnabled)
  }

  // Change subtitle track
  const changeSubtitleTrack = (srcLang: string) => {
    setCurrentSubtitle(srcLang)
    setSubtitlesEnabled(true)
  }

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime += seconds
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full aspect-video bg-black rounded-lg overflow-hidden group", className)}
      onDoubleClick={toggleFullscreen}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      >
        {/* Subtitle Tracks */}
        {subtitles.map((track, index) => (
          <track
            key={index}
            src={track.src}
            kind="subtitles"
            srcLang={track.srcLang}
            label={track.label}
            default={track.default}
          />
        ))}
      </video>

      {/* Title Overlay */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <h3 className="text-white font-medium">{title}</h3>
      </div>

      {/* Play/Pause Overlay Button (center) */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300",
          isPlaying && !showControls ? "opacity-0" : "opacity-100",
        )}
      >
        <button
          onClick={togglePlay}
          className="bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
      </div>

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Progress Bar */}
        <div className="mb-2">
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-teal-400 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-teal-400 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button onClick={togglePlay} className="text-white hover:text-teal-400 transition-colors">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Skip Buttons */}
            <button onClick={() => skip(-10)} className="text-white hover:text-teal-400 transition-colors">
              <SkipBack size={18} />
            </button>

            <button onClick={() => skip(10)} className="text-white hover:text-teal-400 transition-colors">
              <SkipForward size={18} />
            </button>

            {/* Volume Control */}
            <div className="relative flex items-center">
              <button
                onClick={toggleMute}
                onMouseEnter={() => setIsVolumeSliderVisible(true)}
                className="text-white hover:text-teal-400 transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              {/* Volume Slider */}
              <div
                className={cn(
                  "absolute bottom-full left-0 mb-2 bg-zinc-900/90 backdrop-blur-sm rounded-md p-2 transition-all duration-200",
                  isVolumeSliderVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
                )}
                onMouseEnter={() => setIsVolumeSliderVisible(true)}
                onMouseLeave={() => setIsVolumeSliderVisible(false)}
              >
                <Slider
                  orientation="vertical"
                  value={[isMuted ? 0 : volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="h-24 [&>span:first-child]:w-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-teal-400 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-teal-400 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0"
                />
              </div>
            </div>

            {/* Time Display */}
            <div className="text-white text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Subtitles Button */}
            {subtitles.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`text-white hover:text-teal-400 transition-colors ${subtitlesEnabled ? "text-teal-400" : ""}`}
                  >
                    <Subtitles size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                  <DropdownMenuLabel>Subtitles</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    className={`focus:bg-zinc-800 cursor-pointer ${!subtitlesEnabled ? "text-teal-400" : ""}`}
                    onClick={() => setSubtitlesEnabled(false)}
                  >
                    Off
                  </DropdownMenuItem>
                  {subtitles.map((track, index) => (
                    <DropdownMenuItem
                      key={index}
                      className={`focus:bg-zinc-800 cursor-pointer ${
                        subtitlesEnabled && currentSubtitle === track.srcLang ? "text-teal-400" : ""
                      }`}
                      onClick={() => changeSubtitleTrack(track.srcLang)}
                    >
                      {track.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Settings Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white hover:text-teal-400 transition-colors">
                  <Settings size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="focus:bg-zinc-800 cursor-pointer">Playback Speed</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-800 cursor-pointer">Quality</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen Button */}
            <button onClick={toggleFullscreen} className="text-white hover:text-teal-400 transition-colors">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
