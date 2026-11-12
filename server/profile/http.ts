import type { IncomingMessage, ServerResponse } from 'node:http'
import { ProfileError, profileFailure } from './errors.ts'
import type { ProfileRepository } from './repository.ts'

export async function handleProfileRequest(request: IncomingMessage, response: ServerResponse, repository: ProfileRepository) {
  try {
    if (new URL(request.url ?? '/', 'http://localhost').search) {
      throw new ProfileError(400, 'INVALID_REQUEST', 'Profile selection parameters are not supported.')
    }
    if (request.method === 'GET') {
      const profile = await repository.get()
      response.writeHead(200).end(JSON.stringify(profile))
      return
    }
    if (request.method !== 'PATCH') {
      response.setHeader('Allow', 'GET, PATCH')
      throw new ProfileError(405, 'INVALID_REQUEST', 'Use GET or PATCH for this resource.')
    }
    if (request.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      throw new ProfileError(400, 'INVALID_REQUEST', 'Send the request as application/json.')
    }
    const chunks: Buffer[] = []
    let size = 0
    for await (const chunk of request) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.length
      if (size <= 16 * 1024) chunks.push(buffer)
    }
    if (size > 16 * 1024) throw new ProfileError(400, 'INVALID_REQUEST', 'The profile request is too large.')
    let body: unknown
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) }
    catch { throw new ProfileError(400, 'INVALID_REQUEST', 'The request contains malformed JSON.') }
    const profile = await repository.update(body)
    response.writeHead(200).end(JSON.stringify(profile))
  } catch (error) {
    const safe = profileFailure(error)
    response.writeHead(safe.status).end(JSON.stringify({ error: {
      code: safe.code, message: safe.message, ...(safe.fields && { fields: safe.fields }),
    } }))
  }
}
