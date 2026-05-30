#!/bin/bash
set -euo pipefail

echo "==> Updating SkillVault macOS app..."
echo ""

echo "Pulling latest code..."
git pull

echo "Installing dependencies..."
npm install

echo "Packaging..."
scripts/package-macos.sh

echo ""
echo "Update complete! The new .app is in dist/SkillVault.app"
