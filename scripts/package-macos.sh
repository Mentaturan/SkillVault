#!/bin/bash
set -euo pipefail

APP_NAME="SkillVault"
VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="dist"
APP_BUNDLE="${BUILD_DIR}/${APP_NAME}.app"
ICON_SOURCE="icon/icon.png"

echo "==> Packaging ${APP_NAME} v${VERSION} for macOS..."

rm -rf "${APP_BUNDLE}"

if [ ! -d ".next/standalone" ]; then
  echo "Building Next.js..."
  npm run build
fi

echo "Creating .app bundle structure..."
mkdir -p "${APP_BUNDLE}/Contents/MacOS"
mkdir -p "${APP_BUNDLE}/Contents/Resources"
mkdir -p "${APP_BUNDLE}/Contents/Server"
mkdir -p "${APP_BUNDLE}/Contents/Frameworks"

echo "Copying Info.plist..."
cp macos/SkillVault/Info.plist "${APP_BUNDLE}/Contents/"

echo "Syncing version to Info.plist..."
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${VERSION}" "${APP_BUNDLE}/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${VERSION}" "${APP_BUNDLE}/Contents/Info.plist"

echo "Compiling Swift launcher..."
swiftc \
  -o "${APP_BUNDLE}/Contents/MacOS/${APP_NAME}" \
  macos/SkillVault/main.swift \
  macos/SkillVault/AppDelegate.swift \
  macos/SkillVault/ServerManager.swift \
  macos/SkillVault/BonjourService.swift \
  macos/SkillVault/UpdateManager.swift \
  -framework Cocoa -framework WebKit \
  -parse-as-library 2>/dev/null || \
swiftc \
  -o "${APP_BUNDLE}/Contents/MacOS/${APP_NAME}" \
  macos/SkillVault/main.swift \
  macos/SkillVault/AppDelegate.swift \
  macos/SkillVault/ServerManager.swift \
  macos/SkillVault/BonjourService.swift \
  macos/SkillVault/UpdateManager.swift \
  -framework Cocoa -framework WebKit

echo "Copying standalone server output..."
cp -R .next/standalone/* "${APP_BUNDLE}/Contents/Server/"
cp -R .next/standalone/.next "${APP_BUNDLE}/Contents/Server/"
mkdir -p "${APP_BUNDLE}/Contents/Server/.next/static"
cp -R .next/static/* "${APP_BUNDLE}/Contents/Server/.next/static/"
if [ -d "public" ]; then
  cp -R public "${APP_BUNDLE}/Contents/Server/public"
fi

echo "Copying database migrations..."
mkdir -p "${APP_BUNDLE}/Contents/Server/db/migrations"
cp -R db/migrations/* "${APP_BUNDLE}/Contents/Server/db/migrations/"

echo "Bundling Node.js runtime..."
NODE_BIN=$(which node)
NODE_REAL=$(readlink -f "$NODE_BIN" 2>/dev/null || echo "$NODE_BIN")
cp "$NODE_REAL" "${APP_BUNDLE}/Contents/Frameworks/node"
chmod +x "${APP_BUNDLE}/Contents/Frameworks/node"
echo "  Bundled: $(basename "$NODE_REAL") -> Contents/Frameworks/node"

echo "Re-signing bundled node binary..."
codesign --force --sign - "${APP_BUNDLE}/Contents/Frameworks/node" 2>&1 || echo "  Warning: codesign of node failed (non-critical)"

echo "Creating application icon..."
if [ -f "${ICON_SOURCE}" ]; then
  ICONSET_DIR=$(mktemp -d)/AppIcon.iconset
  mkdir -p "${ICONSET_DIR}"
  sips -z 16 16 "${ICON_SOURCE}" --out "${ICONSET_DIR}/icon_16x16.png" >/dev/null 2>&1
  sips -z 32 32 "${ICON_SOURCE}" --out "${ICONSET_DIR}/icon_16x16@2x.png" >/dev/null 2>&1
  sips -z 32 32 "${ICON_SOURCE}" --out "${ICONSET_DIR}/icon_32x32.png" >/dev/null 2>&1
  sips -z 64 64 "${ICON_SOURCE}" --out "${ICONSET_DIR}/icon_32x32@2x.png" >/dev/null 2>&1
  sips -z 128 128 "${ICON_SOURCE}" --out "${ICONSET_DIR}/icon_128x128.png" >/dev/null 2>&1
  sips -z 256 256 "${ICON_SOURCE}" --out "${ICONSET_DIR}/icon_128x128@2x.png" >/dev/null 2>&1
  sips -z 256 256 "${ICON_SOURCE}" --out "${ICONSET_DIR}/icon_256x256.png" >/dev/null 2>&1
  sips -z 512 512 "${ICON_SOURCE}" --out "${ICONSET_DIR}/icon_256x256@2x.png" >/dev/null 2>&1
  sips -z 512 512 "${ICON_SOURCE}" --out "${ICONSET_DIR}/icon_512x512.png" >/dev/null 2>&1
  cp "${ICON_SOURCE}" "${ICONSET_DIR}/icon_512x512@2x.png"
  iconutil -c icns -o "${APP_BUNDLE}/Contents/Resources/AppIcon.icns" "${ICONSET_DIR}" 2>&1 || echo "  Warning: iconutil failed"
  rm -rf "$(dirname "${ICONSET_DIR}")"
  echo "  Icon created from ${ICON_SOURCE}"
else
  echo "  No icon source found at ${ICON_SOURCE}"
fi

echo "Removing quarantine and extended attributes..."
xattr -cr "${APP_BUNDLE}" 2>&1 || true
find "${APP_BUNDLE}" -name "._*" -delete 2>&1 || true

echo "Signing .app bundle..."
codesign --deep --force --sign - "${APP_BUNDLE}" 2>&1 || {
  echo "  Deep sign failed, trying individual signing..."
  codesign --force --sign - "${APP_BUNDLE}/Contents/MacOS/${APP_NAME}" 2>&1 || true
  codesign --force --sign - "${APP_BUNDLE}/Contents/Frameworks/node" 2>&1 || true
}

echo "Creating .zip archive..."
cd dist
zip -r -q "SkillVault-macOS-v${VERSION}.zip" "${APP_NAME}.app"
cd ..

echo "Creating DMG installer..."
DMG_NAME="SkillVault-macOS-v${VERSION}.dmg"
DMG_PATH="${BUILD_DIR}/${DMG_NAME}"
DMG_STAGING="${BUILD_DIR}/dmg-staging"

rm -rf "${DMG_STAGING}" "${DMG_PATH}"
mkdir -p "${DMG_STAGING}"

cp -R "${APP_BUNDLE}" "${DMG_STAGING}/"
ln -s /Applications "${DMG_STAGING}/Applications"

hdiutil create -volname "SkillVault" \
  -srcfolder "${DMG_STAGING}" \
  -ov -format UDZO \
  "${DMG_PATH}"

rm -rf "${DMG_STAGING}"

echo ""
echo "✓ Packaged: dist/SkillVault-macOS-v${VERSION}.zip"
echo "✓ DMG: dist/SkillVault-macOS-v${VERSION}.dmg"
echo "✓ App bundle: ${APP_BUNDLE}"
echo ""
echo "Note: To bypass Gatekeeper, right-click the app and select Open on first launch."
echo "Or run: xattr -cr /Applications/SkillVault.app"
