# Module 11: GitHub Features

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
- **Labels:** Color-coded tags (e.g., `bug`, `enhancement`, `documentation`, `good first issue`).
- **Assignees:** Team members responsible for resolving the issue.
- **Milestones:** Target release deadlines (e.g., `Sprint 24`, `v2.0.0`).
- **Issue Templates:** Standardized Markdown forms for bug reports and feature requests.

---

## 11.3 GitHub Projects
GitHub Projects offers customizable Kanban boards and spreadsheet tables to organize and prioritize work.

```text
[ To Do ] ──▶ [ In Progress ] ──▶ [ In Review ] ──▶ [ Done ]
```

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
- **Git Tag:** The specific commit tag (e.g., `v1.0.0`).
- **Release Title:** Marketing/engineering name (e.g., `v1.0.0 — Production General Availability`).
- **Changelog:** Detailed list of new features, bug fixes, and breaking changes.
- **Binary Assets:** Compiled binaries, installers, APKs, or `.tar.gz` packages.

---

## 11.7 GitHub Pages
GitHub Pages turns your repository into a hosted static website directly from GitHub servers.

### Supported Technologies
- Plain HTML, CSS, and client-side JavaScript.
- Static Site Generators like Jekyll, Hugo, Astro, or Vite builds.

### Use Cases
- Personal developer portfolios (`https://username.github.io`).
- Project documentation portals (`https://username.github.io/project-name`).
- Product landing pages and interactive demo sites.

---

## 11.8 GitHub Actions (CI/CD)
GitHub Actions is a built-in workflow automation platform that enables Continuous Integration and Continuous Deployment (CI/CD).

```text
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
```

Workflows are declared as YAML files in the `.github/workflows/` directory.

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
- Keep repository documentation updated in the Wiki or `/docs` folder.

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
GitHub Pages automatically serves static web files (HTML, CSS, JS) directly from a designated branch (like `gh-pages` or `main/docs`) to a public URL.

### 4. What information should be included in a GitHub Release?
**Answer:**
A semantic version tag, release title, structured changelog (features, bug fixes, breaking changes), and compiled binary attachments or distribution packages.

---

## Practical Lab

### Task 1
Create a GitHub repository and enable the Issues and Discussions tabs in settings.

### Task 2
Create three organized Issues with labels:
1. `Login Component Bug` (Label: `bug`)
2. `Stripe Payment Integration` (Label: `enhancement`)
3. `API Documentation` (Label: `documentation`)

### Task 3
Create a GitHub Project board with columns: `To Do`, `In Progress`, `In Review`, and `Done`.

### Task 4
Create a Wiki page titled `Installation Guide` with environment setup instructions.

### Task 5
Draft a GitHub Release tagged `v1.0.0` with structured release notes.
