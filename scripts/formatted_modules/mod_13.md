# Module 13: Real-World Git Workflows

## Learning Objectives
After completing this module, you will be able to:
- Understand the importance of standardized Git branching workflows.
- Master the **Feature Branch Workflow** for agile sprint development.
- Implement **GitHub Flow** for web applications and continuous deployment.
- Master the enterprise **Git Flow** branching model with release and hotfix branches.
- Master the **Forking Workflow** used across global open-source ecosystems.
- Choose the optimal branching strategy based on team size and release frequency.
- Compare trade-offs between linear and branching history models.

---

## 13.1 Introduction
A **Git Workflow** is a defined set of guidelines, branch conventions, and merge protocols that govern how engineering teams build, test, review, and release software.

Without a formalized workflow:
- Code collisions and merge conflicts escalate rapidly.
- Unfinished features leak into production releases.
- Release rollbacks become chaotic and difficult to audit.
- Team members lack clarity on where to branch and merge.

Standardized workflows establish predictable development rhythms and maintain continuous delivery readiness.

### Definition
A **Git Workflow** is a structured process that defines how developers create branches, commit code, conduct peer reviews, resolve conflicts, and merge updates into shared environments.

---

## 13.2 Comparison of Primary Git Workflows

| Workflow | Branch Structure | Complexity | Ideal Use Case |
| :--- | :--- | :--- | :--- |
| **Feature Branch Workflow** | `main` + `feature/*` | Low | Small-to-medium teams, simple projects |
| **GitHub Flow** | `main` + short-lived feature branches | Low-Medium | Web apps, SaaS, Continuous Deployment |
| **Git Flow** | `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` | High | Enterprise software with scheduled versioned releases |
| **Forking Workflow** | Independent forks + Pull Requests | Medium | Open-source projects & external contractor contributions |

---

## 13.3 Workflow 1: Feature Branch Workflow
All development occurs on short-lived feature branches created off `main`.

```text
main ───────────────────────────────────────────▶ (Deployable)
  │                                        ▲
  └──▶ feature/auth ── C1 ── C2 ── (PR) ───┘
```

### Steps
1. Create a feature branch: `git switch -c feature/user-auth`
2. Commit changes locally.
3. Push to GitHub and open a Pull Request.
4. Peer review and merge back into `main`.
5. Delete the feature branch.

---

## 13.4 Workflow 2: GitHub Flow
GitHub Flow is a lightweight, branch-based workflow designed specifically for teams practicing Continuous Deployment (CD).

```text
1. Create Branch (from main)
        │
        ▼
2. Add Commits (and test locally)
        │
        ▼
3. Open Pull Request (discuss & review)
        │
        ▼
4. Deploy & Test in Staging
        │
        ▼
5. Merge into main (auto-deploy to Production)
```

### Core Principles
- Anything on `main` is always 100% production-ready and deployable.
- Branches are short-lived (hours or days, never weeks).
- Continuous automated testing on every commit.

---

## 13.5 Workflow 3: Git Flow (Enterprise Model)
Git Flow is a comprehensive branching model designed for software with formal, scheduled version releases (e.g., enterprise software, desktop applications, mobile apps).

```text
main (Production) ────── C1 ────────────────────────────── C2 (Release v1.0) ──▶
                          ▲                                 ▲
                          │                                 │
hotfix/security ──────────┼─────── H1 ──────────────────────┤
                          │        │                        │
develop (Integration) ────┴── D1 ──┴── D2 ── D3 ────────────┴── D4 ─────────────▶
                              │                 ▲            ▲
                              └─── F1 ── F2 ────┘            │
                                  (feature/cart)             │
release/v1.0 ──────────────────────────────────────── R1 ────┘
```

### Branch Roles in Git Flow
1. **`main`:** Stores official production release history. Only merged into from `release/*` or `hotfix/*`.
2. **`develop`:** Central integration branch for feature aggregation.
3. **`feature/*`:** Branched off `develop`, merged back into `develop`.
4. **`release/*`:** Branched off `develop` when release features are frozen. Used for bug fixing and documentation before merging into `main` and `develop`.
5. **`hotfix/*`:** Branched directly off `main` to fix urgent production bugs, then merged into both `main` and `develop`.

---

## 13.6 Workflow 4: Forking Workflow
The Forking Workflow is standard for open-source software and contractor contributions where contributors do not have direct write permissions to the central repository.

```text
[ Upstream Central Repo ] ◀───────────────────────┐
           │                                      │
           │ (Fork on GitHub)                     │ (Pull Request)
           ▼                                      │
[ Developer's Fork on GitHub ] ───────────────────┤
           │                                      │
           │ (git clone)                          │ (git push)
           ▼                                      │
[ Local Workstation ] ──▶ [ Feature Branch ] ─────┘
```

### Open Source Contribution Lifecycle
```bash
# 1. Clone your personal fork
git clone https://github.com/your-username/open-source-project.git

# 2. Add upstream reference
git remote add upstream https://github.com/organization/open-source-project.git

# 3. Create feature branch
git switch -c feature/improved-docs

# 4. Commit changes and push to your fork
git add .
git commit -m "docs: Improve installation troubleshooting guide"
git push -u origin feature/improved-docs

# 5. Open Pull Request from your fork to upstream repository on GitHub
```

---

## 13.7 Choosing the Right Workflow

```text
Is it an open-source project without write access?
├── YES ──▶ Forking Workflow
└── NO  ──▶ Do you have scheduled releases (mobile apps, enterprise on-prem)?
             ├── YES ──▶ Git Flow
             └── NO  ──▶ Are you deploying continuously to the web?
                          ├── YES ──▶ GitHub Flow
                          └── NO  ──▶ Feature Branch Workflow
```

---

## 13.8 Best Practices
- Agree upon and document your team's branching workflow in `CONTRIBUTING.md`.
- Keep feature branches short-lived to minimize merge divergence.
- Rebase or merge `main` into your working branch regularly.
- Automate testing and status checks on all pull requests.

---

## Interview Questions

### 1. Explain the difference between GitHub Flow and Git Flow.
**Answer:**
GitHub Flow is a simple, continuous deployment workflow with one main branch and short-lived feature branches that deploy directly upon merge. Git Flow is a structured enterprise model with two permanent branches (`main` and `develop`) plus supporting `feature`, `release`, and `hotfix` branches.

### 2. When is the Forking Workflow preferred over the Feature Branch Workflow?
**Answer:**
The Forking Workflow is ideal for open-source repositories and external contributors because it allows developers to contribute via pull requests without needing direct write access to the central repository.

### 3. What is the role of a `hotfix` branch in Git Flow?
**Answer:**
A hotfix branch is created directly from `main` to resolve critical production bugs immediately. Once tested, it is merged into both `main` (tagged with a patch version) and `develop`.

---

## Practical Lab

### Task 1
Create a Feature Branch Workflow simulation: create a feature branch, add commits, and merge into `main`.

### Task 2
Simulate GitHub Flow by opening a Pull Request from a feature branch with automated review comments.

### Task 3
Map out the Git Flow branch structure (main, develop, feature, release, hotfix) for a financial software application.

### Task 4
Fork an open-source repository on GitHub, clone it locally, and configure the `upstream` remote URL.

### Task 5
Synchronize your local repository with `upstream` changes using `git fetch upstream` and `git merge upstream/main`.
