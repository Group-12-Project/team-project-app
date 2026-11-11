# Prisma Postgres verification — 2026-11-11

The database decision has changed from local MySQL to hosted Prisma Postgres at
Devin's request. Earlier MySQL verification is historical and does not establish
connectivity to the hosted PostgreSQL database.

After Devin created the hosted development database and saved its connection URLs
privately in `.env`, the following checks passed against Prisma Postgres on
2026-11-11:

- `npm run db:migrate`: PostgreSQL migration applied successfully.
- `npm run db:seed`: fictional development fixture seeded successfully.
- `npm run db:check`: Prisma connected and verified the fictional profile and its
  two interests.
- `git check-ignore .env`: ignored; `git ls-files -- .env`: no tracked file.

Commands ran with network access after the sandboxed migration attempt failed.
No connection URL or credential is included in this evidence.

Local checks for the PostgreSQL configuration passed: Prisma schema validation,
Prisma Client generation, backend TypeScript checking, ESLint, all 34 existing
tests in 6 files, and the frontend production build. The PostgreSQL initial SQL
was generated from the schema with additional business/nonnegative checks and
update-time triggers. Migration and seed execution against hosted PostgreSQL are
now verified by the separate checks above.

To repeat verification using the private local configuration, run:

```bash
npm run db:migrate
npm run db:seed
npm run db:check
npm run server:dev
```

Then `curl --fail http://127.0.0.1:3001/health/db` should return HTTP 200 with
`{"database":"connected"}`. Record only success/failure and non-secret versions;
never record a connection URL, password, or Console screenshot containing them.
The live HTTP-to-hosted-database check remains pending; the successful database
verification above ran through the backend Prisma client using `db:check`.

[Setup instructions and decision](database-setup.md).

## Backend preview packaging

Added an isolated Composer deployment package for **grad-path** and a workflow
restricted to **backend-database**, with an explicit preview environment. The
deployment target is now **backend-preview**, separate from the manually created
database environment, to avoid initializing Composer state over existing resources. Its
TypeScript wiring and self-contained Bun bundle pass locally. A local smoke test
boots the actual bundle and verifies HTTP 200 liveness, HTTP 404, and sanitized
HTTP 503 for an unavailable fictional database. It does not connect to Prisma Cloud.

Cloud deployment remains pending Console settings, project-state validation,
preview credentials, and publication. Deployment-tool dependency advisories and
reproduction steps are recorded in [preview setup](prisma-preview.md).
