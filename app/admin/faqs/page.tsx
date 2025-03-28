"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import { Plus, Search, MoreVertical, Edit, Trash, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  order: number
  isActive: boolean
  createdAt: Date
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // Fetch FAQs from database
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch("/api/faqs")
        if (!response.ok) {
          throw new Error("Failed to fetch FAQs")
        }
        const data = await response.json()
        setFaqs(data)
      } catch (error) {
        console.error("Error fetching FAQs: ", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách FAQ",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  // Filter FAQs based on search query
  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (faq.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle delete FAQ
  const handleDeleteClick = (faq: FAQ) => {
    setFaqToDelete(faq)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!faqToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/faqs/${faqToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete FAQ")
      }

      // Update state
      setFaqs(faqs.filter((f) => f.id !== faqToDelete.id))

      toast({
        title: "Thành công",
        description: `Đã xóa FAQ "${faqToDelete.question}"`,
      })
    } catch (error) {
      console.error("Error deleting FAQ: ", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa FAQ",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setFaqToDelete(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Quản Lý Câu Hỏi Thường Gặp (FAQ)</h1>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/faqs/create">
            <Plus className="mr-2 h-4 w-4" />
            Thêm FAQ Mới
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm câu hỏi, câu trả lời hoặc danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border-zinc-700 bg-zinc-800 focus:border-red-600"
          />
        </div>
      </div>

      {/* FAQs table */}
      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              <TableHead>Câu Hỏi</TableHead>
              <TableHead>Câu Trả Lời</TableHead>
              <TableHead>Danh Mục</TableHead>
              <TableHead>Thứ Tự</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-red-600" />
                  <span className="mt-2 block">Đang tải câu hỏi...</span>
                </TableCell>
              </TableRow>
            ) : filteredFAQs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không tìm thấy câu hỏi nào
                </TableCell>
              </TableRow>
            ) : (
              filteredFAQs.map((faq) => (
                <TableRow key={faq.id} className="border-zinc-800 hover:bg-zinc-900">
                  <TableCell className="font-medium max-w-[200px] truncate">{faq.question}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{faq.answer}</TableCell>
                  <TableCell>{faq.category || "Chung"}</TableCell>
                  <TableCell>{faq.order}</TableCell>
                  <TableCell>
                    {faq.isActive ? (
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
                          onClick={() => router.push(`/admin/faqs/edit/${faq.id}`)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(faq)}
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
            <AlertDialogTitle>Xác nhận xóa FAQ</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa câu hỏi "{faqToDelete?.question}"? Hành động này không thể hoàn tác.
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