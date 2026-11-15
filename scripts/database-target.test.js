// @vitest-environment node
import { expect, it } from 'vitest'
import { isolatedTestUrl } from './database-target.mjs'

it('requires an explicit isolated PostgreSQL test target', () => {
  for (const url of [undefined, 'mysql://demo:demo@localhost/app_test', 'postgresql://demo:demo@localhost/shared']) {
    expect(() => isolatedTestUrl(url)).toThrow()
  }
  expect(isolatedTestUrl('postgresql://demo:demo@localhost/app_test')).toContain('app_test')
})
it('rejects the same development database despite different credentials or query settings', () => {
  expect(() => isolatedTestUrl('postgresql://tester:demo@localhost:5432/app_test?sslmode=prefer', 'postgres://developer:other@localhost/app_test')).toThrow('different database')
})
it('accepts a separate database on the same server', () => {
  expect(isolatedTestUrl('postgresql://demo:demo@localhost/app_test', 'postgresql://demo:demo@localhost/app')).toContain('app_test')
})
