# GradPath Sprint 2 — release draft

Status: preparation only; publish after review and verification on the final
submitted commit. Replace pending statements with actual results before release.

## Completed implementation

- Current-student profile story (#26; Sprint 2 #43–#57) reads and updates through
  the existing interface using Prisma ORM and PostgreSQL.
- Versioned relational schema/migrations, fictional non-destructive seeds,
  transactional updates and ordered interests/history.
- Server-side validation and protected academic fields; safe missing/database
  errors, retained drafts and stored-value checking after unconfirmed saves.
- UML class/save-sequence PlantUML sources and rendered SVGs; AI corrections,
  local/shared database instructions and isolated test harness.

## Verification

Automated UI/backend tests, lint, backend typecheck, Prisma validation, production
build and real PostgreSQL restart/rollback/error checks passed in the integration
session. See `docs/sprint2-verification.md` for current counts and commands.
Final submitted-commit CI, per-member local/shared operations, required
Copilot/Figma workflow and live-browser walkthrough must be confirmed by the team.

## Running

Use Node >=22.12.0 and PostgreSQL 17. On a fresh checkout: `npm ci`,
`npm run db:local:init`, `npm run db:generate`, `npm run db:migrate`,
`npm run db:seed`. Run `npm run server:dev` and `npm run dev` in two terminals.
See `docs/database-setup.md` for private environment settings and test DB isolation.

## Limitations

Fictional development identity only; no production authentication or real student
records. Same-field concurrent updates use last committed value. Catalogs,
scheduling, moderation and AI product features remain outside this slice.
Never expose the demo API publicly or submit private database credentials.
