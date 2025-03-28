"use client"

import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Upload, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface SliderUploadProps {
  value: { url: string }[]
  onChange: (images: { url: string; alt?: string }[]) => void
}

export function SliderUpload({ value, onChange }: SliderUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  
  const recommendedWidth = 1920
  const recommendedHeight = 800

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const file = files[0] // Take only first file
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      onChange([{ url: data.url }]) // Replace existing image
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải lên hình ảnh",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="w-full aspect-[2.4/1] relative rounded-lg border border-dashed border-zinc-700 bg-zinc-900 overflow-hidden">
        {value[0]?.url ? (
          // Show uploaded image
          <div className="relative w-full h-full group">
            <Image
              src={value[0].url}
              alt="Slider image"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => onChange([])}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          // Upload button
          <Label
            htmlFor="slider-image"
            className="cursor-pointer flex flex-col items-center justify-center h-full"
          >
            <Upload className="h-8 w-8 mb-2" />
            <span className="text-sm">Tải lên hình ảnh slider</span>
            <span className="text-xs text-zinc-400 mt-1">
              Click để chọn hoặc kéo thả
            </span>
          </Label>
        )}
        <Input
          id="slider-image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </div>

      <Alert className="bg-blue-950 border-blue-800">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <p>Yêu cầu hình ảnh:</p>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Kích thước tối ưu: {recommendedWidth}x{recommendedHeight}px (tỷ lệ 2.4:1)</li>
            <li>Định dạng: JPG, PNG, hoặc WEBP</li>
            <li>Dung lượng tối đa: 2MB</li>
            <li>Nội dung rõ ràng, không bị vỡ hoặc mờ</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}