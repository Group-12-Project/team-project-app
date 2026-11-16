import { PROFILE_LIMITS } from '../../shared/profileLimits.ts'
import { ProfileError } from './errors.ts'

export interface ProfilePatch {
  preferredName?: string
  academicInterests?: string[]
  careerGoal?: string
}

export function validateProfilePatch(input: unknown): ProfilePatch {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length === 0) {
    throw new ProfileError(400, 'INVALID_REQUEST', 'Provide a nonempty JSON object.')
  }
  const body = input as Record<string, unknown>
  const allowed = ['preferredName', 'academicInterests', 'careerGoal']
  const forbidden = Object.keys(body).filter((key) => !allowed.includes(key))
  if (forbidden.length) {
    throw new ProfileError(400, 'FIELD_NOT_ALLOWED', 'Only editable profile fields may be submitted.',
      Object.fromEntries(forbidden.map((key) => [key, 'This field cannot be updated.'])))
  }
  const fields: Record<string, string> = {}
  const patch: ProfilePatch = {}
  for (const [key, minimum, maximum, label] of [
    ['preferredName', 2, PROFILE_LIMITS.preferredName, 'Preferred name'],
    ['careerGoal', 3, PROFILE_LIMITS.careerGoal, 'Goal'],
  ] as const) {
    if (!Object.hasOwn(body, key)) continue
    const value = body[key]
    if (typeof value !== 'string') fields[key] = `${label} must be a string.`
    else if (value.trim().length < minimum) fields[key] = `${label} must be at least ${minimum} characters.`
    else if (value.trim().length > maximum) fields[key] = `${label} must be ${maximum} characters or fewer.`
    else patch[key] = value.trim()
  }
  if (Object.hasOwn(body, 'academicInterests')) {
    const value = body.academicInterests
    if (!Array.isArray(value) || value.some((interest) => typeof interest !== 'string')) {
      fields.academicInterests = 'Academic interests must be an array of strings.'
    } else {
      const seen = new Set<string>()
      const interests = (value as string[]).map((interest) => interest.trim()).filter(Boolean).filter((interest) => {
        const key = interest.toLocaleLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      if (interests.length > PROFILE_LIMITS.interests) fields.academicInterests = 'Add no more than 8 academic interests.'
      else if (interests.some((interest) => interest.length > PROFILE_LIMITS.interestLength)) {
        fields.academicInterests = 'Each interest must be 50 characters or fewer.'
      } else patch.academicInterests = interests
    }
  }
  if (Object.keys(fields).length) throw new ProfileError(422, 'VALIDATION_ERROR', 'Check the highlighted fields.', fields)
  return patch
}
