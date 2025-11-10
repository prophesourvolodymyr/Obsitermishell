# QA Checklist

Quality assurance checklist for **Obsitermishell** based on acceptance tests.

---

## ✅ Pre-Testing Setup

- [ ] Plugin installed in `.obsidian/plugins/obsitermishell/`
- [ ] Dependencies installed (`npm install`)
- [ ] Plugin built (`npm run build`)
- [ ] Native modules rebuilt (`npm run rebuild`)
- [ ] Plugin enabled in Obsidian settings
- [ ] Obsidian restarted after installation

---

## 🖥️ Platform Testing

### Desktop (Required)
- [ ] macOS (Intel)
- [ ] macOS (Apple Silicon M1/M2)
- [ ] Windows 10/11
- [ ] Linux (Ubuntu/Debian)
- [ ] Linux (Fedora/RHEL)

### Mobile (Expected to Show Notice)
- [ ] iOS — Shows "Desktop Only" notice
- [ ] Android — Shows "Desktop Only" notice

---

## 🔧 Basic Functionality

### Terminal Spawn
- [ ] Terminal opens via ribbon icon
- [ ] Terminal opens via command palette ("Open Terminal")
- [ ] Terminal spawns shell successfully
- [ ] Shell prompt appears within 1 second
- [ ] Terminal accepts keyboard input
- [ ] Commands execute correctly (e.g., `ls`, `pwd`, `echo hello`)
- [ ] Output displays with correct formatting

### Multiple Sessions
- [ ] Create 2+ terminals via "New Terminal" command
- [ ] Tabs appear in terminal header
- [ ] Clicking tab switches active terminal
- [ ] Each terminal maintains independent state
- [ ] Close tab with ✕ button works
- [ ] Closing tab kills PTY (no zombie processes)
- [ ] After closing middle tab, remaining tabs still work

### Session Lifecycle
- [ ] Create 5 terminals
- [ ] Check memory usage (no leaks)
- [ ] Close all terminals
- [ ] Create new terminal (session counter increments)
- [ ] Close terminal view → all PTYs killed
- [ ] Reopen terminal view → clean slate

---

## 📂 Vault Path Detection

### Vault Root Mode
- [ ] Open terminal (default mode: Vault Root)
- [ ] Run `pwd` → shows vault root path
- [ ] Path matches Obsidian vault location
- [ ] Create file in vault via terminal → appears in Obsidian
- [ ] Works on macOS, Windows, Linux

### Active Folder Mode
- [ ] Change setting to "Active Note Folder"
- [ ] Open a note in subdirectory (e.g., `Notes/Projects/project.md`)
- [ ] Open terminal → `pwd` shows `Notes/Projects/`
- [ ] Switch to note in different folder (e.g., `Archive/old.md`)
- [ ] Toggle "Auto-CD" on
- [ ] Terminal should cd to `Archive/`
- [ ] Verify via `pwd`

### Sticky Mode
- [ ] Change setting to "Sticky (Manual)"
- [ ] Open terminal → `pwd` shows vault root (initial)
- [ ] Manually `cd` to different directory
- [ ] Open different note
- [ ] Terminal stays in manually set directory (doesn't auto-cd)

### Edge Cases
- [ ] Vault root with spaces in path → terminal handles correctly
- [ ] Note in vault root (not subdirectory) → terminal stays in vault root
- [ ] Note in deeply nested folder (`a/b/c/d/note.md`) → cd works
- [ ] FileSystemAdapter unavailable (mobile) → shows notice, no crash

---

## 🐚 Shell & Environment

### Login Shell Verification
- [ ] Run `echo $PATH` → PATH is complete (includes user bins like `~/.local/bin`, `/usr/local/bin`)
- [ ] Custom aliases work (e.g., `alias ll='ls -la'` from `.zshrc`/`.bashrc`)
- [ ] Environment variables from profile loaded (e.g., `$EDITOR`, `$LANG`)

### Shell Detection
- [ ] macOS (zsh) — Auto-detects `/bin/zsh`
- [ ] macOS (bash) — Detects `/bin/bash` if `$SHELL` set
- [ ] Linux (bash) — Detects `/bin/bash`
- [ ] Linux (fish) — Detects `/usr/bin/fish`
- [ ] Windows — Detects PowerShell or CMD

### Custom Shell Path
- [ ] Set Settings → Shell Path to custom path (e.g., `/usr/local/bin/zsh`)
- [ ] Terminal spawns with custom shell
- [ ] Verify with `echo $SHELL` or `ps -p $$`

---

## 🎨 Theming

### Light/Dark Mode Sync
- [ ] Obsidian in dark mode → terminal uses dark theme
- [ ] Switch to light mode → terminal updates theme
- [ ] Colors are readable (foreground/background contrast)
- [ ] ANSI colors work (red, green, yellow, blue, etc.)

### Font Size
- [ ] Default font size is 14px
- [ ] Change Settings → Font Size to 18px
- [ ] Terminal text size increases
- [ ] Change to 10px → text size decreases
- [ ] Slider range: 10-24px works

---

## ⚙️ Settings

### Shell Settings
- [ ] Shell Path field works (text input)
- [ ] Auto-detect message shows detected shell
- [ ] Custom shell persists after Obsidian restart

### Behavior Settings
- [ ] Default CWD mode dropdown works (Vault Root / Active Folder / Sticky)
- [ ] Scrollback buffer accepts numbers (e.g., 5000, 20000)
- [ ] Invalid scrollback (e.g., -100) → ignored or fallback
- [ ] Restore sessions toggle works (save & load)
- [ ] Enable search toggle works
- [ ] Enable web links toggle works

### Appearance Settings
- [ ] Font size slider updates in real-time
- [ ] Font size persists after restart

### Profiles
- [ ] Add new profile → profile appears in list
- [ ] Edit profile name → updates correctly
- [ ] Edit init commands (e.g., `python3`) → saves
- [ ] Delete profile → removed from list
- [ ] Cannot delete "Default" profile (button disabled/hidden)
- [ ] Create terminal with profile → init command runs

---

## 🎯 Commands

### Command Palette
- [ ] "Open Terminal" — Opens terminal view
- [ ] "New Terminal" — Creates new session
- [ ] "New Terminal with Profile..." — Shows profile picker (if profiles exist)
- [ ] "Clear Terminal" — Clears active terminal screen
- [ ] "Toggle Auto-CD" — Shows notice, enables/disables auto-cd
- [ ] "Focus Terminal" — Activates terminal view

### Hotkeys
- [ ] Set hotkey for "Open Terminal" (e.g., Ctrl+`)
- [ ] Hotkey triggers terminal open
- [ ] Hotkey works from editor, settings, anywhere in Obsidian

---

## 📋 Profiles

### Create Profile
- [ ] Settings → Profiles → Add Profile
- [ ] Set name: "Claude Code"
- [ ] Set init: `claude code`
- [ ] Set CWD mode: Vault Root
- [ ] Save → profile appears

### Use Profile
- [ ] Command: "New Terminal with Profile..."
- [ ] Select profile (or auto-uses first non-default)
- [ ] Terminal spawns
- [ ] Init command (`claude code`) runs automatically
- [ ] CWD mode is respected

### Multiple Profiles
- [ ] Create 3 profiles (e.g., "Python", "Git", "n8n")
- [ ] All appear in settings
- [ ] Each has distinct init commands
- [ ] Using each profile runs correct command

---

## 🔍 Search & Features

### Search Addon
- [ ] Settings → Enable Search is ON
- [ ] Open terminal
- [ ] Run command with long output (e.g., `cat /etc/passwd`)
- [ ] Press Ctrl+F (or Cmd+F on macOS)
- [ ] Search bar appears
- [ ] Search for text (e.g., "root") → highlights matches
- [ ] Next/Previous buttons work
- [ ] Close search → highlights clear

### Web Links Addon
- [ ] Settings → Enable Web Links is ON
- [ ] Run command that outputs URL (e.g., `echo https://obsidian.md`)
- [ ] URL is underlined/highlighted
- [ ] Click URL → opens in default browser

### Scrollback
- [ ] Run command with 1000+ lines output (e.g., `seq 1 1000`)
- [ ] Scroll up to line 1
- [ ] Scrollback works smoothly
- [ ] Set scrollback to 100 in settings
- [ ] Run `seq 1 500` → only last ~100 lines visible

---

## 🧹 Cleanup & Edge Cases

### PTY Cleanup
- [ ] Create terminal
- [ ] Run long-running command (e.g., `sleep 100`)
- [ ] Close terminal tab → PTY killed (command stops)
- [ ] Check process list (e.g., `ps aux | grep sleep`) → no orphan

### Plugin Unload
- [ ] Create 3 terminals
- [ ] Disable plugin in settings
- [ ] All PTYs killed (no zombie processes)
- [ ] Re-enable plugin → clean state

### View Close
- [ ] Create terminal
- [ ] Close terminal pane (X button on pane)
- [ ] PTYs killed
- [ ] Reopen terminal → new session starts

### Obsidian Restart
- [ ] Create 2 terminals
- [ ] Restart Obsidian
- [ ] If "Restore Sessions" OFF → terminals gone
- [ ] If "Restore Sessions" ON → terminals restored (experimental)

---

## ⚠️ Error Handling

### Shell Spawn Failures
- [ ] Set shell path to invalid path (e.g., `/bin/notexist`)
- [ ] Try to open terminal
- [ ] User-friendly error notice appears (not crash)
- [ ] Console shows detailed error

### Permission Errors
- [ ] Set shell path to unexecutable file
- [ ] Try to open terminal
- [ ] Error notice shows (e.g., "EACCES: permission denied")

### PATH Issues
- [ ] Spawn terminal
- [ ] Run command not in PATH (e.g., `nonexistentcommand`)
- [ ] Shell shows "command not found" (expected behavior)
- [ ] Terminal doesn't crash

---

## 🚀 Performance

### Spawn Time
- [ ] Measure time from "Open Terminal" to prompt appears
- [ ] Should be < 1 second on modern hardware
- [ ] No noticeable lag

### Typing Latency
- [ ] Type rapidly in terminal
- [ ] Characters appear without lag
- [ ] No dropped characters

### Scrolling
- [ ] Output 10,000 lines (e.g., `seq 1 10000`)
- [ ] Scroll up and down
- [ ] Smooth scrolling (no stuttering)

### Memory
- [ ] Create 5 terminals
- [ ] Check Obsidian memory usage (DevTools → Memory)
- [ ] Close all terminals
- [ ] Memory released (no significant leaks)

---

## 🌐 Real-World CLI Usage

### Git
- [ ] Run `git status` → works
- [ ] Run `git log` → displays commits
- [ ] Run `git diff` → shows colored diff
- [ ] Colors display correctly

### Python
- [ ] Run `python3` → Python REPL starts
- [ ] Type `print("Hello")` → outputs "Hello"
- [ ] Exit with `exit()`

### Node.js / npm
- [ ] Run `node -v` → shows version
- [ ] Run `npm -v` → shows version

### AI CLIs (if installed)
- [ ] Run `claude code` (Anthropic CLI)
- [ ] Interactive session works
- [ ] Run `openai` (OpenAI CLI)
- [ ] Commands execute

### n8n / Other Tools
- [ ] Run `n8n start` (if installed)
- [ ] Output displays
- [ ] Ctrl+C stops process

---

## 📱 Mobile Detection

### iOS
- [ ] Open Obsidian on iOS
- [ ] Try to open terminal
- [ ] "Desktop Only" notice appears (no crash)

### Android
- [ ] Open Obsidian on Android
- [ ] Try to open terminal
- [ ] "Desktop Only" notice appears (no crash)

---

## 📝 Documentation

- [ ] README.md is complete and accurate
- [ ] SETUP.md covers installation on all platforms
- [ ] CODEBASE-Quick Start.md is helpful for developers
- [ ] PROGRESS.md is up-to-date
- [ ] QA_CHECKLIST.md (this file) is complete

---

## ✅ Final Checks

- [ ] All acceptance tests pass
- [ ] No console errors during normal usage
- [ ] Plugin works on at least 2 platforms (macOS, Windows, or Linux)
- [ ] Mobile detection works
- [ ] README installation instructions work
- [ ] Rebuild script works (`npm run rebuild`)
- [ ] Ready for release

---

**QA Passed:** ☐ Yes  ☐ No

**Tested By:** ___________________

**Date:** ___________________

**Notes:**
