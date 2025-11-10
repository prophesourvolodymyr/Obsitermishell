# Obsitermishell - Quick Start for AI Code Assistants

**Purpose:** Get any AI/code assistant productive with this codebase in minutes.

---

## ⚡ Quick Checklist

Before you start working:
- [ ] If Electron version changed → run `npm run rebuild`
- [ ] Verify $SHELL environment variable is set
- [ ] Confirm `FileSystemAdapter.getBasePath()` returns absolute path (desktop only)
- [ ] Check that xterm.js and node-pty versions are compatible
- [ ] Review PROGRESS.md for current status and decisions

---

## 📁 Repository Map

### Key Files & Architecture

```
Obsitermishell/
├── src/
│   ├── main.ts                    # Plugin entry point (extends Plugin)
│   ├── TerminalView.ts            # Custom view (extends ItemView)
│   ├── PTYController.ts           # PTY process manager (node-pty wrapper)
│   ├── TerminalManager.ts         # Multi-session manager
│   ├── VaultPathResolver.ts       # Path resolution for vault/notes
│   ├── SettingsTab.ts             # Settings UI (extends PluginSettingTab)
│   ├── types.ts                   # TypeScript interfaces and types
│   └── utils/
│       ├── shell-detector.ts      # Detect default shell (POSIX/Windows)
│       ├── theme-manager.ts       # xterm.js theme sync with Obsidian
│       └── platform-detector.ts   # Desktop vs mobile detection
├── styles.css                     # Terminal styling
├── manifest.json                  # Obsidian plugin manifest
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── esbuild.config.mjs             # Build configuration
├── rebuild.sh                     # Electron rebuild script
├── PROGRESS.md                    # Project tracker (UPDATE THIS!)
└── CODEBASE-Quick Start.md        # This file
```

---

## 🏗️ Architecture Overview

### Component Responsibilities

**main.ts (Plugin Entry)**
- Registers custom terminal view type
- Creates commands (Open Terminal, New Terminal, etc.)
- Manages plugin lifecycle (onload, onunload)
- Initializes TerminalManager
- Registers settings tab

**TerminalView.ts (extends ItemView)**
- Mounts xterm.js Terminal instance
- Wires xterm ↔ PTY bidirectional I/O
- Handles resize, search, copy/paste, clear
- Implements tab UI for sessions
- Manages view lifecycle

**PTYController.ts**
- Spawns shell with `pty.spawn(shell, ['-l'], options)`
- Provides `write(data)`, `resize(cols, rows)`, `kill()` methods
- Emits `data`, `exit` events
- Handles UTF-8, environment variables

**TerminalManager.ts**
- Creates and tracks multiple terminal sessions
- Provides session lifecycle (create, activate, close)
- Handles session restoration (optional)
- Manages session IDs and metadata

**VaultPathResolver.ts**
- Detects desktop environment (FileSystemAdapter check)
- Gets vault root via `getBasePath()`
- Resolves active note's parent folder
- Provides paths for auto-cd modes

**SettingsTab.ts (extends PluginSettingTab)**
- Shell path configuration
- Default CWD mode (vault root / active folder / sticky)
- Scrollback limit, font size
- Profile editor (add/edit/remove profiles)

---

## 🛠️ Build & Run Commands

```bash
# Install dependencies
npm install

# Build plugin
npm run build

# Watch mode (development)
npm run dev

# Rebuild node-pty after Electron update
npm run rebuild

# Type check
npm run check

# Format code
npm run format
```

---

## 🔧 Environment Assumptions

### Required Environment
- **Node.js:** v18+ (for @electron/rebuild)
- **Obsidian:** Desktop app (macOS, Windows, Linux)
- **Electron:** Version must match Obsidian's Electron version
- **TypeScript:** 5.x
- **Build Tool:** esbuild

### Key Dependencies
```json
{
  "dependencies": {
    "@xterm/xterm": "^5.x",
    "@xterm/addon-fit": "^0.10.x",
    "@xterm/addon-search": "^0.15.x",
    "@xterm/addon-web-links": "^0.11.x",
    "node-pty": "^1.x"
  },
  "devDependencies": {
    "@electron/rebuild": "^3.x",
    "obsidian": "latest",
    "typescript": "^5.x",
    "esbuild": "^0.23.x"
  }
}
```

---

## 🎨 Feature Flags & Modes

### Auto-CD Modes (in settings)
- **Vault Root** (default): Terminal starts in vault root directory
- **Active Folder**: Terminal follows active note's parent folder
- **Sticky/Manual**: No auto-cd after spawn

### Profile System
Profiles are JSON presets:
```typescript
{
  id: string,
  name: string,
  init: string,      // Commands to run on spawn (e.g., "claude code")
  cwdMode: 'vault' | 'active' | 'sticky'
}
```

### Theme Sync
- Automatically syncs with Obsidian's light/dark mode
- Uses xterm.js theme API
- Updates on `theme-change` event

---

## 📝 Coding Conventions

### TypeScript Style
- Use strict mode (`strict: true`)
- Prefer interfaces over types for public APIs
- Use async/await over Promises
- Event handlers: arrow functions to preserve `this`

### Naming Conventions
- Classes: PascalCase (e.g., `TerminalView`)
- Methods: camelCase (e.g., `spawnTerminal`)
- Constants: UPPER_SNAKE_CASE (e.g., `VIEW_TYPE_TERMINAL`)
- Private members: prefix with `_` (e.g., `_ptyProcess`)

### Error Handling
- Always handle PTY spawn failures (ENOENT, EACCES)
- Show user-friendly notices for errors
- Log errors to console with context
- Never crash on PTY exit

### Event Cleanup
- Use `this.registerEvent()` for Obsidian events
- Use `this.registerDomEvent()` for DOM events
- Always kill PTY in `onClose()`
- Unload all terminals in plugin `onunload()`

---

## 🔍 How to Add a New Profile

1. **Update Types** (src/types.ts):
```typescript
export interface TerminalProfile {
  id: string;
  name: string;
  init: string;
  cwdMode: 'vault' | 'active' | 'sticky';
}
```

2. **Add to Settings** (src/SettingsTab.ts):
- Create profile editor UI
- Add profile to `settings.profiles` array
- Save settings with `this.plugin.saveSettings()`

3. **Use in TerminalManager** (src/TerminalManager.ts):
```typescript
createTerminalWithProfile(profile: TerminalProfile) {
  const terminal = this.createTerminal({ cwd: profile.cwdMode });
  terminal.pty.write(profile.init + '\n');
}
```

4. **Register Command** (src/main.ts):
```typescript
this.addCommand({
  id: 'new-terminal-with-profile',
  name: 'New Terminal with Profile...',
  callback: () => this.showProfilePicker()
});
```

---

## 🐛 Troubleshooting

### node-pty Issues

**Error: "Cannot find module '../build/Debug/pty.node'"**
- **Cause:** node-pty not rebuilt for Electron
- **Fix:** Run `npm run rebuild`

**PATH is incomplete in terminal**
- **Cause:** Shell not started as login shell
- **Fix:** Verify spawn uses `['-l']` argument
- **Check:** Shell init files (.zprofile, .bash_profile, .config/fish/config.fish)

### Obsidian API Issues

**getBasePath() returns undefined**
- **Cause:** Running on mobile or adapter is not FileSystemAdapter
- **Fix:** Check platform, show "desktop only" message

**file-open event not firing**
- **Cause:** Event not registered with `this.registerEvent()`
- **Fix:** Use `this.registerEvent(this.app.workspace.on('file-open', ...))`

### xterm.js Issues

**Terminal doesn't resize**
- **Cause:** FitAddon not loaded or not called on resize
- **Fix:** Load `@xterm/addon-fit`, call `fitAddon.fit()` on container resize

**Colors look wrong**
- **Cause:** Theme not synced with Obsidian
- **Fix:** Listen for `theme-change` event, update xterm theme

---

## 🎯 Common Development Tasks

### Testing Auto-CD
1. Open terminal → check `pwd` is vault root
2. Open a note → check terminal cd's to note's folder (if active mode enabled)
3. Switch notes → verify cd happens
4. Create new terminal → verify starts in correct directory

### Testing Multiple Sessions
1. Open 5 terminals
2. Run different commands in each
3. Close middle terminal → verify others still work
4. Check memory usage (no leaks)
5. Close view → verify all PTYs exit

### Testing Theming
1. Switch Obsidian to light mode → verify terminal colors update
2. Switch to dark mode → verify terminal colors update
3. Change font size in settings → verify terminal updates

---

## 📚 Key APIs Reference

### Obsidian Plugin API
```typescript
// Register custom view
this.registerView(VIEW_TYPE, (leaf) => new TerminalView(leaf));

// Listen to workspace events
this.registerEvent(this.app.workspace.on('file-open', (file) => {...}));

// Get vault root (desktop only)
const adapter = this.app.vault.adapter;
if (adapter instanceof FileSystemAdapter) {
  const vaultRoot = adapter.getBasePath();
}
```

### xterm.js v5 API
```typescript
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';

const term = new Terminal({ ... });
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

term.onData((data) => pty.write(data));
pty.onData((data) => term.write(data));
```

### node-pty API
```typescript
import * as pty from 'node-pty';

const ptyProcess = pty.spawn(shell, ['-l'], {
  name: 'xterm-256color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

ptyProcess.onData((data) => term.write(data));
ptyProcess.onExit(({ exitCode, signal }) => {...});
```

---

## 🚨 Security Notes

- **Never auto-execute note content** without explicit user action
- **"Run selection in terminal"** must be disabled by default, explicit hotkey only
- **Validate shell paths** before spawning
- **Sanitize environment variables** if needed
- **No arbitrary code execution** from markdown

---

## 📖 Additional Resources

- **Obsidian Plugin Docs:** https://docs.obsidian.md/Plugins/Getting+started
- **Obsidian API Types:** https://github.com/obsidianmd/obsidian-api
- **xterm.js Docs:** https://xtermjs.org/docs/
- **node-pty Docs:** https://github.com/microsoft/node-pty
- **Electron Native Modules:** https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules

---

**Last Updated:** 2025-11-10
**Version:** 0.1.0-dev
