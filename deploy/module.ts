import { appRoot, resolve } from '@prisma/composer'
import { envSecret, publicUrl } from '@prisma/composer-prisma-cloud'
import service from './service.ts'

export default appRoot('grad-path', ({ environment, provision }) => {
  const api = provision(service, {
    input: {
      databaseUrl: envSecret('GRADPATH_DATABASE_URL'),
      demoProfileEnabled: resolve([environment.name], ([name]) => name === 'backend-preview' || name === 'dev'),
    },
  })
  provision(publicUrl({ id: 'endpoint', url: publicUrl.prismaBuild(), target: api.http }))
})
