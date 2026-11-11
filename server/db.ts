import 'dotenv/config'
import { createPrismaClient } from './client.ts'

export const prisma = createPrismaClient(process.env.DATABASE_URL)
