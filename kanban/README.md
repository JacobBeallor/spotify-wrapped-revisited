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

### The Three-Command Workflow

This project uses a simple, collaborative workflow driven by three user commands:

#### 1. **"Pick up ticket #XXX"** 
User tells agent to implement a ticket.

**Agent does:**
- Creates feature branch
- Moves ticket to InProgress
- Implements feature according to acceptance criteria
- Commits and pushes code
- Notifies: "✅ Ticket #XXX is ready for testing"

**User does:**
- Tests the implementation
- Requests fixes if needed

#### 2. **"Prepare PR #XXX"**
User tells agent to prepare for PR after testing passes.

**Agent does:**
- Moves ticket to InReview
- Provides PR title and description template
- Includes branch name for reference

**User does:**
- Manually creates PR on GitHub with provided title/description
- Reviews and merges PR on GitHub when ready

#### 3. **"Close ticket #XXX"**
User tells agent PR has been merged.

**Agent does:**
- Pulls latest main
- Moves ticket to Done
- Updates blocked tickets (removes dependencies)
- Commits ticket move to main
- Notifies of any newly unblocked tickets

**User does:**
- Nothing! On to the next ticket.

### Responsibility Split

**Agent handles:**
- Code implementation
- Git commits and pushes to feature branches
- Ticket state management
- Providing PR templates

**User handles:**
- Testing the implementation
- Creating PRs on GitHub
- Merging PRs on GitHub
- Triggering ticket closure

**Key principle:** Agent never uses GitHub CLI (`gh`) commands or creates PRs. All GitHub interactions are manual.

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
# ============================================================
# PHASE 1: User says "Pick up ticket #001"
# ============================================================
# Agent creates branch and moves ticket
git checkout -b 001-data-freshness
git mv kanban/Ready/001-data-freshness.md kanban/InProgress/
git commit -m "[#001] Move to InProgress"
git push origin 001-data-freshness

# Agent implements the feature
git commit -m "[#001] Add data freshness to API"
git commit -m "[#001] Display in dashboard header"
git push origin 001-data-freshness

# Agent notifies: "✅ Ticket #001 is ready for testing"

# ============================================================
# PHASE 2: User tests, then says "Prepare PR #001"
# ============================================================
# Agent moves ticket and provides PR template
git mv kanban/InProgress/001-data-freshness.md kanban/InReview/
git commit -m "[#001] Move to InReview"
git push origin 001-data-freshness

# Agent provides:
# - PR Title: [#001] Add data freshness indicator
# - PR Description: (formatted with changes and testing)
# - Branch: 001-data-freshness

# User manually creates and merges PR on GitHub

# ============================================================
# PHASE 3: User says "Close ticket #001"
# ============================================================
# Agent updates ticket and board
git checkout main && git pull
git mv kanban/InReview/001-data-freshness.md kanban/Done/
git commit -m "[#001] Move to Done"
git push origin main

# Agent notifies of any newly unblocked tickets
```

**See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for complete git guidelines and detailed workflow steps.**

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

