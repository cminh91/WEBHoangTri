"use client"

import  React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { generateSlug } from "@/lib/utils"
import AdminEditor from "@/components/admin/admin-editor"
import { ImageUpload } from "@/components/admin/image-upload"

// Định nghĩa lại cấu trúc Category
type Category = {
  id: string;
  name: string;
  parentId: string | null;
  subcategories: Category[];
}

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // Update the categories state to include subcategories
  const [categories, setCategories] = useState<Category[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    categoryId: "",
    price: "0",
    salePrice: "0",
    inStock: true,
    featured: false,
    isActive: true,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    images: [] as { url: string; alt?: string }[],
    specs: "",
  })

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?type=PRODUCT&hierarchical=true")
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

    // Auto-generate slug when name changes
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: generateSlug(value),
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  // Handle rich text content change
  const handleLongDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, longDescription: value }))
  }


  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }))
  }

  // Handle images change
  const handleImagesChange = (images: { url: string; alt?: string }[]) => {
    setFormData((prev) => ({ ...prev, images }))
  }

  // Handle image removal
  const handleImageRemove = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image.url !== url),
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.name || !formData.slug || !formData.price) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      // Convert price and salePrice to numbers before sending
      const productData = {
        ...formData,
        price: Number(formData.price),
        salePrice: Number(formData.salePrice)
      }

      // Add product to database
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        throw new Error("Lỗi kết nối máy chủ")
      }

      if (!response.ok) {
        const errorMessage = errorData?.message || 
                           (typeof errorData?.error === 'string' ? errorData.error : JSON.stringify(errorData?.error)) || 
                           "Không thể tạo sản phẩm"
        throw new Error(errorMessage)
      }

      toast({
        title: "Thành công",
        description: "Sản phẩm đã được tạo thành công",
      })

      // Redirect to products list
      router.push("/admin/products")
      router.refresh()
    } catch (error: any) {
      console.error("Error creating product: ", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo sản phẩm",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Hàm đệ quy để render danh mục phân cấp
  const renderCategoryOptions = (categories: Category[], depth = 0): React.ReactNode => {
    return categories.map(category => (
      <React.Fragment key={`category-${category.id}-${depth}`}>
        <SelectItem 
          value={category.id}
          className={depth > 0 ? `pl-${depth * 6}` : ""}
        >
          {depth > 0 ? `${"↳".repeat(depth)} ${category.name}` : category.name}
        </SelectItem>
        
        {category.subcategories.length > 0 && 
          renderCategoryOptions(category.subcategories, depth + 1)
        }
      </React.Fragment>
    ))
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Thêm Sản Phẩm Mới</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Thông Tin Cơ Bản</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên Sản Phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên sản phẩm"
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
                placeholder="ten-san-pham"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                required
              />
              <p className="text-xs text-gray-400">Slug sẽ được sử dụng trong URL. Ví dụ: /san-pham/ten-san-pham</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Danh Mục <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800 focus:border-red-600">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900 text-white max-h-80">
                  {renderCategoryOptions(categories)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">
                Giá gốc (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="Nhập giá gốc"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">
                Giá Bán (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salePrice"
                name="salePrice"
                type="number"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder="Nhập giá bán"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                required
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => handleSwitchChange("inStock", checked)}
                />
                <Label htmlFor="inStock">Còn hàng</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                />
                <Label htmlFor="featured">Sản phẩm nổi bật</Label>
              </div>
            </div>


            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Mô Tả Ngắn</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả ngắn về sản phẩm"
                className="min-h-[100px] border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Hình Ảnh Sản Phẩm</h2>

          <div className="space-y-4">
            <Label>Hình Ảnh Sản Phẩm</Label>
            <ImageUpload
              value={formData.images}
              onChange={handleImagesChange}
              onRemove={handleImageRemove}
              multiple={true}
            />
            <p className="text-xs text-gray-400">
              Bạn có thể tải lên nhiều hình ảnh cho sản phẩm. Hình ảnh đầu tiên sẽ được sử dụng làm hình ảnh chính.
            </p>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Mô Tả Chi Tiết</h2>

          <div className="space-y-2">
            <Label htmlFor="longDescription">Nội Dung Chi Tiết</Label>
            <AdminEditor
              value={formData.longDescription}
              onChange={handleLongDescriptionChange}
              placeholder="Nhập mô tả chi tiết về sản phẩm..."
            />
          </div>
        </div>

        {/* Specifications */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-xl font-semibold">Thông Số Kỹ Thuật</h2>

          <div className="space-y-2">
            <Label htmlFor="specs">Chi Tiết Thông Số</Label>
            <AdminEditor
              value={formData.specs}
              onChange={(value) => setFormData(prev => ({ ...prev, specs: value }))}
              placeholder="Nhập thông số kỹ thuật chi tiết..."
            />
          </div>
        </div>
    {/* SEO Information */}
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
              <p className="text-xs text-gray-400">Nếu để trống, tên sản phẩm sẽ được sử dụng làm meta title</p>
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
              <p className="text-xs text-gray-400">Mô tả ngắn gọn về sản phẩm, hiển thị trong kết quả tìm kiếm</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleChange}
                placeholder="Từ khóa 1, Từ khóa 2, Từ khóa 3"
                className="border-zinc-700 bg-zinc-800 focus:border-red-600"
              />
              <p className="text-xs text-gray-400">Các từ khóa liên quan đến sản phẩm, phân cách bằng dấu phẩy</p>
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
              "Lưu Sản Phẩm"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

