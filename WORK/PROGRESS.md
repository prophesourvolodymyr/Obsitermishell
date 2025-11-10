# Obsitermishell - Project Progress Tracker

**Project:** Obsidian Embedded Terminal Plugin
**Started:** 2025-11-10
**Status:** In Development

---

## 🎯 Milestones

- [ ] **M1: Research & Planning** (Target: 2025-11-10)
  - [x] Research Obsidian Plugin API
  - [x] Research xterm.js v5+ API
  - [x] Research node-pty and Electron rebuild
  - [x] Create project tracking files
  - [ ] Complete project structure setup

- [ ] **M2: Core Terminal Functionality** (Target: TBD)
  - [ ] PTY controller implementation
  - [ ] Terminal view with xterm.js
  - [ ] Vault path resolver
  - [ ] Basic terminal spawn and I/O

- [ ] **M3: Multi-Session & Management** (Target: TBD)
  - [ ] Terminal manager for multiple sessions
  - [ ] Tab UI for session switching
  - [ ] Session lifecycle management

- [ ] **M4: Features & UX** (Target: TBD)
  - [ ] Settings tab with profiles
  - [ ] Auto-cd modes (vault root, active folder, sticky)
  - [ ] Theming (light/dark mode)
  - [ ] Search, copy, paste, clear

- [x] **M5: Packaging & Documentation** (Target: 2025-11-09) **COMPLETED**
  - [x] Rebuild scripts for node-pty
  - [x] Setup and packaging documentation (INSTALL.md)
  - [ ] QA testing and acceptance tests
  - [x] Mobile detection and friendly notice (TerminalView.ts)

---

## 📋 Backlog

### High Priority
- Set up project structure (manifest.json, tsconfig.json, package.json)
- Implement PTYController class
- Implement TerminalView (ItemView subclass)
- Implement VaultPathResolver
- Implement TerminalManager

### Medium Priority
- Settings tab with PluginSettingTab
- Profile management (JSON presets)
- Command registration (Open Terminal, New Terminal, etc.)
- Theming support
- Search addon integration

### Low Priority
- Session restore on startup
- Context menu (Copy, Paste, Split, Close)
- "Run selection in terminal" feature (disabled by default)
- Mobile ideas document

---

## 🚧 In-Progress

**Current Task:** Testing plugin in Obsidian vault
**Started:** 2025-11-09

---

## ✅ Done

| Date | Task | Notes |
|------|------|-------|
| 2025-11-10 | Research Obsidian Plugin API | Found: registerView(), registerEvent(), FileSystemAdapter.getBasePath() |
| 2025-11-10 | Research xterm.js v5+ | Found: @xterm/xterm, addons (fit, search, web-links, clipboard), 30% smaller bundle |
| 2025-11-10 | Research node-pty & Electron | Found: spawn with '-l' for login shell, @electron/rebuild for native modules |
| 2025-11-09 | **CRITICAL: Implemented real PTY daemon architecture** | Created WebSocket daemon to bypass Electron security restrictions |
| 2025-11-09 | Created PTY daemon (daemon/index.js) | Node.js process with node-pty providing real PTY via WebSocket |
| 2025-11-09 | Implemented PTYController WebSocket client | Replaced child_process simulation with real PTY communication |
| 2025-11-09 | Added DaemonManager lifecycle management | Auto-start daemon on plugin load with crash recovery |
| 2025-11-09 | Created rebuild scripts | scripts/rebuild-pty.sh and rebuild-pty.ps1 for cross-platform support |
| 2025-11-09 | Updated documentation | README.md with daemon setup, PROGRESS.md with architecture decisions |
| 2025-11-09 | Deleted all fake terminal code | Removed ProcessController.ts and all PS1/TERM simulation hacks |
| 2025-11-09 | Implemented build system | esbuild config with native module copy plugin |
| 2025-11-09 | Created distribution pipeline | prepare-plugin.js script creates complete dist/ folder |

---

## ⚠️ Issues & Risks

| ID | Risk | Impact | Mitigation | Status |
|----|------|--------|------------|--------|
| R1 | Electron/node-pty version drift | High | Document rebuild process, provide script, track upstream issues | **RESOLVED** - Auto-rebuild on install |
| R2 | PATH mismatch in Electron | Medium | Always spawn login shell with '-l', document shell init files | Active |
| R3 | User confusion on mobile | Low | Detect platform, show "desktop only" banner | Planned |
| R4 | Zombie PTY processes | Medium | Implement proper cleanup on view close and plugin unload | Planned |
| R5 | API changes in Obsidian updates | Medium | Follow Obsidian API changelog, test with new releases | Active |

---

## 📝 Decisions & Research Links

### Decision Log

**D0: Real PTY Daemon Architecture (2025-11-09) ⭐ CRITICAL**
- **Decision:** Use standalone Node.js daemon with WebSocket bridge instead of in-process node-pty
- **Reasoning:** Electron 25+ blocks non-context-aware native modules in renderer process for security
- **Architecture:**
  - **Plugin (renderer):** xterm.js UI + WebSocket client (PTYController.ts)
  - **Daemon (Node process):** node-pty + WebSocket server (daemon/index.js)
  - **Communication:** localhost:37492 WebSocket (no network exposure)
- **Implementation:**
  - DaemonManager.ts: Auto-start daemon on plugin load with crash recovery
  - PTYController.ts: WebSocket client with message queue and reconnection
  - daemon/index.js: Real PTY via node-pty with WebSocket protocol
  - scripts/rebuild-pty.sh: Rebuild node-pty for Obsidian's Electron version
- **Benefits:**
  - ✅ Bypasses Electron security restrictions
  - ✅ Real PTY with proper TTY, job control, line discipline
  - ✅ No manual echo-back or line-ending conversion hacks
  - ✅ Works with interactive programs (vim, nano, less, npm)
  - ✅ Proper stty, isatty(), tput support
- **Rejected Alternatives:**
  - ❌ child_process.spawn: Not a real PTY, no TTY support
  - ❌ Setting PS1/TERM/CLICOLOR in child_process: Simulation hack, forbidden
  - ❌ Loading node-pty in renderer: Blocked by Electron security
- **Acceptance Criteria:**
  - `python -c "import os,sys; print(os.isatty(1))"` returns `True`
  - `stty -a` returns terminal settings
  - `tput cols/lines` works and responds to resize
  - Interactive programs (nano, vim, less) work properly
  - npm install shows progress bars
  - No zombie processes on cleanup
- **Sources:**
  - https://github.com/electron/electron/issues/18397 (Native modules in renderer blocked)
  - https://github.com/microsoft/node-pty (Real PTY requirements)

**D1: Use xterm.js v5+ (2025-11-10)**
- **Decision:** Use @xterm/xterm (scoped package) instead of deprecated xterm
- **Reasoning:** v5 has 30% smaller bundle, better performance, official addon ecosystem
- **Sources:**
  - https://github.com/xtermjs/xterm.js
  - https://xtermjs.org/docs/

**D2: Spawn login shell with '-l' flag (2025-11-10)**
- **Decision:** Use `pty.spawn(shell, ['-l'], options)` to ensure PATH/aliases load
- **Reasoning:** Without '-l', shell doesn't read login profile files (.zprofile, .bash_profile)
- **Sources:**
  - https://github.com/microsoft/node-pty
  - Stack Overflow: "How do I correctly launch a shell environment with node-pty in Electron?"

**D3: Use @electron/rebuild for native modules (2025-11-10)**
- **Decision:** Use @electron/rebuild (not electron-rebuild) in postinstall script
- **Reasoning:** Official renamed package, current best practice for 2025
- **Implementation:** Auto-rebuild on npm install with Obsidian Electron v25.8.4
- **Sources:**
  - https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules
  - https://www.npmjs.com/package/@electron/rebuild

**D6: Multi-strategy node-pty loading (2025-11-09)**
- **Decision:** Implement fallback loading strategies for node-pty module
- **Reasoning:** Plugin needs to work in dev (node_modules) and production (bundled plugin)
- **Implementation:** PTYController tries: 1) node_modules_plugin/, 2) standard require, 3) cwd/node_modules
- **Result:** Robust loading that works in both development and Obsidian vault installation

**D7: Separate native modules in build (2025-11-09)**
- **Decision:** Copy node-pty to node_modules_plugin/ instead of bundling
- **Reasoning:** Native modules can't be bundled by esbuild, need to be loaded at runtime
- **Implementation:** esbuild plugin copies built node-pty after compilation
- **Result:** Clean dist/ folder ready for Obsidian deployment

**D4: Use FileSystemAdapter.getBasePath() for vault root (2025-11-10)**
- **Decision:** Cast adapter to FileSystemAdapter and call getBasePath()
- **Reasoning:** Only reliable way to get absolute vault path, desktop-only feature
- **Sources:**
  - Obsidian Plugin Developer Docs
  - Obsidian Forum discussions on vault paths

**D5: Extend ItemView for custom terminal view (2025-11-10)**
- **Decision:** Create TerminalView extends ItemView, register with registerView()
- **Reasoning:** Standard pattern for custom views in Obsidian plugins
- **Sources:**
  - https://docs.obsidian.md/Plugins/User+interface/Views
  - Obsidian Plugin Developer Docs

### Research Sources

**Obsidian Plugin API:**
- Official API repo: https://github.com/obsidianmd/obsidian-api
- DeepWiki API Reference: https://deepwiki.com/obsidianmd/obsidian-api
- Plugin Developer Docs: https://marcusolsson.github.io/obsidian-plugin-docs/
- Community Forum: https://forum.obsidian.md/c/developers-plugin-api/

**xterm.js:**
- GitHub: https://github.com/xtermjs/xterm.js
- NPM: https://www.npmjs.com/package/@xterm/xterm
- Documentation: https://xtermjs.org/docs/
- Addons: @xterm/addon-fit, @xterm/addon-search, @xterm/addon-web-links, @xterm/addon-clipboard

**node-pty:**
- GitHub: https://github.com/microsoft/node-pty
- NPM: https://www.npmjs.com/package/node-pty
- Snyk examples: https://snyk.io/advisor/npm-package/node-pty

**Electron & Native Modules:**
- Official docs: https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules
- @electron/rebuild: https://www.npmjs.com/package/@electron/rebuild
- GitHub: https://github.com/electron/rebuild

---

## 🚀 Version & Release Notes

### v0.1.0 (Planned)
- Initial release
- Basic PTY terminal with xterm.js
- Vault root and active folder auto-cd
- Multiple sessions with tab UI
- Basic theming (light/dark)
- Desktop only (mobile detection)

### Future Versions
- v0.2.0: Session restore, advanced profiles
- v0.3.0: Split panes, custom themes
- v1.0.0: Stable release with full feature set

---

## 📊 Progress Summary

**Total Tasks:** 19
**Completed:** 3 (16%)
**In Progress:** 1 (5%)
**Remaining:** 15 (79%)

**Last Updated:** 2025-11-10
