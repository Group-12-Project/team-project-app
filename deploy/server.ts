import service from './service.ts'
import { createPrismaClient } from '../server/client.ts'
import { startBackend } from '../server/app.ts'

const prisma = createPrismaClient(service.input().databaseUrl.expose())
startBackend(prisma, service.port(), '0.0.0.0', { demoProfileEnabled: service.input().demoProfileEnabled })
