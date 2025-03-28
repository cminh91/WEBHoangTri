"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getPartners } from "@/lib/queries"

interface Partner {
  id: string
  name: string
  logo: string
  website?: string | null
  order: number
}

interface TrustedPartnersProps {
  initialPartners?: Partner[]
}

export default function TrustedPartners({ initialPartners }: TrustedPartnersProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners || [])
  const [loading, setLoading] = useState(!initialPartners)

  useEffect(() => {
    if (initialPartners) return

    const fetchPartners = async () => {
      try {
        const data = await getPartners()
        setPartners(data)
      } catch (error) {
        console.error('Error fetching partners:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [initialPartners])

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Đối Tác Của Chúng Tôi</h2>
        {loading ? (
          <div className="flex flex-wrap justify-center gap-8 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-40 h-24 bg-gray-800 rounded-md"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {partners.map((partner) => (
              <div key={partner.id} className="text-center">
                <Link
                  href={partner.website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 flex items-center justify-center h-24 w-40 hover:shadow-md transition-shadow"
                >
                  <Image
                    src={partner.logo ? partner.logo : "/placeholder-logo.png"}
                    alt={partner.name}
                    width={120}
                    height={60}
                    className="max-h-16 w-auto object-contain"
                    priority
                  />
                </Link>
                <p className="mt-2 text-sm text-gray-400">{partner.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
