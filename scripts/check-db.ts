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
  // Exercise the corrected models through the generated client without changing data.
  await prisma.advisor_assignments.count()
  await prisma.weekly_time_preferences.count()
  const roles = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
    SELECT e.enumlabel FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'users_role'
  `
  if (!roles.some(({ enumlabel }) => enumlabel === 'advisor')) {
    throw new Error('Advisor role missing')
  }
  const constraints = await prisma.$queryRaw<Array<{ conname: string; definition: string }>>`
    SELECT c.conname, pg_get_constraintdef(c.oid) AS definition
    FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE n.nspname = 'public'
  `
  for (const name of [
    'fk_career_opportunities_course', 'fk_career_opportunities_skill',
    'fk_course_history_course', 'fk_course_history_term',
  ]) {
    if (!constraints.some((c) => c.conname === name && c.definition.includes('ON DELETE SET NULL'))) {
      throw new Error('Incorrect foreign key deletion behavior')
    }
  }
  for (const name of ['ck_advisor_assignment_dates', 'ck_weekly_prefs_time', 'ck_weekly_prefs_weekday']) {
    if (!constraints.some((c) => c.conname === name && c.definition.startsWith('CHECK'))) {
      throw new Error('Business constraint missing')
    }
  }
  console.log('PASS: PostgreSQL connected; fixture, corrected models, advisor role, foreign keys, and business checks verified.')
} catch {
  console.error('FAIL: Database verification failed. Check database health, .env, migrations, and seeds.')
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
