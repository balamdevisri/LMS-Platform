# Module 15: Git & GitHub Interview Preparation & Career Guidance

## Learning Objectives
After completing this module, you will be able to:
- Review and consolidate all foundational and advanced Git concepts.
- Confidently answer technical interview questions regarding version control.
- Solve real-world troubleshooting scenarios (detached HEAD, push rejected, merge conflicts).
- Explain branching models and CI/CD pipelines during technical interviews.
- Structure your GitHub portfolio to maximize placement and internship opportunities.
- Plan an ongoing engineering career roadmap leveraging version control skills.

---

## 15.1 Introduction
Version control is a mandatory prerequisite across all modern technical disciplines—including Full-Stack Development, DevOps Engineering, Cloud Architecture, Data Engineering, and Security.

Mastering Git and GitHub distinguishes candidates during technical interviews by demonstrating that they understand professional team workflows, continuous delivery, code review culture, and engineering best practices.

---

## 15.2 Comprehensive Git Revision Matrix

| Category | Core Concepts & Commands |
| :--- | :--- |
| **Setup & Identity** | `git init`, `git config --global user.name`, `git config --global user.email` |
| **Working Areas** | Working Directory ──(`git add`)──▶ Staging Index ──(`git commit`)──▶ Local `.git` |
| **Inspection & Diff** | `git status`, `git log --oneline --graph`, `git diff`, `git diff --staged` |
| **Branching & Merging** | `git branch`, `git switch -c <name>`, `git merge <name>`, Merge Conflict Resolution |
| **Remote Operations** | `git remote add origin`, `git push -u origin main`, `git pull`, `git fetch` |
| **Advanced Tools** | `git stash`, `git reset (--soft/--hard)`, `git revert`, `git cherry-pick`, `git rebase`, `git tag` |
| **GitHub Ecosystem** | Pull Requests, Issues, Projects, Discussions, Wiki, Releases, Pages, Actions (CI/CD) |

---

## 15.3 Top 15 Frequently Asked Git Interview Questions

### 1. What is the difference between Git and GitHub?
**Answer:**
Git is a distributed version control tool that manages code history locally on your computer. GitHub is a cloud-based hosting platform that manages remote Git repositories and provides team collaboration, code reviews, and CI/CD pipelines.

### 2. What happens under the hood when you run `git commit`?
**Answer:**
Git creates a new Commit Object in `.git/objects/` referencing a root Tree object (representing the staged directory snapshot), author details, committer details, timestamp, commit message, and parent commit hash(es). Git then updates the current branch ref and `HEAD` to point to the new commit SHA-1.

### 3. What is the difference between `git fetch` and `git pull`?
**Answer:**
`git fetch` downloads new commits and references from the remote repository into local tracking branches without modifying the active working tree. `git pull` performs a `git fetch` followed immediately by `git merge`, integrating changes into the current branch.

### 4. What is the difference between `git reset` and `git revert`?
**Answer:**
- `git reset` moves the branch pointer backward, rewriting history (safe for local unpushed commits).
- `git revert` creates a new commit that applies the inverse of a target commit, preserving project history (safe and recommended for public shared branches).

### 5. Explain the difference between `git merge` and `git rebase`.
**Answer:**
- `git merge` preserves full branch history and creates an explicit merge commit linking two histories.
- `git rebase` takes the commits from your branch and reapplies them on top of the target base branch, creating a clean, linear commit history.

### 6. What is a merge conflict and how do you resolve it?
**Answer:**
A merge conflict occurs when two branches make incompatible modifications to the same line of a file. It is resolved by manually opening the file, selecting the correct lines, removing conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), staging the file with `git add`, and completing the commit with `git commit`.

### 7. What is `git stash` and when do you use it?
**Answer:**
`git stash` temporarily shelves uncommitted changes in the working directory and staging index, restoring the workspace to a clean `HEAD` state so you can switch branches or apply an urgent hotfix without making a half-baked commit.

### 8. What is `git cherry-pick`?
**Answer:**
`git cherry-pick` selectively applies the changes from an individual commit on one branch directly onto another branch without merging the rest of the commits.

### 9. What are the four primary Git object types?
**Answer:**
1. **Blob:** Stores file content.
2. **Tree:** Stores directory structure and filenames.
3. **Commit:** Stores snapshot metadata, author, and parent pointers.
4. **Tag:** Stores an annotated release marker.

### 10. What is a detached HEAD state and how do you recover from it?
**Answer:**
A detached HEAD occurs when you check out a specific commit hash directly rather than a branch name. Commits created in this state do not belong to any branch and can be lost during garbage collection. To preserve work, create a new branch immediately: `git switch -c new-branch-name`.

### 11. What is the purpose of `.gitignore`?
**Answer:**
`.gitignore` prevents untracked files (such as `node_modules/`, build outputs, log files, and secret `.env` files) from being accidentally staged or committed into the repository.

### 12. What does `git push -u origin main` do?
**Answer:**
It pushes the local `main` branch to the `origin` remote repository and sets `origin/main` as the upstream tracking reference, enabling shorthand `git push` and `git pull` commands in the future.

### 13. What is the difference between `git clone` and forking on GitHub?
**Answer:**
`git clone` downloads a copy of a repository to your local machine. Forking creates an independent server-side copy of another user's repository under your own GitHub account so you can develop changes and submit Pull Requests without direct write permissions.

### 14. What are GitHub Actions?
**Answer:**
GitHub Actions is a built-in CI/CD platform that automates software workflows—such as running test suites, enforcing code linters, building Docker images, and deploying to cloud infrastructure whenever code events occur.

### 15. How do you amend the most recent commit message?
**Answer:**
```bash
git commit --amend -m "New updated commit message"
```

---

## 15.4 Real-World Troubleshooting Scenarios

### Scenario 1: Push Rejected (Non-Fast-Forward)
**Problem:** You run `git push` and Git rejects the push with `[rejected - non-fast-forward]`.
**Cause:** Remote branch has new commits that you haven't integrated yet.
**Solution:**
```bash
# Pull latest remote changes and rebase your local commits on top
git pull --rebase origin main

# Resolve any conflicts if they arise, then push
git push origin main
```

### Scenario 2: Secret Accidentally Committed Locally (Not Pushed)
**Problem:** You committed a `.env` file locally that contains private API keys.
**Solution:**
```bash
# Soft reset the last commit to keep edits staged
git reset --soft HEAD~1

# Unstage the secret file
git restore --staged .env

# Add .env to .gitignore
echo ".env" >> .gitignore
git add .gitignore

# Recommit your code cleanly
git commit -m "feat: Add authentication service"
```

---

## 15.5 Git Career Growth & Engineering Roadmap

```text
[ Git & GitHub Foundations ]
             │
             ▼
[ Collaborative Feature Branching & CI/CD Pipelines ]
             │
             ▼
[ Containerization (Docker) & Orchestration (Kubernetes) ]
             │
             ▼
[ Infrastructure as Code (Terraform) & Cloud Architecture (AWS/GCP) ]
             │
             ▼
[ High-Impact Engineering Roles (Full-Stack, DevOps, SRE, Cloud Architect) ]
```

---

## 15.6 Practical Lab

### Task 1
Create a public GitHub repository named `git-github-mastery-capstone`.

### Task 2
Create and switch to a feature branch, commit project files, and merge it into `main` using a Pull Request.

### Task 3
Simulate a merge conflict between two branches and resolve it cleanly.

### Task 4
Create an annotated release tag `v1.0.0` and push it to GitHub:
```bash
git tag -a v1.0.0 -m "Capstone completion release"
git push origin v1.0.0
```

### Task 5
Optimize your GitHub profile by pinning your best repositories, adding a profile `README.md`, and verifying all project documentation.
