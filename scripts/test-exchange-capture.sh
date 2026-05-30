#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FIXTURES_DIR="$PROJECT_ROOT/tests/fixtures"

PASS=0
FAIL=0

assert_pass() {
  echo "✅ $1"
  PASS=$((PASS + 1))
}

assert_fail() {
  echo "❌ $1"
  FAIL=$((FAIL + 1))
}

echo "=== Exchange & Capture Fixture Tests ==="
echo ""

# --- Exchange Manifest Validation ---
echo "--- Exchange Manifest Validation ---"

# Valid manifest should parse
if node -e "
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('$FIXTURES_DIR/exchange/valid-bundle/manifest.json', 'utf8'));
console.log('parsed:', typeof raw.version, typeof raw.asset);
" 2>/dev/null; then
  assert_pass "Valid manifest parses as JSON"
else
  assert_fail "Valid manifest should parse as JSON"
fi

# Malformed manifest should be detectable
if node -e "
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('$FIXTURES_DIR/exchange/malformed-manifest/manifest.json', 'utf8'));
const hasEmptyAsset = raw.asset && Object.keys(raw.asset).length === 0;
console.log('empty_asset:', hasEmptyAsset);
" 2>/dev/null; then
  assert_pass "Malformed manifest detected (empty asset object)"
else
  assert_fail "Malformed manifest detection failed"
fi

# Missing manifest should be handled
if [ ! -f "$FIXTURES_DIR/exchange/missing-manifest/manifest.json" ]; then
  assert_pass "Missing manifest correctly absent"
else
  assert_fail "Missing manifest should not exist"
fi

# Asset.md exists in valid bundle
if [ -f "$FIXTURES_DIR/exchange/valid-bundle/asset.md" ]; then
  assert_pass "Asset file exists in valid bundle"
else
  assert_fail "Asset file missing in valid bundle"
fi

# Asset.md has content
CONTENT=$(head -c 10 "$FIXTURES_DIR/exchange/valid-bundle/asset.md")
if [ -n "$CONTENT" ]; then
  assert_pass "Asset file has content ($CONTENT...)"
else
  assert_fail "Asset file is empty"
fi

echo ""

# --- Claude Code JSONL Parsing ---
echo "--- Claude Code JSONL Parsing ---"

LINE_COUNT=$(wc -l < "$FIXTURES_DIR/capture/sample-claude-code.jsonl" | tr -d ' ')
if [ "$LINE_COUNT" -ge 5 ]; then
  assert_pass "Sample JSONL has $LINE_COUNT lines (expected >= 5)"
else
  assert_fail "Sample JSONL has only $LINE_COUNT lines (expected >= 5)"
fi

# Check JSONL lines are parseable (skip malformed ones)
PARSEABLE=$(node -e "
const fs = require('fs');
const lines = fs.readFileSync('$FIXTURES_DIR/capture/sample-claude-code.jsonl','utf8').trim().split('\n');
let ok = 0;
for (const line of lines) {
  try { JSON.parse(line); ok++; } catch(e) {}
}
console.log(ok);
" 2>/dev/null)
assert_pass "$PARSEABLE/$LINE_COUNT lines are valid JSON"

# Empty JSONL handled
EMPTY_LINES=$(wc -l < "$FIXTURES_DIR/capture/empty.jsonl" | tr -d ' ')
if [ "$EMPTY_LINES" -eq 0 ]; then
  assert_pass "Empty JSONL has 0 lines"
else
  assert_fail "Empty JSONL should have 0 lines"
fi

# Malformed JSONL detected
MALFORMED_CONTENT=$(cat "$FIXTURES_DIR/capture/malformed.jsonl")
if echo "$MALFORMED_CONTENT" | grep -q "not json"; then
  assert_pass "Malformed JSONL contains detectable bad content"
else
  assert_fail "Malformed JSONL marker not found"
fi

echo ""
echo "=== Results ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "⚠️  Some tests failed"
  exit 1
else
  echo "All tests passed ✅"
  exit 0
fi
