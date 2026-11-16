// Local fictional development only; never connects to the team's cloud database.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import pg from 'pg'

const root = path.resolve('.local-postgres')
const data = path.join(root, 'data')
const passwordFile = path.join(root, 'password')
const port = Number(process.env.LOCAL_POSTGRES_PORT || 55438)
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Use a local port between 1024 and 65535.')
const candidates = [process.env.POSTGRES_BIN, '/opt/homebrew/opt/postgresql@17/bin', '/usr/local/opt/postgresql@17/bin'].filter(Boolean)
let bin = candidates.find((directory) => existsSync(path.join(directory, 'initdb')))
if (!bin) {
  try { bin = execFileSync('pg_config', ['--bindir'], { encoding: 'utf8' }).trim() }
  catch { throw Error('Install PostgreSQL 17 and set POSTGRES_BIN to its bin directory; see docs/database-setup.md.') }
}
const run = (name, args) => execFileSync(path.join(bin, name), args, { stdio: 'pipe' })
const start = () => {
  if (!existsSync(data)) throw Error('Run npm run db:local:init first.')
  if (existsSync(path.join(data, 'postmaster.pid'))) {
    run('pg_ctl', ['-D', data, 'status'])
    return
  }
  run('pg_ctl', ['-D', data, '-l', path.join(root, 'server.log'), '-o', `-p ${port} -h 127.0.0.1 -k "${root}"`, '-w', 'start'])
}
try {
  const action = process.argv[2]
  if (action === 'init') {
    if (existsSync(root) || existsSync('.env')) throw Error('Refusing to replace existing .env or .local-postgres. Use a fresh checkout or configure your existing database.')
    mkdirSync(root, { mode: 0o700 })
    const password = randomBytes(24).toString('hex')
    writeFileSync(passwordFile, password, { mode: 0o600 })
    run('initdb', ['-D', data, '-U', 'gradpath_local', '--encoding=UTF8', '--auth=scram-sha-256', `--pwfile=${passwordFile}`])
    start()
    const client = new pg.Client({ host: '127.0.0.1', port, user: 'gradpath_local', password, database: 'postgres' })
    try {
      await client.connect()
      await client.query('CREATE DATABASE gradpath_local')
      await client.query('CREATE DATABASE gradpath_local_test')
    } finally { await client.end() }
    const base = `postgresql://gradpath_local:${password}@127.0.0.1:${port}/`
    writeFileSync('.env', `DATABASE_URL="${base}gradpath_local"\nDIRECT_URL="${base}gradpath_local"\nTEST_DATABASE_URL="${base}gradpath_local_test"\nENABLE_DEMO_PROFILE_API=true\nHOST=127.0.0.1\nPORT=3001\n`, { mode: 0o600 })
    console.log('Local PostgreSQL ready. Random credentials are saved only in ignored local files.')
  } else if (action === 'start') {
    start()
    console.log('Local PostgreSQL ready.')
  } else if (action === 'stop') {
    run('pg_ctl', ['-D', data, '-w', 'stop'])
    console.log('Local PostgreSQL stopped; data preserved.')
  } else throw Error('Usage: node scripts/local-postgres.mjs init|start|stop')
} catch (error) {
  // Child-process errors can contain connection details; never echo them.
  console.error(error?.status !== undefined ? 'Local PostgreSQL command failed. Check the private .local-postgres/server.log and port availability.' : error.message)
  process.exitCode = 1
}
