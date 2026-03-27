#!/bin/bash
# Preview deployment with Vercel
# Run after CI passes

set -e

echo "Deploying preview..."
VERCEL_URL=$(vercel --prod=false --token=$VERCEL_TOKEN --yes 2>/dev/null | grep 'https://' | head -1)
echo "Preview URL: $VERCEL_URL"

# Run smoke tests against preview
echo "Running smoke tests..."
curl -f "$VERCEL_URL" || { echo "Smoke test failed"; exit 1; }
curl -f "$VERCEL_URL/api/health" || { echo "Health check failed"; exit 1; }

echo "Preview deployed successfully: $VERCEL_URL"
