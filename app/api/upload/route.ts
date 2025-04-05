import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from 'cloudinary'

// Cấu hình cloudinary với env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Kiểm tra người dùng đã đăng nhập
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Chuyển file thành base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload lên Cloudinary
    const result = await cloudinary.uploader.upload(base64File, {
      folder: 'hoang-tri-moto', // Tên folder trên Cloudinary
      resource_type: 'auto'
    })

    // Trả về secure URL của ảnh
    return NextResponse.json({ 
      url: result.secure_url,
      public_id: result.public_id 
    })

  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Error uploading file", details: error?.message }, 
      { status: 500 }
    )
  }
}

