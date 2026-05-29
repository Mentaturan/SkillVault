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
