import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.ts'

const connectionString = process.env.DATABASE_URL
if (!connectionString || !/^postgres(ql)?:\/\//.test(connectionString)) {
  throw new Error('Set DATABASE_URL to the PostgreSQL connection URL from Prisma Console.')
}

const adapter = new PrismaPg({ connectionString, max: 5, connectionTimeoutMillis: 5000 })

export const prisma = new PrismaClient({ adapter, errorFormat: 'minimal' })
