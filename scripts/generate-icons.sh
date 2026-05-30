#!/bin/bash
set -euo pipefail

ICON_SOURCE="icon/icon.png"
MACOS_APPICONSET="macos/SkillVault/Assets.xcassets/AppIcon.appiconset"
IOS_APPICONSET="ios/SkillVault/Assets.xcassets/AppIcon.appiconset"

if [ ! -f "${ICON_SOURCE}" ]; then
  echo "Error: ${ICON_SOURCE} not found"
  exit 1
fi

echo "Generating macOS appiconset icons..."
mkdir -p "${MACOS_APPICONSET}"
sips -z 16 16 "${ICON_SOURCE}" --out "${MACOS_APPICONSET}/icon_16x16.png" >/dev/null 2>&1
sips -z 32 32 "${ICON_SOURCE}" --out "${MACOS_APPICONSET}/icon_16x16@2x.png" >/dev/null 2>&1
sips -z 32 32 "${ICON_SOURCE}" --out "${MACOS_APPICONSET}/icon_32x32.png" >/dev/null 2>&1
sips -z 64 64 "${ICON_SOURCE}" --out "${MACOS_APPICONSET}/icon_32x32@2x.png" >/dev/null 2>&1
sips -z 128 128 "${ICON_SOURCE}" --out "${MACOS_APPICONSET}/icon_128x128.png" >/dev/null 2>&1
sips -z 256 256 "${ICON_SOURCE}" --out "${MACOS_APPICONSET}/icon_128x128@2x.png" >/dev/null 2>&1
sips -z 256 256 "${ICON_SOURCE}" --out "${MACOS_APPICONSET}/icon_256x256.png" >/dev/null 2>&1
sips -z 512 512 "${ICON_SOURCE}" --out "${MACOS_APPICONSET}/icon_256x256@2x.png" >/dev/null 2>&1
sips -z 512 512 "${ICON_SOURCE}" --out "${MACOS_APPICONSET}/icon_512x512.png" >/dev/null 2>&1
cp "${ICON_SOURCE}" "${MACOS_APPICONSET}/icon_512x512@2x.png"
echo "  macOS icons generated"

echo "Generating iOS appiconset icons..."
mkdir -p "${IOS_APPICONSET}"
sips -z 20 20 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-20@2x.png" >/dev/null 2>&1
sips -z 30 30 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-20@3x.png" >/dev/null 2>&1
sips -z 29 29 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-29@2x.png" >/dev/null 2>&1
sips -z 40 40 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-29@3x.png" >/dev/null 2>&1
sips -z 40 40 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-40@2x.png" >/dev/null 2>&1
sips -z 60 60 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-40@3x.png" >/dev/null 2>&1
sips -z 60 60 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-60@2x.png" >/dev/null 2>&1
sips -z 80 80 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-60@3x.png" >/dev/null 2>&1
sips -z 20 20 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-20~ipad.png" >/dev/null 2>&1
sips -z 40 40 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-20~ipad@2x.png" >/dev/null 2>&1
sips -z 29 29 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-29~ipad.png" >/dev/null 2>&1
sips -z 58 58 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-29~ipad@2x.png" >/dev/null 2>&1
sips -z 40 40 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-40~ipad.png" >/dev/null 2>&1
sips -z 80 80 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-40~ipad@2x.png" >/dev/null 2>&1
sips -z 76 76 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-76.png" >/dev/null 2>&1
sips -z 152 152 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-76@2x.png" >/dev/null 2>&1
sips -z 167 167 "${ICON_SOURCE}" --out "${IOS_APPICONSET}/Icon-83.5@2x.png" >/dev/null 2>&1
cp "${ICON_SOURCE}" "${IOS_APPICONSET}/Icon-1024.png"
echo "  iOS icons generated"

echo "Updating iOS Contents.json with filenames..."
cat > "${IOS_APPICONSET}/Contents.json" << 'EOF'
{
  "images": [
    {
      "idiom": "iphone",
      "scale": "2x",
      "size": "20x20",
      "filename": "Icon-20@2x.png"
    },
    {
      "idiom": "iphone",
      "scale": "3x",
      "size": "20x20",
      "filename": "Icon-20@3x.png"
    },
    {
      "idiom": "iphone",
      "scale": "2x",
      "size": "29x29",
      "filename": "Icon-29@2x.png"
    },
    {
      "idiom": "iphone",
      "scale": "3x",
      "size": "29x29",
      "filename": "Icon-29@3x.png"
    },
    {
      "idiom": "iphone",
      "scale": "2x",
      "size": "40x40",
      "filename": "Icon-40@2x.png"
    },
    {
      "idiom": "iphone",
      "scale": "3x",
      "size": "40x40",
      "filename": "Icon-40@3x.png"
    },
    {
      "idiom": "iphone",
      "scale": "2x",
      "size": "60x60",
      "filename": "Icon-60@2x.png"
    },
    {
      "idiom": "iphone",
      "scale": "3x",
      "size": "60x60",
      "filename": "Icon-60@3x.png"
    },
    {
      "idiom": "ipad",
      "scale": "1x",
      "size": "20x20",
      "filename": "Icon-20~ipad.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "20x20",
      "filename": "Icon-20~ipad@2x.png"
    },
    {
      "idiom": "ipad",
      "scale": "1x",
      "size": "29x29",
      "filename": "Icon-29~ipad.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "29x29",
      "filename": "Icon-29~ipad@2x.png"
    },
    {
      "idiom": "ipad",
      "scale": "1x",
      "size": "40x40",
      "filename": "Icon-40~ipad.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "40x40",
      "filename": "Icon-40~ipad@2x.png"
    },
    {
      "idiom": "ipad",
      "scale": "1x",
      "size": "76x76",
      "filename": "Icon-76.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "76x76",
      "filename": "Icon-76@2x.png"
    },
    {
      "idiom": "ipad",
      "scale": "2x",
      "size": "83.5x83.5",
      "filename": "Icon-83.5@2x.png"
    },
    {
      "idiom": "ios-marketing",
      "scale": "1x",
      "size": "1024x1024",
      "filename": "Icon-1024.png"
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
EOF

echo ""
echo "All icons generated from ${ICON_SOURCE}"
