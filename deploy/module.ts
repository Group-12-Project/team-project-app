import { appRoot } from '@prisma/composer'
import { envSecret, publicUrl } from '@prisma/composer-prisma-cloud'
import service from './service.ts'

export default appRoot('grad-path', ({ provision }) => {
  const api = provision(service, {
    input: { databaseUrl: envSecret('DATABASE_URL') },
  })
  provision(publicUrl({ id: 'endpoint', url: publicUrl.prismaBuild(), target: api.http }))
})
