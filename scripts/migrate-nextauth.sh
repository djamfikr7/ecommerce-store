#!/bin/bash

# Script to migrate NextAuth v4 to v5 API calls
# Replaces getServerSession(authOptions) with auth()

echo "Migrating NextAuth v4 to v5 API..."

# Find all TypeScript files in src/app/api
find src/app/api -name "*.ts" -type f | while read -r file; do
  if grep -q "getServerSession\|authOptions" "$file"; then
    echo "Processing: $file"
    
    # Remove old imports
    sed -i "s/import { getServerSession } from 'next-auth'//g" "$file"
    sed -i "s/import { authOptions } from '@\/lib\/auth'//g" "$file"
    
    # Add new import if not present
    if ! grep -q "import { auth } from '@/lib/auth'" "$file"; then
      # Add import after the first import line
      sed -i "1a import { auth } from '@/lib/auth'" "$file"
    fi
    
    # Replace getServerSession(authOptions) with auth()
    sed -i "s/getServerSession(authOptions)/auth()/g" "$file"
    sed -i "s/await getServerSession(authOptions)/await auth()/g" "$file"
    
    # Clean up empty lines
    sed -i '/^$/N;/^\n$/D' "$file"
  fi
done

echo "Migration complete!"
