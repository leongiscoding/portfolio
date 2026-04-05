---
name: github-workflow
description: Complete GitHub workflow for branching, conventional commits, PRs, merging sub-branches into main, conflict resolution, versioning, and releases. Use when performing any git operation or asking about git workflow.
argument-hint: "[action] e.g. branch, commit, merge, release, conflict"

---

# GitHub Workflow — Portfolio Project

## Repository

- **Remote:** `git@github.com:leongiscoding/portfolio.git`
- **Default branch:** `main`
- **Deployment:** Vercel (auto-deploys from `main`)

### Prerequisites

- **GitHub CLI (`gh`):** Installed via Homebrew (`gh` v2.89.0+). Authenticate with `gh auth login` if session expires.
- **Git:** Configured with SSH access to the remote.

---

## 1. Branching Strategy

### Branch naming convention

```
<type>/<short-description>
```

| Type        | When to use                                  | Example                        |
|-------------|----------------------------------------------|--------------------------------|
| `feat/`     | New feature or section                       | `feat/blog-section`            |
| `fix/`      | Bug fix                                      | `fix/mobile-responsive`        |
| `style/`    | Visual / CSS-only changes                    | `style/hero-spacing`           |
| `refactor/` | Code restructure with no behaviour change    | `refactor/animation-hooks`     |
| `chore/`    | Dependencies, config, tooling                | `chore/upgrade-next`           |
| `docs/`     | Documentation only                           | `docs/readme-update`           |
| `perf/`     | Performance improvement                      | `perf/image-lazy-load`         |
| `test/`     | Adding or fixing tests                       | `test/contact-form`            |

### Create a new branch

Always branch off the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/my-new-feature
```

### List branches

```bash
# Local branches
git branch

# All branches including remote
git branch -a

# Delete a merged local branch
git branch -d feat/old-feature

# Force-delete an unmerged local branch (use with caution)
git branch -D feat/abandoned-feature

# Delete a remote branch
git push origin --delete feat/old-feature
```

---

## 2. Conventional Commits

This repo uses **conventional commits**. Every commit message follows:

```
<type>(<scope>): <short summary>
```

### Types

| Type         | Meaning                              |
|--------------|--------------------------------------|
| `feat`       | New feature                          |
| `fix`        | Bug fix                              |
| `style`      | Formatting, CSS, whitespace          |
| `refactor`   | Code change that neither fixes nor adds |
| `perf`       | Performance improvement              |
| `chore`      | Build, deps, config                  |
| `docs`       | Documentation                        |
| `test`       | Tests                                |
| `revert`     | Reverts a previous commit            |

### Scopes (project-specific)

Use the component or section name: `hero`, `navbar`, `projects`, `contact`,
`education`, `skills`, `about`, `footer`, `cursor`, `hamburger`, `preloader`,
`animations`, `three`, `layout`.

### Examples

```bash
git commit -m "feat(hero): add particle background animation"
git commit -m "fix(navbar): prevent layout shift on scroll"
git commit -m "style(projects): reduce card height and gaps"
git commit -m "refactor(hamburger): replace bar-slide with sine wave animation"
git commit -m "chore: upgrade next to 16.3"
```

### Breaking changes

Append `!` after the type/scope and add a body:

```bash
git commit -m "feat(layout)!: switch to new grid system

BREAKING CHANGE: Layout components now require GridProvider wrapper."
```

---

## 3. Staging and Committing

### Stage changes

```bash
# Stage specific files (preferred)
git add src/components/sections/Hero.tsx
git add src/styles/globals.css

# Stage all changes in a directory
git add src/components/

# Stage all tracked file changes (use sparingly)
git add -A

# Check what is staged vs unstaged
git status
```

### Review before committing

```bash
# See unstaged changes
git diff

# See staged changes
git diff --staged

# See a summary
git diff --stat
```

### Commit

```bash
git commit -m "feat(hero): add scroll-triggered parallax effect"
```

### Amend the last commit (only if NOT pushed yet)

```bash
git add <forgotten-file>
git commit --amend -m "feat(hero): add scroll-triggered parallax effect"
```

> **Warning:** Never amend a commit that has already been pushed to a shared
> branch. Create a new commit instead.

---

## 4. Pushing

### First push of a new branch

```bash
git push -u origin feat/my-new-feature
```

The `-u` flag sets the upstream so future pushes only need `git push`.

### Subsequent pushes

```bash
git push
```

### Push after rebasing (only your own branch)

```bash
git push --force-with-lease
```

> **Never force-push to `main`.** Use `--force-with-lease` instead of
> `--force` — it refuses to push if someone else has pushed to the branch
> since your last fetch.

---

## 5. Keeping Your Branch Up to Date

### Rebase onto latest main (preferred for clean history)

```bash
git checkout main
git pull origin main
git checkout feat/my-new-feature
git rebase main
```

If conflicts occur during rebase, see [Section 9: Conflict Resolution](#9-conflict-resolution).

### Merge main into your branch (alternative)

```bash
git checkout feat/my-new-feature
git merge main
```

---

## 6. Pull Requests

### Create a PR

```bash
gh pr create \
  --title "feat(hero): add particle background" \
  --body "## Summary
- Add Three.js particle system to hero section
- Responsive particle density based on viewport

## Test plan
- [ ] Desktop: particles render smoothly at 60fps
- [ ] Mobile: reduced particle count, no jank
- [ ] Lighthouse performance score unchanged"
```

### PR checklist before requesting review

1. Branch is up to date with `main` (rebase or merge)
2. `npm run build` passes locally with no errors
3. All pages render correctly at mobile, tablet, and desktop widths
4. Commit messages follow conventional commit format
5. No `.env`, credentials, or secrets included
6. No `console.log` or debug code left behind

### Review and merge a PR

```bash
# List open PRs
gh pr list

# View a specific PR
gh pr view 42

# Check out a PR locally for testing
gh pr checkout 42

# Approve a PR
gh pr review 42 --approve

# Merge a PR (squash is cleanest for feature branches)
gh pr merge 42 --squash --delete-branch

# Merge with a merge commit (preserves full history)
gh pr merge 42 --merge --delete-branch
```

---

## 7. Merging a Sub-Branch into Main

This is the full workflow when your feature, fix, or improvement branch is
ready to land on `main`.

### Step-by-step: sub-branch to main

```bash
# ── 1. Finish your work on the sub-branch ──
git checkout feat/my-feature
# ... make final changes ...
git add <files>
git commit -m "feat(section): final polish before merge"

# ── 2. Ensure your branch is up to date with main ──
git fetch origin
git rebase origin/main
# Resolve any conflicts (see Section 9), then:
#   git add <resolved-files>
#   git rebase --continue

# ── 3. Verify the build passes ──
npm run build

# ── 4. Push your branch ──
git push -u origin feat/my-feature
# If you rebased and already pushed before, use:
#   git push --force-with-lease

# ── 5. Open a Pull Request ──
gh pr create \
  --title "feat(section): describe what this adds/fixes" \
  --body "## Summary
- What changed and why

## Test plan
- [ ] Tested on desktop and mobile
- [ ] Build passes
- [ ] No console errors"

# ── 6. Review the PR ──
# Check the diff one last time
gh pr diff

# ── 7. Merge into main ──
# Squash merge (cleans up messy commit history into one)
gh pr merge --squash --delete-branch

# OR merge commit (preserves all individual commits)
gh pr merge --merge --delete-branch

# ── 8. Clean up locally ──
git checkout main
git pull origin main
git branch -d feat/my-feature   # delete local branch
```

### When to use which merge method

| Scenario                              | Method          | Why                                    |
|---------------------------------------|-----------------|----------------------------------------|
| Feature with many wip/fixup commits   | `--squash`      | One clean commit on main               |
| Large feature, meaningful history     | `--merge`       | Preserve the commit-by-commit story    |
| Tiny single-commit fix                | `--merge` or ff | Already clean, no squash needed        |
| Hotfix that must land immediately     | `--merge`       | Fast, preserves audit trail            |

### Pre-merge checklist

Before merging **any** sub-branch into `main`:

- [ ] Branch is rebased onto latest `main` (no merge conflicts)
- [ ] `npm run build` completes without errors
- [ ] All pages render correctly at mobile, tablet, and desktop
- [ ] Commit messages follow conventional commit format
- [ ] No debug code (`console.log`, commented-out blocks)
- [ ] No secrets or `.env` files staged
- [ ] PR description explains **what** and **why**
- [ ] If the change is visual, screenshots or a Vercel preview link included

---

## 8. Merging Strategies (Reference)

### Squash merge (recommended for feature branches)

Combines all commits into one clean commit on `main`:

```bash
gh pr merge --squash --delete-branch
```

Best for: feature branches with many small "wip" commits.

### Merge commit (for significant features)

Preserves the full branch history with a merge commit:

```bash
gh pr merge --merge --delete-branch
```

Best for: large features where the individual commit history is valuable.

### Fast-forward merge (local only)

```bash
git checkout main
git merge --ff-only feat/small-fix
git push origin main
git branch -d feat/small-fix
```

Best for: single-commit branches that are already linear with `main`.

---

## 9. Conflict Resolution

### During a rebase

```bash
git rebase main
# CONFLICT in src/components/sections/Hero.tsx

# 1. Open the conflicted file and resolve manually
#    Look for <<<<<<< HEAD / ======= / >>>>>>> markers

# 2. After resolving, stage the file
git add src/components/sections/Hero.tsx

# 3. Continue the rebase
git rebase --continue

# If you want to abort and go back to your original state
git rebase --abort
```

### During a merge

```bash
git merge main
# CONFLICT in src/components/sections/Hero.tsx

# 1. Resolve conflicts in the file

# 2. Stage resolved files
git add src/components/sections/Hero.tsx

# 3. Complete the merge
git commit -m "merge: resolve conflicts with main"

# To abort
git merge --abort
```

### Conflict resolution tips

- **Read both sides** before choosing. Understand what each change intended.
- **Check git log** on both branches to understand the context:
  ```bash
  git log --oneline main -- src/components/sections/Hero.tsx
  git log --oneline HEAD -- src/components/sections/Hero.tsx
  ```
- **Test after resolving.** Run `npm run build` to verify nothing is broken.
- **Prefer keeping both changes** when they modify different parts of the
  same block. Only discard code when you are certain it is superseded.
- **Use a merge tool** for complex conflicts:
  ```bash
  git mergetool
  ```

---

## 10. Versioning and Releases

### Semantic versioning (SemVer)

```
MAJOR.MINOR.PATCH
```

| Bump    | When                                          | Example         |
|---------|-----------------------------------------------|-----------------|
| `PATCH` | Bug fixes, style tweaks                       | `1.0.0 → 1.0.1` |
| `MINOR` | New section, feature, or component            | `1.0.1 → 1.1.0` |
| `MAJOR` | Full redesign, breaking layout/structure change | `1.1.0 → 2.0.0` |

### Tag a release

```bash
# After merging to main
git checkout main
git pull origin main

# Create an annotated tag
git tag -a v1.2.0 -m "v1.2.0: add blog section, fix mobile nav"

# Push the tag
git push origin v1.2.0

# Push all tags
git push origin --tags
```

### Create a GitHub release

```bash
gh release create v1.2.0 \
  --title "v1.2.0" \
  --notes "## What's new
- feat(blog): add blog section with MDX support
- fix(navbar): resolve mobile hamburger z-index issue
- style(footer): update social link hover effects"
```

### List releases and tags

```bash
# List tags
git tag -l

# List GitHub releases
gh release list

# View a specific release
gh release view v1.2.0
```

---

## 11. Common Workflows

### A. Add a new feature (end to end)

```bash
# 1. Start from latest main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feat/testimonials-section

# 3. Develop — make commits as you go
git add src/components/sections/Testimonials.tsx
git commit -m "feat(testimonials): scaffold component with props"

git add src/components/sections/Testimonials.tsx src/app/page.tsx
git commit -m "feat(testimonials): integrate into home page layout"

# 4. Keep branch current
git fetch origin
git rebase origin/main

# 5. Push
git push -u origin feat/testimonials-section

# 6. Open PR
gh pr create --title "feat(testimonials): add testimonials section" \
  --body "Adds a new testimonials carousel to the home page."

# 7. After approval, merge
gh pr merge --squash --delete-branch
```

### B. Fix a bug

```bash
git checkout main && git pull origin main
git checkout -b fix/cursor-flicker
# ... fix the bug ...
git add src/components/ui/CustomCursor.tsx
git commit -m "fix(cursor): prevent flicker on rapid mouse movement"
git push -u origin fix/cursor-flicker
gh pr create --title "fix(cursor): prevent flicker on rapid mouse movement"
gh pr merge --squash --delete-branch
```

### C. Hotfix on production

```bash
# Branch directly from the production tag or main
git checkout main && git pull origin main
git checkout -b fix/critical-build-error

# Fix and push immediately
git add .
git commit -m "fix: resolve build error blocking deployment"
git push -u origin fix/critical-build-error

# Fast-track merge
gh pr create --title "fix: critical build error" --body "Hotfix — blocking prod."
gh pr merge --merge --delete-branch
```

### D. Undo the last commit (not yet pushed)

```bash
# Keep changes staged
git reset --soft HEAD~1

# Keep changes unstaged
git reset HEAD~1

# Discard changes entirely (destructive)
git reset --hard HEAD~1
```

### E. Revert a pushed commit

```bash
# Create a new commit that undoes the target commit
git revert <commit-hash>
git push
```

### F. Stash work in progress

```bash
# Save current changes
git stash push -m "wip: halfway through hero refactor"

# List stashes
git stash list

# Apply the most recent stash
git stash pop

# Apply a specific stash
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

---

## 12. Git Hygiene

- **Commit often.** Small, focused commits are easier to review and revert.
- **Never commit to `main` directly.** Always use a branch + PR.
- **Delete branches after merge.** Keep the branch list clean.
- **Pull before you push.** Avoid unnecessary merge conflicts.
- **Write meaningful commit messages.** Future you will thank present you.
- **Don't commit generated files.** `node_modules/`, `.next/`, build output
  are in `.gitignore` for a reason.
- **Review your diff before committing.** `git diff --staged` catches mistakes.

---

## Quick Reference

| Task                        | Command                                      |
|-----------------------------|----------------------------------------------|
| New branch                  | `git checkout -b feat/name`                  |
| Stage files                 | `git add <files>`                            |
| Commit                      | `git commit -m "type(scope): message"`       |
| Push new branch             | `git push -u origin feat/name`               |
| Push updates                | `git push`                                   |
| Sync with main              | `git rebase origin/main`                     |
| Create PR                   | `gh pr create --title "..." --body "..."`    |
| Merge PR                    | `gh pr merge --squash --delete-branch`       |
| Tag release                 | `git tag -a v1.0.0 -m "v1.0.0: description"`|
| Resolve conflict            | Edit file → `git add` → `git rebase --continue` |
| Undo last commit (local)    | `git reset --soft HEAD~1`                    |
| Revert pushed commit        | `git revert <hash>`                          |
| Stash work                  | `git stash push -m "description"`            |
