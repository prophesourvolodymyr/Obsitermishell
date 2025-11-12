# Setup & Packaging Guide

This guide covers installation, building, packaging, and troubleshooting for **Obsitermishell**.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Building](#building)
4. [Rebuilding Native Modules](#rebuilding-native-modules)
5. [Packaging for Distribution](#packaging-for-distribution)
6. [Platform-Specific Notes](#platform-specific-notes)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Obsidian Desktop:** Latest version recommended
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Git:** For cloning the repository

### Build Tools

#### macOS
```bash
xcode-select --install
```

#### Windows
Install **Visual Studio Build Tools 2019 or later** with:
- Desktop development with C++
- Windows 10 SDK

Or use:
```powershell
npm install --global windows-build-tools
```

#### Linux (Debian/Ubuntu)
```bash
sudo apt-get install build-essential python3
```

#### Linux (Fedora/RHEL)
```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install python3
```

---

## Installation

### For Users (Install from Source)

1. **Navigate to Obsidian plugins directory:**
   ```bash
   cd /path/to/your/vault/.obsidian/plugins/
   ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/prophesourvolodymyr/Obsitermishell.git
   cd Obsitermishell
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Build the plugin:**
   ```bash
   npm run build
   ```

5. **Rebuild native modules:**
   ```bash
   npm run rebuild
   ```

6. **Enable in Obsidian:**
   - Open Obsidian
   - Settings → Community Plugins → Reload plugins
   - Enable "Obsitermishell"

---

## Building

### Development Build (Watch Mode)

For active development with auto-rebuild on file changes:
```bash
npm run dev
```

This runs esbuild in watch mode. Edit files in `src/` and changes will be automatically compiled to `main.js`.

### Production Build

For optimized production build:
```bash
npm run build
```

This:
1. Runs TypeScript type checking (`tsc -noEmit`)
2. Bundles and minifies code with esbuild
3. Generates `main.js` in plugin root

### Type Checking

To check TypeScript types without building:
```bash
npm run check
```

---

## Rebuilding Native Modules

### Why Rebuild?

**node-pty** is a **native Node.js module** (C++ addon) that must be compiled for:
- The specific Electron version Obsidian uses
- Your operating system and architecture

**When to rebuild:**
- After initial `npm install`
- When Obsidian updates (may change Electron version)
- When switching between different OS/architectures

### How to Rebuild

#### Method 1: npm script (Recommended)
```bash
npm run rebuild
```

#### Method 2: Manual rebuild
```bash
npx electron-rebuild -f -w node-pty
```

#### Method 3: Rebuild script
```bash
chmod +x rebuild.sh
./rebuild.sh
```

### Rebuild Options

```bash
# Force rebuild
npx electron-rebuild -f

# Rebuild specific module
npx electron-rebuild -w node-pty

# Specify Electron version
npx electron-rebuild --version 25.8.4

# Specify architecture (for cross-compilation)
npx electron-rebuild --arch x64
npx electron-rebuild --arch arm64
```

### Automatic Rebuild on Install

The `postinstall` script in `package.json` automatically runs rebuild after `npm install`:
```json
"scripts": {
  "postinstall": "electron-rebuild -f -w node-pty"
}
```

To skip postinstall (e.g., for CI):
```bash
npm install --ignore-scripts
```

---

## Packaging for Distribution

### For Obsidian Community Plugins

#### Initial Submission

To submit to Obsidian Community Plugins for the first time:

1. **Prepare files:**
   - `manifest.json` - Plugin metadata
   - `versions.json` - Version compatibility tracker
   - `main.js` - Compiled plugin (from `npm run build`)
   - `styles.css` - Plugin styles

2. **Update versions.json:**
   ```json
   {
     "0.1.0": "1.4.0"
   }
   ```
   Format: `"plugin-version": "minimum-obsidian-version"`

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Create GitHub release:**

   **Option A: Automated (GitHub Actions)**
   ```bash
   git tag -a 0.1.0 -m "v0.1.0 - Initial release"
   git push origin 0.1.0
   ```
   GitHub Actions workflow (`.github/workflows/release.yml`) will:
   - Build the plugin
   - Create a draft release
   - Attach required files automatically

   **Option B: Manual**
   ```bash
   git tag -a 0.1.0 -m "v0.1.0"
   git push origin 0.1.0
   ```
   Then on GitHub:
   - Go to Releases → Create new release
   - Choose tag `0.1.0`
   - **Attach:** `main.js`, `manifest.json`, `styles.css`
   - Publish release

5. **Submit to Community Plugins:**
   - Fork https://github.com/obsidianmd/obsidian-releases
   - Edit `community-plugins.json`, add entry:
     ```json
     {
       "id": "obsitermishell",
       "name": "Obsitermishell",
       "author": "prophesourvolodymyr",
       "description": "Embedded terminal for Obsidian Desktop with PTY, multiple sessions, and auto-cd support",
       "repo": "prophesourvolodymyr/Obsitermishell"
     }
     ```
   - Create Pull Request
   - See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for full submission guide

#### Future Updates

After initial approval, updates are automatic:

1. **Update version** in `manifest.json` and `package.json`:
   ```json
   {
     "version": "0.2.0"
   }
   ```

2. **Update versions.json:**
   ```json
   {
     "0.1.0": "1.4.0",
     "0.2.0": "1.4.0"
   }
   ```

3. **Build and tag:**
   ```bash
   npm run build
   git tag -a 0.2.0 -m "v0.2.0"
   git push origin 0.2.0
   ```

4. **Create release** (manual or automated)

5. **No PR needed** - Obsidian auto-detects new releases!

### For Manual Distribution

Create a zip archive:
```bash
zip -r obsitermishell-0.1.0.zip main.js manifest.json styles.css
```

Users can:
1. Extract to `.obsidian/plugins/obsitermishell/`
2. Reload plugins in Obsidian
3. Run `npm run rebuild` if needed

---

## Platform-Specific Notes

### macOS

#### Apple Silicon (M1/M2)
The plugin works on Apple Silicon Macs. Ensure:
- Node.js is native arm64 version (not Rosetta)
- Check with: `node -p process.arch` (should be `arm64`)

If you need to rebuild for x64:
```bash
npx electron-rebuild --arch x64
```

#### Code Signing (Optional)
For distribution outside Obsidian Community Plugins, you may need to sign node-pty:
```bash
codesign --force --deep --sign - node_modules/node-pty/build/Release/pty.node
```

### Windows

#### PowerShell vs CMD
The plugin auto-detects:
1. PowerShell Core (`pwsh.exe`) — preferred
2. Windows PowerShell (`powershell.exe`)
3. CMD (`cmd.exe`) — fallback

#### PATH Issues
If commands aren't found, ensure your shell profile is loaded:
- PowerShell: Check `$PROFILE` file
- CMD: Check system environment variables

#### Windows Defender
First run may be slow due to Defender scanning. Add exclusion:
```
C:\path\to\vault\.obsidian\plugins\obsitermishell\node_modules
```

### Linux

#### Shell Detection
Plugin detects shell via `$SHELL` environment variable. Common shells:
- `/bin/bash`
- `/bin/zsh`
- `/usr/bin/fish`

If detection fails, manually set in Settings → Shell Path.

#### Permissions
Ensure shell is executable:
```bash
ls -la $SHELL
# Should show: -rwxr-xr-x
```

---

## Troubleshooting

### Build Errors

**Error: `Cannot find module 'obsidian'`**
```bash
npm install
```

**Error: `Cannot find module '@types/node'`**
```bash
npm install --save-dev @types/node
```

**esbuild fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### node-pty Rebuild Errors

**Error: `node-gyp` not found**
```bash
npm install -g node-gyp
```

**Error: Python not found (Windows)**
- Install Python 3.x from [python.org](https://python.org)
- Add to PATH

**Error: `MSBUILD : error MSB1009` (Windows)**
- Install Visual Studio Build Tools
- Restart terminal/IDE

**Error: `gyp: No Xcode or CLT version detected!` (macOS)**
```bash
sudo rm -rf /Library/Developer/CommandLineTools
xcode-select --install
```

### Runtime Errors

**Error: `Cannot find module '../build/Debug/pty.node'`**
```bash
cd /path/to/vault/.obsidian/plugins/Obsitermishell
npm run rebuild
```

**Error: Vault root is `null`**
- Expected on mobile (desktop only)
- Check that FileSystemAdapter is available

**Error: Shell spawn fails**
- Verify shell path in Settings
- Check shell permissions (`chmod +x /path/to/shell`)
- Look at console for detailed error

### Performance Issues

**Terminal is slow:**
- Reduce scrollback buffer (Settings → Scrollback)
- Disable web links addon (Settings → Enable Web Links)
- Check if other plugins conflict

**High memory usage:**
- Close unused terminal sessions
- Restart Obsidian periodically

---

## Development Tips

### Hot Reload

While in dev mode (`npm run dev`):
1. Make changes to `src/` files
2. esbuild auto-compiles
3. In Obsidian: Ctrl/Cmd+R to reload plugin

### Debugging

Enable Developer Tools in Obsidian:
- View → Toggle Developer Tools
- Console shows plugin logs

Add debug logging:
```typescript
console.log('Obsitermishell:', data);
```

### Testing

Manual testing checklist: See [QA_CHECKLIST.md](QA_CHECKLIST.md)

---

## Additional Resources

- **Obsidian Plugin Docs:** https://docs.obsidian.md/Plugins
- **node-pty README:** https://github.com/microsoft/node-pty
- **Electron Native Modules:** https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules
- **xterm.js Docs:** https://xtermjs.org/docs/

---

**Last Updated:** 2025-11-10
