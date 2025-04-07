"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import AdminEditor from "@/components/admin/admin-editor"

interface ServicePackage {
  id: string
  name: string
  price: number
  description: string
  features: string[] | null
}

export default function ServicePackagesAdmin() {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ServicePackage | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [featuresText, setFeaturesText] = useState("")

  const fetchPackages = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/service-packages")
    const data = await res.json()
    setPackages(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const resetForm = () => {
    setEditing(null)
    setName("")
    setPrice("")
    setDescription("")
    setFeaturesText("")
    setShowForm(false)
  }

  const handleSubmit = async () => {
    const payload = {
      name,
      price: parseFloat(price),
      description,
      features: featuresText.split("\n").filter(f => f.trim() !== "")
    }

    const method = editing ? "PUT" : "POST"
    const url = "/api/admin/service-packages"
    const body = editing ? { ...payload, id: editing.id } : payload

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    if (res.ok) {
      fetchPackages()
      resetForm()
    } else {
      alert("Lỗi khi lưu gói dịch vụ")
    }
  }

  const handleEdit = (pkg: ServicePackage) => {
    setEditing(pkg)
    setName(pkg.name)
    setPrice(pkg.price.toString())
    setDescription(pkg.description || "")
    setFeaturesText(pkg.features ? pkg.features.join("\n") : "")
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return
    const res = await fetch(`/api/admin/service-packages?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      fetchPackages()
    } else {
      alert("Lỗi khi xóa")
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý gói dịch vụ</h1>
        <a href="/admin/service-packages/create">
          <Button className="bg-green-600 hover:bg-green-700">Tạo mới</Button>
        </a>
      </div>

      <h2 className="text-xl font-bold mb-4">Danh sách gói dịch vụ</h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="space-y-4">
          {packages.map(pkg => (
            <div key={pkg.id} className="border border-zinc-700 rounded p-4 bg-zinc-900">
              <h3 className="font-bold text-lg">{pkg.name}</h3>
              <p className="text-green-500 font-semibold">{pkg.price.toLocaleString()} VND</p>
              <div dangerouslySetInnerHTML={{ __html: pkg.description }} className="prose prose-invert mt-2" />
              <ul className="mt-2 list-disc list-inside text-gray-300">
                {pkg.features?.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2">
                <a href={`/admin/service-packages/${pkg.id}/edit`}>
                  <Button size="sm">Sửa</Button>
                </a>
                <Button onClick={() => handleDelete(pkg.id)} size="sm" variant="destructive">Xóa</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}