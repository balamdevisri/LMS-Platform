import fs from 'fs';
import path from 'path';

const outDir = './scripts/formatted_modules';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Module 6
const mod6 = `# Module 6: GitHub Basics

## Learning Objectives
After completing this module, you will be able to:
- Understand GitHub and its core cloud-collaboration features.
- Create and set up a personal GitHub account.
- Create new public and private repositories.
- Connect a local Git repository to a remote GitHub repository.
- Push local commits to GitHub using \`git push\`.
- Clone existing repositories with \`git clone\`.
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
4. Once approved, the branch is merged into \`main\`.
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
2. Enter a descriptive **Repository name** (e.g., \`GitPractice\` or \`ecommerce-api\`).
3. Provide an optional **Description**.
4. Choose visibility:
   - **Public:** Anyone on the internet can view your repository.
   - **Private:** Only you and explicitly invited collaborators can access the code.
5. (Optional) Initialize with a \`README.md\`, \`.gitignore\` template, and open-source \`LICENSE\`.
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

\`\`\`bash
# Add remote origin URL
git remote add origin https://github.com/username/project.git

# Verify configured remotes
git remote -v
\`\`\`

**Output:**
\`\`\`text
origin  https://github.com/username/project.git (fetch)
origin  https://github.com/username/project.git (push)
\`\`\`

---

## 6.8 Push Code to GitHub
Upload your local commits to the remote repository:

\`\`\`bash
# First push (sets upstream tracking branch)
git push -u origin main

# Subsequent pushes
git push
\`\`\`

---

## 6.9 Clone a Repository
Download a complete existing repository (including full history and all branches) to your computer:

\`\`\`bash
git clone https://github.com/username/project.git
\`\`\`

Git automatically creates a directory named after the project, initializes \`.git\`, configures \`origin\`, and checks out the default branch.

---

## 6.10 Fork a Repository
A **Fork** is a personal server-side copy of another user's GitHub repository created under your account.

### Why Fork?
- Propose changes to projects you don't have write access to (Open Source contributions).
- Use someone else's project as a starting point for your own experiment.

\`\`\`text
[ Upstream Repository (e.g., facebook/react) ]
                     │
                     │ (Fork on GitHub)
                     ▼
[ Your Fork (e.g., yourname/react) ]
                     │
                     │ (git clone)
                     ▼
[ Local Machine Workstation ]
\`\`\`

---

## 6.11 Pull Requests (PR)
A **Pull Request (PR)** notifies repository maintainers that you have completed changes on a branch and request them to review and merge your code into the target branch.

### Pull Request Workflow
\`\`\`text
[ Feature Branch ] ──▶ [ Push to GitHub ] ──▶ [ Open Pull Request ]
                                                        │
                                                        ▼
[ Merge into main ] ◀── [ CI Checks Pass ] ◀── [ Code Review & Approval ]
\`\`\`

---

## 6.12 Common GitHub Commands Summary

| Command | Purpose |
| :--- | :--- |
| \`git remote add origin <url>\` | Link local repo to remote GitHub repository |
| \`git remote -v\` | List configured remote URLs |
| \`git push -u origin <branch>\` | Upload commits and set upstream tracking |
| \`git push\` | Upload commits to tracking branch |
| \`git clone <url>\` | Download entire repository from GitHub |
| \`git pull\` | Fetch and merge remote changes into current branch |
| \`git fetch\` | Download remote changes without merging |

---

## 6.13 Best Practices
- Use clear, lowercase, kebab-case repository names (e.g., \`user-auth-service\`).
- Include a comprehensive \`README.md\` with setup instructions and architecture notes.
- Always develop in feature branches and merge via Pull Requests.
- Protect the \`main\` branch using GitHub branch protection rules.
- Keep secrets and API keys out of repositories by configuring \`.gitignore\`.

---

## 6.14 Common Mistakes
- ❌ Forgetting to run \`git remote add origin\` before running \`git push\`.
- ❌ Pushing code directly to \`main\` without peer review or automated tests.
- ❌ Committing credentials or tokens that trigger security alerts.
- ❌ Neglecting Pull Request review comments and feedback.

---

## Real-Time Scenario
A developer publishes a newly built React application to GitHub:

\`\`\`bash
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
\`\`\`

Another developer joins the project and clones it:
\`\`\`bash
git clone https://github.com/company/react-app.git
\`\`\`

---

## Interview Questions

### 1. What is GitHub?
**Answer:**
GitHub is a cloud-based hosting platform built on Git that enables developers to store repositories online, conduct code reviews, manage projects, and collaborate with teams worldwide.

### 2. What is the difference between \`git clone\` and forking on GitHub?
**Answer:**
- **\`git clone\`:** Downloads a repository directly from a remote host to your local machine.
- **Forking:** Creates an independent copy of another user's repository on your GitHub account so you can contribute via Pull Requests without having direct write permissions.

### 3. What is a Pull Request?
**Answer:**
A Pull Request is a GitHub mechanism that allows a developer to propose changes from one branch into another, enabling team discussion, automated CI testing, and code review before merging.

### 4. What does \`git remote add origin <url>\` do?
**Answer:**
It creates a named alias (\`origin\`) pointing to a remote repository URL, allowing you to easily push and pull changes without typing the full URL each time.

### 5. What does the \`-u\` flag do in \`git push -u origin main\`?
**Answer:**
The \`-u\` (or \`--set-upstream\`) flag establishes a tracking link between the local \`main\` branch and \`origin/main\`, allowing future commands to simply be \`git push\` or \`git pull\`.

---

## Practical Lab

### Task 1
Create a personal account on [GitHub.com](https://github.com).

### Task 2
Create a new public repository named \`GitPractice\` on GitHub.

### Task 3
Connect your local repository to GitHub:
\`\`\`bash
git remote add origin https://github.com/your-username/GitPractice.git
\`\`\`

### Task 4
Push your initial commit to GitHub:
\`\`\`bash
git branch -M main
git push -u origin main
\`\`\`

### Task 5
Clone your repository into a temporary second folder and verify all files download correctly:
\`\`\`bash
git clone https://github.com/your-username/GitPractice.git test-download
\`\`\`
`;

// Module 7
const mod7 = `# Module 7: Remote Repository Management

## Learning Objectives
After completing this module, you will be able to:
- Understand remote repositories and how Git tracks remote branches.
- Add, inspect, rename, and remove remote connections using \`git remote\`.
- Push local commits safely to remote branches with \`git push\`.
- Download and integrate changes using \`git pull\`.
- Inspect remote updates without modifying working files using \`git fetch\`.
- Understand the technical differences between Push, Pull, and Fetch.
- Configure and manage upstream tracking branches.
- Manage multiple remote connections (e.g., \`origin\` and \`upstream\`).

---

## 7.1 Introduction
A **Remote Repository** is a version-controlled project hosted on an accessible network server or cloud service (such as GitHub, GitLab, or Bitbucket). It serves as the single source of truth for synchronization among team members.

Remote repositories enable teams to:
- Share source code across distributed locations.
- Synchronize features and bug fixes asynchronously.
- Centralize continuous integration and deployment pipelines.
- Maintain secure off-site backups of project history.

### Definition
A **Remote Repository** is a Git repository hosted on a remote server that allows multiple developers to share, synchronize, and collaborate on project code.

---

## 7.2 Local vs Remote Repository

| Feature | Local Repository | Remote Repository |
| :--- | :--- | :--- |
| **Hosting** | Local hard disk | Remote cloud server (GitHub) |
| **Access** | Single developer workstation | Distributed team members & automation bots |
| **Internet** | Operates 100% offline | Requires internet connection |
| **Function** | Active code creation & staging | Collaboration, integration & backup |

---

## 7.3 Viewing Remote Repositories
To inspect remote repositories currently configured in your project:

\`\`\`bash
# List remote aliases
git remote

# List remote aliases with their full URLs
git remote -v
\`\`\`

**Example Output:**
\`\`\`text
origin  https://github.com/company/project.git (fetch)
origin  https://github.com/company/project.git (push)
\`\`\`

---

## 7.4 Adding, Renaming, and Removing Remotes

\`\`\`bash
# Add a new remote connection
git remote add origin https://github.com/username/project.git

# Add a secondary remote (e.g., upstream open-source repo)
git remote add upstream https://github.com/original-owner/project.git

# Rename an existing remote alias
git remote rename origin primary

# Remove a remote connection
git remote remove primary
\`\`\`

---

## 7.5 Push Changes (\`git push\`)
The \`git push\` command transmits local committed snapshots to a specified remote repository and branch.

\`\`\`bash
# Push specific branch to origin
git push origin main

# Push and set upstream tracking
git push -u origin main

# Push when upstream tracking is already configured
git push
\`\`\`

---

## 7.6 Pull Changes (\`git pull\`)
The \`git pull\` command downloads commits from the remote repository and immediately merges them into your active local branch.

\`\`\`bash
# Pull from specific remote and branch
git pull origin main

# Pull using default upstream tracking
git pull
\`\`\`

### Internal Mechanism
Under the hood, \`git pull\` is a combination of two operations:
\`\`\`text
git pull = git fetch + git merge
\`\`\`

---

## 7.7 Fetch Changes (\`git fetch\`)
The \`git fetch\` command downloads commits, files, and refs from a remote repository into your local \`.git\` database **without modifying your working directory or active branch**.

\`\`\`bash
# Fetch updates from origin
git fetch origin

# Fetch updates from all configured remotes
git fetch --all
\`\`\`

After fetching, you can inspect changes safely using:
\`\`\`bash
# Compare your local branch against the fetched remote branch
git diff main origin/main

# Manually merge after reviewing
git merge origin/main
\`\`\`

---

## 7.8 Push vs Pull vs Fetch Comparison

| Command | Action | Modifies Working Directory? | Safety Level |
| :--- | :--- | :--- | :--- |
| **\`git push\`** | Transmits local commits to remote | No | Safe (rejected if remote has diverged) |
| **\`git fetch\`** | Downloads remote commits into \`.git\` | No | 100% Safe (inspect before merge) |
| **\`git pull\`** | Downloads AND merges remote commits | **Yes** (creates merge or conflicts) | Caution (can cause unexpected merge conflicts) |

---

## 7.9 Upstream Tracking Branches
An **Upstream Branch** establishes a direct mapping between a local branch and a remote branch (e.g., local \`feature\` tracking \`origin/feature\`).

\`\`\`bash
# Set upstream tracking on push
git push -u origin feature/auth

# View tracking status for all branches
git branch -vv
\`\`\`

**Output:**
\`\`\`text
* main         a1b2c3d [origin/main] Added user dashboard
  feature/auth e4f5g6h [origin/feature/auth: ahead 1] Added JWT login
\`\`\`

---

## 7.10 Managing Multiple Remotes (Forking Workflow)
In open-source and enterprise workflows, you often track two remotes:
1. **\`origin\`:** Your personal fork on GitHub (where you have write access).
2. **\`upstream\`:** The central organization repository (where you fetch official updates).

\`\`\`bash
# Add original project as upstream
git remote add upstream https://github.com/org/main-project.git

# Fetch latest updates from upstream
git fetch upstream

# Rebase or merge upstream changes into your local main
git switch main
git merge upstream/main

# Push synchronized main to your fork
git push origin main
\`\`\`

---

## 7.11 Common Remote Commands Summary

| Command | Purpose |
| :--- | :--- |
| \`git remote -v\` | List all remote aliases and fetch/push URLs |
| \`git remote add <name> <url>\` | Add new remote connection |
| \`git remote rename <old> <new>\` | Rename remote alias |
| \`git remote remove <name>\` | Delete remote alias |
| \`git push <remote> <branch>\` | Upload commits to remote branch |
| \`git fetch <remote>\` | Download remote updates without merging |
| \`git pull <remote> <branch>\` | Download and merge remote updates |
| \`git branch -r\` | List all remote-tracking branches |

---

## 7.12 Best Practices
- Run \`git fetch\` or \`git pull\` before starting new feature development.
- Always configure upstream tracking (\`-u\`) on initial branch push.
- Keep your fork synchronized with the upstream repository.
- Avoid using force push (\`--force\`) on shared remote branches like \`main\`.

---

## 7.13 Common Mistakes
- ❌ Running \`git pull\` with uncommitted local changes, causing messy conflicts.
- ❌ Forgetting to fetch upstream changes in a forked workflow, leading to outdated branches.
- ❌ Using force push on public branches and overwriting colleagues' work.

---

## Interview Questions

### 1. What is the difference between \`git fetch\` and \`git pull\`?
**Answer:**
\`git fetch\` downloads new commits and refs from the remote repository without altering your working directory. \`git pull\` executes \`git fetch\` followed immediately by \`git merge\`, modifying your active branch.

### 2. What is the purpose of an upstream branch in Git?
**Answer:**
An upstream branch links a local branch to a specific remote branch, enabling shorthand commands like \`git push\` and \`git pull\` and allowing Git to display commit lead/lag counts.

### 3. How do you rename a remote alias from \`origin\` to \`upstream\`?
**Answer:**
\`\`\`bash
git remote rename origin upstream
\`\`\`

### 4. How do you synchronize a personal fork with the official upstream repository?
**Answer:**
Fetch updates from \`upstream\` (\`git fetch upstream\`), merge \`upstream/main\` into local \`main\` (\`git merge upstream/main\`), and push the updated \`main\` to your fork (\`git push origin main\`).

---

## Practical Lab

### Task 1
Inspect your configured remote repositories using:
\`\`\`bash
git remote -v
\`\`\`

### Task 2
Add a new remote alias named \`backup\` pointing to a secondary repository URL:
\`\`\`bash
git remote add backup https://github.com/username/backup-repo.git
\`\`\`

### Task 3
Fetch all updates from the \`origin\` remote without merging:
\`\`\`bash
git fetch origin
\`\`\`

### Task 4
Inspect the differences between your local \`main\` branch and \`origin/main\`:
\`\`\`bash
git diff main origin/main
\`\`\`

### Task 5
Remove the temporary \`backup\` remote connection:
\`\`\`bash
git remote remove backup
git remote -v
\`\`\`
`;

// Module 8
const mod8 = `# Module 8: Git Collaboration

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
- **Developer A:** Develops the Restaurant Discovery Module (\`feature/restaurant-feed\`).
- **Developer B:** Implements the Payment Gateway Integration (\`feature/stripe-payments\`).
- **Developer C:** Fixes real-time driver tracking bugs (\`bugfix/gps-socket-lag\`).

Each developer creates a feature branch, submits a Pull Request, participates in code review, and merges once approved.

---

## 8.2 Team Collaboration Workflow

\`\`\`text
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
\`\`\`

---

## 8.3 Feature Branch Workflow
Rather than committing directly to \`main\`, all new development takes place in isolated branches named with standard conventions:

\`\`\`text
main ─────────────────────────────────────────────────────────▶ (Stable Production)
  │                                                      ▲
  ├──▶ feature/login ──────── C1 ── C2 ── (PR Merge) ────┤
  │                                                      │
  └──▶ feature/payment ────── C3 ── C4 ── (PR Merge) ────┘
\`\`\`

### Key Benefits
- The \`main\` branch remains continuously deployable and stable.
- Unfinished or experimental code is kept away from production.
- Code reviews and automated tests are scoped precisely to the feature's diff.

---

## 8.4 Pull Requests (PR) and Code Review
A **Pull Request** is a collaborative review hub on GitHub where developers discuss, inspect, and approve proposed code changes.

### Elements of a High-Quality Pull Request
- **Title:** Concise summary of the change (e.g., \`feat(auth): Add Google OAuth2 login\`).
- **Description:** Context, motivation, and implementation summary.
- **Related Issues:** References to tracked issues (e.g., \`Closes #42\`).
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
- **Best for:** Feature branches with messy interim commits (\`"fix typo"\`, \`"wip"\`). Keeps \`main\` history linear and readable.

### 3. Rebase and Merge
Reapplies all individual commits from the feature branch directly on top of the base branch without a merge commit.
- **Best for:** Maintaining a strictly linear history while preserving individual commit identity.

---

## 8.6 Collaborative Conflict Resolution
When two developers modify the same file on different branches, a conflict arises upon merging.

### Resolution Steps
1. Switch to your feature branch: \`git switch feature/my-feature\`
2. Fetch latest \`main\`: \`git fetch origin\`
3. Merge or rebase \`origin/main\` into your branch:
   \`\`\`bash
   git merge origin/main
   \`\`\`
4. Open the conflicted files, resolve conflict markers, and test the build.
5. Stage resolved files: \`git add <files>\`
6. Commit resolution: \`git commit -m "Resolved merge conflicts with main"\`
7. Push to GitHub to update the Pull Request: \`git push origin feature/my-feature\`

---

## 8.7 Best Practices for Git Collaboration
- Keep Pull Requests small (under 400 lines of code) for faster, thorough reviews.
- Write constructive, empathetic code review comments.
- Pull the latest \`main\` into your feature branch daily.
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
The Feature Branch Workflow is a development model where all feature additions, bug fixes, and experiments take place in dedicated branches rather than directly on \`main\`, keeping the main branch stable and deployable.

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
Create a new branch named \`feature/navbar\`:
\`\`\`bash
git switch -c feature/navbar
\`\`\`

### Task 2
Add a navigation component file \`navbar.html\`, stage and commit it:
\`\`\`bash
git add navbar.html
git commit -m "Added responsive navigation bar"
\`\`\`

### Task 3
Push the branch to GitHub:
\`\`\`bash
git push -u origin feature/navbar
\`\`\`

### Task 4
Open a Pull Request on GitHub from \`feature/navbar\` to \`main\`.

### Task 5
Review the Pull Request diff, approve it, merge using **Squash and Merge**, and delete the remote branch.
`;

// Module 9
const mod9 = `# Module 9: Advanced Git Commands

## Learning Objectives
After completing this module, you will be able to:
- Master advanced Git operations for complex workflows and troubleshooting.
- Temporarily shelve uncommitted work using \`git stash\`.
- Undo commits and unstage changes using \`git reset\` (Soft, Mixed, Hard).
- Safely reverse public commits using \`git revert\`.
- Selectively cherry-pick individual commits with \`git cherry-pick\`.
- Reapply and linearize commit history using \`git rebase\`.
- Create and manage lightweight and annotated Git release tags (\`git tag\`).

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

## 9.2 Git Stash (\`git stash\`)
\`git stash\` temporarily shelves (stashes) uncommitted modifications in your working directory and staging area, restoring your workspace to a clean \`HEAD\` state.

\`\`\`bash
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
\`\`\`

---

## 9.3 Git Reset (\`git reset\`)
\`git reset\` moves the current branch pointer backward to a specified commit. It provides three primary modes:

\`\`\`text
                        [ HEAD~1 ]
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
  --soft                --mixed                --hard
(Keeps Staged)     (Keeps Working Tree)   (Discards Everything)
\`\`\`

### 1. Soft Reset (\`--soft\`)
Moves \`HEAD\` back to the target commit but keeps all changes staged in the index.
\`\`\`bash
git reset --soft HEAD~1
\`\`\`

### 2. Mixed Reset (\`--mixed\` - Default)
Moves \`HEAD\` back and unstages changes, keeping all file modifications in your working directory.
\`\`\`bash
git reset HEAD~1
\`\`\`

### 3. Hard Reset (\`--hard\`)
Moves \`HEAD\` back and **permanently discards** all working directory modifications and staged files.
\`\`\`bash
git reset --hard HEAD~1
\`\`\`

> [!CAUTION]
> \`git reset --hard\` permanently wipes out uncommitted changes. Use with extreme care.

---

## 9.4 Git Revert (\`git revert\`)
\`git revert\` creates a **new commit** that applies the exact inverse of a target commit. It is the safe, recommended way to undo changes on public, shared branches.

\`\`\`bash
# Revert a specific commit by hash
git revert a1b2c3d

# Revert without automatically committing immediately
git revert --no-commit a1b2c3d
\`\`\`

---

## 9.5 Git Reset vs Git Revert

| Feature | \`git reset\` | \`git revert\` |
| :--- | :--- | :--- |
| **History Effect** | Rewrites / deletes commit history | Appends a new reversing commit |
| **Safety on Shared Branches** | Dangerous (breaks colleagues' history) | Safe (ideal for public/shared branches) |
| **Scope** | Local branches | Public, shared, and production branches |

---

## 9.6 Git Cherry-Pick (\`git cherry-pick\`)
\`git cherry-pick\` applies the changes introduced by one or more specific commits from another branch onto your active branch.

\`\`\`bash
# Apply a specific commit onto current branch
git cherry-pick 5d3f2ab

# Apply multiple specific commits
git cherry-pick abc1234 def5678
\`\`\`

### Real-Time Example
A critical security hotfix was committed on \`develop\` (commit \`c7a8b9f\`). Instead of merging the entire unstable \`develop\` branch into production \`main\`, you cherry-pick only the security fix commit:
\`\`\`bash
git switch main
git cherry-pick c7a8b9f
git push origin main
\`\`\`

---

## 9.7 Git Rebase (\`git rebase\`)
\`git rebase\` moves or reapplies a sequence of commits on top of a new base commit, creating a clean, linear project history.

\`\`\`text
Before Rebase:
main:          C1 ── C2 ── C3
                      \
feature:               C4 ── C5

After Rebase (git switch feature && git rebase main):
main:          C1 ── C2 ── C3
                            \
feature:                     C4' ── C5' (Linear on top of main)
\`\`\`

### Command
\`\`\`bash
git switch feature/login
git rebase main
\`\`\`

---

## 9.8 Git Tag (\`git tag\`)
Tags create permanent, named reference points in commit history, typically used to mark releases (e.g., \`v1.0.0\`).

\`\`\`bash
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
\`\`\`

---

## 9.9 Advanced Git Commands Summary

| Command | Purpose |
| :--- | :--- |
| \`git stash\` | Temporarily shelve uncommitted working tree changes |
| \`git stash pop\` | Restore and remove most recent stash |
| \`git reset --soft HEAD~1\` | Undo commit, keep changes staged |
| \`git reset --hard HEAD~1\` | Undo commit, permanently discard changes |
| \`git revert <hash>\` | Create new commit reversing target commit |
| \`git cherry-pick <hash>\` | Copy specific commit onto active branch |
| \`git rebase <branch>\` | Reapply commits on top of another base branch |
| \`git tag -a <tag> -m "msg"\` | Create annotated release tag |

---

## 9.10 Best Practices
- Use \`git stash\` instead of creating temporary \`"wip"\` commits.
- Never use \`git reset --hard\` or \`git rebase\` on public shared branches.
- Always use \`git revert\` to undo changes already pushed to remote repositories.
- Use annotated tags (\`-a\`) for production version releases.

---

## Interview Questions

### 1. What is the difference between \`git stash apply\` and \`git stash pop\`?
**Answer:**
\`git stash pop\` applies the stashed changes to your working directory and immediately deletes them from the stash list. \`git stash apply\` restores the changes but preserves the stash entry for future reuse.

### 2. Explain the difference between \`git reset --soft\`, \`--mixed\`, and \`--hard\`.
**Answer:**
- \`--soft\`: Resets commit history, keeping modified files staged in the index.
- \`--mixed\`: Resets commit history and unstages files, keeping modifications in the working tree.
- \`--hard\`: Resets commit history, staging area, and working directory, completely discarding all uncommitted changes.

### 3. When should you use \`git revert\` instead of \`git reset\`?
**Answer:**
Use \`git revert\` when the commit has already been pushed to a shared remote repository, as it safely creates a new inverse commit without rewriting public history.

### 4. What is \`git cherry-pick\` and when is it useful?
**Answer:**
\`git cherry-pick\` selectively applies an individual commit from one branch onto another without merging the rest of the branch. It is ideal for porting isolated hotfixes across branches.

---

## Practical Lab

### Task 1
Create temporary file edits and stash them using \`git stash\`.

### Task 2
Verify the stash list and restore the changes using:
\`\`\`bash
git stash pop
\`\`\`

### Task 3
Create an annotated release tag named \`v1.0.0\`:
\`\`\`bash
git tag -a v1.0.0 -m "First production release"
\`\`\`

### Task 4
Inspect tag details with \`git show v1.0.0\`.

### Task 5
Practice applying a commit from another branch using \`git cherry-pick <commit-hash>\`.
`;

// Module 10
const mod10 = `# Module 10: Git Internals

## Learning Objectives
After completing this module, you will be able to:
- Understand Git's internal architecture as a content-addressable database.
- Learn how Git stores and retrieves data using SHA-1 / SHA-256 cryptographic hashes.
- Master the four core Git internal objects: Blob, Tree, Commit, and Tag.
- Understand how Git tracks references (\`refs/heads\`, \`refs/tags\`, \`refs/remotes\`).
- Understand the role of the \`HEAD\` reference and detached HEAD states.
- Understand the internal structure of the Staging Index (\`.git/index\`).
- Inspect low-level Git plumbing objects using \`git cat-file\`.

---

## 10.1 Introduction
Git is fundamentally a **Content-Addressable Key-Value Database** with a Version Control System interface layered on top. Rather than storing file deltas (diffs), Git stores **full snapshots** of your project directory structure, referencing every piece of data by its cryptographic hash.

Understanding Git Internals equips developers to:
- Troubleshoot and recover lost commits or detached states.
- Understand exactly what happens during staging, commits, and merges.
- Confidently use advanced plumbing commands.
- Appreciate Git's high speed and data integrity guarantees.

### Definition
**Git Internals** refers to the underlying data structures, object models, and reference mechanisms that Git uses to record project history, manage branches, and guarantee content integrity.

---

## 10.2 Internal Architecture Overview
The \`.git\` directory is organized into several key components:

\`\`\`text
.git/
├── objects/            # Object database (Blobs, Trees, Commits, Tags)
│   ├── 4b/
│   │   └── 825dc642cb6eb9a060e54bf8d69288fbee4904
│   └── info/
├── refs/               # References to commits
│   ├── heads/          # Local branch pointers (e.g., main -> commit hash)
│   ├── remotes/        # Remote-tracking branch pointers
│   └── tags/           # Tag pointers
├── HEAD                # Pointer to active branch (e.g., ref: refs/heads/main)
├── index               # Binary cache of the Staging Area
└── config              # Repository-specific configuration
\`\`\`

---

## 10.3 Cryptographic Hashing (SHA-1)
Every object stored in Git is uniquely named after its 40-character SHA-1 hash (160 bits), computed from its type, size, and content.

### Hash Structure
\`\`\`text
SHA-1 Hash Example:
9fceb02d0ae598e95dc970b74767f19372d61af8
──┬─  ──────────────────┬─────────────────
  │                     │
Folder Name        File Name in .git/objects/
(.git/objects/9f/) (ceb02d0ae598e95dc970b74767f19372d61af8)
\`\`\`

### Benefits of Content Addressing
- **Immutability:** If a single character in a file changes, its hash changes completely.
- **Deduplication:** Identical files across different directories or commits share the exact same Blob object.
- **Tamper Evidence:** Any corruption or tampering is immediately detectable.

---

## 10.4 The Four Fundamental Git Objects

\`\`\`text
      [ Commit Object ]
             │ (Points to root Tree)
             ▼
       [ Tree Object ] (Root Directory)
        │           │
        │           ▼
        │     [ Tree Object ] (src/ Subdirectory)
        │           │
        ▼           ▼
  [ Blob Object ] [ Blob Object ]
  (README.md)     (app.js)
\`\`\`

### 1. Blob Object
Stores the raw file content. It does not store filenames, permissions, or directory paths.
- Inspecting a Blob: \`git cat-file -p <hash>\`

### 2. Tree Object
Represents a directory. A Tree contains a list of file mode permissions, object types, SHA-1 hashes, and filenames.

### 3. Commit Object
Represents a permanent snapshot. A Commit contains:
- Top-level Tree hash pointer
- Parent commit hash pointer(s)
- Author name, email, and timestamp
- Committer name, email, and timestamp
- Commit message

### 4. Tag Object
An annotated release tag containing a pointer to a specific commit hash, tagger details, timestamp, and release message.

---

## 10.5 Low-Level Inspection with \`git cat-file\`
Git provides low-level plumbing commands to inspect objects:

\`\`\`bash
# View the type of an object (blob, tree, commit, tag)
git cat-file -t 9fceb02

# View the size of an object in bytes
git cat-file -s 9fceb02

# Pretty-print the content of any Git object
git cat-file -p 9fceb02
\`\`\`

---

## 10.6 The HEAD Reference & Detached HEAD
The \`.git/HEAD\` file contains a symbolic reference pointing to the currently checked-out branch:

\`\`\`text
ref: refs/heads/main
\`\`\`

### Detached HEAD State
When you check out a specific commit directly instead of a branch (\`git checkout <commit-hash>\`), \`HEAD\` points directly to the commit SHA rather than a named branch ref:

\`\`\`text
HEAD ──▶ Commit C2 (Detached HEAD - No branch tracking!)
\`\`\`

> [!TIP]
> To save changes made in a detached HEAD state, create a new branch: \`git switch -c new-feature-branch\`.

---

## 10.7 Git Index (The Staging Area)
The file \`.git/index\` is a binary file that stores the staging area. It tracks:
- Cached file paths
- Timestamps and file sizes
- SHA-1 hashes of the Blobs corresponding to staged files

When you run \`git add\`, Git writes the file content as a Blob into \`.git/objects/\` and updates \`.git/index\` with the new Blob hash.

---

## 10.8 Best Practices
- Never manually delete or edit files inside \`.git/objects/\` or \`.git/refs/\`.
- Use \`git fsck\` to verify database integrity if you suspect filesystem corruption.
- Use \`git gc\` (Garbage Collection) to optimize repository size and prune unreachable objects.

---

## Interview Questions

### 1. What does it mean that Git is a content-addressable database?
**Answer:**
Git identifies and stores all data (files, directories, commits, tags) using cryptographic hashes calculated directly from their content, rather than referencing them by filename or location.

### 2. What are the four core Git object types?
**Answer:**
1. **Blob:** Stores file content.
2. **Tree:** Stores directory structure and file names.
3. **Commit:** Stores snapshot metadata, author, date, and parent pointers.
4. **Tag:** Stores annotated release markers pointing to specific commits.

### 3. What is a detached HEAD state in Git?
**Answer:**
A detached HEAD occurs when \`HEAD\` points directly to a commit hash rather than a named branch reference. Commits created in this state will become orphaned unless a new branch is created.

### 4. What command is used to inspect the contents and type of an internal Git object?
**Answer:**
\`git cat-file -p <hash>\` to pretty-print content and \`git cat-file -t <hash>\` to check object type.

---

## Practical Lab

### Task 1
Initialize a new Git repository and inspect the contents of the \`.git\` folder:
\`\`\`bash
ls -la .git
\`\`\`

### Task 2
Create a file \`sample.txt\`, add content, stage it with \`git add sample.txt\`, and verify that a new object was created in \`.git/objects/\`.

### Task 3
Use \`git log --oneline\` to get the latest commit hash and inspect it with:
\`\`\`bash
git cat-file -p HEAD
\`\`\`

### Task 4
Inspect the Tree object referenced by the commit using \`git cat-file -p <tree-hash>\`.

### Task 5
Inspect a Blob object referenced inside the Tree using \`git cat-file -p <blob-hash>\`.
`;

fs.writeFileSync(path.join(outDir, 'mod_6.md'), mod6, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_7.md'), mod7, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_8.md'), mod8, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_9.md'), mod9, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_10.md'), mod10, 'utf8');

console.log('Successfully generated Modules 6 to 10!');
