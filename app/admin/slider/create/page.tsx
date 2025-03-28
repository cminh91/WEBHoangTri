"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { SliderUpload } from "@/components/slider/slider-upload"
import { Loader2, ArrowLeft } from "lucide-react"

export default function CreateSliderPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    url: "",
    link: "",
    isActive: true,
    order: 0,
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/slider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create slider")

      toast({
        title: "Thành công",
        description: "Đã thêm slider mới",
      })

      router.push("/admin/slider")
      router.refresh()
    } catch (error) {
      console.error("Error creating slider:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo slider",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Thêm Slider</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Image Section */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Hình ảnh Slider</h2>
            <SliderUpload
              value={formData.url ? [{ url: formData.url }] : []}
              onChange={(images) => setFormData({ ...formData, url: images[0]?.url || "" })}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-lg font-semibold mb-4">Nội dung</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Tiêu đề chính của slider"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề phụ</label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Tiêu đề phụ (không bắt buộc)"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Liên kết</label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/san-pham hoặc https://..."
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Thứ tự hiển thị</label>
              <Input
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
              <p className="text-xs text-zinc-400">Số thấp hơn sẽ hiển thị trước</p>
            </div>

            <div className="flex items-center justify-between md:col-span-2 pt-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Trạng thái</label>
                <p className="text-xs text-zinc-400">Bật để hiển thị slider</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            Hủy
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu slider"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}