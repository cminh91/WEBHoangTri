"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"

export default function AnalyticsSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    googleAnalyticsId: "",
    googleTagManagerId: "",
    metaPixelId: "",
    enableGoogleAnalytics: false,
    enableMetaPixel: false,
    customHeadScripts: "",
    customBodyStartScripts: "",
    customBodyEndScripts: "",
  })

  // Fetch analytics settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings/analytics")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setFormData({
              googleAnalyticsId: data.googleAnalyticsId || "",
              googleTagManagerId: data.googleTagManagerId || "",
              metaPixelId: data.metaPixelId || "",
              enableGoogleAnalytics: data.enableGoogleAnalytics || false,
              enableMetaPixel: data.enableMetaPixel || false,
              customHeadScripts: data.customHeadScripts || "",
              customBodyStartScripts: data.customBodyStartScripts || "",
              customBodyEndScripts: data.customBodyEndScripts || "",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching analytics settings:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải cài đặt phân tích",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/settings/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Không thể lưu cài đặt phân tích")
      }

      toast({
        title: "Thành công",
        description: "Cài đặt phân tích đã được lưu",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error saving analytics settings:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu cài đặt phân tích",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cài Đặt Phân Tích & Theo Dõi</h1>
        <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang Lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu Thay Đổi
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="google" className="space-y-4">
        <TabsList className="bg-zinc-900">
          <TabsTrigger value="google" className="data-[state=active]:bg-red-600">
            Google Analytics
          </TabsTrigger>
          <TabsTrigger value="meta" className="data-[state=active]:bg-red-600">
            Meta Pixel
          </TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-red-600">
            Mã Tùy Chỉnh
          </TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle>Google Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Cài đặt Google Analytics để theo dõi lưu lượng truy cập trang web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableGoogleAnalytics"
                  checked={formData.enableGoogleAnalytics}
                  onCheckedChange={(checked) => handleSwitchChange("enableGoogleAnalytics", checked)}
                />
                <Label htmlFor="enableGoogleAnalytics">Kích hoạt Google Analytics</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID (GA4)</Label>
                <Input
                  id="googleAnalyticsId"
                  name="googleAnalyticsId"
                  value={formData.googleAnalyticsId}
                  onChange={handleChange}
                  placeholder="G-XXXXXXXXXX"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
                <p className="text-xs text-gray-400">Nhập ID Google Analytics 4 của bạn (bắt đầu bằng G-)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                <Input
                  id="googleTagManagerId"
                  name="googleTagManagerId"
                  value={formData.googleTagManagerId}
                  onChange={handleChange}
                  placeholder="GTM-XXXXXXX"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
                <p className="text-xs text-gray-400">Nhập ID Google Tag Manager của bạn (bắt đầu bằng GTM-)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle>Meta Pixel</CardTitle>
              <CardDescription className="text-gray-400">
                Cài đặt Meta Pixel (Facebook Pixel) để theo dõi chuyển đổi và tối ưu hóa quảng cáo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableMetaPixel"
                  checked={formData.enableMetaPixel}
                  onCheckedChange={(checked) => handleSwitchChange("enableMetaPixel", checked)}
                />
                <Label htmlFor="enableMetaPixel">Kích hoạt Meta Pixel</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaPixelId">Meta Pixel ID</Label>
                <Input
                  id="metaPixelId"
                  name="metaPixelId"
                  value={formData.metaPixelId}
                  onChange={handleChange}
                  placeholder="XXXXXXXXXXXXXXXXXX"
                  className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
                <p className="text-xs text-gray-400">Nhập ID Meta Pixel của bạn (chỉ số, không có dấu gạch ngang)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader>
              <CardTitle>Mã Tùy Chỉnh</CardTitle>
              <CardDescription className="text-gray-400">
                Thêm mã JavaScript tùy chỉnh vào trang web của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customHeadScripts">Mã trong thẻ &lt;head&gt;</Label>
                <Textarea
                  id="customHeadScripts"
                  name="customHeadScripts"
                  value={formData.customHeadScripts}
                  onChange={handleChange}
                  placeholder="<!-- Mã JavaScript hoặc CSS -->"
                  className="min-h-[150px] font-mono text-sm border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
                <p className="text-xs text-gray-400">Mã này sẽ được chèn vào thẻ &lt;head&gt; của trang web</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customBodyStartScripts">Mã đầu thẻ &lt;body&gt;</Label>
                <Textarea
                  id="customBodyStartScripts"
                  name="customBodyStartScripts"
                  value={formData.customBodyStartScripts}
                  onChange={handleChange}
                  placeholder="<!-- Mã JavaScript -->"
                  className="min-h-[150px] font-mono text-sm border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
                <p className="text-xs text-gray-400">Mã này sẽ được chèn vào đầu thẻ &lt;body&gt; của trang web</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customBodyEndScripts">Mã cuối thẻ &lt;body&gt;</Label>
                <Textarea
                  id="customBodyEndScripts"
                  name="customBodyEndScripts"
                  value={formData.customBodyEndScripts}
                  onChange={handleChange}
                  placeholder="<!-- Mã JavaScript -->"
                  className="min-h-[150px] font-mono text-sm border-zinc-700 bg-zinc-800 focus:border-red-600"
                />
                <p className="text-xs text-gray-400">Mã này sẽ được chèn vào cuối thẻ &lt;body&gt; của trang web</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

