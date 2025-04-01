'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || '',
            device: navigator.userAgent,
          }),
        })
      } catch (error) {
        console.error('Error tracking visit:', error)
      }
    }

    trackVisit()
  }, [pathname])

  return <>{children}</>
}