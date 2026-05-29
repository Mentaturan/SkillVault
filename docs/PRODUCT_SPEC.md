# SkillVault Product Spec

## Product Positioning

SkillVault is a local-first personal AI workflow asset manager. It is built for managing 20-50 real reusable assets that the user repeatedly edits, copies, versions, exports, and reuses in AI and agent tools.

SkillVault v0.1-alpha is a localhost Next.js web app backed by a local SQLite database. Markdown is the exchange format, not the primary database.

SkillVault manages assets such as Codex Skills, Trae Solo Skills, Claude Code rules, Cursor or Windsurf rules, AGENTS.md content, CLAUDE.md content, chat prompts, image prompts, reply templates, copywriting templates, code review rules, file workflows, SOPs, and checklists.

## User Scenarios

- Create a reusable AI workflow asset and classify it with type, target tool, export preset, status, rating, and tags.
- Search and filter existing assets by title, metadata, content, or tag.
- Copy asset content directly into an AI or agent tool.
- Fill `{{variable}}` placeholders before copying a rendered prompt.
- Edit an asset and automatically preserve content versions.
- Roll back to an older content version without deleting history.
- Export one asset as Markdown for use in AGENTS.md, CLAUDE.md, Codex Skill files, or general notes.
- Import Markdown assets, including frontmatter-based assets and plain text prompts.

## v0.1-alpha Scope

Required:

- Asset CRUD.
- Tags and asset-tag binding.
- Asset list search, filtering, and sorting.
- Asset detail editing.
- Copy raw content.
- Detect variables in content and copy rendered content after filling values.
- Automatic `AssetVersion` creation.
- Version list.
- Version rollback.
- Markdown import.
- Markdown export.
- Settings explanation page.
- Basic mobile browser adaptation.

Allowed but not fully implemented in v0.1-alpha:

- Collection table and route placeholders.
- TestCase table and route placeholders.
- Lightweight dashboard entry page.

## v0.1-beta Scope

- Collection management.
- Manual TestCase and run log records.
- Dashboard statistics.
- Built-in templates.
- AGENTS.md export template improvements.
- CLAUDE.md export template improvements.
- Codex Skill export template improvements.
- Image prompt export template improvements.
- Batch Markdown export.
- Experimental Markdown folder import.

## Explicit Non-Goals

SkillVault v0.1-alpha does not implement login, users, cloud sync, GitHub OAuth, iCloud API, OneDrive API, Skill markets, downloading third-party Skills, AI optimization, browser extensions, OCR capture, multi-model chat, RAG, team collaboration, comments, likes, payments, complex charts, Monaco, CodeMirror, rich text editing, complex diff, zip export, desktop packaging, mobile app publishing, cloud deployment adaptation, multi-user permissions, public share pages, template stores, or remote curated libraries.

## Page Structure

Implemented in v0.1-alpha:

- `/` Dashboard placeholder.
- `/assets` Asset List.
- `/assets/new` New Asset.
- `/assets/[id]` Asset Detail.
- `/assets/[id]/versions` Version History.
- `/assets/[id]/export` Markdown Export.
- `/import` Markdown Import.
- `/settings` Settings.

Reserved for v0.1-beta:

- `/assets/[id]/tests` Test Cases.
- `/collections` Collection List.
- `/collections/[id]` Collection Detail.

## Acceptance Criteria

v0.1-alpha is complete only when:

- Assets can be created, edited, archived, soft-deleted, and listed.
- Tags can be added and used as filters.
- Assets can be filtered by tag, type, target tool, export preset, and status.
- Assets can be searched by title, description, scenario, and content.
- Raw content can be copied.
- `{{variable}}` placeholders can be detected, filled, and copied as rendered text.
- New assets automatically create version 1.
- Content edits create a new version only when content hash changes.
- Metadata-only edits do not create a version.
- Version history can be viewed.
- Old versions can be rolled back by creating a new version.
- Markdown can be exported.
- Markdown can be imported.
- Importing Markdown with an existing `syncId` does not blindly create duplicates.
- Mobile browser users can view, search, and copy assets.
- Data persists after restarting the local service.
- TypeScript typecheck passes.
- Lint passes.
- Build passes.

## Roadmap

v0.2:

- PWA experience improvements.
- Batch Markdown export.
- Markdown folder import.
- Basic backup and restore.

v0.3:

- Tauri desktop experiment.
- Manual Capture Inbox.
- Simple text diff.

v0.4:

- Markdown folder two-way sync.
- GitHub repository sync experiment.
- Conflict copy preservation.

v0.5:

- Codex Skill template enhancements.
- Claude Code and CLAUDE.md templates.
- AGENTS.md composition.
- Cursor Rules templates.
- Skill Pack packaging.

v0.6:

- Curated library browsing.
- Manual import from curated Skills.
- Source tracking.
- Curated library update checks.

v0.7:

- Prompt lint.
- Rule checks.
- Asset health scoring.
