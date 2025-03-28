import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  const password = await hash("admin123", 12)
  
  const admin = await prisma.user.create({
    data: {
      name: "admin",
      email: "admin@example.com",
      password,
      role: "ADMIN"
    }
  })

  console.log("Admin created:", admin)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })