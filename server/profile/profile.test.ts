// @vitest-environment node
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import { validateProfilePatch } from './validation.ts'
import { ProfileError, profileFailure } from './errors.ts'
import { handleProfileRequest } from './http.ts'
import type { ProfileRepository } from './repository.ts'

async function request(method: string, body = '', repository?: ProfileRepository, url = '/api/profile', contentType = 'application/json') {
  const req = Object.assign(Readable.from([body]), { method, url, headers: { 'content-type': contentType } }) as unknown as IncomingMessage
  const result = { status: 0, body: '', headers: {} as Record<string, string> }
  const res = {
    setHeader(key: string, value: string) { result.headers[key] = value },
    writeHead(status: number) { result.status = status; return this },
    end(value: string) { result.body = value },
  } as unknown as ServerResponse
  await handleProfileRequest(req, res, repository ?? { get: vi.fn(), update: async (input) => validateProfilePatch(input) as never })
  return { ...result, body: JSON.parse(result.body) }
}

describe('profile request validation contract', () => {
  it.each(['null', '[]', '1', '"name"', '{}', '{broken', ''])('returns INVALID_REQUEST for %s', async (body) => {
    const response = await request('PATCH', body)
    expect(response).toMatchObject({ status: 400, body: { error: { code: 'INVALID_REQUEST' } } })
    expect(response.body.error.fields).toBeUndefined()
  })
  it.each(['id', 'studentStatus', 'graduateProgram', 'specialization', 'courseHistory', 'creditsCompleted', 'creditsRequired', 'expectedGraduation', 'gpa', 'unknown', 'user_id'])('protects %s and rejects the entire patch before validating values', async (key) => {
    const response = await request('PATCH', JSON.stringify({ preferredName: '', [key]: 'forbidden' }))
    expect(response).toMatchObject({ status: 400, body: { error: { code: 'FIELD_NOT_ALLOWED', fields: { [key]: expect.any(String) } } } })
  })
  it.each([
    { preferredName: '' }, { preferredName: ' A ' }, { preferredName: 'a'.repeat(61) },
    { preferredName: null }, { preferredName: 42 },
    { careerGoal: 'ab' }, { careerGoal: 'a'.repeat(301) }, { careerGoal: null },
    { academicInterests: null }, { academicInterests: 'SQL' }, { academicInterests: ['SQL', 1] },
    { academicInterests: ['a'.repeat(51)] }, { academicInterests: Array.from({ length: 9 }, (_, i) => `interest ${i}`) },
  ])('returns VALIDATION_ERROR and API field keys for invalid editable values', async (patch) => {
    const response = await request('PATCH', JSON.stringify(patch))
    expect(response).toMatchObject({ status: 422, body: { error: { code: 'VALIDATION_ERROR', fields: { [Object.keys(patch)[0]]: expect.any(String) } } } })
  })
  it('normalizes names, goals, ordered duplicate interests and blanks', () => {
    expect(validateProfilePatch({ preferredName: '  Demo  ', careerGoal: '  Build tools.  ', academicInterests: [' SQL ', '', 'sql', 'Design', 'DESIGN'] }))
      .toEqual({ preferredName: 'Demo', careerGoal: 'Build tools.', academicInterests: ['SQL', 'Design'] })
    expect(validateProfilePatch({ academicInterests: [] })).toEqual({ academicInterests: [] })
    expect(validateProfilePatch({ careerGoal: 'New goal.' })).toEqual({ careerGoal: 'New goal.' })
  })
  it('counts JavaScript UTF-16 lengths consistently with the frontend', () => {
    expect(validateProfilePatch({ preferredName: '😀'.repeat(30) }).preferredName?.length).toBe(60)
    expect(() => validateProfilePatch({ preferredName: '😀'.repeat(31) })).toThrow(ProfileError)
  })
  it('checks content type and body size', async () => {
    expect((await request('PATCH', '{}', undefined, '/api/profile', 'text/plain')).status).toBe(400)
    expect((await request('PATCH', ' '.repeat(17000))).body.error.code).toBe('INVALID_REQUEST')
  })
  it('does not accept client-selected identities or unsupported methods', async () => {
    expect((await request('GET', '', undefined, '/api/profile?id=2')).status).toBe(400)
    const response = await request('POST')
    expect(response.status).toBe(405)
    expect(response.headers.Allow).toBe('GET, PATCH')
  })
})

describe('profile API responses', () => {
  it('returns the complete profile directly, with no wrapper', async () => {
    const profile = { id: 'sample-current-student-001', preferredName: 'Demo Student' }
    const repository = { get: vi.fn().mockResolvedValue(profile), update: vi.fn().mockResolvedValue(profile) }
    expect((await request('GET', '', repository)).body).toEqual(profile)
    expect((await request('PATCH', '{"preferredName":"Demo Student"}', repository)).body).toEqual(profile)
  })
  it.each([
    [new ProfileError(404, 'PROFILE_NOT_FOUND', 'Missing profile.'), 404, 'PROFILE_NOT_FOUND'],
    [{ code: 'P1001', message: 'private database URL' }, 503, 'SERVICE_UNAVAILABLE'],
    [new Error('postgresql://private:secret@host/db'), 500, 'INTERNAL_ERROR'],
  ] as const)('sanitizes read and save failures', async (failure, status, code) => {
    const repository = { get: vi.fn().mockRejectedValue(failure), update: vi.fn().mockRejectedValue(failure) }
    for (const method of ['GET', 'PATCH']) {
      const response = await request(method, '{"preferredName":"Demo Student"}', repository)
      expect(response).toMatchObject({ status, body: { error: { code } } })
      expect(JSON.stringify(response)).not.toContain('private')
      expect(JSON.stringify(response)).not.toContain('secret')
      expect(response.body.error.fields).toBeUndefined()
    }
  })
  it('maps Prisma missing records and unavailable pools without raw metadata', () => {
    expect(profileFailure({ code: 'P2025' }).code).toBe('PROFILE_NOT_FOUND')
    expect(profileFailure({ code: 'P2024' }).status).toBe(503)
  })
})
