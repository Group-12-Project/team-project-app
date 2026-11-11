import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '@prisma/cli-engine'

// Use the deployment CLI's loader to catch accidental Prisma 7 parent inheritance.
const directory = fileURLToPath(new URL('.', import.meta.url))
const result = await loadConfig(directory, undefined, '8.0.0-rc.33')
assert.deepEqual(result.diagnostics, [], 'Deployment config must load without diagnostics')
assert.equal(result.files.length, 1, 'Deployment config must not inherit a parent config')
assert.equal(result.files[0].path, fileURLToPath(new URL('./prisma.config.ts', import.meta.url)))
assert.ok(result.files[0].sections.composer, 'Composer configuration must be present')
console.log('PASS: hosting config loads independently of the root Prisma ORM 7 config.')
