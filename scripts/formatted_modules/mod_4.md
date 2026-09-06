# Module 4: Basic Git Commands

## Learning Objectives
After completing this module, you will be able to:
- Understand the core commands required for daily Git workflows.
- Check repository status using `git status`.
- Stage individual, multiple, and all modified files using `git add`.
- Save snapshots permanently using `git commit`.
- Inspect commit logs using `git log` and formatting flags.
- Compare file changes across working, staged, and committed states using `git diff`.
- Discard unwanted modifications with `git restore`.
- Remove and unstage files using `git rm`.
- Access built-in documentation using `git help`.

---

## 4.1 Introduction
Git commands allow developers to record, inspect, and navigate project history. Every software project follows a continuous cycle where files are created, modified, staged, committed, and shared.

### Primary Commands
- `git status` — Check repository state
- `git add` — Stage file modifications
- `git commit` — Record snapshots permanently
- `git log` — View commit history
- `git diff` — Inspect code differences
- `git restore` — Discard uncommitted changes
- `git rm` — Remove tracked files
- `git help` — Display command documentation

---

## 4.2 Git Status (`git status`)
The `git status` command inspects the working tree and staging area.

### Syntax
```bash
git status
```

### Example Output
```text
On branch main
No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md

nothing added to commit but untracked files present (use "git add" to track)
```

### Purpose
- Displays active branch name.
- Lists untracked files.
- Lists modified files not yet staged.
- Lists staged changes ready for commit.

---

## 4.3 Git Add (`git add`)
The `git add` command moves changes from the Working Directory to the Staging Area.

### Syntax & Examples
```bash
# Stage a single file
git add index.html

# Stage multiple specific files
git add file1.txt file2.txt

# Stage all modified and new files in the repository
git add .

# Stage all files in current directory and subdirectories
git add -A
```

---

## 4.4 Git Commit (`git commit`)
A commit permanently records staged changes into the local repository database.

### Syntax
```bash
git commit -m "Descriptive commit message"
```

### Example Output
```text
[main (root-commit) abc1234] Added login page
 1 file changed, 25 insertions(+)
 create mode 100644 index.html
```

### Good Commit Message Guidelines
- `"Added user login authentication page"`
- `"Fixed navigation bar responsiveness on mobile"`
- `"Updated README with API setup instructions"`
- `"Refactored payment gateway error handling"`

---

## 4.5 Git Log (`git log`)
Displays the historical sequence of commits in reverse chronological order.

### Syntax & Flags
```bash
# Standard detailed log
git log

# One-line summary per commit (hash + message)
git log --oneline

# Graphical ASCII branch visualization
git log --graph --oneline --all

# Limit log output to the last N commits
git log -n 5
```

### Example Output
```text
commit 91fd56a7b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8 (HEAD -> main)
Author: Prasanna <prasanna@example.com>
Date:   Sat Jul 25 14:32:10 2026 +0530

    Added Login Feature
```

---

## 4.6 Git Diff (`git diff`)
Compares modifications between different states of your repository.

### Syntax & Options
```bash
# Compare unstaged working directory changes against Staging Area
git diff

# Compare staged changes against the last commit
git diff --staged

# Compare changes between two specific commits
git diff commit1_hash commit2_hash
```

Git highlights additions with `+` (green) and deletions with `-` (red).

---

## 4.7 Git Restore (`git restore`)
Discards uncommitted modifications in the working tree.

```bash
# Discard changes in a specific file (restore to last commit)
git restore index.html

# Unstage a staged file (move back from Staging to Working Directory)
git restore --staged index.html
```

---

## 4.8 Git Remove (`git rm`)
Deletes files from the working directory and stages the deletion in one step.

```bash
# Remove file from disk and stage deletion
git rm oldfile.txt

# Commit the deletion
git commit -m "Removed unused configuration file"

# Remove file from Git tracking only (keep file on local disk)
git rm --cached sensitive_data.txt
```

---

## 4.9 Git Help (`git help`)
Access built-in manual pages and documentation:

```bash
# General help overview
git help

# Detailed manual page for a specific command
git help commit
# or
git commit --help
```

---

## 4.10 Git Command Workflow & Lifecycle

```text
[ Create / Edit File ]
         │
         ▼
[ git status (Verify state) ]
         │
         ▼
[ git add (Stage changes) ]
         │
         ▼
[ git commit -m "..." (Record snapshot) ]
         │
         ▼
[ git log --oneline (Review history) ]
```

---

## 4.11 Common Git Commands Summary

| Command | Purpose |
| :--- | :--- |
| `git status` | Check status of working directory and staging area |
| `git add <file>` | Stage specific file for commit |
| `git add .` | Stage all modified and new files |
| `git commit -m "msg"` | Permanently save staged snapshot with descriptive message |
| `git log` | Display full commit history |
| `git log --oneline` | Display compact, single-line commit history |
| `git diff` | Show unstaged file modifications |
| `git diff --staged` | Show changes prepared in staging area |
| `git restore <file>` | Discard modifications and restore to last commit |
| `git rm <file>` | Delete file and stage deletion |
| `git help <command>` | Open documentation for command |

---

## 4.12 Best Practices
- Always check `git status` before and after staging.
- Review changes with `git diff` before committing.
- Make small, logical, self-contained commits.
- Write informative commit messages explaining *why* changes occurred.
- Never commit broken code or untracked temporary files.

---

## 4.13 Common Mistakes
- ❌ Running `git commit` without staging files first with `git add`.
- ❌ Using generic messages like `"fix"` or `"changes"`.
- ❌ Committing large bundles of unrelated changes in a single commit.
- ❌ Accidentally staging sensitive files or build outputs.

---

## Real-Time Scenario
A developer updates the marketing landing page:

```bash
# 1. Check modified files
git status

# 2. Inspect exact code changes
git diff

# 3. Stage all modified assets
git add .

# 4. Commit with clear description
git commit -m "Updated homepage banner and promotional copy"

# 5. Verify commit history
git log --oneline -n 3
```

---

## Interview Questions

### 1. What is the purpose of `git status`?
**Answer:**
`git status` displays the current state of the working directory and staging area, highlighting untracked, modified, and staged files alongside the active branch name.

### 2. What is the difference between `git add` and `git commit`?
**Answer:**
- `git add` stages modifications into the index (Staging Area).
- `git commit` creates a permanent, immutable snapshot of all staged files in the local Git database.

### 3. Why are descriptive commit messages essential?
**Answer:**
Descriptive messages create a clear historical audit trail, simplify code reviews, ease debugging via `git bisect`, and allow teammates to understand the intent behind changes.

### 4. What is the difference between `git diff` and `git diff --staged`?
**Answer:**
- `git diff` shows differences between the working tree and the staging area (unstaged edits).
- `git diff --staged` shows differences between the staging area and the last commit (staged edits).

### 5. What is the benefit of `git log --oneline`?
**Answer:**
It condenses commit history into a single line per commit containing the shortened 7-character SHA-1 hash and commit message, making long histories quick to scan.

---

## Practical Lab

### Task 1
Create a file named `README.md` with initial project notes.

### Task 2
Check the repository status using:
```bash
git status
```

### Task 3
Stage the file using:
```bash
git add README.md
```

### Task 4
Commit the changes with the message:
```bash
git commit -m "Initial project setup"
```

### Task 5
View the commit history using:
```bash
git log --oneline
```
