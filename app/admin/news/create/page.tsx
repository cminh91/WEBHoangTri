"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { generateSlug } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import dynamic from "next/dynamic"

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import("@/components/admin/admin-editor"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-md bg-zinc-800"></div>,
})

export default function CreateNewsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    publishDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    tags: "",
    featured: false,
  })

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?type=NEWS")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Auto-generate slug when title changes
    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle rich text content change
  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
  }

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }))
  }

  // Handle featured toggle
  const handleFeaturedChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }))
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
      let imageUrl = ""
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

      // Prepare news data
      const newsData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author || "Admin",
        publishDate: formData.publishDate,
        categoryId: formData.categoryId || null,
        tags: formData.tags,
        featured: formData.featured,
        images: imageUrl ? [{ url: imageUrl, alt: formData.title }] : [],
      }

      // Add news to database
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Không thể tạo bài viết")
      }

      toast({
        title: "Thành công",
        description: "Bài viết đã được tạo thành công",
      })

      // Redirect to news list
      router.push("/admin/news")
      router.refresh()
    } catch (error: any) {
      console.error("Error creating news: ", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo bài viết",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Thêm Bài Viết Mới</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Thông Tin Cơ Bản</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu Đề <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề bài viết"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="tieu-de-bai-viet"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                required
              />
              <p className="text-xs text-gray-400">Slug sẽ được sử dụng trong URL. Ví dụ: /tin-tuc/tieu-de-bai-viet</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Tác Giả</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Nhập tên tác giả"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishDate">Ngày Đăng</Label>
              <Input
                id="publishDate"
                name="publishDate"
                type="date"
                value={formData.publishDate}
                onChange={handleChange}
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Danh Mục</Label>
              <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800 focus:border-red-600">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
                  <SelectItem value="none">Không có danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
              <p className="text-xs text-gray-400">Phân cách các tags bằng dấu phẩy</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="featured" checked={formData.featured} onCheckedChange={handleFeaturedChange} />
              <Label htmlFor="featured">Hiển thị nổi bật</Label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="excerpt">Tóm Tắt</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Nhập tóm tắt bài viết"
                className="min-h-[100px] border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Nội Dung <span className="text-red-500">*</span>
          </h2>
          <Editor
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Nhập nội dung bài viết..."
            height={400}
          />
        </div>

        {/* News Image */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Hình Ảnh Bài Viết</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="image">Hình Ảnh Chính</Label>
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
                <span className="text-sm text-gray-400">{imageFile ? imageFile.name : "Chưa chọn file nào"}</span>
              </div>
            </div>

            <div>
              {imagePreview ? (
                <div className="relative h-40 w-full overflow-hidden rounded-lg border border-zinc-700">
                  <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-1 hover:bg-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800">
                  <span className="text-gray-400">Xem trước hình ảnh</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          >
            Hủy
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang Lưu...
              </>
            ) : (
              "Lưu Bài Viết"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

