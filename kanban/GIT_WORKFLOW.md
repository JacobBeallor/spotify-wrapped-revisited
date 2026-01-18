# Git Workflow Guidelines

This document defines git and branching conventions for the project.

---

## Workflow Philosophy

This project uses a **collaborative workflow** where:

- **Agent** handles: Code implementation, git commits/pushes, ticket state management
- **User** handles: Testing, PR creation on GitHub, PR merging on GitHub

The agent never uses GitHub CLI (`gh`) commands or creates PRs directly. All GitHub interactions are done manually by the user.

### Three User Commands

The entire workflow is driven by three simple user commands:

1. **"Pick up ticket #XXX"** → Agent implements code and notifies when ready for testing
2. **"Prepare PR #XXX"** → Agent moves ticket to InReview and provides PR title/description
3. **"Close ticket #XXX"** → Agent moves ticket to Done (after user merges PR on GitHub)

---

## Branch Strategy

### Main Branch
- **`main`** — Always deployable, protected
- Represents production-ready code
- All features merge here via PR

### Feature Branches
- **One branch per ticket**
- Format: `{ticket-id}-{short-slug}`
- Examples:
  - `001-data-freshness`
  - `023-genre-analysis`
  - `042-fix-chart-styling`

### Branch Lifecycle
1. Create branch from `main` when starting ticket
2. Work on branch with frequent commits
3. Open PR when ready
4. Squash merge to `main` after approval
5. Delete branch after merge

---

## Workflow Steps

### Phase 1: Agent Implements Ticket

**User says:** "Pick up ticket #001" or "Implement ticket #001"

**Agent does:**

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b 001-data-freshness

# 3. Move ticket to InProgress
git mv kanban/Ready/001-data-freshness.md kanban/InProgress/
# Edit ticket to update status history
git add kanban/InProgress/001-data-freshness.md
git commit -m "[#001] Move to InProgress"
git push origin 001-data-freshness

# 4. Implement feature
# Make commits referencing ticket ID
git commit -m "[#001] Add last_played_at to API response"
git commit -m "[#001] Display freshness in header"
git commit -m "[#001] Add date formatting"

# Push frequently
git push origin 001-data-freshness

# 5. When done, notify user
# Agent says: "✅ Ticket #001 is ready for testing"
```

### Phase 2: User Tests

User manually tests the implementation on the feature branch.

If issues found, user says "Fix X in ticket #001" and agent continues development.

### Phase 3: User Requests PR Preparation

**User says:** "Prepare a PR for ticket #001" or "Prepare PR #001"

**Agent does:**

```bash
# 1. Review commits on the branch
git log main..HEAD --oneline
git diff main..HEAD --stat

# 2. Move ticket to InReview
git mv kanban/InProgress/001-data-freshness.md kanban/InReview/
# Edit ticket to update status history
git add kanban/InReview/001-data-freshness.md
git commit -m "[#001] Move to InReview"
git push origin 001-data-freshness

# 3. Provide PR template based on actual changes
```

**Agent provides:**

```markdown
**PR Title:**
[001] Add data freshness indicator

**PR Description:**
Implements ticket 001 (see kanban/InReview/001-data-freshness-indicator.md)

Adds data freshness indicator to dashboard header showing when listening data was last updated, along with fixes for timezone issues in date formatting.

**Changes:**
- Added `last_played_at` field to `/api/summary` endpoint with ISO string formatting
- Display formatted date in Header component subtitle
- Fixed timezone bug in month labels (UTC parsing to avoid local timezone shift)
- Updated Header month selector and MonthlyChart x-axis labels
- Added date validation for graceful error handling

**Testing:**
- ✅ Verified date displays correctly
- ✅ Tested on mobile and desktop
- ✅ Confirmed month labels show correct values
- ✅ Checked with different data ranges

**Branch:** 001-data-freshness

**Commits on this branch:**
- [#001] Move to InProgress
- [#001] Add last_played_at to API response
- [#001] Display freshness in header
- [#001] Fix timezone issues in date formatting
- [#001] Move to InReview
```

**Note:** In the commits list, escape the `#` symbol as `\#` to prevent auto-linking (e.g., `[\#001]`)

**User then:**
- Manually creates PR on GitHub with provided title/description
- Adds labels (enhancement, bug, etc.)
- Manually squash merges PR when ready

### Phase 4: User Closes Ticket

**User says:** "Close ticket #001" (after PR is merged)

**Agent does:**

```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Move ticket to Done
git mv kanban/InReview/001-data-freshness.md kanban/Done/
# Edit ticket to update status history
git add kanban/Done/001-data-freshness.md
git commit -m "[#001] Move to Done"
git push origin main

# 3. Update any blocked tickets
# Remove #001 from blocked_by in other tickets
# Notify user of newly unblocked tickets
```

---

## Commit Message Conventions

### Format

```
[#ID] Brief description of change

Optional longer explanation if needed.
```

### Examples

✅ **Good:**
```
[#001] Add data freshness to API response
[#023] Implement genre analysis chart
[#042] Fix bump chart line width types
```

❌ **Bad:**
```
Update code           # No ticket ID
[#001] Various fixes  # Too vague
Fix bug              # No context
```

### Multi-Ticket Commits (Rare)

If a commit touches multiple tickets:
```
[#001][#003] Update header for freshness and navigation
```

---

## PR Guidelines

### PR Title

Use ticket title with ticket ID (no `#` symbol to avoid GitHub auto-linking):
```
[001] Add data freshness indicator
```

### PR Description Template

```markdown
Implements ticket ID (see kanban/InReview/ID-slug.md)

Brief description of what this PR does.

**Changes:**
- Change 1
- Change 2
- Change 3

**Testing:**
- ✅ Test 1
- ✅ Test 2
- ✅ Test 3

**Screenshots:** (if applicable)
[Add screenshots]
```

**Note:** Avoid using `#ID` anywhere in PR titles or descriptions to prevent GitHub auto-linking to issues/PRs. Use plain ticket numbers like `001` or `ticket 001` instead.

### PR Labels

Apply appropriate labels:
- `enhancement` — New feature
- `bug` — Bug fix
- `docs` — Documentation only
- `quick-win` — Small, fast improvement

---

## Merge Strategy

### Squash Merge (Preferred)

**Use for:** All feature branches

**Benefits:**
- Clean, linear main branch history
- One commit per ticket (easy to understand)
- Easy to revert entire features
- Matches ticket-based workflow

**How:**
- GitHub UI: Select "Squash and merge" (required method)
- All merges must go through PR review

**Squashed commit message format:**
```
[#001] Add data freshness indicator (#PR_NUMBER)

- Add last_played_at to API
- Display in header component
- Format date for readability

Co-authored-by: AI Agent <cursor@ai.local>
```

**Note:** Use `[#ID]` format in squashed commit messages (this goes into main branch history). Use `[ID]` format (no `#`) in PR titles to avoid GitHub auto-linking issues.

---

## Special Cases

### Ticket Moves Only Exception

**Exception:** Moving tickets to `Done` is the ONLY operation that commits directly to main.

This is allowed because:
- Ticket state changes are administrative, not code changes
- No risk of breaking functionality
- Keeps the workflow efficient
- User has already tested and approved the code via PR

All other changes (code, docs, configs) MUST go through feature branches and PRs.

---

## Dependent Tickets

If ticket B depends on ticket A:

```bash
# Create B's branch from A's branch (not main)
git checkout 001-data-freshness
git checkout -b 002-date-filter

# When A merges, rebase B onto main
git checkout 002-date-filter
git rebase main
```

---

### Resolving Conflicts

```bash
# If main has moved ahead
git checkout 001-data-freshness
git rebase main

# Fix conflicts, then:
git add .
git rebase --continue

# Force push (since we rebased)
git push origin 001-data-freshness --force-with-lease
```

**Note:** Squash merging typically avoids most conflicts.

---

## Branch Protection Rules

### Main Branch Protection

Configure on GitHub:
- ✅ Require PR before merging
- ✅ Require status checks to pass (if CI setup)
- ✅ Automatically delete head branches
- ⚠️ Require approvals (optional for solo projects)
- ⚠️ Require linear history (enforced by squash)

---

## Keeping Branches Clean

### Before Opening PR

```bash
# 1. Rebase on main to ensure up-to-date
git rebase main

# 2. Clean up commit history if messy
git rebase -i main

# 3. Force push (after rebase)
git push origin 001-data-freshness --force-with-lease
```

### Interactive Rebase (Optional)

Use to clean up commits before PR:

```bash
git rebase -i main

# In editor, mark commits to:
# pick   = keep
# squash = combine with previous
# reword = change commit message
# drop   = remove commit
```

**Not required** — squash merge will clean history anyway.

---

## Ticket ↔ Git State Sync

Always keep ticket status in sync with git state:

| Git State | Ticket Location | Status |
|-----------|----------------|--------|
| No branch | `Backlog/` or `Ready/` | Not started |
| Feature branch exists | `InProgress/` | Working |
| PR open | `InReview/` | Under review |
| PR merged, branch deleted | `Done/` | Complete |

**Rule:** Move ticket when git state changes, commit the move.

---

## Commands Reference

```bash
# Create feature branch
git checkout -b 001-feature-name

# Commit with ticket ID
git commit -m "[#001] Description"

# Push to remote
git push origin 001-feature-name

# Clean up local branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

---

## Example Full Workflow

### Complete Ticket Lifecycle

```bash
# ============================================================
# PHASE 1: Agent picks up ticket (user says "Pick up #001")
# ============================================================
git checkout main && git pull
git checkout -b 001-data-freshness
git mv kanban/Ready/001-data-freshness.md kanban/InProgress/
git add . && git commit -m "[#001] Move to InProgress"
git push origin 001-data-freshness

# ============================================================
# PHASE 2: Agent implements (agent works on code)
# ============================================================
# ... make changes ...
git add .
git commit -m "[#001] Add freshness to API"
git push origin 001-data-freshness

# ... more changes ...
git commit -m "[#001] Display in header"
git push origin 001-data-freshness

# Agent notifies: "✅ Ticket #001 is ready for testing"

# ============================================================
# PHASE 3: User tests, then says "Prepare PR #001"
# ============================================================
# Review changes on the branch
git log main..HEAD --oneline
git diff main..HEAD --stat

# Move ticket to InReview
git mv kanban/InProgress/001-data-freshness.md kanban/InReview/
git add . && git commit -m "[#001] Move to InReview"
git push origin 001-data-freshness

# Agent provides PR template:
# - Title: [001] Add data freshness indicator (no # to avoid auto-link)
# - Description: (based on actual commits and git diff)
# - Changes: Accurate list from branch commits
# - Testing: Based on checked acceptance criteria
# - Commits list from branch
# - Branch: 001-data-freshness

# User manually creates PR on GitHub
# User manually merges PR when ready

# ============================================================
# PHASE 4: User says "Close ticket #001" (after merge)
# ============================================================
git checkout main && git pull
git mv kanban/InReview/001-data-freshness.md kanban/Done/
git add . && git commit -m "[#001] Move to Done"
git push origin main

# Agent updates any blocked tickets and notifies user
```

---

## Tips

- ✅ **Always reference ticket ID** in commits and PRs
- ✅ **Push early, push often** — don't hoard local changes
- ✅ **Keep branches short-lived** — merge within 1-3 days
- ✅ **Rebase on main** before requesting PR preparation (clean conflicts early)
- ✅ **Test before requesting PR** — user tests, agent fixes, iterate
- ✅ **Delete branches after merge** — user does this on GitHub
- ✅ **Agent never uses `gh` commands** — all GitHub interactions are manual
- ✅ **Only ticket moves commit to main** — all code goes through PRs
- ⚠️ **Never force push to main** — only to feature branches
- ⚠️ **User controls GitHub** — agent never creates or merges PRs

