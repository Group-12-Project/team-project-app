import 'dotenv/config'
import { spawnSync } from 'node:child_process'
import { isolatedTestUrl } from './database-target.mjs'
const url = isolatedTestUrl(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL)
const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url }
for (const args of [['prisma', 'migrate', 'deploy'], ['tsx', 'prisma/seed.ts'], ['tsx', 'scripts/verify-profile-api.ts']]) {
  const result = spawnSync('npx', args, { env, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}
