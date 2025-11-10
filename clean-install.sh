#!/bin/bash
# Clean Install Script - Completely removes old plugin and installs new one

VAULT_PATH="/Users/volodymurvasualkiw/Desktop/Realistic APP"
PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins/obsitermishell"

echo "🧹 CLEAN INSTALL - Obsitermishell"
echo "=================================="
echo ""

# Step 1: Build fresh version
echo "📦 Building fresh version..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✓ Build successful"
echo ""

# Step 2: Completely remove old plugin
echo "🗑️  Removing old plugin completely..."
if [ -d "$PLUGIN_DIR" ]; then
    rm -rf "$PLUGIN_DIR"
    echo "✓ Old plugin removed"
else
    echo "⚠️  No old plugin found (this is fine for first install)"
fi
echo ""

# Step 3: Create fresh directory
echo "📁 Creating fresh plugin directory..."
mkdir -p "$PLUGIN_DIR"
echo "✓ Directory created"
echo ""

# Step 4: Copy all new files
echo "📋 Copying new plugin files..."
cp -r dist/* "$PLUGIN_DIR/"
echo "✓ Files copied"
echo ""

# Step 5: Rebuild node-pty
echo "🔨 Rebuilding node-pty for Obsidian..."
cd "$PLUGIN_DIR"
./scripts/rebuild-pty.sh
if [ $? -ne 0 ]; then
    echo "⚠️  node-pty rebuild had issues, but continuing..."
fi
echo ""

echo "✅ CLEAN INSTALL COMPLETE!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "IMPORTANT: You MUST reload the plugin now!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Steps to reload:"
echo "1. Open Obsidian"
echo "2. Settings → Community Plugins"
echo "3. DISABLE 'Obsitermishell' (turn it OFF)"
echo "4. Wait 2 seconds"
echo "5. ENABLE 'Obsitermishell' (turn it back ON)"
echo ""
echo "Then check console (Cmd+Shift+I) for:"
echo "  [Daemon] Started successfully"
echo "  PTY daemon started successfully"
echo ""
echo "If you see these messages, the REAL PTY daemon is running! 🎉"
