# Module 9: Advanced Git Commands

## Learning Objectives
After completing this module, you will be able to:
- Master advanced Git operations for complex workflows and troubleshooting.
- Temporarily shelve uncommitted work using `git stash`.
- Undo commits and unstage changes using `git reset` (Soft, Mixed, Hard).
- Safely reverse public commits using `git revert`.
- Selectively cherry-pick individual commits with `git cherry-pick`.
- Reapply and linearize commit history using `git rebase`.
- Create and manage lightweight and annotated Git release tags (`git tag`).

---

## 9.1 Introduction
As software projects expand in complexity, developers frequently encounter scenarios that require advanced history manipulation:
- Switching tasks abruptly without losing unfinished work.
- Undoing accidental commits or incorrect file additions.
- Safely reverting broken production deployments.
- Copying a critical bug fix from one branch into another without merging entire branches.
- Linearizing commit history before creating a pull request.
- Marking official production releases with cryptographically verifiable tags.

Git provides a robust suite of advanced commands to manage these situations with surgical precision.

---

## 9.2 Git Stash (`git stash`)
`git stash` temporarily shelves (stashes) uncommitted modifications in your working directory and staging area, restoring your workspace to a clean `HEAD` state.

```bash
# Stash current uncommitted changes
git stash

# Stash with a descriptive message
git stash save "WIP: payment gateway integration"

# List all stashed entries
git stash list

# Reapply the most recent stash and remove it from stash list
git stash pop

# Reapply a stash without removing it from stash list
git stash apply stash@{0}

# Delete a specific stash
git stash drop stash@{0}

# Clear all stashed states
git stash clear
```

---

## 9.3 Git Reset (`git reset`)
`git reset` moves the current branch pointer backward to a specified commit. It provides three primary modes:

```text
                        [ HEAD~1 ]
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
  --soft                --mixed                --hard
(Keeps Staged)     (Keeps Working Tree)   (Discards Everything)
```

### 1. Soft Reset (`--soft`)
Moves `HEAD` back to the target commit but keeps all changes staged in the index.
```bash
git reset --soft HEAD~1
```

### 2. Mixed Reset (`--mixed` - Default)
Moves `HEAD` back and unstages changes, keeping all file modifications in your working directory.
```bash
git reset HEAD~1
```

### 3. Hard Reset (`--hard`)
Moves `HEAD` back and **permanently discards** all working directory modifications and staged files.
```bash
git reset --hard HEAD~1
```

> [!CAUTION]
> `git reset --hard` permanently wipes out uncommitted changes. Use with extreme care.

---

## 9.4 Git Revert (`git revert`)
`git revert` creates a **new commit** that applies the exact inverse of a target commit. It is the safe, recommended way to undo changes on public, shared branches.

```bash
# Revert a specific commit by hash
git revert a1b2c3d

# Revert without automatically committing immediately
git revert --no-commit a1b2c3d
```

---

## 9.5 Git Reset vs Git Revert

| Feature | `git reset` | `git revert` |
| :--- | :--- | :--- |
| **History Effect** | Rewrites / deletes commit history | Appends a new reversing commit |
| **Safety on Shared Branches** | Dangerous (breaks colleagues' history) | Safe (ideal for public/shared branches) |
| **Scope** | Local branches | Public, shared, and production branches |

---

## 9.6 Git Cherry-Pick (`git cherry-pick`)
`git cherry-pick` applies the changes introduced by one or more specific commits from another branch onto your active branch.

```bash
# Apply a specific commit onto current branch
git cherry-pick 5d3f2ab

# Apply multiple specific commits
git cherry-pick abc1234 def5678
```

### Real-Time Example
A critical security hotfix was committed on `develop` (commit `c7a8b9f`). Instead of merging the entire unstable `develop` branch into production `main`, you cherry-pick only the security fix commit:
```bash
git switch main
git cherry-pick c7a8b9f
git push origin main
```

---

## 9.7 Git Rebase (`git rebase`)
`git rebase` moves or reapplies a sequence of commits on top of a new base commit, creating a clean, linear project history.

```text
Before Rebase:
main:          C1 ── C2 ── C3
                      feature:               C4 ── C5

After Rebase (git switch feature && git rebase main):
main:          C1 ── C2 ── C3
                            feature:                     C4' ── C5' (Linear on top of main)
```

### Command
```bash
git switch feature/login
git rebase main
```

---

## 9.8 Git Tag (`git tag`)
Tags create permanent, named reference points in commit history, typically used to mark releases (e.g., `v1.0.0`).

```bash
# Create a lightweight tag
git tag v1.0.0

# Create an annotated tag (recommended: includes message, tagger, date)
git tag -a v1.0.0 -m "Release version 1.0.0 with user authentication"

# List all tags
git tag

# Inspect tag details
git show v1.0.0

# Push a specific tag to GitHub
git push origin v1.0.0

# Push all tags to GitHub
git push origin --tags
```

---

## 9.9 Advanced Git Commands Summary

| Command | Purpose |
| :--- | :--- |
| `git stash` | Temporarily shelve uncommitted working tree changes |
| `git stash pop` | Restore and remove most recent stash |
| `git reset --soft HEAD~1` | Undo commit, keep changes staged |
| `git reset --hard HEAD~1` | Undo commit, permanently discard changes |
| `git revert <hash>` | Create new commit reversing target commit |
| `git cherry-pick <hash>` | Copy specific commit onto active branch |
| `git rebase <branch>` | Reapply commits on top of another base branch |
| `git tag -a <tag> -m "msg"` | Create annotated release tag |

---

## 9.10 Best Practices
- Use `git stash` instead of creating temporary `"wip"` commits.
- Never use `git reset --hard` or `git rebase` on public shared branches.
- Always use `git revert` to undo changes already pushed to remote repositories.
- Use annotated tags (`-a`) for production version releases.

---

## Interview Questions

### 1. What is the difference between `git stash apply` and `git stash pop`?
**Answer:**
`git stash pop` applies the stashed changes to your working directory and immediately deletes them from the stash list. `git stash apply` restores the changes but preserves the stash entry for future reuse.

### 2. Explain the difference between `git reset --soft`, `--mixed`, and `--hard`.
**Answer:**
- `--soft`: Resets commit history, keeping modified files staged in the index.
- `--mixed`: Resets commit history and unstages files, keeping modifications in the working tree.
- `--hard`: Resets commit history, staging area, and working directory, completely discarding all uncommitted changes.

### 3. When should you use `git revert` instead of `git reset`?
**Answer:**
Use `git revert` when the commit has already been pushed to a shared remote repository, as it safely creates a new inverse commit without rewriting public history.

### 4. What is `git cherry-pick` and when is it useful?
**Answer:**
`git cherry-pick` selectively applies an individual commit from one branch onto another without merging the rest of the branch. It is ideal for porting isolated hotfixes across branches.

---

## Practical Lab

### Task 1
Create temporary file edits and stash them using `git stash`.

### Task 2
Verify the stash list and restore the changes using:
```bash
git stash pop
```

### Task 3
Create an annotated release tag named `v1.0.0`:
```bash
git tag -a v1.0.0 -m "First production release"
```

### Task 4
Inspect tag details with `git show v1.0.0`.

### Task 5
Practice applying a commit from another branch using `git cherry-pick <commit-hash>`.
