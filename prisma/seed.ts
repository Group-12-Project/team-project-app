import { prisma } from '../server/db.ts'
import { seedDevelopmentProfile } from './seedProfile.ts'

try {
  await seedDevelopmentProfile(prisma)
  console.log('Fictional development profile and academic data seeded; saved edits preserved.')
} catch {
  console.error('Seeding failed. Check local configuration and applied migrations.')
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
