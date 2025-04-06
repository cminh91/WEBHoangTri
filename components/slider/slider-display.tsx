"use client"

import { Slider } from "@/types/slider"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

export interface SliderDisplayProps {
  sliders: Slider[]
}

export function SliderDisplay({ sliders }: SliderDisplayProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const activeSliders = sliders.filter(slider => slider.isActive).sort((a, b) => a.order - b.order)

  const handleSlideChange = useCallback((newIndex: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide(newIndex)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating])

  const handleNextSlide = useCallback(() => {
    handleSlideChange((currentSlide + 1) % activeSliders.length)
  }, [currentSlide, activeSliders.length, handleSlideChange])

  const handlePrevSlide = useCallback(() => {
    handleSlideChange((currentSlide - 1 + activeSliders.length) % activeSliders.length)
  }, [currentSlide, activeSliders.length, handleSlideChange])

  useEffect(() => {
    if (activeSliders.length <= 1) return

    const interval = setInterval(handleNextSlide, 5000)
    return () => clearInterval(interval)
  }, [activeSliders.length, handleNextSlide])

  if (activeSliders.length === 0) return null

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[800px] overflow-hidden group">
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
              src={slider.url || "/placeholder.jpg"}
              alt={slider.title || "Slider image"}
              fill
              priority={index === 0}
              className="object-contain md:object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="100vw"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <div className="absolute inset-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="container mx-auto px-6 sm:px-8">
              <div className="max-w-xl space-y-3 sm:space-y-4 md:space-y-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg leading-tight">
                  {slider.title}
                </h2>
                {slider.subtitle && (
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 drop-shadow-md leading-relaxed">
                    {slider.subtitle}
                  </p>
                )}
                {slider.link && (
                  <Button 
                    size="default"
                    className="bg-red-600 hover:bg-red-700 text-sm sm:text-base md:text-lg 
                             px-4 sm:px-6 md:px-8 py-2 sm:py-4 md:py-6 mt-10"
                    asChild
                  >
                    <Link href={slider.link}>
                      {slider.buttonText || "Xem thêm"}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation controls with updated visibility */}
      {activeSliders.length > 1 && (
        <>
          <button
            onClick={handlePrevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white z-20 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     hover:scale-110 transition-transform duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white z-20 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     hover:scale-110 transition-transform duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </button>

          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {activeSliders.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`h-1.5 sm:h-2 transition-all duration-300 ${
                  index === currentSlide 
                    ? "w-6 sm:w-8 bg-red-600" 
                    : "w-1.5 sm:w-2 bg-white/50 hover:bg-white"
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