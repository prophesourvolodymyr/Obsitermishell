# Obsitermishell – Codebase & AI Collaboration Guide

Welcome to the central playbook for AI contributors on Obsitermishell, the real PTY terminal plugin for Obsidian Desktop. This document explains the product goals, folder conventions, the Markdown files you must keep in sync, and the rules for external tooling (Linear) so we never lose context.

---

## 1. Product Snapshot

Obsitermishell embeds a **real** terminal inside Obsidian by launching a background `node-pty` daemon and streaming I/O over WebSockets to the renderer. Key capabilities:

- **Daemon architecture** – `daemon/index.js` runs node-pty, `DaemonManager` boots it automatically with crash recovery, and `PTYController` bridges the WebSocket.
- **Multi-session terminal view** – `TerminalView` + `TerminalManager` provide tabs, session lifecycle, resize-aware fit, and banner rendering inside `.obsitermishell-terminal-wrapper`.
- **Onboarding & banner** – every session shows an ASCII banner plus a “Quick tour” overlay describing Tabs/New/Clear. The banner includes Donate / Work With Me / Repo / Website links.
- **Profiles** – settings let you define named presets (init commands + cwd mode). The terminal header now includes a profile dropdown that spawns a session instantly with that preset.
- **Cursor customization** – users can adjust font size, cursor style, foreground color, accent color, and choose from ten Ghostty-inspired animations (classic, glow, pulse, comet, glitch, ripple, ember, neon, glass, lightning, orbit). Non-classic styles use a DOM overlay cursor synced with xterm’s buffer.
- **Quality-of-life** – auto-CD modes (vault root, active folder, sticky), the Clear button issues `clear`, Git works because we spawn the real shell.

Keep these features in mind when triaging bugs or proposing enhancements.

---

## 2. Folder Overview

| Folder | Description & Rules |
|--------|---------------------|
| **`FEATURES/`** | Holds feature docs. Two flavors: `FEATURE-*.md` are active/approved features; `IDEAS-*.md` capture future concepts not yet started. Maintain this distinction. |
| **`WORK/`** | Project management hub. Contains `Progress.md`, `USER GUIDE.md`, and this guide. All AI task tracking lives here. |
| **`INSTRUCTIONS/`** | Reference manuals (Linear workflow, Git commit guide, etc.). Treat as **read-only** unless the user explicitly references a file. |
| **`JUNK/`** | Scratchpad for AI-generated explanations or current-state write-ups. Only write here when the user requests a draft or summary. Don’t spam it after every change. |

---

## 3. High-Touch Markdown Files

1. **`WORK/Progress.md`** – canonical backlog. **Every time you complete a user-requested job, you must update Progress.md** (mark TODOs, log Done entries, update risks). Never modify items labeled “USER ONLY”.
2. **`WORK/USER GUIDE.md`** – user-facing instructions (API setup, deployment steps, usage tips). Update only when the user asks. Never dump dev/feature specs here.
3. **`JUNK/*.md`** – temporary explanations. Only create/update when requested. Use this space for feature deep-dives or setup docs the user specifically wants to see.

Whenever you finish work, run this checklist: “Did I update Progress.md? Did the user ask for a guide? Did they request a write-up in JUNK?”

---

## 4. Folder Details for AI

### 4.1 `FEATURES/`
- **Purpose:** capture detailed specs.
- **File types:**  
  - `FEATURE-<name>.md` – active, approved work. Keep them current with requirements, acceptance criteria, and implementation notes.  
  - `IDEAS-<name>.md` – exploratory notes. No coding yet; just research/design.
- **AI rule:** only update a feature file when work is scoped there. Don’t upgrade an IDEA to FEATURE unless the user confirms.

### 4.2 `WORK/`
- **`Progress.md`** – central project tracker. Update after every completed task (unless marked “USER ONLY”). This includes marking checklist items, logging new DONE rows, adjusting risks, etc.
- **`USER GUIDE.md`** – instructions for the human user (how to get API keys, deploy, use features). Modify only when the user requests documentation.
- **`CODEBASE- GENERAL-AI-GUIDE.md`** – this guide. Keep it up to date when workflows change.

### 4.3 `INSTRUCTIONS/`
- Contains long-form instructions (Linear workflow, Git commit rules, etc.). **AI must not edit these unless explicitly asked.** Use them as references when performing tasks (e.g., raising Linear issues).

### 4.4 `JUNK/`
- Temporary workspace for explanations or setup descriptions. Only add content when the user explicitly asks for a write-up. Move polished docs elsewhere once approved.

---

## 5. External Tools & Automation Rules

### Linear (via MCP)
- Workspace: Obsotermishell project.
- **Cadence:** Every 5 user requests, query Linear through MCP, review open issues, and mark the ones you finished as completed. Keep a mental counter across interactions.
- If a user explicitly references Linear, address it immediately regardless of the cadence.

### Git Push Discipline
- **MANDATORY:** After you complete 5 user requests (same counter you use for Linear), you **must** push the latest local commits to `origin main`. No exceptions. This keeps the remote repo synchronized with the cadence the user expects.
- Flow: ensure work is committed (auto-commit watcher helps), run `git status` to confirm clean tree, then `git push origin main`. Call this out in your response so the user knows the sync happened or why it couldn’t.
- Its forbidden to place your brnding into the commit!!!

### Permissions & Writing Rules
- Safe to edit: `src/`, `styles.css`, `WORK/`, `FEATURES/`, `JUNK/`, `daemon/`, etc.
- Read-only unless asked: `INSTRUCTIONS/`.
- Place general feature explanations in `JUNK/` only on request.
- Do not modify “USER ONLY” items in `Progress.md`.
- Run relevant checks (`npm run build`, tests) before shipping.

---

## 6. AI Workflow Checklist

1. Understand the user request and identify impacted files/features.
2. (Every 5 requests) Check Linear issues via MCP and update completed ones.
3. Implement changes in code and styles as needed.
4. If the user asks for documentation, write it in the specified folder (`WORK/USER GUIDE.md`, `JUNK/`, etc.).
5. Update `WORK/Progress.md` to reflect what you just finished.
6. Summarize results, mention outstanding items, and reference verification steps.

Follow this playbook and we’ll keep Obsitermishell organized while shipping features quickly. 🚀
