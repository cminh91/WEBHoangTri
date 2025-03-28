"use client"

import { useEffect, useState } from "react"

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

export default function Editor({ value, onChange, placeholder, height = 400 }: EditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-64 w-full animate-pulse rounded-md bg-zinc-800"></div>
  }

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[200px] w-full rounded-md border border-zinc-700 bg-zinc-800 p-3 text-white focus:border-red-600 focus:outline-none"
      style={{ height: `${height}px` }}
    />
  )
}

