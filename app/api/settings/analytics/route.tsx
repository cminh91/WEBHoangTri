import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for analytics settings validation
const analyticsSettingsSchema = z.object({
  googleAnalyticsId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  metaPixelId: z.string().optional(),
  enableGoogleAnalytics: z.boolean().default(false),
  enableMetaPixel: z.boolean().default(false),
  customHeadScripts: z.string().optional(),
  customBodyStartScripts: z.string().optional(),
  customBodyEndScripts: z.string().optional(),
})

export async function GET() {
  try {
    // Get the analytics settings
    const settings = await prisma.settings.findFirst({
      where: {
        key: "analytics",
      },
    })

    if (!settings) {
      return NextResponse.json({
        googleAnalyticsId: "",
        googleTagManagerId: "",
        metaPixelId: "",
        enableGoogleAnalytics: false,
        enableMetaPixel: false,
        customHeadScripts: "",
        customBodyStartScripts: "",
        customBodyEndScripts: "",
      })
    }

    return NextResponse.json(JSON.parse(settings.value))
  } catch (error) {
    console.error("Error fetching analytics settings:", error)
    return NextResponse.json({ error: "Error fetching analytics settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = analyticsSettingsSchema.parse(json)

    // Check if analytics settings already exist
    const existingSettings = await prisma.settings.findFirst({
      where: {
        key: "analytics",
      },
    })

    if (existingSettings) {
      // Update existing settings
      await prisma.settings.update({
        where: {
          id: existingSettings.id,
        },
        data: {
          value: JSON.stringify(data),
        },
      })
    } else {
      // Create new settings
      await prisma.settings.create({
        data: {
          key: "analytics",
          value: JSON.stringify(data),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating analytics settings:", error)
    return NextResponse.json({ error: "Error updating analytics settings" }, { status: 500 })
  }
}

