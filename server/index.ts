import { createServer } from 'node:http'
import { prisma } from './db.ts'

const server = createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
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

server.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => {
  console.log('Development backend ready; GET /health/db verifies database access.')
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect()
      process.exit(0)
    })
  })
}
