import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = "admin@hoangtrimo.to"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hash("admin123", 10)
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    })
    console.log("Admin user created")
  } else {
    console.log("Admin user already exists")
  }

  // Create initial categories if they don't exist
  const productCategory = await prisma.category.findFirst({
    where: { type: "PRODUCT", name: "Xe Máy" },
  })

  if (!productCategory) {
    await prisma.category.create({
      data: {
        name: "Xe Máy",
        slug: "xe-may",
        type: "PRODUCT",
        description: "Các loại xe máy phân khối lớn",
      },
    })
    console.log("Initial product category created")
  }

  const serviceCategory = await prisma.category.findFirst({
    where: { type: "SERVICE", name: "Sửa Chữa" },
  })

  if (!serviceCategory) {
    await prisma.category.create({
      data: {
        name: "Sửa Chữa",
        slug: "sua-chua",
        type: "SERVICE",
        description: "Dịch vụ sửa chữa xe máy",
      },
    })
    console.log("Initial service category created")
  }

  const newsCategory = await prisma.category.findFirst({
    where: { type: "NEWS", name: "Tin Tức" },
  })

  if (!newsCategory) {
    await prisma.category.create({
      data: {
        name: "Tin Tức",
        slug: "tin-tuc",
        type: "NEWS",
        description: "Tin tức về xe máy",
      },
    })
    console.log("Initial news category created")
  }

  console.log("Database seeding completed")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

