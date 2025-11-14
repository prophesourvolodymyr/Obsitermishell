# Feature: ASCII Animation Widgets

**Status:** In Progress  
**Owner:** Terminal UI squad  
**Goal:** Transform the static banner space above the terminal into a dynamic widget surface that can display lightweight ASCII animations and informational snippets without interfering with shell output.

---

## 1. Concept

We already render an ASCII welcome banner inside `.obsitermishell-terminal-banner`. This project elevates that area into a mini “widget canvas” where we can render ambient animations (pulse bars, clocks, git status, quotes, etc.) purely with text/ANSI so it feels native to the terminal aesthetic.

Constraints:

- Widgets must never write into the PTY buffer; everything lives in the DOM banner container.
- Animations should be subtle (1–2 fps) to avoid distracting users.
- Widgets must adapt to narrow panes (responsive layout).

---

## 2. Widget Library (MVP)

| Widget | Description | Update cadence | Notes |
|--------|-------------|----------------|-------|
| **Pulse Bar** | Animated █▒▒▒ bar cycling colors. | 750 ms | Reuse cursor accent color for glow effect. |
| **Clock** | HH:MM display. | 60 s | Pure renderer logic via `Intl.DateTimeFormat`. |
| **Git Branch** | `branch-name ●` if dirty. | On mount + when tab becomes active | Use `simple-git` to read `.git` at vault root (debounce to avoid spam). |
| **Tip-of-the-day** | Rotating hints (“Cmd+P opens palette”, “Profiles dropdown spawns presets”). | On new session | Takes strings from a curated list. |
| **Session stats** | Uptime + command count. | 5 s | Pull from `TerminalSession` metadata. |

Future slots reserve room for AI hints, CPU temp, remote status, etc.

---

## 3. Architecture

```
TerminalView.renderBanner()
 └── bannerEl
      ├── <pre> ASCII logo
      └── <div class="obsitermishell-widgets">
             <div data-widget="clock"></div>
             <div data-widget="pulse"></div>
             ...
```

- **Widget Manager** (`src/widgets/widget-manager.ts`): exports `getActiveWidgets(settings)` returning an array of `{ id, mount(el), update(session), dispose() }`.
- **Settings plumbing**: add multi-select under Appearance (“Banner Widgets”) plus a master toggle.
- **CSS**: define `.obsitermishell-widget` utility classes and keyframes (`@keyframes ascii-pulse`, etc.) in `styles.css`.

---

## 4. Implementation Steps

1. **Banner layout refresh** – convert existing text banner into two rows (logo, widget row). Ensure it collapses gracefully on narrow widths.
2. **Widget manager** – new helper that mounts/unmounts widgets when the banner is (re)rendered.
3. **Data sources** – clock/tips use pure JS; git widget uses `simple-git` (only when `.git` exists). Session stats pull from `TerminalManager`.
4. **Settings UI** – multi-select list (checkboxes) stored in `settings.bannerWidgets`. Provide defaults (clock + tip + pulse).
5. **Performance guardrails** – use `setInterval` with coarse granularity; avoid requestAnimationFrame loops.

---

## 5. Open Questions

- Should widgets be clickable (e.g., clicking Git widget opens quick actions)?  
- Do we need a plugin API so community devs can register custom widgets?  
- How should we persist per-widget state (e.g., “pin this tip”)?  

---

## 6. Acceptance Criteria

1. Banner can display at least three widgets simultaneously without overlapping the terminal scrollback.
2. Widgets are toggleable in settings and update live without reloading Obsidian.
3. No widget writes into the PTY buffer or causes xterm flicker.
4. Git widget gracefully handles non-repo vaults (shows “No repo”).

When these are met, we can ship the initial widget surface and gather feedback for more advanced animations.
