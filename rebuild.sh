#!/bin/bash

# Obsitermishell - Electron Rebuild Script
# This script rebuilds native modules (node-pty) for the current Electron version

set -e

echo "🔧 Rebuilding native modules for Electron..."

# Get Obsidian's Electron version if possible
# Otherwise, use the version from package.json or latest
if command -v obsidian &> /dev/null; then
    echo "📦 Detecting Obsidian's Electron version..."
fi

# Run electron-rebuild
npx electron-rebuild -f -w node-pty

echo "✅ Rebuild complete!"
echo ""
echo "If you encounter issues:"
echo "  1. Verify Electron version matches Obsidian's Electron"
echo "  2. Check node-gyp is installed: npm install -g node-gyp"
echo "  3. On Windows, ensure Visual Studio Build Tools are installed"
echo "  4. On macOS, ensure Xcode Command Line Tools are installed"
