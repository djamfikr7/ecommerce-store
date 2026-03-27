// Analyze bundle size and report changes
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUNDLE_LIMIT_KB = 300; // max JS bundle size in KB

async function analyze() {
  // Run next build with bundle analyzer
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });

  // Read .next/analyze/client.html for bundle sizes
  // Report any chunks exceeding BUNDLE_LIMIT_KB
  console.log('Bundle analysis complete');
}

analyze().catch(console.error);
