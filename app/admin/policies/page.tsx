"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Loader2, Trash, Edit } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"

interface Policy {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function PoliciesPage() {
  const router = useRouter()
  const [initialLoading, setInitialLoading] = useState(true)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null)

  // Fetch policies
  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/policies")
      if (!response.ok) throw new Error("Failed to fetch policies")
      const data = await response.json()
      console.log("Fetched policies:", data)
      setPolicies(data)
    } catch (error) {
      console.error("Error fetching policies:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách chính sách",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  // Open dialog to confirm delete
  const handleDeleteClick = (policy: Policy) => {
    setPolicyToDelete(policy)
    setIsDeleteDialogOpen(true)
  }

  // Delete policy
  const confirmDelete = async () => {
    if (!policyToDelete) return

    try {
      const response = await fetch(`/api/policies/${policyToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Không thể xóa chính sách")

      await fetchPolicies() // Refresh danh sách sau khi xóa

      toast({
        title: "Thành công",
        description: "Chính sách đã được xóa",
      })
    } catch (error) {
      console.error("Error deleting policy:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa chính sách",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setPolicyToDelete(null)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 text-xl">Đang tải thông tin...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản Lý Chính Sách</h1>
        <Button onClick={() => router.push("/admin/policies/create")} className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Thêm Chính Sách
        </Button>
      </div>

      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle>Danh Sách Chính Sách</CardTitle>
          <CardDescription className="text-gray-400">Quản lý các chính sách của cửa hàng</CardDescription>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed border-zinc-700 p-8 text-center">
              <p className="text-gray-400">Chưa có chính sách nào</p>
              <Button
                onClick={() => router.push("/admin/policies/create")}
                variant="link"
                className="mt-2 text-red-600 hover:text-red-500"
              >
                Thêm chính sách mới
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-center justify-between rounded-md border border-zinc-800 p-4"
                >
                  <div>
                    <h3 className="font-medium">{policy.title}</h3>
                    <p className="text-sm text-gray-400">/{policy.slug}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/policies/edit/${policy.id}`)}
                      className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(policy)}
                      className="border-zinc-700 bg-zinc-800 text-red-500 hover:bg-zinc-700 hover:text-red-400"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chính sách</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa chính sách "{policyToDelete?.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}