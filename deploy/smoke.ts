import assert from 'node:assert/strict'
import { envSecret } from '@prisma/composer-prisma-cloud'
import { bootstrapService } from '@prisma/composer-prisma-cloud/testing'
import service from './service.ts'

// Fictional, unreachable database: this checks boot and HTTP behavior, not cloud access.
process.env.GRADPATH_SMOKE_DB = 'postgresql://demo:demo@127.0.0.1:1/demo'
const instance = await bootstrapService(service, {
  service: { port: 43179 },
  inputs: {},
  input: { databaseUrl: envSecret('GRADPATH_SMOKE_DB') },
})

try {
  const health = await fetch(new URL('/health', instance.url))
  assert.equal(health.status, 200)
  assert.deepEqual(await health.json(), { status: 'ok' })
  const missing = await fetch(new URL('/missing', instance.url))
  assert.equal(missing.status, 404)
  const database = await fetch(new URL('/health/db', instance.url))
  assert.equal(database.status, 503)
  assert.deepEqual(await database.json(), { database: 'unavailable' })
  console.log('PASS: built Composer service boots; liveness, 404, and sanitized database failure verified.')
} catch (error) {
  console.error(error)
  process.exit(1)
}
process.kill(process.pid, 'SIGTERM')
