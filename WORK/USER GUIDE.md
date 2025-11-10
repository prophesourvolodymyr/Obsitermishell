# Obsitermishell User Guide

## Terminal Tab Naming

**Feature:** Terminals are automatically named based on the first command you type.

**How it works:**
1. When you create a new terminal, it starts with a generic name like "Terminal 1"
2. Type your first command and press Enter
3. The tab will automatically rename to the command you typed (e.g., "npm", "claude", "python", "git")
4. Only the command name is used (arguments are ignored)

**Examples:**
- Type `npm install` ’ Tab becomes "npm"
- Type `claude code` ’ Tab becomes "claude"
- Type `python script.py` ’ Tab becomes "python"
- Type `git status` ’ Tab becomes "git"

**Benefits:**
- Easy to identify which terminal is doing what
- Especially useful when running multiple terminals
- No manual renaming needed

## Keyboard Shortcuts

### Default Commands (Set Your Own Hotkeys)

Go to Settings ’ Hotkeys and search for "Obsitermishell" to set:

1. **Open Terminal** - Opens the terminal view or focuses it if already open
   - Recommended: `Cmd/Ctrl + ``

2. **New Terminal** - Creates a new terminal tab
   - Recommended: `Cmd/Ctrl + Shift + T`

3. **Clear Terminal** - Clears the active terminal
   - Recommended: `Cmd/Ctrl + K`

4. **Toggle Auto-CD** - Toggle following active note's folder
   - Recommended: No default (set if you use this feature)

5. **Focus Terminal** - Same as "Open Terminal"

### Inside Terminal

Standard terminal shortcuts work:
- `Ctrl + C` - Interrupt current command
- `Ctrl + D` - Exit shell
- `Ctrl + Z` - Suspend process
- `Ctrl + F` - Search in terminal (if enabled in settings)
- Arrow keys - Command history
- Tab - Auto-complete

## Terminal Location

By default, the terminal opens in the **left sidebar** when you first activate it.

You can move it anywhere:
- Drag the tab to different panes
- Right-click ’ Move to ’ Choose location
- It will remember your preference

## Multiple Terminals

Create multiple terminal tabs for different tasks:
1. Click the "New" button in terminal header
2. Or use Command Palette ’ "New Terminal"
3. Or set a hotkey for "New Terminal"

**Use cases:**
- One terminal for development server
- One for git commands
- One for running Claude
- One for file operations

Each terminal has its own:
- Shell session
- Working directory
- Command history
- Tab name (based on first command)

## Tips

### Organizing Terminals
- The first command you type names the tab
- Keep related work in one terminal
- Close unused terminals with the X button

### Working Directory
Set in Settings ’ Obsitermishell ’ Behavior:
- **Vault Root** - Terminal always in vault folder
- **Active Folder** - Follows current note's folder
- **Sticky** - Stays where you navigate to

### Profiles
Create profiles for common tasks:
1. Settings ’ Obsitermishell ’ Profiles
2. Click "Add Profile"
3. Name it and add init commands

Example profiles:
- "Claude" - Runs `claude code` on start
- "Server" - Runs `npm run dev`
- "Python" - Runs `python3` REPL

## Troubleshooting

### Terminal not responding
- Check if daemon is running (Console for errors)
- Reload plugin: Settings ’ Community Plugins ’ Disable/Enable

### Can't type in terminal
- Click inside the terminal to focus
- Check if shell is waiting for input
- Try pressing Enter

### Terminal disappeared
- Use "Open Terminal" command to restore
- Check if accidentally closed with X button
- May have been moved to another pane

### Tab name wrong
- Tab uses the first command you typed
- If you want to rename, you'd need to close and create new terminal
- Future versions may add manual rename feature
