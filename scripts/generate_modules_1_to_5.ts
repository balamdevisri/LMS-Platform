import fs from 'fs';
import path from 'path';

const outDir = './scripts/formatted_modules';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Module 2
const mod2 = `# Module 2: Installing Git and Initial Configuration

## Learning Objectives
After completing this module, you will be able to:
- Understand Git installation requirements across operating systems.
- Install Git on Windows, Linux, and macOS.
- Verify Git installation from the terminal.
- Configure Git with your username and email address.
- Understand the three Git configuration levels (System, Global, Local).
- Initialize a brand-new Git repository.
- Create your first tracked Git project.
- Inspect and verify active Git configurations.

---

## 2.1 Introduction
Before using Git, it must be installed on your operating system. Git is available natively for:
- Windows
- Linux
- macOS

After installation, Git requires basic configuration—primarily your username and email address—because Git permanently records this author metadata with every commit you make.

### Real-Time Example
When a software developer joins an engineering team, before writing any code they:
1. Install Git on their workstation.
2. Configure their professional name and work email.
3. Initialize or clone a local repository.
4. Connect it to GitHub.

Only after completing these steps do they start developing features.

---

## 2.2 System Requirements
Git is lightweight and has minimal hardware requirements:

| Component | Minimum Requirement |
| :--- | :--- |
| **Operating System** | Windows 10/11, Ubuntu/Debian/Fedora Linux, macOS 10.15+ |
| **RAM** | 2 GB (4 GB recommended) |
| **Storage** | 500 MB free disk space |
| **Network** | Internet connection required for remote GitHub operations |

---

## 2.3 Installing Git on Windows

1. **Download:** Visit the official Git website at [https://git-scm.com](https://git-scm.com) and download the 64-bit installer for Windows.
2. **Run Installer:** Execute the installer and select the standard setup options (Next → Next → Install → Finish). Default settings (such as Git Bash integration and default branch naming) are recommended for most developers.
3. **Open Terminal:** Launch **Git Bash** or **Command Prompt** to verify the environment.

---

## 2.4 Installing Git on Ubuntu / Debian Linux
Open your terminal and run:

\`\`\`bash
# Update package lists
sudo apt update

# Install Git
sudo apt install git -y
\`\`\`

---

## 2.5 Installing Git on Fedora / RHEL
Open your terminal and run:

\`\`\`bash
sudo dnf install git -y
\`\`\`

---

## 2.6 Installing Git on macOS
The easiest method is using the Homebrew package manager:

\`\`\`bash
brew install git
\`\`\`

Alternatively, run \`git --version\` in Terminal to prompt the Xcode Command Line Tools installer.

---

## 2.7 Verify Git Installation
After installation completes, verify that Git is accessible from your command line:

\`\`\`bash
git --version
\`\`\`

**Example Output:**
\`\`\`text
git version 2.50.1
\`\`\`

This output confirms that Git is installed and available in your system \`PATH\`.

---

## 2.8 Git Configuration
Git records author details with every commit. Set your global identity:

\`\`\`bash
# Configure global username
git config --global user.name "Prasanna"

# Configure global email address
git config --global user.email "prasanna@example.com"
\`\`\`

> [!NOTE]
> Replace \`"Prasanna"\` and \`"prasanna@example.com"\` with your own name and actual GitHub email address.

---

## 2.9 Git Configuration Levels
Git supports three distinct configuration levels, with narrower scopes overriding broader ones:

| Level | Scope | Flag | Description |
| :--- | :--- | :--- | :--- |
| **System** | Entire Computer | \`--system\` | Applies to all operating system users (requires admin/root privileges) |
| **Global** | Current User | \`--global\` | Applies to all repositories created by the current user |
| **Local** | Current Repository | \`--local\` | Applies only to the active repository (overrides Global settings) |

### Examples
\`\`\`bash
# System configuration (machine-wide)
git config --system core.editor "nano"

# Global configuration (current user)
git config --global user.name "Prasanna"

# Local configuration (active repo only)
git config --local user.name "Developer"
\`\`\`

---

## 2.10 View Git Configuration
To inspect active settings:

\`\`\`bash
# List all configuration settings
git config --list

# Display currently configured username
git config user.name

# Display currently configured email
git config user.email
\`\`\`

---

## 2.11 Initialize a Git Repository
To convert any directory into a Git repository:

\`\`\`bash
# Create a new project directory
mkdir MyProject

# Navigate into the project folder
cd MyProject

# Initialize Git
git init
\`\`\`

**Output:**
\`\`\`text
Initialized empty Git repository in /Users/username/MyProject/.git/
\`\`\`

Git creates a hidden \`.git\` directory inside your project folder to track history, snapshots, and configuration.

---

## 2.12 First Git Project
Create a sample file and inspect repository status:

\`\`\`bash
# Create a README file
touch README.md

# Check repository status
git status
\`\`\`

**Output:**
\`\`\`text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md

nothing added to commit but untracked files present (use "git add" to track)
\`\`\`

Git recognizes that \`README.md\` exists in the working directory as an untracked file ready to be staged.

---

## 2.13 Repository Initialization Workflow

\`\`\`text
[ Install Git ]
       │
       ▼
[ Configure User (user.name & user.email) ]
       │
       ▼
[ Create Project Directory (mkdir) ]
       │
       ▼
[ Run git init ]
       │
       ▼
[ Git Repository Ready (.git created) ]
\`\`\`

---

## 2.14 Common Git Setup Commands Summary

| Command | Purpose |
| :--- | :--- |
| \`git --version\` | Verify Git installation and view installed version |
| \`git config --global user.name "Name"\` | Set global commit author name |
| \`git config --global user.email "email"\` | Set global commit author email |
| \`git config --list\` | Display all active Git configuration variables |
| \`mkdir <folder>\` | Create a new directory |
| \`cd <folder>\` | Change directory / navigate into folder |
| \`git init\` | Initialize a new local Git repository |
| \`git status\` | Inspect working directory and staging area status |

---

## 2.15 Best Practices
- Install the latest stable release of Git.
- Configure your primary GitHub email to ensure commits link to your profile.
- Verify installation and configuration before creating projects.
- Keep one Git repository per distinct project.
- Never manually edit or alter files inside the \`.git\` directory.

---

## 2.16 Common Mistakes
- ❌ Forgetting to configure \`user.name\` and \`user.email\` before making commits.
- ❌ Running \`git init\` in a root or home directory (e.g., \`C:\\Users\\username\` or \`/home/user\`).
- ❌ Accidentally deleting the \`.git\` folder.
- ❌ Using mismatched email addresses across machines causing unverified GitHub commits.

---

## Real-Time Scenario
A newly hired developer sets up their workstation on day one:

\`\`\`bash
# 1. Verify Git installation
git --version

# 2. Configure developer identity
git config --global user.name "John Doe"
git config --global user.email "john.doe@company.com"

# 3. Create project workspace
mkdir EmployeePortal
cd EmployeePortal

# 4. Initialize repository
git init
\`\`\`

The repository is now fully initialized and ready for version control.

---

## Interview Questions

### 1. Why is Git configuration required?
**Answer:**
Git uses the configured \`user.name\` and \`user.email\` to stamp every commit with author metadata. This provides clear traceability and enables team collaboration.

### 2. What is the purpose of \`git init\`?
**Answer:**
The \`git init\` command creates a new Git repository by initializing a hidden \`.git\` directory containing metadata, object databases, and branch references.

### 3. What is stored inside the \`.git\` directory?
**Answer:**
The \`.git\` directory stores commit objects, tree objects, blobs, branch pointers (\`refs\`), the \`HEAD\` file, configuration, and the staging index.

### 4. What is the difference between Global and Local Git configuration?
**Answer:**
- **Global configuration (\`--global\`):** Applies to all repositories for the current operating system user.
- **Local configuration (\`--local\`):** Applies strictly to the current repository, overriding global values when specified.

### 5. How do you verify that Git is installed correctly?
**Answer:**
Run \`git --version\` in your terminal. If installed, it outputs the version number (e.g., \`git version 2.50.1\`).

---

## Practical Lab

### Task 1
Install Git on your operating system (Windows, Linux, or macOS).

### Task 2
Verify the installation from your terminal using:
\`\`\`bash
git --version
\`\`\`

### Task 3
Configure your global Git username and email:
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
\`\`\`

### Task 4
Create a folder named \`GitPractice\` and initialize it as a Git repository:
\`\`\`bash
mkdir GitPractice
cd GitPractice
git init
\`\`\`

### Task 5
Display your active configuration settings to verify author identity:
\`\`\`bash
git config --list
\`\`\`
`;

// Module 3
const mod3 = `# Module 3: Git Repository Fundamentals

## Learning Objectives
After completing this module, you will be able to:
- Understand what a Git repository is and how it functions.
- Learn the internal structure of a Git repository.
- Differentiate between Local and Remote repositories.
- Master the three working areas: Working Directory, Staging Area, and Local Repository.
- Understand the four core Git Objects (Blob, Tree, Commit, Tag).
- Understand the \`HEAD\` pointer and its role.
- Learn the complete Git file lifecycle (Untracked, Tracked, Modified, Staged, Committed).
- Understand how Git stores and manages project history.

---

## 3.1 Introduction
A Git Repository is the storage engine where Git keeps your project files, commit history, branches, tags, and configuration. When you initialize a repository with:

\`\`\`bash
git init
\`\`\`

Git creates a hidden directory called \`.git\`. This directory contains the complete database required to manage your project's version history.

### Definition
A **Git Repository** is a database that stores all versions of a project, including files, commits, branches, tags, and metadata.

### Real-Time Example
A software team develops an **Online Shopping Application** containing:
- Login Module
- Product Catalog Module
- Payment Gateway Module
- Admin Dashboard

Git tracks every modification made across these modules, enabling developers to review past implementations, branch out experimental features, and safely revert changes when needed.

---

## 3.2 Types of Git Repositories
Git workflows utilize two primary types of repositories:

### 1. Local Repository
Stored on the developer's personal computer or workstation.
- **Characteristics:** Works completely offline; stores complete commit history; executes commands with instant local disk performance.
- **Example:** \`C:\\Projects\\OnlineStore\` or \`/home/user/projects/OnlineStore\`

### 2. Remote Repository
Hosted on cloud platforms such as GitHub, GitLab, or Bitbucket.
- **Characteristics:** Shared among team members; serves as the central collaboration and deployment hub; requires internet connectivity for syncing.

---

## 3.3 Local vs Remote Repository

| Feature | Local Repository | Remote Repository |
| :--- | :--- | :--- |
| **Location** | Stored on local machine | Stored in the cloud (GitHub/GitLab) |
| **Connectivity** | 100% offline access | Requires internet connection |
| **Usage** | Private development & staging | Team collaboration & CI/CD deployment |
| **Speed** | Instantaneous disk I/O | Network-dependent |
| **Access** | Individual developer | Shared team members & automated bots |

---

## 3.4 Git Repository Structure
A standard Git project layout consists of working files and the \`.git\` metadata database:

\`\`\`text
MyProject/
├── .git/               # Git database & metadata
├── src/                # Application source code
├── README.md           # Project documentation
├── package.json        # Dependencies & scripts
└── index.html          # HTML entrypoint
\`\`\`

### Important Components
- **Project Files:** Your source code, assets, and documentation.
- **\`.git\` Folder:** The local database storing objects, references, and logs.
- **Configuration Files:** Repository-specific settings (\`.git/config\`).
- **Commit History:** Permanent cryptographic log of previous snapshots.

---

## 3.5 The \`.git\` Directory
The \`.git\` directory is automatically created upon running \`git init\`. Its internal layout includes:

\`\`\`text
.git/
├── objects/            # Stores Blobs, Trees, Commits, and Tags
├── refs/               # Stores pointers to branches and tags
├── hooks/              # Client-side and server-side automation scripts
├── config              # Repository-specific configuration file
├── HEAD                # Pointer to current branch / active commit
└── index               # Binary file representing the Staging Area
\`\`\`

> [!WARNING]
> Never delete or manually edit files inside the \`.git\` directory unless you fully understand internal Git plumbing commands.

---

## 3.6 Git Three Working Areas
Git manages files across three primary areas:

\`\`\`text
[ Working Directory ]
         │
         │ (git add)
         ▼
[ Staging Area (Index) ]
         │
         │ (git commit)
         ▼
[ Local Repository (.git) ]
\`\`\`

1. **Working Directory:** The local filesystem folder where you create, edit, and delete project files. Files here can be *Untracked*, *Unmodified*, or *Modified*.
2. **Staging Area (Index):** A temporary preparation area where selected modifications are organized and formatted into a logical snapshot before committing.
3. **Local Repository:** The \`.git\` database that permanently records snapshots upon running \`git commit\`.

---

## 3.7 Git Workflow
The flow of code from inception to remote sharing:

\`\`\`text
[ Create / Edit Files ]
         │
         ▼
[ Working Directory ]
         │
         │ git add
         ▼
[ Staging Area ]
         │
         │ git commit
         ▼
[ Local Repository ]
         │
         │ git push
         ▼
[ Remote Repository (GitHub) ]
\`\`\`

---

## 3.8 Git Objects
Git stores all data inside the \`.git/objects/\` directory as immutable, content-addressed **Objects**. There are four fundamental object types:

1. **Blob (Binary Large Object):** Stores the raw contents of a single file without file metadata or permissions.
2. **Tree:** Represents directory structures and folders. A Tree contains a list of filenames, file modes, and pointers to Blobs and child Trees.
3. **Commit Object:** Contains a top-level Tree pointer, author details, committer details, timestamp, commit message, and parent commit hash(es).
4. **Tag Object:** An annotated reference pointing to a specific commit, containing tagger name, date, and release message (e.g., \`v1.0.0\`).

---

## 3.9 HEAD Pointer
**HEAD** is an internal pointer that references the current branch and the latest commit in your working state.

\`\`\`text
HEAD ──▶ main ──▶ Commit C3 (Latest Commit)
\`\`\`

Whenever you make a new commit or switch branches using \`git checkout\` / \`git switch\`, the \`HEAD\` pointer automatically moves to point to the active reference.

---

## 3.10 Git File Lifecycle
Every file in a Git workspace transitions through distinct states:

\`\`\`text
[ Untracked ] ──(git add)──▶ [ Staged ] ──(git commit)──▶ [ Committed ]
      ▲                           ▲                             │
      │                           │ (git add)                   │
      └──────(Edit File)─────── [ Modified ] ◀──────────────────┘
\`\`\`

- **Untracked:** The file exists in your folder, but Git is not monitoring it.
- **Tracked:** Git knows about the file from a previous commit or staging.
- **Modified:** A tracked file has been changed in the working directory.
- **Staged:** Changes have been added to the staging area with \`git add\`.
- **Committed:** Changes are permanently saved into the repository database.

---

## 3.11 Repository Initialization & Storage Architecture

\`\`\`text
Developer Workstation
        │
        ▼
Working Directory (Local Edits)
        │
        ▼
Staging Area (Prepared Index)
        │
        ▼
Local Repository (.git Storage)
        │
        ▼
GitHub (Cloud Collaboration)
\`\`\`

---

## 3.12 Best Practices
- Keep one Git repository per distinct project.
- Commit frequently with focused, atomic changes.
- Write clear, descriptive commit messages.
- Synchronize with remote repositories regularly.
- Keep project folder structures clean and organized.
- Rely on \`.gitignore\` to exclude non-source files.

---

## 3.13 Common Mistakes
- ❌ Forgetting to initialize Git with \`git init\`.
- ❌ Accidentally deleting the \`.git\` directory and wiping out local history.
- ❌ Confusing the Working Directory with the Staging Area.
- ❌ Forgetting to commit staged changes.
- ❌ Pushing broken or untested code to the remote repository.

---

## Real-Time Scenario
A developer builds an Employee Management System:
1. Creates the project folder: \`mkdir EmployeeSystem && cd EmployeeSystem\`
2. Initializes the repository: \`git init\`
3. Develops features and creates application files.
4. Stages selected files: \`git add .\`
5. Commits snapshot: \`git commit -m "Initial schema and employee routes"\`
6. Pushes to GitHub: \`git push -u origin main\`
7. Collaborates with team members via Pull Requests.

---

## Interview Questions

### 1. What is a Git Repository?
**Answer:**
A Git Repository is a storage location containing project files, commit history, branches, tags, and configuration data managed by Git.

### 2. What is the purpose of the \`.git\` directory?
**Answer:**
The \`.git\` directory stores repository metadata, object databases (blobs, trees, commits, tags), branch references (\`refs\`), staging index, and configuration.

### 3. What is the difference between the Working Directory and the Staging Area?
**Answer:**
- **Working Directory:** The actual folder where you actively create and edit files.
- **Staging Area:** An intermediate index where changes are formatted and reviewed before being committed.

### 4. What is HEAD in Git?
**Answer:**
\`HEAD\` is a pointer that references the current branch and the latest commit in the working tree, telling Git where your active workspace is positioned.

### 5. What are the four primary Git Objects?
**Answer:**
1. **Blob:** Stores file content.
2. **Tree:** Stores directory structures and references to blobs/trees.
3. **Commit:** Stores snapshot metadata, author, date, and parent pointers.
4. **Tag:** Stores an annotated release marker pointing to a commit.

---

## Practical Lab

### Task 1
Initialize a new Git repository using \`git init\`.

### Task 2
Locate and inspect the hidden \`.git\` directory and its subfolders (\`objects\`, \`refs\`, \`HEAD\`).

### Task 3
Create three files (\`index.html\`, \`style.css\`, \`app.js\`) and observe their status using:
\`\`\`bash
git status
\`\`\`

### Task 4
Draw the Git workflow showing the Working Directory, Staging Area, Local Repository, and Remote Repository.

### Task 5
Explain the purpose of the four Git objects (Blob, Tree, Commit, Tag) with concrete examples.
`;

// Module 4
const mod4 = `# Module 4: Basic Git Commands

## Learning Objectives
After completing this module, you will be able to:
- Understand the core commands required for daily Git workflows.
- Check repository status using \`git status\`.
- Stage individual, multiple, and all modified files using \`git add\`.
- Save snapshots permanently using \`git commit\`.
- Inspect commit logs using \`git log\` and formatting flags.
- Compare file changes across working, staged, and committed states using \`git diff\`.
- Discard unwanted modifications with \`git restore\`.
- Remove and unstage files using \`git rm\`.
- Access built-in documentation using \`git help\`.

---

## 4.1 Introduction
Git commands allow developers to record, inspect, and navigate project history. Every software project follows a continuous cycle where files are created, modified, staged, committed, and shared.

### Primary Commands
- \`git status\` — Check repository state
- \`git add\` — Stage file modifications
- \`git commit\` — Record snapshots permanently
- \`git log\` — View commit history
- \`git diff\` — Inspect code differences
- \`git restore\` — Discard uncommitted changes
- \`git rm\` — Remove tracked files
- \`git help\` — Display command documentation

---

## 4.2 Git Status (\`git status\`)
The \`git status\` command inspects the working tree and staging area.

### Syntax
\`\`\`bash
git status
\`\`\`

### Example Output
\`\`\`text
On branch main
No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md

nothing added to commit but untracked files present (use "git add" to track)
\`\`\`

### Purpose
- Displays active branch name.
- Lists untracked files.
- Lists modified files not yet staged.
- Lists staged changes ready for commit.

---

## 4.3 Git Add (\`git add\`)
The \`git add\` command moves changes from the Working Directory to the Staging Area.

### Syntax & Examples
\`\`\`bash
# Stage a single file
git add index.html

# Stage multiple specific files
git add file1.txt file2.txt

# Stage all modified and new files in the repository
git add .

# Stage all files in current directory and subdirectories
git add -A
\`\`\`

---

## 4.4 Git Commit (\`git commit\`)
A commit permanently records staged changes into the local repository database.

### Syntax
\`\`\`bash
git commit -m "Descriptive commit message"
\`\`\`

### Example Output
\`\`\`text
[main (root-commit) abc1234] Added login page
 1 file changed, 25 insertions(+)
 create mode 100644 index.html
\`\`\`

### Good Commit Message Guidelines
- \`"Added user login authentication page"\`
- \`"Fixed navigation bar responsiveness on mobile"\`
- \`"Updated README with API setup instructions"\`
- \`"Refactored payment gateway error handling"\`

---

## 4.5 Git Log (\`git log\`)
Displays the historical sequence of commits in reverse chronological order.

### Syntax & Flags
\`\`\`bash
# Standard detailed log
git log

# One-line summary per commit (hash + message)
git log --oneline

# Graphical ASCII branch visualization
git log --graph --oneline --all

# Limit log output to the last N commits
git log -n 5
\`\`\`

### Example Output
\`\`\`text
commit 91fd56a7b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8 (HEAD -> main)
Author: Prasanna <prasanna@example.com>
Date:   Sat Jul 25 14:32:10 2026 +0530

    Added Login Feature
\`\`\`

---

## 4.6 Git Diff (\`git diff\`)
Compares modifications between different states of your repository.

### Syntax & Options
\`\`\`bash
# Compare unstaged working directory changes against Staging Area
git diff

# Compare staged changes against the last commit
git diff --staged

# Compare changes between two specific commits
git diff commit1_hash commit2_hash
\`\`\`

Git highlights additions with \`+\` (green) and deletions with \`-\` (red).

---

## 4.7 Git Restore (\`git restore\`)
Discards uncommitted modifications in the working tree.

\`\`\`bash
# Discard changes in a specific file (restore to last commit)
git restore index.html

# Unstage a staged file (move back from Staging to Working Directory)
git restore --staged index.html
\`\`\`

---

## 4.8 Git Remove (\`git rm\`)
Deletes files from the working directory and stages the deletion in one step.

\`\`\`bash
# Remove file from disk and stage deletion
git rm oldfile.txt

# Commit the deletion
git commit -m "Removed unused configuration file"

# Remove file from Git tracking only (keep file on local disk)
git rm --cached sensitive_data.txt
\`\`\`

---

## 4.9 Git Help (\`git help\`)
Access built-in manual pages and documentation:

\`\`\`bash
# General help overview
git help

# Detailed manual page for a specific command
git help commit
# or
git commit --help
\`\`\`

---

## 4.10 Git Command Workflow & Lifecycle

\`\`\`text
[ Create / Edit File ]
         │
         ▼
[ git status (Verify state) ]
         │
         ▼
[ git add (Stage changes) ]
         │
         ▼
[ git commit -m "..." (Record snapshot) ]
         │
         ▼
[ git log --oneline (Review history) ]
\`\`\`

---

## 4.11 Common Git Commands Summary

| Command | Purpose |
| :--- | :--- |
| \`git status\` | Check status of working directory and staging area |
| \`git add <file>\` | Stage specific file for commit |
| \`git add .\` | Stage all modified and new files |
| \`git commit -m "msg"\` | Permanently save staged snapshot with descriptive message |
| \`git log\` | Display full commit history |
| \`git log --oneline\` | Display compact, single-line commit history |
| \`git diff\` | Show unstaged file modifications |
| \`git diff --staged\` | Show changes prepared in staging area |
| \`git restore <file>\` | Discard modifications and restore to last commit |
| \`git rm <file>\` | Delete file and stage deletion |
| \`git help <command>\` | Open documentation for command |

---

## 4.12 Best Practices
- Always check \`git status\` before and after staging.
- Review changes with \`git diff\` before committing.
- Make small, logical, self-contained commits.
- Write informative commit messages explaining *why* changes occurred.
- Never commit broken code or untracked temporary files.

---

## 4.13 Common Mistakes
- ❌ Running \`git commit\` without staging files first with \`git add\`.
- ❌ Using generic messages like \`"fix"\` or \`"changes"\`.
- ❌ Committing large bundles of unrelated changes in a single commit.
- ❌ Accidentally staging sensitive files or build outputs.

---

## Real-Time Scenario
A developer updates the marketing landing page:

\`\`\`bash
# 1. Check modified files
git status

# 2. Inspect exact code changes
git diff

# 3. Stage all modified assets
git add .

# 4. Commit with clear description
git commit -m "Updated homepage banner and promotional copy"

# 5. Verify commit history
git log --oneline -n 3
\`\`\`

---

## Interview Questions

### 1. What is the purpose of \`git status\`?
**Answer:**
\`git status\` displays the current state of the working directory and staging area, highlighting untracked, modified, and staged files alongside the active branch name.

### 2. What is the difference between \`git add\` and \`git commit\`?
**Answer:**
- \`git add\` stages modifications into the index (Staging Area).
- \`git commit\` creates a permanent, immutable snapshot of all staged files in the local Git database.

### 3. Why are descriptive commit messages essential?
**Answer:**
Descriptive messages create a clear historical audit trail, simplify code reviews, ease debugging via \`git bisect\`, and allow teammates to understand the intent behind changes.

### 4. What is the difference between \`git diff\` and \`git diff --staged\`?
**Answer:**
- \`git diff\` shows differences between the working tree and the staging area (unstaged edits).
- \`git diff --staged\` shows differences between the staging area and the last commit (staged edits).

### 5. What is the benefit of \`git log --oneline\`?
**Answer:**
It condenses commit history into a single line per commit containing the shortened 7-character SHA-1 hash and commit message, making long histories quick to scan.

---

## Practical Lab

### Task 1
Create a file named \`README.md\` with initial project notes.

### Task 2
Check the repository status using:
\`\`\`bash
git status
\`\`\`

### Task 3
Stage the file using:
\`\`\`bash
git add README.md
\`\`\`

### Task 4
Commit the changes with the message:
\`\`\`bash
git commit -m "Initial project setup"
\`\`\`

### Task 5
View the commit history using:
\`\`\`bash
git log --oneline
\`\`\`
`;

// Module 5
const mod5 = `# Module 5: Branching and Merging

## Learning Objectives
After completing this module, you will be able to:
- Understand Git branches and why they are fundamental to modern development.
- List, create, switch, rename, and delete branches.
- Merge feature branches into the \`main\` branch.
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

If all developers worked directly on the \`main\` branch, untested code would overwrite stable features and cause deployment instability. Git solves this using **Branches**.

### Definition
A **Branch** is an independent, lightweight line of development that allows developers to work on features, bug fixes, or experiments in complete isolation without affecting the main codebase.

### Real-Time Example
In a banking software application:
- Team 1 develops \`feature/login\`
- Team 2 develops \`feature/funds-transfer\`
- Team 3 develops \`bugfix/statement-export\`

Each team develops and tests on their dedicated branch. Once verified, the branch is merged into \`main\`.

---

## 5.2 What is a Branch?
In Git, a branch is simply a lightweight, movable pointer to a specific commit.

\`\`\`text
main ────────▶ Commit C1 ──▶ Commit C2 ──▶ Commit C3 (HEAD)
                                              │
feature/login ────────────────────────────────┘ (Starts here)
\`\`\`

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

\`\`\`bash
git branch
\`\`\`

**Example Output:**
\`\`\`text
* main
  feature/login
  feature/payment
\`\`\`

The asterisk (\`*\`) and green highlight indicate your active branch.

---

## 5.5 Create and Switch Branches

\`\`\`bash
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
\`\`\`

---

## 5.6 Rename and Delete Branches

\`\`\`bash
# Rename the current branch
git branch -m feature/auth

# Delete a branch that has already been merged (safe delete)
git branch -d feature/login

# Force delete an unmerged branch (use with caution!)
git branch -D feature/experimental
\`\`\`

---

## 5.7 What is Merging?
Merging integrates changes from one branch into another (typically merging a feature branch into \`main\`).

### Merge Procedure
\`\`\`bash
# 1. Switch to the target destination branch
git switch main

# 2. Merge the feature branch into main
git merge feature/login
\`\`\`

---

## 5.8 Types of Merges

### 1. Fast-Forward Merge
Occurs when the destination branch has not diverged with new commits. Git simply moves the target branch pointer forward.

\`\`\`text
Before Merge:
main:          C1 ── C2
                      \
feature/login:         C3 ── C4

After Fast-Forward Merge:
main:          C1 ── C2 ── C3 ── C4 (HEAD)
\`\`\`

### 2. Three-Way Merge (Recursive / Ort)
Occurs when both branches have diverged with independent commits. Git combines changes and creates a new **Merge Commit** with two parent commits.

\`\`\`text
Before Merge:
main:          C1 ── C2 ── C5
                      \
feature/login:         C3 ── C4

After Three-Way Merge:
main:          C1 ── C2 ── C5 ──── C6 (Merge Commit)
                      \          /
feature/login:         C3 ── C4 ─┘
\`\`\`

---

## 5.9 Merge Conflicts
A merge conflict occurs when two branches modify the **same line** of the **same file** in different ways. Git halts the merge and inserts conflict markers:

\`\`\`text
<<<<<<< HEAD
Welcome, Valued Customer!
=======
Welcome, Premium Member!
>>>>>>> feature/login
\`\`\`

### Resolving Merge Conflicts Step-by-Step
1. **Identify conflicted files:** Run \`git status\` to see unmerged paths.
2. **Open file:** Review the \`<<<<<<<\`, \`=======\`, and \`>>>>>>>\` markers.
3. **Edit content:** Choose the desired version or combine both, then delete all conflict markers.
4. **Save file.**
5. **Stage resolution:** \`git add <filename>\`
6. **Complete merge:** \`git commit\` (or \`git commit -m "Resolved merge conflict"\`)

---

## 5.10 Branch Naming Conventions
Professional engineering teams follow structured naming prefixes:

- \`feature/feature-name\` — New user features (e.g., \`feature/stripe-checkout\`)
- \`bugfix/bug-description\` — Non-critical bug fixes (e.g., \`bugfix/navbar-overlap\`)
- \`hotfix/critical-issue\` — Urgent production fixes (e.g., \`hotfix/security-patch\`)
- \`release/vX.Y.Z\` — Release preparation branches (e.g., \`release/v1.2.0\`)

> [!TIP]
> Avoid unstructured branch names like \`test\`, \`mybranch\`, \`abc\`, or \`temp\`.

---

## 5.11 Common Branch Commands Summary

| Command | Purpose |
| :--- | :--- |
| \`git branch\` | List local branches |
| \`git branch <name>\` | Create new branch |
| \`git switch <name>\` | Switch to specified branch |
| \`git switch -c <name>\` | Create and switch to new branch in one step |
| \`git checkout -b <name>\` | Create and switch (classic syntax) |
| \`git merge <branch>\` | Merge specified branch into active branch |
| \`git branch -d <branch>\` | Safely delete merged branch |
| \`git branch -D <branch>\` | Force delete branch |
| \`git branch -m <new-name>\` | Rename active branch |

---

## 5.12 Best Practices
- Create a dedicated branch for every distinct feature or bugfix.
- Keep branch scopes small and focused.
- Pull and merge \`main\` into your feature branch frequently to minimize conflicts.
- Delete merged branches to keep the repository tidy.
- Test thoroughly before merging into production branches.

---

## 5.13 Common Mistakes
- ❌ Developing directly on the \`main\` branch.
- ❌ Maintaining long-lived feature branches that drift far away from \`main\`.
- ❌ Force-deleting (\`-D\`) branches without verifying whether commits are needed.
- ❌ Committing unresolved conflict markers into the codebase.

---

## Real-Time Scenario: E-Commerce Feature Workflow
A team implements a shopping cart feature:

\`\`\`bash
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
\`\`\`

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
Using modern Git: \`git switch -c <branch-name>\`
Using classic Git: \`git checkout -b <branch-name>\`

---

## Practical Lab

### Task 1
Create a new branch named \`feature/profile\`.

### Task 2
Switch to the new branch:
\`\`\`bash
git switch feature/profile
\`\`\`

### Task 3
Create a file \`profile.html\`, stage it, and commit it:
\`\`\`bash
git add profile.html
git commit -m "Added user profile template"
\`\`\`

### Task 4
Switch back to \`main\` and merge the \`feature/profile\` branch:
\`\`\`bash
git switch main
git merge feature/profile
\`\`\`

### Task 5
Delete the merged \`feature/profile\` branch and verify with \`git branch\`:
\`\`\`bash
git branch -d feature/profile
git branch
\`\`\`
`;

fs.writeFileSync(path.join(outDir, 'mod_2.md'), mod2, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_3.md'), mod3, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_4.md'), mod4, 'utf8');
fs.writeFileSync(path.join(outDir, 'mod_5.md'), mod5, 'utf8');

console.log('Successfully generated Modules 1 to 5!');
