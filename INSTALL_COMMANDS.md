# Installation Commands for Your Vault

## Your Vault Path
```
/Users/volodymurvasualkiw/Desktop/Realistic APP
```

## Step 1: Navigate to Plugins Directory
```bash
cd "/Users/volodymurvasualkiw/Desktop/Realistic APP/.obsidian/plugins/"
```

## Step 2: Clone Repository
```bash
git clone https://github.com/prophesourvolodymyr/Obsitermishell.git
cd Obsitermishell
```

## Step 3: Install Dependencies
```bash
npm install --ignore-scripts
```

## Step 4: Rebuild Native Modules
```bash
npm run rebuild
```

## Step 5: Enable in Obsidian
1. Restart Obsidian Desktop
2. Go to: **Settings → Community Plugins**
3. Find "Obsitermishell" in the list
4. Toggle it **ON**
5. Click the terminal icon in the left ribbon or use **Ctrl/Cmd+Shift+T**

## Troubleshooting

### If Terminal Doesn't Open
```bash
# Check console for errors (Obsidian → View → Toggle Developer Tools)
# Try rebuilding native modules again:
cd "/Users/volodymurvasualkiw/Desktop/Realistic APP/.obsidian/plugins/Obsitermishell"
npm run rebuild
```

### If Obsidian Updates
```bash
# Native modules need to be rebuilt after Obsidian updates:
cd "/Users/volodymurvasualkiw/Desktop/Realistic APP/.obsidian/plugins/Obsitermishell"
npm run rebuild
```

### Check Plugin Status
```bash
# Verify files exist:
ls -lh "/Users/volodymurvasualkiw/Desktop/Realistic APP/.obsidian/plugins/Obsitermishell/main.js"
# Should show: 320 KB
```

## Quick Test Commands

Once plugin is enabled, open a terminal and try:
```bash
pwd                    # Should show vault root
git status            # Test git integration
node --version        # Test Node.js access
which python3         # Test PATH completeness
```

## Common Issues

**Issue**: "Cannot find module 'node-pty'"
**Fix**: Run `npm run rebuild` in the plugin directory

**Issue**: Terminal shows "Desktop Only" message
**Fix**: This plugin only works on Obsidian Desktop (macOS/Windows/Linux), not mobile

**Issue**: Shell doesn't have full PATH
**Fix**: Check Settings → Default shell is set to your shell with login mode enabled

## Default Shortcuts

- **Ctrl/Cmd+Shift+T**: Open Terminal
- **Ctrl/Cmd+Shift+N**: New Terminal Session
- **Ctrl+F**: Search in terminal
- **Ctrl+Shift+C**: Copy (when text selected)
- **Ctrl+Shift+V**: Paste

## Next Steps

After successful installation:
1. Test basic terminal operations
2. Configure profiles in Settings if needed
3. Try auto-cd modes (vault root, active note folder)
4. Check QA_CHECKLIST.md for comprehensive testing

## Support

- **Issues**: https://github.com/prophesourvolodymyr/Obsitermishell/issues
- **Docs**: See README.md and SETUP.md in plugin directory
- **Contributing**: See CONTRIBUTING.md
