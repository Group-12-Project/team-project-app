import { sampleProfile } from '../data/sampleProfile.js'

export const PROFILE_STORAGE_KEY = 'gradpath.profile.v1'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function isCourseRecord(course) {
  return Boolean(
    course &&
      typeof course.id === 'string' &&
      typeof course.code === 'string' &&
      typeof course.title === 'string' &&
      (typeof course.term === 'string' || course.term === undefined),
  )
}

export function isProfile(value) {
  return Boolean(
    value &&
      typeof value.id === 'string' &&
      typeof value.preferredName === 'string' &&
      typeof value.studentStatus === 'string' &&
      typeof value.graduateProgram === 'string' &&
      (typeof value.specialization === 'string' || value.specialization === null) &&
      Array.isArray(value.academicInterests) &&
      value.academicInterests.every((interest) => typeof interest === 'string') &&
      typeof value.careerGoal === 'string' &&
      Array.isArray(value.courseHistory) &&
      value.courseHistory.every(isCourseRecord) &&
      Number.isFinite(value.creditsCompleted) &&
      value.creditsCompleted >= 0 &&
      Number.isFinite(value.creditsRequired) &&
      value.creditsRequired > 0 &&
      typeof value.expectedGraduation === 'string' &&
      typeof value.gpa === 'string',
  )
}

export function loadProfile(storage) {
  try {
    const targetStorage = storage ?? window.localStorage
    const storedProfile = targetStorage.getItem(PROFILE_STORAGE_KEY)

    if (!storedProfile) {
      return clone(sampleProfile)
    }

    const parsedProfile = JSON.parse(storedProfile)
    return isProfile(parsedProfile) ? clone(parsedProfile) : clone(sampleProfile)
  } catch {
    return clone(sampleProfile)
  }
}

export function saveProfile(profile, storage) {
  if (!isProfile(profile)) {
    throw new TypeError('A complete GradPath profile is required before saving.')
  }

  const profileToStore = clone(profile)
  const targetStorage = storage ?? window.localStorage
  targetStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileToStore))
  return clone(profileToStore)
}

export function resetProfile(storage) {
  const targetStorage = storage ?? window.localStorage
  targetStorage.removeItem(PROFILE_STORAGE_KEY)
  return clone(sampleProfile)
}

