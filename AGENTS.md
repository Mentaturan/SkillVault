# SkillVault Agent Rules

## Project Positioning

SkillVault is a local-first personal AI workflow asset manager for a small, high-value library of 20-50 reusable assets.

It manages Codex Skills, Trae Solo Skills, Claude Code rules, Cursor and Windsurf rules, AGENTS.md, CLAUDE.md, AI chat prompts, image prompts, reply templates, copywriting templates, code review rules, file workflows, SOPs, checklists, and reusable prompts, skills, and rules extracted from AI conversations.

It is not a SaaS, prompt market, AI chat tool, RAG system, team collaboration platform, cloud sync service, browser extension, hosted MCP service, or broad desktop/mobile product. Lightweight native wrappers around the local web app are in scope: macOS (`macos/SkillVault/`), Windows (`windows/SkillVault/`), and iOS companion (`ios/SkillVault/`).

## Current Implementation State

Use `docs/TASKS.md` as the source of truth.

As of 2026-05-30, v1.0 stable personal local release is complete and v1.1 packaging, release, and onboarding polish is complete and v1.2 library maintenance and review ergonomics is complete and v1.3 filesystem exchange and capture expansion is complete:

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
- v1.0 stable personal local release is complete.
- v1.1 packaging, release, and onboarding polish is complete.
- v1.1 local enhancements already landed include GitHub release update checks, optional preset seeding for empty libraries, bundled Node.js runtime in the macOS app, `.zip` plus `.dmg` packaging outputs, Windows C# WebView2 native wrapper, iOS companion app with Bonjour discovery, and desktop Bonjour/mDNS broadcasting.
- v1.2 library maintenance and review ergonomics is complete.
- v1.3 filesystem exchange and capture expansion is complete.

The package version is `1.3.0`.

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

## Theme System Rules

- Theme management uses `next-themes` with `attribute="data-theme"` and 4 themes: `light`, `dark`, `claude`, `glass`.
- Default theme is `claude` to preserve the existing visual style for current users.
- All theme CSS variables are defined in `app/globals.css` using `[data-theme="xxx"]` selectors.
- Theme constants (`THEMES`, `Theme` type, `THEME_LABELS`) live in `lib/constants.ts`.
- The `ThemeProvider` wrapper lives in `components/theme-provider.tsx`.
- The `ThemeSwitcher` (sidebar cycle button) lives in `components/theme-switcher.tsx`.
- The `ThemeSelector` (settings page grid) lives in `components/theme-selector.tsx`.
- The `useMounted` hook for hydration-safe rendering lives in `lib/hooks/use-mounted.ts`.
- Liquid Glass theme uses `glass-surface`, `glass-border`, and `glass-sidebar` CSS classes defined in `globals.css`.
- Liquid Glass theme degrades to opaque dark backgrounds when `backdrop-filter` is unsupported.
- Do not add per-component theme conditionals; use CSS variables and data-theme selectors instead.
- New themes must define a complete set of CSS variables matching the existing variable names.

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
7. v1.0 stable personal local release (complete).
8. v1.1 packaging, release, and onboarding polish (complete).
9. v1.2 library maintenance and review ergonomics (complete).
10. v1.3 filesystem exchange and capture expansion (current).

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
- Electron, Tauri. (Lightweight native wrappers are allowed: macOS Swift WKWebView in `macos/SkillVault/`, Windows C# WebView2 in `windows/SkillVault/`, iOS Swift WKWebView companion in `ios/SkillVault/`.)
- App Store publishing. (Sideloading and TestFlight distribution are allowed.)
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

## macOS App Packaging Rules

- The macOS .app is a lightweight Swift WKWebView wrapper around the Next.js standalone server.
- Swift source code lives in `macos/SkillVault/`.
- The packaging script is `scripts/package-macos.sh`.
- The .app bundles a local Node.js runtime inside `Contents/Frameworks/node`; do not assume system Node.js is available.
- The .app stores data in `~/Library/Application Support/SkillVault/`.
- The .app is not an Electron or Tauri app; it is a native Swift wrapper.
- Changes to the Swift launcher should be minimal and focused on window management and server lifecycle.
- The packaging script must stay idempotent and produce `dist/SkillVault.app`, `dist/SkillVault-macOS-v<version>.zip`, and `dist/SkillVault-macOS-v<version>.dmg`.
- The macOS app broadcasts `_skillvault._tcp.` via Bonjour/NetService for iOS companion discovery.

## Windows App Packaging Rules

- The Windows app is a lightweight C# WebView2 wrapper around the Next.js standalone server.
- C# source code lives in `windows/SkillVault/`.
- The packaging script is `scripts/package-windows.ps1` (on Windows) or `scripts/package-windows.sh` (cross-prep on macOS).
- The app bundles a local Node.js runtime as `node.exe` next to the executable; do not assume system Node.js is available.
- The app stores data in `%APPDATA%\SkillVault\`.
- The app is not an Electron or Tauri app; it is a native C# WinForms wrapper.
- Changes to the C# launcher should be minimal and focused on window management and server lifecycle.
- The packaging script must produce `dist/SkillVault-Windows-v<version>.zip`.
- The Windows app broadcasts `_skillvault._tcp.` via mDNS (Makaretu.Dns.Multicast) for iOS companion discovery.

## iOS Companion App Rules

- The iOS app is a companion that connects to a desktop SkillVault instance on the local network.
- Swift source code lives in `ios/SkillVault/`.
- The iOS app does NOT run a local server or store a local database.
- The iOS app discovers desktop instances via Bonjour/NetServiceBrowser searching for `_skillvault._tcp.`.
- The iOS app uses WKWebView to load the desktop instance's Web UI.
- Changes to the iOS app should be minimal and focused on server discovery, connection, and WebView lifecycle.
- App Store publishing is not in scope; sideloading and TestFlight distribution are allowed.

## Cross-Platform Data Rules

- Each platform uses an independent database path; no shared locks or file conflicts.
- macOS: `~/Library/Application Support/SkillVault/skillvault.sqlite`
- Windows: `%APPDATA%\SkillVault\skillvault.sqlite`
- Development: `./data/skillvault.sqlite`
- Data migration between platforms uses the existing backup/restore workflow.
- The backup bundle format is platform-agnostic; syncId conflict strategies apply consistently.
