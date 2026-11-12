import { prisma } from './db.ts'
import { startBackend } from './app.ts'

startBackend(prisma, Number(process.env.PORT || 3001), process.env.HOST || '127.0.0.1', {
  demoProfileEnabled: process.env.ENABLE_DEMO_PROFILE_API === 'true' && process.env.NODE_ENV !== 'production',
})
