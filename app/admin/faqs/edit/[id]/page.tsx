"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

// Form schema
const formSchema = z.object({
  question: z.string().min(2, "Câu hỏi phải có ít nhất 2 ký tự"),
  answer: z.string().min(2, "Câu trả lời phải có ít nhất 2 ký tự"),
  category: z.string().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

export default function EditFAQPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { id } = params

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "",
      order: 0,
      isActive: true,
    },
  })

  // Fetch FAQ data
  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const response = await fetch(`/api/faqs/${id}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch FAQ")
        }
        
        const data = await response.json()
        
        // Set form values
        form.reset({
          question: data.question,
          answer: data.answer,
          category: data.category || "",
          order: data.order,
          isActive: data.isActive,
        })
      } catch (error) {
        console.error("Error fetching FAQ:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin FAQ",
          variant: "destructive",
        })
        router.push("/admin/faqs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFAQ()
  }, [id, form, router])

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Đã xảy ra lỗi khi cập nhật FAQ")
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật FAQ",
      })

      // Redirect to FAQs list
      router.push("/admin/faqs")
      router.refresh()
    } catch (error) {
      console.error("Error updating FAQ:", error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật FAQ",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2">Đang tải...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="icon" className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700">
          <Link href="/admin/faqs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Chỉnh Sửa FAQ</h1>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle>Thông tin FAQ</CardTitle>
          <CardDescription>Cập nhật thông tin câu hỏi thường gặp</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Câu hỏi</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập câu hỏi thường gặp"
                        className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Câu trả lời</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập câu trả lời chi tiết"
                        className="min-h-32 border-zinc-700 bg-zinc-800 focus:border-red-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục (tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ví dụ: Sản phẩm, Dịch vụ, Thanh toán,..."
                          className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                        />
                      </FormControl>
                      <FormDescription>Phân loại câu hỏi theo chủ đề</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Trạng thái</FormLabel>
                      <FormDescription>
                        Hiển thị FAQ này trên website
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

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/faqs")}
                  className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
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