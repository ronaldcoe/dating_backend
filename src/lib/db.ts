import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
    log: process.env.NODE_ENV === "test" ? [] : ['query', 'error', 'info', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
  console.log('Attempting to connect with URL:', process.env.DATABASE_URL?.split(/@/)[1]) // This will log the connection details without exposing credentials
}