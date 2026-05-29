# SkillVault Agent Rules

## Project Positioning

SkillVault is a local-first personal AI workflow asset manager for 20-50 reusable AI workflow assets. v0.1-alpha is a localhost Next.js web app with local SQLite storage and Markdown import/export.

It is not a SaaS, prompt market, AI chat tool, RAG system, sync service, browser extension, or desktop/mobile app.

SkillVault manages: Codex Skills, Trae Solo Skills, Claude Code rules, Cursor/Windsurf rules, AGENTS.md, CLAUDE.md, AI chat prompts, image prompts, reply templates, copywriting templates, code review rules, file workflows, SOPs, checklists, and reusable prompts/skills/rules extracted from AI conversations.

## Product Principles

- Local-first beats cloud convenience.
- SQLite is the primary database; Markdown is the exchange format.
- The app should stay useful for one person managing a small, high-value library.
- Prefer complete workflows over broad but shallow feature coverage.
- Prefer deterministic parsing, validation, and checks before adding AI-assisted behavior.
- Treat data loss prevention as a core product feature.
- Keep the UI practical and dense enough for repeated use.

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
- Later roadmap experiments must not weaken alpha data safety.

## Layering Rules

- React components only handle UI.
- Pages must not contain database logic.
- Server Actions validate input with Zod, call services, catch errors, return clear results, and revalidate paths.
- Services own business rules.
- Queries own database access.
- Markdown parsing/rendering belongs in `lib/markdown` or `server/services/markdown-service.ts`.
- Variable parsing/rendering belongs in `lib/variables` or `server/services/variable-service.ts`.
- Enum values and defaults belong in `lib/constants.ts`.
- Database schema changes belong in `db/schema.ts` and Drizzle migrations.
- Shared utilities belong in `lib/`, not page files.

## Version Rules

- New asset creates version 1.
- Content hash changes create a new version.
- Metadata-only changes do not create a version.
- Rollback writes old content to the asset and creates a new version.
- Rollback note format: `Rollback to version X`.
- Versions are never deleted.
- Version history must remain readable after import, export, rollback, and restore workflows.

## Markdown Rules

- Export uses `syncId`, not local `id`.
- Export filename format is `{slug}.{syncId}.md`.
- Frontmatter is allowed for structured metadata.
- Plain Markdown body remains the asset content.
- Import conflict strategies are `overwrite`, `copy`, and `cancel`.
- Do not implement automatic merge or complex diff in v0.1-alpha.

## Roadmap Discipline

Use `docs/TASKS.md` as the source of truth for development order.

Do not skip unfinished v0.1-alpha acceptance work to implement later roadmap items. If a later feature seems useful, record it in the relevant future phase instead of implementing it immediately.

Before adding a new feature, classify it as one of:

- v0.1-alpha acceptance work.
- v0.1-beta organization/evaluation work.
- Future roadmap work.
- Parked backlog or forbidden scope.

If a feature crosses roadmap boundaries, implement the smaller alpha-safe subset first.

## Forbidden in v0.1-alpha

Do not implement login, user accounts, cloud sync, OAuth, iCloud API, OneDrive API, GitHub OAuth, Skill markets, third-party Skill downloads, AI prompt optimization, browser plugins, OCR capture, multi-model chat, RAG, team features, comments, likes, payments, complex charts, Monaco, CodeMirror, rich text editing, complex diff, zip export, Electron, Tauri, mobile app publishing, cloud deployment adaptation, multi-user permissions, public sharing, template stores, or remote curated libraries.

## Long-Term Roadmap Guardrails

- v0.1-alpha: complete core CRUD, search/filter/sort, copy, variables, versions, rollback, Markdown import/export, mobile usability, and verification.
- v0.1-beta: collections, manual test cases, run logs, dashboard, built-in templates, export preset improvements, batch export, and experimental folder import.
- v0.2: backup, restore, PWA comfort, and stronger import/export reliability.
- v0.3: capture inbox, simple text diff, usage metadata, and optional desktop wrapper feasibility.
- v0.4: local Markdown folder sync experiment with conflict copy preservation.
- v0.5: tool-specific generation templates and AGENTS.md composition.
- v0.6: curated library browsing and manual import while staying local-first.
- v0.7: deterministic prompt lint, rule checks, health scoring, and maintenance queue.
- v0.8: review cadence, archive workflow, duplicate detection, and lifecycle hygiene.
- v0.9: migration hardening, data repair tools, packaging decision, and upgrade documentation.
- v1.0: stable local release for personal use.

## Test and Build Commands

Use the package scripts after implementation changes:

```bash
npm run typecheck
npm run lint
npm run build
```

Use Drizzle migration scripts after schema changes:

```bash
npm run db:generate
npm run db:migrate
```

## v0.1-alpha Acceptance

- Create, edit, archive, soft delete, restore, search, filter, sort, and tag assets.
- Copy raw content and rendered variable-filled content.
- Auto-create initial and changed-content versions.
- Metadata-only edits do not create versions.
- View version history and roll back old versions.
- Import and export Markdown.
- Avoid duplicate creation on existing `syncId` import.
- Mobile browser can view, search, and copy.
- Restarting the local server does not lose data.
- Typecheck, lint, and build pass.

## Development Order

Follow this order until v0.1-alpha is complete:

1. Finish and verify Asset CRUD.
2. Finish tag binding and display.
3. Implement search, filters, and sorting.
4. Implement copy raw content.
5. Implement variable extraction and rendered copy.
6. Complete version creation rules.
7. Implement version history.
8. Implement rollback.
9. Implement Markdown render.
10. Implement Markdown export.
11. Implement Markdown parse.
12. Implement Markdown import preview and conflict handling.
13. Implement Settings page.
14. Adapt list, form, and detail pages for mobile browser use.
15. Add seed/demo data.
16. Run typecheck, lint, and build.
17. Smoke test the full loop with real assets.
18. Update README and docs to match the delivered behavior.

## UI Guidance

- Build the usable app, not a landing page.
- Keep layouts quiet, utilitarian, and optimized for scanning.
- Use cards for repeated asset items, not for every page section.
- Prefer plain controls and readable forms.
- Use icon buttons where the meaning is familiar.
- Make mobile views usable for search and copy.
- Do not introduce rich text, Monaco, CodeMirror, or complex visual dashboards in alpha.

## Data Safety Rules

- Never silently overwrite imported content.
- Never hard-delete versions.
- Soft delete assets before any permanent deletion feature is considered.
- Backup and restore work belongs to v0.2 unless a minimal alpha-safe export is needed.
- Any sync experiment must preserve conflict copies and provide a dry-run preview.

## Documentation Rules

- `README.md` is for human project orientation and local usage.
- `docs/TASKS.md` is the detailed development plan and source of truth for phase status.
- `AGENTS.md` is for AI coding rules and architectural boundaries.
- Keep these documents consistent when scope, roadmap, or acceptance criteria change.
