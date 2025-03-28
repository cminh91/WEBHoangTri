"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
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

interface Slider {
  id: string
  title: string
  subtitle?: string
  url: string
  link?: string
  isActive: boolean
  order: number
}

export default function SliderPage() {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSlider, setSelectedSlider] = useState<Slider | null>(null)

  const fetchSliders = async () => {
    try {
      const response = await fetch("/api/slider")
      if (!response.ok) throw new Error("Failed to fetch sliders")
      const data = await response.json()
      setSliders(data)
    } catch (error) {
      console.error("Error fetching sliders:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách slider",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSliders()
  }, [])

  const handleDelete = async (slider: Slider) => {
    setSelectedSlider(slider)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedSlider) return

    try {
      const response = await fetch(`/api/slider/${selectedSlider.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete slider")

      toast({
        title: "Thành công",
        description: "Đã xóa slider",
      })

      fetchSliders()
    } catch (error) {
      console.error("Error deleting slider:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa slider",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedSlider(null)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Slider</h1>
        <Button onClick={() => router.push("/admin/slider/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Slider
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Thứ tự</TableHead>
              <TableHead className="w-[200px]">Hình ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : sliders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Chưa có slider nào. Hãy thêm slider mới.
                </TableCell>
              </TableRow>
            ) : (
              sliders.map((slider) => (
                <TableRow key={slider.id}>
                  <TableCell>{slider.order}</TableCell>
                  <TableCell>
                    <div className="relative h-20 w-40 overflow-hidden rounded-md">
                      <Image src={slider.url} alt={slider.title} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{slider.title}</p>
                      {slider.subtitle && <p className="text-sm text-gray-500">{slider.subtitle}</p>}
                      {slider.link && <p className="text-xs text-blue-500 truncate mt-1">Link: {slider.link}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{slider.isActive ? "Hiển thị" : "Ẩn"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/slider/edit/${slider.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(slider)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa slider này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}