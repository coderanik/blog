#!/usr/bin/env bash
# Verify deployment has correct post count (no duplicate "faster" posts).
# Usage: ./scripts/verify-deployment.sh [BASE_URL]
# Example: ./scripts/verify-deployment.sh https://myblog.anikdas.me

set -e
BASE_URL="${1:-http://localhost:3000}"
ENDPOINT="${BASE_URL}/api/verify-posts"

echo "Checking: $ENDPOINT"
echo ""

RESPONSE=$(curl -sS "$ENDPOINT")
OK=$(echo "$RESPONSE" | grep -o '"ok":[^,]*' | cut -d: -f2)
TOTAL=$(echo "$RESPONSE" | grep -o '"totalPosts":[0-9]*' | cut -d: -f2)
FASTER_COUNT=$(echo "$RESPONSE" | grep -o '"fasterRelatedCount":[0-9]*' | cut -d: -f2)

if [ "$OK" = "true" ]; then
  echo "✅ Verification passed"
  echo "   Total posts: $TOTAL"
  echo "   Faster-related posts: $FASTER_COUNT (expected 1)"
  exit 0
else
  echo "❌ Verification failed"
  echo "$RESPONSE" | head -20
  exit 1
fi
