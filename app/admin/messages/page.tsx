"use client"

import { useState, useEffect } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, MoreVertical, Eye, Trash, Loader2, Mail } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  read: boolean
  createdAt: Date
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/contact-form")
        if (response.ok) {
          const data = await response.json()
          console.log("Contact form data:", data)
          setMessages(data)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách tin nhắn",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  // Filter messages based on search query
  const filteredMessages = messages.filter(
    (message) =>
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (message.subject && message.subject.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Handle view message
  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)
    setViewDialogOpen(true)

    // Mark as read if not already read
    if (!message.read) {
      try {
        const response = await fetch(`/api/contact-form/${message.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ read: true }),
        })

        if (response.ok) {
          // Update message in state
          setMessages(messages.map((m) => (m.id === message.id ? { ...m, read: true } : m)))
        }
      } catch (error) {
        console.error("Error marking message as read:", error)
      }
    }
  }

  // Handle delete message
  const handleDeleteClick = (message: ContactMessage) => {
    setMessageToDelete(message)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!messageToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/contact-form/${messageToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Không thể xóa tin nhắn")
      }

      // Update state
      setMessages(messages.filter((m) => m.id !== messageToDelete.id))

      toast({
        title: "Thành công",
        description: "Tin nhắn đã được xóa",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa tin nhắn",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setMessageToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản Lý Tin Nhắn</h1>
        <Badge variant="outline" className="bg-red-600 text-white">
          {messages.filter((m) => !m.read).length} Chưa đọc
        </Badge>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm tin nhắn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border-zinc-700 bg-zinc-800 focus:border-red-600"
          />
        </div>
      </div>

      {/* Messages table */}
      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              <TableHead>Người Gửi</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Tiêu Đề</TableHead>
              <TableHead className="hidden md:table-cell">Ngày Gửi</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-red-600" />
                  <span className="mt-2 block">Đang tải tin nhắn...</span>
                </TableCell>
              </TableRow>
            ) : filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không tìm thấy tin nhắn nào
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow
                  key={message.id}
                  className={`border-zinc-800 hover:bg-zinc-900 ${!message.read ? "bg-zinc-900" : ""}`}
                >
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell className="hidden max-w-xs truncate md:table-cell">
                    {message.subject || "(Không có tiêu đề)"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(message.createdAt)}</TableCell>
                  <TableCell>
                    {message.read ? (
                      <Badge variant="outline" className="bg-zinc-700 text-gray-300">
                        Đã đọc
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600">Chưa đọc</Badge>
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
                          onClick={() => handleViewMessage(message)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Xem</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(message)}
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

      {/* View Message Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi Tiết Tin Nhắn</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tin nhắn từ {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Người Gửi</p>
                <p>{selectedMessage?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Email</p>
                <p>{selectedMessage?.email}</p>
              </div>
              {selectedMessage?.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-400">Số Điện Thoại</p>
                  <p>{selectedMessage.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-400">Ngày Gửi</p>
                <p>{selectedMessage && formatDate(selectedMessage.createdAt)}</p>
              </div>
            </div>
            {selectedMessage?.subject && (
              <div>
                <p className="text-sm font-medium text-gray-400">Tiêu Đề</p>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-400">Nội Dung</p>
              <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-900 p-4">
                <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
              className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            >
              Đóng
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                window.location.href = `mailto:${selectedMessage?.email}?subject=Re: ${
                  selectedMessage?.subject || "Phản hồi từ Hoàng Trí Moto"
                }`
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Trả Lời
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tin nhắn</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa tin nhắn từ "{messageToDelete?.name}"? Hành động này không thể hoàn tác.
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

