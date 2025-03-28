import 'dotenv/config'
import { PrismaClient } from "@prisma/client"

// Khởi tạo PrismaClient với cấu hình tối ưu
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Đảm bảo chỉ một instance PrismaClient trong development
declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

// Xử lý đóng kết nối khi ứng dụng tắt
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma