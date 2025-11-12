# Terminal Customization Roadmap

## Status

- ✅ Cursor style/blink/color controls landed (Dec 2025). Available under **Settings → Obsitermishell → Appearance**.
- 📝 This document now tracks future enhancements beyond the shipped cursor controls (e.g., presets, per-profile overrides).

## Goal

Give users fine-grained control over how the embedded terminal looks and feels without requiring manual CSS hacks. The initial scope focuses on cursor styling because it is the most frequent request and has clear visual impact.

## Proposed Settings

### 1. Cursor Style
- Options: `block`, `underline`, `bar`.
- Toggle for blink animation.
- Each style maps directly to xterm.js `cursorStyle` / `cursorBlink`.

### 2. Cursor Accent Color
- Color picker surfaced in the Appearance section.
- Falls back to theme cursor when unset.
- Preview swatch next to the picker so users immediately see the change.

### 3. Presets
- Quick presets like “Obsidian Dark”, “Neon Matrix”, “Classic VT100”.
- Selecting a preset would update cursor + optional background/foreground accents in one click.

### 4. Per-Profile Overrides (Stretch)
- Profiles could optionally store cursor overrides so, for example, a Claude profile can glow cyan while a Git profile stays amber.

## UX Notes

1. **Live Preview** – Every change should re-style the currently focused terminal instantly via the same plumbing that already updates themes/font size.
2. **Safe Defaults** – Fresh installs inherit the existing cursor (blinking block) so nobody is surprised.
3. **Reset Button** – One click to revert to defaults if the user experiments and dislikes the result.
4. **Validation** – If the color field is empty or invalid, fall back gracefully and highlight the input.

## Implementation Outline (Later)

1. Extend `ObsitermishellSettings` with the new fields (`cursorStyle`, `cursorBlink`, `cursorColor`).
2. Update `SettingsTab` to expose the controls with descriptions/tooltips.
3. During terminal creation, feed the new options into the xterm constructor.
4. For existing terminals, add an `updateCursorAppearance()` helper in `TerminalView` that iterates over `this.terminals` and applies the changes.

## Open Questions

- Should we also surface background/foreground color pickers or keep it scoped to the cursor for now?
- Do we want an “auto” cursor color that pulls from the active Obsidian theme (perhaps reading CSS variables)?
- What’s the most intuitive place for presets (dedicated modal vs dropdown with tiny previews)?

---

Feel free to append feedback or alternate ideas here before we start writing code. Once consensus is reached this document can become the implementation checklist.
