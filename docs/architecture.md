# Sprint 2 architecture

Browser: `main.jsx` injects `profileApi` into App. App loads the complete profile
and handles loading/missing/retry states. ProfilePage saves asynchronously and
shows success only after a validated response. ProfileEditForm edits name,
interests and goal, retains failed drafts and maps server field errors.

`profileApi` → relative GET/PATCH `/api/profile` → Vite development proxy →
Node HTTP `handleProfileRequest` → validated repository → Prisma → PostgreSQL.
Repository updates lock the selected profile row, write supplied fields and
interest rows in one transaction, and return a complete mapped profile.
Reads use a repeatable-read transaction. Omitted PATCH fields remain unchanged.

The server selects fictional user 900001 and maps it to public
`sample-current-student-001`. The route requires ENABLE_DEMO_PROFILE_API=true
and is disabled in production mode. This is development identity, not secure
user authentication. Database credentials never enter the browser bundle.

`profileService` localStorage functions remain for historical Sprint 1 tests.
The application entry point always selects the API; backend failures have no
sample/localStorage fallback. Existing UI styles and pathway service are retained.

See [contract](profile-api-contract.md), [UML](uml/README.md),
[verification](sprint2-verification.md) and [setup](database-setup.md).

The original Sprint 1 design record follows as historical context.

---

# Sprint 1 profile implementation plan

## Objective

Implement Issue #26 as one functional vertical slice: a current graduate student can open, review,
edit, validate, save, cancel, and reopen a fictional GradPath profile.

## Design direction

The web prototype establishes a persistent GradPath header and left navigation, a constrained main
content area, white information cards, pale green academic-progress treatment, deep green primary
actions, and distinct view, edit, and saved states.

The implementation references these frames:

- Profile view: Figma node `6:3794`
- Profile edit: Figma node `6:3902`
- Saved state: Figma node `6:4040`

Exact VS Code Figma MCP and Copilot evidence remains a team assignment requirement. The current
implementation should be adjusted if that required review identifies a design mismatch.

## Chosen architecture

React and Vite provide a small component model, fast local development, production builds, and a
straightforward testing path. A hash route is sufficient for the Sprint 1 prototype and works when
the static build is served from a web server without special route rewrite rules.

```text
App
├── application header and primary navigation
└── ProfilePage
    ├── ProfileView
    └── ProfileEditForm

sampleProfile → profileService → App state → ProfilePage
                                     ↓ save
                              localStorage v1
```

## File responsibilities

- `src/data/sampleProfile.js` — fictional seed profile and shared data shape.
- `src/services/profileService.js` — guarded load, save, and reset operations using the versioned
  `gradpath.profile.v1` storage key.
- `src/utils/profileValidation.js` — normalization and validation independent of React.
- `src/components/ProfileView.jsx` — read-only profile, progress, interests, goal, and course history.
- `src/components/ProfileEditForm.jsx` — editable fields, field-level errors, read-only academic
  summary, save, and cancel.
- `src/pages/ProfilePage.jsx` — view/edit orchestration, persistence, and save confirmation.
- `src/App.jsx` — shell, hash navigation, and current in-memory profile state.

## Data contract

The profile contains:

- `id`
- `preferredName`
- `studentStatus`
- `graduateProgram`
- `specialization` (`string` or `null`)
- `academicInterests` (`string[]`)
- `careerGoal`
- `courseHistory` (course ID, code, title, and optional term)
- degree-progress values, expected graduation, and GPA for display

Only preferred name, academic interests, and academic/career goal are editable in Sprint 1.

## Validation rules

- Preferred name is required, trimmed, 2–60 characters.
- Academic/career goal is required, trimmed, 3–300 characters.
- Interests are optional, comma-separated, trimmed, deduplicated case-insensitively, limited to eight,
  and limited to 50 characters each.
- A failed submission focuses the first invalid field and links feedback with `aria-describedby`.

## Persistence and failure behavior

Valid changes are serialized to the versioned local-storage key. Loading missing, malformed, or
structurally invalid data safely returns a fresh copy of the fictional seed profile. Cancel never
writes. Official academic and course-history fields are preserved during an editable-field update.

## Testing strategy

Automated tests cover navigation, data rendering, read-only fields, empty states, validation,
normalization, valid save, cancel, refresh persistence, malformed storage, and the service boundary.
Manual checks remain necessary for visual comparison, keyboard flow in a real browser, responsive
layout, and the final demonstration recording.
