# Sprint 2 integration verification — November 15, 2026

Branch: `feature/sprint2-integration`, based on Devin's `backend-database`
commit `65c98c4`. Nick's `feature/nick-profile-api` pointed to the same commit
at inspection time. Existing MySQL workspace changes remain untouched in the
original checkout. Git identity: Ian-Peterson; no teammate contributions inferred.

## Initial gap review and final evidence

The GitHub connector retrieved repository issues, Sprint 2 issue bodies/comments,
#5, #26, PR #59 and the current branch list. No project-board API is available,
so board-only fields/statuses were not inspected or updated. All issue assignees
are preserved. Other product features and #60/#61 remain future work.

| Issue | Initial gap | Final evidence / status |
| --- | --- | --- |
| #43 | PR #59 still open; MySQL wording outdated | Contract copied from PR #59 with Ian's explicit PostgreSQL addendum; merge/review remains human work. |
| #44 | Existing Devin models need integration review | Reused 26-model PostgreSQL schema; profile subset documented in UML and AI review. Team model approval remains pending. |
| #45 | Earlier MySQL choice conflicts with newer Postgres implementation | Ian selected Devin's Postgres backend in this session. Local isolated PostgreSQL connection verified; hosted/member access remains personal verification. |
| #46 | UI still used browser storage | `main.jsx`, `App.jsx`, `profileApi.js`, Vite proxy; frontend/backend startup passed. |
| #47 | Existing migrations/seeds not independently rerun | Both committed PostgreSQL migrations applied to a fresh isolated test DB; seed repeated without resetting edits. |
| #48 | Existing repository needs verification | Reused `server/profile/repository.ts`; real reads, updates, omitted fields and transaction rollback passed. |
| #49 | Existing backend already implements PATCH contract | Reused API, validation and sanitized errors; HTTP/database verification passed. |
| #50 | No API frontend reads | API adapter + loading/missing/retry states; automated UI tests. |
| #51 | No API frontend saves | PATCH editable fields only; confirmed response drives success; regression tests. |
| #52 | Saving/error/cancel integration missing | Disabled save/cancel while saving; field errors/focus, preserved draft, check-stored-values and cancel tests. Live browser keyboard/responsive review pending. |
| #53 | No persistent-model diagram on backend branch | `docs/uml/profile-class.puml` and rendered SVG; checked against schema fields and relationships. Human visual review pending. |
| #54 | No persistent-save diagram | `docs/uml/profile-save-sequence.puml` and SVG; matches PATCH, transaction, errors and lost-response handling. Human visual review pending. |
| #55 | Existing tests and harness need rerun | Backend contract suite plus isolated real DB verification passed; test DB guard added. |
| #56 | Frontend tests only covered browser storage | `App.database.test.jsx`, `profileApi.test.js`, existing form/view tests; API integration and failure coverage added. |
| #57 | Backend restart harness existed; full UI not wired | Real HTTP PATCH, child-process stop/start, fresh GET passed without reseeding; actual browser restart remains unverified. |
| #58 | Team evidence and release incomplete | Setup, this matrix, AI review, release notes/checklist prepared; each member's run, review, merge and release remain pending. |

“Implemented” does not mean team-approved or fully accepted. Issues remain open;
no acceptance checkboxes were changed without human evidence.

## Executed checks

- `npm ci` passed. npm reported 3 moderate dependency advisories; no unrelated upgrades applied.
- `npx prisma generate` passed.
- `npm run db:migrate` applied both migrations to a fresh dedicated PostgreSQL 17 test database.
- `npm run db:seed` passed; repeated seed preserved selected fixture edits and history.
- `npm run test:database` passed via isolated URL wrapper. Verified complete GET;
  normalized/repeated PATCH; read-only and invalid rejection without writes;
  partial updates; empty interests; actual constraint-error rollback; concurrent
  distinct-field writes; missing profile; sanitized unavailable DB; disabled demo API.
- Restart procedure: child HTTP backend saves fixture, stops with SIGTERM, starts
  another backend process against the same DB without seeding, then GET returns
  identical saved values. Automated assertion passed.
- `npm run lint`, `npm test`, `npm run typecheck:server`, `npm run build`,
  `npx prisma validate`, `npm run uml:render`, and `git diff --check`: see final run below.
- Started backend on loopback port 3101 and Vite on 3102 with backend proxy; both reported ready.
- Browser check: Google Chrome computer access denied. No live-browser visual,
  narrow-screen, keyboard or fresh-browser persistence result is claimed.
- PostgreSQL driver emitted a query-concurrency deprecation warning inside Prisma;
  assertions passed. This should be checked when upgrading the Prisma/pg adapter.

All database operations used a password-protected temporary local cluster. No
shared database was reset, migrated or modified. Credentials are ignored and not
included in commits. Generated response examples contain fictional fixture data.

## Final verification result

All configured root checks passed: lint (0 warnings), 90 tests across 10 files,
backend TypeScript check, Prisma validation, production Vite build, PlantUML
render and whitespace diff check. Secret exclusion checks returned `.env`,
`.pg-password` and `.pg-test/server.log` as ignored; only `.env.example` was
tracked among environment/key/database patterns. Separate live database harness
passed all ten result groups. Chrome/manual browser checks remain blocked.
