import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/prisma/client.ts'

const url = new URL(process.env.DATABASE_URL ?? '')
if (url.protocol !== 'mysql:') throw new Error('DATABASE_URL must use mysql://')

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.slice(1)),
  connectionLimit: 5,
  connectTimeout: 5000,
  acquireTimeout: 10000,
})

export const prisma = new PrismaClient({ adapter, errorFormat: 'minimal' })
