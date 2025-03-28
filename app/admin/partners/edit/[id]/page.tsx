"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { ImageUpload } from "@/components/admin/image-upload"

// Form schema with refined validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }).max(100),
  logo: z.string().min(1, { message: "Vui lòng tải lên logo" }),
  url: z.string().url({ message: "URL phải hợp lệ" }).optional().or(z.literal("")),
  order: z.coerce.number().int().min(0, { message: "Thứ tự phải là số không âm" }),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditPartnerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [logoImages, setLogoImages] = useState<{ url: string; alt?: string }[]>([])
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

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

  // Fetch partner data
  useEffect(() => {
    if (!id) return

    const fetchPartner = async () => {
      try {
        const response = await fetch(`/api/partners/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu đối tác")
        }

        const data: FormValues = await response.json()
        form.reset(data)
        
        if (data.logo) {
          setLogoImages([{ url: data.logo, alt: data.name }])
        }
      } catch (error) {
        console.error("Fetch error:", error)
        toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Không thể tải dữ liệu",
          variant: "destructive",
        })
        router.push("/admin/partners")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPartner()
  }, [id, form, router])

  // Handle logo changes
  const handleLogoChange = (images: { url: string; alt?: string }[]) => {
    setLogoImages(images)
    form.setValue("logo", images[0]?.url || "", { shouldValidate: true })
  }

  // Handle logo removal
  const handleLogoRemove = (url: string) => {
    const updatedImages = logoImages.filter((image) => image.url !== url)
    setLogoImages(updatedImages)
    form.setValue("logo", updatedImages[0]?.url || "", { shouldValidate: true })
  }

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/partners/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Không thể cập nhật đối tác")
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật đối tác thành công",
      })
      
      router.push("/admin/partners")
      router.refresh()
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          asChild 
          variant="outline" 
          size="icon" 
          className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
        >
          <Link href="/admin/partners">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-zinc-100">Chỉnh sửa đối tác</h1>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-zinc-100">Thông tin đối tác</CardTitle>
          <CardDescription className="text-zinc-400">
            Cập nhật thông tin chi tiết của đối tác
          </CardDescription>
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
                        className="border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-red-600"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={() => (
                  <FormItem>
                    <FormLabel>Logo đối tác</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={logoImages}
                        onChange={handleLogoChange}
                        onRemove={handleLogoRemove}
                        multiple={false}
                      />
                    </FormControl>
                    <FormDescription>
                      Tải lên logo mới hoặc giữ logo hiện tại
                    </FormDescription>
                    <FormMessage className="text-red-500" />
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
                        className="border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-red-600"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
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
                          className="border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-red-600"
                        />
                      </FormControl>
                      <FormDescription>
                        Số nhỏ hơn sẽ hiển thị trước
                      </FormDescription>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-zinc-100">
                          Trạng thái
                        </FormLabel>
                        <FormDescription className="text-zinc-400">
                          Hiển thị đối tác trên website
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-red-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/partners")}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật
                    </>
                  ) : (
                    "Cập nhật đối tác"
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