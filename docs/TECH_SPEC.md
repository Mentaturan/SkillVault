# SkillVault Technical Spec

## Technical Stack

- Next.js App Router.
- TypeScript strict mode.
- Tailwind CSS.
- shadcn/ui.
- SQLite.
- Drizzle ORM with TypeScript schema as the source of truth.
- TanStack Table.
- Zod.
- Plain `textarea` editor for v0.1-alpha.

Do not add Monaco, CodeMirror, rich text editors, AI SDKs, LangChain, RAG frameworks, Supabase, Firebase, Postgres, Electron, Tauri, OAuth, cloud storage APIs, browser plugins, or mobile app tooling in v0.1-alpha.

## Architecture Boundary

SkillVault v0.1-alpha is a local Next.js localhost app with a SQLite file in the local server environment. It is not a cloud SaaS and must not assume durable SQLite storage on Vercel or similar cloud platforms.

Markdown is used for import and export. SQLite is the primary database.

## Directory Structure

```txt
app/
components/
db/
server/
  actions/
  services/
  queries/
lib/
  validators/
  markdown/
  variables/
docs/
```

The planned directories are created during phase 1. Business implementation starts in later phases.

## Layering Rules

- React components only render UI and call actions.
- Pages do not contain database queries or complex business rules.
- Server Actions receive parameters, validate with Zod, call services, catch errors, return explicit results, and call `revalidatePath` when needed.
- Services own business rules such as versioning, rollback, import conflict strategy, and tag binding.
- Queries own database access.
- Markdown parsing and rendering live in `lib/markdown` and `server/services/markdown-service.ts`.
- Variable extraction and rendering live in `lib/variables` and `server/services/variable-service.ts`.
- Constants and enum values live in `lib/constants.ts`.

## Database Schema

Time fields use integer timestamps. `deletedAt` implements soft delete.

Tables:

- `assets`: local asset records.
- `asset_versions`: immutable content history.
- `tags`: unique tag names.
- `asset_tags`: many-to-many relation.
- `collections`: v0.1-beta reserved.
- `collection_assets`: v0.1-beta reserved.
- `test_cases`: v0.1-beta reserved.

Important indexes:

- `assets.syncId` unique.
- `assets.slug`, `type`, `targetTool`, `exportPreset`, `status`, `deletedAt`, `updatedAt`, `pinned`.
- `asset_versions.assetId`, `asset_versions.createdAt`.
- `asset_versions.assetId + version` unique.
- `tags.name` unique.
- `asset_tags.assetId + tagId` composite primary key.

## Server Actions Rules

Actions are split by feature:

- `asset-actions.ts`
- `version-actions.ts`
- `tag-actions.ts`
- `import-actions.ts`
- `export-actions.ts`
- `collection-actions.ts`
- `test-case-actions.ts`

Actions must:

- Use Zod validation.
- Call service methods.
- Catch errors and return explicit messages.
- Revalidate affected paths when needed.
- Avoid direct database queries.
- Avoid complex business rules.

## Service Rules

Required alpha services:

- `asset-service`
- `version-service`
- `tag-service`
- `markdown-service`
- `variable-service`

Reserved beta services:

- `collection-service`
- `test-case-service`

Services return typed results or throw domain errors with clear messages.

## Version Rules

- Creating an asset creates version 1.
- Updating content creates a new version only when `contentHash` changes.
- Updating metadata only does not create a version.
- Rolling back an old version writes that snapshot to `Asset.content` and creates a new version.
- Rollback `changeNote` format is `Rollback to version X`.
- Version numbers are monotonically increasing per asset.
- Versions are never deleted.
- If the next content hash matches the latest version hash, no version is created.
- Rollback never removes intermediate versions.

## Variable Rules

Variables use `{{variableName}}`.

Rules:

- Detect variables with a regex.
- Supported variable names contain letters, numbers, underscores, and hyphens.
- Deduplicate variables while preserving first appearance order.
- Ignore empty variable names.
- Replacement is plain text only.
- Never execute variable content.

Required functions:

- `extractVariables(content: string): string[]`
- `renderTemplate(content: string, values: Record<string, string>): string`

## Markdown Export Rules

v0.1-alpha exports only `.md` files. Filename format:

```txt
{slug}.{syncId}.md
```

Frontmatter uses `syncId` and must not expose local database `id`.

Supported presets:

- `general_markdown`
- `codex_skill_md`
- `agents_md`
- `claude_md`
- `cursor_rules`
- `plain_text`

If a preset template has placeholder sections but the asset already has user content, preserve user content instead of overwriting it.

## Markdown Import Rules

- Parse frontmatter when present.
- Import plain text when no frontmatter exists.
- If frontmatter contains `syncId` and an asset with that `syncId` exists, require a conflict strategy.
- If no `syncId` exists, create a new asset.
- If title, type, and target tool strongly resemble an existing asset, warn about possible duplication.
- v0.1-alpha does not auto-merge and does not implement complex diff.

Conflict strategies:

- Overwrite current content and create a new version.
- Import as a copy.
- Cancel import.

## Error Handling

Required handled cases:

- Form validation failure.
- Asset not found.
- Version not found.
- Markdown parse failure.
- `syncId` conflict.
- Database write failure.
- Deleting an already deleted asset.
- Rolling back a missing version.
- Duplicate tag names.
- Rating outside `1-5`.

Errors should be clear and actionable.

## Security and Data Protection

- Never execute user content.
- Treat Markdown as text.
- Variable replacement is pure text replacement.
- Do not send user content to external services.
- Do not connect AI APIs.
- Do not upload data.
- Do not automatically read unrelated user directories.
- Do not add background monitoring.
