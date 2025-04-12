"use client"

import { Toaster } from "@/components/ui/toaster"

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-900">
        {children}
        <Toaster />
      </div>
  )
}