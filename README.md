# SkillVault

SkillVault is a local-first personal AI workflow asset manager. It is designed to manage 20-50 real reusable assets such as prompts, agent skills, rules, templates, workflows, SOPs, and checklists.

## Current Scope

v0.1-alpha is a localhost-only Next.js web app with local SQLite storage and Markdown import/export planned as the exchange format.

This project is not a SaaS product and should not be deployed directly as a multi-user cloud app. The SQLite database is expected to live in the local server environment.

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

The default database path is `./data/skillvault.sqlite`. You can override it with `SKILLVAULT_DB_PATH`.

## Project Structure

```
app/            # Next.js App Router pages
components/     # React UI components
db/             # Drizzle schema, migrations, database index
server/         # Server Actions, services, queries
lib/            # Constants, validators, utilities, markdown/variable helpers
docs/           # Product spec, tech spec, task tracker
data/           # SQLite database file
```

## Not in v0.1-alpha

v0.1-alpha does not include login, cloud sync, prompt markets, AI optimization, browser plugins, RAG, multi-model chat, Tauri, Electron, or mobile app packaging.

## Development Roadmap

### v0.1-alpha (current)

Core asset management with CRUD, tags, search/filter/sort, copy with variable filling, versioning, rollback, Markdown import/export, and mobile browser support.

### v0.1-beta

- Collection management (group assets into collections).
- Manual TestCase and run log records.
- Dashboard statistics.
- Built-in template library.
- Export template improvements for AGENTS.md, CLAUDE.md, Codex Skill, and image prompts.
- Batch Markdown export.
- Experimental Markdown folder import.

### v0.2

- PWA experience enhancements.
- Batch Markdown export.
- Markdown folder import.
- Basic backup and restore.

### v0.3

- Tauri desktop app experiment.
- Capture Inbox for manual asset collection.
- Simple text diff.

### v0.4

- Markdown folder two-way sync.
- GitHub repository sync experiment.
- Conflict copy preservation.

### v0.5

- Codex Skill template enhancements.
- Claude Code / CLAUDE.md templates.
- AGENTS.md composition generation.
- Cursor Rules templates.
- Skill Pack packaging.

### v0.6

- Curated library browsing.
- Manual import from curated Skills.
- Source tracking.
- Curated library update checks.

### v0.7

- Prompt lint.
- Rule checks.
- Asset health scoring.

## Asset Types

SkillVault manages these asset types:

- `agent_skill` — Skills for Codex, Claude Code, Trae Solo, etc.
- `system_rule` — System rules, behavior specs, project rules.
- `chat_prompt` — AI chat prompts.
- `image_prompt` — Image generation prompts.
- `reply_template` — Reply templates.
- `workflow` — Workflows.
- `checklist` — Checklists.
- `sop` — Standard operating procedures.
- `reference` — Reference materials, rule snippets, reusable explanations.

## Target Tools

Assets can target specific tools: Codex, Trae Solo, Claude Code, ChatGPT, Claude, Gemini, Cursor, Midjourney, Flux, Stable Diffusion, DALL-E, or general.

## Export Presets

Export presets control Markdown output format: general Markdown, Codex Skill, AGENTS.md, CLAUDE.md, Cursor Rules, or plain text.
