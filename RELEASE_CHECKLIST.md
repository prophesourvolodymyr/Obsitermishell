# Release Checklist for Obsitermishell v0.1.0

Complete this checklist before submitting to Obsidian Community Plugins.

---

## ✅ Pre-Release Verification

### Code Quality
- [x] TypeScript compiles without errors (`npm run check`)
- [x] Build succeeds (`npm run build`)
- [x] main.js exists and is valid JavaScript
- [x] No console errors in source code
- [x] Code follows Obsidian plugin best practices

### Required Files
- [x] `manifest.json` (347 bytes)
- [x] `main.js` (320 KB)
- [x] `styles.css` (3.9 KB)
- [x] `README.md` (8.4 KB)
- [x] `LICENSE` (MIT)
- [x] `package.json` with correct dependencies

### manifest.json Validation
- [x] `id`: "obsitermishell"
- [x] `name`: "Obsitermishell"
- [x] `version`: "0.1.0"
- [x] `minAppVersion`: "1.4.0"
- [x] `description`: Matches package.json
- [x] `author`: "prophesourvolodymyr"
- [x] `authorUrl`: Valid GitHub URL
- [x] `isDesktopOnly`: true

### Documentation
- [x] README.md complete with:
  - [x] Features list
  - [x] Installation instructions
  - [x] Usage guide
  - [x] Configuration options
  - [x] Troubleshooting section
- [x] SETUP.md with build instructions
- [x] CODEBASE-Quick Start.md for developers
- [x] QA_CHECKLIST.md with test cases
- [x] PROGRESS.md with project tracking
- [x] LICENSE file (MIT)

---

## 🧪 Testing Requirements

### Desktop Testing (Before Submission)
- [ ] **macOS**
  - [ ] Terminal spawns correctly
  - [ ] Vault root detection works
  - [ ] Shell PATH is complete
  - [ ] Multiple sessions work
  - [ ] node-pty rebuild successful

- [ ] **Windows**
  - [ ] Terminal spawns (PowerShell/CMD)
  - [ ] Vault root detection works
  - [ ] Multiple sessions work
  - [ ] node-pty rebuild successful

- [ ] **Linux**
  - [ ] Terminal spawns (bash/zsh)
  - [ ] Vault root detection works
  - [ ] Multiple sessions work
  - [ ] node-pty rebuild successful

### Mobile Testing
- [ ] iOS shows "Desktop Only" notice (no crash)
- [ ] Android shows "Desktop Only" notice (no crash)

### Functional Testing
- [ ] Open Terminal command works
- [ ] New Terminal command creates sessions
- [ ] Terminal tabs display correctly
- [ ] Auto-cd to vault root works
- [ ] Active note folder mode works
- [ ] Settings tab loads
- [ ] Profiles can be created/edited
- [ ] Clear terminal works
- [ ] Terminal resizes correctly
- [ ] Theme sync (light/dark) works
- [ ] Copy/paste works
- [ ] Search works (Ctrl+F)
- [ ] Web links are clickable

### Integration Testing
- [ ] git commands work
- [ ] python/node works
- [ ] npm/pip work
- [ ] Claude/AI CLIs work (if installed)
- [ ] Colors display correctly
- [ ] UTF-8/emojis work

---

## 📦 GitHub Release

### Pre-Release Steps
- [ ] All tests pass
- [ ] Code is committed
- [ ] Branch is pushed to GitHub
- [ ] No critical bugs

### Create Release
```bash
git tag -a 0.1.0 -m "v0.1.0 - Initial release"
git push origin 0.1.0
```

### GitHub Release Page
- [ ] Go to: https://github.com/prophesourvolodymyr/Obsitermishell/releases
- [ ] Click "Create a new release"
- [ ] Choose tag: `0.1.0`
- [ ] Release title: `v0.1.0`
- [ ] **Attach these files:**
  - [ ] `main.js` (320 KB)
  - [ ] `manifest.json` (347 bytes)
  - [ ] `styles.css` (3.9 KB)

### Release Notes Template
```markdown
# Obsitermishell v0.1.0 - Initial Release

Embedded terminal for Obsidian Desktop with real PTY support.

## Features
- ✅ Real PTY terminal with login shell
- ✅ Multiple sessions with tab UI
- ✅ Auto-cd modes (vault root, active note folder)
- ✅ Terminal profiles with init commands
- ✅ Theme sync with Obsidian
- ✅ Search, copy/paste, large scrollback
- ✅ Desktop-only with mobile detection

## Installation
See [README.md](https://github.com/prophesourvolodymyr/Obsitermishell/blob/main/README.md)

## Requirements
- Obsidian Desktop v1.4.0+
- macOS, Windows, or Linux
- Node.js 18+ for rebuilding

## Known Issues
- node-pty must be rebuilt after Obsidian updates
- PATH may be incomplete without login shell

## Testing
Tested on:
- macOS [specify version]
- Windows [specify version]
- Linux [specify distro]
```

---

## 🚀 Community Plugin Submission

### Fork obsidian-releases
- [ ] Fork: https://github.com/obsidianmd/obsidian-releases
- [ ] Clone your fork locally

### Edit community-plugins.json
```bash
cd obsidian-releases
# Add to community-plugins.json (alphabetically):
```

```json
{
  "id": "obsitermishell",
  "name": "Obsitermishell",
  "author": "prophesourvolodymyr",
  "description": "Embedded terminal for Obsidian Desktop with PTY, multiple sessions, and auto-cd support",
  "repo": "prophesourvolodymyr/Obsitermishell"
}
```

### Create Pull Request
- [ ] Commit changes
- [ ] Push to your fork
- [ ] Create PR to `obsidianmd/obsidian-releases`

**PR Title:** `Add Obsitermishell plugin`

**PR Description:**
```markdown
## Plugin Information
- **Plugin Name:** Obsitermishell
- **Description:** Embedded terminal for Obsidian Desktop with PTY, multiple sessions, and auto-cd support
- **Repository:** https://github.com/prophesourvolodymyr/Obsitermishell
- **Initial Release:** v0.1.0
- **Release URL:** [Add GitHub release URL]

## Features
- Real PTY terminal with login shell support
- Multiple sessions with tab-based UI
- Auto-cd modes (vault root, active note folder, sticky)
- Terminal profiles with init commands
- Theme sync with Obsidian light/dark mode
- Search, copy/paste, large scrollback
- Desktop-only (friendly notice on mobile)

## Testing
Tested on:
- [x] macOS [version]
- [x] Windows [version]
- [x] Linux [distro]
- [x] Mobile (shows desktop-only notice)

## Checklist
- [x] manifest.json has correct id, name, author, description
- [x] README.md is complete and helpful
- [x] Plugin works on desktop platforms
- [x] Release v0.1.0 created with main.js, manifest.json, styles.css attached
- [x] No malicious code or undisclosed network requests
- [x] Follows Obsidian plugin guidelines
- [x] isDesktopOnly: true in manifest
- [x] LICENSE file included (MIT)

## Security
- No network requests
- No data collection
- Local-only terminal (PTY spawns on user's machine)
- Native module: node-pty (official Microsoft package)

## Additional Notes
[Any special notes about installation, requirements, or known issues]
```

---

## 📋 Submission Checklist

### Before Submitting PR
- [ ] GitHub release created with correct files
- [ ] All automated checks pass
- [ ] README is clear and complete
- [ ] No security concerns
- [ ] Plugin tested on at least 2 platforms
- [ ] manifest.json version matches release tag

### After Submitting PR
- [ ] Respond to review comments within 48 hours
- [ ] Make requested changes if needed
- [ ] Update PR if automated checks fail
- [ ] Be patient (review can take 1-7 days)

---

## ✅ Post-Approval

### When PR is Merged
- [ ] Plugin appears in Community Plugins (within 24 hours)
- [ ] Test installation from Obsidian UI
- [ ] Monitor GitHub issues for bug reports
- [ ] Respond to user feedback

### Future Updates
For version 0.2.0+:
1. Update `manifest.json` version
2. Create new GitHub release
3. No PR needed (auto-updates from releases)

---

## 🔍 Final Verification

Run these commands before submitting:

```bash
# Verify build
npm run build
ls -lh main.js manifest.json styles.css

# Verify types
npm run check

# Verify files match
cat manifest.json | grep -E '"id"|"name"|"version"|"description"'

# Check git status
git status
git log --oneline -5
```

**Expected output:**
- main.js: ~320 KB
- manifest.json: ~350 bytes
- styles.css: ~4 KB
- TypeScript: No errors
- Git: Clean working tree, 2 commits on branch

---

## 📞 Support Resources

- **Obsidian Plugin Guidelines:** https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- **Submission Guide:** https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin
- **Discord:** Obsidian Discord → #plugin-dev
- **Forum:** https://forum.obsidian.md/c/developers-plugin-api/

---

**Status:** Ready for Testing ✅

**Next Action:** Test on Desktop (macOS/Windows/Linux)

**Last Updated:** 2025-11-10
