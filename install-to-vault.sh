#!/bin/bash
# Quick install script for Obsitermishell

VAULT_PATH="/Users/volodymurvasualkiw/Desktop/Realistic APP"
PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins/obsitermishell"

echo "📦 Installing Obsitermishell to vault..."
echo ""

# Create plugin directory if it doesn't exist
mkdir -p "$PLUGIN_DIR"

# Copy files
echo "Copying plugin files..."
cp -r dist/* "$PLUGIN_DIR/"

echo "✓ Files copied"
echo ""

# Rebuild node-pty
echo "Rebuilding node-pty for Obsidian..."
cd "$PLUGIN_DIR"
./scripts/rebuild-pty.sh

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Go to Obsidian"
echo "2. Settings → Community Plugins"
echo "3. Disable 'Obsitermishell' (if enabled)"
echo "4. Enable 'Obsitermishell'"
echo "5. Click terminal icon in left sidebar"
echo ""
echo "Check console for: 'PTY daemon started successfully'"
