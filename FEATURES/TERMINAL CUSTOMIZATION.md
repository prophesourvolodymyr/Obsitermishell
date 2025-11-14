# Feature: Terminal Customization Suite

**Status:** Active  
**Owner:** Appearance & UX  
**Goal:** Give users fine-grained control over the terminal look/feel without editing CSS snippets.

---

## 1. Feature Summary

| Area | Current Capabilities | Planned Enhancements |
|------|----------------------|-----------------------|
| Font & sizing | Adjustable font size (10–24px) from settings. | Font family selector + line-height control. |
| Colors | Theme synced with Obsidian + optional custom foreground (`terminalForeground`) and cursor accent (`cursorAccent`). | Per-profile palettes + background override slider. |
| Cursor | Shapes (block, bar, underline) + blink toggle. Ten premium animations (classic, glow, pulse, comet, glitch, ripple, ember, neon, glass, lightning, orbit) rendered via DOM overlay. | Animation speed slider, per-profile animations, ability to author custom animations. |
| Banner | ASCII logo & quick links configurable via settings (show/hide). | Themes for banner, widget surface integration. |
| Profiles | Saved presets for init commands + cwd mode; header dropdown to spawn them quickly. | Allow appearance overrides per profile (cursor, theme, widgets). |

---

## 2. Implementation Notes

- **Settings Tab** – Under Appearance we expose sliders, toggles, color pickers, and the cursor animation dropdown. All fields map to `ObsitermishellSettings`.
- **Theme propagation** – `TerminalView.buildTheme()` gathers the latest values and applies them to each xterm instance. `updateCursorAppearance()` re-runs whenever settings change.
- **Cursor overlay** – Non-classic animations hide the native cursor by setting theme cursor transparent and render a positioned div (`.obsitermishell-cursor-overlay-inner`) that follows buffer coordinates via `terminal.onRender/onCursorMove`.
- **Profiles** – Stored in settings and surfaced in the header dropdown. Selecting a profile spawns a new session with its init commands and cwd mode.

---

## 3. Roadmap

1. **Profile-linked themes** – let each profile store its own appearance overrides so “Python REPL” can glow cyan while “Git status” stays amber.
2. **Banner theming** – toggle between ASCII art themes (slant, block, minimal). Provide color presets for light/dark mode.
3. **Per-pane overrides** – allow the user to adjust font size/cursor animation per pane without changing globals (stored in session metadata).
4. **Export/import settings** – simple JSON blob so users can share favorite themes/animations.

---

## 4. Acceptance Criteria

- Appearance settings update all open terminals without reload.
- Cursor overlay stays in sync through window resize, scrollback, and font changes.
- Profile dropdown spawns the selected preset reliably; errors show a Notice.
- Documentation (User Guide or feature doc) explains how to customize fonts, colors, and animations.

This feature is highly visible—keep it polished and responsive so users feel the terminal belongs inside Obsidian rather than an embedded app.
