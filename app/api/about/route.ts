import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for about validation
const aboutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  mission: z.string().optional(),
  vision: z.string().optional(),
  history: z.string().optional(),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string(),
        alt: z.string().optional(),
      }),
    )
    .optional(),
})

export async function GET() {
  try {
    // Get the first about record (there should only be one)
    const about = await prisma.about.findFirst({
      include: {
        images: true,
      },
    })

    return NextResponse.json(about || {})
  } catch (error) {
    console.error("Error fetching about:", error)
    return NextResponse.json({ error: "Error fetching about" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const data = aboutSchema.parse(json)
    const { images, ...aboutData } = data
    const existingAbout = await prisma.about.findFirst()
    let about

    if (existingAbout) {
      about = await prisma.$transaction(async (tx) => {
        const existingImages = await tx.image.findMany({
          where: { aboutId: existingAbout.id }
        })

        if (images) {
          const updatedImageIds = images.filter(img => img.id).map(img => img.id as string)
          const imagesToDelete = existingImages.filter(img => !updatedImageIds.includes(img.id))
          
          for (const image of imagesToDelete) {
            await tx.image.delete({ where: { id: image.id } })
          }
        }

        return await tx.about.update({
          where: { id: existingAbout.id },
          data: {
            ...aboutData,
            images: images ? {
              upsert: images.map(image => ({
                where: { id: image.id || "new-id" },
                update: { url: image.url, alt: image.alt },
                create: { url: image.url, alt: image.alt }
              }))
            } : undefined
          },
          include: { images: true }
        })
      })
    } else {
      about = await prisma.about.create({
        data: {
          ...aboutData,
          images: images ? { create: images } : undefined
        },
        include: { images: true }
      })
    }

    return NextResponse.json(about)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error updating about:", error)
    return NextResponse.json({ error: "Error updating about" }, { status: 500 })
  }
}

