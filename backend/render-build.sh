#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Create credentials file from environment variable
echo "$GOOGLE_CREDENTIALS_BASE64" | base64 -d > credentials.json

# Verify file creation
if [ ! -f "credentials.json" ]; then
    echo "Error: credentials.json was not created"
    exit 1
fi

echo "Build completed successfully"