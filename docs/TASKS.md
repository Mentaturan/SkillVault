# SkillVault Development Plan

This file is the source of truth for product scope, phase order, and acceptance status. Keep `README.md` focused on human orientation and keep `AGENTS.md` focused on coding rules for AI agents.

## Current Status

Date of review: 2026-05-30.

Repository: `Mentaturan/SkillVault`.

Local milestone state: v0.3 is implemented. The package version still reads `0.1.0-alpha`; do not change package version until a release pass is done.

Implemented locally:

- Asset CRUD, archive, soft delete, restore, tags, search, filters, sorting, pinning, and duplicate content checks.
- Raw content copy and rendered variable copy with `{{variable_name}}` placeholders.
- Version history, content-hash version creation, metadata-only edit handling, and rollback.
- Markdown import/export with `syncId` conflict handling and overwrite/copy/cancel strategies.
- Tool-specific export presets for generic Markdown, Codex Skill, AGENTS.md, CLAUDE.md, Cursor Rules, and plain text.
- Collections, collection membership, collection ordering, batch export, and collection export.
- Manual test cases attached to assets and optionally versions.
- Dashboard counts and recent activity.
- Built-in starter templates.
- Project workspaces, project-asset association, project detail views, and local directory scanning for AI config files.
- Settings and diagnostics for local database path and record counts.
- Basic mobile usability for view, search, and copy flows.

Known local caveats:

- `gh` is not installed in the local shell, so GitHub CLI workflows cannot be assumed.
- `scripts/debug-ui.py` and `scripts/debug-ui2.py` are currently untracked. Do not remove them unless explicitly asked.
- There is no `READ.md`; update `README.md` when the user asks for the project readme.

Next development focus: v0.4 backup, restore, and integrity. This is the highest-value next step because the product is local-first and now has enough data creation paths that data loss prevention matters more than additional surface area.

## Product Positioning

SkillVault is a local-first personal AI workflow asset manager for a small, high-value library of 20-50 reusable assets. It manages prompts, agent skills, project rules, AGENTS.md and CLAUDE.md snippets, image prompts, reply templates, workflows, SOPs, checklists, and reusable rules extracted from AI conversations.

It is not a SaaS, public prompt market, AI chat app, RAG system, team collaboration app, sync service, browser extension, cloud deployment target, or full desktop/mobile product in the current roadmap.

SQLite is the primary database. Markdown and folder formats are exchange formats. Future filesystem workflows must protect the SQLite source of truth until a phase explicitly changes that architecture.

## External Research Snapshot

Research date: 2026-05-30. These links are planning inputs, not implementation dependencies.

- `skills-manage`: <https://github.com/iamzhihuix/skills-manage>
  - Strong signal for cross-tool skill management. It uses a central local skill library, symlinks to platform directories, collections, GitHub import, marketplace browsing, scan/discover, search at scale, SQLite, and explicit privacy notes.
  - Relevant to SkillVault: project/tool deployment views, local path scanning, import preview, and support for many AI coding tools.
  - Do not copy: marketplace-first direction, AI explanation generation, credentials stored in app settings, and desktop packaging before data safety work is complete.

- `Skillful`: <https://github.com/Mastermindzh/skillful> and <https://skillful.md/>
  - Strong signal for filesystem-owned workflows. Skills, agents, supporting files, screenshots, scripts, examples, installs, repairs, imports, and exports stay as readable local folders.
  - Relevant to SkillVault: support files beside an asset, install/repair status, offline source-of-truth clarity, and import links.
  - Do not copy yet: full desktop release complexity and unsigned binary support burden.

- `prompt-manager`: <https://github.com/n-WN/prompt-manager>
  - Strong signal for extracting useful prompts from existing AI coding assistant logs. It parses Claude Code, Cursor, Codex, Aider, Gemini, and Amp data, builds a local index, supports full-text search, incremental sync, favorites, and copying.
  - Relevant to SkillVault: capture inbox and local deterministic extraction from conversation history should be a future phase.
  - Do not copy yet: direct parsing of every vendor log format before backup/restore and import validation are stable.

- `PromptHub Desktop`: <https://github.com/ZSeven-W/prompt-hub-desktop>
  - Similar local-first prompt library with SQLite, folders/tags, search, revisions, variable fill, and JSON import/export.
  - Relevant to SkillVault: validates the existing local-first CRUD/version/copy direction.
  - Gap for SkillVault: SkillVault should win on multi-tool asset formats and safety, not generic prompt CRUD.

- `PromptShelf`: <https://promptshelf.dev/>
  - Shows demand for auto versioning, diff views, tags/search, placeholder quick-fill, dark mode, and MCP access from Claude Desktop.
  - Relevant to SkillVault: diff and use-from-agent workflows are useful.
  - Do not copy for alpha/beta: cloud sync, Google sign-in, hosted MCP, and account-based flows.

- `promptops`: <https://github.com/llmhq-hub/promptops>
  - Git-native prompt management for production workflows. Important ideas are immutable snapshots, deploy logs, version-aware tests, and provenance.
  - Relevant to SkillVault: version provenance, test history, and export manifests.
  - Do not copy: production SDK and runtime LLM integration are outside personal-library scope.

- `skills install/sync from lock file` issue: <https://github.com/vercel-labs/skills/issues/283>
  - Clear user need for reproducible restore from a lock file, missing-only reinstall, dry-run, and setup of a new machine.
  - Relevant to SkillVault: backup manifests and future local deployment manifests should be restorable and dry-run friendly.

- Hermes configurable skill write directory issue: <https://github.com/NousResearch/hermes-agent/issues/4381>
  - Clear user need to control where new or edited skills are written when external directories or vault-backed paths exist.
  - Relevant to SkillVault: future deployment and folder sync must make target paths explicit and never silently shadow a source.

- `skill-validator`: <https://github.com/agent-ecosystem/skill-validator>
  - Strong signal for deterministic validation, pre-commit hooks, platform-specific skill directories, and quality checks.
  - Relevant to SkillVault: validate SKILL.md frontmatter, required fields, body density, malformed metadata, and dangerous content before import or deployment.

- SKILL.md supply-chain risk paper: <https://arxiv.org/abs/2605.11418>
  - Research signal that natural-language skill metadata affects discovery, selection, and governance, so SKILL.md is operational text, not passive documentation.
  - Relevant to SkillVault: add local validation and warnings before adding remote import, curated browsing, or install-to-tool workflows.

- `skillsmgr`, `skills-supply`, and `asm`:
  - <https://github.com/jtianling/skills-manager>
  - <https://github.com/803/skills-supply>
  - <https://github.com/luongnv89/asm>
  - Strong signals for manifests, registries, dependency resolution, pinned refs, security audit, quality scoring, and cross-agent deployment.
  - Relevant to SkillVault: pinned source metadata, manifest validation, dry-run import, and security checks.
  - Do not copy now: public registry, publishing workflow, dependency resolver, and team distribution.

## Demand Analysis

External demand points:

- People want one source of truth for skills and prompts across Claude Code, Codex, Cursor, Windsurf, Copilot, Gemini CLI, Trae, and other tools.
- Users need reproducible local state: backup, restore, lock files, manifests, missing-only restore, checksums, and dry-run previews.
- Users are collecting useful assets from live AI work, not only writing them from scratch.
- SKILL.md and AGENTS.md-style assets need validation because small metadata changes can affect whether an agent loads or trusts them.
- Users care about install status: what is in the library, what is deployed to a tool, what is broken, and what has drifted.
- There is visible interest in marketplaces and registries, but for SkillVault this should remain a future manual-import workflow, not a product identity.

Personal product fit:

- The user's likely library size is small enough for a dense local UI and SQLite, not an enterprise LLMOps system.
- The product should help preserve personally useful workflows extracted from repeated AI usage.
- The next painful failure mode is data loss or irreversible overwrite, not lack of AI automation.
- Tool-specific output quality matters more than public sharing.
- A local folder or Obsidian-style vault can be useful as an exchange and backup layer, but SQLite should remain primary until folder sync has a tested conflict model.

Roadmap conclusion:

1. Finish backup/restore/integrity before adding more import and deployment paths.
2. Then add local folder and tool deployment workflows with dry-run, conflict copies, and explicit target paths.
3. Then add deterministic validation and security warnings for SKILL.md, AGENTS.md, CLAUDE.md, Cursor rules, and imported Markdown.
4. Then add capture inbox and local conversation-log extraction.
5. Delay public curated libraries, registries, AI APIs, and desktop packaging until the personal local workflow is reliable.

## Planning Rules

- Do not implement a future phase while the current phase has blocking acceptance work.
- Every write-like workflow must have preview or confirmation when data could be overwritten, shadowed, deleted, restored, rolled back, imported, exported, or deployed.
- All schema changes must be made in `db/schema.ts` and Drizzle migrations.
- Pages must not contain database logic. Server Actions validate, call services, catch errors, and revalidate paths. Services own business rules. Queries own database access.
- Import/export, backup/restore, and folder sync must be tested with real local fixtures.
- Do not add login, cloud sync, OAuth, SaaS deployment assumptions, AI APIs, remote marketplaces, public sharing, team features, payments, rich text editors, RAG, or chat surfaces unless a later phase explicitly allows the smallest safe subset.
- Prefer deterministic parsing and validation before AI-assisted behavior.
- If a useful external feature conflicts with local-first scope, record it in the future backlog rather than implementing it.

## v0.1-alpha - Core Local Library

Status: complete.

Goal: make a localhost-only app that can safely store, edit, search, version, copy, import, and export personal AI workflow assets.

Completed:

- [x] Project positioning and architecture rules.
- [x] Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, SQLite, Drizzle, Zod.
- [x] Asset CRUD.
- [x] Tags and tag binding.
- [x] Archive, soft delete, and restore.
- [x] Search, filters, sorting, and pinned ordering.
- [x] Raw copy.
- [x] Variable extraction and rendered copy.
- [x] Version 1 creation on new asset.
- [x] New version on content hash change.
- [x] No new version for metadata-only edits.
- [x] Version history.
- [x] Rollback with `Rollback to version X` note.
- [x] Markdown render and export.
- [x] Markdown parse and import preview.
- [x] `syncId` conflict handling with overwrite/copy/cancel.
- [x] Settings and diagnostics.
- [x] Mobile-readable list/detail/copy paths.
- [x] Seed/demo data.
- [x] Manual smoke checklist.
- [x] README update for alpha behavior.

Exit criteria:

- [x] Restarting the local server does not lose SQLite data.
- [x] Duplicate creation on existing `syncId` import is avoided.
- [x] Destructive or overwrite-like actions are explicit.
- [x] `npm run typecheck`, `npm run lint`, and `npm run build` passed at phase completion.

## v0.1-beta - Organization and Evaluation

Status: complete.

Goal: make the library maintainable over time, not just a CRUD database.

Completed:

- [x] Collection CRUD.
- [x] Add/remove assets from collections.
- [x] Collection ordering.
- [x] Manual test cases.
- [x] Test cases attach to assets and optionally versions.
- [x] Basic dashboard counts and recent activity.
- [x] Built-in starter templates.
- [x] Better export templates for AGENTS.md, CLAUDE.md, Codex Skill, and image prompts.
- [x] Batch Markdown export.
- [x] Experimental folder import.

Exit criteria:

- [x] A user can group assets by purpose.
- [x] A user can record whether an asset worked in a real task.
- [x] A user can export multiple assets without repeating manual steps.

## v0.2 - Tool-Specific Asset Formats

Status: complete.

Goal: make SkillVault useful for producing correct ready-to-use files for AI coding tools.

Completed:

- [x] AGENTS.md export preset.
- [x] CLAUDE.md export preset.
- [x] Codex Skill `SKILL.md` export preset.
- [x] Cursor Rules export preset.
- [x] SKILL.md import detection.
- [x] SKILL.md export.
- [x] Preset-specific export API route.
- [x] Built-in starter templates.
- [x] Folder import experiment.

Exit criteria:

- [x] A user can export an asset as AGENTS.md, CLAUDE.md, Codex Skill SKILL.md, or Cursor Rules without manual reformatting.
- [x] SKILL.md files can be detected and parsed.

## v0.3 - Project Workspace Scanner

Status: complete.

Goal: connect assets to real local projects and detect existing AI configuration files.

Completed:

- [x] Project workspace data model.
- [x] Project CRUD.
- [x] Project-asset association.
- [x] Local directory scanner for AI config files such as AGENTS.md, CLAUDE.md, and `.cursor/rules`.
- [x] Project-scoped asset view.
- [x] Project dashboard counts and status.

Exit criteria:

- [x] A user can create a project and associate assets with it.
- [x] A user can scan a local directory and detect existing AI configuration files.
- [x] A user can view assets relevant to a project.

## v0.4 - Backup, Restore, and Integrity

Status: next.

Goal: make local data loss and accidental overwrite unlikely.

Why now:

- The app already has enough entities and import paths to make loss or corruption costly.
- External tools show demand for reproducible restore and lock/manifest-driven setup.
- Local-first trust depends on backup being boring and inspectable.

Scope:

- Export-all backup as a folder or file bundle containing Markdown assets plus a manifest.
- Restore preview before mutation.
- Conflict handling for `syncId`, slug/title collisions, and content-hash duplicates.
- Checksum validation.
- Database integrity diagnostics.
- A fresh-database restore smoke test.

Tasks:

- [x] Define backup manifest schema in `lib/markdown` or `lib/backup`.
- [x] Include app version, schema/migration marker, export timestamp, asset count, version count, tag count, collection count, project count, and checksums.
- [x] Implement export-all backup route or Server Action.
- [x] Include assets as Markdown using `syncId`, not local `id`.
- [x] Include versions in a deterministic manifest section or sidecar file.
- [x] Include collection and project membership without requiring local IDs.
- [ ] Add restore parser with Zod validation.
- [ ] Add restore preview page showing create/overwrite/copy/skip candidates.
- [ ] Add restore conflict options: skip, overwrite by `syncId`, copy with new `syncId`.
- [ ] Add checksum mismatch warnings.
- [ ] Add fresh-database restore smoke fixture.
- [x] Add diagnostics for migration state, database path, entity counts, and last backup timestamp if available.
- [ ] Document backup and restore in `README.md`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.

Exit criteria:

- A user can export a complete local backup.
- A user can restore that backup into a fresh SQLite database.
- Restore never mutates data before preview and explicit confirmation.
- Version history remains readable after restore.
- A checksum mismatch blocks or clearly warns before restore.

## v0.5 - Local Folder Library and Tool Deployment

Status: planned.

Goal: bridge SkillVault's database library with folder-based AI tool ecosystems while avoiding drift and silent overwrites.

Why:

- Skills tools increasingly use one local source of truth with per-tool install links or copies.
- Users need to know what is deployed where and whether it is stale.
- Project scans are already present, so the next useful step is controlled deployment.

Scope:

- Configure local target directories for supported tools.
- Dry-run deploy from an asset to a selected target path.
- Show planned filename, existing file status, conflict risk, and rollback copy path.
- Support install status per asset/tool/project.
- Preserve conflict copies before overwrite.
- Use copy first; symlink support can be optional and must be explicit.

Tasks:

- [ ] Add target directory settings for Codex, Claude Code, Cursor, Windsurf, Trae, and generic folder targets.
- [ ] Add a deployment preview service that renders the exact target file content.
- [ ] Add file existence and content-hash checks before write.
- [ ] Add conflict copy preservation for existing target files.
- [ ] Add deployment result records or metadata sufficient to show installed/stale/broken status.
- [ ] Add project-level deploy from project assets.
- [ ] Add repair action for missing or drifted target files.
- [ ] Add documentation for copy vs symlink behavior.

Exit criteria:

- A user can deploy a selected asset to a local tool directory after preview.
- Existing files are never silently overwritten.
- The app can show whether deployed content matches the current asset.

## v0.6 - Deterministic Validation and Safety Checks

Status: planned.

Goal: prevent malformed or risky assets from drifting into the library or target tool directories.

Why:

- SKILL.md metadata and instructions affect discovery and agent behavior.
- Remote import and tool deployment are unsafe without validation.
- Deterministic validation fits the product better than AI prompt optimization.

Scope:

- SKILL.md frontmatter validation.
- AGENTS.md and CLAUDE.md structural checks.
- Cursor rule metadata checks.
- Variable placeholder validation.
- Dangerous pattern warnings for imported or deployable assets.
- Health score based only on deterministic signals.

Tasks:

- [ ] Add reusable validation result types.
- [ ] Validate required SKILL.md fields such as `name` and `description`.
- [ ] Warn for empty body, weak body length, malformed YAML, duplicate names, and unsupported metadata.
- [ ] Warn for suspicious patterns such as hardcoded secrets, hidden instructions, obfuscated text, pipe-to-shell snippets, and remote script install commands.
- [ ] Validate variables against `{{variable_name}}` syntax and missing rendered values.
- [ ] Add validation badges to asset detail and import preview.
- [ ] Add a maintenance queue for invalid or risky assets.
- [ ] Add tests for valid, malformed, and suspicious fixtures.

Exit criteria:

- A user can see validation issues before import, export, or deployment.
- Validation is deterministic and can run without network or AI APIs.

## v0.7 - Capture Inbox and Local Conversation Mining

Status: planned.

Goal: make it easy to turn daily AI usage into reusable assets.

Why:

- Personal libraries grow from repeated conversations, not from blank forms.
- Local AI assistant logs contain useful prompts, system rules, workflows, and reply templates.
- Deterministic extraction and manual review are safer than automatic AI summarization.

Scope:

- Manual capture inbox.
- Convert inbox item to asset.
- Optional local scan of supported conversation directories.
- Candidate extraction preview.
- Favorites and source links back to local files where practical.

Tasks:

- [ ] Add capture inbox table and service.
- [ ] Add manual paste-to-inbox page.
- [ ] Add convert-to-asset workflow.
- [ ] Track source type, source path, source timestamp, and extraction note.
- [ ] Add deterministic importers for one source first, likely Codex session rollouts or Claude Code JSONL.
- [ ] Add incremental scan with changed-file detection.
- [ ] Add candidate review UI before creating assets.
- [ ] Keep raw conversation content out of asset content unless user explicitly selects it.

Exit criteria:

- A user can capture rough material quickly.
- A user can promote a reviewed candidate into a normal versioned asset.
- No conversation log scan creates assets without preview.

## v0.8 - Diff, Test Runs, and Use History

Status: planned.

Goal: help maintain quality after assets are used repeatedly.

Scope:

- Side-by-side text diff for versions.
- Run log records linked to test cases.
- Copy/use history via `lastUsedAt`.
- Model/tool compatibility notes.
- Review cadence and stale asset indicators.

Tasks:

- [ ] Add simple text diff for asset versions.
- [ ] Add run log entity if the current test case model is not enough.
- [ ] Track copy events enough to update `lastUsedAt`.
- [ ] Add filters for stale, recently used, never used, low-rated, and untested assets.
- [ ] Add model/tool compatibility fields only if they improve filtering without bloating forms.
- [ ] Add review due date and review queue.

Exit criteria:

- A user can compare versions without leaving the app.
- A user can tell which assets are used, stale, or untested.

## v0.9 - Import Sources, Curated Assets, and Git-Friendly Exchange

Status: planned.

Goal: support manual discovery and import while staying local-first.

Scope:

- Manual GitHub URL import for public Markdown/SKILL.md assets.
- Pinned source metadata.
- Dry-run import from repository archive or raw file.
- Optional curated local bundle.
- No accounts, no marketplace, no payments, no public sharing.

Tasks:

- [ ] Define source metadata for imported assets: source URL, ref, path, imported at, and checksum.
- [ ] Add raw GitHub file import with preview and validation.
- [ ] Add repository archive import only after path filtering and file count limits are in place.
- [ ] Add update check that compares known source checksum without auto-overwriting.
- [ ] Add bundled curated examples as local data, not remote marketplace content.
- [ ] Add source filter and source detail on asset pages.

Exit criteria:

- A user can manually import a remote asset after preview.
- Imported assets remain local after import.
- Update checks do not mutate content automatically.

## v1.0 - Stable Personal Local Release

Status: future.

Goal: a stable local release for one person managing a durable personal AI workflow library.

Required scope:

- SQLite-backed local storage.
- Backup and restore tested against a fresh database.
- Markdown import/export and tool-specific exports.
- Version history, rollback, validation, and conflict handling.
- Collections, projects, tags, search, filters, copy, variables, and mobile usability.
- Local folder deployment with dry-run and conflict preservation.
- Documentation for install, upgrade, backup, restore, and supported scope.

Non-scope:

- SaaS.
- Login or user accounts.
- Cloud sync.
- OAuth.
- Team collaboration.
- Public sharing.
- Marketplace.
- Payments.
- AI prompt optimization service.
- RAG or chat app.
- Browser extension.
- Mobile app publishing.

Exit criteria:

- All prior phase verification commands pass.
- Restore from backup works into a fresh database.
- A real personal library can be used for two weeks without data loss.
- README and AGENTS.md match delivered behavior.
- Migration and upgrade notes exist.

## Recurring Verification Checklist

Run this before marking any phase complete:

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
- [ ] If the phase changes import/export/backup/deploy behavior, run a round-trip fixture.

## Backlog Parking Lot

Do not implement these until a roadmap phase explicitly accepts them:

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
- Electron, Tauri, or mobile app publishing.
- Public registry publishing.
- Automatic dependency resolver for third-party skills.
- Hosted MCP access to the library.
