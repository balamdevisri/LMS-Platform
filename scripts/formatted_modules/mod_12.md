# Module 12: Git Best Practices

## Learning Objectives
After completing this module, you will be able to:
- Follow enterprise-grade Git workflows and development standards.
- Write clear, standardized, and meaningful commit messages.
- Apply professional branch naming conventions.
- Configure and optimize `.gitignore` for clean repositories.
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
```text
<type>(<optional scope>): <short summary in imperative mood>

[optional detailed body explaining why and what changed]

[optional issue reference, e.g., Closes #123]
```

### Standard Commit Types
- `feat:` A new feature for the user
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Formatting, missing semicolons (no code logic change)
- `refactor:` Refactoring production code without changing behavior
- `test:` Adding or updating tests
- `chore:` Updating dependencies, build scripts, or configuration

### Examples
```text
Good Commit Messages:
feat(auth): Add Google OAuth2 login button
fix(cart): Prevent negative item quantities during checkout
docs(readme): Add local Docker setup instructions
refactor(api): Extract user validation into reusable middleware

Bad Commit Messages:
update, fix, changes, wip, test, asdf, bugfix
```

---

## 12.3 Branch Naming Conventions
Structured branch prefixes allow automated CI tools and teammates to immediately recognize the branch purpose:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feature/` | New user-facing capability | `feature/user-profiles` |
| `bugfix/` | Standard non-urgent bug fix | `bugfix/dropdown-z-index` |
| `hotfix/` | Critical production outage fix | `hotfix/auth-token-expiry` |
| `release/` | Release candidate preparation | `release/v2.1.0` |
| `chore/` | Tooling or dependency updates | `chore/upgrade-tailwind` |

---

## 12.4 Configuring `.gitignore`
The `.gitignore` file ensures that temporary, machine-specific, or sensitive files are never tracked by Git.

### Recommended Multi-Language `.gitignore` Template
```gitignore
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
```

---

## 12.5 Professional Repository Structure
A well-architected repository provides clear separation of concerns:

```text
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
```

---

## 12.6 README File Best Practices
Every production repository must include a comprehensive `README.md` containing:
1. **Project Title & Tagline:** Purpose of the software.
2. **Badges:** CI build status, code coverage, version, license.
3. **Key Features:** Bulleted list of capabilities.
4. **Prerequisites & Installation:** Exact commands to run locally.
5. **Environment Variables:** Documented table of required `.env` keys.
6. **Usage Instructions & Screenshots:** Visual walkthrough.
7. **Contributing Guidelines & License.**

---

## 12.7 Repository Security & Secret Protection
**Never commit credentials, private keys, or API tokens.**

### Security Checklist
- Store all secrets in environment variables accessed via `.env`.
- Ensure `.env` is listed in `.gitignore` before the first commit.
- Enable **GitHub Secret Scanning** and **Dependabot** in repository security settings.
- If a secret is accidentally committed, **rotate/revoke the key immediately**—do not simply delete the file in a subsequent commit, as it remains in Git history.

---

## 12.8 GitHub Branch Protection Rules
For all shared repositories, enable branch protection on `main`:
- Require a Pull Request before merging.
- Require at least 1–2 approved peer reviews.
- Require automated status checks (tests, linter, build) to pass before merging.
- Require linear commit history (enforcing squash or rebase).
- Restrict who can push directly to protected branches.

---

## 12.9 Common Mistakes Summary

| Mistake | Consequence | Best Practice |
| :--- | :--- | :--- |
| Committing directly to `main` | Untested code breaks production | Always use feature branches + PRs |
| Committing `.env` or API keys | Security breach & credential theft | Use `.gitignore` & environment variables |
| Vague commit messages | Loss of historical context | Use Conventional Commits format |
| Megacommit (1,000+ lines) | High risk of bugs & slow code review | Make small, frequent, atomic commits |
| Ignoring merge conflicts | Broken code syntax in repository | Resolve manually and verify tests pass |

---

## Interview Questions

### 1. What are the key elements of a good commit message?
**Answer:**
A concise subject line in imperative mood with a type prefix (e.g., `feat:`, `fix:`), followed by an optional body explaining the *why* and *what* of the change, and references to relevant issue tracking IDs.

### 2. What should you do if an API key or password is accidentally committed?
**Answer:**
Immediately rotate/revoke the exposed credential with the third-party provider, remove the secret from Git history (using tools like `git filter-repo` or BFG Repo-Cleaner), ensure `.env` is in `.gitignore`, and push the cleaned history.

### 3. Why are branch protection rules important on GitHub?
**Answer:**
They prevent accidental direct pushes to production branches, enforce mandatory code reviews, ensure automated CI testing passes before merging, and maintain software reliability.

---

## Practical Lab

### Task 1
Create a comprehensive `.gitignore` file tailored for a Node.js or Python project.

### Task 2
Write five commit messages adhering to the Conventional Commits specification.

### Task 3
Create a structured project folder layout containing `src/`, `tests/`, `docs/`, and `README.md`.

### Task 4
Draft a professional `README.md` file including title, description, installation steps, and architecture overview.

### Task 5
Configure branch protection rules for your `main` branch on GitHub (requiring PR reviews and status checks).
