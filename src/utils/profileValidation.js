export const PROFILE_LIMITS = {
  preferredName: 60,
  careerGoal: 300,
  interests: 8,
  interestLength: 50,
}

export function normalizeInterests(value) {
  const seen = new Set()

  return value
    .split(',')
    .map((interest) => interest.trim())
    .filter(Boolean)
    .filter((interest) => {
      const normalizedInterest = interest.toLocaleLowerCase()
      if (seen.has(normalizedInterest)) {
        return false
      }
      seen.add(normalizedInterest)
      return true
    })
}

export function validateProfileDraft(draft) {
  const preferredName = draft.preferredName.trim()
  const careerGoal = draft.careerGoal.trim()
  const academicInterests = normalizeInterests(draft.interestsText)
  const errors = {}

  if (!preferredName) {
    errors.preferredName = 'Enter your preferred name.'
  } else if (preferredName.length < 2) {
    errors.preferredName = 'Preferred name must be at least 2 characters.'
  } else if (preferredName.length > PROFILE_LIMITS.preferredName) {
    errors.preferredName = `Preferred name must be ${PROFILE_LIMITS.preferredName} characters or fewer.`
  }

  if (!careerGoal) {
    errors.careerGoal = 'Enter an academic or career goal.'
  } else if (careerGoal.length < 3) {
    errors.careerGoal = 'Goal must be at least 3 characters.'
  } else if (careerGoal.length > PROFILE_LIMITS.careerGoal) {
    errors.careerGoal = `Goal must be ${PROFILE_LIMITS.careerGoal} characters or fewer.`
  }

  if (academicInterests.length > PROFILE_LIMITS.interests) {
    errors.interestsText = `Add no more than ${PROFILE_LIMITS.interests} academic interests.`
  } else if (
    academicInterests.some((interest) => interest.length > PROFILE_LIMITS.interestLength)
  ) {
    errors.interestsText = `Each interest must be ${PROFILE_LIMITS.interestLength} characters or fewer.`
  }

  return {
    errors,
    normalized: {
      preferredName,
      careerGoal,
      academicInterests,
    },
  }
}

