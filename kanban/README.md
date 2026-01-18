# Kanban Board — Spotify Wrapped 2.0

This is a **filesystem-based Kanban board** for managing work on the Spotify Wrapped 2.0 project.

## How It Works

### Columns (Folders)

Work items move through these stages:

- **`Backlog/`** — Not started yet, unclear, or not ready
- **`Ready/`** — Ready to be picked up (all dependencies met, fully scoped)
- **`InProgress/`** — Currently being worked on
- **`InReview/`** — Under review (code review, testing, validation)
- **`Done/`** — Completed

**Status is defined by folder location.** To move a ticket, move the file between folders.

### Tickets

Each ticket is a Markdown file with a unique ID:

```
kanban/Ready/001-data-freshness-indicator.md
```

**Filename format:** `{id}-{slug}.md`

### Required Metadata

Every ticket must include:

- **ID** — Unique numeric identifier
- **Priority** — P0 (critical), P1 (high), P2 (normal)
- **Size** — XS (< 2h), S (2-4h), M (4-8h), L (1-3 days), XL (3-5 days)
- **Epic** — Grouping label (e.g., "UI/UX Improvements")
- **Dependencies** — Ticket IDs this ticket is blocked by or blocks

### Moving Tickets

To move a ticket:

1. Move the file to the new folder
2. Update the "Status History" section in the ticket
3. Commit the change: `git add kanban/ && git commit -m "[#ID] Move to {status}"`

### Dependencies

Tickets declare dependencies using IDs:

```yaml
blocked_by: [005]
blocks: [006, 007]
parallel_with: [003]
```

**Rules:**
- Blocked tickets should stay in Backlog or Ready until unblocked
- Ready column should only contain unblocked work
- Update dependencies when tickets are completed

## Workflow

### Starting New Work

1. Pick the highest priority unblocked ticket from `Ready/`
2. Move it to `InProgress/`
3. Implement according to acceptance criteria
4. Commit with ticket ID: `[#ID] Description`
5. Move to `InReview/` when ready for review
6. Move to `Done/` when merged

### Creating New Tickets

1. Use the template: `kanban/_templates/ticket.md`
2. Assign next available ID
3. Fill in all required sections
4. Place in `Backlog/` or `Ready/` based on readiness
5. Commit: `git add kanban/ && git commit -m "Add ticket #ID"`

### Prioritization

- **P0** — Critical/blocker, work on these first
- **P1** — High priority, next in line
- **P2** — Normal priority, can be deferred

Work should be pulled from `Ready/` in priority order (P0 → P1 → P2).

## Files

- **`README.md`** (this file) — Board documentation
- **`AGENT.md`** — Operating instructions for AI agent
- **`BOARD.md`** — Current board snapshot (derived, can be regenerated)
- **`GIT_WORKFLOW.md`** — Git and branching guidelines
- **`_templates/ticket.md`** — Template for new tickets

## Principles

1. **Filesystem is source of truth** — Folder location = status
2. **Keep WIP low** — Limit InProgress tickets (default: 1-2)
3. **Small tickets preferred** — Break L/XL into smaller tickets
4. **Dependencies explicit** — Always declare blocking relationships
5. **Git = audit trail** — Every move is a commit

## Example Workflow

```bash
# Start work on ticket 001
git checkout -b 001-data-freshness
git mv kanban/Ready/001-data-freshness.md kanban/InProgress/
# Update status history in ticket
git commit -m "[#001] Move to InProgress"
git push origin 001-data-freshness

# Implement the feature
git commit -m "[#001] Add data freshness to API"
git commit -m "[#001] Display in dashboard header"
git push origin 001-data-freshness

# Open PR
gh pr create --title "[#001] Add data freshness" --body "Implements #001"

# After approval, squash merge
gh pr merge --squash --delete-branch

# Update local and complete ticket
git checkout main && git pull
git mv kanban/InProgress/001-data-freshness.md kanban/Done/
git commit -m "[#001] Move to Done"
git push origin main
```

**See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for complete git guidelines.**

## Quick Commands

```bash
# List all backlog tickets
ls kanban/Backlog/

# List ready tickets
ls kanban/Ready/

# See what's in progress
ls kanban/InProgress/

# Regenerate board view
# (AI agent can do this automatically)
```

## Board View

For a current snapshot of all tickets, see:

- **`BOARD.md`** — Shows all tickets organized by column

This file is generated automatically and can be regenerated at any time by scanning the folders.

