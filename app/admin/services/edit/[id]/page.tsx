"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdminEditor from "@/components/admin/admin-editor"
import { generateSlug } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

export default function EditServicePage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    categoryId: "",
    longDescription: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "", 
    price: "",
    featured: false,
    existingImage: "",
  })

  const [errors, setErrors] = useState({
    title: "",
    slug: "",
    description: "",
    longDescription: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "", 
    price: "",
    image: "",
  })
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?type=SERVICE")
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
  // Fetch service data when component mounts
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/services/${id}`)
        if (!response.ok) throw new Error("Không thể tải dữ liệu dịch vụ")
        
        const data = await response.json()
        setFormData({
          title: data.title ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          categoryId: data.categoryId ?? "none",
          longDescription: data.longDescription ?? "",
          metaTitle: data.metaTitle ?? "",
          metaDescription: data.metaDescription ?? "",
          metaKeywords: data.metaKeywords ?? "",
          price: data.price ? String(data.price) : "",
          featured: data.featured ?? false,
          existingImage: data.images && data.images[0] ? data.images[0].url : "",
        })
        setImagePreview(data.images?.[0]?.url || null)
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu dịch vụ",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (id) fetchService()
  }, [id])

  // Validation functions (same as create page)
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Tên dịch vụ là bắt buộc"
        if (value.length > 100) return "Tên dịch vụ không được vượt quá 100 ký tự"
        return ""
      case "slug":
        if (!value.trim()) return "Slug là bắt buộc"
        if (!/^[a-z0-9-]+$/.test(value)) return "Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang"
        if (value.length > 100) return "Slug không được vượt quá 100 ký tự"
        return ""
      case "description":
        if (value.length > 500) return "Mô tả không được vượt quá 500 ký tự"
        return ""
      case "longDescription":
        if (!value.trim()) return "Nội dung là bắt buộc"
        return ""
      case "metaTitle":
        if (value.length > 70) return "Meta title không được vượt quá 70 ký tự"
        return ""
      case "metaDescription":
        if (value.length > 160) return "Meta description không được vượt quá 160 ký tự"
        return ""
      case "price":
        if (value && (Number.isNaN(Number(value)) || Number(value) < 0)) 
          return "Giá phải là số không âm"
        return ""
      default:
        return ""
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)

    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value),
      }))
      setErrors((prev) => ({
        ...prev,
        [name]: error,
        slug: validateField("slug", generateSlug(value)),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handlelongDescriptionChange = (value: string) => {
    const error = validateField("longDescription", value)
    setFormData((prev) => ({ ...prev, longDescription: value }))
    setErrors((prev) => ({ ...prev, longDescription: error }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, image: "Kích thước ảnh không được vượt quá 5MB" }))
        return
      }
      
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Vui lòng chọn file ảnh" }))
        return
      }

      setImageFile(file)
      setErrors((prev) => ({ ...prev, image: "" }))

      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(formData.existingImage || null)
    setErrors((prev) => ({ ...prev, image: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }))
  }
  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = {
      title: validateField("title", formData.title),
      slug: validateField("slug", formData.slug),
      description: validateField("description", formData.description),
      longDescription: validateField("longDescription", formData.longDescription),
      metaTitle: validateField("metaTitle", formData.metaTitle),
      metaDescription: validateField("metaDescription", formData.metaDescription),
      metaKeywords: validateField("metaKeywords", formData.metaKeywords),
      price: validateField("price", formData.price),
      image: errors.image,
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some(error => error !== "")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      let imageUrl = formData.existingImage
      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Không thể tải lên hình ảnh")
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      // Prepare service data with correct structure
      const serviceData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        longDescription: formData.longDescription,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        price: formData.price ? Number.parseFloat(formData.price) : 0,
        featured: formData.featured,
        categoryId: formData.categoryId === "none" ? null : formData.categoryId,
        images: imageUrl ? [{ url: imageUrl, alt: formData.title }] : []
      }

      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Không thể cập nhật dịch vụ")
      }

      toast({
        title: "Thành công",
        description: "Dịch vụ đã được cập nhật thành công",
      })
      router.push("/admin/services")
      router.refresh()
    } catch (error: any) {
      console.error("Error updating service: ", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật dịch vụ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.title) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh Sửa Dịch Vụ</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Thông Tin Cơ Bản</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Tên Dịch Vụ <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tên dịch vụ"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                required={true}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="ten-dich-vu"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                required={true}
              />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh Mục</Label>
              <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger
                  id="category"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                >
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
              <Label htmlFor="price">Giá Dịch Vụ (VNĐ)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="Nhập giá dịch vụ (nếu có)"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="featured" 
                checked={formData.featured}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, featured: checked === true }))}
              />
              <Label htmlFor="featured" className="font-normal cursor-pointer">
                Dịch vụ nổi bật (hiển thị ở trang chủ)
              </Label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Mô Tả Ngắn</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả ngắn về dịch vụ"
                className="min-h-[100px] border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Nội Dung Chi Tiết</h2>
          <div className="space-y-2">
            <Label htmlFor="content">Nội Dung <span className="text-red-500">*</span></Label>
            <AdminEditor
              value={formData.longDescription}
              onChange={handlelongDescriptionChange}
              placeholder="Nhập nội dung chi tiết về dịch vụ..."
            />
            {errors.longDescription && <p className="text-sm text-red-500">{errors.longDescription}</p>}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Hình Ảnh Dịch Vụ</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
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
                <span className="text-sm text-gray-400">{imageFile ? imageFile.name : "Chưa chọn file mới"}</span>
              </div>
              {errors.image && <p className="text-sm text-red-500 mt-2">{errors.image}</p>}
            </div>

            <div>
              <div className="relative h-[300px] w-full">
                {imagePreview ? (
                  <div className="relative h-full w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1 hover:bg-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800">
                    <span className="text-gray-400">Xem trước hình ảnh</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Thông Tin SEO</h2>
          <div className="grid gap-6 md:grid-cols-2">
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
              {errors.metaTitle && <p className="text-sm text-red-500">{errors.metaTitle}</p>}
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
              {errors.metaDescription && <p className="text-sm text-red-500">{errors.metaDescription}</p>}
            </div>
            
<div className="space-y-2 md:col-span-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleChange}
                placeholder="Nhập từ khóa SEO, phân cách bằng dấu phẩy"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
              {errors.metaKeywords && <p className="text-sm text-red-500">{errors.metaKeywords}</p>}
              <p className="text-xs text-gray-400">Các từ khóa giúp tìm kiếm dễ dàng hơn, phân cách bằng dấu phẩy</p>
            </div>

          </div>
        </div>

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
                Đang Cập Nhật...
              </>
            ) : (
              "Cập Nhật Dịch Vụ"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}