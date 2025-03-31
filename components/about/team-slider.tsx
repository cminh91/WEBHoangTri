"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  position: string
  image: string
  bio: string
  order: number
}

interface TeamSliderProps {
  teamMembers: TeamMember[]
}

export default function TeamSlider({ teamMembers }: TeamSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (teamMembers.length <= 1) return

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => 
          prev === teamMembers.length - 1 ? 0 : prev + 1
        )
      }, 5000)
    }

    startAutoPlay()

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [teamMembers])

  const goToPrevious = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    setCurrentIndex(prev => 
      prev === 0 ? teamMembers.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    setCurrentIndex(prev => 
      prev === teamMembers.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center">
          <div className="mr-4 bg-red-600 px-4 py-2 text-lg font-bold uppercase text-white">
            XEM NHỮNG GÌ CHÚNG TÔI HÀI LÒNG
          </div>
          <div className="h-[1px] flex-grow bg-gray-700"></div>
        </div>

        <div className="flex space-x-4 mb-8">
          <button 
            onClick={goToPrevious}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            TRƯỚC
          </button>
          <button 
            onClick={goToNext}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            SAU
          </button>
        </div>

        <div className="relative">
          {teamMembers.map((member, index) => (
            <div 
              key={member.id}
              className={`transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                <div className="w-full lg:w-1/3 order-2 lg:order-1 text-center lg:text-left px-4 lg:px-0">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {member.position}
                  </p>
                  <p className="text-gray-300 italic text-base lg:text-lg">
                    "{member.bio}"
                  </p>
                </div>

                <div className="w-full lg:w-1/2 relative h-[300px] lg:h-[500px] order-1 lg:order-2 mb-6 lg:mb-0">
                  <div className="absolute right-0 w-full lg:w-[90%] h-full">
                    <div className="relative h-full w-full border-t-4 border-r-4 border-red-600">
                      <div className="absolute inset-0 m-3">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4 lg:mt-8 space-x-2">
          {teamMembers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? 'bg-red-600' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}