export function isolatedTestUrl(testUrl, developmentUrl) {
  if (!testUrl) throw Error('TEST_DATABASE_URL is required; no development fallback is allowed.')
  const test = new URL(testUrl)
  if (!['postgres:', 'postgresql:'].includes(test.protocol) || !decodeURIComponent(test.pathname).endsWith('_test')) {
    throw Error('TEST_DATABASE_URL must name an isolated PostgreSQL database ending in _test.')
  }
  const target = (url) => `${url.hostname.toLowerCase()}:${url.port || '5432'}${decodeURIComponent(url.pathname)}`
  if (developmentUrl && target(test) === target(new URL(developmentUrl))) {
    throw Error('TEST_DATABASE_URL must select a different database from DATABASE_URL.')
  }
  return testUrl
}
