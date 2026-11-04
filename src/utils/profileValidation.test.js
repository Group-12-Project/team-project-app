import { describe, expect, it } from 'vitest'
import { normalizeInterests, validateProfileDraft } from './profileValidation.js'

describe('profile validation', () => {
  it('trims interests, removes blanks, and deduplicates case-insensitively', () => {
    expect(normalizeInterests(' AI, databases, ai, , Accessible Design ')).toEqual([
      'AI',
      'databases',
      'Accessible Design',
    ])
  })

  it('requires a meaningful preferred name and goal', () => {
    const result = validateProfileDraft({
      preferredName: ' ',
      interestsText: '',
      careerGoal: '  ',
    })

    expect(result.errors).toEqual({
      preferredName: 'Enter your preferred name.',
      careerGoal: 'Enter an academic or career goal.',
    })
  })

  it('normalizes a valid draft for persistence', () => {
    const result = validateProfileDraft({
      preferredName: '  Jamie Peterson  ',
      interestsText: 'AI, Databases',
      careerGoal: '  Build trustworthy software.  ',
    })

    expect(result.errors).toEqual({})
    expect(result.normalized).toEqual({
      preferredName: 'Jamie Peterson',
      academicInterests: ['AI', 'Databases'],
      careerGoal: 'Build trustworthy software.',
    })
  })

  it('rejects names and goals below their minimum lengths', () => {
    const result = validateProfileDraft({
      preferredName: 'A',
      interestsText: '',
      careerGoal: 'Hi',
    })

    expect(result.errors.preferredName).toBe('Preferred name must be at least 2 characters.')
    expect(result.errors.careerGoal).toBe('Goal must be at least 3 characters.')
  })

  it('rejects more than eight academic interests', () => {
    const result = validateProfileDraft({
      preferredName: 'Jamie',
      interestsText: 'One, Two, Three, Four, Five, Six, Seven, Eight, Nine',
      careerGoal: 'Build reliable software.',
    })

    expect(result.errors.interestsText).toBe('Add no more than 8 academic interests.')
  })

  it('rejects an academic interest longer than 50 characters', () => {
    const result = validateProfileDraft({
      preferredName: 'Jamie',
      interestsText: 'A'.repeat(51),
      careerGoal: 'Build reliable software.',
    })

    expect(result.errors.interestsText).toBe('Each interest must be 50 characters or fewer.')
  })
})
