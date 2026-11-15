# Persistent profile UML

`npm run uml:render` regenerates the SVGs from the `.puml` sources (PlantUML).
The class diagram shows the Sprint 2 subset of Devin's existing PostgreSQL
schema; the sequence shows the implemented API and frontend flow.

Field types, nullable relationships, public/database ID mapping and transaction
behavior were checked against `prisma/schema.prisma` and `server/profile/`.
Rendered successfully on November 15, 2026; teammate visual readability review
remains required. Agent review does not represent team approval.
