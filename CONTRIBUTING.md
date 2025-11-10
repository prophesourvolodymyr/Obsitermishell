# Contributing to Obsitermishell

Thank you for your interest in contributing to Obsitermishell! This document provides guidelines and instructions for contributing.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Git**
- **Obsidian Desktop** for testing
- **Build tools** for your platform (see SETUP.md)

### Development Setup

1. **Fork the repository**
   ```bash
   # On GitHub, click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Obsitermishell.git
   cd Obsitermishell
   ```

3. **Install dependencies**
   ```bash
   npm install --ignore-scripts
   ```

4. **Build the plugin**
   ```bash
   npm run build
   ```

5. **Link to Obsidian vault**
   ```bash
   # Create symlink for testing
   ln -s $(pwd) /path/to/vault/.obsidian/plugins/obsitermishell

   # Rebuild native modules
   npm run rebuild
   ```

6. **Enable in Obsidian**
   - Restart Obsidian
   - Settings → Community Plugins → Enable "Obsitermishell"

---

## 🔧 Development Workflow

### Watch Mode
For active development with auto-rebuild:
```bash
npm run dev
```

Edit files in `src/`, and changes will automatically compile. Reload the plugin in Obsidian with **Ctrl/Cmd+R**.

### Type Checking
```bash
npm run check
```

### Building for Production
```bash
npm run build
```

### Code Formatting
```bash
npm run format
```

---

## 📝 Code Style

### TypeScript
- Use **strict mode** (enabled in tsconfig.json)
- Prefer `const` over `let`
- Use **async/await** over Promises
- Use **arrow functions** for callbacks
- Document public APIs with JSDoc comments

### Naming Conventions
- **Classes:** PascalCase (e.g., `TerminalView`)
- **Methods/Functions:** camelCase (e.g., `spawnTerminal`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `VIEW_TYPE_TERMINAL`)
- **Private members:** Prefix with `_` (e.g., `_ptyProcess`)

### Example
```typescript
/**
 * Creates a new terminal session
 * @param options - Spawn options
 * @returns The created session
 */
public createSession(options: TerminalSpawnOptions = {}): TerminalSession {
	const sessionId = this._generateSessionId();
	// ...
}
```

---

## 🐛 Reporting Bugs

### Before Submitting
- Check [existing issues](https://github.com/prophesourvolodymyr/Obsitermishell/issues)
- Test with latest version
- Test in a clean vault (no other plugins)

### Bug Report Template
```markdown
**Environment:**
- OS: [macOS 13.5 / Windows 11 / Ubuntu 22.04]
- Obsidian: [v1.4.16]
- Plugin: [v0.1.0]

**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Open terminal
2. Run command X
3. Observe error Y

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots/Logs:**
(if applicable)

**Console Errors:**
(Open DevTools → Console, copy errors)
```

---

## ✨ Suggesting Features

### Before Submitting
- Check [existing feature requests](https://github.com/prophesourvolodymyr/Obsitermishell/issues?q=is%3Aissue+label%3Aenhancement)
- Consider if it fits the plugin's scope
- Think about desktop vs. mobile compatibility

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Proposed Solution:**
How you'd like it to work

**Alternatives Considered:**
Other solutions you've thought about

**Additional Context:**
Mockups, examples, references
```

---

## 🔀 Pull Request Process

### 1. Create a Branch
```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-description
```

Branch naming:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 2. Make Changes
- Follow code style guidelines
- Add tests if applicable
- Update documentation (README, CODEBASE-Quick Start)
- Test thoroughly on desktop platforms

### 3. Commit Changes
Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add session restore on startup"
git commit -m "fix: terminal resize not working on Windows"
git commit -m "docs: update installation instructions"
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 4. Push and Create PR
```bash
git push origin feature/my-new-feature
```

On GitHub:
1. Click "Compare & pull request"
2. Fill out PR template
3. Link related issues
4. Wait for review

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on macOS
- [ ] Tested on Windows
- [ ] Tested on Linux
- [ ] No console errors
- [ ] Existing features still work

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests (if applicable)

## Screenshots
(if UI changes)

## Related Issues
Closes #123
```

---

## 🧪 Testing Guidelines

### Manual Testing
Use **QA_CHECKLIST.md** for comprehensive testing.

### Key Test Areas
1. **Terminal Spawning** - Shell starts correctly
2. **Vault Paths** - Correct directory detection
3. **Multiple Sessions** - Tab switching, no memory leaks
4. **Settings** - All options work
5. **Profiles** - Profile creation and usage
6. **Commands** - All commands function
7. **Theming** - Light/dark mode sync
8. **Resize** - Terminal fits container
9. **Copy/Paste** - Clipboard operations work
10. **Platform Compatibility** - Works on macOS/Windows/Linux

### Console Errors
Always check DevTools Console for errors:
- Obsidian → View → Toggle Developer Tools
- Console tab should have no red errors

---

## 📦 Release Process

### For Maintainers Only

1. **Update version**
   ```bash
   # Update manifest.json and package.json
   npm version patch  # or minor, major
   ```

2. **Update versions.json**
   ```json
   {
     "0.1.0": "1.4.0",
     "0.2.0": "1.4.0"
   }
   ```

3. **Build and test**
   ```bash
   npm run build
   # Test in Obsidian
   ```

4. **Create tag and push**
   ```bash
   git tag -a 0.2.0 -m "v0.2.0"
   git push origin 0.2.0
   ```

5. **GitHub Actions auto-creates release**
   - Or manually: Go to Releases → Draft new release
   - Attach: main.js, manifest.json, styles.css

6. **Announce**
   - Update README if needed
   - Post in Obsidian Discord/Forum
   - Respond to user feedback

---

## 🏗️ Architecture Guidelines

### Adding New Features

**1. Plan First**
- Document in PROGRESS.md
- Discuss in GitHub issue if significant
- Consider backward compatibility

**2. Follow Existing Patterns**
- Use EventEmitter for events
- Extend Disposable for cleanup
- Follow service pattern (e.g., TerminalManager)

**3. Error Handling**
- Never crash the plugin
- Show user-friendly notices
- Log detailed errors to console

**4. Performance**
- Avoid blocking operations
- Use debouncing for frequent events
- Clean up resources (kill PTYs, dispose listeners)

### Code Organization
```
src/
├── main.ts              # Plugin entry, high-level coordination
├── TerminalView.ts      # UI and rendering
├── TerminalManager.ts   # Business logic
├── PTYController.ts     # Low-level PTY operations
├── VaultPathResolver.ts # Path resolution
├── SettingsTab.ts       # Settings UI
├── types.ts             # Shared types
└── utils/               # Utility functions
```

---

## 🤝 Community

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Obsidian Discord** - #plugin-dev channel
- **Obsidian Forum** - Plugin development section

### Code of Conduct
- Be respectful and constructive
- Help others learn
- Accept feedback gracefully
- Focus on the problem, not the person

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## ❓ Questions?

- Check [CODEBASE-Quick Start.md](CODEBASE-Quick%20Start.md) for architecture overview
- Check [SETUP.md](SETUP.md) for build/installation help
- Open a [GitHub Discussion](https://github.com/prophesourvolodymyr/Obsitermishell/discussions)
- Ask in Obsidian Discord #plugin-dev

---

**Thank you for contributing to Obsitermishell! 🎉**
