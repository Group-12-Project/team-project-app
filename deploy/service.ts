import node from '@prisma/composer/node'
import { rawHttpContract } from '@prisma/composer/http'
import { secretString } from '@prisma/composer/arktype'
import { compute } from '@prisma/composer-prisma-cloud'
import { type } from 'arktype'

export default compute({
  name: 'api',
  deps: {},
  input: type({ databaseUrl: secretString() }),
  build: node({ module: import.meta.url, entry: './dist/server.mjs' }),
  expose: { http: rawHttpContract },
})
