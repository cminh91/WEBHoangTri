"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    email: "",
    mapUrl: "",
    workingHours: {
      monday: "8:00 - 18:00",
      tuesday: "8:00 - 18:00",
      wednesday: "8:00 - 18:00",
      thursday: "8:00 - 18:00",
      friday: "8:00 - 18:00",
      saturday: "8:00 - 17:00",
      sunday: "9:00 - 15:00",
    },
    socialLinks: {
      facebook: "",
      instagram: "",
      youtube: "",
    },
  })

  // Fetch contact data
  // Update the fetchContact function to handle missing data
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch("/api/contact")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            // Merge received data with default values
            setFormData(prev => ({
              ...prev,
              ...data,
              workingHours: {
                ...prev.workingHours,
                ...(data.workingHours || {})
              },
              socialLinks: {
                ...prev.socialLinks,
                ...(data.socialLinks || {})
              }
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching contact data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin liên hệ",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    fetchContact()
  }, [])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => {
        const parentObj = prev[parent as keyof typeof prev]
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value,
            },
          }
        }
        return prev
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.address || !formData.phone || !formData.email) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Không thể lưu thông tin liên hệ")
      }

      toast({
        title: "Thành công",
        description: "Thông tin liên hệ đã được cập nhật",
      })
    } catch (error: any) {
      console.error("Error saving contact data:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu thông tin liên hệ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 text-xl">Đang tải thông tin...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản Lý Thông Tin Liên Hệ</h1>
        <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang Lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu Thay Đổi
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader>
            <CardTitle>Thông Tin Cơ Bản</CardTitle>
            <CardDescription className="text-gray-400">Thông tin liên hệ cơ bản của cửa hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">
                  Địa Chỉ <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ cửa hàng"
                  className="min-h-[80px] border-zinc-700 bg-zinc-800 focus:border-red-600"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ email"
                    className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader>
            <CardTitle>Giờ Làm Việc</CardTitle>
            <CardDescription className="text-gray-400">Thời gian mở cửa của cửa hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workingHours.monday">Thứ Hai</Label>
                <Input
                  id="workingHours.monday"
                  name="workingHours.monday"
                  value={formData.workingHours.monday}
                  onChange={handleChange}
                  placeholder="8:00 - 18:00"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours.tuesday">Thứ Ba</Label>
                <Input
                  id="workingHours.tuesday"
                  name="workingHours.tuesday"
                  value={formData.workingHours.tuesday}
                  onChange={handleChange}
                  placeholder="8:00 - 18:00"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours.wednesday">Thứ Tư</Label>
                <Input
                  id="workingHours.wednesday"
                  name="workingHours.wednesday"
                  value={formData.workingHours.wednesday}
                  onChange={handleChange}
                  placeholder="8:00 - 18:00"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours.thursday">Thứ Năm</Label>
                <Input
                  id="workingHours.thursday"
                  name="workingHours.thursday"
                  value={formData.workingHours.thursday}
                  onChange={handleChange}
                  placeholder="8:00 - 18:00"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours.friday">Thứ Sáu</Label>
                <Input
                  id="workingHours.friday"
                  name="workingHours.friday"
                  value={formData.workingHours.friday}
                  onChange={handleChange}
                  placeholder="8:00 - 18:00"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours.saturday">Thứ Bảy</Label>
                <Input
                  id="workingHours.saturday"
                  name="workingHours.saturday"
                  value={formData.workingHours.saturday}
                  onChange={handleChange}
                  placeholder="8:00 - 17:00"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours.sunday">Chủ Nhật</Label>
                <Input
                  id="workingHours.sunday"
                  name="workingHours.sunday"
                  value={formData.workingHours.sunday}
                  onChange={handleChange}
                  placeholder="9:00 - 15:00"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader>
            <CardTitle>Mạng Xã Hội</CardTitle>
            <CardDescription className="text-gray-400">Liên kết đến các trang mạng xã hội</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="socialLinks.facebook">Facebook</Label>
                <Input
                  id="socialLinks.facebook"
                  name="socialLinks.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/yourpage"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialLinks.instagram">Instagram</Label>
                <Input
                  id="socialLinks.instagram"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/yourpage"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialLinks.youtube">YouTube</Label>
                <Input
                  id="socialLinks.youtube"
                  name="socialLinks.youtube"
                  value={formData.socialLinks.youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/yourchannel"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader>
            <CardTitle>Bản Đồ</CardTitle>
            <CardDescription className="text-gray-400">Nhúng bản đồ Google Maps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mapUrl">Mã Nhúng Bản Đồ</Label>
              <Textarea
                id="mapUrl"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleChange}
                placeholder="<iframe src=... ></iframe>"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
              <p className="text-xs text-gray-400">Dán mã nhúng từ Google Maps</p>
            </div>

            {formData.mapUrl && (
              <div className="w-full overflow-hidden rounded-lg border border-zinc-700">
                <div 
                  style={{ height: '300px', width: '100%' }}
                  dangerouslySetInnerHTML={{ __html: formData.mapUrl }} 
                />
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

