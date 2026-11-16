# Sprint 2 AI design corrections

Agent review, November 15, 2026. Team approval is pending.

- Corrected the assumption that main lacking a backend means one should be built
  from scratch. Reused Devin's PostgreSQL/Prisma implementation at `65c98c4`;
  Nick's branch had the same commit. Ian explicitly chose that backend over the
  old local MySQL implementation. No shared-schema replacement was made.
- Corrected the old full-profile PUT design: frontend now PATCHes only name,
  interests and goal. Server rejects read-only/unknown keys before validating values.
- Preserved repository row locks and atomic nested writes rather than merging an
  old profile snapshot into the database. Omitted fields remain untouched;
  concurrent same-field updates use the last committed value. Real rollback and
  distinct-field concurrency assertions passed.
- Corrected a false failure assumption: a lost save response does not prove a
  rollback. UI says the save could not be confirmed, preserves the draft, and
  offers a fresh GET displaying stored values before retry.
- Server field `academicInterests` maps to `interestsText`; errors focus the input.
  API failures never trigger sample-data/localStorage fallback in the app entry point.
- Kept existing schema and history snapshots rather than inventing a new Course
  entity model for this integration. UML shows the relevant subset, nullable
  links, stored decimal types and BigInt IDs. Public identity remains opaque.
- Tightened existing live-test tooling to require an explicit isolated test URL
  ending in `_test`. The shared hosted database is never the test fallback.
- Rejected invented team approvals and contribution claims. This agent run under
  Ian's configured identity does not satisfy each person's individual verification.

These are corrections actually reviewed/applied by the agent, not a claim that
teammates reviewed AI output. Each teammate should record their own review in the
release checklist. The fictional demo selection is not production authentication.
