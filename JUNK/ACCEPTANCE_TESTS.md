# Acceptance Tests for Real PTY Terminal

This document contains acceptance tests to verify that the terminal uses a real PTY (not simulated via child_process).

## Prerequisites

1. Plugin installed in Obsidian vault: `.obsidian/plugins/obsitermishell/`
2. Daemon dependencies installed: `cd .obsidian/plugins/obsitermishell/daemon && npm install`
3. node-pty rebuilt for Obsidian: Run `scripts/rebuild-pty.sh` (or `.ps1` on Windows)
4. Plugin enabled in Obsidian Settings → Community Plugins

## Test Suite

### ✅ Test 1: TTY Detection (isatty)

**Purpose:** Verify the terminal has a real TTY file descriptor

**Command:**
```bash
python -c "import os,sys; print(os.isatty(sys.stdout.fileno()))"
```

**Expected Output:**
```
True
```

**Why it matters:** If using child_process.spawn, this would return `False` because stdout would be a pipe, not a TTY.

---

### ✅ Test 2: Terminal Settings (stty)

**Purpose:** Verify terminal control settings are available

**Command:**
```bash
stty -a
```

**Expected Output:**
```
speed 38400 baud; rows 24; columns 80; line = 0;
intr = ^C; quit = ^\; erase = ^?; kill = ^U; ...
```

**Why it matters:** `stty` only works with real terminals. child_process would fail with "stty: stdin isn't a terminal".

---

### ✅ Test 3: Terminal Size Detection

**Purpose:** Verify terminal size is detected and updates on resize

**Commands:**
```bash
tput cols
tput lines
```

**Expected Output:**
```
80
24
```
(or whatever your current terminal size is)

**Manual Test:**
1. Run `tput cols` and note the output
2. Resize the terminal pane horizontally
3. Run `tput cols` again
4. The number should have changed

**Why it matters:** Real PTY handles resize signals (SIGWINCH). child_process doesn't support terminal resizing.

---

### ✅ Test 4: Interactive Programs

**Purpose:** Verify interactive programs work correctly

**Commands to test:**

```bash
# Test 1: less (pager)
ls -la | less
# Should show paginated output, arrow keys should work, 'q' to quit

# Test 2: vim (editor)
vim test.txt
# Should show vim interface, able to edit, :wq to save

# Test 3: nano (editor)
nano test.txt
# Should show nano interface with menu at bottom

# Test 4: htop or top (if available)
htop
# Should show interactive process viewer
```

**Expected Behavior:**
- Full-screen interfaces render correctly
- Arrow keys, Enter, Escape work
- No garbled output or control characters
- Can exit cleanly with normal keys (q, :q, Ctrl+X, etc.)

**Why it matters:** Interactive programs require raw mode, proper termios settings, and character-by-character input - all features of real PTY. child_process runs programs in line-buffered mode.

---

### ✅ Test 5: Vault CWD and Follow Mode

**Purpose:** Verify terminal starts in correct directory and follows active notes

**Test A: Vault Root CWD**

1. Open Obsidian vault at `/path/to/MyVault`
2. Open terminal with Settings → Default CWD Mode = "Vault Root"
3. Run: `pwd`

**Expected Output:**
```
/path/to/MyVault
```

**Test B: Active Folder CWD**

1. Open a note in subfolder: `/path/to/MyVault/Projects/MyProject/notes.md`
2. Create new terminal with CWD Mode = "Active Folder"
3. Run: `pwd`

**Expected Output:**
```
/path/to/MyVault/Projects/MyProject
```

**Test C: Auto-CD Follow Mode**

1. Enable "Toggle Auto-CD" command
2. Open note in folder A
3. In terminal, run: `pwd` → should show folder A
4. Switch to note in folder B
5. Run: `pwd` → should show folder B

---

### ✅ Test 6: PATH and npm Commands

**Purpose:** Verify PATH is loaded correctly from login shell

**Test A: Global Commands**

```bash
echo $PATH
# Should show your full PATH with all directories

which node
which npm
which claude  # if you have it installed
```

**Expected:** Should find all globally installed commands

**Test B: npm install progress**

```bash
mkdir test-npm && cd test-npm
npm init -y
npm install express
```

**Expected Output:**
```
npm WARN test-npm@1.0.0 No description
npm WARN test-npm@1.0.0 No repository field.

added 57 packages, and audited 58 packages in 3s
```

**Why it matters:** npm install uses TTY detection to show progress bars and spinners. With child_process, you'd see no progress indicators or they'd be garbled.

**Test C: Local node_modules/.bin**

```bash
cd /path/with/package.json
npm install typescript
npx tsc --version
```

**Expected:** Should execute local typescript without global install

---

### ✅ Test 7: Node Version Managers

**Purpose:** Verify shell initialization loads nvm/fnm/asdf

**If you use nvm:**
```bash
nvm --version
node --version
nvm use 18  # or any version
node --version  # should change
```

**If you use fnm:**
```bash
fnm --version
fnm list
```

**If you use asdf:**
```bash
asdf version
asdf list
```

**Expected:** Version managers work because shell was started as login shell (with `-l` flag), so `.zprofile` / `.bash_profile` ran.

**Why it matters:** child_process by default doesn't start login shells, so these tools wouldn't be in PATH.

---

### ✅ Test 8: Multi-Session Lifecycle

**Purpose:** Verify no zombie processes, clean session management

**Test:**

1. Create 3 terminal sessions (click "New" button 3 times)
2. In each terminal, run: `echo $$ && sleep 1000 &`
3. Note the PID shown for each shell
4. Run in system terminal: `ps aux | grep bash` (or your shell)
   - Should see 3 shell processes with the PIDs noted
5. Close 2 terminal tabs in Obsidian (click X)
6. Run in system terminal: `ps aux | grep bash`
   - Should only see 1 remaining shell process
7. Reload the plugin (disable/enable in settings)
8. Run in system terminal: `ps aux | grep bash`
   - Should see NO shell processes from the plugin

**Expected:** Process cleanup is immediate, no zombie processes

**Why it matters:** Ensures DaemonManager properly kills PTY sessions when terminals close or plugin unloads.

---

### ✅ Test 9: No child_process in Terminal Code ✅ PASSED

**Purpose:** Verify codebase doesn't use child_process for terminal simulation

**Test:**
```bash
cd /path/to/obsitermishell
grep -r "child_process" src/ --include="*.ts" | grep -v "DaemonManager"
```

**Expected Output:**
```
✓ No child_process usage found in terminal code (excluding DaemonManager)
```

**Verification:**
```bash
# Verify no PS1/TERM/CLICOLOR simulation hacks
grep -E "(PS1|TERM=|CLICOLOR)" src/PTYController.ts
# Should return nothing

# Verify no manual echo-back in TerminalView
grep "terminal.write(data)" src/TerminalView.ts
# Only should appear in onData handler (receiving PTY output), not in user input handler
```

**Status:** ✅ **PASSED** - Verified no child_process simulation code exists

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. TTY Detection (isatty) | ⏳ Pending | Requires Obsidian installation |
| 2. Terminal Settings (stty) | ⏳ Pending | Requires Obsidian installation |
| 3. Terminal Size (tput) | ⏳ Pending | Requires Obsidian installation |
| 4. Interactive Programs | ⏳ Pending | Requires Obsidian installation |
| 5. Vault CWD | ⏳ Pending | Requires Obsidian installation |
| 6. PATH & npm | ⏳ Pending | Requires Obsidian installation |
| 7. Version Managers | ⏳ Pending | Requires Obsidian installation |
| 8. Session Lifecycle | ⏳ Pending | Requires Obsidian installation |
| 9. No child_process | ✅ **PASSED** | Code review completed |

---

## Installation Instructions for Testing

1. **Copy plugin to vault:**
   ```bash
   cp -r dist/ /path/to/vault/.obsidian/plugins/obsitermishell/
   ```

2. **Install daemon dependencies:**
   ```bash
   cd /path/to/vault/.obsidian/plugins/obsitermishell/daemon
   npm install
   ```

3. **Rebuild node-pty:**
   ```bash
   cd /path/to/vault/.obsidian/plugins/obsitermishell
   ./scripts/rebuild-pty.sh  # or .ps1 on Windows
   ```

4. **Enable plugin:**
   - Open Obsidian
   - Settings → Community Plugins → Enable "Obsitermishell"
   - Check console for "PTY daemon started successfully"

5. **Run tests:**
   - Open terminal: Click terminal icon in sidebar
   - Run each test command listed above
   - Document results

---

## Troubleshooting Test Failures

**Daemon won't start:**
- Check console: Settings → Developer Tools → Console
- Look for daemon error messages
- Verify Node.js is installed: `node --version`
- Check port 37492 is available: `lsof -i :37492`

**Tests fail with "not a tty":**
- Verify daemon started successfully (check console)
- Try reloading plugin
- Check if node-pty was rebuilt: `ls daemon/node_modules/node-pty/build/`

**PATH is incomplete:**
- Check shell init files: `~/.zprofile`, `~/.bash_profile`, etc.
- Verify daemon spawns login shell (see daemon/index.js line with `spawn()`)
- Test in regular terminal: does PATH work there?

---

## Success Criteria

All tests 1-8 must **PASS** to confirm real PTY implementation.

The terminal should behave identically to:
- VS Code's integrated terminal
- iTerm2 / Terminal.app / Windows Terminal
- Any other real terminal application

**NOT** like:
- A command output viewer
- A log display with input box
- A REPL with line-by-line execution
