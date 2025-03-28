"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Star, Trash } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ImageUpload } from "@/components/admin/image-upload"

// Form schema
const formSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  position: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  image: z.string().url("Hình ảnh phải là URL hợp lệ").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
})

type FormValues = z.infer<typeof formSchema>

interface Testimonial {
  id: string
  name: string
  position?: string
  company?: string
  content: string
  rating: number
  image?: string
  isActive: boolean
  order: number
  createdAt: string
}

export default function EditTestimonialPage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null)
  const [avatarImages, setAvatarImages] = useState<{ url: string; alt?: string }[]>([])
  const router = useRouter()

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: "",
      company: "",
      content: "",
      rating: 5,
      image: "",
      isActive: true,
      order: 0,
    },
  })

  // Fetch testimonial data
  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const response = await fetch(`/api/testimonials/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch testimonial")
        }
        const data = await response.json()
        setTestimonial(data)
        
        // Set form values
        form.reset({
          name: data.name,
          position: data.position || "",
          company: data.company || "",
          content: data.content,
          rating: data.rating,
          image: data.image || "",
          isActive: data.isActive,
          order: data.order,
        })
        
        // Initialize avatar images
        if (data.image) {
          setAvatarImages([{ url: data.image }])
        }
      } catch (error) {
        console.error("Error fetching testimonial:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin đánh giá",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonial()
  }, [params.id, form])

  // Handle avatar images change
  const handleAvatarChange = (images: { url: string; alt?: string }[]) => {
    setAvatarImages(images)
    // Update form value with the first image URL
    if (images.length > 0) {
      form.setValue("image", images[0].url, { shouldValidate: true })
    } else {
      form.setValue("image", "", { shouldValidate: true })
    }
  }

  // Handle avatar image removal
  const handleAvatarRemove = (url: string) => {
    // Remove image from state
    const updatedImages = avatarImages.filter((image) => image.url !== url)
    setAvatarImages(updatedImages)
    
    // Update form value
    if (updatedImages.length > 0) {
      form.setValue("image", updatedImages[0].url, { shouldValidate: true })
    } else {
      form.setValue("image", "", { shouldValidate: true })
    }
  }

  // Render stars for rating
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < count ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
        }`}
      />
    ))
  }

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/testimonials/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Đã xảy ra lỗi khi cập nhật đánh giá")
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin đánh giá",
      })

      // Redirect to testimonials list
      router.push("/admin/testimonials")
      router.refresh()
    } catch (error) {
      console.error("Error updating testimonial:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật đánh giá",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle testimonial deletion
  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/testimonials/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Đã xảy ra lỗi khi xóa đánh giá")
      }

      toast({
        title: "Thành công",
        description: "Đã xóa đánh giá",
      })

      // Redirect to testimonials list
      router.push("/admin/testimonials")
      router.refresh()
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi xóa đánh giá",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!testimonial) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700">
            <Link href="/admin/testimonials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Không tìm thấy đánh giá</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700">
            <Link href="/admin/testimonials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh Sửa Đánh Giá</h1>
        </div>
        <Button
          onClick={handleDelete}
          variant="destructive"
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xóa...
            </>
          ) : (
            <>
              <Trash className="mr-2 h-4 w-4" />
              Xóa đánh giá
            </>
          )}
        </Button>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle>Thông tin đánh giá</CardTitle>
          <CardDescription>Chỉnh sửa thông tin đánh giá từ khách hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên khách hàng</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập tên người đánh giá"
                          className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vị trí (tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ví dụ: CEO, Manager, Kỹ sư,..."
                          className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Công ty (tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Tên công ty hoặc tổ chức"
                          className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đánh giá (1-5 sao)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            max="5"
                            className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                          />
                          <div className="flex">{renderStars(field.value)}</div>
                        </div>
                      </FormControl>
                      <FormDescription>Đánh giá từ 1 (thấp nhất) đến 5 (cao nhất)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung đánh giá</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập nội dung đánh giá từ khách hàng"
                        className="min-h-32 border-zinc-700 bg-zinc-800 focus:border-red-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh khách hàng (tuỳ chọn)</FormLabel>
                    <div className="mb-2">
                      <ImageUpload
                        value={avatarImages}
                        onChange={handleAvatarChange}
                        onRemove={handleAvatarRemove}
                        multiple={false}
                      />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="URL hình ảnh"
                        className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                      />
                    </FormControl>
                    <FormDescription>Chọn ảnh đại diện của người đánh giá hoặc nhập URL trực tiếp</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự hiển thị</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                        />
                      </FormControl>
                      <FormDescription>Số nhỏ hơn sẽ hiển thị trước</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Trạng thái</FormLabel>
                        <FormDescription>
                          Hiển thị đánh giá này trên website
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/testimonials")}
                  className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật đánh giá"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 