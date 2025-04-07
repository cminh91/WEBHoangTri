"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  customerName: string | null
  customerPhone: string | null
  total: number
  createdAt: string
  address: {
    address: string
    city: string
    district: string
    ward: string
  } | null
}

export default function CustomerListPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/customers')
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
    try {
      const res = await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.filter(order => order.id !== id))
      } else {
        alert('Xóa thất bại')
      }
    } catch (error) {
      console.error(error)
      alert('Có lỗi xảy ra')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách khách hàng đã mua hàng</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800 text-white">
                <th className="p-2 border border-zinc-700">Tên khách</th>
                <th className="p-2 border border-zinc-700">Số điện thoại</th>
                <th className="p-2 border border-zinc-700">Địa chỉ</th>
                <th className="p-2 border border-zinc-700">Tổng tiền</th>
                <th className="p-2 border border-zinc-700">Ngày tạo</th>
                <th className="p-2 border border-zinc-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border border-zinc-700">
                  <td className="p-2 border border-zinc-700">{order.customerName || 'Ẩn danh'}</td>
                  <td className="p-2 border border-zinc-700">{order.customerPhone || 'Ẩn danh'}</td>
                  <td className="p-2 border border-zinc-700">
                    {order.address ? `${order.address.address}, ${order.address.ward}, ${order.address.district}, ${order.address.city}` : 'Không có'}
                  </td>
                  <td className="p-2 border border-zinc-700">{order.total.toLocaleString()} VND</td>
                  <td className="p-2 border border-zinc-700">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="p-2 border border-zinc-700">
                    <Button variant="destructive" onClick={() => handleDelete(order.id)}>
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}