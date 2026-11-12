import { createServer } from 'node:http'
import type { PrismaClient } from './generated/prisma/client.ts'
import { createProfileRepository, DEMO_PROFILE, type ProfileIdentity } from './profile/repository.ts'
import { handleProfileRequest } from './profile/http.ts'

export interface BackendOptions {
  demoProfileEnabled?: boolean
  profileIdentity?: ProfileIdentity
}

export function startBackend(prisma: PrismaClient, port: number, host: string, options: BackendOptions = {}) {
  const profiles = createProfileRepository(prisma, options.profileIdentity ?? DEMO_PROFILE)
  const server = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json')
    response.setHeader('Cache-Control', 'no-store')
    if (new URL(request.url ?? '/', 'http://localhost').pathname === '/api/profile' && options.demoProfileEnabled) {
      await handleProfileRequest(request, response, profiles)
      return
    }
    if (request.method === 'GET' && request.url === '/health') {
      response.writeHead(200).end(JSON.stringify({ status: 'ok' }))
      return
    }
    if (request.method !== 'GET' || request.url !== '/health/db') {
      response.writeHead(404).end(JSON.stringify({ error: 'Not found' }))
      return
    }
    try {
      await prisma.$queryRaw`SELECT 1`
      response.writeHead(200).end(JSON.stringify({ database: 'connected' }))
    } catch {
      response.writeHead(503).end(JSON.stringify({ database: 'unavailable' }))
    }
  })
  server.requestTimeout = 15000

  server.listen(port, host, () => {
    console.log('Backend ready; GET /health checks the server and /health/db checks database access.')
  })

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      server.close(async () => {
        await prisma.$disconnect()
        process.exit(0)
      })
    })
  }

  return server
}
