import { afterEach, expect, it, vi } from 'vitest'
import { profileApi } from './profileApi.js'
import { sampleProfile } from '../data/sampleProfile.js'

afterEach(() => vi.unstubAllGlobals())
it('uses PATCH with editable fields only and returns confirmed data', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => sampleProfile })
  vi.stubGlobal('fetch', fetch)
  expect(await profileApi.save(sampleProfile)).toEqual(sampleProfile)
  const [url, options] = fetch.mock.calls[0]
  expect(url).toBe('/api/profile')
  expect(options.method).toBe('PATCH')
  expect(Object.keys(JSON.parse(options.body)).sort()).toEqual(['academicInterests', 'careerGoal', 'preferredName'])
})
it('preserves API field errors for the form', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: { code: 'VALIDATION_ERROR', message: 'Check fields', fields: { academicInterests: 'Too many' } } }) }))
  await expect(profileApi.save(sampleProfile)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', fields: { academicInterests: 'Too many' } })
})
it.each([async () => { throw Error() }, async () => ({ ok: true, json: async () => { throw Error() } }), async () => ({ ok: true, json: async () => ({}) })])('rejects unconfirmed responses without a fallback', async (implementation) => {
  vi.stubGlobal('fetch', vi.fn(implementation))
  await expect(profileApi.save(sampleProfile)).rejects.toMatchObject({ code: 'UNCONFIRMED' })
})
