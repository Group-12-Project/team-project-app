# Prisma Postgres verification — 2026-11-11

The database decision has changed from local MySQL to hosted Prisma Postgres at
Devin's request. Earlier MySQL verification is historical and does not establish
connectivity to the hosted PostgreSQL database.

Hosted verification is **pending** creation of a database in Devin's Prisma Console
and saving its URLs privately in `.env`. No Prisma account, email, hosted database,
or hosted connection has been created or verified on Devin's behalf.

Local checks for the PostgreSQL configuration passed: Prisma schema validation,
Prisma Client generation, backend TypeScript checking, ESLint, all 34 existing
tests in 6 files, and the frontend production build. The PostgreSQL initial SQL
was generated from the schema with additional business/nonnegative checks and
update-time triggers. Applying that migration and running the seed against an
actual PostgreSQL database remain pending; static checks are not connection evidence.

After saving the URLs, run:

```bash
npm run db:migrate
npm run db:seed
npm run db:check
npm run server:dev
```

Then `curl --fail http://127.0.0.1:3001/health/db` should return HTTP 200 with
`{"database":"connected"}`. Record only success/failure and non-secret versions;
never record a connection URL, password, or Console screenshot containing them.

[Setup instructions and decision](database-setup.md).
