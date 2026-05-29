# SkillVault Agent Rules

## Project Positioning

SkillVault is a local-first personal AI workflow asset manager for 20-50 reusable AI workflow assets. v0.1-alpha is a localhost Next.js web app with local SQLite storage and Markdown import/export.

It is not a SaaS, prompt market, AI chat tool, RAG system, sync service, browser extension, or desktop/mobile app.

## Technical Stack

- Next.js App Router.
- TypeScript strict.
- Tailwind CSS.
- shadcn/ui.
- SQLite.
- Drizzle ORM.
- TanStack Table.
- Zod.
- Plain `textarea` editor.

## Architecture Boundaries

- SQLite is stored in the local server environment.
- Do not assume cloud deployment can persist SQLite.
- Markdown is an exchange format, not the primary database.
- Drizzle TypeScript schema is the database source of truth.
- v0.1-alpha has no login, no sync, no AI API, and no cloud integration.

## Layering Rules

- React components only handle UI.
- Pages must not contain database logic.
- Server Actions validate input with Zod, call services, catch errors, return clear results, and revalidate paths.
- Services own business rules.
- Queries own database access.
- Markdown parsing/rendering belongs in `lib/markdown` or `server/services/markdown-service.ts`.
- Variable parsing/rendering belongs in `lib/variables` or `server/services/variable-service.ts`.
- Enum values and defaults belong in `lib/constants.ts`.

## Forbidden in v0.1-alpha

Do not implement login, user accounts, cloud sync, OAuth, iCloud API, OneDrive API, GitHub OAuth, Skill markets, third-party Skill downloads, AI prompt optimization, browser plugins, OCR capture, multi-model chat, RAG, team features, comments, likes, payments, complex charts, Monaco, CodeMirror, rich text editing, complex diff, zip export, Electron, Tauri, mobile app publishing, cloud deployment adaptation, multi-user permissions, public sharing, template stores, or remote curated libraries.

## Version Rules

- New asset creates version 1.
- Content hash changes create a new version.
- Metadata-only changes do not create a version.
- Rollback writes old content to the asset and creates a new version.
- Rollback note format: `Rollback to version X`.
- Versions are never deleted.

## Test and Build Commands

Use the package scripts once the project is initialized:

```bash
npm run typecheck
npm run lint
npm run build
```

Use Drizzle migration scripts once they exist:

```bash
npm run db:generate
npm run db:migrate
```

## v0.1-alpha Acceptance

- Create, edit, archive, soft delete, search, filter, sort, and tag assets.
- Copy raw content and rendered variable-filled content.
- Auto-create initial and changed-content versions.
- Metadata-only edits do not create versions.
- View version history and roll back old versions.
- Import and export Markdown.
- Avoid duplicate creation on existing `syncId` import.
- Mobile browser can view, search, and copy.
- Restarting the local server does not lose data.
- Typecheck, lint, and build pass.
