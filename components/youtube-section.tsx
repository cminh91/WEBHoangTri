"use client"

import React, { useState, useEffect } from "react"
import { Play } from "lucide-react"
import Image from "next/image"

interface YouTubeSectionProps {
  videoId?: string
}

export default function YouTubeSection({ videoId = "" }: YouTubeSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    console.log("[YouTubeSection] Received videoId:", videoId)
    console.log("[YouTubeSection] videoId type:", typeof videoId)
    
    // Kiểm tra giá trị
    if (!videoId) {
      console.log("[YouTubeSection] No videoId provided")
      return
    }
    
    console.log("[YouTubeSection] videoId length:", videoId.length)
  }, [videoId])

  const handlePlay = () => {
    setIsPlaying(true)
  }

  if (!videoId) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="relative aspect-video overflow-hidden rounded-md shadow-xl">
        {!isPlaying ? (
          // Thumbnail và nút play
          <div className="relative w-full h-full">
            <Image 
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Video Thumbnail"
              fill
              className="object-cover"
            />
            <div 
              className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer"
              onClick={handlePlay}
            >
              <div className="rounded-full bg-red-600 p-4 hover:bg-red-700 transition-colors">
                <Play className="h-12 w-12 text-white" fill="white" />
              </div>
            </div>
          </div>
        ) : (
          // iframe YouTube khi đã click play
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        )}
      </div>
    </div>
  )
}