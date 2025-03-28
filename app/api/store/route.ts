import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for store settings validation
const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  workingHours: z.record(z.string()),
  socialLinks: z.record(z.string()),
  mapUrl: z.string().optional(),
})

export async function GET() {
  try {
    // Get the store settings
    const settings = await prisma.settings.findFirst({
      where: {
        key: "store",
      },
    })

    if (!settings) {
      return NextResponse.json({
        storeName: "",
        address: "",
        phone: "",
        email: "",
        workingHours: {
          monday: "8:00 - 18:00",
          tuesday: "8:00 - 18:00",
          wednesday: "8:00 - 18:00",
          thursday: "8:00 - 18:00",
          friday: "8:00 - 18:00",
          saturday: "8:00 - 17:00",
          sunday: "9:00 - 15:00",
        },
        socialLinks: {
          facebook: "",
          instagram: "",
          youtube: "",
        },
        mapUrl: "",
      })
    }

    const storeData = JSON.parse(settings.value);
    
    // Format workingHours as a string if it's an object
    if (storeData.workingHours && typeof storeData.workingHours === 'object') {
      const hours = storeData.workingHours;
      const weekdays = hours.monday || "8:00 - 18:00";
      const saturday = hours.saturday || "8:00 - 17:00";
      const sunday = hours.sunday || "Nghỉ";
      
      storeData.workingHoursFormatted = `Thứ 2 - Thứ 6: ${weekdays}, Thứ 7: ${saturday}, CN: ${sunday}`;
    }

    return NextResponse.json(storeData)
  } catch (error) {
    console.error("Error fetching store settings:", error)
    return NextResponse.json({ error: "Error fetching store settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = storeSettingsSchema.parse(json)

    // Check if store settings already exist
    const existingSettings = await prisma.settings.findFirst({
      where: {
        key: "store",
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
          key: "store",
          value: JSON.stringify(data),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating store settings:", error)
    return NextResponse.json({ error: "Error updating store settings" }, { status: 500 })
  }
}

