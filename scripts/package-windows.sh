#!/bin/bash
set -euo pipefail

APP_NAME="SkillVault"
VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="dist"
STAGING_DIR="${BUILD_DIR}/${APP_NAME}-Windows-staging"

echo "==> Staging ${APP_NAME} v${VERSION} server files for Windows..."

rm -rf "${STAGING_DIR}"

if [ ! -d ".next/standalone" ]; then
  echo "Building Next.js..."
  npm run build
fi

echo "Creating staging directory structure..."
mkdir -p "${STAGING_DIR}/Server"

echo "Copying standalone server output..."
cp -R .next/standalone/* "${STAGING_DIR}/Server/"
cp -R .next/standalone/.next "${STAGING_DIR}/Server/"
mkdir -p "${STAGING_DIR}/Server/.next/static"
cp -R .next/static/* "${STAGING_DIR}/Server/.next/static/"

if [ -d "public" ]; then
  cp -R public "${STAGING_DIR}/Server/public"
fi

echo "Copying database migrations..."
mkdir -p "${STAGING_DIR}/Server/db/migrations"
cp -R db/migrations/* "${STAGING_DIR}/Server/db/migrations/"

ICON_SOURCE="icon/icon.png"

echo "Generating application icon..."
if [ -f "${ICON_SOURCE}" ]; then
  ICO_DIR=$(mktemp -d)
  sips -z 16 16 "${ICON_SOURCE}" --out "${ICO_DIR}/icon_16.png" >/dev/null 2>&1
  sips -z 32 32 "${ICON_SOURCE}" --out "${ICO_DIR}/icon_32.png" >/dev/null 2>&1
  sips -z 48 48 "${ICON_SOURCE}" --out "${ICO_DIR}/icon_48.png" >/dev/null 2>&1
  sips -z 64 64 "${ICON_SOURCE}" --out "${ICO_DIR}/icon_64.png" >/dev/null 2>&1
  sips -z 128 128 "${ICON_SOURCE}" --out "${ICO_DIR}/icon_128.png" >/dev/null 2>&1
  sips -z 256 256 "${ICON_SOURCE}" --out "${ICO_DIR}/icon_256.png" >/dev/null 2>&1
  if command -v magick >/dev/null 2>&1; then
    magick "${ICO_DIR}/icon_16.png" "${ICO_DIR}/icon_32.png" "${ICO_DIR}/icon_48.png" "${ICO_DIR}/icon_64.png" "${ICO_DIR}/icon_128.png" "${ICO_DIR}/icon_256.png" "${STAGING_DIR}/SkillVault.ico"
    echo "  Icon created from ${ICON_SOURCE} (ImageMagick)"
  else
    cp "${ICO_DIR}/icon_256.png" "${STAGING_DIR}/SkillVault.ico"
    echo "  Warning: ImageMagick not found; copied 256px PNG as placeholder .ico"
    echo "  Install ImageMagick (brew install imagemagick) for proper .ico generation"
  fi
  rm -rf "${ICO_DIR}"
else
  echo "  No icon source found at ${ICON_SOURCE}"
fi

echo "Creating server .zip archive..."
cd dist
zip -r -q "${APP_NAME}-Windows-server-v${VERSION}.zip" "${APP_NAME}-Windows-staging/"
cd ..

echo ""
echo "Staged: ${STAGING_DIR}/"
echo "Archive: dist/${APP_NAME}-Windows-server-v${VERSION}.zip"
echo ""
echo "To complete the Windows build on a Windows machine:"
echo "  1. Copy dist/${APP_NAME}-Windows-server-v${VERSION}.zip to the Windows machine"
echo "  2. Extract the zip to a directory"
echo "  3. Copy node.exe into the root of the extracted directory"
echo "  4. Run: dotnet publish windows/SkillVault/SkillVault.csproj -c Release -r win-x64 --self-contained false -o <extracted-dir>"
echo "  5. Run: Compress-Archive -Path <extracted-dir>/* -DestinationPath SkillVault-Windows-v${VERSION}.zip"
echo ""
echo "Or run scripts/package-windows.ps1 on the Windows machine with the full project checkout."
