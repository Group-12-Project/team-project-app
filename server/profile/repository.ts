import { Prisma, type PrismaClient } from '../generated/prisma/client.ts'
import { ProfileError, profileFailure } from './errors.ts'
import { validateProfilePatch } from './validation.ts'

export const DEMO_PROFILE = { userId: 900001n, publicId: 'sample-current-student-001' } as const
export interface ProfileIdentity { userId: bigint; publicId: string }

const select = {
  preferred_name: true, career_goal: true, student_status: true,
  recorded_completed_credits: true, recorded_required_credits: true,
  expected_graduation: true, gpa: true,
  programs: { select: { program_name: true, required_credits: true } },
  concentrations: { select: { concentration_name: true } },
  profile_interests: {
    select: { interest_name: true },
    orderBy: [{ display_order: 'asc' }, { interest_id: 'asc' }],
  },
  course_history: {
    orderBy: { history_id: 'asc' },
    select: {
      history_id: true, course_code_snapshot: true, course_title_snapshot: true,
      completion_status: true, earned_credits: true,
      courses: { select: { course_code: true, title: true } },
      terms: { select: { term_name: true } },
    },
  },
} satisfies Prisma.student_profilesSelect

type Row = Prisma.student_profilesGetPayload<{ select: typeof select }>

function toResponse(row: Row, publicId: string) {
  const completed = row.recorded_completed_credits?.toNumber() ?? row.course_history
    .filter((course) => ['completed', 'transferred'].includes(course.completion_status))
    .reduce((total, course) => total + course.earned_credits.toNumber(), 0)
  const required = (row.recorded_required_credits ?? row.programs?.required_credits)?.toNumber()
  if (!row.preferred_name || !row.career_goal || !row.student_status || !row.programs?.program_name ||
      !row.expected_graduation || !row.gpa || !Number.isInteger(completed) || completed < 0 ||
      required === undefined || !Number.isInteger(required) || required <= 0) {
    throw new ProfileError(500, 'INTERNAL_ERROR', 'The stored profile is incomplete. Please contact the development team.')
  }
  const courseHistory = row.course_history.map((course) => {
    const code = course.course_code_snapshot ?? course.courses?.course_code
    const title = course.course_title_snapshot ?? course.courses?.title
    if (!code || !title) throw new ProfileError(500, 'INTERNAL_ERROR', 'The stored course history is incomplete.')
    return {
      id: `history-${course.history_id}`, code, title,
      ...(course.terms?.term_name && { term: course.terms.term_name }),
    }
  })
  return {
    id: publicId,
    preferredName: row.preferred_name,
    studentStatus: row.student_status,
    graduateProgram: row.programs.program_name,
    specialization: row.concentrations?.concentration_name ?? null,
    academicInterests: row.profile_interests.map((interest) => interest.interest_name),
    careerGoal: row.career_goal,
    courseHistory,
    creditsCompleted: completed,
    creditsRequired: required,
    expectedGraduation: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(row.expected_graduation),
    gpa: row.gpa.toString(),
  }
}

export type ProfileResponse = ReturnType<typeof toResponse>
export interface ProfileRepository {
  get(): Promise<ProfileResponse>
  update(input: unknown): Promise<ProfileResponse>
}

export function createProfileRepository(db: PrismaClient, identity: ProfileIdentity = DEMO_PROFILE): ProfileRepository {
  return {
    async get() {
      try {
        return await db.$transaction(async (tx) => {
          const row = await tx.student_profiles.findUnique({ where: { user_id: identity.userId }, select })
          if (!row) throw new ProfileError(404, 'PROFILE_NOT_FOUND', 'The selected profile was not found.')
          return toResponse(row, identity.publicId)
        }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead })
      } catch (error) { throw profileFailure(error) }
    },
    async update(input: unknown) {
      const patch = validateProfilePatch(input)
      try {
        return await db.$transaction(async (tx) => {
          // Serialize writes to this profile, including requests changing only interests.
          const locked = await tx.$queryRaw<{ user_id: bigint }[]>`
            SELECT user_id FROM student_profiles WHERE user_id = ${identity.userId} FOR UPDATE
          `
          if (!locked.length) throw new ProfileError(404, 'PROFILE_NOT_FOUND', 'The selected profile was not found.')
          const row = await tx.student_profiles.update({
            where: { user_id: identity.userId },
            data: {
              ...(patch.preferredName !== undefined && { preferred_name: patch.preferredName }),
              ...(patch.careerGoal !== undefined && { career_goal: patch.careerGoal }),
              ...(patch.academicInterests !== undefined && {
                profile_interests: {
                  deleteMany: {},
                  create: patch.academicInterests.map((interest_name, display_order) => ({ interest_name, display_order })),
                },
              }),
            },
            select,
          })
          return toResponse(row, identity.publicId)
        })
      } catch (error) { throw profileFailure(error) }
    },
  }
}
