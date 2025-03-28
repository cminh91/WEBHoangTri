"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, Loader2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import AdminEditor from "@/components/admin/admin-editor"

export default function AboutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "Về Chúng Tôi",
    content: "",
    mission: "",
    vision: "",
    history: "",
    metaTitle: "",
    metaDescription: "",
  })

  // Fetch about data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/about")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setFormData({
              title: data.title || "Về Chúng Tôi",
              content: data.content || "",
              mission: data.mission || "",
              vision: data.vision || "",
              history: data.history || "",
              metaTitle: data.metaTitle || "",
              metaDescription: data.metaDescription || "",
            })

            if (data.images && data.images.length > 0) {
              setImagePreview(data.images[0].url)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching about data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin giới thiệu",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle rich text content change
  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
  }

  const handleMissionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, mission: value }))
  }

  const handleVisionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, vision: value }))
  }

  const handleHistoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, history: value }))
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Clear selected image
  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.title || !formData.content) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      // Upload image if selected
      let imageUrl = imagePreview
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Không thể tải lên hình ảnh")
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      // Prepare about data
      const aboutData = {
        ...formData,
        images: imageUrl ? [{ url: imageUrl, alt: formData.title }] : [],
      }

      // Save to database
      const response = await fetch("/api/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aboutData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Không thể lưu thông tin")
      }

      toast({
        title: "Thành công",
        description: "Thông tin giới thiệu đã được cập nhật",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error saving about data: ", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu thông tin",
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản Lý Trang Giới Thiệu</h1>
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

      <Tabs defaultValue="main" className="space-y-4">
        <TabsList className="bg-zinc-900">
          <TabsTrigger value="main" className="data-[state=active]:bg-red-600">
            Nội Dung Chính
          </TabsTrigger>
          <TabsTrigger value="mission" className="data-[state=active]:bg-red-600">
            Sứ Mệnh & Tầm Nhìn
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-red-600">
            Lịch Sử
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-red-600">
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle>Thông Tin Chính</CardTitle>
              <CardDescription className="text-gray-400">
                Thông tin chính về công ty sẽ hiển thị trên trang Giới Thiệu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu Đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Nội Dung <span className="text-red-500">*</span>
                </Label>
                <AdminEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Nhập nội dung giới thiệu về công ty..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Hình Ảnh</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-dashed border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Chọn Hình Ảnh
                  </Button>
                  <Input
                    id="image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-400">
                    {imageFile ? imageFile.name : imagePreview ? "Hình ảnh hiện tại" : "Chưa chọn hình ảnh"}
                  </span>
                </div>

                {imagePreview && (
                  <div className="mt-4 relative h-64 w-full overflow-hidden rounded-lg border border-zinc-700">
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1 hover:bg-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mission" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle>Sứ Mệnh & Tầm Nhìn</CardTitle>
              <CardDescription className="text-gray-400">Sứ mệnh và tầm nhìn của công ty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mission">Sứ Mệnh</Label>
                <AdminEditor
                  value={formData.mission}
                  onChange={handleMissionChange}
                  placeholder="Nhập sứ mệnh của công ty..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vision">Tầm Nhìn</Label>
                <AdminEditor
                  value={formData.vision}
                  onChange={handleVisionChange}
                  placeholder="Nhập tầm nhìn của công ty..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle>Lịch Sử Phát Triển</CardTitle>
              <CardDescription className="text-gray-400">Lịch sử phát triển của công ty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="history">Lịch Sử</Label>
                <AdminEditor
                  value={formData.history}
                  onChange={handleHistoryChange}
                  placeholder="Nhập lịch sử phát triển của công ty..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle>Thông Tin SEO</CardTitle>
              <CardDescription className="text-gray-400">Cài đặt thông tin SEO cho trang Giới Thiệu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="Nhập meta title"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
                <p className="text-xs text-gray-400">Nếu để trống, tiêu đề trang sẽ được sử dụng làm meta title</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Input
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="Nhập meta description"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
                <p className="text-xs text-gray-400">Mô tả ngắn gọn về trang, hiển thị trong kết quả tìm kiếm</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

