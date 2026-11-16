import { prisma } from '../server/db.ts'
import { startBackend } from '../server/app.ts'

// Used only by the explicit database verification script, never by deployment.
const identity = { userId: BigInt(process.argv[2]), publicId: 'sample-current-student-001' }
const server = startBackend(prisma, 0, '127.0.0.1', { demoProfileEnabled: process.argv[3] !== 'disabled', profileIdentity: identity })
server.on('listening', () => {
  const address = server.address()
  if (address && typeof address !== 'string') process.send?.({ port: address.port })
})
