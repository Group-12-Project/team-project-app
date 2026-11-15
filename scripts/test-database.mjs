import 'dotenv/config'
import { spawnSync } from 'node:child_process'
const url = process.env.TEST_DATABASE_URL
if (!url || !new URL(url).pathname.endsWith('_test') || url === process.env.DATABASE_URL) {
  throw new Error('Provide a separate TEST_DATABASE_URL ending in _test; the development URL is never used as fallback.')
}
const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url }
for (const args of [['prisma', 'migrate', 'deploy'], ['tsx', 'prisma/seed.ts'], ['tsx', 'scripts/verify-profile-api.ts']]) {
  const result = spawnSync('npx', args, { env, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}
