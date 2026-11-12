import 'dotenv/config'
import assert from 'node:assert/strict'
import { fork, type ChildProcess } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { prisma as db } from '../server/db.ts'
import type { PrismaClient, Prisma } from '../server/generated/prisma/client.ts'
import { createProfileRepository } from '../server/profile/repository.ts'
import { seedDevelopmentProfile } from '../prisma/seedProfile.ts'

const userId = BigInt(`0x${randomBytes(6).toString('hex')}`) + 1000000000000n
let created = false
let child: ChildProcess | undefined

async function start(id: bigint, unavailable = false, enabled = true) {
  child = fork(new URL('./profile-verification-server.ts', import.meta.url), [id.toString(), enabled ? 'enabled' : 'disabled'], {
    execArgv: ['--import', 'tsx'], stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    env: { ...process.env, ...(unavailable && { DATABASE_URL: 'postgresql://demo:demo@127.0.0.1:1/demo' }) },
  })
  const processHandle = child
  const port = await new Promise<number>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Backend startup timed out')), 15000)
    processHandle.once('message', (message) => { clearTimeout(timeout); resolve((message as { port: number }).port) })
    processHandle.once('exit', () => { clearTimeout(timeout); reject(new Error('Backend exited before ready')) })
  })
  return `http://127.0.0.1:${port}`
}
async function stop() {
  if (!child || child.exitCode !== null) return
  const processHandle = child
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => { processHandle.kill('SIGKILL'); reject(new Error('Backend shutdown timed out')) }, 10000)
    processHandle.once('exit', () => { clearTimeout(timeout); resolve() })
    processHandle.kill('SIGTERM')
  })
  child = undefined
}
async function call(base: string, body?: unknown, raw?: string) {
  const response = await fetch(`${base}/api/profile`, {
    ...(body !== undefined || raw !== undefined ? { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: raw ?? JSON.stringify(body) } : {}),
  })
  return { status: response.status, body: await response.json() }
}

try {
  const source = await db.student_profiles.findUniqueOrThrow({ where: { user_id: 900001n }, include: { profile_interests: true, course_history: true } })
  const selected = await createProfileRepository(db).get()
  assert.equal(selected.id, 'sample-current-student-001')
  assert.equal(selected.graduateProgram, 'M.S. Computer Science')
  assert.equal(selected.expectedGraduation, 'May 2027')
  assert.equal(typeof selected.gpa, 'string')
  assert.ok(Number.isInteger(selected.creditsRequired) && selected.creditsRequired > 0)
  assert.ok(selected.courseHistory.length > 0)
  await seedDevelopmentProfile(db)
  assert.deepEqual(await createProfileRepository(db).get(), selected)
  console.log('PASS: repeated seed preserves the selected profile and does not duplicate history.')
  const seededBase = await start(900001n)
  const selectedHttp = await call(seededBase)
  assert.equal(selectedHttp.status, 200)
  assert.deepEqual(selectedHttp.body, selected)
  await stop()

  await db.users.create({ data: {
    id: userId, full_name: 'Fictional API Verification Student', role: 'student',
    university_email: `api-${userId}@example.invalid`,
    student_profiles: { create: {
      preferred_name: source.preferred_name, career_goal: source.career_goal,
      program_id: source.program_id, concentration_id: source.concentration_id,
      student_status: source.student_status, expected_graduation: source.expected_graduation,
      gpa: source.gpa, recorded_completed_credits: source.recorded_completed_credits,
      recorded_required_credits: source.recorded_required_credits,
      profile_interests: { create: source.profile_interests.map(({ interest_name, display_order }) => ({ interest_name, display_order })) },
      course_history: { create: source.course_history.map(({ course_code_snapshot, course_title_snapshot, completion_status, earned_credits, term_id }) => ({ course_code_snapshot, course_title_snapshot, completion_status, earned_credits, term_id })) },
    } },
  } })
  created = true
  let base = await start(userId)
  const before = await call(base)
  assert.equal(before.status, 200)
  assert.equal(before.body.id, 'sample-current-student-001')
  assert.deepEqual(Object.keys(before.body).sort(), Object.keys(selected).sort())
  assert.doesNotThrow(() => JSON.stringify(before.body))
  console.log('PASS: GET contract fields, academic values, and opaque identity mapping.')

  const patch = { preferredName: '  Demo Updated Student  ', academicInterests: [' Databases ', '', 'databases', 'Accessible design'], careerGoal: '  Build accessible tools for graduate students.  ' }
  const updated = await call(base, patch)
  assert.equal(updated.status, 200)
  assert.equal(updated.body.preferredName, 'Demo Updated Student')
  assert.deepEqual(updated.body.academicInterests, ['Databases', 'Accessible design'])
  for (const key of Object.keys(before.body).filter((key) => !['preferredName', 'careerGoal', 'academicInterests'].includes(key))) {
    assert.deepEqual(updated.body[key], before.body[key])
  }
  assert.deepEqual((await call(base)).body, updated.body)
  assert.deepEqual((await call(base, patch)).body, updated.body)
  assert.equal(await db.profile_interests.count({ where: { student_user_id: userId } }), 2)
  await stop()
  base = await start(userId)
  assert.deepEqual((await call(base)).body, updated.body)
  console.log('PASS: PATCH normalized and persisted; a fresh backend process retrieves identical values without reseeding.')

  const rejected = await call(base, { careerGoal: 'Do not save this goal.', gpa: '4.0' })
  assert.equal(rejected.status, 400)
  assert.equal(rejected.body.error.code, 'FIELD_NOT_ALLOWED')
  assert.deepEqual((await call(base)).body, updated.body)
  for (const [body, status, code] of [
    [{}, 400, 'INVALID_REQUEST'], [null, 400, 'INVALID_REQUEST'],
    [{ preferredName: 'A' }, 422, 'VALIDATION_ERROR'],
    [{ academicInterests: null }, 422, 'VALIDATION_ERROR'],
    [{ id: 'other-user' }, 400, 'FIELD_NOT_ALLOWED'],
  ] as const) {
    const response = await call(base, body)
    assert.equal(response.status, status)
    assert.equal(response.body.error.code, code)
  }
  assert.equal((await call(base, undefined, '{broken')).body.error.code, 'INVALID_REQUEST')
  assert.deepEqual((await call(base)).body, updated.body)
  console.log('PASS: malformed, invalid, read-only and identity updates rejected without changes.')

  const goalOnly = await call(base, { careerGoal: 'A partial goal change.' })
  assert.deepEqual(goalOnly.body.academicInterests, updated.body.academicInterests)
  assert.equal(goalOnly.body.preferredName, updated.body.preferredName)
  await call(base, { academicInterests: [] })
  const cleared = await call(base)
  assert.deepEqual(cleared.body.academicInterests, [])
  console.log('PASS: partial updates preserve omitted fields; empty interests persist.')

  const identity = { userId, publicId: 'sample-current-student-001' }
  // Fault injection is limited to this fixture: make an actual invalid interest write
  // after a scalar update and interest deletion in the repository's real transaction.
  const faultDb = {
    $transaction: (work: (tx: Prisma.TransactionClient) => unknown) => db.$transaction(async (tx) => {
      const faulty = new Proxy(tx, { get(target, key) {
        if (key !== 'student_profiles') return Reflect.get(target, key)
        return { update: async () => {
          await tx.student_profiles.update({ where: { user_id: userId }, data: { preferred_name: 'Rollback marker' } })
          await tx.profile_interests.deleteMany({ where: { student_user_id: userId } })
          await tx.profile_interests.create({ data: { student_user_id: userId, interest_name: 'x'.repeat(121) } })
        } }
      } })
      return work(faulty)
    }),
  } as unknown as PrismaClient
  await assert.rejects(createProfileRepository(faultDb, identity).update({ preferredName: 'Rollback marker', academicInterests: ['Rollback interest'] }), { code: 'INTERNAL_ERROR' })
  assert.deepEqual((await call(base)).body, cleared.body)
  console.log('PASS: actual interest constraint failure rolls back preceding scalar and interest changes.')

  // Concurrent requests touch distinct fields; neither request replaces omitted values.
  const concurrent = await Promise.all([call(base, { preferredName: 'Concurrent Demo' }), call(base, { careerGoal: 'Concurrent goal remains stored.' })])
  assert.ok(concurrent.every((response) => response.status === 200))
  const final = await call(base)
  assert.equal(final.body.preferredName, 'Concurrent Demo')
  assert.equal(final.body.careerGoal, 'Concurrent goal remains stored.')
  console.log('PASS: concurrent partial updates preserve both committed fields.')

  await writeFile('docs/profile-api-examples.json', JSON.stringify({
    provenance: 'Actual local HTTP responses against hosted PostgreSQL. GET selects development profile 900001. PATCH responses use a temporary isolated fictional fixture with the same public alias in its test server; its history IDs therefore differ from the selected profile. Fixture deleted after verification.',
    selectedDevelopmentGet: { status: selectedHttp.status, response: selectedHttp.body },
    successfulPatch: { request: patch, status: updated.status, response: updated.body },
    rejectedUpdate: { request: { careerGoal: 'Do not save this goal.', gpa: '4.0' }, status: rejected.status, response: rejected.body },
  }, null, 2) + '\n')
  await db.users.delete({ where: { id: userId } })
  created = false
  assert.equal((await call(base)).status, 404)
  assert.equal((await call(base, { preferredName: 'Missing Demo' })).body.error.code, 'PROFILE_NOT_FOUND')
  console.log('PASS: missing GET/PATCH return 404 without creating a replacement.')
  await stop()

  base = await start(900001n, true)
  const unavailable = await call(base)
  assert.equal(unavailable.status, 503)
  assert.equal(unavailable.body.error.code, 'SERVICE_UNAVAILABLE')
  assert.ok(!JSON.stringify(unavailable).includes('postgresql://'))
  console.log('PASS: actual database unavailability returns sanitized 503.')
  await stop()
  base = await start(900001n, true, false)
  assert.equal((await call(base)).status, 404)
  console.log('PASS: demo profile endpoint is unavailable when development access is disabled.')
} catch {
  console.error('FAIL: profile API verification failed; driver details and credentials omitted.')
  process.exitCode = 1
} finally {
  try { await stop() } catch { console.error('FAIL: verification backend cleanup failed.'); process.exitCode = 1 }
  if (created) {
    try { await db.users.delete({ where: { id: userId } }) }
    catch { console.error('FAIL: temporary fixture cleanup failed.'); process.exitCode = 1 }
  }
  await db.$disconnect()
}
