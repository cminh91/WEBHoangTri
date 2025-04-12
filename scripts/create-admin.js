const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    const password = await bcrypt.hash("admin123", 12);
    
    const admin = await prisma.user.create({
      data: {
        name: "admin",
        email: "admin@example.com",
        password,
        role: "ADMIN"
      }
    });

    console.log("Admin created successfully:", admin);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
