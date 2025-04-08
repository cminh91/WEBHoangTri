"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, ArrowUpRight, Loader2 } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
import { toast } from "@/components/ui/use-toast"

interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: number
  topPages: Array<{
    path: string
    views: number
  }>
  deviceDistribution: Array<{
    device: string
    count: number
  }>
  dailyData: Array<{
    date: string
    pageViews: number
    uniqueVisitors: number
  }>
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7days")
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics?period=${timeRange}`)
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }
        const data = await response.json()
        console.log("Dữ liệu analytics:", data)
        setAnalyticsData(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu thống kê",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (loading && !analyticsData) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        <span className="ml-2 text-xl">Đang tải dữ liệu thống kê...</span>
      </div>
    )
  }

  // If no data is available yet, show placeholder data
  const data = analyticsData || {
    pageViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    deviceDistribution: [],
    dailyData: [],
  }

  let dailyData: { date: string; pageViews: number }[] = []

  if (Array.isArray((data as any).analytics)) {
    const grouped: Record<string, number> = {}

    for (const item of (data as any).analytics) {
      const dateStr = item.date.slice(0, 10) // yyyy-mm-dd
      grouped[dateStr] = (grouped[dateStr] || 0) + (item.pageViews || 0)
    }

    dailyData = Object.entries(grouped)
      .map(([date, pageViews]) => ({ date, pageViews }))
      .sort((a, b) => a.date.localeCompare(b.date))
  } else {
    dailyData = []
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Thống Kê Truy Cập</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px] border-zinc-700 bg-zinc-800 focus:border-red-600">
            <SelectValue placeholder="Chọn thời gian" />
          </SelectTrigger>
          <SelectContent className="border-zinc-700 bg-zinc-900 text-white">
            <SelectItem value="today">Hôm nay</SelectItem>
            <SelectItem value="yesterday">Hôm qua</SelectItem>
            <SelectItem value="7days">7 ngày qua</SelectItem>
            <SelectItem value="30days">30 ngày qua</SelectItem>
            <SelectItem value="6months">6 tháng qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tổng lượt truy cập */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Lượt Truy Cập</CardTitle>
            <Eye className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data.pageViews || 0).toLocaleString()}
            </div>
            <p className="mt-1 flex items-center text-xs text-green-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              12% so với tuần trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ lượt truy cập theo ngày */}
      <Card className="border-zinc-800 bg-zinc-950 mt-6 p-4">
        <h2 className="mb-4 text-lg font-semibold">Biểu đồ lượt truy cập theo ngày</h2>
        {dailyData.length === 0 ? (
          <p className="text-center text-gray-400">Chưa có dữ liệu biểu đồ</p>
        ) : (
          <Line
            data={{
              labels: dailyData.map((d) => d.date),
              datasets: [
                {
                  label: "Lượt truy cập",
                  data: dailyData.map((d) => d.pageViews),
                  borderColor: "rgb(239, 68, 68)",
                  backgroundColor: "rgba(239, 68, 68, 0.5)",
                  fill: true,
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: "#fff",
                  },
                },
                title: {
                  display: false,
                },
              },
              scales: {
                x: {
                  ticks: { color: "#ccc" },
                  grid: { color: "#333" },
                },
                y: {
                  ticks: { color: "#ccc" },
                  grid: { color: "#333" },
                },
              },
            }}
          />
        )}
      </Card>

      {/* Top Pages */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle>Trang Được Xem Nhiều Nhất</CardTitle>
          <CardDescription className="text-gray-400">Các trang có lượt xem cao nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPages.length === 0 ? (
              <p className="text-center text-gray-400">Chưa có dữ liệu</p>
            ) : (
              data.topPages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{page.path || "/"}</p>
                    <p className="text-sm text-gray-400">{page.views} lượt xem</p>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-red-600"
                        style={{
                          width: `${Math.min(100, (page.views / (data.topPages[0]?.views || 1)) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device Distribution */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle>Phân Bố Thiết Bị</CardTitle>
          <CardDescription className="text-gray-400">Tỷ lệ người dùng theo loại thiết bị</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.deviceDistribution.length === 0 ? (
              <p className="text-center text-gray-400">Chưa có dữ liệu</p>
            ) : (
              data.deviceDistribution.map((device, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{device.device}</p>
                    <p className="text-sm text-gray-400">
                      {Math.round((device.count / data.deviceDistribution.reduce((sum, d) => sum + d.count, 0)) * 100)}%
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full bg-red-600"
                      style={{
                        width: `${Math.round(
                          (device.count / data.deviceDistribution.reduce((sum, d) => sum + d.count, 0)) * 100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

