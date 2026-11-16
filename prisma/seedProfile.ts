import type { PrismaClient } from '../server/generated/prisma/client.ts'

/** Completes fictional academic data without resetting saved editable fields. */
export async function seedDevelopmentProfile(db: PrismaClient) {
  await db.$transaction(async (tx) => {
    const program = await tx.programs.upsert({
      where: { program_name_degree_level: { program_name: 'M.S. Computer Science', degree_level: 'masters' } },
      create: { program_name: 'M.S. Computer Science', degree_level: 'masters', required_credits: 30 },
      update: {},
    })
    const concentration = await tx.concentrations.upsert({
      where: { program_id_concentration_name: { program_id: program.program_id, concentration_name: 'Software Engineering' } },
      create: { program_id: program.program_id, concentration_name: 'Software Engineering' }, update: {},
    })
    await tx.users.upsert({
      where: { id: 900001n },
      create: { id: 900001n, full_name: 'Demo Student', university_email: 'demo.student@example.invalid', role: 'student', account_status: 'active' },
      update: {},
    })
    const existing = await tx.student_profiles.findUnique({ where: { user_id: 900001n } })
    const academicData = {
      program_id: existing?.program_id ?? program.program_id,
      concentration_id: existing?.concentration_id ?? (existing?.program_id && existing.program_id !== program.program_id ? null : concentration.concentration_id),
      student_status: existing?.student_status ?? 'Current graduate student',
      expected_graduation: existing?.expected_graduation ?? new Date('2027-05-01T00:00:00Z'),
      gpa: existing?.gpa ?? '3.4',
      recorded_completed_credits: existing?.recorded_completed_credits ?? 24,
      recorded_required_credits: existing?.recorded_required_credits ?? 30,
    }
    await tx.student_profiles.upsert({
      where: { user_id: 900001n },
      create: { user_id: 900001n, preferred_name: 'Demo Student', career_goal: 'Build accessible educational software.', ...academicData },
      update: academicData,
    })
    await tx.$queryRaw`SELECT user_id FROM student_profiles WHERE user_id = ${900001n} FOR UPDATE`
    // Interests are initialized only for a newly created profile; [] is a valid saved value.
    if (!existing) {
      await tx.profile_interests.createMany({ data: ['Accessible design', 'Software engineering'].map((interest_name, display_order) => ({ student_user_id: 900001n, interest_name, display_order })) })
    }
    for (const [code, title, termName] of [
      ['ITCS 6114', 'Algorithms and Data Structures', 'Fall 2026'],
      ['ITCS 6162', 'Knowledge Discovery in Databases', 'Fall 2026'],
      ['ITIS 6155', 'Software Systems Design and Implementation', 'Spring 2026'],
    ]) {
      const term = await tx.terms.upsert({
        where: { term_name_academic_year: { term_name: termName, academic_year: 2026 } },
        create: { term_name: termName, academic_year: 2026 }, update: {},
      })
      const history = await tx.course_history.findFirst({ where: { student_user_id: 900001n, course_code_snapshot: code } })
      if (!history) await tx.course_history.create({ data: {
        student_user_id: 900001n, course_code_snapshot: code, course_title_snapshot: title,
        term_id: term.term_id, completion_status: 'completed', earned_credits: 3,
      } })
    }
  }, { timeout: 15000 })
}
