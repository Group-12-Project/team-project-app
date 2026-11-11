import { prisma } from '../server/db.ts'

// Reserved fictional fixture ID. Re-running the seed updates only this fixture.
try {
  await prisma.$transaction(async (tx) => {
    await tx.users.upsert({
      where: { id: 900001n },
      create: {
        id: 900001n,
        full_name: 'Demo Student',
        university_email: 'demo.student@example.invalid',
        role: 'student',
        account_status: 'active',
      },
      update: {},
    })
    await tx.student_profiles.upsert({
      where: { user_id: 900001n },
      create: {
        user_id: 900001n,
        preferred_name: 'Demo Student',
        student_status: 'Current graduate student',
        career_goal: 'Build accessible educational software.',
      },
      update: {},
    })
    for (const [display_order, interest_name] of ['Accessible design', 'Software engineering'].entries()) {
      await tx.profile_interests.upsert({
        where: { student_user_id_interest_name: { student_user_id: 900001n, interest_name } },
        create: { student_user_id: 900001n, interest_name, display_order },
        update: { display_order },
      })
    }
  })
  console.log('Fictional development profile seeded.')
} catch {
  console.error('Seeding failed. Check local configuration and applied migrations.')
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
