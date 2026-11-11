import { prisma } from '../server/db.ts'

try {
  await prisma.$queryRaw`SELECT 1`
  const profile = await prisma.student_profiles.findUnique({
    where: { user_id: 900001n },
    include: { profile_interests: true },
  })
  if (profile?.preferred_name !== 'Demo Student' || profile.profile_interests.length !== 2) {
    throw new Error('Seed verification failed')
  }
  console.log('PASS: Prisma connected to MySQL; fictional profile and two interests verified.')
} catch {
  console.error('FAIL: Database verification failed. Check database health, .env, migrations, and seeds.')
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
