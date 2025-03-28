"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil, Trash2, ExternalLink } from "lucide-react"

interface Partner {
  id: string
  name: string
  logo: string
  url?: string
  order: number
  isActive: boolean
  createdAt: string
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch("/api/partners")
        
        if (!response.ok) {
          throw new Error("Failed to fetch partners")
        }
        
        const data = await response.json()
        setPartners(data)
      } catch (error) {
        console.error("Error fetching partners:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đối tác",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPartners()
  }, [])

  // Filter partners by search query
  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle partner deletion
  const handleDeleteClick = (partner: Partner) => {
    setPartnerToDelete(partner)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!partnerToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/partners/${partnerToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete partner")
      }

      // Remove the deleted partner from the state
      setPartners((prev) => prev.filter((p) => p.id !== partnerToDelete.id))
      
      toast({
        title: "Thành công",
        description: "Đã xoá đối tác",
      })
    } catch (error) {
      console.error("Error deleting partner:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xoá đối tác",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPartnerToDelete(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold">Quản Lý Đối Tác</h1>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/partners/create">
            <Plus className="mr-2 h-4 w-4" />
            Thêm đối tác mới
          </Link>
        </Button>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle>Danh sách đối tác</CardTitle>
          <CardDescription>Quản lý các đối tác hiển thị trên website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Tìm kiếm đối tác..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-zinc-700 bg-zinc-800 focus:border-red-600"
            />
          </div>

          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="py-10 text-center text-zinc-400">
              {searchQuery ? "Không tìm thấy đối tác nào phù hợp" : "Chưa có đối tác nào"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4">Logo</th>
                    <th className="text-left py-3 px-4">Tên đối tác</th>
                    <th className="text-left py-3 px-4">Thứ tự</th>
                    <th className="text-left py-3 px-4">Trạng thái</th>
                    <th className="text-right py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map((partner) => (
                    <tr
                      key={partner.id}
                      className="border-b border-zinc-800 hover:bg-zinc-900"
                    >
                      <td className="py-3 px-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded">
                          <Image
                            src={partner.logo}
                            alt={partner.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {partner.name}
                          {partner.url && (
                            <a
                              href={partner.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-zinc-400 hover:text-red-500"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{partner.order}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            partner.isActive
                              ? "bg-green-500/10 text-green-500"
                              : "bg-zinc-500/10 text-zinc-500"
                          }`}
                        >
                          {partner.isActive ? "Hiển thị" : "Ẩn"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                          >
                            <Link href={`/admin/partners/edit/${partner.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteClick(partner)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950">
          <DialogHeader>
            <DialogTitle>Xác nhận xoá</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xoá đối tác{" "}
              <span className="font-semibold text-white">
                {partnerToDelete?.name}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xoá...
                </>
              ) : (
                "Xoá"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 