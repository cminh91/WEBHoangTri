"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PasswordChangePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp")
      return
    }

    if (formData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi thay đổi mật khẩu")
      }

      toast({
        title: "Thành công",
        description: "Mật khẩu đã được thay đổi",
        variant: "default",
      })

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thay đổi mật khẩu</h1>
          <p className="text-muted-foreground">Cập nhật mật khẩu đăng nhập của bạn</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thay đổi mật khẩu</CardTitle>
          <CardDescription>
            Để bảo mật tài khoản, hãy sử dụng mật khẩu mạnh và không chia sẻ với người khác
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Cập nhật mật khẩu"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

