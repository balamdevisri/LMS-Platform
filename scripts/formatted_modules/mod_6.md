# Module 6: GitHub Basics

## Learning Objectives
After completing this module, you will be able to:
- Understand GitHub and its core cloud-collaboration features.
- Create and set up a personal GitHub account.
- Create new public and private repositories.
- Connect a local Git repository to a remote GitHub repository.
- Push local commits to GitHub using `git push`.
- Clone existing repositories with `git clone`.
- Fork open-source repositories to your personal account.
- Create, manage, and review Pull Requests (PRs).
- Understand the end-to-end GitHub collaboration lifecycle.

---

## 6.1 Introduction
GitHub is a cloud-based hosting platform built on top of Git that allows developers to host, manage, review, and collaborate on software repositories from anywhere in the world.

Millions of developers and organizations use GitHub to:
- Store source code securely in the cloud.
- Collaborate with teams using Pull Requests and code reviews.
- Track project issues, bugs, and feature requests.
- Contribute to open-source software ecosystems.
- Automate software build, test, and deployment workflows using GitHub Actions.

GitHub simplifies team collaboration by providing a centralized web interface, while Git manages decentralized version control locally on each developer's computer.

### Definition
**GitHub** is a cloud-based hosting platform that uses Git to store, manage, and collaborate on software projects.

### Real-Time Example
In an E-Commerce software development team:
1. Developers write and test code locally using Git.
2. Feature branches are pushed to GitHub.
3. Teammates review code changes on GitHub Pull Requests.
4. Once approved, the branch is merged into `main`.
5. The latest production build is automatically deployed.

---

## 6.2 Features of GitHub
GitHub provides an extensive suite of developer tools:
- **Cloud Repository Hosting:** Unlimited public and private Git repository hosting.
- **Pull Requests (PRs):** Structured code review and discussion interface before merging.
- **Issue Tracking:** Built-in bug tracker with labels, milestones, and assignees.
- **GitHub Projects:** Kanban-style planning boards and roadmap tables.
- **GitHub Actions:** Native Continuous Integration and Continuous Deployment (CI/CD) pipelines.
- **GitHub Releases:** Packaged binary distribution with automated changelogs.
- **GitHub Discussions:** Community forum for architectural debates and Q&A.
- **Wiki Documentation:** Built-in repository documentation system.

---

## 6.3 Creating a GitHub Account
1. Visit [https://github.com](https://github.com).
2. Click **Sign Up**.
3. Enter your username, email address, and strong password.
4. Complete the verification puzzle and confirm your email address.
5. Log in to your new GitHub dashboard.

---

## 6.4 GitHub Dashboard Overview
After logging in, your dashboard gives you immediate access to:
- **Repositories:** Your owned and contributed codebases.
- **Organizations:** Enterprise teams and collaborative workspaces.
- **Pull Requests & Issues:** Aggregated dashboard of tasks assigned to you.
- **Notifications:** Real-time feed of reviews, mentions, and CI build statuses.
- **Profile:** Public showcase of your contributions, repositories, and stars.

---

## 6.5 Creating a GitHub Repository
To create a new repository:
1. Click the **+** icon in the top navigation bar and select **New repository**.
2. Enter a descriptive **Repository name** (e.g., `GitPractice` or `ecommerce-api`).
3. Provide an optional **Description**.
4. Choose visibility:
   - **Public:** Anyone on the internet can view your repository.
   - **Private:** Only you and explicitly invited collaborators can access the code.
5. (Optional) Initialize with a `README.md`, `.gitignore` template, and open-source `LICENSE`.
6. Click **Create repository**.

---

## 6.6 Local Repository vs GitHub Repository

| Feature | Local Repository | GitHub Repository |
| :--- | :--- | :--- |
| **Location** | Stored on local hard drive | Stored in GitHub cloud infrastructure |
| **Availability** | Accessible only on your computer | Accessible globally over the internet |
| **Connectivity** | 100% offline access | Requires internet connection |
| **Primary Use** | Daily development, staging & committing | Team collaboration, code review & backup |
| **Management** | Git Command Line / Local GUI | GitHub Web Interface / GitHub CLI / API |

---

## 6.7 Connecting a Local Repository to GitHub
After creating an empty repository on GitHub, link your local project to it:

```bash
# Add remote origin URL
git remote add origin https://github.com/username/project.git

# Verify configured remotes
git remote -v
```

**Output:**
```text
origin  https://github.com/username/project.git (fetch)
origin  https://github.com/username/project.git (push)
```

---

## 6.8 Push Code to GitHub
Upload your local commits to the remote repository:

```bash
# First push (sets upstream tracking branch)
git push -u origin main

# Subsequent pushes
git push
```

---

## 6.9 Clone a Repository
Download a complete existing repository (including full history and all branches) to your computer:

```bash
git clone https://github.com/username/project.git
```

Git automatically creates a directory named after the project, initializes `.git`, configures `origin`, and checks out the default branch.

---

## 6.10 Fork a Repository
A **Fork** is a personal server-side copy of another user's GitHub repository created under your account.

### Why Fork?
- Propose changes to projects you don't have write access to (Open Source contributions).
- Use someone else's project as a starting point for your own experiment.

```text
[ Upstream Repository (e.g., facebook/react) ]
                     │
                     │ (Fork on GitHub)
                     ▼
[ Your Fork (e.g., yourname/react) ]
                     │
                     │ (git clone)
                     ▼
[ Local Machine Workstation ]
```

---

## 6.11 Pull Requests (PR)
A **Pull Request (PR)** notifies repository maintainers that you have completed changes on a branch and request them to review and merge your code into the target branch.

### Pull Request Workflow
```text
[ Feature Branch ] ──▶ [ Push to GitHub ] ──▶ [ Open Pull Request ]
                                                        │
                                                        ▼
[ Merge into main ] ◀── [ CI Checks Pass ] ◀── [ Code Review & Approval ]
```

---

## 6.12 Common GitHub Commands Summary

| Command | Purpose |
| :--- | :--- |
| `git remote add origin <url>` | Link local repo to remote GitHub repository |
| `git remote -v` | List configured remote URLs |
| `git push -u origin <branch>` | Upload commits and set upstream tracking |
| `git push` | Upload commits to tracking branch |
| `git clone <url>` | Download entire repository from GitHub |
| `git pull` | Fetch and merge remote changes into current branch |
| `git fetch` | Download remote changes without merging |

---

## 6.13 Best Practices
- Use clear, lowercase, kebab-case repository names (e.g., `user-auth-service`).
- Include a comprehensive `README.md` with setup instructions and architecture notes.
- Always develop in feature branches and merge via Pull Requests.
- Protect the `main` branch using GitHub branch protection rules.
- Keep secrets and API keys out of repositories by configuring `.gitignore`.

---

## 6.14 Common Mistakes
- ❌ Forgetting to run `git remote add origin` before running `git push`.
- ❌ Pushing code directly to `main` without peer review or automated tests.
- ❌ Committing credentials or tokens that trigger security alerts.
- ❌ Neglecting Pull Request review comments and feedback.

---

## Real-Time Scenario
A developer publishes a newly built React application to GitHub:

```bash
# 1. Initialize local repository
git init

# 2. Stage and commit files
git add .
git commit -m "Initial commit: React setup and dashboard component"

# 3. Link to remote repository on GitHub
git remote add origin https://github.com/company/react-app.git

# 4. Push default branch
git branch -M main
git push -u origin main
```

Another developer joins the project and clones it:
```bash
git clone https://github.com/company/react-app.git
```

---

## Interview Questions

### 1. What is GitHub?
**Answer:**
GitHub is a cloud-based hosting platform built on Git that enables developers to store repositories online, conduct code reviews, manage projects, and collaborate with teams worldwide.

### 2. What is the difference between `git clone` and forking on GitHub?
**Answer:**
- **`git clone`:** Downloads a repository directly from a remote host to your local machine.
- **Forking:** Creates an independent copy of another user's repository on your GitHub account so you can contribute via Pull Requests without having direct write permissions.

### 3. What is a Pull Request?
**Answer:**
A Pull Request is a GitHub mechanism that allows a developer to propose changes from one branch into another, enabling team discussion, automated CI testing, and code review before merging.

### 4. What does `git remote add origin <url>` do?
**Answer:**
It creates a named alias (`origin`) pointing to a remote repository URL, allowing you to easily push and pull changes without typing the full URL each time.

### 5. What does the `-u` flag do in `git push -u origin main`?
**Answer:**
The `-u` (or `--set-upstream`) flag establishes a tracking link between the local `main` branch and `origin/main`, allowing future commands to simply be `git push` or `git pull`.

---

## Practical Lab

### Task 1
Create a personal account on [GitHub.com](https://github.com).

### Task 2
Create a new public repository named `GitPractice` on GitHub.

### Task 3
Connect your local repository to GitHub:
```bash
git remote add origin https://github.com/your-username/GitPractice.git
```

### Task 4
Push your initial commit to GitHub:
```bash
git branch -M main
git push -u origin main
```

### Task 5
Clone your repository into a temporary second folder and verify all files download correctly:
```bash
git clone https://github.com/your-username/GitPractice.git test-download
```
