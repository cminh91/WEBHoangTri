"use client"

import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "next-auth/react"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-zinc-900">
        {children}
        <Toaster />
      </div>
    </SessionProvider>
  )
} 