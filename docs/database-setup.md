# Database decision and development handoff

## Decision — 2026-11-11

Use **MySQL 8.4 LTS and Prisma ORM 7**, with one local database per developer.
Devin confirmed Prisma in this implementation session. MySQL follows the existing
`gradplanner_full_database.sql` design: relational tables, foreign keys, enums,
unsigned identifiers, and check constraints. Keeping MySQL avoids a dialect migration.
Prisma provides a shared schema, generated client, migrations, and explicit seeds.
The MariaDB adapter supports MySQL; it does not change the chosen database engine.

PostgreSQL would require translating the current SQL; SQLite would not reproduce its
MySQL constraints and types. A shared development database would introduce shared
credentials and allow teammates' test data and schema changes to interfere.

Prisma is a server-side database access layer, not a web server. The Prisma VS Code
extension provides editor support; installation alone does not start a database or API.
The backend runs with `npm run server:dev`; the frontend runs with `npm run dev`.

Team coordination record: Prisma confirmed by Devin. S2-01/S2-02 issue links, named
reviewers, MySQL agreement, identity/authentication decisions, and profile/API contract
sign-off still need to be recorded by the team before application integration.
No teammate approval or message delivery is claimed here.

## Reproduce the environment (John's setup steps)

Prerequisites: Node meeting `package.json` engines, npm, and running Docker Desktop.
Run from the repository root:

```bash
npm ci
cp .env.example .env
```

Edit the private `.env`: replace both password placeholders with different local
passwords. Match `MYSQL_PASSWORD` to the password in `DATABASE_URL`; URL-encode special
characters in the URL. Keep database/user/port values consistent. Port 3307 avoids
the common locally installed MySQL port 3306. Nothing should use a real student record.
Do not prefix database variables with `VITE_`, which exposes them to browser code.

```bash
npm run db:up
npm run db:migrate
npm run db:generate
npm run db:seed
npm run db:check
npm run server:dev
```

In another terminal:

```bash
curl --fail http://127.0.0.1:3001/health/db
npm run dev
```

Expected health response: `{"database":"connected"}`. On failure the endpoint
returns HTTP 503 and `{"database":"unavailable"}` without credentials or driver errors.
`db:check` queries MySQL through Prisma and verifies the fictional seeded profile
and its two interests. `db:studio` opens Prisma Studio for local data inspection.
The health server binds only to loopback and is a development integration foundation.
The frontend still uses `localStorage`; profile API wiring is John's follow-up.

Validate code with `npm run typecheck:server`, `npm run lint`, `npm test`, and
`npm run build`. The TypeScript check covers the database module, seed, verification
script, configuration, and backend server.

Use `npm run db:down` to stop the database without deleting its volume. Restart with
`db:up`. Existing volumes retain their original MySQL passwords: changing `.env`
does not change a database account password. Coordinate a local password change or
explicitly recreate a disposable volume; do not delete another developer's database.
Changing Git branches also does not rewind a database volume.

## Collaboration and migrations (Ian's handoff)

- Commit schema, migration directories, migration lock, seed code, and npm lockfile.
- Each teammate applies the same committed migrations with `npm run db:migrate`.
- The initial migration preserves every table and SQL constraint from the existing
  SQL file, excluding database creation/selection. Do not separately import that SQL
  into a Prisma-managed database. Existing populated databases need a reviewed baseline.
- `prisma/schema.prisma` was introspected from the initial migration. SQL check
  constraints and database comments may not be fully expressible in Prisma; preserve
  and review the migration SQL when making changes.
- For subsequent migrations, edit the schema and use
  `npm run db:migrate:dev -- --name describe_change`. MySQL's application user has
  access only to its development database. `migrate dev` also needs a separate local
  shadow database and a suitable migration account; configure `shadowDatabaseUrl`
  in `prisma.config.ts` before using it. Never use the actual database as the shadow.
  `migrate deploy` for onboarding does not require a shadow database.
- Review migration SQL in a PR; never edit an already applied migration or use
  `db push` as a substitute for committed migration history.
- Seed uses reserved fictional user ID `900001` and `example.invalid` email, with
  no password or authentication identity. Re-running it does not duplicate records
  or erase other developers' fixtures. It does not reset edited profile values.
- Ian owns subsequent migrations/seeds. John owns API routing, authorization,
  validation, async frontend integration, and shared team setup documentation.
- Reuse `server/db.ts` in backend modules. Convert MySQL `BigInt` IDs to strings
  before JSON serialization and Prisma decimals to appropriate DTO values. Final
  profile field mappings and endpoint contracts require S2-01/S2-02 coordination.

## Private configuration verification

`.env.example` contains placeholders only. Actual `.env`, environment variants,
private-key files, local SQLite files, generated Prisma client, and local MySQL
data directories are ignored. Docker stores MySQL files in a named volume outside
the repository. The implementation session generated local-only random passwords
in an untracked `.env`; these values must never be copied into evidence.

```bash
git check-ignore .env .env.local .env.production local.pem local.key local.db local.sqlite3
git ls-files '.env*' '*.pem' '*.key' '*.db' '*.sqlite*'
git status --short
```

Expected: the first command lists ignored paths; the second lists only `.env.example`
after it is committed. Review staged diffs before committing. Ignore rules do not
remove files already tracked or erase historical exposures. No real environment,
key, or local database file was tracked when this work began.

## Completion evidence

Related backlog: [#26](https://github.com/Group-12-Project/team-project-app/issues/26),
[#5](https://github.com/Group-12-Project/team-project-app/issues/5).

Configuration: [`../.env.example`](../.env.example), [`../.gitignore`](../.gitignore),
[`../compose.yaml`](../compose.yaml), [`../prisma.config.ts`](../prisma.config.ts),
[`../prisma/schema.prisma`](../prisma/schema.prisma),
[`../prisma/migrations`](../prisma/migrations), [`../prisma/seed.ts`](../prisma/seed.ts).

Connection evidence and checks: [database verification](database-verification.md).
Commit/PR link: pending team review and publication. Current working branch:
`backend-database`. Add the actual commit/PR URL after publication; do not mark the
entire task complete until coordination and handoff are recorded.

References: [Prisma MySQL support and adapter](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql),
[Prisma client generation](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators).
