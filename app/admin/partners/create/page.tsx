"use client"

import { useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ImageUpload } from "@/components/admin/image-upload"

// Form schema
const formSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  logo: z.string().min(1, "Vui lòng tải lên logo"),
  url: z.string().url("URL phải hợp lệ").optional().or(z.literal("")), // Cho phép URL hợp lệ hoặc chuỗi rỗng
  order: z.coerce.number().int().min(0, "Thứ tự phải là số không âm"),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

export default function CreatePartnerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoImages, setLogoImages] = useState<{ url: string; alt?: string }[]>([])
  const router = useRouter()

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      logo: "",
      url: "",
      order: 0,
      isActive: true,
    },
  })

  // Handle logo images change
  const handleLogoChange = (images: { url: string; alt?: string }[]) => {
    setLogoImages(images)
    // Update form value with the first image URL
    if (images.length > 0) {
      form.setValue("logo", images[0].url, { shouldValidate: true })
    } else {
      form.setValue("logo", "", { shouldValidate: true })
    }
  }

  // Handle logo image removal
  const handleLogoRemove = (url: string) => {
    // Remove image from state
    const updatedImages = logoImages.filter((image) => image.url !== url)
    setLogoImages(updatedImages)
    
    // Update form value
    if (updatedImages.length > 0) {
      form.setValue("logo", updatedImages[0].url, { shouldValidate: true })
    } else {
      form.setValue("logo", "", { shouldValidate: true })
    }
  }

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Đã xảy ra lỗi khi tạo đối tác")
      }

      toast({
        title: "Thành công",
        description: "Đã tạo đối tác mới",
      })

      // Redirect to partners list
      router.push("/admin/partners")
      router.refresh()
    } catch (error) {
      console.error("Error creating partner:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi tạo đối tác",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="icon" className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700">
          <Link href="/admin/partners">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Thêm Đối Tác Mới</h1>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle>Thông tin đối tác</CardTitle>
          <CardDescription>Thêm thông tin của đối tác mới</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đối tác</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập tên đối tác"
                        className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo đối tác</FormLabel>
                    <div className="mb-2">
                      <ImageUpload
                        value={logoImages}
                        onChange={handleLogoChange}
                        onRemove={handleLogoRemove}
                        multiple={false}
                      />
                    </div>
                    <FormDescription>Chọn ảnh logo của đối tác từ máy tính</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (tuỳ chọn)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com"
                        className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                      />
                    </FormControl>
                    <FormDescription>Liên kết đến website của đối tác</FormDescription>
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
                          Hiển thị đối tác này trên website
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
                  onClick={() => router.push("/admin/partners")}
                  className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo đối tác"
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