# GradPath

GradPath is a graduate-degree planning application for prospective students, current graduate
students, returning students, alumni, and academic advisors. The Sprint 1 increment implements a
functional current-student profile flow.

## Sprint 1 feature: student profile

A current graduate student can:

- Open **My Profile** from the GradPath navigation.
- Review their name, academic status, graduate program, specialization, interests, goal, degree
  progress, and course-history summary.
- Clearly distinguish official read-only academic information from editable information.
- Edit their preferred name, academic interests, and academic or career goal.
- Receive field-level feedback when required information is invalid.
- Save valid changes and receive a visible confirmation.
- Cancel without changing the previously saved profile.
- Retain saved changes after navigation or browser refresh.
- See understandable empty states when optional information is unavailable.

The implementation uses fictional data and browser `localStorage`. It does not connect to UNC
Charlotte systems or contain real student records.

### Planning and design links

- [Canonical consolidated feature backlog — Issue #27](https://github.com/Group-12-Project/team-project-app/issues/27)
- [Implemented user story — Issue #26](https://github.com/Group-12-Project/team-project-app/issues/26)
- [Sprint 1 implementation tracker — Issue #16](https://github.com/Group-12-Project/team-project-app/issues/16)
- [GradPath App — Development project](https://github.com/orgs/Group-12-Project/projects/1)
- [Figma profile view](https://www.figma.com/design/UdKLxRySUFayJww0xsZJWR/GradPath-%E2%80%94-Final-Mobile---Web-UI?node-id=6-3794)
- [Figma profile editing](https://www.figma.com/design/UdKLxRySUFayJww0xsZJWR/GradPath-%E2%80%94-Final-Mobile---Web-UI?node-id=6-3902)
- [Figma saved state](https://www.figma.com/design/UdKLxRySUFayJww0xsZJWR/GradPath-%E2%80%94-Final-Mobile---Web-UI?node-id=6-4040)

## Technology

- React 19 for the user interface
- Vite 8 for local development and production builds
- Browser hash routing for this focused prototype
- Versioned `localStorage` persistence through a dedicated profile service
- Vitest, jsdom, and Testing Library for behavior-focused automated tests
- ESLint for static analysis

See [the architecture and implementation plan](docs/architecture.md) for the component and data
flow.

## Prerequisites

- Node.js 22.12 or newer (a current LTS release is recommended)
- npm

The implementation was verified with Node.js 26.13.0 LTS and npm 11.20.0.

## Installation

```bash
git clone https://github.com/Group-12-Project/team-project-app.git
cd team-project-app
npm install
```

## Running locally

```bash
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`, and select **My Profile**.
The profile can also be opened directly at `http://localhost:5173/#/profile`.

## Testing and verification

Run the complete verification sequence before opening or merging a pull request:

```bash
npm run lint
npm test
npm run build
```

- `npm run lint` checks JavaScript and JSX for blocking static-analysis issues.
- `npm test` runs the profile route, view, empty-state, validation, save, cancel, service, and
  persistence tests once.
- `npm run build` creates the production bundle in `dist/`.

The current criterion-by-criterion record is in
[docs/acceptance-test-results.md](docs/acceptance-test-results.md). All automated acceptance checks
and project verification commands passed with no blocking issues. The remaining manual acceptance
checks and demonstration evidence are still pending, so not all acceptance criteria have been
confirmed yet. The supporting acceptance results and
[submission checklist](docs/submission-checklist.md) are included in the GitHub repository.

Chrome local-render evidence:

- [Profile view at 1440×1000](docs/evidence/profile-view.png)
- [Profile editing at 1440×1000](docs/evidence/profile-edit.png)
- [Profile view at a true 390×844 Chrome viewport](docs/evidence/profile-mobile-chrome.png)

The complete deliverable manifest and remaining evidence are tracked in
[docs/submission-checklist.md](docs/submission-checklist.md).

## Development workflow

The feature is progressing through the required Sprint 1 workflow:

1. Product Backlog Item and acceptance criteria in Issue #26
2. Sprint selection, sizing, ownership, priority, and status on the GitHub Project
3. Profile-view, edit, and saved-state Figma references
4. Implementation on `feature/profile-foundation`
5. Incremental commits for scaffold, profile display, editing/persistence, and tests/documentation
6. Automated verification and Chrome local-render checks are complete; required manual checks remain
7. Pull request review, merge, and final evidence updates remain pending

Do not merge the branch until a teammate has reviewed it and the remaining manual checks are
recorded.

## Sprint 1 responsibility map

| GitHub account | Assigned responsibility | Task links |
| --- | --- | --- |
| `johnmi-works` | Project setup and kickoff; application foundation and shared profile contract; integration, UI reconciliation, final technical verification, and PR preparation | [#28](https://github.com/Group-12-Project/team-project-app/issues/28), [#35](https://github.com/Group-12-Project/team-project-app/issues/35) |
| `nwhitton-hash` | Profile data and read-only view, persistence, and related tests | [#29](https://github.com/Group-12-Project/team-project-app/issues/29) |
| `Ian-Peterson` | Profile editing and validation, save/cancel behavior, and related tests | [#30](https://github.com/Group-12-Project/team-project-app/issues/30) |
| `dsehgal-projects` | Acceptance testing, Figma comparison, responsive and keyboard checks, documentation, demonstration evidence, and final review | [#31](https://github.com/Group-12-Project/team-project-app/issues/31) |

This map reflects the current Sprint 1 task assignments. Completion and review are tracked in the
linked issues and pull requests; an assignment alone does not indicate completed work.

## AI-assisted development disclosure

OpenAI Codex assisted with organizing the Product Backlog Items, interpreting the selected Figma
profile direction, scaffolding the application, proposing implementation code, and developing tests
and documentation. The GradPath team is responsible for reviewing the code, running the application
and tests, comparing the result with Figma, correcting problems, and approving the final pull
request.

The assignment separately requires evidence of GitHub Copilot and the Figma MCP Server operating in
VS Code. This README does not claim that those screenshots or the required Copilot/Figma MCP session
have been completed.

Team review record: pending. Before submission, teammates must record what they actually reviewed,
modified, tested, or verified; planned assignments alone are not contribution evidence.

## Privacy and scope

- All included names, academic records, interests, and goals are fictional sample data.
- Production authentication and university-system integration are intentionally out of scope.
- Course discovery, ratings, advising, schedule planning, recommendations, and AI interview practice
  remain separate backlog features.
