# Mobile Terminal Ideas

**Obsitermishell** is currently **desktop-only** because it requires a local PTY (pseudoterminal) which isn't available on iOS/Android. However, here are some creative ideas for potential mobile functionality in future versions.

---

## 🚫 Current Limitation

**Why no mobile support now?**
- iOS and Android don't provide access to local shell environments
- No PTY (pseudoterminal) API available
- Sandboxed app model prevents direct command execution
- `node-pty` doesn't work on mobile platforms

**What happens on mobile?**
- Plugin shows a friendly "Desktop Only" notice
- No crashes or errors
- User sees clear explanation

---

## 💡 Future Mobile Ideas

### 1. **Remote Shell Connection** (SSH/WebSocket)

**Concept:** Connect to a remote server that hosts a shell session.

**Implementation:**
- Use SSH client library (e.g., `ssh2` for Node.js, or WebSocket-based terminal)
- User configures remote server credentials in settings
- Terminal connects to remote shell instead of local PTY
- Session persists on server, accessible from any device

**Pros:**
- ✅ Works on mobile
- ✅ Can run commands on powerful remote machine
- ✅ Session continuity (detach/reattach)

**Cons:**
- ❌ Requires remote server setup
- ❌ Security concerns (storing credentials)
- ❌ Network dependency

**Similar Products:** Termius, Blink Shell

---

### 2. **Cloud Shell Integration**

**Concept:** Integrate with cloud providers' shell services.

**Providers:**
- Google Cloud Shell
- AWS CloudShell
- Azure Cloud Shell
- GitHub Codespaces

**Implementation:**
- OAuth login to cloud provider
- Launch ephemeral shell instance
- Connect via WebSocket or API
- Files sync with vault (if applicable)

**Pros:**
- ✅ No server maintenance
- ✅ Built-in authentication
- ✅ Free tier often available

**Cons:**
- ❌ Vendor lock-in
- ❌ Requires cloud account
- ❌ Limited customization

---

### 3. **Obsidian-Hosted Shell Service**

**Concept:** Obsidian (the company) provides hosted shell sessions as a premium feature.

**How it works:**
- User subscribes to "Obsidian Terminal Pro"
- Obsidian hosts secure shell containers
- Plugin connects to assigned container
- Shell starts in synced vault directory (via Obsidian Sync)

**Pros:**
- ✅ Seamless integration
- ✅ Vault-aware from start
- ✅ No third-party setup

**Cons:**
- ❌ Requires Obsidian to build infrastructure
- ❌ Subscription cost
- ❌ Privacy concerns (commands on remote server)

---

### 4. **Read-Only "Command Runner"**

**Concept:** Limited command execution for safe, read-only operations.

**What it does:**
- Allow whitelisted commands only (e.g., `git status`, `ls`, `pwd`)
- Use REST APIs instead of shell (e.g., GitHub API for git commands)
- Display output in terminal-like UI
- No arbitrary command execution

**Pros:**
- ✅ Works entirely on mobile
- ✅ No security risks
- ✅ Useful for quick info queries

**Cons:**
- ❌ Very limited functionality
- ❌ Not a "real" terminal
- ❌ Doesn't support interactive CLIs

**Example Commands:**
- `git status` → GitHub API → display status
- `ls` → Obsidian Vault API → list files
- `pwd` → Show current note's folder

---

### 5. **Hybrid: Desktop Bridge**

**Concept:** Mobile app connects to terminal running on user's desktop.

**How it works:**
- Desktop runs local server (WebSocket or HTTP)
- Mobile plugin connects to desktop's IP
- Commands sent from mobile → executed on desktop → output streamed back
- Like a remote desktop, but terminal-only

**Pros:**
- ✅ Full shell access (via desktop)
- ✅ No cloud/third-party needed
- ✅ Synced vault access

**Cons:**
- ❌ Desktop must be running
- ❌ Same network (or VPN) required
- ❌ Complex setup

**Similar Products:** KDE Connect, Termius with port forwarding

---

### 6. **WebAssembly Terminal (Limited)**

**Concept:** Run a lightweight shell environment in WebAssembly.

**Technology:**
- [Emscripten](https://emscripten.org/)
- [Wasmer](https://wasmer.io/)
- [WebAssembly System Interface (WASI)](https://wasi.dev/)

**What works:**
- Basic Unix utilities compiled to WASM
- File system simulated in browser/app
- Limited language runtimes (Python via Pyodide, Node via wasi-node)

**Pros:**
- ✅ Runs entirely on device
- ✅ No network needed
- ✅ Sandbox security

**Cons:**
- ❌ Not a real OS shell
- ❌ Limited tool availability
- ❌ No git, native binaries, etc.
- ❌ Significant development effort

---

### 7. **Code Snippet Executor**

**Concept:** Execute code snippets from notes, not full shell.

**How it works:**
- User writes code blocks in notes:
  ```python
  print("Hello from mobile!")
  ```
- Tap "Run" button
- Code sent to execution backend (remote or WebAssembly)
- Output displayed inline or in terminal view

**Backends:**
- Remote: [Replit](https://replit.com/), [Judge0](https://judge0.com/), [Piston](https://github.com/engineer-man/piston)
- Local: WebAssembly runtimes (Pyodide for Python, QuickJS for JavaScript)

**Pros:**
- ✅ Useful for quick scripts
- ✅ Works on mobile
- ✅ Integrates with note-taking workflow

**Cons:**
- ❌ Not a terminal
- ❌ Limited to specific languages
- ❌ Doesn't run system commands

---

### 8. **Terminal Viewer (Read-Only)**

**Concept:** View terminal sessions from desktop, but can't control.

**How it works:**
- Desktop terminal records session (ANSI output)
- Mobile reads session log (read-only)
- Useful for monitoring long-running commands
- Optional: mobile can send kill signal

**Pros:**
- ✅ Simple implementation
- ✅ Useful for monitoring
- ✅ No security risks

**Cons:**
- ❌ No interactivity
- ❌ Limited use cases

---

## 🗳️ Community Feedback

Which mobile idea would **you** most want to see?

Vote or discuss on GitHub: [Link to discussions/issues]

---

## 🛠️ Implementation Priority

For **v0.2.0+**, we could explore:

1. **Remote Shell Connection** (most requested, highest utility)
2. **Code Snippet Executor** (complements note-taking)
3. **Read-Only Command Runner** (easy to implement, limited but useful)

---

## 🤝 Contributing

If you have ideas for mobile support, please:
- Open a GitHub issue with your proposal
- Join the discussion in GitHub Discussions
- Submit a PR if you want to prototype

---

**Note:** Mobile support is **not planned for v0.1.0**. These are long-term ideas pending community interest and feasibility studies.

---

**Last Updated:** 2025-11-10
