"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { slugify } from "@/lib/utils"
import { ImageUpload } from "@/components/admin/image-upload"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  type: "PRODUCT" | "SERVICE" | "NEWS"
  parentId: string | null
  imageUrl: string | null
  isActive: boolean
  // featured: boolean
}

interface CategoryDialogProps {
  children: React.ReactNode
  category?: Category
  parentCategory?: Category
  defaultType?: "PRODUCT" | "SERVICE" | "NEWS"
}

const formSchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  slug: z.string().min(1, "Slug là bắt buộc"),
  description: z.string().optional(),
  type: z.enum(["PRODUCT", "SERVICE", "NEWS"]),
  parentId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true), // Thêm isActive vào schema
})

export function CategoryDialog({ children, category, parentCategory, defaultType = "PRODUCT" }: CategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const { toast } = useToast()
  const isEditing = !!category
  const [slugManuallyModified, setSlugManuallyModified] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      type: category?.type || parentCategory?.type || defaultType,
      parentId: category?.parentId || parentCategory?.id || null,
      imageUrl: category?.imageUrl || "",
      isActive: category?.isActive ?? true, // Đảm bảo có giá trị mặc định
    },
  })

  const selectedType = form.watch("type")

  useEffect(() => {
    if (open) {
      fetchCategories(selectedType)
    }
  }, [open, selectedType])

  const fetchCategories = async (type: string) => {
    try {
      const response = await fetch(`/api/categories?type=${type}`)
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      const response = await fetch(isEditing ? `/api/categories/${category.id}` : "/api/categories", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Có lỗi xảy ra")
      }

      toast({
        title: "Thành công",
        description: isEditing ? "Đã cập nhật danh mục" : "Đã thêm danh mục mới",
      })

      setOpen(false)
      window.location.reload() // Refresh to see changes
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (value: string) => {
    form.setValue("name", value)
    if (!slugManuallyModified) {
      form.setValue("slug", slugify(value))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyModified(true)
    form.setValue("slug", e.target.value)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Cập nhật thông tin danh mục" : "Thêm danh mục mới vào hệ thống"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên danh mục"
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ten-danh-muc" 
                      {...field} 
                      onChange={handleSlugChange}
                    />
                  </FormControl>
                  <FormDescription>URL thân thiện cho danh mục</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại danh mục</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!parentCategory}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
                      <SelectItem value="SERVICE">Dịch vụ</SelectItem>
                      <SelectItem value="NEWS">Tin tức</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Loại danh mục xác định nơi danh mục sẽ được sử dụng</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục cha</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""} disabled={!!parentCategory}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục cha (nếu có)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Không có danh mục cha</SelectItem>
                      {categories
                        .filter((c) => c.id !== category?.id) // Prevent self-reference
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Chọn danh mục cha nếu đây là danh mục con</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <ImageUpload
                        value={field.value ? [{ url: field.value }] : []}
                        onChange={(urls) => field.onChange(urls[0]?.url || "")}
                        onRemove={() => field.onChange("")}
                        multiple={false}
                      />
                  
                    </div>
                  </FormControl>
                  <FormDescription>Hình ảnh cho danh mục (kích thước nhỏ, tỷ lệ 1:1)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Trạng thái</FormLabel>
                    <FormDescription>
                      Bật/tắt hiển thị danh mục này trên website
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả cho danh mục"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Cập nhật" : "Thêm"} danh mục
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

