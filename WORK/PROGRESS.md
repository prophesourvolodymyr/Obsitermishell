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
  - [x] Complete Project organisation & file guides for AI.

- [x] **M2: Core Terminal Functionality** (Target: TBD)
  - [x] PTY controller implementation
  - [x] Terminal view with xterm.js
  - [x] Vault path resolver
  - [x] Basic terminal spawn and I/O

- [x] **M3: Multi-Session & Management** (Target: TBD)
  - [x] Terminal manager for multiple sessions
  - [x] Tab UI for session switching
  - [x] Session lifecycle management

- [x] **M4: Features & UX** (Target: TBD)
  - [x] Settings tab with profiles
  - [x] Auto-cd modes (vault root, active folder, sticky)
  - [x] Theming (light/dark mode)
  - [x] Search, copy, paste, clear

- [x] **M5: Packaging & Documentation** (Target: 2025-11-09) **COMPLETED**
  - [x] Rebuild scripts for node-pty
  - [x] Setup and packaging documentation (INSTALL.md)
  - [ ] QA testing and acceptance tests
  - [x] Mobile detection and friendly notice (TerminalView.ts)
- [x] M6: Small changes & improvements **COMPLETED**
	- [x] Add the Gear Button near the + on the terminal UI.
	- [x] Add the Report bug button besides the banner button
	- [x] Remove the REPO Button
	- [x] Add customize button that goes to settings so people can change theme.
	- [x] Remove the setting to change the button links.
	- [x] Change the donate button to Buy me a coffee
	- [x] Add coffee banner with toggle setting "No Coffee?🥺"
	- [x] Make Profiles functional
		- [x] Move the profile setting to the top of the settings.
		- [x] Fix the tab naming in profiles to use profile names.
	- [x] Fix the Full theme change in banners
	- [x] Check if all of the buttons follow the UI rules of themes.
	- [x] Fix race condition errors for destroyed PTY sessions
	- [x] ADD THE BACKGORUND  IMAGE SET OPTION
	- [ ] USER ONLY: Fix the ASCII logo bugs manually.
- [ ] M7: Release 
	- [ ] Create the READMD File for Git release
	- [ ] Create a comprehensive Guides for settings
	- [ ] Create an Release guide for user in [[USER GUIDE]] to release the plugin onto the obsodian platform
	- [ ] Release(USER)
---
## 📋 IDEAS Backlog

### High Priority
- Persist guide overlay dismissal state per user
- Add automation tests / QA checklist execution for new cursor animations
- Document cursor animation API for contributors

### Medium Priority
- Add per-profile cursor/theme overrides
- Implement session restore on startup
- Context menu enhancements (copy, paste, split view)
- Evaluate mobile/remote terminal feasibility document

### Low Priority
- "Run selection in terminal" feature (disabled by default)
- Additional ASCII animation presets for banner
- Optional remote PTY connector (SSH/WebSocket)

---

## 🚧 In-Progress

**Current Task:** Polish onboarding + cursor animation presets
**Started:** 2025-11-11

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
| 2025-11-11 | Restored terminal banner + onboarding overlay | DOM wrapper now includes ASCII logo + guide cards |
| 2025-11-11 | Added premium cursor animations & text color controls | 10 Ghostty-style cursor presets, custom foreground + accent settings |
| 2025-11-12 | **M6 COMPLETED: UI improvements and refinements** | Added gear button, updated banner buttons, removed link settings, reordered profile settings, fixed tab naming |
| 2025-11-12 | Fixed PTY session lifecycle race conditions | Added proper alive() checks to prevent operations on destroyed sessions |
| 2025-11-12 | Converted coffee banner to toggle setting | Changed from dismissible popup to settings toggle with "Show coffee banner" option |
| 2025-11-12 | Enhanced button theme adaptation | Ensured all buttons follow UI theme CSS variable rules for consistent theming |
| 2025-11-12 | **Added custom background image feature** | Users can upload images, adjust opacity (0-1), preview in settings. Background with overlay for opacity control |
| 2025-11-12 | Documented user TODO logging rules | Updated `WORK/CODEBASE- GENERAL-AI-GUIDE.md` to clarify that AI must write user-only tasks into `WORK/USER TODO.md` |
