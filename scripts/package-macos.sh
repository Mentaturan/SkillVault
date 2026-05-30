#!/bin/bash
set -euo pipefail

APP_NAME="SkillVault"
VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="dist"
APP_BUNDLE="${BUILD_DIR}/${APP_NAME}.app"

echo "==> Packaging ${APP_NAME} v${VERSION} for macOS..."

rm -rf "${APP_BUNDLE}"

echo "Building Next.js..."
npm run build

echo "Creating .app bundle structure..."
mkdir -p "${APP_BUNDLE}/Contents/MacOS"
mkdir -p "${APP_BUNDLE}/Contents/Resources"
mkdir -p "${APP_BUNDLE}/Contents/Server"

echo "Copying Info.plist..."
cp macos/SkillVault/Info.plist "${APP_BUNDLE}/Contents/"

echo "Compiling Swift launcher..."
swiftc \
  -o "${APP_BUNDLE}/Contents/MacOS/${APP_NAME}" \
  macos/SkillVault/main.swift \
  macos/SkillVault/AppDelegate.swift \
  macos/SkillVault/ServerManager.swift \
  -framework Cocoa -framework WebKit \
  -parse-as-library 2>/dev/null || \
swiftc \
  -o "${APP_BUNDLE}/Contents/MacOS/${APP_NAME}" \
  macos/SkillVault/main.swift \
  macos/SkillVault/AppDelegate.swift \
  macos/SkillVault/ServerManager.swift \
  -framework Cocoa -framework WebKit

echo "Copying standalone server output..."
cp -R .next/standalone/* "${APP_BUNDLE}/Contents/Server/"
mkdir -p "${APP_BUNDLE}/Contents/Server/.next/static"
cp -R .next/static/* "${APP_BUNDLE}/Contents/Server/.next/static/"
if [ -d "public" ]; then
  cp -R public "${APP_BUNDLE}/Contents/Server/public"
fi

echo "Creating icon assets..."
if command -v iconutil &> /dev/null && [ -d "macos/SkillVault/Assets.xcassets/AppIcon.appiconset" ]; then
  iconutil -c icns -o "${APP_BUNDLE}/Contents/Resources/AppIcon.icns" macos/SkillVault/Assets.xcassets/AppIcon.appiconset || true
fi

echo "Creating .zip archive..."
cd dist
zip -r -q "SkillVault-macOS-v${VERSION}.zip" "${APP_NAME}.app"
cd ..

echo ""
echo "✓ Packaged: dist/SkillVault-macOS-v${VERSION}.zip"
echo "✓ App bundle: ${APP_BUNDLE}"
