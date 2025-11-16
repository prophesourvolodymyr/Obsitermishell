# Linear Sync Guide – Obsitermishell

Keeping `WORK/PROGRESS.md` and Linear aligned is how we prevent tasks from drifting. Follow this guide every time you touch the backlog for the **Obsitermishell Terminal** project.

---

## 1. Overview

| Why | When |
|-----|------|
| Linear is the public source of truth, `PROGRESS.md` is the fast scratchpad. We must keep them identical. | - At initial setup<br>- Whenever a new TODO is added to `PROGRESS.md`<br>- After every 5 completed requests (matches our MCP cadence)<br>- When priorities change |

**Always reference `WORK/PROGRESS.md` first.** That file defines scope, status, and “USER ONLY” boundaries.

---

## 2. Initial Setup

1. **Project check**  
   Use the Linear MCP server to list projects for the Personal/primary team. The project should be named **“Obsitermishell Terminal”**.  
   - If missing, create it with:  
     - Name: `Obsitermishell Terminal`  
     - Team: Personal (or the team the user specified)  
     - Description: `Real PTY terminal plugin for Obsidian with multi-session tabs, theming, and daemon architecture.`  
     - Status: `Active`

2. **Bootstrap issues**  
   Parse every unchecked task (`- [ ]`) in `WORK/PROGRESS.md` and mirror it to Linear:  
   - Title: copy the heading text (e.g., `M7 – Create README for release`).  
   - Description: include the bullet list / context from the section.  
   - Priority:  
     - High → anything under Milestones M7, “High Priority” ideas, or labeled urgent by the user.  
     - Medium → “In-Progress” or “Medium Priority” ideas.  
     - Low → “Low Priority” ideas or research tracks.  
   - Labels: `feature`, `bug`, `docs`, `release`, etc., based on the section.  
   - Project: `Obsitermishell Terminal`.

3. **Link back (optional but encouraged)**  
   After creating a Linear issue, note the issue key next to the task in `PROGRESS.md` (`- [ ] ... (Linear: OBS-123)`).

---

## 3. Priority Mapping Reference

Use this quick map when setting Linear priorities:

- **High (Urgent/High in Linear)**  
  - Remaining M7 release deliverables (README, settings guide, release checklist).  
  - “High Priority” idea backlog items (guide overlay persistence, cursor animation QA, animation API doc).  

- **Medium**  
  - “In-Progress” polish tasks.  
  - “Medium Priority” ideas (per-profile theme overrides, session restore, context menu, mobile feasibility notes).

- **Low**  
  - “Low Priority” ideas (run selection, extra ASCII animations, remote PTY exploration).  
  - Long-term research/whitepaper items.

---

## 4. Ongoing Sync Cadence

### After Every 5 User Requests
1. Count how many requests since the last sync (same counter we use for the Linear MCP cadence).  
2. If ≥5, run through this checklist:
   - Update `PROGRESS.md` to mark completed items.  
   - Use Linear MCP to locate each corresponding issue and set status to **Done**.  
   - Add a comment: `Completed on <date>. See vault history.`  
   - If a task changed scope, update the Linear description to match `PROGRESS.md`.

### When New Tasks Appear
1. Immediately capture them in `PROGRESS.md` under the correct priority section.  
2. Create the Linear issue right away with the template below.  
3. (Optional) copy the new Linear issue ID back into the markdown entry.

---

## 5. Issue Template for Linear

```
Title: [Component] – Brief summary

## Overview
Short description lifted from PROGRESS.md (include links/files).

## Task Breakdown
- [ ] Subtask / acceptance item
- [ ] …

## Files / Areas
- `src/TerminalView.ts`
- `styles.css`

## Acceptance Criteria
- [ ] Behaviour matches description
- [ ] Theme/settings respected
- [ ] Tests or build (`npm run build`) pass
- [ ] Progress.md updated

## Context
Progress tracker: PROGRESS.md (section X)
```

Use code fences in Linear so formatting stays intact.

---

## 6. Working with Linear MCP

You have the Linear MCP server available. Use it instead of manual API calls:

1. `list_projects` / `get_project` – confirm the Obsitermishell project exists.  
2. `create_issue` – supply title, description, priority, labels, project.  
3. `update_issue` – change status, priority, add comments.  
4. `list_issues` / `search` – find issues that correspond to `PROGRESS.md` entries.  
5. **Batch updates** – when closing the “5 request” loop, iterate over completed issues and mark them done.

**Never edit PROGRESS.md without reflecting it in Linear, and never mark Linear done without updating PROGRESS.md.**

---

## 7. Quick Checklist (print this mentally)

1. Read `WORK/PROGRESS.md`, note new/updated tasks.  
2. Ensure each task has a Linear twin.  
3. After every 5 user requests → update Linear statuses & leave comments.  
4. Mention in your response when the Linear sync/push happened (per CODEBASE guide).  
5. Keep “USER ONLY” items untouched unless explicitly told otherwise.

Stay disciplined and both systems will remain trustworthy. 💻✨
