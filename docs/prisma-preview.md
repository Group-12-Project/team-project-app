# Deploy the backend-database preview

The existing Prisma Console project is **grad-path**. The deployment application
uses that exact name. This configuration targets the **backend-database** preview
environment and does not change `main`.

## Before the first push

1. Restore **main** as the default branch in Prisma Console and, if changed,
   in GitHub repository settings. Keep all implementation commits on
   **backend-database**. Changing the default does not merge code.
2. Confirm Group-12-Project/team-project-app is connected to the **grad-path**
   Prisma project and GitHub Actions is enabled for the repository.
3. In that project's environment settings, save a private **DATABASE_URL** for
   the **preview** scope (or the backend-database branch override), pointing at
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
and invokes Prisma's official deploy action. Its explicit `stage` is
`backend-database`; it does not infer production from the default branch. It also
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
health service, not a hosted React interface or completed profile API.

## Local verification

```bash
npm ci
npm --prefix deploy ci
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

- Cloud authentication, the existing project's deployment-state compatibility,
  hosted database connection, and the actual GitHub Actions run remain unverified
  until account configuration and publication are complete.
- An existing project created outside Composer may report
  `HostedStateBootstrapError`. Do not delete it or switch names to create another
  project automatically; inspect its deployment-state setup before proceeding.
- The new deployment toolchain currently reports 16 dependency advisories
  (8 high, 8 moderate). These concern its transitive tools; no forced downgrade or
  major dependency override was applied. Review upstream fixes before production.
- `skipped-no-credential` means the GitHub repository connection did not supply
  credentials. Check the connection to grad-path and Actions OIDC permissions.
- A missing DATABASE_URL means the preview secret has not been configured. Your
  local ignored `.env` is not uploaded. DIRECT_URL is needed for separate migration
  commands, not for generating the bundle or starting this hosted service.
- Team sign-off, Ian/John handoff, profile API wiring, and hosted verification are
  still pending. A deployment does not complete these requirements.

References: [Prisma deploy on push](https://www.prisma.io/docs/compute/deploy-on-push),
[Composer service input](https://www.prisma.io/docs/composer/service-input),
[Composer deploying](https://www.prisma.io/docs/composer/deploying).
