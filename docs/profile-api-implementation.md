# Profile API implementation and handoff — November 12, 2026

Implements #48/#49 for the Sprint 2 agreement in
[John's #43 contract](https://github.com/Group-12-Project/team-project-app/blob/docs/sprint2-profile-contract-43/docs/profile-api-contract.md).
John and Devin confirmed **Prisma Postgres**, endpoint ownership, and the demo
identity mapping on November 12. Older MySQL wording in the source contract is
superseded by that confirmation; no database dialect migration is needed here.

## Ownership and scope

- Devin: profile endpoints, server validation, repository/persistence, atomic saves,
  seed completion, and backend/database verification.
- John: shared contract, application wiring, integration verification and restart
  evidence for the complete frontend/backend application.
- Ian: reviewed models, relationships and migrations.
- Nick: frontend read/save integration and UI states/tests.

The frontend continues using its existing storage service until Nick wires it to
the API. This work does not claim frontend persistence, cancellation/UI tests, or
production authentication. No schema migration was required.

## Run and call the endpoints

Keep DATABASE_URL and DIRECT_URL in the private root `.env`, then run:

```bash
npm ci
npm run db:generate
npm run db:seed
ENABLE_DEMO_PROFILE_API=true npm run server:dev
```

Local backend defaults to loopback port 3001. The Vite dev server proxies `/api`
to it, so the frontend can use relative `/api/profile` requests without CORS
configuration. Run `npm run dev` separately for the frontend. If changing the
backend port, coordinate the Vite proxy target too.

```bash
curl --fail http://127.0.0.1:3001/api/profile
curl --fail -X PATCH http://127.0.0.1:3001/api/profile \
  -H 'Content-Type: application/json' \
  -d '{"preferredName":"Demo Updated Student","academicInterests":["Databases","Accessible design"],"careerGoal":"Build accessible tools for graduate students."}'
curl -i -X PATCH http://127.0.0.1:3001/api/profile \
  -H 'Content-Type: application/json' \
  -d '{"careerGoal":"This whole request must be rejected.","gpa":"4.0"}'
```

The last request returns HTTP 400 with FIELD_NOT_ALLOWED and `fields.gpa`; its valid
goal change is also rejected. Success returns HTTP 200 and the complete profile
directly, with no wrapper. No demo ID is accepted in requests.

Actual GET, successful PATCH, and rejected-update responses are recorded in
[profile-api-examples.json](profile-api-examples.json). The GET example uses the
selected shared development profile. Write examples use a temporary isolated
fictional profile in a local test server with the same opaque alias. Therefore
their stored history IDs differ. They are actual HTTP/database responses, not a
claim that the new routes have already been deployed.

## Identity and development boundary

The repository maps PostgreSQL user/profile **900001** to public string ID
**sample-current-student-001**. Names and email do not determine identity. History
IDs are stable strings (`history-<stored history ID>`); they identify stored entries,
not catalog course IDs. GET and PATCH select the same server-configured profile.
Client-provided identity/query parameters are rejected, and PATCH `id` is read-only.

Local profile routes require ENABLE_DEMO_PROFILE_API=true and are disabled when
NODE_ENV=production. The Composer service receives a typed enable flag only for
the **backend-preview** and local **dev** environments, not production. The default
server configuration disables demo routes. Health routes remain available.

The preview is publicly reachable and contains only fictional development data.
Anyone with its URL can access/edit that demo while enabled; it is not multi-user
authentication or authorization. Before production or real/private data, replace
demo selection with server-verified identity and ownership checks. The API does
not add permissive CORS or accept a client-specified profile ID.

## Response mapping

[repository.ts](../server/profile/repository.ts) selects only the needed profile,
program, concentration, interests and course-history fields. No password hash,
identity-provider metadata, account role, or connection settings are selected.

- All contract fields are present; interests/history are arrays and specialization
  is null when absent. BigInt IDs are mapped to strings; decimals never leak into JSON.
- Program/status are nonempty display strings; expected graduation uses English
  month and year in UTC (May 2027); GPA is a decimal display string (3.4).
- Recorded credits take precedence; otherwise completed/transferred history is
  summed, and required credits fall back to the program. Contract credits must be
  finite integers with completed >= 0 and required > 0.
- Course snapshots take precedence over current course catalog labels. Missing
  terms are omitted. Missing required academic/history data yields sanitized 500
  rather than invented data or fallback to a browser sample.

## Validation, errors and transaction behavior

[validation.ts](../server/profile/validation.ts) applies contract precedence:
body shape (400 INVALID_REQUEST), forbidden/read-only keys (400 FIELD_NOT_ALLOWED),
then editable types/values (422 VALIDATION_ERROR). Name/goal trim and require 2–60
and 3–300 UTF-16 code units respectively. Interests trim, drop blanks, deduplicate
case-insensitively in first-seen order, then enforce at most 8 entries and 50 code
units each. Shared limits also drive the current form validator. `[]` clears
interests; omitted fields remain unchanged. Null does not clear editable fields.

The HTTP handler rejects malformed JSON, non-JSON content types, identity query
parameters and bodies over 16 KiB with INVALID_REQUEST. Other methods return 405
with `Allow: GET, PATCH`. These transport safeguards do not mutate stored data.

The repository validates before writing and uses a transaction plus a parameterized
PostgreSQL row lock for all PATCH requests, including interest-only updates.
Scalar updates and replacement of interest rows commit together. Failed interest
writes roll back the profile changes. Successful responses are sent only after
commit. Omitted fields are never spread from a stale read. Concurrent same-field
changes follow the agreed last-committed-value behavior; no version tokens or
optimistic conflict detection are implemented.

Read mapping uses a repeatable-read transaction so relation queries share a
consistent snapshot. Missing profile reads/writes return 404 PROFILE_NOT_FOUND
without creating or substituting anything. Known database connection/pool failures
map to 503 SERVICE_UNAVAILABLE; unexpected failures map to 500 INTERNAL_ERROR.
All errors use `{ "error": { "code", "message", "fields"? } }`. Field keys match
the API, including academicInterests. Database errors, SQL, credentials, and stack
traces are not returned or logged by the repository or HTTP handler.

If a response is lost after a commit, a save is unconfirmed, not necessarily rolled
back. John/Nick should preserve drafts and allow GET before retrying. Repeating a
PATCH sets the same values without duplicate interests.

## Fictional seed completion

[seedProfile.ts](../prisma/seedProfile.ts) now completes the development profile's
missing program, concentration, status, graduation date, GPA, recorded 24/30
credits, and three course-history snapshots with terms. Existing non-null academic
values and saved editable fields are preserved. Interests initialize only for a
new profile; reseeding does not undo a saved empty interest list. Snapshot lookup
prevents duplicate seeded courses. No password is assigned.

## Verification and evidence

Unit/contract tests: `npm test` (77 tests across 8 files).
Backend type checks: `npm run typecheck:server` and
`npm --prefix deploy run typecheck`. Lint/build: `npm run lint`, `npm run build`.

Explicit live test: `npm run db:verify-profile-api`. It is not run automatically
on every CI push against the shared database. It reads the selected profile,
checks seed idempotence, creates an isolated fictional user/profile, boots the
real HTTP backend in a child process, updates and re-reads the database, stops
that process and starts a new one without reseeding, then confirms persistence.
It also verifies forbidden/invalid requests, partial updates, clearing interests,
repeat saves, concurrent partial saves, and missing-record errors.

Rollback is verified with a test-only transaction fault: after a scalar update
and interest deletion, an actual PostgreSQL overlong-interest constraint failure
is triggered for that fixture. A new HTTP GET must show no partial changes.
Database unavailability is checked by starting the server with a fictional
unreachable connection; expected response is sanitized 503. Disabled demo access
is checked separately. Temporary records are deleted, and cleanup failures exit
nonzero. The original demo profile's editable values are not changed by this test.

The full frontend/browser restart acceptance check remains John's integration
task. A passing local HTTP test against hosted PostgreSQL is not a claim that the
new deployed API has been verified; push/deploy, then ask John to check GET/PATCH
against the backend-preview URL and integrate the frontend.

Branch: **backend-database**. Final implementation commit/PR: record after commit.
Related: [#43](https://github.com/Group-12-Project/team-project-app/issues/43),
[#48](https://github.com/Group-12-Project/team-project-app/issues/48),
[#49](https://github.com/Group-12-Project/team-project-app/issues/49),
[#55](https://github.com/Group-12-Project/team-project-app/issues/55).
