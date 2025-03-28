"use client"

import { Slider } from "@/types/slider"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

export interface SliderDisplayProps {
  sliders: Slider[]
}

export function SliderDisplay({ sliders }: SliderDisplayProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const activeSliders = sliders.filter(slider => slider.isActive).sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (activeSliders.length <= 1) return

    const interval = setInterval(() => {
      handleNextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [activeSliders.length, currentSlide])

  const handleNextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSliders.length)
      setIsAnimating(false)
    }, 500)
  }

  const handlePrevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + activeSliders.length) % activeSliders.length)
      setIsAnimating(false)
    }, 500)
  }

  if (activeSliders.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden">
      {/* Aspect ratio container for SEO-friendly dimensions */}
      <div className="relative w-full" style={{ paddingTop: "41.67%" }}> {/* 2.4:1 aspect ratio */}
        {activeSliders.map((slider, index) => (
          <div
            key={slider.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentSlide
                ? "translate-x-0 opacity-100"
                : index < currentSlide
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
            }`}
            style={{ zIndex: index === currentSlide ? 10 : 0 }}
          >
            <div className="relative h-full w-full">
              <Image
                src={slider.url ? slider.url : "/placeholder.jpg"}
                alt={slider.title || "Slider image"}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            </div>
            
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-xl space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {slider.title}
                  </h2>
                  {slider.subtitle && (
                    <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
                      {slider.subtitle}
                    </p>
                  )}
                  {slider.link && (
                    <Link href={slider.link}>
                      <Button size="lg" className="bg-red-600 hover:bg-red-700 mt-4">
                        {slider.buttonText || "Learn More"}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      {activeSliders.length > 1 && (
        <>
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 z-20 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 z-20 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {activeSliders.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating && index !== currentSlide) {
                    setIsAnimating(true)
                    setCurrentSlide(index)
                    setTimeout(() => setIsAnimating(false), 500)
                  }
                }}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white w-4" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}