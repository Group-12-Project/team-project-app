export type ProfileErrorCode = 'INVALID_REQUEST' | 'FIELD_NOT_ALLOWED' | 'VALIDATION_ERROR'
  | 'PROFILE_NOT_FOUND' | 'SERVICE_UNAVAILABLE' | 'INTERNAL_ERROR'

export class ProfileError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ProfileErrorCode,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message)
    this.name = 'ProfileError'
  }
}

export function profileFailure(error: unknown): ProfileError {
  if (error instanceof ProfileError) return error
  const record = error && typeof error === 'object' ? error as Record<string, unknown> : {}
  if (record.code === 'P2025') return new ProfileError(404, 'PROFILE_NOT_FOUND', 'The selected profile was not found.')
  if (record.name === 'PrismaClientInitializationError' || [
    'P1000', 'P1001', 'P1002', 'P1008', 'P1011', 'P1017', 'P2024', 'P2037',
    'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', '57P01', '08006',
  ].includes(String(record.code))) {
    return new ProfileError(503, 'SERVICE_UNAVAILABLE', 'Profile storage is temporarily unavailable. Please try again.')
  }
  return new ProfileError(500, 'INTERNAL_ERROR', 'The profile could not be loaded or saved. Please try again.')
}
