import { isProfile } from './profileService.js'

export class ProfileApiError extends Error {
  constructor(message, code, fields) {
    super(message)
    this.code = code
    this.fields = fields
  }
}

async function request(options) {
  let response
  let body
  try {
    response = await fetch('/api/profile', options)
    body = await response.json()
  } catch {
    throw new ProfileApiError('The request could not be confirmed. Please try again.', 'UNCONFIRMED')
  }
  if (!response.ok) {
    throw new ProfileApiError(body.error?.message || 'The profile request failed.', body.error?.code, body.error?.fields)
  }
  if (!isProfile(body)) throw new ProfileApiError('The response could not be confirmed.', 'UNCONFIRMED')
  return body
}

export const profileApi = {
  load: () => request(),
  save: ({ preferredName, academicInterests, careerGoal }) => request({
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferredName, academicInterests, careerGoal }),
  }),
}
