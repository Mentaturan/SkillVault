# Release Checklist

Run this checklist before tagging a release.

## Build Verification

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm run db:migrate` applies cleanly on an existing database

## Version Number Consistency

- [ ] `package.json` version matches the release tag
- [ ] `lib/constants.ts` version (if present) matches `package.json`
- [ ] `macos/SkillVault/Info.plist` `CFBundleShortVersionString` matches `package.json`
- [ ] `ios/SkillVault/Info.plist` `CFBundleShortVersionString` matches `package.json`
- [ ] `windows/SkillVault/SkillVault.csproj` `<Version>` matches `package.json`

## macOS App

- [ ] `scripts/package-macos.sh` completes without errors
- [ ] `dist/SkillVault.app` launches by double-clicking
- [ ] App starts the embedded server without requiring system Node.js
- [ ] Web UI loads in the WKWebView window
- [ ] External links open in the system browser, not in-app
- [ ] `dist/SkillVault-macOS-v<version>.zip` extracts to a working `.app`
- [ ] `dist/SkillVault-macOS-v<version>.dmg` mounts and contains the `.app` plus `/Applications` symlink
- [ ] `.app` icon appears correctly in Finder and Dock

## Windows App

- [ ] `scripts/package-windows.ps1` completes on Windows without errors
- [ ] `SkillVault.exe` launches and starts the embedded server
- [ ] Web UI loads in the WebView2 window
- [ ] App does not require system Node.js at runtime
- [ ] `dist/SkillVault-Windows-v<version>.zip` extracts to a working app directory
- [ ] App icon appears correctly in taskbar and title bar

## iOS Companion App

- [ ] iOS app builds in Xcode without errors
- [ ] iOS app discovers desktop SkillVault instances via Bonjour
- [ ] Tapping a discovered instance loads the desktop Web UI in WKWebView
- [ ] Navigation within the app stays in WKWebView

## Backup and Restore Smoke Test

- [ ] Export a full backup from Settings
- [ ] Restore the backup into a fresh database and verify all assets, versions, tags, collections, and projects survive
- [ ] Cross-platform: backup exported on macOS restores correctly on Windows (or vice versa)

## Artifact Sanity Checks

- [ ] `.zip` and `.dmg` file sizes are reasonable (not 0 bytes, not unexpectedly large)
- [ ] `.zip` contents match expected structure (no stray files or missing directories)
- [ ] `.dmg` opens on a clean macOS without errors
- [ ] Windows `.zip` contains `SkillVault.exe`, `node.exe`, and `Server/` directory

## Documentation Consistency

- [ ] `README.md` reflects current version and feature set
- [ ] `AGENTS.md` reflects current phase status and roadmap
- [ ] `docs/TASKS.md` reflects current task completion status
- [ ] All three documents agree on the current version number and phase
