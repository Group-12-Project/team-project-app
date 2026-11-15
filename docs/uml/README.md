# Persistent profile UML

`npm run uml:render` regenerates the SVGs from the `.puml` sources (PlantUML).
The class diagram shows the Sprint 2 subset of Devin's existing PostgreSQL
schema; the sequence shows the implemented API and frontend flow.

Field types, nullable relationships, public/database ID mapping and transaction
behavior were checked against `prisma/schema.prisma` and `server/profile/`.
Rendered successfully on November 15, 2026; teammate visual readability review
remains required. Agent review does not represent team approval.

Visual QA correction: removed `hide methods`, which PlantUML had used to hide
SQL-typed attributes containing parentheses, and set an explicit white background
so text remains readable in dark image viewers. Re-rendered and inspected PNG
previews of both SVGs; team approval is still pending.
