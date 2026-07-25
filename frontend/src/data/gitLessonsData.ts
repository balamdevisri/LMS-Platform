export interface GitLesson {
  id: string;
  title: string;
  time: string;
  badge: string;
  content: string;
  commands?: Array<{ command: string; description: string }>;
  resources?: Array<{ title: string; url: string }>;
}

export const gitLessonsData: Record<string, GitLesson> = {
  // Module 1
  'git-les-101': {
    id: 'git-les-101',
    title: '1.1 Introduction to Version Control',
    time: '15 mins',
    badge: 'Version Control Basics',
    content: `### Introduction to Version Control Systems (VCS)
A Version Control System is software that tracks changes to files over time. It records snapshots of your files, allowing you to recall specific versions later, compare differences, and collaborate with other developers without overwriting each other's work.

#### Core Benefits of VCS:
1. **Change History:** Pinpoint when and why code changed.
2. **Reversibility:** Roll back to stable versions if a bug is introduced.
3. **Branching:** Work on separate features concurrently in isolation.
4. **Collaboration:** Merge contributions from multiple developers systematically.`,
    resources: [{ title: 'Git SCM Pro Book Chapter 1', url: 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control' }]
  },
  'git-les-102': {
    id: 'git-les-102',
    title: '1.2 Centralized vs Distributed Version Control',
    time: '15 mins',
    badge: 'System Architectures',
    content: `### Centralized vs Distributed VCS
Version Control Systems generally fall into two architectural categories:

#### 1. Centralized Version Control (CVCS)
Uses a single central server that stores all versioned files. Developers check out files from this single place.
- **Examples:** Subversion (SVN), Perforce.
- **Drawback:** Single point of failure. If the server goes down, collaboration halts and local history is unavailable.

#### 2. Distributed Version Control (DVCS)
Every client does not just check out the latest snapshot of the files; they fully mirror the repository, including its entire history.
- **Examples:** Git, Mercurial.
- **Benefit:** If any server dies, any client repository can be copied back to the server to restore it. Operations are incredibly fast because they happen locally.`
  },
  'git-les-103': {
    id: 'git-les-103',
    title: '1.3 Why Git',
    time: '10 mins',
    badge: 'Core Tools',
    content: `### Why Choose Git?
Git is a distributed version control system designed by Linus Torvalds in 2005 to manage the Linux kernel development. It has become the de facto industry standard due to several design goals:

- **Speed:** Almost all operations are performed locally on your hard drive, making Git extremely fast.
- **Simple Design:** Git is built around content snapshots, not file differences.
- **Strong Support for Non-linear Development:** Creating, merging, and switching branches is cheap and fast.
- **Data Integrity:** Everything in Git is checksummed using SHA-1 hashing before it is stored, making it impossible to lose or alter data without Git knowing.`
  },
  'git-les-104': {
    id: 'git-les-104',
    title: '1.4 Why GitHub',
    time: '10 mins',
    badge: 'Collaboration',
    content: `### Why Use GitHub?
While Git is a command line tool that manages version history on your local machine, GitHub is a cloud platform that hosts Git repositories online.

#### Key Features of GitHub:
- **Remote Backups:** Safe cloud hosting for your codebase.
- **Pull Requests (PR):** Propose changes, discuss code, run CI/CD, and conduct reviews.
- **Project Management:** Track issues, boards, releases, and milestones.
- **Automation:** GitHub Actions for continuous integration and delivery.`
  },
  'git-les-105': {
    id: 'git-les-105',
    title: '1.5 Installing Git',
    time: '20 mins',
    badge: 'Lab Installation',
    content: `### Installing Git
Before you start tracking projects, verify if Git is installed or set it up on your local operating system:

- **Debian/Ubuntu:** \`sudo apt update && sudo apt install git\`
- **macOS:** Install via Homebrew \`brew install git\`
- **Windows:** Download the installer from [git-scm.com](https://git-scm.com)

Once installed, run the verification command in your terminal:`,
    commands: [{ command: 'git --version', description: 'Confirm Git version installed' }]
  },
  'git-les-106': {
    id: 'git-les-106',
    title: '1.6 Git Configuration',
    time: '15 mins',
    badge: 'Lab Setup',
    content: `### Git Configuration
Git uses a set of configuration files to determine how it behaves. First, you should configure your identity (name and email), which will be embedded inside every commit you make:`,
    commands: [
      { command: 'git config --global user.name "John Doe"', description: 'Set your global commit author name' },
      { command: 'git config --global user.email "john@example.com"', description: 'Set your global commit author email' },
      { command: 'git config --list', description: 'View all configured Git settings' }
    ]
  },
  'git-les-107': {
    id: 'git-les-107',
    title: '1.7 SSH Keys',
    time: '20 mins',
    badge: 'Lab Security',
    content: `### Configuring SSH Keys
SSH keys establish a secure connection between your local computer and GitHub. They allow you to pull and push changes without entering your username/password every time.

#### Generating an SSH Key:
Run the ssh-keygen utility to create a public/private keypair. Then start the ssh-agent and add your key:`,
    commands: [
      { command: 'ssh-keygen -t ed25519 -C "john@example.com"', description: 'Generate ed25519 SSH keypair' },
      { command: 'eval "$(ssh-agent -s)"', description: 'Ensure the local SSH agent daemon is active' }
    ]
  },
  'git-les-108': {
    id: 'git-les-108',
    title: '1.8 Personal Access Tokens',
    time: '15 mins',
    badge: 'Access Control',
    content: `### GitHub Personal Access Tokens (PAT)
For HTTPS-based authentication, GitHub requires Personal Access Tokens instead of passwords.

#### Fine-grained PATs vs Classic PATs:
- **Fine-grained PATs:** Restrict access to specific repositories with detailed read/write permissions. Recommended.
- **Classic PATs:** Grant broad scope access. Should be avoided for general use.
- Set an expiration date for tokens to maintain a secure environment.`
  },
  'git-les-109': {
    id: 'git-les-109',
    title: '1.9 git init',
    time: '10 mins',
    badge: 'Lab Initialization',
    content: `### Initializing repositories (git init)
To start version-tracking a folder, navigate into it and run the init command. This creates a hidden \`.git\` folder where Git stores all configuration files, object databases, and commit histories. Do not modify the \`.git\` directory manually.`,
    commands: [{ command: 'git init', description: 'Initialize a new local Git repository' }]
  },
  'git-les-110': {
    id: 'git-les-110',
    title: '1.10 Git Lifecycle',
    time: '20 mins',
    badge: 'File Stages',
    content: `### The Git File Lifecycle
Files in a Git repository transition through four primary states:

1. **Untracked:** New files that Git does not track yet.
2. **Unmodified:** Tracked files that match the last commit.
3. **Modified:** Files with changes that have not yet been staged.
4. **Staged:** Files marked to be included in the next commit snapshot (the Index).`
  },
  'git-les-111': {
    id: 'git-les-111',
    title: '1.11 git status',
    time: '10 mins',
    badge: 'Lab Status',
    content: `### Checking Repository Status (git status)
The \`git status\` command displays the active state of your working directory and staging area. It shows which files are modified, which are staged, and which are untracked.`,
    commands: [{ command: 'git status', description: 'Review state of files in working tree' }]
  },
  'git-les-112': {
    id: 'git-les-112',
    title: '1.12 git add',
    time: '10 mins',
    badge: 'Lab Staging',
    content: `### Staging Changes (git add)
Before saving a snapshot, you must add files to the Staging Area. This tells Git *what* modifications to include in the next commit.`,
    commands: [
      { command: 'git add index.html', description: 'Stage a specific file' },
      { command: 'git add .', description: 'Stage all modified/untracked files in the current folder' }
    ]
  },
  'git-les-113': {
    id: 'git-les-113',
    title: '1.13 git commit',
    time: '15 mins',
    badge: 'Lab Commit',
    content: `### Creating Commits (git commit)
A commit represents a permanent, encrypted snapshot of staged changes saved to local history. Every commit has a unique SHA-1 identifier and includes metadata: author, date, and a descriptive message.`,
    commands: [{ command: 'git commit -m "feat: design responsive dashboard"', description: 'Save staged snapshot with message' }]
  },
  'git-les-114': {
    id: 'git-les-114',
    title: '1.14 git log',
    time: '10 mins',
    badge: 'Lab Logging',
    content: `### Inspecting Commit Logs (git log)
To inspect the commit history of your active branch, run the log command. It displays commits in reverse chronological order.`,
    commands: [
      { command: 'git log', description: 'Show complete commit history logs' },
      { command: 'git log --oneline', description: 'Show compact single-line commit lists' }
    ]
  },
  'git-les-115': {
    id: 'git-les-115',
    title: '1.15 git diff',
    time: '15 mins',
    badge: 'Lab Diffing',
    content: `### Comparing Differences (git diff)
The diff utility compares line-by-line file modifications. By default, it shows changes made to the working directory that have not been staged yet.`,
    commands: [
      { command: 'git diff', description: 'Show unstaged changes in working tree' },
      { command: 'git diff --staged', description: 'Show staged changes ready for commit' }
    ]
  },

  // Module 2
  'git-les-201': {
    id: 'git-les-201',
    title: '2.1 Create Repository',
    time: '10 mins',
    badge: 'GitHub Core',
    content: `### Creating a GitHub Repository
To share code online:
1. Log in to GitHub.
2. Click **New** under the Repositories tab.
3. Select owner, name, and public/private access.
4. Leave initialize with README/License unchecked if pushing an existing local repository.`
  },
  'git-les-202': {
    id: 'git-les-202',
    title: '2.2 Remote Repository',
    time: '10 mins',
    badge: 'Remote Synch',
    content: `### Working with Remotes
A remote repository is a version hosted on a network (like GitHub). Managing remotes allows team members to push their work upstream and pull down the latest collaborative updates.`
  },
  'git-les-203': {
    id: 'git-les-203',
    title: '2.3 git remote add origin',
    time: '10 mins',
    badge: 'Lab Remotes',
    content: `### Linking Remote Repositories
Link your local repository to a remote server. The standard default nickname for your main remote repository is \`origin\`.`,
    commands: [
      { command: 'git remote add origin https://github.com/student/git-github-mastery.git', description: 'Link remote repository URL' },
      { command: 'git remote -v', description: 'Verify remote URLs configured' }
    ]
  },
  'git-les-204': {
    id: 'git-les-204',
    title: '2.4 git push',
    time: '15 mins',
    badge: 'Lab Pushing',
    content: `### Pushing Commits (git push)
Uploads your local commit history to your remote repository branch on GitHub.`,
    commands: [{ command: 'git push -u origin main', description: 'Push main branch and set upstream tracking' }]
  },
  'git-les-205': {
    id: 'git-les-205',
    title: '2.5 git pull',
    time: '15 mins',
    badge: 'Lab Pulling',
    content: `### Fetching and Merging (git pull)
Downloads history modifications from remote and immediately merges them into your active local branch.`,
    commands: [{ command: 'git pull origin main', description: 'Pull changes from remote main branch' }]
  },
  'git-les-206': {
    id: 'git-les-206',
    title: '2.6 git fetch',
    time: '10 mins',
    badge: 'Lab Fetching',
    content: `### Fetching Remote Updates (git fetch)
Downloads remote commits, branches, and tags from origin to local database, without modifying or merging them into your working files.`,
    commands: [{ command: 'git fetch origin', description: 'Sync remote changes into tracking databases' }]
  },
  'git-les-207': {
    id: 'git-les-207',
    title: '2.7 git clone',
    time: '15 mins',
    badge: 'Lab Cloning',
    content: `### Cloning Repositories (git clone)
Downloads a complete copy of an existing GitHub repository onto your computer, automatically setting up upstream tracking references.`,
    commands: [{ command: 'git clone https://github.com/student/git-github-mastery.git', description: 'Clone a repository locally' }]
  },
  'git-les-208': {
    id: 'git-les-208',
    title: '2.8 Git Branches',
    time: '15 mins',
    badge: 'Branching Basics',
    content: `### Git Branching
Branches are lightweight pointers to commits. They allow you to branch off the stable development line (usually \`main\`) to isolate new features or bug fixes.`
  },
  'git-les-209': {
    id: 'git-les-209',
    title: '2.9 git switch',
    time: '10 mins',
    badge: 'Lab Switching',
    content: `### Modern Branch Navigation
Use \`git switch\` to move between branches or create new ones quickly.`,
    commands: [
      { command: 'git switch main', description: 'Switch to main branch' },
      { command: 'git switch -c feature/auth', description: 'Create and switch to new branch' }
    ]
  },
  'git-les-210': {
    id: 'git-les-210',
    title: '2.10 git checkout',
    time: '10 mins',
    badge: 'Lab Checkout',
    content: `### Legacy Branch Navigation
The legacy checkout command navigates branches and restores files.`,
    commands: [
      { command: 'git checkout main', description: 'Switch to main' },
      { command: 'git checkout -b feature/auth', description: 'Create and switch to new branch' }
    ]
  },
  'git-les-211': {
    id: 'git-les-211',
    title: '2.11 git merge',
    time: '15 mins',
    badge: 'Lab Merging',
    content: `### Merging Branches (git merge)
Combines the history of a source branch into your current active branch.`,
    commands: [{ command: 'git merge feature/auth', description: 'Merge feature/auth into active branch' }]
  },
  'git-les-212': {
    id: 'git-les-212',
    title: '2.12 Pull Requests',
    time: '15 mins',
    badge: 'PR Workflows',
    content: `### GitHub Pull Requests
Pull Requests are features that let you notify team members about changes you've pushed to a branch on GitHub. It allows developers to discuss, test, and review proposed code before merging.`
  },
  'git-les-213': {
    id: 'git-les-213',
    title: '2.13 Code Reviews',
    time: '15 mins',
    badge: 'Collaborative PR',
    content: `### Performing Code Reviews
Developers can leave feedback on lines of code, approve reviews, or request changes. It ensures codebase quality.`
  },
  'git-les-214': {
    id: 'git-les-214',
    title: '2.14 Reviewers',
    time: '10 mins',
    badge: 'PR Roles',
    content: `### Assigning Reviewers
Assign team members to review PRs. CODEOWNERS files can automate reviewer suggestions based on file extensions.`
  },
  'git-les-215': {
    id: 'git-les-215',
    title: '2.15 Labels',
    time: '10 mins',
    badge: 'PR Tags',
    content: `### GitHub Issue & PR Labels
Labels are tags used to organize issues and PRs (e.g. \`bug\`, \`wip\`, \`ready-for-review\`, \`duplicate\`).`
  },
  'git-les-216': {
    id: 'git-les-216',
    title: '2.16 Milestones',
    time: '10 mins',
    badge: 'Release Targets',
    content: `### Milestones
Group Issues and Pull Requests to track progress toward a specific version, release, or sprint deadline.`
  },

  // Module 3
  'git-les-301': {
    id: 'git-les-301',
    title: '3.1 Merge Conflicts',
    time: '20 mins',
    badge: 'Advanced Conflicts',
    content: `### What is a Merge Conflict?
A conflict occurs when Git cannot automatically resolve differences in code. This happens when two branches modify the same line of a file in different ways, or when one developer deletes a file that another developer is editing.`
  },
  'git-les-302': {
    id: 'git-les-302',
    title: '3.2 Conflict Resolution',
    time: '20 mins',
    badge: 'Lab Resolution',
    content: `### Resolving Conflicts
Open the conflicted files, look for conflict markers (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`), select the correct code lines, remove the markers, stage, and commit:`,
    commands: [
      { command: 'git add conflict-file.txt', description: 'Stage resolved files' },
      { command: 'git commit -m "chore: resolve conflicts"', description: 'Commit the resolved merge' }
    ]
  },
  'git-les-303': {
    id: 'git-les-303',
    title: '3.3 git restore',
    time: '10 mins',
    badge: 'Lab Restoring',
    content: `### Restoring Files (git restore)
Discard uncommitted modifications in your working files, resetting them to match the index or HEAD state.`,
    commands: [{ command: 'git restore index.html', description: 'Discard modifications in index.html' }]
  },
  'git-les-304': {
    id: 'git-les-304',
    title: '3.4 git reset',
    time: '15 mins',
    badge: 'Lab Resetting',
    content: `### Resetting Commit History (git reset)
Moves HEAD back to a previous commit.
- \`--soft\`: Leaves modifications staged.
- \`--mixed\` (default): Leaves modifications unstaged.
- \`--hard\`: Deletes modifications completely.`,
    commands: [
      { command: 'git reset --mixed HEAD~1', description: 'Undo last commit, leave changes unstaged' },
      { command: 'git reset --hard HEAD~1', description: 'Undo last commit, delete modifications' }
    ]
  },
  'git-les-305': {
    id: 'git-les-305',
    title: '3.5 git revert',
    time: '15 mins',
    badge: 'Lab Reverting',
    content: `### Reverting Commits (git revert)
Unlike reset, \`git revert\` creates a brand-new commit that applies the exact inverse changes of a past commit, keeping history records intact.`,
    commands: [{ command: 'git revert HEAD', description: 'Revert last commit changes' }]
  },
  'git-les-306': {
    id: 'git-les-306',
    title: '3.6 git stash',
    time: '15 mins',
    badge: 'Lab Stashing',
    content: `### Stashing Uncommitted Changes (git stash)
Shelves modified files temporarily so you can switch branches, and restores them later.`,
    commands: [
      { command: 'git stash', description: 'Stash active changes' },
      { command: 'git stash pop', description: 'Restore stashed changes and delete from stash list' }
    ]
  },
  'git-les-307': {
    id: 'git-les-307',
    title: '3.7 Git Rebase',
    time: '15 mins',
    badge: 'Lab Rebasing',
    content: `### Rebasing Branches (git rebase)
Re-applies commits from one branch on top of another base branch, creating a clean linear project history.`,
    commands: [{ command: 'git rebase main', description: 'Rebase active branch onto main' }]
  },
  'git-les-308': {
    id: 'git-les-308',
    title: '3.8 Interactive Rebase',
    time: '20 mins',
    badge: 'Lab Interactive',
    content: `### Interactive Rebasing (git rebase -i)
Allows rewriting, reordering, squashing, or deleting past commits.`,
    commands: [{ command: 'git rebase -i HEAD~3', description: 'Interactively rebase last 3 commits' }]
  },
  'git-les-309': {
    id: 'git-les-309',
    title: '3.9 Squashing Commits',
    time: '15 mins',
    badge: 'Squashing',
    content: `### Squashing Commits
Combines multiple small commits into a single commit to keep git history logs clean before merging to main.`
  },
  'git-les-310': {
    id: 'git-les-310',
    title: '3.10 Cherry Pick',
    time: '15 mins',
    badge: 'Lab Cherry Pick',
    content: `### Cherry-Picking Commits (git cherry-pick)
Copies a single commit from another branch and applies it directly to your active branch.`,
    commands: [{ command: 'git cherry-pick 7ca8c2f', description: 'Apply changes from commit 7ca8c2f' }]
  },

  // Module 4
  'git-les-401': {
    id: 'git-les-401',
    title: '4.1 README.md',
    time: '10 mins',
    badge: 'Documentation',
    content: `### README.md
A markdown file at the root of a project. It serves as the entry documentation, containing instructions on installation, configurations, API schemas, and deployment workflows.`
  },
  'git-les-402': {
    id: 'git-les-402',
    title: '4.2 Markdown',
    time: '15 mins',
    badge: 'Formatting',
    content: `### Markdown Syntax
Markdown is a lightweight markup language with plain-text-formatting syntax. It is used on GitHub for PR comments, readmes, and issues.
- \`#\` Header 1, \`##\` Header 2
- \`**bold**\`, \`*italic*\`
- \`[Link](url)\`
- \` - \` List item`
  },
  'git-les-403': {
    id: 'git-les-403',
    title: '4.3 LICENSE',
    time: '10 mins',
    badge: 'IP Management',
    content: `### Software Licenses
Licensing defines how others can use, copy, modify, and redistribute your code. Common open-source licenses:
- **MIT:** Extremely permissive, standard license.
- **Apache 2.0:** Permissive, includes patent grants.
- **GPL v3:** Copyleft. Modifications must also be open-source.`
  },
  'git-les-404': {
    id: 'git-les-404',
    title: '4.4 .gitignore',
    time: '10 mins',
    badge: 'Tracking Rules',
    content: `### .gitignore Configuration
A text file where each line contains a glob pattern specifying files or directories that Git should ignore (e.g. \`node_modules/\`, \`.env\`, \`dist/\`, \`build/\`, \`.DS_Store\`).`
  },
  'git-les-405': {
    id: 'git-les-405',
    title: '4.5 GitHub Issues',
    time: '15 mins',
    badge: 'Task Management',
    content: `### GitHub Issues
Issues are items used to track bugs, features, tasks, and project discussions. They support assignees, labels, and integration with PRs.`
  },
  'git-les-406': {
    id: 'git-les-406',
    title: '4.6 Project Boards',
    time: '15 mins',
    badge: 'Agile Kanban',
    content: `### GitHub Project Boards
Kanban boards integrated with Issues and PRs to track project milestones in columns like To Do, In Progress, and Done.`
  },
  'git-les-407': {
    id: 'git-les-407',
    title: '4.7 GitHub Pages',
    time: '20 mins',
    badge: 'Static Hosting',
    content: `### GitHub Pages
A static web hosting service that takes HTML, CSS, and JavaScript files directly from a repository on GitHub and publishes a website.`
  },

  // Module 5
  'git-les-501': {
    id: 'git-les-501',
    title: '5.1 CI/CD',
    time: '15 mins',
    badge: 'DevOps Intro',
    content: `### CI/CD Foundations
- **Continuous Integration (CI):** Automates code integration, compilation, and automated test execution when developers commit code.
- **Continuous Deployment (CD):** Automatically deploys updates to production hosting when builds and tests pass.`
  },
  'git-les-502': {
    id: 'git-les-502',
    title: '5.2 GitHub Actions',
    time: '15 mins',
    badge: 'Automation',
    content: `### GitHub Actions
A built-in orchestration engine that automates workflows directly in your repository. It runs jobs triggered by events like push, pull_request, or manual dispatch.`
  },
  'git-les-503': {
    id: 'git-les-503',
    title: '5.3 Workflow Files',
    time: '15 mins',
    badge: 'CI Configs',
    content: `### Workflow Files
GitHub Actions workflows are defined in YAML files located inside the \`.github/workflows/\` directory at the root of your project repository.`
  },
  'git-les-504': {
    id: 'git-les-504',
    title: '5.4 YAML',
    time: '15 mins',
    badge: 'YAML Format',
    content: `### YAML Syntax
YAML is a human-readable data serialization standard. It uses indentation to define structure and is heavily used in DevOps configurations:
\`\`\`yaml
name: CI Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
\`\`\``
  },
  'git-les-505': {
    id: 'git-les-505',
    title: '5.5 Jobs',
    time: '10 mins',
    badge: 'Workflow Jobs',
    content: `### GitHub Actions Jobs
A job is a set of steps in a workflow that executes on the same runner. Jobs run in parallel by default, but you can configure dependencies using the \`needs\` key.`
  },
  'git-les-506': {
    id: 'git-les-506',
    title: '5.6 Steps',
    time: '10 mins',
    badge: 'Workflow Steps',
    content: `### Steps
Steps are individual tasks that run commands or actions in a job. They execute sequentially on the runner.`
  },
  'git-les-507': {
    id: 'git-les-507',
    title: '5.7 Runners',
    time: '10 mins',
    badge: 'Runners',
    content: `### GitHub Runners
Runners are virtual machines hosted by GitHub (Ubuntu, Windows, macOS) or self-hosted servers that execute the steps in your jobs.`
  },
  'git-les-508': {
    id: 'git-les-508',
    title: '5.8 Automated Testing',
    time: '15 mins',
    badge: 'CI Testing',
    content: `### Automated Testing in CI
Integrate testing suites (e.g. Jest, Pytest) into workflows so tests run automatically on every pull request, preventing bug regressions.`
  },
  'git-les-509': {
    id: 'git-les-509',
    title: '5.9 GitHub Secrets',
    time: '15 mins',
    badge: 'Security Store',
    content: `### Encrypted Secrets
Securely store API keys, SSH keys, or deployment tokens in GitHub settings. Access them in workflow YAMLs using the format: \`\${{ secrets.MY_API_KEY }}\`.`
  },
  'git-les-510': {
    id: 'git-les-510',
    title: '5.10 Deploy to Vercel',
    time: '20 mins',
    badge: 'Vercel CD',
    content: `### Deploying to Vercel
Vercel integrates with GitHub to auto-deploy frontend frameworks (Next.js, React) on push. Alternatively, use Vercel CLI actions inside workflows.`
  },
  'git-les-511': {
    id: 'git-les-511',
    title: '5.11 Deploy to Netlify',
    time: '20 mins',
    badge: 'Netlify CD',
    content: `### Deploying to Netlify
Netlify pulls your build directories directly from GitHub on push events, hosting static assets with CDN routing.`
  },
  'git-les-512': {
    id: 'git-les-512',
    title: '5.12 Deploy to AWS',
    time: '20 mins',
    badge: 'AWS CD',
    content: `### Deploying to AWS
Use AWS credentials (stored in Secrets) to build, bundle, and push applications to S3 buckets, ECS, or Lambda functions.`
  },

  // Module 6
  'git-les-601': {
    id: 'git-les-601',
    title: '6.1 GitHub Codespaces',
    time: '15 mins',
    badge: 'Cloud Workspace',
    content: `### GitHub Codespaces
A cloud-hosted, containerized VS Code development environment. It spins up in seconds directly from a repository in your browser, running all dependencies preloaded.`
  },
  'git-les-602': {
    id: 'git-les-602',
    title: '6.2 Dev Containers',
    time: '15 mins',
    badge: 'Dev Containers',
    content: `### Configuring Dev Containers
Define containerized local development workspaces in a \`.devcontainer/devcontainer.json\` file. It sets up node/python versions, OS libraries, and editor extensions.`
  },
  'git-les-603': {
    id: 'git-les-603',
    title: '6.3 GitHub Copilot',
    time: '15 mins',
    badge: 'AI Assistant',
    content: `### AI-Powered Pair Programming
GitHub Copilot suggestions help developers code faster. It integrates into your IDE to auto-complete lines, write functions, and write test suites.`
  },
  'git-les-604': {
    id: 'git-les-604',
    title: '6.4 Prompt Engineering',
    time: '15 mins',
    badge: 'AI Prompting',
    content: `### Guiding AI Copilots
Learn to write comments and clear function definitions to prompt AI code models effectively, improving suggestion accuracy.`
  },
  'git-les-605': {
    id: 'git-les-605',
    title: '6.5 Dependabot',
    time: '15 mins',
    badge: 'Dependabot',
    content: `### Automated Dependency Audits
Dependabot scans package configurations (npm, pip) for vulnerabilities and automatically opens Pull Requests to update packages.`
  },
  'git-les-606': {
    id: 'git-les-606',
    title: '6.6 Secret Scanning',
    time: '15 mins',
    badge: 'Security Scans',
    content: `### Secret Scanning on GitHub
GitHub scans commits for exposed API keys, certificates, and passwords, blocking pushes or emailing alerts to prevent credentials leaks.`
  },
  'git-les-607': {
    id: 'git-les-607',
    title: '6.7 Branch Protection Rules',
    time: '20 mins',
    badge: 'Production Security',
    content: `### Branch Protection Rules
Secure production branches (like \`main\`) by enforcing PR review approval counts, requiring CI tests to pass, and blocking force pushes (\`git push -f\`).`
  }
};
