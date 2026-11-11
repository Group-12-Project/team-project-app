# Prisma Postgres setup and team handoff

## Database decision — 2026-11-11

Use hosted **Prisma Postgres (PostgreSQL 17) with Prisma ORM 7**. Devin explicitly
requested managing the database through prisma.io. This supersedes the earlier
local MySQL proposal. Prisma Console manages the hosted database; Prisma Studio
browses records; Prisma ORM connects backend code. The editor/GitHub extension
does not provision a database or supply credentials.

The MySQL design is translated into PostgreSQL models and a new initial migration.
All 24 models, relationships, enums, original business check constraints, and
update-time triggers are retained. Unsigned fields become signed PostgreSQL numbers
with nonnegative checks, so the positive range of BIGINT is smaller. PostgreSQL text
comparisons are case-sensitive by default, unlike the legacy MySQL collation; agree
on email normalization and other case-insensitive uniqueness before authentication
implementation. Original SQL is a historical reference, not an installation script.

## Create your database in the website

1. Open https://console.prisma.io/ and sign in using your GitHub account or preferred
   email. No account has been created on your behalf.
2. Create a project named **GradPath**, then a **Prisma Postgres** database for
   development. Select an appropriate region and review the displayed plan before
   completing creation. No paid resources are required by this repository.
3. Open the database's **Connect** panel. Select standard PostgreSQL connection
   strings. Use the pooled URL for the application and the direct URL for migrations.
   These start with `postgres://` or `postgresql://`; this project does not use a
   `prisma+postgres://` Accelerate URL.
4. In VS Code, open the repository's private `.env` file. Replace its placeholders:

```dotenv
DATABASE_URL="PASTE_YOUR_POOLED_POSTGRESQL_URL_HERE"
DIRECT_URL="PASTE_YOUR_DIRECT_POSTGRESQL_URL_HERE"
PORT=3001
```

Keep the URLs' SSL parameters. If the Connect panel provides only a direct standard
PostgreSQL URL, it can be used in both variables for initial development. Do not paste
URLs into chat, issues, screenshots, or committed files. `.env.example` is the
non-secret template. The obsolete local MySQL credential backup has been removed.

## Install, migrate, seed, and run

Prerequisites: Node meeting `package.json` engines, npm, internet access to the
hosted database. Docker is no longer required for the application.
Run in the `team-project-app` folder. For a fresh checkout, run `cp .env.example .env`
before filling in the URLs. Do not overwrite an already configured `.env`.

```bash
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:check
npm run server:dev
```

`db:migrate` creates the schema in a **new, empty development PostgreSQL database**.
Do not point it at a production database, the old MySQL database, or an existing
populated PostgreSQL database without a reviewed baseline. Migrations and seed
create fictional data, not student records.

In another terminal, verify the server:

```bash
curl --fail http://127.0.0.1:3001/health/db
npm run dev
```

Expected response: `{"database":"connected"}`. `db:check` must confirm that Prisma
can read the fictional profile and its two interests. The backend runs on port 3001
by default and binds to `0.0.0.0` so hosting can reach it. Set `HOST=127.0.0.1`
for loopback-only local access. Vite runs the frontend separately. The frontend still uses
browser storage pending John's profile API integration.

## Host the backend with Prisma Compute

For the **grad-path** project and the **backend-database** branch, use the
[preview deployment instructions](prisma-preview.md). They configure the Composer
entry and GitHub Actions workflow without merging into main.

The package names its backend entry point with `"start": "bun server/index.ts"`.
Prisma Compute supplies the Bun runtime; local Node development can continue with
`npm run server:dev`. The existing Node HTTP server is compatible with Bun.
`npm run build` first generates Prisma Client, then builds the frontend. Generation
does not require database credentials; migrations require `DIRECT_URL`, and the
running backend requires `DATABASE_URL`.

Commit the PostgreSQL transition and hosting changes and push them to the branch
selected in Prisma's connected repository settings, then retry deployment. A local
file change alone is not visible to Prisma. Publication has not been performed here.
If selecting a repository directory, use the directory containing `package.json`
(the root of this Git repository).

Set `GRADPATH_DATABASE_URL` privately in Prisma's environment settings for
the backend-database preview, using your existing development database URL.
Prisma Cloud reserves DATABASE_URL for its own database wiring, so the Composer
service uses a custom secret name. Local `.env` keeps DATABASE_URL and DIRECT_URL;
DIRECT_URL is only needed for the separate migration commands.
Your local `.env` is ignored by Git and
is not uploaded. Use a development database for previews. Allow the platform to set
`PORT` if it provides one. `/health` returns server liveness; `/health/db` checks the
database connection. Run migrations/seeds separately against the intended database;
this start command does not perform them. This entry point serves the backend
health endpoints; serving the React frontend and wiring its API are separate work.

Reference: https://www.prisma.io/docs/compute/environment-variables

## Browse records

Return to the same project/database in Prisma Console and open its Studio/data
browser. After seeding, browse `users`, `student_profiles`, and `profile_interests`.
The fixture is **Demo Student**, ID **900001**, email
**demo.student@example.invalid**, with no login password. This fictional email
is unrelated to the real account email you use to sign into Prisma Console.
You can also open a local Studio interface using `npm run db:studio`.

## Team collaboration and dependencies

The proposed collaboration approach is one designated **shared hosted development
database**, with version-controlled migrations and idempotent fictional seeds.
Devin owns the database project and grants teammates access through Prisma Console
workspace/project invitations supported by the chosen plan. Share credentials only
through the team's private secret-sharing channel; never commit them.

Ian owns future migrations/seeds. Coordinate shared-schema changes: one migration
owner at a time, review SQL in a PR, and apply committed migrations with
`npm run db:migrate`. Do not rewrite migrations already applied to PostgreSQL.
Use a separate disposable development database for authoring migrations with
`npm run db:migrate:dev -- --name describe_change`; provision a separate shadow
database if Prisma cannot create one automatically. Do not reset the shared database
or use it as a shadow database. Seed may be repeated without duplicate fixture rows;
it does not reset edited fixture values or erase teammates' data.

John owns API routing, authorization, validation, frontend wiring, and team setup
documentation. Reuse `server/db.ts` only on the backend. Serialize BigInt IDs as strings
and convert decimals to agreed DTO types. Never use `VITE_` for database secrets.
S2-01/S2-02 identity and profile/API contract agreement, named teammate sign-offs,
and actual handoff delivery still need to be recorded. None are claimed complete.

## Legacy MySQL transition

The old local MySQL container, fictional-data volume, Docker network, and image
were removed on 2026-11-11. The obsolete `.env.mysql.local` credential backup and
duplicate archived MySQL migration were also removed. Git history retains the old
migration if needed. The original `gradplanner_full_database.sql` remains as the
team's historical schema reference; it is not a PostgreSQL installation script.
The active PostgreSQL migrations, seed, and private `.env` are preserved. This was
a fresh PostgreSQL setup, not an in-place data migration.

## Verification and private configuration

Run `npm run typecheck:server`, `npm run lint`, `npm test`, `npm run build`, and
`npx prisma validate`. See [verification status](database-verification.md).

```bash
git check-ignore .env .env.local local.pem local.key local.db
git ls-files '.env*' '*.pem' '*.key' '*.db' '*.sqlite*'
git status --short
```

Only `.env.example` should be tracked among those patterns. Generated Prisma client,
private keys, local databases, and actual environment files are ignored. Review
staged diffs before committing; ignore rules do not erase past credential exposures.

## Completion evidence

Related backlog: [#26](https://github.com/Group-12-Project/team-project-app/issues/26),
[#5](https://github.com/Group-12-Project/team-project-app/issues/5).

Non-secret configuration: [environment template](../.env.example),
[ignore rules](../.gitignore), [Prisma config](../prisma.config.ts),
[models](../prisma/schema.prisma), [migrations](../prisma/migrations),
[fictional seed](../prisma/seed.ts), [connection check](../scripts/check-db.ts).

The earlier local MySQL setup was committed as `2c9a5f5` and was not pushed because
publication was declined. The PostgreSQL transition is a subsequent local change;
its final commit/PR URL still needs recording. Hosted PostgreSQL migration, seed,
and connection checks now passed; see [verification evidence](database-verification.md).
Do not use the old MySQL connection check as proof of a hosted Prisma Postgres connection.

Official guide: https://www.prisma.io/docs/postgres
