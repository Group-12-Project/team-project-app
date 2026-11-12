import { describe, expect, it } from 'vitest'
import examples from '../../docs/profile-api-examples.json'
import { isProfile } from './profileService.js'

describe('recorded API responses match the existing frontend contract', () => {
  it.each(['selectedDevelopmentGet', 'successfulPatch'])('%s is a complete frontend profile', (key) => {
    expect(examples[key].status).toBe(200)
    expect(isProfile(examples[key].response)).toBe(true)
    expect(examples[key].response.id).toBe('sample-current-student-001')
    expect(examples[key].response.expectedGraduation).toBe('May 2027')
    for (const course of examples[key].response.courseHistory) {
      expect(course.id.length).toBeGreaterThan(0)
      expect(course.code.length).toBeGreaterThan(0)
      expect(course.title.length).toBeGreaterThan(0)
    }
  })
  it('records a rejected academic update in the agreed error envelope', () => {
    expect(examples.rejectedUpdate).toMatchObject({ status: 400, response: {
      error: { code: 'FIELD_NOT_ALLOWED', fields: { gpa: expect.any(String) } },
    } })
  })
})
