"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Eye, MousePointer, Clock, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
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

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Người Dùng Duy Nhất</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data.uniqueVisitors || 0).toLocaleString()}
            </div>
            <p className="mt-1 flex items-center text-xs text-green-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              8% so với tuần trước
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Thoát</CardTitle>
            <MousePointer className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.bounceRate}%</div>
            <p className="mt-1 flex items-center text-xs text-red-500">
              <ArrowDownRight className="mr-1 h-3 w-3" />
              3% so với tuần trước
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thời Gian Trung Bình</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgSessionDuration}s</div>
            <p className="mt-1 flex items-center text-xs text-green-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              10% so với tuần trước
            </p>
          </CardContent>
        </Card>
      </div>

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

