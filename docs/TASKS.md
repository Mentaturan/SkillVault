# SkillVault Tasks

## Current Phase

Phase 2: project initialization and runtime foundation.

Status: complete locally. GitHub push is blocked until a GitHub remote or `gh` CLI authentication is available.

## Phase 1 - Specification and Skeleton

Input:

- User requirements for SkillVault v0.1-alpha.
- Required architecture boundaries and first-phase delivery limits.

Output:

- `docs/PRODUCT_SPEC.md`
- `docs/TECH_SPEC.md`
- `docs/TASKS.md`
- `AGENTS.md`
- `db/schema.ts` draft.
- `lib/constants.ts` draft.
- Base directory structure.

Acceptance:

- Scope is limited to v0.1-alpha.
- Non-goals are explicitly documented.
- Schema includes alpha tables and beta-reserved tables.
- Constants centralize enum values and defaults.
- No full business code is implemented.

Progress:

- [x] Create base directory structure.
- [x] Create product spec.
- [x] Create technical spec.
- [x] Create task tracker.
- [x] Create project AGENTS.md.
- [x] Create Drizzle schema draft.
- [x] Create constants draft.
- [x] User confirms phase 1 direction.

## Phase 2 - Project Initialization

Input:

- Confirmed phase 1 skeleton.

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

## Phase 3 - Core Data and CRUD

Input:

- Initialized app and database.
- `db/schema.ts`.
- `lib/constants.ts`.

Output:

- Zod validators.
- Hash, slug, and time utilities.
- Asset, tag, and version queries.
- Asset CRUD services and actions.
- Basic layout and navigation.
- Asset list, form, and detail pages.

Acceptance:

- Asset create, edit, archive, soft delete, and restore work.
- Tags can be created and bound to assets.
- Server Actions validate input and call services.
- React components do not contain database logic.

Progress:

- [ ] Add validators.
- [ ] Add utility functions.
- [ ] Add asset queries.
- [ ] Add tag queries.
- [ ] Add version queries.
- [ ] Add asset service.
- [ ] Add tag service.
- [ ] Add version service.
- [ ] Add asset actions.
- [ ] Build layout.
- [ ] Build asset list.
- [ ] Build asset form.
- [ ] Build asset detail.

## Phase 4 - Search, Copy, Variables, Versions

Input:

- Working CRUD implementation.

Output:

- Search, filters, and sorting.
- Copy raw content.
- Variable extraction and rendered copy.
- Version creation rules.
- Version list and rollback.

Acceptance:

- Default list hides deleted assets and archived assets unless filtered.
- Pinned assets sort first.
- Search covers title, description, scenario, content, and tag names.
- Variables are detected and replaced as plain text.
- Metadata-only edits do not create versions.
- Rollback creates a new version.

Progress:

- [ ] Implement search and filters.
- [ ] Implement sorting.
- [ ] Implement copy button.
- [ ] Implement variable dialog.
- [ ] Implement version creation rules.
- [ ] Implement version history page.
- [ ] Implement rollback action.

## Phase 5 - Markdown Import and Export

Input:

- Working asset, tag, and version services.

Output:

- Markdown rendering.
- Markdown export page.
- Markdown parsing.
- Import preview.
- Import conflict handling.

Acceptance:

- Markdown export uses `syncId`, not local `id`.
- Export filename is `{slug}.{syncId}.md`.
- Plain text Markdown import works.
- Frontmatter import works.
- Existing `syncId` requires overwrite, copy, or cancel.
- No automatic merge or complex diff is implemented.

Progress:

- [ ] Render Markdown.
- [ ] Export Markdown.
- [ ] Parse Markdown.
- [ ] Preview import.
- [ ] Handle import conflicts.

## Phase 6 - Polish, Verification, and Docs

Input:

- Feature-complete alpha implementation.

Output:

- Settings page.
- Basic mobile adaptation.
- Demo seed data.
- README.
- Passing typecheck, lint, and build.
- Real asset workflow smoke test.

Acceptance:

- Mobile browser can view, search, and copy assets.
- Data persists after service restart.
- Typecheck passes.
- Lint passes.
- Build passes.
- README states that v0.1 is localhost-only and not SaaS.

Progress:

- [ ] Build settings page.
- [ ] Add mobile layout adaptations.
- [ ] Add seed/demo data.
- [ ] Write README.
- [ ] Run typecheck.
- [ ] Run lint.
- [ ] Run build.
- [ ] Smoke test full loop with real assets.

---

## v0.1-beta Plan

### Collection Management

- Create `collections` and `collection_assets` tables.
- Implement collection CRUD service and actions.
- Build collection list and detail pages.
- Support adding/removing assets from collections.
- Support reordering assets within a collection.

### TestCase and Run Logs

- Create `test_cases` table.
- Implement test case CRUD service and actions.
- Build test case list and form on asset detail page.
- Support `test_case` (long-term test) and `run_log` (usage record) kinds.

### Dashboard

- Implement dashboard queries for asset counts, recent activity, and tag distribution.
- Build dashboard page with summary statistics.

### Built-in Templates

- Create template library with pre-built assets for common use cases.
- Support one-click import of built-in templates.

### Export Template Improvements

- Enhance AGENTS.md export template with structured sections.
- Enhance CLAUDE.md export template.
- Enhance Codex Skill export template.
- Enhance image prompt export template with positive/negative prompt separation.

### Batch Export

- Support selecting multiple assets for batch Markdown export.
- Generate a zip or folder of exported Markdown files.

### Markdown Folder Import

- Experimental support for importing a folder of Markdown files.
- Parse frontmatter from each file and create assets.

---

## v0.2 Plan

- PWA manifest and service worker for offline-capable browsing.
- Batch Markdown export improvements.
- Markdown folder import with conflict detection.
- Basic backup (export all assets as Markdown archive) and restore.

---

## v0.3 Plan

- Tauri desktop app experiment (wrap existing Next.js app).
- Capture Inbox: manual paste/save area for quickly collecting prompts from AI conversations.
- Simple text diff for comparing asset versions side by side.

---

## v0.4 Plan

- Markdown folder two-way sync (watch a local folder, sync changes bidirectionally).
- GitHub repository sync experiment (push/pull assets as Markdown files to a repo).
- Conflict copy preservation (keep both versions when sync conflicts occur).

---

## v0.5 Plan

- Codex Skill template enhancements with richer metadata and instructions.
- Claude Code / CLAUDE.md template generation.
- AGENTS.md composition (combine multiple assets into one AGENTS.md).
- Cursor Rules template support.
- Skill Pack packaging (bundle multiple assets into a distributable pack).

---

## v0.6 Plan

- Curated library browsing (view a local or remote collection of recommended Skills).
- Manual import from curated library.
- Source tracking (record where each asset came from).
- Curated library update checks (notify when a curated asset has a newer version).

---

## v0.7 Plan

- Prompt lint (check assets for common issues like missing variables, unclear instructions).
- Rule checks (validate that system rules are well-formed).
- Asset health scoring (rate assets based on completeness, usage frequency, and freshness).
