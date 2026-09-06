import fs from 'fs';
import path from 'path';

const outDir = './scripts/formatted_modules';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Module 11
const mod11 = `# Module 11: GitHub Features

## Learning Objectives
After completing this module, you will be able to:
- Understand the major built-in features and tooling available on GitHub.
- Track bugs and feature requests using GitHub Issues.
- Plan and manage sprints with Kanban-style GitHub Projects.
- Facilitate open team conversations using GitHub Discussions.
- Build comprehensive documentation with GitHub Wiki.
- Package and distribute software using GitHub Releases.
- Host static websites and documentation with GitHub Pages.
- Understand the fundamentals of CI/CD automation with GitHub Actions.
- Monitor project velocity and traffic using GitHub Insights.

---

## 11.1 Introduction
GitHub is far more than a Git repository hosting platform—it is a comprehensive, cloud-native software development and project management ecosystem. Organizations use GitHub to coordinate the entire application lifecycle from initial planning to automated deployment.

Key capabilities include:
- Centralized source code hosting and branch management.
- Structured issue tracking and feature triage.
- Visual agile sprint planning with project boards.
- Thorough peer code reviews via Pull Requests.
- Automated CI/CD pipelines with GitHub Actions.
- Integrated technical wiki documentation.
- Production binary distribution via GitHub Releases.

### Definition
**GitHub Features** are built-in collaborative tools that enable developers and organizations to manage projects, track issues, review code, automate workflows, document systems, and deploy applications seamlessly.

### Real-Time Example
In an E-Commerce engineering organization:
- **Repositories:** Store backend, frontend, and microservice codebases.
- **Issues:** Track bug reports from QA and customer support.
- **Projects:** Manage agile sprint backlogs and task assignments.
- **Pull Requests:** Facilitate strict code reviews before merging.
- **Wiki:** Host developer onboarding guides and API specifications.
- **Actions:** Automatically test, build Docker images, and deploy to Kubernetes.
- **Releases:** Publish tagged production versions for mobile apps and services.

---

## 11.2 GitHub Issues
GitHub Issues provides an integrated issue tracker for tracking bugs, enhancements, and tasks.

### Core Components of an Issue
- **Title & Description:** Clear summary and reproduction steps.
- **Labels:** Color-coded tags (e.g., \`bug\`, \`enhancement\`, \`documentation\`, \`good first issue\`).
- **Assignees:** Team members responsible for resolving the issue.
- **Milestones:** Target release deadlines (e.g., \`Sprint 24\`, \`v2.0.0\`).
- **Issue Templates:** Standardized Markdown forms for bug reports and feature requests.

---

## 11.3 GitHub Projects
GitHub Projects offers customizable Kanban boards and spreadsheet tables to organize and prioritize work.

\`\`\`text
[ To Do ] ──▶ [ In Progress ] ──▶ [ In Review ] ──▶ [ Done ]
\`\`\`

### Key Benefits
- Visual tracking of issue and pull request statuses in real time.
- Automated status updates when pull requests are opened or merged.
- Cross-repository roadmap planning for multi-team initiatives.

---

## 11.4 GitHub Discussions
GitHub Discussions acts as a collaborative forum for team members and open-source communities to converse outside of the rigid lifecycle of issues or code reviews.

### Common Use Cases
- Asking open-ended technical questions.
- Discussing proposed architecture changes and RFCs.
- Gathering product feedback and feature ideas from users.
- Publishing community announcements and release highlights.

---

## 11.5 GitHub Wiki
GitHub Wiki provides a dedicated, version-controlled documentation space attached to your repository.

### Typical Wiki Sections
- Architecture and system design diagrams.
- Local developer environment setup instructions.
- API documentation and endpoint references.
- Frequently Asked Questions (FAQs) and troubleshooting steps.

---

## 11.6 GitHub Releases
GitHub Releases packages software builds, source code archives, and release notes for end users.

### Elements of a Release
- **Git Tag:** The specific commit tag (e.g., \`v1.0.0\`).
- **Release Title:** Marketing/engineering name (e.g., \`v1.0.0 — Production General Availability\`).
- **Changelog:** Detailed list of new features, bug fixes, and breaking changes.
- **Binary Assets:** Compiled binaries, installers, APKs, or \`.tar.gz\` packages.

---

## 11.7 GitHub Pages
GitHub Pages turns your repository into a hosted static website directly from GitHub servers.

### Supported Technologies
- Plain HTML, CSS, and client-side JavaScript.
- Static Site Generators like Jekyll, Hugo, Astro, or Vite builds.

### Use Cases
- Personal developer portfolios (\`https://username.github.io\`).
- Project documentation portals (\`https://username.github.io/project-name\`).
- Product landing pages and interactive demo sites.

---

## 11.8 GitHub Actions (CI/CD)
GitHub Actions is a built-in workflow automation platform that enables Continuous Integration and Continuous Deployment (CI/CD).

\`\`\`text
[ Push Code / Open PR ]
           │
           ▼
[ GitHub Actions Runner ]
           │
     ┌─────┴─────┐
     ▼           ▼
[ Run Linter ] [ Run Tests ]
     │           │
     └─────┬─────┘
           ▼
  [ Build Production ]
           │
           ▼
[ Deploy to Cloud ]
\`\`\`

Workflows are declared as YAML files in the \`.github/workflows/\` directory.

---

## 11.9 GitHub Insights
GitHub Insights provides repository analytics:
- **Pulse:** Summary of active pull requests, issues, and commits.
- **Contributors:** Contribution graphs showing additions, deletions, and commit frequencies.
- **Traffic:** Unique visitors and page views over time.
- **Dependency Graph & Dependabot:** Automated alerts for outdated or vulnerable packages.

---

## 11.10 GitHub Features Summary

| Feature | Primary Purpose |
| :--- | :--- |
| **Repository** | Store and version-control source code |
| **Issues** | Track bugs, tasks, and feature requests |
| **Projects** | Manage sprints and workflows using Kanban boards |
| **Discussions** | Community forum and architectural debates |
| **Wiki** | Multi-page project documentation |
| **Releases** | Package and distribute versioned software builds |
| **Pages** | Free static website and portfolio hosting |
| **Actions** | Automated CI/CD testing, building, and deployment |
| **Insights** | Traffic metrics, commit velocity, and security alerts |

---

## 11.11 Best Practices
- Use issue templates to ensure bug reports contain reproduction steps.
- Maintain an active Project board to align team priorities.
- Automate test suites and linting on every Pull Request using GitHub Actions.
- Publish tagged releases with comprehensive release notes.
- Keep repository documentation updated in the Wiki or \`/docs\` folder.

---

## 11.12 Common Mistakes
- ❌ Using Issues for informal chat rather than GitHub Discussions.
- ❌ Forgetting to close resolved Issues when merging pull requests.
- ❌ Committing build binaries directly into Git rather than publishing via GitHub Releases.
- ❌ Neglecting Dependabot security alerts.

---

## Interview Questions

### 1. What is the difference between GitHub Issues and GitHub Discussions?
**Answer:**
GitHub Issues is designed for actionable work items with a lifecycle (open/closed), such as bugs, feature tasks, and technical debt. GitHub Discussions is an open-ended communication forum for Q&A, brainstorming, and announcements.

### 2. What is GitHub Actions and why is it important?
**Answer:**
GitHub Actions is a native CI/CD workflow automation engine that automatically runs linting, tests, builds, and cloud deployments whenever code events (pushes, pull requests, releases) occur.

### 3. How does GitHub Pages work?
**Answer:**
GitHub Pages automatically serves static web files (HTML, CSS, JS) directly from a designated branch (like \`gh-pages\` or \`main/docs\`) to a public URL.

### 4. What information should be included in a GitHub Release?
**Answer:**
A semantic version tag, release title, structured changelog (features, bug fixes, breaking changes), and compiled binary attachments or distribution packages.

---

## Practical Lab

### Task 1
Create a GitHub repository and enable the Issues and Discussions tabs in settings.

### Task 2
Create three organized Issues with labels:
1. \`Login Component Bug\` (Label: \`bug\`)
2. \`Stripe Payment Integration\` (Label: \`enhancement\`)
3. \`API Documentation\` (Label: \`documentation\`)

### Task 3
Create a GitHub Project board with columns: \`To Do\`, \`In Progress\`, \`In Review\`, and \`Done\`.

### Task 4
Create a Wiki page titled \`Installation Guide\` with environment setup instructions.

### Task 5
Draft a GitHub Release tagged \`v1.0.0\` with structured release notes.
`;

// Module 12
const mod12 = `# Module 12: Git Best Practices

## Learning Objectives
After completing this module, you will be able to:
- Follow enterprise-grade Git workflows and development standards.
- Write clear, standardized, and meaningful commit messages.
- Apply professional branch naming conventions.
- Configure and optimize \`.gitignore\` for clean repositories.
- Structure repository files and folders according to industry standards.
- Protect secrets, credentials, and API keys.
- Configure GitHub branch protection rules.
- Maintain and audit long-running repositories.

---

## 12.1 Introduction
Writing clean code is only one component of professional software engineering. High-performing engineering teams establish rigorous version control standards to ensure codebases remain organized, secure, audit-compliant, and easy to maintain over years of active development.

Adhering to Git Best Practices ensures:
- Clean, searchable, and informative commit histories.
- Drastic reduction in merge conflicts and deployment delays.
- Elimination of credential leaks and security vulnerabilities.
- Smooth onboarding of new engineers.
- High software reliability across production releases.

### Definition
**Git Best Practices** are a standardized collection of guidelines, naming conventions, security protocols, and workflow rules that enable engineering teams to use Git efficiently, securely, and sustainably.

---

## 12.2 Writing Professional Commit Messages
A commit message explains the *intent* and *context* of a change.

### The Conventional Commits Format
\`\`\`text
<type>(<optional scope>): <short summary in imperative mood>

[optional detailed body explaining why and what changed]

[optional issue reference, e.g., Closes #123]
\`\`\`

### Standard Commit Types
- \`feat:\` A new feature for the user
- \`fix:\` A bug fix
- \`docs:\` Documentation changes
- \`style:\` Formatting, missing semicolons (no code logic change)
- \`refactor:\` Refactoring production code without changing behavior
- \`test:\` Adding or updating tests
- \`chore:\` Updating dependencies, build scripts, or configuration

### Examples
\`\`\`text
Good Commit Messages:
feat(auth): Add Google OAuth2 login button
fix(cart): Prevent negative item quantities during checkout
docs(readme): Add local Docker setup instructions
refactor(api): Extract user validation into reusable middleware

Bad Commit Messages:
update, fix, changes, wip, test, asdf, bugfix
\`\`\`

---

## 12.3 Branch Naming Conventions
Structured branch prefixes allow automated CI tools and teammates to immediately recognize the branch purpose:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| \`feature/\` | New user-facing capability | \`feature/user-profiles\` |
| \`bugfix/\` | Standard non-urgent bug fix | \`bugfix/dropdown-z-index\` |
| \`hotfix/\` | Critical production outage fix | \`hotfix/auth-token-expiry\` |
| \`release/\` | Release candidate preparation | \`release/v2.1.0\` |
| \`chore/\` | Tooling or dependency updates | \`chore/upgrade-tailwind\` |

---

## 12.4 Configuring \`.gitignore\`
The \`.gitignore\` file ensures that temporary, machine-specific, or sensitive files are never tracked by Git.

### Recommended Multi-Language \`.gitignore\` Template
\`\`\`gitignore
# Dependencies
node_modules/
vendor/
__pycache__/
*.pyc

# Environment & Secrets (CRITICAL)
.env
.env.local
.env.production
*.pem
*.key

# Build Artifacts
dist/
build/
out/
*.log

# Operating System & IDE Files
.DS_Store
Thumbs.db
.vscode/
.idea/
\`\`\`

---

## 12.5 Professional Repository Structure
A well-architected repository provides clear separation of concerns:

\`\`\`text
MyProject/
├── .github/                 # GitHub Actions workflows & issue templates
│   ├── workflows/ci.yml
│   └── ISSUE_TEMPLATE/
├── src/                     # Application source code
├── tests/                   # Unit, integration, and E2E test suites
├── docs/                    # Architecture and developer documentation
├── public/ / assets/        # Static images, icons, and fonts
├── .gitignore               # Ignored files list
├── README.md                # Project landing documentation
├── LICENSE                  # Open source / proprietary license
└── package.json             # Build manifests
\`\`\`

---

## 12.6 README File Best Practices
Every production repository must include a comprehensive \`README.md\` containing:
1. **Project Title & Tagline:** Purpose of the software.
2. **Badges:** CI build status, code coverage, version, license.
3. **Key Features:** Bulleted list of capabilities.
4. **Prerequisites & Installation:** Exact commands to run locally.
5. **Environment Variables:** Documented table of required \`.env\` keys.
6. **Usage Instructions & Screenshots:** Visual walkthrough.
7. **Contributing Guidelines & License.**

---

## 12.7 Repository Security & Secret Protection
**Never commit credentials, private keys, or API tokens.**

### Security Checklist
- Store all secrets in environment variables accessed via \`.env\`.
- Ensure \`.env\` is listed in \`.gitignore\` before the first commit.
- Enable **GitHub Secret Scanning** and **Dependabot** in repository security settings.
- If a secret is accidentally committed, **rotate/revoke the key immediately**—do not simply delete the file in a subsequent commit, as it remains in Git history.

---

## 12.8 GitHub Branch Protection Rules
For all shared repositories, enable branch protection on \`main\`:
- Require a Pull Request before merging.
- Require at least 1–2 approved peer reviews.
- Require automated status checks (tests, linter, build) to pass before merging.
- Require linear commit history (enforcing squash or rebase).
- Restrict who can push directly to protected branches.

---

## 12.9 Common Mistakes Summary

| Mistake | Consequence | Best Practice |
| :--- | :--- | :--- |
| Committing directly to \`main\` | Untested code breaks production | Always use feature branches + PRs |
| Committing \`.env\` or API keys | Security breach & credential theft | Use \`.gitignore\` & environment variables |
| Vague commit messages | Loss of historical context | Use Conventional Commits format |
| Megacommit (1,000+ lines) | High risk of bugs & slow code review | Make small, frequent, atomic commits |
| Ignoring merge conflicts | Broken code syntax in repository | Resolve manually and verify tests pass |

---

## Interview Questions

### 1. What are the key elements of a good commit message?
**Answer:**
A concise subject line in imperative mood with a type prefix (e.g., \`feat:\`, \`fix:\`), followed by an optional body explaining the *why* and *what* of the change, and references to relevant issue tracking IDs.

### 2. What should you do if an API key or password is accidentally committed?
**Answer:**
Immediately rotate/revoke the exposed credential with the third-party provider, remove the secret from Git history (using tools like \`git filter-repo\` or BFG Repo-Cleaner), ensure \`.env\` is in \`.gitignore\`, and push the cleaned history.

### 3. Why are branch protection rules important on GitHub?
**Answer:**
They prevent accidental direct pushes to production branches, enforce mandatory code reviews, ensure automated CI testing passes before merging, and maintain software reliability.

---

## Practical Lab

### Task 1
Create a comprehensive \`.gitignore\` file tailored for a Node.js or Python project.

### Task 2
Write five commit messages adhering to the Conventional Commits specification.

### Task 3
Create a structured project folder layout containing \`src/\`, \`tests/\`, \`docs/\`, and \`README.md\`.

### Task 4
Draft a professional \`README.md\` file including title, description, installation steps, and architecture overview.

### Task 5
Configure branch protection rules for your \`main\` branch on GitHub (requiring PR reviews and status checks).
`;

// Module 13
const mod13 = `# Module 13: Real-World Git Workflows

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
| **Feature Branch Workflow** | \`main\` + \`feature/*\` | Low | Small-to-medium teams, simple projects |
| **GitHub Flow** | \`main\` + short-lived feature branches | Low-Medium | Web apps, SaaS, Continuous Deployment |
| **Git Flow** | \`main\`, \`develop\`, \`feature/*\`, \`release/*\`, \`hotfix/*\` | High | Enterprise software with scheduled versioned releases |
| **Forking Workflow** | Independent forks + Pull Requests | Medium | Open-source projects & external contractor contributions |

---

## 13.3 Workflow 1: Feature Branch Workflow
All development occurs on short-lived feature branches created off \`main\`.

\`\`\`text
main ───────────────────────────────────────────▶ (Deployable)
  │                                        ▲
  └──▶ feature/auth ── C1 ── C2 ── (PR) ───┘
\`\`\`

### Steps
1. Create a feature branch: \`git switch -c feature/user-auth\`
2. Commit changes locally.
3. Push to GitHub and open a Pull Request.
4. Peer review and merge back into \`main\`.
5. Delete the feature branch.

---

## 13.4 Workflow 2: GitHub Flow
GitHub Flow is a lightweight, branch-based workflow designed specifically for teams practicing Continuous Deployment (CD).

\`\`\`text
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
\`\`\`

### Core Principles
- Anything on \`main\` is always 100% production-ready and deployable.
- Branches are short-lived (hours or days, never weeks).
- Continuous automated testing on every commit.

---

## 13.5 Workflow 3: Git Flow (Enterprise Model)
Git Flow is a comprehensive branching model designed for software with formal, scheduled version releases (e.g., enterprise software, desktop applications, mobile apps).

\`\`\`text
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
\`\`\`

### Branch Roles in Git Flow
1. **\`main\`:** Stores official production release history. Only merged into from \`release/*\` or \`hotfix/*\`.
2. **\`develop\`:** Central integration branch for feature aggregation.
3. **\`feature/*\`:** Branched off \`develop\`, merged back into \`develop\`.
4. **\`release/*\`:** Branched off \`develop\` when release features are frozen. Used for bug fixing and documentation before merging into \`main\` and \`develop\`.
5. **\`hotfix/*\`:** Branched directly off \`main\` to fix urgent production bugs, then merged into both \`main\` and \`develop\`.

---

## 13.6 Workflow 4: Forking Workflow
The Forking Workflow is standard for open-source software and contractor contributions where contributors do not have direct write permissions to the central repository.

\`\`\`text
[ Upstream Central Repo ] ◀───────────────────────┐
           │                                      │
           │ (Fork on GitHub)                     │ (Pull Request)
           ▼                                      │
[ Developer's Fork on GitHub ] ───────────────────┤
           │                                      │
           │ (git clone)                          │ (git push)
           ▼                                      │
[ Local Workstation ] ──▶ [ Feature Branch ] ─────┘
\`\`\`

### Open Source Contribution Lifecycle
\`\`\`bash
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
\`\`\`

---

## 13.7 Choosing the Right Workflow

\`\`\`text
Is it an open-source project without write access?
├── YES ──▶ Forking Workflow
└── NO  ──▶ Do you have scheduled releases (mobile apps, enterprise on-prem)?
             ├── YES ──▶ Git Flow
             └── NO  ──▶ Are you deploying continuously to the web?
                          ├── YES ──▶ GitHub Flow
                          └── NO  ──▶ Feature Branch Workflow
\`\`\`

---

## 13.8 Best Practices
- Agree upon and document your team's branching workflow in \`CONTRIBUTING.md\`.
- Keep feature branches short-lived to minimize merge divergence.
- Rebase or merge \`main\` into your working branch regularly.
- Automate testing and status checks on all pull requests.

---

## Interview Questions

### 1. Explain the difference between GitHub Flow and Git Flow.
**Answer:**
GitHub Flow is a simple, continuous deployment workflow with one main branch and short-lived feature branches that deploy directly upon merge. Git Flow is a structured enterprise model with two permanent branches (\`main\` and \`develop\`) plus supporting \`feature\`, \`release\`, and \`hotfix\` branches.

### 2. When is the Forking Workflow preferred over the Feature Branch Workflow?
**Answer:**
The Forking Workflow is ideal for open-source repositories and external contributors because it allows developers to contribute via pull requests without needing direct write access to the central repository.

### 3. What is the role of a \`hotfix\` branch in Git Flow?
**Answer:**
A hotfix branch is created directly from \`main\` to resolve critical production bugs immediately. Once tested, it is merged into both \`main\` (tagged with a patch version) and \`develop\`.

---

## Practical Lab

### Task 1
Create a Feature Branch Workflow simulation: create a feature branch, add commits, and merge into \`main\`.

### Task 2
Simulate GitHub Flow by opening a Pull Request from a feature branch with automated review comments.

### Task 3
Map out the Git Flow branch structure (main, develop, feature, release, hotfix) for a financial software application.

### Task 4
Fork an open-source repository on GitHub, clone it locally, and configure the \`upstream\` remote URL.

### Task 5
Synchronize your local repository with \`upstream\` changes using \`git fetch upstream\` and \`git merge upstream/main\`.
`;

// Module 14
const mod14 = `# Module 14: Git & GitHub Projects

## Learning Objectives
After completing this module, you will be able to:
- Build professional, portfolio-grade GitHub repositories.
- Upload and showcase various project types (Web, Python, Full Stack, DevOps).
- Structure repositories for maximum maintainability and recruiter appeal.
- Write compelling, documentation-rich \`README.md\` files with badges and architecture diagrams.
- Apply open-source contribution patterns to personal projects.
- Create an impressive GitHub profile that highlights your engineering capabilities.

---

## 14.1 Introduction
In modern technical hiring, your GitHub profile serves as a live, verified portfolio of your engineering competence. Recruiters and engineering managers inspect candidate GitHub profiles to evaluate:
- Practical coding ability and architectural design.
- Version control discipline and commit message clarity.
- Collaboration and code review experience.
- Documentation standards and problem-solving skills.
- Consistency, curiosity, and continuous learning.

A well-maintained GitHub profile significantly improves your candidacy for software engineering internships and full-time roles.

---

## 14.2 Types of Impressive GitHub Projects
Diversify your portfolio by showcasing projects across engineering disciplines:

### 1. Web & Full-Stack Applications
- E-Commerce storefront with authentication, cart state, and Stripe payment gateway.
- Real-time collaborative workspace / Kanban board with WebSockets.
- RESTful or GraphQL API backend with PostgreSQL / MongoDB and JWT authentication.

### 2. Python & Data Engineering
- Automated data scraping and ETL pipeline.
- Machine learning prediction model with interactive Streamlit / Gradio dashboard.
- CLI automation tool published to PyPI.

### 3. Cloud & DevOps Infrastructure
- Dockerized microservices deployed on Kubernetes with Helm charts.
- Infrastructure as Code (Terraform) scripts provisioning AWS/GCP cloud resources.
- Complete CI/CD pipeline using GitHub Actions with automated linting, testing, and deployment.

---

## 14.3 Repository Architecture Standards
Every public repository should follow this standard layout:

\`\`\`text
Project-Name/
├── .github/
│   ├── workflows/ci.yml       # Automated CI test pipeline
│   └── ISSUE_TEMPLATE/        # Standardized bug & feature forms
├── src/                       # Production source code
├── tests/                     # Unit and integration test suites
├── docs/                      # Architecture notes & API specs
├── public/ / assets/          # Demo screenshots, diagrams & logos
├── .env.example               # Template of required environment variables
├── .gitignore                 # Excluded files list
├── LICENSE                    # MIT, Apache 2.0, or GPL license
├── CONTRIBUTING.md            # Community contribution guide
└── README.md                  # Comprehensive project documentation
\`\`\`

---

## 14.4 Writing an Exceptional \`README.md\`
Your \`README.md\` is the landing page of your project. Follow this proven structure:

\`\`\`markdown
# 🚀 Project Name

> Concise 1-sentence value proposition of the application.

[![Build Status](https://img.shields.io/github/actions/workflow/status/user/repo/ci.yml)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features
- **Feature 1:** Detailed explanation.
- **Feature 2:** Detailed explanation.

---

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, PostgreSQL
- **DevOps:** Docker, GitHub Actions, AWS

---

## 📸 Screenshots & Demo
![Application Dashboard](./assets/dashboard-demo.png)

---

## ⚡ Quick Start / Local Setup

### Prerequisites
- Node.js >= 18.x
- Docker & PostgreSQL

### Installation
\`\`\`bash
# 1. Clone repository
git clone https://github.com/username/project.git
cd project

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Start development server
npm run dev
\`\`\`

---

## 🧪 Running Tests
\`\`\`bash
npm test
\`\`\`

---

## 📄 License
Distributed under the MIT License. See \`LICENSE\` for more information.
\`\`\`

---

## 14.5 Uploading a Local Project to GitHub Step-by-Step

\`\`\`bash
# 1. Navigate to project root
cd /path/to/my-project

# 2. Initialize Git repository
git init

# 3. Create .gitignore and .env.example
touch .gitignore .env.example

# 4. Stage and commit all files
git add .
git commit -m "feat: Initial commit of production codebase and architecture"

# 5. Link to new GitHub repository
git remote add origin https://github.com/your-username/my-project.git

# 6. Push to main branch
git branch -M main
git push -u origin main
\`\`\`

---

## 14.6 Pre-Publication Repository Checklist
Before making any repository public:
- [x] \`README.md\` contains features, setup commands, and screenshots.
- [x] \`.gitignore\` is configured and verified (no \`node_modules\`, \`__pycache__\`, or build artifacts).
- [x] Zero API keys, passwords, or \`.env\` secrets are committed.
- [x] Open-source \`LICENSE\` file is added.
- [x] Code passes linting and test suites.
- [x] Commit history is clean with descriptive messages.

---

## 14.7 Optimizing Your GitHub Profile
1. **Profile Picture & Bio:** Use a clear, professional photo and concise engineering bio.
2. **Profile README:** Create a repository named after your username (\`username/username\`) to display a customized Markdown bio, tech stack badges, and pinned projects.
3. **Pin Top Repositories:** Showcase your best 4–6 projects with descriptive names and custom cover graphics.
4. **Maintain Consistent Activity:** Strive for regular, high-quality contributions across personal and open-source repositories.

---

## Interview Questions

### 1. What makes a GitHub repository attractive to hiring managers?
**Answer:**
A clear, comprehensive \`README.md\` with setup instructions and screenshots, clean modular code structure, automated CI testing, semantic commit messages, active maintenance, and a working live demo URL.

### 2. Why is an open-source LICENSE file necessary in a repository?
**Answer:**
Without a license, default copyright laws apply, meaning nobody else can legally copy, distribute, or modify your code. Adding a standard open-source license (such as MIT or Apache 2.0) clearly grants permissions to users and employers.

### 3. What is the purpose of \`.env.example\`?
**Answer:**
It acts as a documented blueprint for required configuration keys without exposing actual secret values, enabling collaborators to set up their local environments effortlessly.

---

## Practical Lab

### Task 1
Create a new GitHub repository named \`Portfolio-Projects\`.

### Task 2
Upload one of your existing web, Python, or data projects with full source code.

### Task 3
Add an open-source MIT \`LICENSE\` and a tailored \`.gitignore\` file.

### Task 4
Write a comprehensive \`README.md\` featuring a project overview, feature list, installation commands, and screenshots.

### Task 5
Pin the repository to your GitHub profile and test that all setup instructions work from a clean clone.
`;

// Module 15
const mod15 = `# Module 15: Git & GitHub Interview Preparation & Career Guidance

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
| **Setup & Identity** | \`git init\`, \`git config --global user.name\`, \`git config --global user.email\` |
| **Working Areas** | Working Directory ──(\`git add\`)──▶ Staging Index ──(\`git commit\`)──▶ Local \`.git\` |
| **Inspection & Diff** | \`git status\`, \`git log --oneline --graph\`, \`git diff\`, \`git diff --staged\` |
| **Branching & Merging** | \`git branch\`, \`git switch -c <name>\`, \`git merge <name>\`, Merge Conflict Resolution |
| **Remote Operations** | \`git remote add origin\`, \`git push -u origin main\`, \`git pull\`, \`git fetch\` |
| **Advanced Tools** | \`git stash\`, \`git reset (--soft/--hard)\`, \`git revert\`, \`git cherry-pick\`, \`git rebase\`, \`git tag\` |
| **GitHub Ecosystem** | Pull Requests, Issues, Projects, Discussions, Wiki, Releases, Pages, Actions (CI/CD) |

---

## 15.3 Top 15 Frequently Asked Git Interview Questions

### 1. What is the difference between Git and GitHub?
**Answer:**
Git is a distributed version control tool that manages code history locally on your computer. GitHub is a cloud-based hosting platform that manages remote Git repositories and provides team collaboration, code reviews, and CI/CD pipelines.

### 2. What happens under the hood when you run \`git commit\`?
**Answer:**
Git creates a new Commit Object in \`.git/objects/\` referencing a root Tree object (representing the staged directory snapshot), author details, committer details, timestamp, commit message, and parent commit hash(es). Git then updates the current branch ref and \`HEAD\` to point to the new commit SHA-1.

### 3. What is the difference between \`git fetch\` and \`git pull\`?
**Answer:**
\`git fetch\` downloads new commits and references from the remote repository into local tracking branches without modifying the active working tree. \`git pull\` performs a \`git fetch\` followed immediately by \`git merge\`, integrating changes into the current branch.

### 4. What is the difference between \`git reset\` and \`git revert\`?
**Answer:**
- \`git reset\` moves the branch pointer backward, rewriting history (safe for local unpushed commits).
- \`git revert\` creates a new commit that applies the inverse of a target commit, preserving project history (safe and recommended for public shared branches).

### 5. Explain the difference between \`git merge\` and \`git rebase\`.
**Answer:**
- \`git merge\` preserves full branch history and creates an explicit merge commit linking two histories.
- \`git rebase\` takes the commits from your branch and reapplies them on top of the target base branch, creating a clean, linear commit history.

### 6. What is a merge conflict and how do you resolve it?
**Answer:**
A merge conflict occurs when two branches make incompatible modifications to the same line of a file. It is resolved by manually opening the file, selecting the correct lines, removing conflict markers (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`), staging the file with \`git add\`, and completing the commit with \`git commit\`.

### 7. What is \`git stash\` and when do you use it?
**Answer:**
\`git stash\` temporarily shelves uncommitted changes in the working directory and staging index, restoring the workspace to a clean \`HEAD\` state so you can switch branches or apply an urgent hotfix without making a half-baked commit.

### 8. What is \`git cherry-pick\`?
**Answer:**
\`git cherry-pick\` selectively applies the changes from an individual commit on one branch directly onto another branch without merging the rest of the commits.

### 9. What are the four primary Git object types?
**Answer:**
1. **Blob:** Stores file content.
2. **Tree:** Stores directory structure and filenames.
3. **Commit:** Stores snapshot metadata, author, and parent pointers.
4. **Tag:** Stores an annotated release marker.

### 10. What is a detached HEAD state and how do you recover from it?
**Answer:**
A detached HEAD occurs when you check out a specific commit hash directly rather than a branch name. Commits created in this state do not belong to any branch and can be lost during garbage collection. To preserve work, create a new branch immediately: \`git switch -c new-branch-name\`.

### 11. What is the purpose of \`.gitignore\`?
**Answer:**
\`.gitignore\` prevents untracked files (such as \`node_modules/\`, build outputs, log files, and secret \`.env\` files) from being accidentally staged or committed into the repository.

### 12. What does \`git push -u origin main\` do?
**Answer:**
It pushes the local \`main\` branch to the \`origin\` remote repository and sets \`origin/main\` as the upstream tracking reference, enabling shorthand \`git push\` and \`git pull\` commands in the future.

### 13. What is the difference between \`git clone\` and forking on GitHub?
**Answer:**
\`git clone\` downloads a copy of a repository to your local machine. Forking creates an independent server-side copy of another user's repository under your own GitHub account so you can develop changes and submit Pull Requests without direct write permissions.

### 14. What are GitHub Actions?
**Answer:**
GitHub Actions is a built-in CI/CD platform that automates software workflows—such as running test suites, enforcing code linters, building Docker images, and deploying to cloud infrastructure whenever code events occur.

### 15. How do you amend the most recent commit message?
**Answer:**
\`\`\`bash
git commit --amend -m "New updated commit message"
\`\`\`

---

## 15.4 Real-World Troubleshooting Scenarios

### Scenario 1: Push Rejected (Non-Fast-Forward)
**Problem:** You run \`git push\` and Git rejects the push with \`[rejected - non-fast-forward]\`.
**Cause:** Remote branch has new commits that you haven't integrated yet.
**Solution:**
\`\`\`bash
# Pull latest remote changes and rebase your local commits on top
git pull --rebase origin main

# Resolve any conflicts if they arise, then push
git push origin main
\`\`\`

### Scenario 2: Secret Accidentally Committed Locally (Not Pushed)
**Problem:** You committed a \`.env\` file locally that contains private API keys.
**Solution:**
\`\`\`bash
# Soft reset the last commit to keep edits staged
git reset --soft HEAD~1

# Unstage the secret file
git restore --staged .env

# Add .env to .gitignore
echo ".env" >> .gitignore
git add .gitignore

# Recommit your code cleanly
git commit -m "feat: Add authentication service"
\`\`\`

---

## 15.5 Git Career Growth & Engineering Roadmap

\`\`\`text
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
\`\`\`

---

## 15.6 Practical Lab

### Task 1
Create a public GitHub repository named \`git-github-mastery-capstone\`.

### Task 2
Create and switch to a feature branch, commit project files, and merge it into \`main\` using a Pull Request.

### Task 3
Simulate a merge conflict between two branches and resolve it cleanly.

### Task 4
Create an annotated release tag \`v1.0.0\` and push it to GitHub:
\`\`\`bash
git tag -a v1.0.0 -m "Capstone completion release"
git push origin v1.0.0
\`\`\`

### Task 5
Optimize your GitHub profile by pinning your best repositories, adding a profile \`README.md\`, and verifying all project documentation.
`;

fs.writeFileSync(path.join(outDir, 'mod_11.md'), mod11, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_12.md'), mod12, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_13.md'), mod13, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_14.md'), mod14, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_15.md'), mod15, 'utf8');

console.log('Successfully generated Modules 11 to 15!');
