"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import AdminEditor from "@/components/admin/admin-editor"

interface ServicePackageFormProps {
  initialData?: {
    name: string
    price: number | string
    description: string
    features: string[]
  }
  onSubmit: (data: {
    name: string
    price: number
    description: string
    features: string[]
  }) => void
  onCancel: () => void
  submitText?: string
}

export default function ServicePackageForm({
  initialData,
  onSubmit,
  onCancel,
  submitText = "Lưu"
}: ServicePackageFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [price, setPrice] = useState(initialData?.price?.toString() || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [featuresText, setFeaturesText] = useState(initialData?.features?.join("\n") || "")

  const handleSubmit = () => {
    onSubmit({
      name,
      price: parseFloat(price),
      description,
      features: featuresText.split("\n").filter(f => f.trim() !== "")
    })
  }

  return (
    <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-bold">{submitText} gói dịch vụ</h2>

      <div className="space-y-2">
        <label className="block font-semibold">Tên gói</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên gói"
          className="w-full p-3 rounded border border-zinc-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block font-semibold">Giá</label>
        <input
          type="number"
          min="0"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Nhập giá"
          className="w-full p-3 rounded border border-zinc-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block font-semibold">Mô tả</label>
        <AdminEditor value={description} onChange={setDescription} height={250} placeholder="Mô tả chi tiết" />
      </div>

      <div className="space-y-2">
        <label className="block font-semibold">Danh sách tính năng (mỗi dòng 1 tính năng)</label>
        <textarea
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          rows={5}
          placeholder="Nhập các tính năng"
          className="w-full p-3 rounded border border-zinc-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
        <Button onClick={onCancel} variant="outline">Hủy</Button>
        <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">{submitText}</Button>
      </div>
    </div>
  )
}