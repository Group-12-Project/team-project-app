import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // Client generation needs no credentials; migration commands require DIRECT_URL.
  datasource: { url: process.env.DIRECT_URL },
})
