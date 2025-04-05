import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get file extension
    const originalName = file.name
    const extension = originalName.split(".").pop()?.toLowerCase() || ""

    // Validate file type
    const allowedTypes = ["jpg", "jpeg", "png", "gif", "webp"]
    if (!allowedTypes.includes(extension)) {
      return NextResponse.json({ error: `File type .${extension} is not supported` }, { status: 400 })
    }

    // Generate unique filename
    const fileName = `${uuidv4()}.${extension}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Save file to public/uploads directory
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Generate URL for the uploaded file
    const url = `/uploads/${fileName}`

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error("Detailed upload error:", error)
    return NextResponse.json({ error: "Error uploading files", details: error?.message || "Unknown error" }, { status: 500 })
  }
}
