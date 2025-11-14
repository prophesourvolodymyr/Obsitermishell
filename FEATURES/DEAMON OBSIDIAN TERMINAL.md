# Feature: PTY Daemon & Process Lifecycle

**Status:** Shipped (maintenance ongoing)  
**Owner:** Core platform  
**Goal:** Provide a secure, reliable bridge between Obsidian’s renderer and a real shell process using `node-pty`.

---

## 1. Architecture Overview

```
+------------------------+     WebSocket      +--------------------------+
| Obsidian Renderer      |<------------------>| PTY Daemon (Node.js)     |
| - TerminalView (xterm) |   ws://127.0.0.1   | - node-pty spawns shell  |
| - PTYController        |------------------->| - Streams data/events    |
+------------------------+                     +--------------------------+
```

- **Daemon** (`daemon/index.js`): standalone Node process started by `DaemonManager`. Listens on `ws://127.0.0.1:37492`, spawns PTYs, streams data.
- **Controller** (`src/PTYController.ts`): renderer-side client that connects, spawns sessions, and relays resize/data commands.
- **Manager** (`src/DaemonManager.ts`): handles process lifecycle (start, restart, stop) with logging.

---

## 2. Life Cycle

1. Plugin loads → `DaemonManager.start()` boots the Node process (auto-retries up to 3 times).
2. TerminalView requests a session → `TerminalManager.createSession()` instantiates `PTYController`, which sends a `create` message with shell + cwd.
3. Daemon spawns shell (zsh/powershell/cmd). Output events (`type: 'output'`) stream back; renderer writes them into xterm.
4. User input goes through `type: 'data'` messages to the daemon.
5. When a tab closes, we send `kill`; `DaemonManager` stops the process on plugin unload.

---

## 3. Key Capabilities

- **Login shell detection** – `ShellDetector` picks the proper shell per platform and launches with `-l`/`-NoLogo` to load PATH/aliases.
- **Auto-CD modes** – Terminal sessions start in vault root, active note folder, or sticky directory based on settings.
- **Resilience** – `PTYController` queues messages while reconnecting; daemon restarts automatically after crashes.
- **Security** – Daemon binds to localhost only; no remote access without explicit future work.

---

## 4. Maintenance Tasks

| Task | Frequency | Notes |
|------|-----------|-------|
| Rebuild `node-pty` (`npm run rebuild:obsidian`) | whenever Obsidian updates Electron | Script wired into `postinstall`. |
| Keep WebSocket protocol in sync | on feature updates | JSON messages defined in PTYController + daemon. |
| Log monitoring | when debugging | Daemon stdout/stderr forwarded to console. |

---

## 5. Future Enhancements

- TLS/auth layer for remote daemon scenarios.
- Multiplexed channels to support background tasks without UI tabs.
- Structured logging & telemetry for crash analytics.

This feature underpins everything else in Obsitermishell. Keep documentation and tests up to date whenever the protocol changes.
