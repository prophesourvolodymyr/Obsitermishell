#!/bin/bash
# Rebuild node-pty for Obsidian's Electron version

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
DAEMON_DIR="$PROJECT_ROOT/daemon"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Rebuilding node-pty for Obsidian's Electron version...${NC}"

# Check if daemon directory exists
if [ ! -d "$DAEMON_DIR" ]; then
    echo -e "${RED}Error: daemon directory not found at $DAEMON_DIR${NC}"
    exit 1
fi

cd "$DAEMON_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing daemon dependencies...${NC}"
    npm install
fi

# Get Obsidian's Electron version (25.8.4 as of current Obsidian)
ELECTRON_VERSION="25.8.4"

echo -e "${YELLOW}Rebuilding node-pty for Electron ${ELECTRON_VERSION}...${NC}"

# Rebuild node-pty for Electron
npx @electron/rebuild -f -w node-pty -v "$ELECTRON_VERSION"

echo -e "${GREEN}✓ node-pty rebuilt successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy the plugin to your Obsidian vault: .obsidian/plugins/obsitermishell/"
echo "2. Reload the plugin in Obsidian"
echo "3. The daemon will start automatically when the plugin loads"
