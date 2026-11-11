import { prisma } from './db.ts'
import { startBackend } from './app.ts'

startBackend(prisma, Number(process.env.PORT || 3001), process.env.HOST || '0.0.0.0')
