"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"

const Editor = dynamic(() => import("@/components/admin/admin-editor"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-md bg-zinc-800"></div>,
})

export default function CreatePolicyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    isPublished: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[đĐ]/g, "d")
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "-"),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.title || !formData.slug || !formData.content) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      const response = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Không thể tạo chính sách")
      }

      toast({
        title: "Thành công",
        description: "Chính sách mới đã được tạo",
      })

      router.push("/admin/policies")
    } catch (error: any) {
      console.error("Error creating policy:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo chính sách",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thêm Chính Sách Mới</h1>
        <Button onClick={() => router.push("/admin/policies")} variant="outline" className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700">
          Quay Lại
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">
            Tiêu Đề <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tiêu đề chính sách"
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
            placeholder="chinh-sach-bao-mat"
            className="border-zinc-700 bg-zinc-800 focus:border-red-600"
            required
          />
          <p className="text-xs text-gray-400">
            Slug sẽ được sử dụng trong URL. Ví dụ: /chinh-sach/chinh-sach-bao-mat
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Tóm Tắt</Label>
          <Input
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Nhập tóm tắt ngắn về chính sách"
            className="border-zinc-700 bg-zinc-800 focus:border-red-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">
            Nội Dung <span className="text-red-500">*</span>
          </Label>
          <Editor
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Nhập nội dung chính sách..."
            height={300}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/policies")}
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
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu Chính Sách
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}