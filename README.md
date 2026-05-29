# SkillVault

SkillVault is a local-first personal AI workflow asset manager for a small library of 20-50 reusable assets.

It stores and manages prompts, agent skills, project rules, reply templates, image prompts, workflows, SOPs, checklists, and other reusable AI workflow materials.

## Current Status

The project is in `v0.1.0-alpha`.

The local foundation is in place: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, SQLite, Drizzle ORM, Zod validators, asset services, tag services, version services, and basic asset pages.

The next development focus is finishing alpha workflows:

- Search, filters, and sorting.
- Raw copy and variable-filled rendered copy.
- Version history and rollback.
- Markdown import/export.
- Mobile browser usability.
- Typecheck, lint, build, and full smoke testing.

## Product Scope

SkillVault is a localhost web app with local SQLite storage. It is intended for one person managing a practical library of reusable AI workflow assets.

SQLite is the source of truth. Markdown is the exchange format for import, export, backup-like workflows, and tool-specific files.

SkillVault is not a SaaS app, prompt market, AI chat tool, RAG system, sync service, browser extension, or multi-user collaboration tool.

## Tech Stack

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- shadcn/ui
- SQLite
- Drizzle ORM
- TanStack Table
- Zod
- Plain `textarea` editor

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Verification

Run these before treating a phase as complete:

```bash
npm run typecheck
npm run lint
npm run build
```

## Database

The default database path is:

```text
./data/skillvault.sqlite
```

Override it with:

```bash
SKILLVAULT_DB_PATH=/absolute/path/to/skillvault.sqlite npm run dev
```

Generate and apply Drizzle migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Project Structure

```text
app/            Next.js App Router pages and Server Actions
components/     React UI components
db/             Drizzle schema, migrations, and database index
server/         Services and queries
lib/            Constants, validators, utilities, markdown, variables
docs/           Development plan and project notes
data/           Local SQLite database file
```

## Asset Types

SkillVault currently models these asset types:

- `agent_skill`
- `system_rule`
- `chat_prompt`
- `image_prompt`
- `reply_template`
- `workflow`
- `checklist`
- `sop`
- `reference`

## Target Tools

Assets can target:

- Codex
- Trae Solo
- Claude Code
- ChatGPT
- Claude
- Gemini
- Cursor
- Midjourney
- Flux
- Stable Diffusion
- DALL-E
- General use

## Export Presets

Export presets control Markdown output shape:

- General Markdown
- Codex Skill Markdown
- AGENTS.md
- CLAUDE.md
- Cursor Rules
- Plain text

## Versioning Model

- New asset creates version 1.
- Content hash changes create a new version.
- Metadata-only edits do not create a version.
- Rollback writes old content to the asset and creates a new version.
- Versions are never deleted.

## Roadmap Summary

### v0.1-alpha

Core local asset management: CRUD, tags, search/filter/sort, copy, variables, versions, rollback, Markdown import/export, settings, mobile browser support, and verification.

### v0.1-beta

Collections, manual test cases, run logs, dashboard statistics, built-in templates, export preset improvements, batch Markdown export, and experimental folder import.

### v0.2

Backup and restore, PWA comfort improvements, stronger folder import, and safer import/export reliability.

### v0.3

Capture Inbox, simple text diff, copy usage metadata, stale asset indicators, and a Tauri feasibility experiment.

### v0.4

Local Markdown folder two-way sync experiment, dry-run preview, conflict copy preservation, and optional Git repository workflow experiment.

### v0.5

Codex Skill templates, Claude Code and CLAUDE.md templates, AGENTS.md composition, Cursor Rules templates, and Skill Pack packaging.

### v0.6

Curated library browsing, manual curated asset import, source tracking, and update checks while staying local-first.

### v0.7

Deterministic prompt lint, rule checks, asset health scoring, and a maintenance queue.

### v0.8

Review cadence, archive workflow, duplicate detection, lifecycle filters, and bulk metadata edits.

### v0.9

Migration hardening, data integrity checks, repair tools, packaging decision, and upgrade documentation.

### v1.0

Stable local release for personal use with reliable SQLite storage, Markdown import/export, backup and restore, versioning, rollback, organization, and migration documentation.

See `docs/TASKS.md` for the detailed task plan.

## Not in v0.1-alpha

v0.1-alpha does not include login, user accounts, cloud sync, OAuth, iCloud API, OneDrive API, GitHub OAuth, Skill markets, third-party Skill downloads, AI prompt optimization, browser plugins, OCR capture, multi-model chat, RAG, team features, comments, likes, payments, complex charts, Monaco, CodeMirror, rich text editing, complex diff, zip export, Electron, Tauri, mobile app publishing, cloud deployment adaptation, multi-user permissions, public sharing, template stores, or remote curated libraries.

## Project Documents

- `README.md`: project overview, local setup, and roadmap summary.
- `docs/TASKS.md`: detailed development plan and phase status.
- `AGENTS.md`: rules for AI coding agents working in this repository.
