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
import { Plus, Search, MoreVertical, Edit, Trash, Eye, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  images: Array<{
    url: string
  }>
  category: {
    name: string
  } | null
  author: string
  publishDate: Date
  tags: string
  createdAt: Date
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // Fetch news from database
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news")
        if (!response.ok) {
          throw new Error("Failed to fetch news")
        }
        const data = await response.json()
        setNews(data)
      } catch (error) {
        console.error("Error fetching news: ", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách tin tức",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Filter news based on search query
  const filteredNews = news.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle delete article
  const handleDeleteClick = (article: NewsArticle) => {
    setArticleToDelete(article)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!articleToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/news/${articleToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete article")
      }

      // Update state
      setNews(news.filter((a) => a.id !== articleToDelete.id))

      toast({
        title: "Thành công",
        description: `Đã xóa bài viết "${articleToDelete.title}"`,
      })
    } catch (error) {
      console.error("Error deleting article: ", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setArticleToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Quản Lý Tin Tức</h1>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/news/create">
            <Plus className="mr-2 h-4 w-4" />
            Thêm Bài Viết
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border-zinc-700 bg-zinc-800 focus:border-red-600"
          />
        </div>
      </div>

      {/* News table */}
      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tiêu Đề</TableHead>
              <TableHead>Danh Mục</TableHead>
              <TableHead className="hidden md:table-cell">Tác Giả</TableHead>
              <TableHead className="hidden md:table-cell">Ngày Đăng</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-red-600" />
                  <span className="mt-2 block">Đang tải tin tức...</span>
                </TableCell>
              </TableRow>
            ) : filteredNews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không tìm thấy bài viết nào
                </TableCell>
              </TableRow>
            ) : (
              filteredNews.map((article) => (
                <TableRow key={article.id} className="border-zinc-800 hover:bg-zinc-900">
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={article.images?.[0]?.url || "/placeholder.svg?height=40&width=40"}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category?.name || "Không có danh mục"}</TableCell>
                  <TableCell className="hidden md:table-cell">{article.author}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(article.publishDate)}</TableCell>
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
                          onClick={() => router.push(`/tin-tuc/${article.id}`)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Xem</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/news/edit/${article.id}`)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(article)}
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
        <AlertDialogContent className="border-zinc-800 bg-zinc-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài viết</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa bài viết "{articleToDelete?.title}"? Hành động này không thể hoàn tác.
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

