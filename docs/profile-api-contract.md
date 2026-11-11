# Sprint 2 profile API contract and acceptance criteria

Status: **Agreed Sprint 2 contract, as reported by John — November 11, 2026.**

Tracks [#43](https://github.com/Group-12-Project/team-project-app/issues/43).
John reported agreement on PR #59 in the project conversation on November 11,
2026 and authorized finalization. This records that reported agreement; it does
not claim implemented endpoints or passing Sprint 2 tests.

## 1. User story and scope

As a current graduate student, I want to retrieve and update my profile so that
my permitted changes are stored in the database and remain available after the
application and backend restart.

Sprint 2 will move the existing My Profile flow from browser localStorage to
backend persistence. Devin selected MySQL and Prisma in
[#45](https://github.com/Group-12-Project/team-project-app/issues/45).
The agreed API preserves the existing camelCase frontend data shape. Prisma
models and SQL column names may differ; the backend maps them to this contract.

Include profile details, ordered academic interests, and read-only course-history
snapshots in the database slice. Use fictional development and test records.
New account registration, production authentication, university-record imports,
and expansion into catalogs, schedules, reviews, or other prototype modules are
outside this contract. Existing unrelated application features remain separate.

## 2. Agreed Sprint 2 decisions

| Decision | Sprint 2 agreement |
| --- | --- |
| Editable information | Preferred name, academic interests, academic/career goal. |
| Academic information | Display-only in the student interface; server rejects attempts to update it. Seeded fictional data must not be described as verified university records. |
| Figma differences | Preserve the existing app's narrower editing behavior for this slice. Full name is not silently substituted for preferred name; major/program and concentration/specialization retain the existing API names. Any expansion needs an explicit revision with the team. |
| Interests and history | Both are database-backed. Interests can be changed; history cannot be changed through the profile update operation. |
| Identity | Use a stable, opaque string profile ID, independent of name and email. Preserve `sample-current-student-001` for the fictional seed unless Ian and Devin agree on a mapping. |
| Development access | Backend selects one configured fictional demo profile. `GET /api/profile` and `PATCH /api/profile` refer to that same profile; clients cannot submit an ID to choose another student. |
| Authentication boundary | The demo identity is a development-only limitation. Access must remain limited to the development environment. Before multi-user or public use, replace demo selection with server-verified identity and ownership checks. |
| Missing profile | Return 404 with an understandable empty state; do not silently create or substitute a sample record. |
| Source of truth | MySQL through the backend. Browser localStorage is not used as a successful-read or successful-save fallback. |

The agreed demo identity is limited to fictional development records. It does
not establish authentication or authorization. Any replacement identity
mechanism requires a contract revision and updated access checks.

## 3. Profile response fields

All listed top-level fields are present on successful reads and updates. Arrays
are empty when they have no entries. JSON numbers are finite numbers; JSON does
not contain `undefined`. Display strings are plain text.

| API field | JSON type | Editable | Meaning and constraints |
| --- | --- | --- | --- |
| `id` | string | No | Stable, nonempty profile identifier. |
| `preferredName` | string | Yes | Trimmed; 2–60 characters. Display preference, not a legal-name claim. |
| `studentStatus` | string | No | Nonempty display label, such as `Current graduate student`. |
| `graduateProgram` | string | No | Nonempty graduate-program display name. |
| `specialization` | string or null | No | Specialization label; null when none. |
| `academicInterests` | string[] | Yes | Ordered list; normalization and limits below. |
| `careerGoal` | string | Yes | Trimmed; 3–300 characters. |
| `courseHistory` | object[] | No | Stored history snapshots; shape below. |
| `creditsCompleted` | number | No | Nonnegative integer for this slice. |
| `creditsRequired` | number | No | Positive integer for this slice. |
| `expectedGraduation` | string | No | Nonempty display label, such as `May 2027`; not an ISO date. |
| `gpa` | string | No | Display string, such as `3.4`; backend converts stored decimal to a string. |

Each `courseHistory` entry has nonempty string `id`, `code`, and `title` fields.
`id` identifies the stored history entry within its profile. `term` is an optional
nonempty string; omit it when unavailable. The API does not return `term: null`,
matching the existing profile service's expected shape.

Ian owns the reviewed entities, relationships, database types, and migrations in
[#44](https://github.com/Group-12-Project/team-project-app/issues/44) and
[#47](https://github.com/Group-12-Project/team-project-app/issues/47).
This API contract does not approve the older proposed table mapping or require
Devin's full-prototype SQL schema to be implemented this sprint.

## 4. Operations and examples

The frontend uses relative `/api` URLs. John and Devin will document the local
backend port, frontend proxy or allowed origin, and startup settings in #46.
Database credentials remain in backend environment settings.
Requests and responses containing JSON use `Content-Type: application/json`.

### Read: GET /api/profile

No request body. Success returns **200** and the complete profile directly,
without an additional `data` or `profile` wrapper:

```json
{
  "id": "sample-current-student-001",
  "preferredName": "James Peterson",
  "studentStatus": "Current graduate student",
  "graduateProgram": "M.S. Computer Science",
  "specialization": "Software Engineering",
  "academicInterests": ["Software architecture", "Accessible design"],
  "careerGoal": "Build dependable, accessible tools for education.",
  "courseHistory": [
    {
      "id": "course-6114",
      "code": "ITCS 6114",
      "title": "Algorithms and Data Structures",
      "term": "Fall 2026"
    }
  ],
  "creditsCompleted": 24,
  "creditsRequired": 30,
  "expectedGraduation": "May 2027",
  "gpa": "3.4"
}
```

This is an illustrative fictional record, not a required exact seed dataset.

### Update: PATCH /api/profile

Accept a nonempty JSON object containing one or more of the three editable fields.
Omitted editable fields keep their stored values. Example request:

```json
{
  "preferredName": "Jamie Peterson",
  "academicInterests": ["Software architecture", "Accessible design"],
  "careerGoal": "Build accessible software for graduate students."
}
```

Success returns **200** with the complete, normalized, persisted profile in the
same shape as GET. For the read example above, the response is:

```json
{
  "id": "sample-current-student-001",
  "preferredName": "Jamie Peterson",
  "studentStatus": "Current graduate student",
  "graduateProgram": "M.S. Computer Science",
  "specialization": "Software Engineering",
  "academicInterests": ["Software architecture", "Accessible design"],
  "careerGoal": "Build accessible software for graduate students.",
  "courseHistory": [
    {
      "id": "course-6114",
      "code": "ITCS 6114",
      "title": "Algorithms and Data Structures",
      "term": "Fall 2026"
    }
  ],
  "creditsCompleted": 24,
  "creditsRequired": 30,
  "expectedGraduation": "May 2027",
  "gpa": "3.4"
}
```

Validate the whole submitted change before writing. Persist the profile and any
interest-row changes atomically in a transaction. Return success only after the
write commits. The frontend displays the returned values and then confirms the
save. Failed saves preserve the draft for correction or retry.

If the connection is lost after submission, the client cannot know whether the
database committed. Explain that the save could not be confirmed, preserve the
draft, and allow a fresh GET to check stored values before retrying. A lost
response must not be described as proof that nothing was saved. Repeating the
same PATCH sets the same field values; it does not append duplicate interests.

For this development slice, concurrent changes to the same submitted field use
the last committed value; omitted fields must remain untouched. Conflict
detection/versioning is not included. Document this limitation in the handoff.

## 5. Validation and normalization

- Reject malformed JSON, null, arrays, non-object bodies, and empty updates.
- Reject unknown properties and all read-only properties, even if their values
  equal the stored values. An invalid request makes no database changes.
- Supplied name and goal must be strings. Trim surrounding whitespace, then
  enforce their required lengths. Null cannot clear them.
- Supplied interests must be an array containing only strings. Trim each entry,
  discard empty entries, and deduplicate case-insensitively while preserving the
  first spelling and order. Then enforce at most eight interests and at most
  50 characters per retained entry. `[]` clears interests; null is invalid.
- For consistent frontend/backend limits, count lengths as JavaScript string
  `.length` does. Backend validation remains authoritative.
- The existing comma-separated form input is converted into an array before
  submission. Server field errors use `academicInterests`; Nick maps that key
  to the form's `interestsText` control.
- Read-only fields and stored course history remain unchanged by every PATCH.

## 6. Errors and frontend behavior

All API errors use this envelope. `fields` is included for field-specific errors
and omitted otherwise. Field keys match API property names.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Check the highlighted fields.",
    "fields": {
      "preferredName": "Preferred name must be at least 2 characters."
    }
  }
}
```

| HTTP status | Code | Meaning / required behavior |
| --- | --- | --- |
| 400 | `INVALID_REQUEST` | Malformed JSON, invalid body shape, or empty update. Explain that the request could not be accepted. |
| 400 | `FIELD_NOT_ALLOWED` | Unknown or read-only property. Include affected property keys in `fields`; reject the entire update. |
| 422 | `VALIDATION_ERROR` | Editable-field type or value fails validation. Show field feedback, focus the first invalid control, retain input. |
| 404 | `PROFILE_NOT_FOUND` | Selected demo profile does not exist. Show a missing-profile state; editing is unavailable. |
| 503 | `SERVICE_UNAVAILABLE` | Known database unavailability. Offer retry; do not claim a successful save. |
| 500 | `INTERNAL_ERROR` | Unexpected failure. Show a general retry message without database details. |

Evaluate body shape first, prohibited keys second, and editable values third.
Never expose SQL, stack traces, credentials, or private connection settings.
Network failures and invalid/non-JSON responses produce understandable frontend
errors; they never trigger a sample-profile or localStorage fallback. If an
authenticated identity mechanism is adopted, document its 401/403 behavior and
ownership checks here before using real student records.

## 7. Acceptance checks for implementation issues

These are required future checks, **not results already observed**.

| Check | Procedure | Passing result | Lead issue(s) |
| --- | --- | --- | --- |
| Profile retrieval | Seed a fictional profile and open My Profile against the real backend. | Database values render with the agreed types and fields. | #49, #50, #57 |
| Valid save | Edit all three permitted fields, save, and perform another GET. | Confirmation follows committed success; the response and next read contain normalized changes. | #49, #51, #57 |
| Partial update | PATCH only the goal. | Name, interests, history, and academic data remain unchanged. | #55, #57 |
| Invalid input | Submit short/blank name or goal, wrong types, too many interests, and overlong values. | 422 with field errors; a subsequent GET and database check show no changes. | #55, #56, #57 |
| Normalization | Send whitespace, empty interests, and case-duplicate interests; separately send `[]`. | Values normalize as specified; `[]` clears interests and survives another GET. | #55, #57 |
| Protected fields | Include `gpa`, `courseHistory`, or `id` alongside a valid goal change. | 400 `FIELD_NOT_ALLOWED`; the entire request leaves stored data unchanged. | #55, #57 |
| Bad request | Send malformed JSON, a non-object body, `{}`, or an unknown key. | Correct 400 response; no stored changes. | #55, #57 |
| Cancellation | Edit fields, cancel, and reopen the profile. | No PATCH is sent; previously saved values remain. | #52, #56 |
| Loading/saving | Delay read and update responses. | Clear loading/saving feedback; duplicate save actions are prevented. | #52, #56 |
| Empty data | Return empty interests/history and null specialization. | Useful empty displays with no crash or fabricated entries. | #52, #56 |
| Missing profile | Select a nonexistent fictional profile in an isolated test environment. | 404 and missing-profile UI; no automatic seed fallback or creation. | #55, #56, #57 |
| Failure/retry | Make backend/database unavailable; simulate invalid API responses in frontend tests. | Understandable errors, preserved edit draft, retry available, and no false success. | #52, #55, #56, #57 |
| Unconfirmed save | Commit an update but simulate loss of its response, then perform a fresh GET. | UI reports an unconfirmed save, preserves the draft, and lets the user check the committed values before retrying. | #52, #56, #57 |
| Atomic update | In an isolated backend test, force an interest-write failure after a profile-row change begins. | The transaction rolls back; a fresh read shows neither a partial profile change nor partial interest changes. | #55, #57 |
| Restart persistence | Save, stop/restart frontend and backend without reseeding, then read using a fresh browser session with localStorage cleared. | MySQL retains the saved values and the API/UI retrieve them. Record commands and actual results. | #57 |
| Keyboard/read-only UI | Navigate, edit, trigger errors, cancel, and save using the keyboard. | Controls and feedback are usable; academic/history fields cannot be edited. | #52, #56 |

John's real-database integration evidence uses isolated test records. Frontend
mocks demonstrate interface behavior; they do not establish database persistence.

## 8. Ownership and handoff

| Owner | Handoff / responsibility |
| --- | --- |
| John | Coordinate this contract (#43), application wiring and setup instructions (#46), integration tests and restart evidence (#57), team verification and release (#58). |
| Devin | Confirm API feasibility and demo identity; configure MySQL/Prisma (#45), data access (#48), endpoints (#49), backend/database tests (#55). |
| Ian | Reconcile this API with reviewed entities/ORM models (#44), migrations/seeds (#47), class/sequence diagrams (#53, #54). |
| Nick | Confirm response and error shapes work for the existing UI; implement backend reads/saves (#50, #51), UI states (#52), frontend tests (#56). |

## 9. Review record and #43 completion checklist

| Review | Status / evidence |
| --- | --- |
| John reviews this proposed contract | Approved in the project conversation, November 11, 2026; requested an additional Codex review. |
| Codex checks issue coverage and internal consistency | Reviewed November 11, 2026 against #43, the existing profile shape, validation, and service expectations; clarified unconfirmed-save handling, repeat updates, and transaction verification. This is a document review, not implementation verification. |
| Devin confirms backend, identity, validation, and error behavior | Agreement reported by John, November 11, 2026; see the agreement record below. |
| Ian confirms identifiers, models, interests/history storage, and seed compatibility | Agreement reported by John, November 11, 2026; see the agreement record below. |
| Nick confirms field permissions, request/response shapes, and UI error mapping | Agreement reported by John, November 11, 2026; see the agreement record below. |

Agreement record: John stated, 'We agree on it. make it all good' in the project
conversation on November 11, 2026 while discussing [PR #59](https://github.com/Group-12-Project/team-project-app/pull/59).
The agreement above is recorded on John's report, not as individual GitHub
reviews submitted by Devin, Ian, or Nick. No contract changes were requested.

- [x] John approves the draft or requests revisions.
- [x] Record John's reported agreement on the decisions in section 2.
- [x] Record John's reported agreement on the complete contract and acceptance checks.
- [x] Commit the reviewed proposal under John's GitHub identity and link its commit or PR in #43: [PR #59](https://github.com/Group-12-Project/team-project-app/pull/59), initial commit `b2dea16eac3a0646762c59085b78227a4a51ede7`. Agreement is recorded in this revision.
- [x] Link the proposal from the core model (#44), setup (#46), API (#49), frontend (#50), and integration-test (#57) issues; preserve issue ownership and existing content. Update these links/notes if team review revises the contract.
- [ ] After merging PR #59, update #43's criteria and close it with the merged contract as evidence.

Passing implementation tests, completed backend/frontend work, and the Sprint 2
release are tracked by their own issues. They are not required to define this
contract, and closing #43 must not imply that they are complete.

## Sources and review history

- Live #43 body and discussion, November 11, 2026: initial draft inventory reviewed before John subsequently reported agreement.
- Live #45 body and discussion, November 11, 2026: MySQL/Prisma decision and schema/SQL attachments posted by Devin.
- Current main-branch `src/data/sampleProfile.js`, retrieved November 11, 2026: existing profile response shape.
- Local `src/utils/profileValidation.js`, `src/services/profileService.js`, and `docs/architecture.md`: existing normalization, form limits, response expectations, and edit permissions. Backend rules and endpoints above define agreed requirements; implementation is tracked separately.
