"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash, Upload, X, Loader2, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

interface TeamMember {
  id: string
  name: string
  position: string
  bio: string
  image: string
  order: number
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    order: 0,
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  })

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/team")
        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data.sort((a: TeamMember, b: TeamMember) => a.order - b.order))
        }
      } catch (error) {
        console.error("Error fetching team members:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách thành viên",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.startsWith("socialLinks.")) {
      const socialKey = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Clear selected image
  const clearImage = () => {
    setImageFile(null)
    setImagePreview(selectedMember?.image || null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Open dialog to add new team member
  const handleAddMember = () => {
    setSelectedMember(null)
    setFormData({
      name: "",
      position: "",
      bio: "",
      order: teamMembers.length + 1,
      socialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
      },
    })
    setImageFile(null)
    setImagePreview(null)
    setIsDialogOpen(true)
  }

  // Open dialog to edit team member
  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member)
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio || "",
      order: member.order,
      socialLinks: {
        facebook: member.socialLinks?.facebook || "",
        instagram: member.socialLinks?.instagram || "",
        twitter: member.socialLinks?.twitter || "",
      },
    })
    setImagePreview(member.image)
    setIsDialogOpen(true)
  }

  // Open dialog to confirm delete
  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member)
    setIsDeleteDialogOpen(true)
  }

  // Delete team member
  const confirmDelete = async () => {
    if (!memberToDelete) return

    try {
      const response = await fetch(`/api/team/${memberToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Không thể xóa thành viên")
      }

      setTeamMembers(teamMembers.filter((m) => m.id !== memberToDelete.id))

      toast({
        title: "Thành công",
        description: "Thành viên đã được xóa",
      })
    } catch (error) {
      console.error("Error deleting team member:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa thành viên",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setMemberToDelete(null)
    }
  }

  // Save team member
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validate form
      if (!formData.name || !formData.position) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc")
      }

      // Upload image if selected
      let imageUrl = selectedMember?.image || ""
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Không thể tải lên hình ảnh")
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      const memberData = {
        ...formData,
        image: imageUrl,
      }

      const method = selectedMember ? "PUT" : "POST"
      const url = selectedMember ? `/api/team/${selectedMember.id}` : "/api/team"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) {
        throw new Error("Không thể lưu thành viên")
      }

      const savedMember = await response.json()

      if (selectedMember) {
        // Update existing member
        setTeamMembers(
          teamMembers.map((m) => (m.id === savedMember.id ? savedMember : m)).sort((a, b) => a.order - b.order),
        )
      } else {
        // Add new member
        setTeamMembers([...teamMembers, savedMember].sort((a, b) => a.order - b.order))
      }

      toast({
        title: "Thành công",
        description: selectedMember ? "Thành viên đã được cập nhật" : "Thành viên mới đã được tạo",
      })

      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error saving team member:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu thành viên",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản Lý Đội Ngũ</h1>
        <Button onClick={handleAddMember} className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Thêm Thành Viên
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="ml-2 text-xl">Đang tải...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.length === 0 ? (
            <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 p-6">
              <p className="text-gray-400">Chưa có thành viên nào</p>
              <Button onClick={handleAddMember} variant="link" className="mt-2 text-red-600 hover:text-red-500">
                Thêm thành viên mới
              </Button>
            </div>
          ) : (
            teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden border-zinc-800 bg-zinc-950">
                <div className="relative h-60 w-full">
                  <Image
                    src={member.image || "/placeholder.svg?height=240&width=320"}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="text-red-600">{member.position}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="mb-4 text-gray-400 line-clamp-3">{member.bio}</p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                      className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(member)}
                      className="border-zinc-700 bg-zinc-800 text-red-500 hover:bg-zinc-700 hover:text-red-400"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Team Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedMember ? "Chỉnh Sửa Thành Viên" : "Thêm Thành Viên Mới"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedMember ? "Chỉnh sửa thông tin thành viên" : "Điền thông tin để thêm thành viên mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập tên thành viên"
                    className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">
                    Chức Vụ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Nhập chức vụ"
                    className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Tiểu Sử</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Nhập tiểu sử thành viên"
                  className="min-h-[100px] border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Thứ Tự</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleChange}
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="socialLinks.facebook">Facebook</Label>
                  <Input
                    id="socialLinks.facebook"
                    name="socialLinks.facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleChange}
                    placeholder="URL Facebook"
                    className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialLinks.instagram">Instagram</Label>
                  <Input
                    id="socialLinks.instagram"
                    name="socialLinks.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleChange}
                    placeholder="URL Instagram"
                    className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialLinks.twitter">Twitter</Label>
                  <Input
                    id="socialLinks.twitter"
                    name="socialLinks.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleChange}
                    placeholder="URL Twitter"
                    className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Hình Ảnh</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-dashed border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Chọn Hình Ảnh
                  </Button>
                  <Input
                    id="image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-400">
                    {imageFile ? imageFile.name : imagePreview ? "Hình ảnh hiện tại" : "Chưa chọn hình ảnh"}
                  </span>
                </div>

                {imagePreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-lg border border-zinc-700">
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1 hover:bg-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang Lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu Thành Viên
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thành viên</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa thành viên "{memberToDelete?.name}"? Hành động này không thể hoàn tác.
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

