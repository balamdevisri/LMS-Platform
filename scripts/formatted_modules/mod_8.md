# Module 8: Git Collaboration

## Learning Objectives
After completing this module, you will be able to:
- Master modern team-based Git collaboration workflows.
- Understand Feature Branch Workflows in depth.
- Create, manage, and review Pull Requests on GitHub.
- Conduct professional code reviews and provide actionable feedback.
- Understand merge strategies: Merge Commit, Squash & Merge, and Rebase & Merge.
- Resolve collaborative team conflicts systematically.
- Follow enterprise Git collaboration standards and best practices.

---

## 8.1 Introduction
Modern software engineering is inherently collaborative. Engineering teams of tens or hundreds of developers work concurrently on large codebases using Git and GitHub.

Git Collaboration empowers teams to:
- Work independently on isolated features without stepping on each other's toes.
- Share code changes safely through remote branches.
- Review peer code for quality, performance, and security before merging.
- Integrate approved features smoothly into shared release branches.
- Maintain high software stability and continuous deployment readiness.

### Definition
**Git Collaboration** is the structured process of multiple developers working concurrently on a shared codebase using Git and GitHub while maintaining version control, code quality, security standards, and clear audit history.

### Real-Time Example
In a **Food Delivery Application** team:
- **Developer A:** Develops the Restaurant Discovery Module (`feature/restaurant-feed`).
- **Developer B:** Implements the Payment Gateway Integration (`feature/stripe-payments`).
- **Developer C:** Fixes real-time driver tracking bugs (`bugfix/gps-socket-lag`).

Each developer creates a feature branch, submits a Pull Request, participates in code review, and merges once approved.

---

## 8.2 Team Collaboration Workflow

```text
[ Clone Central Repository ]
             │
             ▼
[ Create Feature Branch (git switch -c feature/name) ]
             │
             ▼
[ Develop & Commit Changes Locally ]
             │
             ▼
[ Push Feature Branch to GitHub ]
             │
             ▼
[ Open Pull Request (PR) ]
             │
             ▼
[ Automated CI Tests & Code Review ]
             │
             ▼
[ Approve & Merge into main ]
```

---

## 8.3 Feature Branch Workflow
Rather than committing directly to `main`, all new development takes place in isolated branches named with standard conventions:

```text
main ─────────────────────────────────────────────────────────▶ (Stable Production)
  │                                                      ▲
  ├──▶ feature/login ──────── C1 ── C2 ── (PR Merge) ────┤
  │                                                      │
  └──▶ feature/payment ────── C3 ── C4 ── (PR Merge) ────┘
```

### Key Benefits
- The `main` branch remains continuously deployable and stable.
- Unfinished or experimental code is kept away from production.
- Code reviews and automated tests are scoped precisely to the feature's diff.

---

## 8.4 Pull Requests (PR) and Code Review
A **Pull Request** is a collaborative review hub on GitHub where developers discuss, inspect, and approve proposed code changes.

### Elements of a High-Quality Pull Request
- **Title:** Concise summary of the change (e.g., `feat(auth): Add Google OAuth2 login`).
- **Description:** Context, motivation, and implementation summary.
- **Related Issues:** References to tracked issues (e.g., `Closes #42`).
- **Screenshots / Recordings:** Visual proof for frontend changes.
- **Test Plan:** Commands run to verify functionality.

### Code Review Evaluation Criteria
Reviewers evaluate:
1. **Architecture & Logic:** Does the solution solve the problem correctly?
2. **Code Quality & Readability:** Is the code clean, modular, and maintainable?
3. **Security:** Are inputs sanitized? Are tokens or secrets exposed?
4. **Performance:** Are database queries and algorithmic loops efficient?
5. **Test Coverage:** Are unit and integration tests included?

---

## 8.5 Merge Strategies

GitHub supports three distinct merge methods:

### 1. Create a Merge Commit (Standard Merge)
Combines histories and creates an explicit merge commit with two parents.
- **Best for:** Preserving full historical context and branch lifecycles.

### 2. Squash and Merge
Condenses all commits from the feature branch into a **single clean commit** on the base branch.
- **Best for:** Feature branches with messy interim commits (`"fix typo"`, `"wip"`). Keeps `main` history linear and readable.

### 3. Rebase and Merge
Reapplies all individual commits from the feature branch directly on top of the base branch without a merge commit.
- **Best for:** Maintaining a strictly linear history while preserving individual commit identity.

---

## 8.6 Collaborative Conflict Resolution
When two developers modify the same file on different branches, a conflict arises upon merging.

### Resolution Steps
1. Switch to your feature branch: `git switch feature/my-feature`
2. Fetch latest `main`: `git fetch origin`
3. Merge or rebase `origin/main` into your branch:
   ```bash
   git merge origin/main
   ```
4. Open the conflicted files, resolve conflict markers, and test the build.
5. Stage resolved files: `git add <files>`
6. Commit resolution: `git commit -m "Resolved merge conflicts with main"`
7. Push to GitHub to update the Pull Request: `git push origin feature/my-feature`

---

## 8.7 Best Practices for Git Collaboration
- Keep Pull Requests small (under 400 lines of code) for faster, thorough reviews.
- Write constructive, empathetic code review comments.
- Pull the latest `main` into your feature branch daily.
- Use branch protection rules requiring at least 1–2 approvals before merging.
- Enforce automated CI status checks (linting, tests, build) on all Pull Requests.

---

## 8.8 Common Mistakes
- ❌ Opening massive 2,000+ line PRs that are difficult to review.
- ❌ Merging your own Pull Requests without peer approval.
- ❌ Dismissing automated CI test failures.
- ❌ Forgetting to delete merged branches after completing a feature.

---

## Interview Questions

### 1. What is the Feature Branch Workflow?
**Answer:**
The Feature Branch Workflow is a development model where all feature additions, bug fixes, and experiments take place in dedicated branches rather than directly on `main`, keeping the main branch stable and deployable.

### 2. What is the difference between a Merge Commit and Squash & Merge?
**Answer:**
- **Merge Commit:** Preserves all individual commits from the branch and adds a merge commit linking both parent histories.
- **Squash & Merge:** Combines all commits from the feature branch into a single clean commit on the target branch, keeping the commit history concise and linear.

### 3. What should a developer check when performing a Code Review?
**Answer:**
Code correctness, edge-case handling, readability, security implications, performance bottlenecks, architectural alignment, test coverage, and documentation.

### 4. How do you resolve conflicts in a Pull Request before merging?
**Answer:**
Fetch the latest base branch, merge or rebase it into your local feature branch, resolve conflict markers in your editor, stage and commit the resolution, and push to update the PR on GitHub.

---

## Practical Lab

### Task 1
Create a new branch named `feature/navbar`:
```bash
git switch -c feature/navbar
```

### Task 2
Add a navigation component file `navbar.html`, stage and commit it:
```bash
git add navbar.html
git commit -m "Added responsive navigation bar"
```

### Task 3
Push the branch to GitHub:
```bash
git push -u origin feature/navbar
```

### Task 4
Open a Pull Request on GitHub from `feature/navbar` to `main`.

### Task 5
Review the Pull Request diff, approve it, merge using **Squash and Merge**, and delete the remote branch.
