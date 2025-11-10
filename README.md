# Obsitermishell 🐚

**Embedded terminal for Obsidian Desktop** — A real PTY terminal inside Obsidian that launches your login shell, starts in your vault directory, and runs any CLI tool exactly like VS Code's integrated terminal.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### Core Terminal Functionality
- ✅ **Real PTY Terminal** — Spawns your actual shell (bash, zsh, fish, PowerShell) with full PATH and aliases
- ✅ **Multiple Sessions** — Tab-based UI for managing multiple terminal sessions
- ✅ **Auto-CD Modes** — Terminal follows vault root or active note's folder
- ✅ **Login Shell** — Launches with `-l` flag so your environment loads correctly
- ✅ **UTF-8 & Colors** — Full support for colors, emojis, and UTF-8 characters
- ✅ **Search** — Find text in terminal output with Ctrl+F
- ✅ **Clickable Links** — URLs in terminal output are clickable
- ✅ **Large Scrollback** — Configurable history (default 10,000 lines)

### Smart Integration
- 🗂️ **Vault-Aware** — Auto-detects vault root via `FileSystemAdapter.getBasePath()`
- 📝 **Active Note Tracking** — Optional auto-cd to active note's parent folder
- 🎨 **Theme Sync** — Automatically matches Obsidian's light/dark mode
- ⚙️ **Profiles** — Save named configurations with init commands (e.g., "Claude Code", "Python REPL")
- 🖥️ **Desktop Only** — Friendly notice on mobile with feature ideas

### UX Polish
- ⌨️ **Commands & Hotkeys** — Open Terminal, New Terminal, Clear, Toggle Auto-CD, etc.
- 🎯 **Resize Handling** — Terminal auto-fits when pane is resized
- 🧹 **No Zombie PTYs** — Proper cleanup on view close and plugin unload
- 💬 **User-Friendly Errors** — Clear messages for spawn failures, not crashes

---

## 🚀 Installation

### From Community Plugins (Recommended - Coming Soon!)

Once approved in Obsidian Community Plugins:

1. Open Obsidian Settings → **Community Plugins**
2. Click **Browse** → Search for "**Obsitermishell**"
3. Click **Install** → Enable the plugin
4. Click the terminal icon in the sidebar to start!

> **Note:** The plugin is currently pending Community Plugin approval. Use "Install from Source" below in the meantime.

### From Source (Manual Installation)

#### Prerequisites
- **Obsidian Desktop** (macOS, Windows, or Linux)
- **Node.js v18+** (for building and running daemon)
- **Build Tools:**
  - macOS: Xcode Command Line Tools (`xcode-select --install`)
  - Windows: Visual Studio Build Tools or windows-build-tools
  - Linux: `build-essential` package

#### Install Steps

1. **Clone the repository:**
   ```bash
   cd /path/to/your/vault/.obsidian/plugins/
   git clone https://github.com/prophesourvolodymyr/Obsitermishell.git obsitermishell
   cd obsitermishell
   ```

2. **Install plugin dependencies:**
   ```bash
   npm install
   ```

3. **Install daemon dependencies:**
   ```bash
   cd daemon
   npm install
   cd ..
   ```

4. **Rebuild node-pty for Obsidian's Electron:**
   ```bash
   # macOS/Linux
   ./scripts/rebuild-pty.sh

   # Windows PowerShell
   .\scripts\rebuild-pty.ps1
   ```

5. **Build the plugin:**
   ```bash
   npm run build
   ```

6. **Enable the plugin in Obsidian:**
   - Settings → Community Plugins → Reload plugins
   - Enable "Obsitermishell"
   - The daemon will start automatically when the plugin loads

### Architecture

Obsitermishell uses a **real PTY daemon** architecture:

- **Plugin (Obsidian renderer):** UI with xterm.js, WebSocket client
- **Daemon (Node.js process):** Runs node-pty with real PTY capabilities
- **Communication:** Local WebSocket on `localhost:37492` (no network exposure)

This architecture bypasses Electron's security restrictions on native modules in the renderer process while providing a true PTY terminal experience.

### Post-Installation

If Obsidian updates (which may change Electron version):
```bash
cd /path/to/vault/.obsidian/plugins/obsitermishell
./scripts/rebuild-pty.sh  # or rebuild-pty.ps1 on Windows
```

---

## 📖 Usage

### Opening a Terminal

**Method 1:** Ribbon Icon
- Click the terminal icon in the left sidebar

**Method 2:** Command Palette
- Open command palette (Ctrl/Cmd+P)
- Search "Open Terminal"

**Method 3:** Hotkey
- Set a custom hotkey in Settings → Hotkeys → "Open Terminal"

### Creating Multiple Sessions

- Click the **"New"** button in terminal header
- Or use command: "New Terminal"
- Switch between sessions via tabs

### Auto-CD Modes

Configure in Settings → Obsitermishell → Behavior:

1. **Vault Root** (default)
   - Terminal always starts in vault root directory

2. **Active Note Folder**
   - Terminal follows the folder of the currently open note
   - Use "Toggle Auto-CD" command to enable/disable dynamically

3. **Sticky (Manual)**
   - Terminal stays in whatever directory you navigate to
   - No auto-cd after spawn

### Using Profiles

Profiles let you create terminals with predefined commands:

1. Go to Settings → Obsitermishell → Profiles
2. Click "Add Profile"
3. Configure:
   - **Name:** e.g., "Claude Code"
   - **Init Commands:** e.g., `claude code`
   - **Working Directory:** Vault Root / Active Folder / Sticky

4. Create terminal with profile:
   - Command: "New Terminal with Profile..."
   - Select your profile

### Example Profiles

```
Profile: Claude Code
Init: claude code
CWD: Vault Root

Profile: Python REPL
Init: python3
CWD: Active Folder

Profile: Git Status
Init: git status && git log --oneline -5
CWD: Vault Root
```

---

## ⚙️ Configuration

### Settings

Access via Settings → Obsitermishell

#### Shell
- **Shell Path:** Path to shell executable (auto-detects if empty)

#### Behavior
- **Default CWD Mode:** Vault Root / Active Folder / Sticky
- **Scrollback Buffer:** Lines to keep in history (default: 10,000)
- **Restore Sessions:** Restore terminals on startup (experimental)
- **Enable Search:** Search addon for Ctrl+F
- **Enable Web Links:** Make URLs clickable

#### Appearance
- **Font Size:** 10-24px (default: 14px)
- **Theme:** Auto-syncs with Obsidian light/dark mode

#### Profiles
- Create, edit, and delete terminal profiles

---

## 🛠️ Development

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch mode (development)
npm run dev

# Rebuild node-pty
npm run rebuild

# Type check
npm run check

# Format code
npm run format
```

### Project Structure

See [CODEBASE-Quick Start.md](CODEBASE-Quick%20Start.md) for detailed architecture.

```
src/
├── main.ts                    # Plugin entry point
├── TerminalView.ts            # Custom view with xterm.js
├── PTYController.ts           # WebSocket client for daemon
├── DaemonManager.ts           # Daemon lifecycle management
├── TerminalManager.ts         # Multi-session manager
├── VaultPathResolver.ts       # Vault path detection
├── SettingsTab.ts             # Settings UI
├── types.ts                   # TypeScript types
└── utils/
    ├── shell-detector.ts      # Shell detection
    ├── theme-manager.ts       # Theme sync
    └── platform-detector.ts   # Desktop/mobile detection

daemon/
├── index.js                   # PTY daemon (Node.js + node-pty)
└── package.json               # Daemon dependencies

scripts/
├── rebuild-pty.sh             # Rebuild script (macOS/Linux)
└── rebuild-pty.ps1            # Rebuild script (Windows)
```

---

## 🐛 Troubleshooting

### Common Issues

**Error: "Terminal daemon failed to start"**
- **Cause:** Daemon dependencies not installed or node-pty not rebuilt
- **Fix:**
  1. `cd daemon && npm install`
  2. Run `./scripts/rebuild-pty.sh` (or `.ps1` on Windows)
  3. Reload the plugin in Obsidian
- **Check:** Open DevTools console for daemon error messages

**Error: "Failed to connect to daemon"**
- **Cause:** Daemon not running or WebSocket connection failed
- **Fix:**
  1. Check console for daemon startup messages
  2. Verify port 37492 is not blocked by firewall
  3. Reload the plugin to restart daemon
- **Check:** `lsof -i :37492` (macOS/Linux) or `netstat -ano | findstr 37492` (Windows)

**Terminal not responding to input**
- **Cause:** WebSocket connection dropped
- **Fix:** Reload the plugin or create a new terminal session
- **Check:** Console for WebSocket errors

**Error: "Cannot find module '../build/Debug/pty.node'"**
- **Cause:** node-pty not rebuilt for Obsidian's Electron version
- **Fix:** Run `./scripts/rebuild-pty.sh` in plugin directory
- **Note:** This must be done in the `daemon/` subdirectory, not plugin root

**PATH is incomplete / aliases don't work**
- **Cause:** Shell not started as login shell
- **Fix:** The daemon starts shells with login flags by default. Check your shell init files:
  - bash: `~/.bash_profile` or `~/.profile`
  - zsh: `~/.zprofile`
  - fish: `~/.config/fish/config.fish`

**Terminal doesn't appear**
- **Cause:** Running on mobile or view failed to load
- **Fix:** Obsitermishell is desktop-only. Check console for errors.

**Terminal doesn't resize**
- **Cause:** PTY resize message not sent
- **Fix:** This should be automatic. Check console for errors.

**Vault root is undefined**
- **Cause:** FileSystemAdapter unavailable (unusual setup)
- **Fix:** Terminal will fallback to `$HOME`.

---

## 🎯 Roadmap

See [PROGRESS.md](PROGRESS.md) for detailed milestones.

### v0.1.0 (MVP) ✅
- [x] Core PTY terminal with xterm.js
- [x] Multiple sessions with tabs
- [x] Auto-cd modes (vault root, active folder)
- [x] Profiles with init commands
- [x] Settings tab
- [x] Theme sync
- [x] Desktop-only detection

### v0.2.0 (Planned)
- [ ] Session restore on startup
- [ ] Custom themes (not just light/dark)
- [ ] Split panes (horizontal/vertical)
- [ ] Context menu (right-click)
- [ ] "Run selection in terminal" (disabled by default)

### v0.3.0 (Future)
- [ ] Command history search
- [ ] Terminal scrollback export
- [ ] Custom keybindings
- [ ] Font family selection

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **[xterm.js](https://xtermjs.org/)** — Terminal emulator for the web
- **[node-pty](https://github.com/microsoft/node-pty)** — PTY bindings for Node.js
- **Obsidian** — For the amazing plugin API
- **VS Code** — Terminal UX inspiration

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/prophesourvolodymyr/Obsitermishell/issues)
- **Discussions:** [GitHub Discussions](https://github.com/prophesourvolodymyr/Obsitermishell/discussions)

---

**Made with 💙 for the Obsidian community**
