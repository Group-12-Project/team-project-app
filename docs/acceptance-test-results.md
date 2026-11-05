# Sprint 1 profile acceptance-test results

- Date: October 28, 2026
- Story: [Issue #26](https://github.com/Group-12-Project/team-project-app/issues/26)
- Branch: `feature/profile-foundation`

## Automated verification

Environment used for this record:

- Node.js 26.13.0 LTS
- npm 11.20.0
- Vitest 5.0.5 with jsdom and Testing Library

| Command | Result |
| --- | --- |
| `npm run lint` | Pass — no blocking ESLint findings |
| `npm test` | Pass — 5 test files and 23 tests |
| `npm run build` | Pass — Vite production bundle created successfully |

## Acceptance-criteria record

| Issue #26 acceptance criterion | Method | Result |
| --- | --- | --- |
| Clear way to open the current student's profile | Application navigation interaction test | Pass |
| Name, status, program, interests, goals, and course history display from sample data | Route/render test using the shared profile contract | Pass |
| Official non-editable information is distinguishable | Read-only badges, separate styling, edit-form role queries, and manual visual check | Pass |
| User can enter edit mode and change supported fields | End-to-end interaction and form tests | Pass |
| Required fields and invalid-value feedback are clear | Invalid-submit test checks messages, `aria-invalid`, and focus | Pass |
| Saving valid changes updates the displayed profile | End-to-end save test | Pass |
| Visible confirmation appears after save | End-to-end test checks the `role="status"` message | Pass |
| Saved changes persist after reopening or refresh | Local-storage service test and App unmount/remount test | Pass |
| Cancel leaves the saved profile unchanged | End-to-end cancel test and callback test | Pass |
| Missing optional information has clear empty states | Profile-view empty-state test | Pass |
| Interface reasonably reflects the Figma profile flow | Structure, cards, colors, progress, navigation, and actions implemented; manually compared with Figma | Pass |
| Profile flow runs locally and is functional | Automated interactions, production build, Chrome local-render screenshots, and manual end-to-end checks | Pass; full-flow recording pending as separate demonstration evidence |
| Results are recorded for every criterion | This document | Pass |

Chrome local-render evidence:

- [Profile view at 1440×1000](evidence/profile-view.png)
- [Profile editing at 1440×1000](evidence/profile-edit.png)
- [Profile view at a true 390×844 Chrome viewport](evidence/profile-mobile-chrome.png)

These screenshots prove that the local view and edit routes render in Chrome and that the profile
layout fits a 390-pixel viewport without page-wide horizontal overflow. They do not replace the
required full-flow demonstration recording or VS Code Copilot/Figma MCP evidence.

## Manual checks required before submission

- [x] Connect the Figma MCP Server in VS Code and capture the required evidence.
- [x] Have Copilot access the selected Figma frame and record how it informed implementation.
- [x] Compare view, edit, and saved states with Figma at the 1440×1000 reference viewport.
- [x] Check the responsive layout at a narrow viewport without horizontal content overflow.
- [x] Use only the keyboard to navigate to My Profile, edit fields, trigger validation, cancel, and
  save.
- [x] Refresh the browser after a valid save and confirm the stored values remain.
- [x] Capture a local-run screenshot or short recording demonstrating the complete flow.
- [ ] Attach the final command output, pull request, review, and evidence links to Issues #26 and #16.

Do not change any remaining pending manual result to Pass until it has been performed and recorded.
