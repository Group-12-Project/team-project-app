# Prisma Postgres verification — 2026-11-11

## Profile endpoint verification — November 12, 2026

GET/PATCH `/api/profile` now implement the #43 contract for the fictional identity
900001 → sample-current-student-001. The demo seed's missing academic fields and
course snapshots were completed without resetting saved editable fields.

`npm run db:verify-profile-api` passed against hosted PostgreSQL via local HTTP
servers: complete GET, normalized/repeated PATCH, persistence after a real backend
process restart without reseeding, protected/invalid updates, partial saves,
clearing interests, concurrent partial updates, actual constraint-failure rollback,
missing profile errors, sanitized database-unavailable errors, and disabled demo
access. The temporary fixture was removed. No connection strings are recorded.

All 77 automated tests, root and deployment type checks, lint, frontend/deployment
builds, deployment config checks, and bundled smoke test passed. The new deployed
profile endpoints still need a push/deployment and John's integration verification;
earlier deployed health results below are not profile-endpoint evidence.

See [implementation handoff](profile-api-implementation.md) and
[actual HTTP response examples](profile-api-examples.json).

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

## Hosted deployment evidence

- Date verified: November 11, 2026
- Git branch: backend-database
- Prisma project: grad-path
- Deployment environment: backend-preview
- Commit: [commit](https://github.com/Group-12-Project/team-project-app/commit/c23b388319eb90472d2ff739a7a43e5417b4a104)
- Successful workflow: [workflow run](https://github.com/Group-12-Project/team-project-app/actions/runs/43121955826)
- Public backend URL: [PASTE_PUBLIC_DEPLOYMENT_URL](https://t7b1030sxavsotv2z2thyuy7.ewr.prisma.build/)
- GET /health: {"status":"ok"}
- GET /health/db: {"database":"connected"}

## Corrected complete schema — November 11, 2026

Replaced the obsolete `gradplanner_full_database.sql` reference with the supplied
`gradpath_complete_database.sql` schema-only MySQL dump (26 tables).
Applied `20261111000300_align_complete_database` to the configured hosted
PostgreSQL database successfully, retaining the initial migration and existing rows.

Verified Prisma validation/client generation, backend TypeScript, ESLint,
all 34 tests in 6 files, and the frontend production build. The expanded
`npm run db:check` passed against hosted PostgreSQL: existing fictional profile
and interests preserved, new tables accessible, advisor role available, all four
corrected foreign keys use SET NULL, and new business checks exist.

These changes have not been committed, pushed, or redeployed. The hosted database
is updated; the deployed backend will regenerate its client on its next build.
