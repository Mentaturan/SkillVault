# SkillVault Task Plan

This file is the project execution plan. Keep `README.md` focused on user-facing orientation and keep `AGENTS.md` focused on rules for AI coding agents.

## Product Direction

SkillVault is a local-first personal workflow asset manager for 20-50 high-value reusable AI assets. The core job is to help one person collect, organize, reuse, version, import, and export prompts, skills, rules, workflows, SOPs, and templates.

The product should stay small, inspectable, and durable. It should prefer local SQLite, plain Markdown exchange, predictable UI, and explicit version history over cloud accounts, marketplaces, sync platforms, or AI automation.

## Competitive Analysis

A survey of existing tools in the AI workflow asset space, conducted to inform roadmap priorities.

### PromptHub (790+ stars)

Full-featured prompt management platform. Skill store with one-click distribution to 15+ platforms (ChatGPT, Claude, Gemini, Cursor, etc.). Rules management for AI coding tools. Project-level workspace for organizing prompts by project. AI-powered testing and evaluation. WebDAV sync. CLI tool. Client-side encryption. The strongest competitor in breadth and distribution reach.

### Prompt-Tools

Simpler Tauri desktop app focused on Prompt CRUD. Local-first with SQLite storage. Minimal feature set but demonstrates that a lightweight local tool can serve the same audience SkillVault targets.

### Skills Desktop

Dedicated SKILL.md manager. Treats SKILL.md as a first-class format rather than a generic Markdown file. Validates structure and provides tooling around the SKILL.md specification.

### Anthropic Skills (agentskills.io)

Official Agent Skills specification published by Anthropic. Defines a standard format for AI agent skills with metadata, triggers, and instructions. SKILL.md is becoming a de facto standard for interoperable skill definitions across AI coding tools.

### Key Insights

- Tool-specific export and distribution is the biggest competitive differentiator. PromptHub's one-click distribution to 15+ platforms is its most cited feature. SkillVault should prioritize making it easy to produce correct, ready-to-use files for each target tool.
- SKILL.md is becoming a standard format. Anthropic's official specification and Skills Desktop's dedicated tooling both validate this. SkillVault should support SKILL.md as a first-class import and export format.
- Project-level workspace organization (PromptHub) is useful for users who manage assets across multiple projects. This is a natural extension of SkillVault's collection system.
- Local-first with SQLite (Prompt-Tools) validates SkillVault's architecture choice. The gap is in tool-specific output quality, not storage approach.

## Current Phase

v0.3: complete. Project Workspace Scanner implemented with project CRUD, directory scanning, and project-asset association.

v0.4 development: next. Backup, Restore, and Offline Comfort.

Local status: the app has full CRUD, search/filter/sort, copy, variables, version history, rollback, Markdown import/export, settings, diagnostics, mobile adaptation, seed data, and confirmation dialogs. Collection CRUD, test cases, run logs, and dashboard are implemented. All verification commands pass.

GitHub status: no repository publishing task is tracked here until a remote and authentication are available.

## Planning Rules

- v0.1-alpha takes priority over every later roadmap item.
- Do not add cloud, login, OAuth, remote sync, AI APIs, marketplace features, or desktop/mobile packaging before the roadmap explicitly reaches those phases.
- Each phase must end with typecheck, lint, build, and a manual smoke test.
- Database changes must go through Drizzle schema and migrations.
- Markdown remains an exchange format. SQLite remains the source of truth.
- Prefer one complete workflow over many half-built pages.

## v0.1-alpha Acceptance

- Create, edit, archive, soft delete, restore, search, filter, sort, and tag assets.
- Copy raw content and copy rendered variable-filled content.
- Auto-create version 1 for every new asset.
- Create a new version only when content hash changes.
- Metadata-only edits do not create a version.
- View version history and roll back old versions.
- Import and export Markdown.
- Avoid duplicate creation on existing `syncId` import.
- Mobile browser can view, search, and copy.
- Restarting the local server does not lose data.
- `npm run typecheck`, `npm run lint`, and `npm run build` pass.

## Alpha Risk Gates

These are not optional polish items. They block v0.1-alpha completion because they protect the local-first promise.

- No destructive import path can proceed without a preview and an explicit user choice.
- Rollback, import overwrite, archive, soft delete, and restore must leave a readable audit trail or visible status change.
- Export and import must be tested as a round trip on real sample assets, not just unit-tested in isolation.
- Duplicate handling must be deterministic. `syncId` conflicts are mandatory to resolve explicitly, and exact-content duplicates should be detectable before silent duplicate creation.
- A restart and migration check must confirm that local SQLite data remains intact after normal development workflows.

## Phase 1 - Specification and Skeleton

Status: complete.

Output:

- Project positioning and non-goals.
- `docs/TASKS.md`.
- `AGENTS.md`.
- `db/schema.ts` draft.
- `lib/constants.ts` draft.
- Base directory structure.

Acceptance:

- Scope is limited to local-first v0.1-alpha.
- Non-goals are explicit.
- Schema covers alpha entities and reserved beta entities.
- Constants centralize enum values and defaults.
- No unsupported product direction is introduced.

Progress:

- [x] Create base directory structure.
- [x] Create task tracker.
- [x] Create project agent rules.
- [x] Create Drizzle schema draft.
- [x] Create constants draft.
- [x] Confirm local-first project direction.

## Phase 2 - Project Initialization

Status: complete locally.

Output:

- Next.js App Router project files.
- TypeScript strict configuration.
- Tailwind CSS configuration.
- shadcn/ui baseline.
- Drizzle and SQLite setup.
- Migration command setup.

Acceptance:

- Local dev server can start.
- TypeScript configuration is strict.
- Tailwind styles load.
- Drizzle can generate migrations from `db/schema.ts`.

Progress:

- [x] Initialize Next.js.
- [x] Configure TypeScript.
- [x] Configure Tailwind.
- [x] Configure shadcn/ui.
- [x] Configure SQLite and Drizzle.
- [x] Add migration scripts.
- [x] Add base app layout.

## Phase 3 - Core Data and CRUD

Status: complete.

Output:

- Zod validators.
- Hash, slug, ID, and time utilities.
- Asset, tag, and version queries.
- Asset CRUD services and actions.
- Basic layout and navigation.
- Asset list, form, detail, create, and edit pages.
- Archive, soft delete, and restore actions.

Acceptance:

- Asset create, edit, archive, soft delete, and restore work.
- Tags can be created and bound to assets.
- Server Actions validate input and call services.
- Services own business rules.
- React components do not contain database logic.
- New asset creates version 1.
- Content edits create a new version.
- Metadata-only edits do not create a version.

Progress:

- [x] Add validators.
- [x] Add utility functions.
- [x] Add asset queries.
- [x] Add tag queries.
- [x] Add version queries.
- [x] Add asset service.
- [x] Add tag service.
- [x] Add version service.
- [x] Add asset actions.
- [x] Build layout.
- [x] Build asset list.
- [x] Build asset form.
- [x] Build asset detail.
- [x] Build create and edit routes.
- [x] Add archive, delete, and restore actions.
- [x] Verify CRUD in browser with a real local database.
- [x] Fix any CRUD, tag, or version edge cases found during smoke test.

## Phase 4 - Search, Filter, Copy, Variables, Versions

Status: complete.

Output:

- Asset search input.
- Type, target tool, status, tag, archived, and deleted filters.
- Sort controls.
- Copy raw content button.
- Variable extraction and rendered copy flow.
- Version history UI.
- Rollback action.

Acceptance:

- Default list hides deleted assets and archived assets unless filtered.
- Pinned assets sort before unpinned assets.
- Search covers title, description, scenario, content, and tag names.
- Filters can be combined.
- Exact duplicate content can be detected deterministically during create/import flows.
- Variable placeholders use `{{variable_name}}`.
- Rendered copy replaces variables as plain text.
- Missing variable values are visible before copy.
- Rollback writes old content to the asset and creates a new version.
- Rollback version note uses `Rollback to version X`.

Tasks:

- [x] Add list query options for search, filters, tags, archived, deleted, and sort.
- [x] Add URL-backed search and filter controls to `/assets`.
- [x] Add compact mobile-friendly filter layout.
- [x] Implement raw copy control on asset cards and detail page.
- [x] Add variable parser in `lib/variables`.
- [x] Add rendered-copy UI for assets containing variables.
- [x] Add version list query and service.
- [x] Build version history section on asset detail page.
- [x] Add rollback Server Action.
- [x] Add exact-duplicate detection using content hash for create/import guardrails.
- [x] Smoke test metadata-only edit versus content edit.

## Phase 5 - Markdown Import and Export

Status: complete.

Output:

- Markdown renderer.
- Single-asset Markdown export.
- Markdown parser.
- Import preview.
- Import conflict handling.

Acceptance:

- Markdown export uses `syncId`, not local `id`.
- Export filename is `{slug}.{syncId}.md`.
- Plain text Markdown import works.
- Frontmatter Markdown import works.
- Existing `syncId` import requires overwrite, copy, or cancel.
- Overwrite updates the existing asset and respects version rules.
- Copy creates a new asset with a new local `id` and new `syncId`.
- Import preview shows whether the incoming file is new, overwrite-targeted, or a duplicate candidate before mutation.
- No automatic merge or complex diff is implemented.

Tasks:

- [x] Define Markdown frontmatter shape.
- [x] Implement Markdown render in `lib/markdown` or `server/services/markdown-service.ts`.
- [x] Implement single-asset export route or action.
- [x] Implement Markdown parse.
- [x] Build import page with paste/upload input.
- [x] Build import preview.
- [x] Implement `syncId` conflict detection.
- [x] Surface duplicate-candidate warnings for matching content hash or close metadata matches.
- [x] Implement overwrite, copy, and cancel strategies.
- [x] Add import/export smoke fixtures.
- [x] Run round-trip tests for export -> import overwrite and export -> import copy flows.

## Phase 6 - Alpha Polish, Verification, and Docs

Status: complete.

Output:

- Settings page.
- Basic mobile adaptation.
- Demo seed data.
- Basic diagnostics or integrity status view.
- Updated README.
- Passing verification commands.
- Real asset workflow smoke test.

Acceptance:

- Mobile browser can view, search, and copy assets.
- Data persists after service restart.
- Empty states are useful but not marketing-heavy.
- The app can show basic local diagnostics such as database path, migration state, and record counts.
- README states that v0.1-alpha is localhost-only and not SaaS.
- Full local workflow works with at least five real assets.

Tasks:

- [x] Build settings page with database path and project metadata.
- [x] Add mobile layout adaptations for list, form, and detail pages.
- [x] Add basic diagnostics page or settings panel section for database path, migration version, and entity counts.
- [x] Add seed/demo data script.
- [x] Add confirmations or explicit review states for destructive and overwrite-style actions.
- [x] Write a manual alpha smoke checklist covering CRUD, versions, rollback, import/export, archive/delete/restore, and restart persistence.
- [x] Update README after alpha features are complete.
- [x] Run `npm run typecheck`.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Restart local server and verify data persistence.
- [x] Smoke test create, edit, copy, version, rollback, export, import, archive, delete, and restore.

## v0.1-beta - Organization and Evaluation

Goal: make SkillVault useful for maintaining a small personal library over time, not just storing records.

Primary themes:

- Collections.
- Manual test cases and run logs.
- Dashboard.
- Built-in starter templates.
- Better export presets.
- Batch Markdown export.
- Experimental Markdown folder import.

Tasks:

- [x] Implement collection CRUD.
- [x] Support adding and removing assets from collections.
- [x] Support collection ordering.
- [x] Implement manual test cases and run logs.
- [x] Attach test cases to assets and optionally to asset versions.
- [x] Add basic dashboard counts and recent activity.
- [x] Add local built-in templates for common asset types.
- [x] Improve AGENTS.md export template.
- [x] Improve CLAUDE.md export template.
- [x] Improve Codex Skill export template.
- [x] Improve image prompt export template.
- [x] Implement batch Markdown export without zip dependency if a folder-style export is enough.
- [x] Experiment with folder import and document limitations.

Exit criteria:

- A user can group assets by purpose.
- A user can record whether an asset worked in a real task.
- A user can export multiple assets without repeating manual steps.

## v0.2 - Tool-specific Export Templates and SKILL.md Support

Goal: make SkillVault the best tool for producing correct, ready-to-use files for each target AI coding tool. This is the most impactful competitive differentiator identified in the competitive analysis.

Primary themes:

- Tool-specific export presets with correct formatting.
- SKILL.md first-class import and export.
- Built-in starter templates.
- Folder import experiment.

Tasks:

- [x] Implement AGENTS.md export preset.
- [x] Implement CLAUDE.md export preset.
- [x] Implement Codex Skill SKILL.md export preset.
- [x] Implement Cursor Rules export preset.
- [x] Add SKILL.md format import detection.
- [x] Add SKILL.md format export.
- [x] Add preset-specific export API route.
- [x] Add built-in starter templates.
- [x] Experiment with folder import.

Exit criteria:

- A user can export an asset as a correctly formatted AGENTS.md, CLAUDE.md, Codex Skill SKILL.md, or Cursor Rules file.
- A user can import a SKILL.md file and have it detected and parsed correctly.
- Export presets produce files that work directly in the target tool without manual editing.

## v0.3 - Project Workspace Scanner

Goal: support project-level organization of assets, inspired by PromptHub's project workspace feature. Allow users to scan a local project directory and associate assets with specific projects.

Primary themes:

- Project workspace concept.
- Local directory scanning.
- Project-asset association.
- Project-scoped views.

Tasks:

- [x] Define project workspace data model.
- [x] Add project CRUD.
- [x] Support associating assets with projects.
- [x] Add local directory scanner for detecting existing AI config files (AGENTS.md, CLAUDE.md, .cursor/rules, etc.).
- [x] Add project-scoped asset view.
- [x] Add project dashboard with relevant asset counts and status.

Exit criteria:

- A user can create a project and associate assets with it.
- A user can scan a local directory and detect existing AI configuration files.
- A user can view all assets relevant to a specific project.

## v0.4 - Backup, Restore, and Offline Comfort

Goal: reduce local data-loss risk while keeping the product local-first.

Primary themes:

- Basic backup and restore.
- PWA comfort improvements.
- Stronger Markdown folder import.
- Import/export reliability.

Tasks:

- [ ] Add export-all backup as Markdown plus metadata manifest.
- [ ] Add restore-from-backup preview.
- [ ] Add restore conflict options.
- [ ] Add PWA manifest.
- [ ] Add offline-friendly static shell where practical.
- [ ] Improve folder import conflict detection.
- [ ] Add checksum or manifest validation for backups.

Exit criteria:

- A user can back up the library and restore it into a fresh local database.
- Backup and restore behavior is understandable before any destructive operation.

## v0.5 - Capture Inbox and Version Diff

Goal: make it easier to collect useful assets from daily AI work and compare changes.

Primary themes:

- Capture Inbox.
- Simple text diff.
- Usage metadata.
- Optional desktop wrapper experiment.

Tasks:

- [ ] Add Capture Inbox for manual paste/save.
- [ ] Support converting inbox items into assets.
- [ ] Add simple side-by-side text diff for versions.
- [ ] Track `lastUsedAt` from copy actions.
- [ ] Add basic stale asset indicators.
- [ ] Run a Tauri feasibility experiment without committing to desktop distribution.

Exit criteria:

- A user can quickly capture rough material and later refine it into assets.
- A user can compare two versions without leaving the app.

## v0.6 - Curated Library, Still Local-First

Goal: support manual discovery and import of recommended assets without becoming a marketplace.

Primary themes:

- Curated library browsing.
- Manual import from curated assets.
- Source tracking.
- Update checks.

Tasks:

- [ ] Define curated library metadata.
- [ ] Browse curated assets from a bundled or configured source.
- [ ] Import curated assets manually.
- [ ] Track source and source URL.
- [ ] Check whether imported curated assets have newer versions.
- [ ] Keep all imported content local after import.

Exit criteria:

- A user can inspect and manually import curated assets.
- The product still has no accounts, payments, ratings, comments, or public sharing.

## v0.7 - Asset Quality Tools

Goal: help the user keep assets clear, complete, and reusable.

Primary themes:

- Prompt lint.
- Rule checks.
- Asset health scoring.
- Maintenance queue.

Tasks:

- [ ] Add deterministic lint checks for missing title, weak scenario, missing variables, and unclear placeholders.
- [ ] Add rule checks for contradictory metadata and malformed export presets.
- [ ] Add asset health score from deterministic signals.
- [ ] Add maintenance queue for stale, low-rated, or incomplete assets.
- [ ] Add opt-in AI-assisted suggestions only if a future roadmap phase explicitly allows AI APIs.

Exit criteria:

- A user can identify assets that need cleanup without relying on AI calls.

## v0.8 - Knowledge Hygiene and Review Loops

Goal: make SkillVault a reliable personal operating library, not a dumping ground.

Primary themes:

- Review cadence.
- Archive workflow.
- Duplicate detection.
- Better lifecycle metadata.

Tasks:

- [ ] Add review due dates.
- [ ] Add asset lifecycle filters.
- [ ] Add deterministic duplicate candidates by title, slug, and content hash similarity.
- [ ] Add archive review page.
- [ ] Add bulk metadata edit for selected assets.

Exit criteria:

- A user can keep a 20-50 asset library tidy without heavy manual auditing.

## v0.9 - Packaging and Migration Hardening

Goal: prepare the app for long-term local use and safer upgrades.

Primary themes:

- Migration reliability.
- Data repair tools.
- Packaging decisions.
- Documentation hardening.

Tasks:

- [ ] Add migration smoke tests.
- [ ] Add database integrity check page or script.
- [ ] Add repair scripts for common local data issues.
- [ ] Decide whether Tauri packaging should proceed or remain an experiment.
- [ ] Write migration notes for upgrading from earlier alpha/beta versions.

Exit criteria:

- A user can upgrade local data with lower risk.
- Packaging direction is explicit.

## v1.0 - Stable Local Release

Goal: mark SkillVault stable for personal local use.

Scope:

- Local-first web app.
- SQLite source of truth.
- Reliable Markdown import/export.
- Reliable backup and restore.
- Clear versioning and rollback.
- Practical asset organization.
- Documented migration path.

Non-scope:

- SaaS deployment.
- Multi-user collaboration.
- Cloud sync.
- Marketplace.
- AI prompt optimization service.
- Public sharing platform.

Exit criteria:

- All v0.1-alpha acceptance items remain passing.
- Backup and restore are tested against a fresh database.
- Upgrade from the previous version is documented.
- The README describes exact supported use cases and non-goals.
- The app is usable for the maintainer's real asset library for at least two weeks without data loss.

## Recurring Verification Checklist

Run this checklist before marking any phase complete:

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Start local server.
- [ ] Create a real asset.
- [ ] Edit metadata only and verify no new version.
- [ ] Edit content and verify a new version.
- [ ] Search, filter, sort, and tag.
- [ ] Copy raw content.
- [ ] Copy rendered content if variables exist.
- [ ] Export Markdown.
- [ ] Import Markdown.
- [ ] Archive, soft delete, and restore.
- [ ] Restart server and verify data persists.

## Backlog Parking Lot

These ideas are explicitly parked until a roadmap phase accepts them:

- Login and user accounts.
- Cloud sync.
- OAuth.
- Public sharing.
- Marketplace or remote curated store.
- AI prompt optimization.
- Browser extension.
- OCR capture.
- Multi-model chat.
- RAG.
- Team features.
- Comments, likes, payments, or social features.
- Monaco, CodeMirror, or rich text editing.
- Complex visual analytics.
- Electron or mobile app publishing.
