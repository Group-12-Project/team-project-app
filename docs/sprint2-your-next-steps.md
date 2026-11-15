# Remaining human steps for Sprint 2

Implementation/review PR: https://github.com/Group-12-Project/team-project-app/pull/62
Contract PR: https://github.com/Group-12-Project/team-project-app/pull/59

## 1. Perform the required Copilot/Figma workflow

In VS Code, select GitHub Copilot Agent Mode and connect the team's Figma MCP
server. Have it inspect the actual profile design and compare it to the existing
Prisma models and UML, rather than replace completed work. Review the proposal
before accepting any model or database changes. Record the real tool session,
findings, corrections and team reviewer in `docs/ai-design-review.md`.
Codex work does not prove that Copilot Agent Mode was used.

## 2. Each person runs their own local database

Follow `docs/database-setup.md` and fill in its per-member verification table.
Each person installs, migrates, seeds, starts the app, saves and reads a change,
and verifies it after a backend restart. Never paste private URLs into evidence.

## 3. Complete shared cloud verification

Devin confirms authorized individual access to the designated development DB.
Use an agreed fictional fixture: John creates, Devin retrieves, Nick updates,
and Ian verifies the update. Record actual results in the setup table. These are
planned roles, not claims of work already performed.

## 4. Browser walkthrough

Use My Profile: wait for API data, edit each permitted field, save and reload;
edit and cancel; trigger an invalid name and confirm focus; stop backend and
verify retry/draft retention; restart it and check stored values. Confirm academic
fields are read-only. Check a 390px-wide viewport and keyboard-only operation.
For restart persistence, save, restart frontend/backend without reseeding, and
open a fresh browser session with localStorage cleared. Record actual outcomes.
Chrome computer access was denied to the agent, so this remains unverified.

## 5. Contribution and review evidence

Ian: integration commits `6f5cfd2`, `77419b1`, `6922f46`, `59ef360`.
Devin: backend implementation `65c98c4`, plus setup/migration commits.
John: contract commits on PR #59, including `b2dea16` and `d8028af`.
These are Git author records, not proof of personal database demonstrations.
No new Sprint 2 Nick commit was found in inspected branches; Nick should make a
meaningful contribution under his own identity, such as fixing a discovered UI
issue or adding substantive test coverage. Do not create empty/cosmetic commits.

Review the code, design corrections and diagrams as a team. Update issue/Project
statuses to match evidence, preserve assignees, and link PR #62. Mark acceptance
criteria complete only after the corresponding checks pass.

## 6. Final submission and release

After team review, merge approved changes into the agreed submission branch.
Confirm CI and required checks on that exact final commit. Create tag
`v0.2.0-sprint2` and a GitHub release using `docs/sprint2-release-notes.md` as the
body, updated to actual results. Submit repository URL and release URL. Do not
present the current draft PR as an approved release.
