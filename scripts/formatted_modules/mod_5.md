# Module 5: Branching and Merging

## Learning Objectives
After completing this module, you will be able to:
- Understand Git branches and why they are fundamental to modern development.
- List, create, switch, rename, and delete branches.
- Merge feature branches into the `main` branch.
- Understand Fast-Forward merges vs Three-Way merges.
- Identify and resolve merge conflicts safely.
- Learn professional branch naming conventions and strategies.
- Apply branching workflows in real-world collaborative projects.

---

## 5.1 Introduction
In modern software engineering, multiple developers work on separate features, fixes, and experiments simultaneously.
- **Developer A** builds user authentication.
- **Developer B** implements the payment gateway.
- **Developer C** fixes a production bug.
- **Developer D** redesigns the dashboard UI.

If all developers worked directly on the `main` branch, untested code would overwrite stable features and cause deployment instability. Git solves this using **Branches**.

### Definition
A **Branch** is an independent, lightweight line of development that allows developers to work on features, bug fixes, or experiments in complete isolation without affecting the main codebase.

### Real-Time Example
In a banking software application:
- Team 1 develops `feature/login`
- Team 2 develops `feature/funds-transfer`
- Team 3 develops `bugfix/statement-export`

Each team develops and tests on their dedicated branch. Once verified, the branch is merged into `main`.

---

## 5.2 What is a Branch?
In Git, a branch is simply a lightweight, movable pointer to a specific commit.

```text
main ────────▶ Commit C1 ──▶ Commit C2 ──▶ Commit C3 (HEAD)
                                              │
feature/login ────────────────────────────────┘ (Starts here)
```

- Branch creation is instantaneous (O(1) operation).
- Modifications on one branch remain completely isolated from others.

---

## 5.3 Why Branches are Important
- **Parallel Development:** Multiple features developed concurrently without interference.
- **Safe Experimentation:** Try out new ideas without risking production stability.
- **Simplified Code Reviews:** Pull requests are scoped to individual feature branches.
- **Effortless Hotfixes:** Create temporary fix branches directly from production commits.
- **Clean Project Organization:** Separates ongoing development from stable releases.

---

## 5.4 View Existing Branches
To list all branches in the local repository:

```bash
git branch
```

**Example Output:**
```text
* main
  feature/login
  feature/payment
```

The asterisk (`*`) and green highlight indicate your active branch.

---

## 5.5 Create and Switch Branches

```bash
# Create a new branch (stays on current branch)
git branch feature/login

# Switch to the new branch (classic command)
git checkout feature/login

# Switch to the new branch (modern Git 2.23+ command)
git switch feature/login

# Create AND switch in a single command (classic)
git checkout -b feature/payment

# Create AND switch in a single command (modern)
git switch -c feature/payment
```

---

## 5.6 Rename and Delete Branches

```bash
# Rename the current branch
git branch -m feature/auth

# Delete a branch that has already been merged (safe delete)
git branch -d feature/login

# Force delete an unmerged branch (use with caution!)
git branch -D feature/experimental
```

---

## 5.7 What is Merging?
Merging integrates changes from one branch into another (typically merging a feature branch into `main`).

### Merge Procedure
```bash
# 1. Switch to the target destination branch
git switch main

# 2. Merge the feature branch into main
git merge feature/login
```

---

## 5.8 Types of Merges

### 1. Fast-Forward Merge
Occurs when the destination branch has not diverged with new commits. Git simply moves the target branch pointer forward.

```text
Before Merge:
main:          C1 ── C2
                      feature/login:         C3 ── C4

After Fast-Forward Merge:
main:          C1 ── C2 ── C3 ── C4 (HEAD)
```

### 2. Three-Way Merge (Recursive / Ort)
Occurs when both branches have diverged with independent commits. Git combines changes and creates a new **Merge Commit** with two parent commits.

```text
Before Merge:
main:          C1 ── C2 ── C5
                      feature/login:         C3 ── C4

After Three-Way Merge:
main:          C1 ── C2 ── C5 ──── C6 (Merge Commit)
                                /
feature/login:         C3 ── C4 ─┘
```

---

## 5.9 Merge Conflicts
A merge conflict occurs when two branches modify the **same line** of the **same file** in different ways. Git halts the merge and inserts conflict markers:

```text
<<<<<<< HEAD
Welcome, Valued Customer!
=======
Welcome, Premium Member!
>>>>>>> feature/login
```

### Resolving Merge Conflicts Step-by-Step
1. **Identify conflicted files:** Run `git status` to see unmerged paths.
2. **Open file:** Review the `<<<<<<<`, `=======`, and `>>>>>>>` markers.
3. **Edit content:** Choose the desired version or combine both, then delete all conflict markers.
4. **Save file.**
5. **Stage resolution:** `git add <filename>`
6. **Complete merge:** `git commit` (or `git commit -m "Resolved merge conflict"`)

---

## 5.10 Branch Naming Conventions
Professional engineering teams follow structured naming prefixes:

- `feature/feature-name` — New user features (e.g., `feature/stripe-checkout`)
- `bugfix/bug-description` — Non-critical bug fixes (e.g., `bugfix/navbar-overlap`)
- `hotfix/critical-issue` — Urgent production fixes (e.g., `hotfix/security-patch`)
- `release/vX.Y.Z` — Release preparation branches (e.g., `release/v1.2.0`)

> [!TIP]
> Avoid unstructured branch names like `test`, `mybranch`, `abc`, or `temp`.

---

## 5.11 Common Branch Commands Summary

| Command | Purpose |
| :--- | :--- |
| `git branch` | List local branches |
| `git branch <name>` | Create new branch |
| `git switch <name>` | Switch to specified branch |
| `git switch -c <name>` | Create and switch to new branch in one step |
| `git checkout -b <name>` | Create and switch (classic syntax) |
| `git merge <branch>` | Merge specified branch into active branch |
| `git branch -d <branch>` | Safely delete merged branch |
| `git branch -D <branch>` | Force delete branch |
| `git branch -m <new-name>` | Rename active branch |

---

## 5.12 Best Practices
- Create a dedicated branch for every distinct feature or bugfix.
- Keep branch scopes small and focused.
- Pull and merge `main` into your feature branch frequently to minimize conflicts.
- Delete merged branches to keep the repository tidy.
- Test thoroughly before merging into production branches.

---

## 5.13 Common Mistakes
- ❌ Developing directly on the `main` branch.
- ❌ Maintaining long-lived feature branches that drift far away from `main`.
- ❌ Force-deleting (`-D`) branches without verifying whether commits are needed.
- ❌ Committing unresolved conflict markers into the codebase.

---

## Real-Time Scenario: E-Commerce Feature Workflow
A team implements a shopping cart feature:

```bash
# 1. Create and switch to feature branch
git switch -c feature/shopping-cart

# 2. Develop feature and commit changes
git add src/cart/
git commit -m "Implemented cart state management and checkout button"

# 3. Switch back to main branch
git switch main

# 4. Pull latest upstream changes
git pull origin main

# 5. Merge feature branch
git merge feature/shopping-cart

# 6. Delete merged branch
git branch -d feature/shopping-cart
```

---

## Interview Questions

### 1. What is a Git Branch?
**Answer:**
A Git branch is a lightweight, movable pointer to a commit representing an isolated line of development.

### 2. Why are branches used in software development?
**Answer:**
Branches enable concurrent development, isolate unfinished features, prevent broken code from affecting production, and simplify code reviews.

### 3. What is the difference between a Fast-Forward Merge and a Three-Way Merge?
**Answer:**
- **Fast-Forward Merge:** Moves the branch pointer forward without creating a new commit because there are no diverging changes.
- **Three-Way Merge:** Combines two diverging commit histories and creates an explicit merge commit with two parents.

### 4. What causes a merge conflict and how is it resolved?
**Answer:**
A merge conflict occurs when conflicting modifications are made to the same lines of a file on different branches. It is resolved by opening the file, manually editing the conflicting sections, deleting conflict markers, staging the file, and committing.

### 5. How do you create and switch to a branch in a single command?
**Answer:**
Using modern Git: `git switch -c <branch-name>`
Using classic Git: `git checkout -b <branch-name>`

---

## Practical Lab

### Task 1
Create a new branch named `feature/profile`.

### Task 2
Switch to the new branch:
```bash
git switch feature/profile
```

### Task 3
Create a file `profile.html`, stage it, and commit it:
```bash
git add profile.html
git commit -m "Added user profile template"
```

### Task 4
Switch back to `main` and merge the `feature/profile` branch:
```bash
git switch main
git merge feature/profile
```

### Task 5
Delete the merged `feature/profile` branch and verify with `git branch`:
```bash
git branch -d feature/profile
git branch
```
