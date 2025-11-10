# Quick Fix Applied: Node.js Path Resolution

## Problem Fixed

**Error:** `spawn node ENOENT`

**Root Cause:** Electron's limited PATH doesn't include Node.js executable location.

**Solution:** Created `NodeFinder` utility that searches common Node.js installation paths.

## Changes Made

### 1. Created `src/utils/node-finder.ts`
- Searches common Node.js paths by platform (macOS, Windows, Linux)
- Falls back to `which node` / `where node` command
- Caches the result for performance

### 2. Updated `src/DaemonManager.ts`
- Uses `NodeFinder.findNodePath()` instead of hardcoded 'node'
- Shows which Node.js path is being used in console
- Better error message if Node.js is not found

## How to Test

1. **Copy updated plugin to your vault:**
   ```bash
   cp -r dist/* "/Users/volodymurvasualkiw/Desktop/Realistic APP/.obsidian/plugins/obsitermishell/"
   ```

2. **Reload Obsidian plugin:**
   - Settings → Community Plugins → Disable "Obsitermishell"
   - Enable "Obsitermishell" again

3. **Check console for:**
   ```
   [Daemon] Using Node.js: /usr/local/bin/node
   [Daemon] Started successfully
   PTY daemon started successfully
   ```

4. **Open terminal:**
   - Click terminal icon in sidebar
   - Terminal should open without errors

## What the NodeFinder Checks

### macOS (in order)
1. `/usr/local/bin/node` (Homebrew Intel)
2. `/opt/homebrew/bin/node` (Homebrew Apple Silicon)
3. `~/.nvm/versions/node/*/bin/node` (nvm)
4. `/usr/bin/node` (System)
5. Falls back to `which node` command

### Windows
1. `C:\Program Files\nodejs\node.exe`
2. `C:\Program Files (x86)\nodejs\node.exe`
3. Falls back to `where node` command

### Linux
1. `/usr/bin/node`
2. `/usr/local/bin/node`
3. `~/.nvm/versions/node/*/bin/node`
4. Falls back to `which node` command

## If Node.js Still Not Found

If you see: `Terminal daemon failed: Node.js not found`

**Solution:**

1. **Check Node.js is installed:**
   ```bash
   node --version
   ```

2. **Find Node.js path:**
   ```bash
   which node  # macOS/Linux
   where node  # Windows
   ```

3. **Manual fix (temporary):**
   Edit `.obsidian/plugins/obsitermishell/daemon/index.js` first line:
   ```javascript
   #!/usr/bin/env node
   ```
   Change to absolute path:
   ```javascript
   #!/usr/local/bin/node  # or wherever your node is
   ```

4. **Or create symlink:**
   ```bash
   sudo ln -s /path/to/your/node /usr/local/bin/node
   ```

## Expected Console Output

**Before (❌ Broken):**
```
[Daemon] Starting daemon: /path/to/daemon/index.js
[Daemon] Failed to start: Error: spawn node ENOENT
[Daemon] Started successfully  # lies, it didn't actually start
PTY daemon started successfully
[PTYController] WebSocket connection to 'ws://127.0.0.1:37492/' failed
```

**After (✅ Fixed):**
```
[NodeFinder] Found node at: /usr/local/bin/node
[Daemon] Starting daemon: /path/to/daemon/index.js
[Daemon] Using Node.js: /usr/local/bin/node
[Daemon] Started successfully
PTY daemon started successfully
VaultPathResolver: Detected vault root: /path/to/vault
```

## Next Steps

Once daemon starts successfully, you can create terminals and run the acceptance tests from `ACCEPTANCE_TESTS.md`.
