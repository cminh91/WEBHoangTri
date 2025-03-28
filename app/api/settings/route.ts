import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try {
    // Thêm log để debug
    console.log("Fetching settings from database...")

    // Kiểm tra xem có settings nào không
    const allSettings = await prisma.settings.findMany()
    console.log("All settings:", allSettings)

    const settings = await prisma.settings.findFirst({
      where: {
        key: 'store'
      }
    })
    
    console.log("Store settings:", settings)

    // Nếu không có settings, tạo mới với giá trị mặc định
    if (!settings) {
      console.log("No settings found, creating default settings...")
      const defaultSettings = {
        storeName: "MOTO EDIT",
        socialLinks: {
          youtube: "https://www.youtube.com/watch?v=a5iBWIYagrQ",
          facebook: "",
          instagram: ""
        }
      }

      const newSettings = await prisma.settings.create({
        data: {
          key: 'store',
          value: JSON.stringify(defaultSettings)
        }
      })
      
      console.log("Created default settings:", newSettings)
      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}
