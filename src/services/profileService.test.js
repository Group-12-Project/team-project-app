import { beforeEach, describe, expect, it } from 'vitest'
import { sampleProfile } from '../data/sampleProfile.js'
import {
  PROFILE_STORAGE_KEY,
  loadProfile,
  resetProfile,
  saveProfile,
} from './profileService.js'

describe('profileService', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns a fresh fictional profile when storage is empty', () => {
    const firstLoad = loadProfile()
    firstLoad.preferredName = 'Changed only in memory'

    expect(loadProfile()).toEqual(sampleProfile)
    expect(loadProfile()).not.toBe(sampleProfile)
  })

  it('saves and reloads the complete profile contract', () => {
    const updatedProfile = {
      ...sampleProfile,
      preferredName: 'Jamie Peterson',
      academicInterests: ['Artificial intelligence'],
      careerGoal: 'Lead an accessible software engineering team.',
    }

    saveProfile(updatedProfile)

    expect(loadProfile()).toEqual(updatedProfile)
    expect(loadProfile().courseHistory).toEqual(sampleProfile.courseHistory)
  })

  it('falls back safely when persisted JSON is corrupt', () => {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, '{not-valid-json')

    expect(loadProfile()).toEqual(sampleProfile)
  })

  it('falls back when stored data is missing required displayed academic values', () => {
    const incompleteProfile = { ...sampleProfile }
    delete incompleteProfile.creditsRequired
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(incompleteProfile))

    expect(loadProfile()).toEqual(sampleProfile)
  })

  it('rejects an incomplete profile instead of storing it', () => {
    expect(() => saveProfile({ preferredName: 'Jamie' })).toThrow(TypeError)
    expect(window.localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull()
  })

  it('resets persisted changes to the fictional sample profile', () => {
    saveProfile({ ...sampleProfile, preferredName: 'Jamie Peterson' })

    expect(resetProfile()).toEqual(sampleProfile)
    expect(window.localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull()
  })
})
