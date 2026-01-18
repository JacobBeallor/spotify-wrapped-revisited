# Git Workflow Guidelines

This document defines git and branching conventions for the project.

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

### Starting a Ticket

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
```

### During Development

```bash
# Make commits referencing ticket ID
git commit -m "[#001] Add last_played_at to API response"
git commit -m "[#001] Display freshness in header"
git commit -m "[#001] Add date formatting"

# Push frequently
git push origin 001-data-freshness
```

### Opening a PR

```bash
# Push final changes
git push origin 001-data-freshness

# Create PR (via GitHub UI or gh CLI)
gh pr create \
  --title "[#001] Add data freshness indicator" \
  --body "Implements #001

Adds data freshness indicator to dashboard header.

**Changes:**
- Add last_played_at to /api/summary
- Display formatted date in Header component
- Subtle styling for non-intrusive display

**Testing:**
- ✅ Verified date displays correctly
- ✅ Tested on mobile and desktop
- ✅ Checked with different data ranges"
```

### After PR Approval

```bash
# Squash merge via GitHub UI
# OR via CLI:
gh pr merge 001-data-freshness --squash --delete-branch

# Locally: update main and move ticket to Done
git checkout main
git pull origin main

git mv kanban/InProgress/001-data-freshness.md kanban/Done/
# Edit ticket to update status history
git add kanban/Done/001-data-freshness.md
git commit -m "[#001] Move to Done"
git push origin main
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

Use ticket title:
```
[#001] Add data freshness indicator
```

### PR Description Template

```markdown
Implements #001

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
- GitHub UI: Select "Squash and merge"
- CLI: `gh pr merge --squash`

**Squashed commit message format:**
```
[#001] Add data freshness indicator (#PR_NUMBER)

- Add last_played_at to API
- Display in header component
- Format date for readability

Co-authored-by: AI Agent <cursor@ai.local>
```

---

## Special Cases

### Quick Fixes (< 5 min)

For trivial changes, can commit directly to main:

```bash
git checkout main
git pull origin main

# Make quick fix
git add .
git commit -m "[#001] Fix typo in header text"
git push origin main

# Still reference ticket ID!
```

**Use sparingly** — PRs are preferred for visibility.

---

### Dependent Tickets

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

# Open PR
gh pr create --title "[#001] Title" --body "Implements #001"

# Check PR status
gh pr status

# Merge PR with squash
gh pr merge 001-feature-name --squash --delete-branch

# Clean up local branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

---

## Example Full Workflow

```bash
# 1. Start ticket
git checkout main && git pull
git checkout -b 001-data-freshness
git mv kanban/Ready/001-data-freshness.md kanban/InProgress/
git add . && git commit -m "[#001] Move to InProgress"
git push origin 001-data-freshness

# 2. Implement
# ... make changes ...
git add .
git commit -m "[#001] Add freshness to API"
git push origin 001-data-freshness

# 3. More changes
git commit -m "[#001] Display in header"
git push origin 001-data-freshness

# 4. Open PR
gh pr create --title "[#001] Add data freshness" --body "Implements #001"

# 5. After approval, merge
gh pr merge --squash --delete-branch

# 6. Update local
git checkout main && git pull
git mv kanban/InProgress/001-data-freshness.md kanban/Done/
git add . && git commit -m "[#001] Move to Done"
git push origin main
```

---

## Tips

- ✅ **Always reference ticket ID** in commits and PRs
- ✅ **Push early, push often** — don't hoard local changes
- ✅ **Keep branches short-lived** — merge within 1-3 days
- ✅ **Rebase on main** before opening PR (clean conflicts early)
- ✅ **Write clear PR descriptions** — help reviewers
- ✅ **Delete branches after merge** — keep repo clean
- ⚠️ **Never force push to main** — only to feature branches
- ⚠️ **Test locally before PR** — don't rely on CI to catch bugs

