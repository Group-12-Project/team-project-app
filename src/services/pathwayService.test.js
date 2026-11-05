import { describe, expect, it } from 'vitest'
import {
  calculateProgress,
  defaultCourses,
  generateSemesterPlan,
  getNextCourses,
  normalizeCourseCode,
} from './pathwayService.js'

describe('pathwayService', () => {
  it('reports total course completion accurately', () => {
    expect(calculateProgress({ completedCourses: ['GRA-501', 'GRA-530'] })).toEqual({
      totalRequired: 7,
      completed: 2,
      percentage: 29,
      remaining: ['GRA-510', 'GRA-520', 'GRA-540', 'GRA-550', 'GRA-560'],
    })
  })

  it('normalizes completion codes and ignores duplicates and unrelated courses', () => {
    expect(normalizeCourseCode(' gra-501 ')).toBe('GRA-501')
    expect(calculateProgress({ completedCourses: [' gra-501 ', 'GRA-501', 'OTHER'] }).completed).toBe(1)
    expect(calculateProgress({ requiredCourses: [] }).percentage).toBe(100)
  })

  it('recommends only courses whose prerequisites are satisfied', () => {
    const result = getNextCourses({ completedCourses: [' gra-501 '], limit: 5 })
    expect(result.map((course) => course.code)).toEqual(['GRA-510', 'GRA-520', 'GRA-530'])
    expect(getNextCourses({ completedCourses: 'GRA-501', limit: 1 })).toEqual([result[0]])
  })

  it('plans all remaining courses using completion from earlier generated semesters', () => {
    const result = generateSemesterPlan({
      completedCourses: ['GRA-501', 'GRA-530'],
      requiredCourses: defaultCourses,
      creditsPerSemester: 6,
    })
    expect(result.map(({ semester, courses, credits }) => ({
      semester, codes: courses.map((course) => course.code), credits,
    }))).toEqual([
      { semester: 1, codes: ['GRA-510', 'GRA-520'], credits: 4 },
      { semester: 2, codes: ['GRA-540', 'GRA-550'], credits: 5 },
      { semester: 3, codes: ['GRA-560'], credits: 6 },
    ])
  })

  it('revisits dependents listed before prerequisites without scheduling them together', () => {
    const courses = [
      { code: 'C', credits: 3, prerequisites: [' b '] },
      { code: 'B', credits: 3, prerequisites: ['A'] },
      { code: 'A', credits: 3 },
    ]
    const snapshot = structuredClone(courses)
    const result = generateSemesterPlan({ requiredCourses: courses, creditsPerSemester: 9 })
    expect(result.map(({ courses }) => courses.map(({ code }) => code))).toEqual([['A'], ['B'], ['C']])
    expect(courses).toEqual(snapshot)
  })

  it('respects the credit cap and does not emit empty semesters for blocked courses', () => {
    const result = generateSemesterPlan({
      requiredCourses: [
        { code: 'OVERSIZED', credits: 10 },
        { code: 'MISSING', credits: 1, prerequisites: ['UNKNOWN'] },
        { code: 'CYCLE-A', credits: 1, prerequisites: ['CYCLE-B'] },
        { code: 'CYCLE-B', credits: 1, prerequisites: ['CYCLE-A'] },
        { code: 'A', credits: 4 },
        { code: 'B', credits: 4 },
      ],
      creditsPerSemester: 6,
    })
    expect(result.map(({ courses }) => courses.map(({ code }) => code))).toEqual([['A'], ['B']])
    expect(result.every(({ credits }) => credits <= 6)).toBe(true)
  })

  it('returns no semesters when all required courses are completed', () => {
    expect(generateSemesterPlan({ completedCourses: defaultCourses.map(({ code }) => code) })).toEqual([])
    expect(generateSemesterPlan({ requiredCourses: [] })).toEqual([])
  })

  it.each([0, -1, NaN, Infinity])('rejects invalid credit cap %s', (creditsPerSemester) => {
    expect(() => generateSemesterPlan({ creditsPerSemester })).toThrow(RangeError)
  })
})
