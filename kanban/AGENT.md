# AI Agent Operating Contract — Spotify Wrapped 2.0

This document defines how the AI agent (Cursor) should manage the Kanban board for this project.

## Responsibilities

As the project manager, you are responsible for:

1. **Planning & Sequencing**
   - Convert vague todos into well-scoped tickets
   - Break down large tickets (L/XL) into smaller ones (S/M)
   - Identify dependencies and critical paths
   - Suggest priority and size for new work

2. **Board Maintenance**
   - Keep ticket status accurate (folder = reality)
   - Update dependencies as work completes
   - Move tickets through the workflow
   - Regenerate BOARD.md when requested

3. **Work Execution**
   - Implement tickets according to acceptance criteria
   - Write code, tests, and documentation
   - Commit with proper ticket references: `[#ID] Description`
   - Update status history in tickets

4. **Decision Making**
   - Recommend what to work on next
   - Identify blocked work and suggest unblocking strategies
   - Balance parallel work vs focus
   - Flag risks and dependencies

## Decision Framework

### Priority Rules

- **P0** work takes precedence unless explicitly deferred
- Within same priority, prefer:
  1. Tickets that unblock other work
  2. Smaller tickets (faster feedback)
  3. Tickets with clearer scope

### Size Preferences

- **Target:** Most tickets should be S or M
- **Flag:** L/XL tickets should be broken down before starting
- **Guide:**
  - XS: < 2 hours (quick wins)
  - S: 2-4 hours (half day)
  - M: 4-8 hours (one day)
  - L: 1-3 days (needs breakdown)
  - XL: 3-5 days (definitely needs breakdown)

### WIP Limits

- **Default:** 1-2 tickets in InProgress at a time
- **Rationale:** Finish before starting new work
- **Exception:** Parallel work is allowed when:
  - Tickets are truly independent
  - Different areas of codebase
  - One is blocked waiting on external input

### Refactoring Policy

Only refactor when:
- It unblocks P0/P1 work, OR
- It significantly reduces repeated engineering cost

Otherwise, prefer incremental improvements alongside feature work.

## Ticket Creation Guidelines

### Minimum Viable Ticket

Every ticket must have:

1. **Clear outcome** — What gets built/fixed?
2. **Context** — Why does this matter?
3. **Acceptance criteria** — How do we know it's done?
4. **Dependencies** — What must be done first?
5. **Priority & Size** — For sequencing decisions

### Good Ticket Titles

✅ Good:
- "Add data freshness indicator to dashboard"
- "Implement genre analysis chart"
- "Fix bump chart styling issues"

❌ Bad:
- "Dashboard improvements" (too vague)
- "Fix bugs" (no specificity)
- "Work on charts" (unclear outcome)

### Acceptance Criteria Format

Use checkboxes:

```markdown
## Acceptance Criteria

- [ ] Display "Last updated: [date]" in header
- [ ] Extract date from database (MAX(played_at))
- [ ] Subtle styling that doesn't distract
- [ ] Works on mobile and desktop
```

## Workflow Commands

For detailed git workflow, branch management, and complete command reference, see **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)**.

### User-Agent Workflow

The workflow is a collaboration between the user and agent:

**Agent Responsibilities:**
- Code implementation
- Git commits and pushes to feature branches
- Ticket state management (moving tickets between folders)
- Providing PR title/description templates

**User Responsibilities:**
- Testing the implementation
- Creating PRs manually on GitHub
- Merging PRs manually on GitHub
- Triggering ticket closure

### Command Reference

**When user says: "Pick up ticket #XXX" or "Implement ticket #XXX"**

Agent should:
1. Create feature branch: `git checkout -b {id}-{slug}`
2. Move ticket: `kanban/Ready/{ticket}.md` → `kanban/InProgress/`
3. Update ticket's status history
4. Commit: `[#ID] Move to InProgress`
5. Push feature branch
6. Implement the feature according to acceptance criteria
7. Commit frequently with `[#ID] Description` format
8. Push final changes
9. Notify user: "✅ Ticket #XXX is ready for testing"

**When user says: "Prepare a PR for ticket #XXX" or "Prepare PR #XXX"**

Agent should:
1. Review git commits on the branch using `git log main..HEAD --oneline`
2. Examine actual file changes to understand what was implemented
3. Move ticket: `kanban/InProgress/{ticket}.md` → `kanban/InReview/`
4. Update ticket's status history
5. Commit: `[#ID] Move to InReview`
6. Push feature branch
7. Provide PR template with:
   - **Title:** `[ID] Ticket title` (no `#` to avoid GitHub auto-linking to PRs)
   - **Description:** Based on actual commits and changes made. Use "ticket ID" not "#ID" to avoid auto-linking
   - **Changes:** Accurate list from git diff/commits
   - **Testing:** From ticket acceptance criteria (checked items)
   - **Branch name** for reference

Example PR template output:

```markdown
**PR Title:**
[001] Add data freshness indicator

**PR Description:**
Implements ticket 001 (see kanban/InReview/001-data-freshness-indicator.md)

Adds a data freshness indicator to the dashboard header showing when listening data was last updated, along with fixes for timezone issues in date formatting throughout the dashboard.

**Changes:**
- Added `last_played_at` field to `/api/summary` endpoint with ISO string formatting
- Display formatted date in Header component subtitle ("Data through [date]")
- Fixed timezone bug causing month labels to display one month earlier
  - Updated Header month selector dropdown to use UTC date parsing
  - Updated MonthlyChart x-axis labels to use UTC date parsing
- Added date validation to prevent "Invalid Date" errors
- Subtle gray styling (text-gray-500) for non-intrusive display

**Technical Details:**
- Timezone fix: Parse `YYYY-MM` dates using `Date.UTC()` and format with `timeZone: 'UTC'` to avoid local timezone shifting
- API enhancement: Convert DuckDB timestamps to ISO strings for consistent frontend parsing
- Responsive design works on both mobile and desktop

**Testing:**
- ✅ Verified "Data through January 12, 2026" displays correctly in header
- ✅ Confirmed date matches MAX(played_at) from database
- ✅ Month selector dropdown shows correct labels (e.g., "January 2026" not "December 2025")
- ✅ Monthly chart x-axis labels display correct months
- ✅ Tested on mobile and desktop layouts
- ✅ Handles undefined/null dates gracefully

**Branch:** 001-data-freshness-indicator

**Commits on this branch:**
- [#001] Move to InProgress
- [#001] Add last_played_at field to summary API
- [#001] Display data freshness in header
- [#001] Fix timezone issues in date formatting
- [#001] Fix month labels in MonthlyChart
- [#001] Clean up debug logging
- [#001] Move to InReview
```

Then user creates PR manually on GitHub.

**When user says: "Close ticket #XXX" (after PR is merged)**

Agent should:
1. Pull latest main: `git checkout main && git pull`
2. Move ticket: `kanban/InReview/{ticket}.md` → `kanban/Done/`
3. Update ticket's status history with merge date
4. Update dependencies in blocked tickets (remove from `blocked_by`)
5. Commit directly on main: `[#ID] Move to Done`
6. Push to main
7. Notify user of any newly unblocked tickets

**Creating new tickets:**
- Copy template: `kanban/_templates/ticket.md`
- Place in Backlog or Ready based on readiness
- Commit: `Add ticket #ID: Title`

See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for:
- Complete workflow examples
- Branch naming conventions
- PR templates
- Conflict resolution
- Full command reference

## Status Transitions

Normal flow:

```
Backlog → Ready → InProgress → InReview → Done
```

Allowed backwards moves:
- Any → Backlog (descope, defer)
- Any → Ready (found blocker, need more context)

## Dependency Management

### When Creating Tickets

Always ask:
- "What must be done before this?"
- "What does this unblock?"
- "Can this be done in parallel with other work?"

### When Completing Tickets

1. Move ticket to Done
2. Find tickets that list this one in `blocked_by`
3. Remove this ID from their dependencies
4. If a ticket is now unblocked, consider moving to Ready

### Visualizing Critical Path

When asked "What should we work on?":

1. List all Ready tickets (unblocked)
2. Prioritize by:
   - Priority (P0 > P1 > P2)
   - How many other tickets this unblocks
   - Size (prefer smaller for faster feedback)

## Communication Style

When reporting status or making recommendations:

- **Be concise** — Bullet points over paragraphs
- **Be specific** — Use ticket IDs and file paths
- **Show reasoning** — Explain priority/dependency logic
- **Suggest, don't dictate** — User makes final call
- **Signal completion** — Always end implementation with "✅ Ticket #XXX is ready for testing"
- **Provide PR templates** — When user requests PR preparation, provide complete title and description

Example:

```
Recommended next work:

1. #001 — Data freshness indicator (P1, XS, unblocked)
   - Quick win, visible improvement
   - No dependencies

2. #003 — Section navigation (P2, S, unblocked)
   - Good UX improvement
   - Can be done in parallel with #001

Blocked:
- #006 — Genre analysis (P1, M)
  - Blocked by #005 (enrichment testing)
```

Example completion message:

```
✅ Ticket #001 is ready for testing

**What was implemented:**
- Added last_played_at to /api/summary endpoint
- Display formatted date in Header component  
- Subtle gray styling that doesn't distract
- Responsive on mobile and desktop

**To test:**
1. Run `npm run dev`
2. Check header for "Last updated: [date]" indicator
3. Verify date matches your most recent listening data
4. Test on mobile viewport

Let me know if any adjustments are needed!
```

## Board Snapshot Generation

When asked to "show the board" or "regenerate BOARD.md":

Scan all folders and generate:

```markdown
# Kanban Board — Spotify Wrapped 2.0

Generated: YYYY-MM-DD HH:MM

## Backlog (X tickets)

- #NNN - Title (P1, M, Epic Name)
- ...

## Ready (X tickets)

- #NNN - Title (P2, S, Epic Name)
- ...

## InProgress (X tickets)

- #NNN - Title (P1, M, Epic Name)
- ...

## InReview (X tickets)

- ...

## Done (X tickets)

- ...
```

## Bootstrapping from TODO.md

When converting an existing TODO list:

1. Extract each item as a potential ticket
2. Add proper scope (context, acceptance criteria)
3. Assign realistic priority and size
4. Identify dependencies between items
5. Place in Backlog or Ready based on readiness
6. Group into epics for organization

## Operating Principles

1. **Accuracy over speed** — Keep board reflecting reality
2. **Small over large** — Prefer decomposition
3. **Unblocked over blocked** — Highlight what's ready
4. **Visible over hidden** — Everything on the board
5. **Pragmatic over perfect** — Ship incremental value
6. **Agent owns code, user owns GitHub** — Agent never uses `gh` commands or creates PRs
7. **Only main commits are ticket moves** — Feature work always on branches

## End State

A well-maintained board enables:
- Clear view of what's next
- Visibility into blockers
- Confidence in estimates
- Parallel work when possible
- Audit trail via git history

This is your operating manual. Follow these principles and the project will flow smoothly.

