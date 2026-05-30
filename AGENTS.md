# SkillVault Agent Rules

## Project Positioning

SkillVault is a local-first personal AI workflow asset manager for a small, high-value library of 20-50 reusable assets.

It manages Codex Skills, Trae Solo Skills, Claude Code rules, Cursor and Windsurf rules, AGENTS.md, CLAUDE.md, AI chat prompts, image prompts, reply templates, copywriting templates, code review rules, file workflows, SOPs, checklists, and reusable prompts, skills, and rules extracted from AI conversations.

It is not a SaaS, prompt market, AI chat tool, RAG system, team collaboration platform, cloud sync service, browser extension, hosted MCP service, or desktop/mobile product in the current implementation.

## Current Implementation State

Use `docs/TASKS.md` as the source of truth.

As of the current plan, v0.9 is implemented locally and v1.0 is in progress:

- v0.1-alpha core asset library is complete.
- v0.1-beta organization and evaluation is complete.
- v0.2 tool-specific export and SKILL.md support is complete.
- v0.3 project workspace scanner is complete.
- v0.4 backup, restore, and integrity is complete.
- v0.5 local folder library and tool deployment is complete.
- v0.6 deterministic validation and safety checks is complete.
- v0.7 capture inbox and local conversation mining is complete.
- v0.8 diff, test runs, and use history is complete.
- v0.9 import sources, curated assets, and Git-friendly exchange is complete.
- v1.0 stable personal local release is the current development phase.

The package version is `1.0.0`.

## Product Principles

- Local-first beats cloud convenience.
- SQLite is the primary database.
- Markdown, folder exports, and tool-specific files are exchange formats unless a future phase explicitly changes this.
- The app should stay useful for one person managing a small personal library.
- Complete workflows are better than broad, shallow feature coverage.
- Deterministic parsing, validation, preview, and checks come before AI-assisted behavior.
- Data loss prevention is a core product feature.
- The UI should be practical, dense, and optimized for repeated use.

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
- Drizzle TypeScript schema is the database source of truth.
- Database schema changes belong in `db/schema.ts` and Drizzle migrations.
- Markdown parsing/rendering belongs in `lib/markdown` or `server/services/markdown-service.ts`.
- Variable parsing/rendering belongs in `lib/variables` or `server/services/variable-service.ts`.
- Future backup code should live under `lib/backup`, `server/services/backup-service.ts`, or equivalent service/query boundaries.
- Future validation code should live under `lib/validation` or a service module, not in React components.

## Layering Rules

- React components only handle UI.
- Pages must not contain database logic.
- Server Actions validate input with Zod, call services, catch errors, return clear results, and revalidate paths.
- Services own business rules.
- Queries own database access.
- Enum values and defaults belong in `lib/constants.ts`.
- Shared utilities belong in `lib/`, not page files.
- Filesystem writes must go through services and must have preview or confirmation when overwrite, restore, deploy, import, or delete behavior is involved.

## Data Safety Rules

- Never silently overwrite imported, restored, deployed, or synced content.
- Never hard-delete versions.
- Soft delete assets before any permanent deletion feature is considered.
- Rollback writes old content to the asset and creates a new version.
- Backup and restore are v0.4 priority work and must not be bypassed for broader future features.
- Restore must preview mutations before writing.
- Folder sync or tool deployment must preserve conflict copies and provide dry-run previews.
- Remote import must validate and preview before creating or updating assets.

## Version Rules

- New asset creates version 1.
- Content hash changes create a new version.
- Metadata-only changes do not create a version.
- Rollback writes old content to the asset and creates a new version.
- Rollback note format: `Rollback to version X`.
- Versions are never deleted.
- Version history must remain readable after import, export, rollback, backup, restore, and deployment workflows.

## Markdown and Format Rules

- Export uses `syncId`, not local `id`.
- Export filename format is `{slug}.{syncId}.md` unless a preset requires a target-specific name.
- Frontmatter is allowed for structured metadata.
- Plain Markdown body remains the asset content.
- Import conflict strategies are `overwrite`, `copy`, and `cancel`.
- Do not implement automatic merge or complex diff until the roadmap reaches that phase.
- SKILL.md, AGENTS.md, CLAUDE.md, and Cursor Rules exports should be deterministic and usable without manual formatting cleanup.

## Roadmap Discipline

Before adding a new feature, classify it as one of:

- Current-phase acceptance work.
- Later roadmap work.
- Parked backlog.
- Forbidden scope.

Current phase order:

1. v0.4 backup, restore, and integrity.
2. v0.5 local folder library and tool deployment.
3. v0.6 deterministic validation and safety checks.
4. v0.7 capture inbox and local conversation mining.
5. v0.8 diff, test runs, and use history.
6. v0.9 import sources, curated assets, and Git-friendly exchange (complete).
7. v1.0 stable personal local release (current).

If a feature crosses phase boundaries, implement the smallest current-phase-safe subset first.

## External Research Guardrails

Recent related tools show demand for multi-tool skill management, restore manifests, source pinning, validation, security checks, and conversation-log capture. These are roadmap inputs, not permission to expand scope immediately.

Apply these constraints:

- Cross-tool deployment must wait until backup/restore is reliable.
- GitHub or remote imports must be manual, previewed, validated, and local after import.
- Registry, marketplace, publishing, payment, social, and public sharing features remain out of scope.
- AI-generated explanations, prompt optimization, and model-run evaluation remain out of scope until explicitly added to a later phase.
- Skill validation should be deterministic first because SKILL.md metadata affects discovery and agent behavior.

## Forbidden Until Explicitly Replanned

Do not implement:

- Login or user accounts.
- Cloud sync.
- OAuth.
- iCloud API, OneDrive API, or GitHub OAuth.
- Skill markets, public registries, or third-party skill downloads as an automatic flow.
- AI prompt optimization.
- Browser plugins.
- OCR capture.
- Multi-model chat.
- RAG.
- Team features.
- Comments, likes, payments, or social features.
- Monaco, CodeMirror, or rich text editing.
- Complex visual dashboards.
- Hosted MCP service.
- Electron, Tauri, or mobile app publishing.
- Cloud deployment adaptation.
- Multi-user permissions.
- Public sharing.
- Template stores or remote curated libraries.

Future phases may allow small manual-import subsets, but only with local-first preview, validation, and conflict handling.

## UI Guidance

- Build the usable app, not a landing page.
- Keep layouts quiet, utilitarian, and optimized for scanning.
- Use cards for repeated asset items, not every page section.
- Prefer plain controls and readable forms.
- Use familiar icon buttons where meaning is clear.
- Make mobile views usable for search and copy.
- Do not introduce rich text, Monaco, CodeMirror, or complex visual dashboards.
- Avoid marketing-style hero sections inside the product.

## Test and Build Commands

Use these after implementation changes:

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

For documentation-only changes, these commands are optional. State clearly if they were not run.

## Documentation Rules

- `README.md` is for human project orientation, local usage, current status, and roadmap summary.
- `docs/TASKS.md` is the detailed development plan and source of truth for phase status.
- `AGENTS.md` is for AI coding rules and architectural boundaries.
- Keep all three documents consistent when scope, roadmap, or acceptance criteria change.
- If the user says `READ.md`, update `README.md` unless a real `READ.md` file exists.
