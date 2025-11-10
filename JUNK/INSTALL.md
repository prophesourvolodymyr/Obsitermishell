# Installation Instructions

## For Users

### Installation Steps

1. **Download the Plugin**
   - Download the latest release or build from source
   - The plugin files are in the `dist/` directory

2. **Install in Obsidian**
   - Navigate to your Obsidian vault folder
   - Go to `.obsidian/plugins/`
   - Create a folder named `obsitermishell`
   - Copy ALL files from `dist/` to `.obsidian/plugins/obsitermishell/`:
     ```
     your-vault/
     └── .obsidian/
         └── plugins/
             └── obsitermishell/
                 ├── main.js
                 ├── manifest.json
                 ├── styles.css
                 ├── node_modules_plugin/
                 │   └── node-pty/
                 │       ├── build/
                 │       │   └── Release/
                 │       │       └── pty.node  (native module)
                 │       ├── lib/
                 │       └── package.json
                 └── README.md
     ```

3. **Enable the Plugin**
   - Restart Obsidian or use the "Reload app without saving" command
   - Go to Settings → Community plugins
   - Find "Obsitermishell" in the list
   - Toggle it ON

4. **Open Terminal**
   - Use the command palette (Cmd/Ctrl + P)
   - Search for "Terminal"
   - Click "Open Terminal" to create a new terminal view

### Troubleshooting

#### Error: "Cannot find module 'node-pty'"

This means the native module wasn't copied correctly. Make sure:
- The `node_modules_plugin/` directory exists in your plugin folder
- The `node_modules_plugin/node-pty/build/Release/pty.node` file exists
- You copied ALL files from the `dist/` directory

#### Terminal doesn't spawn

- Check that you're using Obsidian on Desktop (not mobile)
- Make sure your system has a shell (bash, zsh, powershell, cmd)
- Check the developer console (Cmd/Ctrl + Shift + I) for errors

#### Terminal is blank or frozen

- Try closing and reopening the terminal view
- Restart Obsidian
- Check if your shell starts correctly outside of Obsidian

---

## For Developers

### Building from Source

1. **Install Dependencies**
   ```bash
   npm install
   ```
   This will automatically rebuild `node-pty` for Obsidian's Electron version.

2. **Development Build**
   ```bash
   npm run dev
   ```
   This watches for changes and rebuilds automatically.

3. **Production Build**
   ```bash
   npm run build
   ```
   This creates optimized files in the `dist/` directory.

### Development Workflow

1. **Link Plugin to Vault**
   Create a symbolic link from your vault to the dev directory:
   ```bash
   # On macOS/Linux:
   ln -s /path/to/Obsitermishell/dist /path/to/vault/.obsidian/plugins/obsitermishell

   # On Windows (as admin):
   mklink /D "C:\path\to\vault\.obsidian\plugins\obsitermishell" "C:\path\to\Obsitermishell\dist"
   ```

2. **Watch Mode**
   ```bash
   npm run dev
   ```
   Leave this running while developing.

3. **Reload in Obsidian**
   After changes, use Cmd/Ctrl + R to reload Obsidian without saving.

### Rebuilding Native Modules

If you update Electron or node-pty versions:

```bash
# Rebuild for Obsidian's current Electron version
npm run rebuild:obsidian

# Or rebuild for a specific Electron version
npx @electron/rebuild -f -w node-pty -v <electron-version>
```

### Project Structure

```
Obsitermishell/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── PTYController.ts     # PTY process management
│   ├── TerminalManager.ts   # Multi-session management
│   ├── TerminalView.ts      # Obsidian view component
│   └── utils/               # Utility modules
├── dist/                    # Build output (generated)
├── node_modules_plugin/     # Native modules for distribution (generated)
├── scripts/
│   ├── prepare-plugin.js    # Build preparation script
│   └── copy-native-modules.js
├── esbuild.config.mjs       # Build configuration
├── package.json
├── manifest.json            # Obsidian plugin manifest
└── tsconfig.json
```

### Key Fixes Applied

1. **Native Module Loading**
   - `node-pty` is marked as external in esbuild config
   - Multiple loading strategies in PTYController.ts
   - Native module copied to `node_modules_plugin/` on build

2. **Electron Version**
   - Rebuilt for Obsidian's Electron 25.8.4 (Nov 2024)
   - Automatic rebuild on `npm install` via postinstall script

3. **Distribution**
   - `npm run build` creates complete `dist/` directory
   - Includes all necessary files for Obsidian installation
   - Ready to copy directly to plugin folder

### Testing

1. Build the plugin: `npm run build`
2. Copy `dist/` contents to a test vault's plugin folder
3. Enable in Obsidian
4. Open developer console for debugging
5. Test terminal creation and shell interaction
