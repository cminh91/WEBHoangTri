"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value: { url: string; alt?: string; id?: string }[]
  onChange: (value: { url: string; alt?: string; id?: string }[]) => void
  onRemove: (url: string) => void
  multiple?: boolean
}

export function ImageUpload({ value, onChange, onRemove, multiple = true }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file) // Changed from "files" to "file"

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        return {
          url: data.url, // Expecting single URL response
          alt: "",
        }
      })

      const newImages = await Promise.all(uploadPromises)

      if (multiple) {
        onChange([...value, ...newImages])
      } else {
        onChange(newImages)
      }
    } catch (error) {
      console.error("Error uploading images:", error)
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

  const handleAltChange = (url: string, alt: string) => {
    const newValue = value.map((image) => {
      if (image.url === url) {
        return { ...image, alt }
      }
      return image
    })
    onChange(newValue)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {value.map((image, index) => (
          <div key={image.id || `image-${index}-${image.url.substring(image.url.lastIndexOf('/') + 1)}`} className="relative border rounded-md overflow-hidden group">
            <div className="aspect-square relative">
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt || "Product image"}
                fill
                className="object-cover"
              />
            </div>
            {/* <div className="p-2">
              <Input
                placeholder="Mô tả hình ảnh"
                value={image.alt || ""}
                onChange={(e) => handleAltChange(image.url, e.target.value)}
                className="text-xs"
              />
            </div> */}
            <button
              type="button"
              onClick={() => onRemove(image.url)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="border border-dashed rounded-md flex flex-col items-center justify-center p-4 aspect-square">
          <Label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
          >
            <Upload className="h-6 w-6 mb-2" />
            <span className="text-sm text-center">Tải lên hình ảnh</span>
            <span className="text-xs text-muted-foreground text-center mt-1">Nhấp để chọn hoặc kéo thả</span>
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </div>
      </div>
      {value.length > 0 && (
        <Button type="button" variant="outline" size="sm" className="text-red-500" onClick={() => onChange([])}>
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa tất cả hình ảnh
        </Button>
      )}
    </div>
  )
}

