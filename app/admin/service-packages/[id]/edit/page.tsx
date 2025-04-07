"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import ServicePackageForm from "@/components/admin/ServicePackageForm"

interface ServicePackage {
  id: string
  name: string
  price: number
  description: string
  features: string[] | null
}

export default function EditServicePackage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params as { id: string }

  const [loading, setLoading] = useState(true)
  const [pkg, setPkg] = useState<ServicePackage | null>(null)

  useEffect(() => {
    const fetchPackage = async () => {
      const res = await fetch(`/api/admin/service-packages`)
      if (res.ok) {
        const data = await res.json()
        const found = data.find((p: any) => p.id === id)
        if (!found) {
          alert("Không tìm thấy gói dịch vụ")
          router.push("/admin/service-packages")
          return
        }
        setPkg(found)
      } else {
        alert("Lỗi khi tải dữ liệu")
        router.push("/admin/service-packages")
      }
      setLoading(false)
    }
    fetchPackage()
  }, [id, router])

  const handleUpdate = async (data: {
    name: string
    price: number
    description: string
    features: string[]
  }) => {
    const payload = { ...data, id }

    const res = await fetch("/api/admin/service-packages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      router.push("/admin/service-packages")
    } else {
      alert("Lỗi khi cập nhật gói dịch vụ")
    }
  }

  if (loading) return <div className="p-6">Đang tải...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa gói dịch vụ</h1>
      <ServicePackageForm
        initialData={{
          name: pkg?.name || "",
          price: pkg?.price || 0,
          description: pkg?.description || "",
          features: pkg?.features || []
        }}
        onSubmit={handleUpdate}
        onCancel={() => router.push("/admin/service-packages")}
        submitText="Cập nhật"
      />
    </div>
  )
}