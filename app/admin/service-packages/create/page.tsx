"use client"

import { useRouter } from "next/navigation"
import ServicePackageForm from "@/components/admin/ServicePackageForm"

export default function CreateServicePackage() {
  const router = useRouter()

  const handleSubmit = async (data: {
    name: string
    price: number
    description: string
    features: string[]
  }) => {
    const res = await fetch("/api/admin/service-packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    if (res.ok) {
      router.push("/admin/service-packages")
    } else {
      alert("Lỗi khi tạo gói dịch vụ")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Thêm gói dịch vụ mới</h1>
      <ServicePackageForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/service-packages")}
        submitText="Thêm mới"
      />
    </div>
  )
}