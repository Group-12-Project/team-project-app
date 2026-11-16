# Deploy the backend-database preview

The existing Prisma Console project is **grad-path**. The deployment application
uses that exact name. Code stays on the Git branch **backend-database**; the backend
deploys to the separate Prisma environment **backend-preview**. The manually created
database stays in the existing **backend-database** Prisma environment. This does
not change `main` or move the database.

## Before the first push

1. Restore **main** as the default branch in Prisma Console and, if changed,
   in GitHub repository settings. Keep all implementation commits on
   **backend-database**. Changing the default does not merge code.
2. Confirm Group-12-Project/team-project-app is connected to the **grad-path**
   Prisma project and GitHub Actions is enabled for the repository.
3. In that project's environment settings, save a private **GRADPATH_DATABASE_URL** for
   the **Preview** scope (or a backend-preview environment override), pointing at
   your development Prisma Postgres database. Do not use production data.
   Composer binds this as a redacted secret input. If an environment lacks it,
   deployment fails rather than connecting to a fallback database.
4. Configure your private local `.env` with DATABASE_URL and DIRECT_URL for that
   same development database, then apply migrations and seed separately:

```bash
npm run db:migrate
npm run db:seed
npm run db:check
```

5. Commit and push the workflow and deployment package to **backend-database**.
   No merge to main is required. The workflow triggers on pushes to this branch
   even when it is not present on main. It does not have a manual-dispatch trigger.

## What the workflow does

[prisma-preview.yml](../.github/workflows/prisma-preview.yml) installs the root
application and separate deployment toolchain, generates Prisma Client, builds a
self-contained Bun backend bundle, checks TypeScript, runs a local smoke test,
and invokes Prisma's official deploy action. Its explicit `environment` is
`backend-preview`; it does not infer production from the default branch. It also
refuses to run when backend-database is GitHub's default branch. Prisma must also
have main as its default: a default-name preview may be refused by the platform.

GitHub's `contents: read` and `id-token: write` permissions allow the official
action to authenticate against the existing repository connection. There is no
committed service token. A skipped connection is treated as a failed job so a
green status cannot be mistaken for a successful deployment.

Open GitHub **Actions → Prisma backend preview** after pushing. Read the job
summary for the actual preview URL and request `/health`, then `/health/db`.
The first should return `{"status":"ok"}` and the second
`{"database":"connected"}`. The server root `/` returns 404; this is a backend
health service. GET/PATCH `/api/profile` are also available in backend-preview,
using only the fictional development identity; this does not host the React interface.

## Local verification

```bash
npm ci
npm --prefix deploy ci
npm --prefix deploy run check:config
npm --prefix deploy run build
npm --prefix deploy run typecheck
npm --prefix deploy run smoke
npm run typecheck:server
npm run lint
npm test
```

The deployment package includes a pinned project-local Bun executable. The smoke
test boots the actual bundle through Composer with a fictional unreachable database.
It verifies liveness, 404 handling, and a credential-free database failure response;
it is not proof of hosted database connectivity.

The root stays on Prisma ORM 7.10.1. `deploy/` pins the independent platform CLI
8.0.0-rc.33 and Composer packages 0.38.0 required for the documented workflow.
Generated artifacts and both node_modules directories are ignored.

## Remaining limitations and troubleshooting

- `CLI.CONFIG_MISSING_MARKER` naming the repository root means the deployment CLI
  tried to inherit the Prisma ORM 7 configuration. `deploy/prisma.config.ts` sets
  `parent: false` to stop config discovery at the deployment directory. The
  workflow runs `check:config` using the deployment CLI loader to verify this
  isolation before building. Keep the root ORM configuration on Prisma 7.

- Cloud authentication, the existing project's deployment-state compatibility,
  hosted database connection, and the actual GitHub Actions run remain unverified
  until account configuration and publication are complete.
- `HostedStateBootstrapError` occurred because backend-database already contained
  the manually created gradpath-dev database but no Composer deployment state.
  The installed state guard checks resources on the target Prisma branch, so the
  backend now targets a fresh backend-preview environment in the same project.
  Keep that target empty before its first deployment; do not manually add resources
  there. Preserve the database environment and connect to it through the custom
  secret. An override scoped only to backend-database does not apply to backend-preview;
  set the secret in Preview scope or explicitly for backend-preview.
- The new deployment toolchain currently reports 16 dependency advisories
  (8 high, 8 moderate). These concern its transitive tools; no forced downgrade or
  major dependency override was applied. Review upstream fixes before production.
- `skipped-no-credential` means the GitHub repository connection did not supply
  credentials. Check the connection to grad-path and Actions OIDC permissions.
- `envSecret name "DATABASE_URL" is reserved` means the graph tried to bind a
  Prisma Cloud-managed name as a custom secret. This deployment instead uses
  **GRADPATH_DATABASE_URL** for the existing database; save the same connection
  string under that custom name in Preview scope or the backend-preview environment.
  Local `.env` names remain DATABASE_URL and DIRECT_URL. No new database is created.
- A missing GRADPATH_DATABASE_URL means the preview secret has not been configured. Your
  local ignored `.env` is not uploaded. DIRECT_URL is needed for separate migration
  commands, not for generating the bundle or starting this hosted service.
- Profile endpoint implementation and local HTTP verification against hosted
  PostgreSQL are documented in [API handoff](profile-api-implementation.md).
  John owns application wiring and integration verification; Nick owns frontend
  wiring. The updated endpoints require a new deployment and John’s integration
  check before claiming hosted endpoint verification complete.

References: [Prisma deploy on push](https://www.prisma.io/docs/compute/deploy-on-push),
[Composer service input](https://www.prisma.io/docs/composer/service-input),
[Composer deploying](https://www.prisma.io/docs/composer/deploying).
