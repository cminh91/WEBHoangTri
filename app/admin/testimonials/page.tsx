"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreVertical, Edit, Trash, Star, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Testimonial {
  id: string
  name: string
  position: string | null
  company: string | null
  content: string
  rating: number
  image: string | null
  isActive: boolean
  order: number
  createdAt: Date
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // Fetch testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials")
        if (!response.ok) {
          throw new Error("Failed to fetch testimonials")
        }
        const data = await response.json()
        setTestimonials(data)
      } catch (error) {
        console.error("Error fetching testimonials: ", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đánh giá",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  // Filter testimonials based on search query
  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (testimonial.position || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (testimonial.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-400"
            }`}
          />
        ))}
      </div>
    )
  }

  // Handle delete testimonial
  const handleDeleteClick = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!testimonialToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/testimonials/${testimonialToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete testimonial")
      }

      // Update state
      setTestimonials(testimonials.filter((t) => t.id !== testimonialToDelete.id))

      toast({
        title: "Thành công",
        description: `Đã xóa đánh giá của "${testimonialToDelete.name}"`,
      })
    } catch (error) {
      console.error("Error deleting testimonial: ", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa đánh giá",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setTestimonialToDelete(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Quản Lý Đánh Giá</h1>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/testimonials/create">
            <Plus className="mr-2 h-4 w-4" />
            Thêm Đánh Giá
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, vị trí, công ty hoặc nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border-zinc-700 bg-zinc-800 focus:border-red-600"
          />
        </div>
      </div>

      {/* Testimonials table */}
      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              <TableHead className="w-[60px]">Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Vị trí & Công ty</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-red-600" />
                  <span className="mt-2 block">Đang tải dữ liệu...</span>
                </TableCell>
              </TableRow>
            ) : filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Không tìm thấy đánh giá nào
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial.id} className="border-zinc-800 hover:bg-zinc-900">
                  <TableCell>
                    {testimonial.image ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                        <span className="text-sm font-bold">{testimonial.name.charAt(0)}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{testimonial.name}</TableCell>
                  <TableCell>
                    {testimonial.position && (
                      <div className="font-medium">{testimonial.position}</div>
                    )}
                    {testimonial.company && (
                      <div className="text-sm text-gray-400">{testimonial.company}</div>
                    )}
                  </TableCell>
                  <TableCell>{renderRating(testimonial.rating)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{testimonial.content}</TableCell>
                  <TableCell>{testimonial.order}</TableCell>
                  <TableCell>
                    {testimonial.isActive ? (
                      <div className="flex items-center">
                        <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                        <span>Hiển thị</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircle className="mr-1 h-4 w-4 text-red-500" />
                        <span>Ẩn</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 text-white">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/testimonials/edit/${testimonial.id}`)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(testimonial)}
                          className="text-red-500 hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Xóa</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa đánh giá của "{testimonialToDelete?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 