# Database verification — 2026-11-11

Verified on branch `backend-database`, using Node 24.22.2, npm 11.19.1,
Prisma CLI/client/adapter 7.10.1, Docker Desktop, and MySQL image `mysql:8.4.7`.
Connection credentials are deliberately omitted.

| Check | Result |
| --- | --- |
| `docker compose up -d --wait` on a new named volume | MySQL healthy |
| `npm run db:migrate` | Initial migration applied successfully |
| `prisma db pull` during initial setup | 24 models introspected from the existing SQL baseline |
| `npm run db:generate` | Prisma Client generated successfully |
| `npm run db:seed` | Fictional student/profile and two interests inserted |
| Repeat `npm run db:seed` | Passed without duplicate fixture errors |
| `npm run db:check` | `PASS: Prisma connected to MySQL; fictional profile and two interests verified.` |
| Backend `GET http://127.0.0.1:3001/health/db` | HTTP 200, `{"database":"connected"}` |
| `npm run typecheck:server` | Passed |
| `npx prisma validate` | Passed |
| `npm run lint` | Passed |
| `npm test` | 6 test files, 34 tests passed |
| `npm run build` | Passed |
| `git diff --check` | Passed |
| Ignore/untracked checks | Private environment, key, and local database paths ignored; none tracked |

Introspection reported that Prisma cannot fully represent database check constraints
and comments. The committed initial SQL migration retains them in MySQL.

The HTTP endpoint check is actual backend-to-database verification. Frontend profile
integration, authenticated API routes, team sign-off, and delivery to Ian/John are
still pending. This record does not claim those tasks are complete.

See [database decision and setup](database-setup.md) for reproduction and handoff.
Record the published commit/PR link there after publication.
