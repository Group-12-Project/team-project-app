import { defineConfig as composer } from '@prisma/composer/config'
import { nodeBuild } from '@prisma/composer/node/control'
import { prismaCloud, prismaState } from '@prisma/composer-prisma-cloud/control'
import { definePrismaConfig } from 'prisma/config'

export default definePrismaConfig({
  // The repository root uses Prisma ORM 7; do not inherit its configuration.
  parent: false,
  composer: composer({
    entry: './module.ts',
    extensions: [prismaCloud(), nodeBuild()],
    state: prismaState(),
  }),
})
