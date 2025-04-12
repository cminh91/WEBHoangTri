"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Save, Loader2 } from "lucide-react"
import Image from "next/image"
import AdminEditor from "@/components/admin/admin-editor"
import { toast } from "@/components/ui/use-toast"

interface StoreInfo {
  id?: string
  name: string
  hotline: string
  logo: string
  favicon: string
  footer: string
}

export default function StorePage() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "",
    hotline: "",
    logo: "",
    favicon: "",
    footer: "",
  })
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/store-info", {
          cache: 'no-store',  // Disable caching
          next: { revalidate: 0 } // Force revalidate
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch store info')
        }

        const data = await response.json()
        if (data && !data.error) {
          setStoreInfo({
            id: data.id || "",
            name: data.name || "",
            hotline: data.hotline || "",
            logo: data.logo || "",
            favicon: data.favicon || "",
            footer: data.footer || "",
          })
        }
      } catch (error: any) {
        console.error("Error fetching store info:", error)
        toast({
          title: "Error",
          description: error.message || "Lỗi khi tải thông tin cửa hàng",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoreInfo()
  }, [])

  const handleFileUpload = async (file: File, type: "logo" | "favicon") => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setStoreInfo(prev => ({ ...prev, [type]: data.url }))
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const method = storeInfo.id ? "PUT" : "POST"
      const url = storeInfo.id 
        ? `/api/store-info/edit/${storeInfo.id}` 
        : "/api/store-info"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storeInfo),
        cache: 'no-store'  // Disable caching
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Đã lưu thông tin cửa hàng",
        })
      } else {
        throw new Error(data.message || "Lỗi khi lưu thông tin")
      }
    } catch (error: any) {
      console.error("Error saving store info:", error)
      toast({
        title: "Error",
        description: error.message || "Lỗi khi lưu thông tin cửa hàng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">Thông tin cửa hàng</h1>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Label>Tên Cửa Hàng</Label>
            <Input
              value={storeInfo.name}
              onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
              placeholder="Nhập tên cửa hàng"
            />
          </div>

          <div className="space-y-4">
            <Label>Hotline</Label>
            <Input
              value={storeInfo.hotline}
              onChange={(e) => setStoreInfo({ ...storeInfo, hotline: e.target.value })}
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Label>Logo Cửa Hàng</Label>
            <div className="flex items-center gap-4">
              {storeInfo.logo ? (
                <Image
                  src={storeInfo.logo}
                  alt="Store Logo"
                  width={120}
                  height={80}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-32 items-center justify-center rounded-lg bg-zinc-800">
                  <span className="text-gray-400">Chưa có logo</span>
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  id="logo"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], "logo")
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-zinc-700 bg-zinc-800"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên logo
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Favicon Cửa Hàng</Label>
            <div className="flex items-center gap-4">
              {storeInfo.favicon ? (
                <Image
                  src={storeInfo.favicon}
                  alt="Store Favicon"
                  width={32}
                  height={32}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                  <span className="text-gray-400">F</span>
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={faviconInputRef}
                  type="file"
                  id="favicon"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], "favicon")
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-zinc-700 bg-zinc-800"
                  onClick={() => faviconInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Tải lên favicon
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Thông Tin Footer</Label>
          <AdminEditor
            value={storeInfo.footer}
            onChange={(value) => setStoreInfo({ ...storeInfo, footer: value })}
            height={200}
            placeholder="Nhập thông tin footer..."
          />
        </div>

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
    </div>
  )
}