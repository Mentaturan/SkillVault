# SkillVault

SkillVault is a local-first personal AI workflow asset manager. It is designed
to manage 20-50 real reusable assets such as prompts, agent skills, rules,
templates, workflows, SOPs, and checklists.

## Current Scope

v0.1-alpha is a localhost-only Next.js web app with local SQLite storage and
Markdown import/export planned as the exchange format.

This project is not a SaaS product and should not be deployed directly as a
multi-user cloud app. The SQLite database is expected to live in the local
server environment.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- SQLite
- Drizzle ORM
- TanStack Table
- Zod

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

## Database

```bash
npm run db:generate
npm run db:migrate
```

The default database path is `./data/skillvault.sqlite`. You can override it
with `SKILLVAULT_DB_PATH`.

## Not in v0.1-alpha

v0.1-alpha does not include login, cloud sync, prompt markets, AI optimization,
browser plugins, RAG, multi-model chat, Tauri, Electron, or mobile app
packaging.
