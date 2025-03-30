"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageSliderProps {
  images: {
    url: string
    alt?: string | null
  }[]
  productName: string
}

export default function ImageSlider({ images, productName }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  if (!images.length) {
    return (
      <div className="relative h-[400px]">
        <Image
          src="/placeholder.png"
          alt={productName}
          fill
          className="rounded-lg object-cover"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative h-[400px]">
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].alt || `${productName} - Ảnh ${currentIndex + 1}`}
          fill
          className="rounded-lg object-cover cursor-pointer"
          onClick={() => window.open(images[currentIndex].url, '_blank')}
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative h-full w-full aspect-square cursor-pointer"
            onClick={() => setCurrentIndex(index)}
          >
            <Image
              src={image.url}
              alt={image.alt || `${productName} - Ảnh ${index + 1}`}
              fill
              className={`rounded-lg object-cover ${index === currentIndex ? 'ring-2 ring-red-500' : ''}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}