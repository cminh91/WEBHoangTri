"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

export default function AdminLogin() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        name,
        password,
      })

      if (!result?.ok) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.")
        return
      }

      // Chuyển hướng sau khi đăng nhập thành công
      if (callbackUrl) {
        router.replace(callbackUrl)
      } else {
        router.replace("/admin")
      }
      
    } catch (error) {
      console.error("Login error:", error)
      setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-8 shadow-lg">
        <div className="mb-6 text-center">
         <h1 className="text-2xl font-bold mb-2">Đăng Nhập Admin</h1>
         <p className="text-gray-400">Đăng nhập để quản lý website Hoàng Trí Moto</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-800 bg-red-950 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên đăng nhập</Label>
            <Input
              id="name"
              type="text"
              placeholder="Admin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-zinc-700 bg-zinc-800 focus:border-red-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <a href="#" className="text-sm text-red-500 hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-zinc-700 bg-zinc-800 focus:border-red-600"
            />
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng Nhập"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

