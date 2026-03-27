#!/bin/bash
# Health check script for monitoring
# Used by load balancers and uptime monitoring

set -e

ENDPOINT=${1:-"http://localhost:3000"}

echo "Health check: $ENDPOINT"

# Check HTTP status
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT")
if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
  echo "✓ Health check passed (HTTP $HTTP_CODE)"
  exit 0
else
  echo "✗ Health check failed (HTTP $HTTP_CODE)"
  exit 1
fi
