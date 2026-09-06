# Module 3: Git Repository Fundamentals

## Learning Objectives
After completing this module, you will be able to:
- Understand what a Git repository is and how it functions.
- Learn the internal structure of a Git repository.
- Differentiate between Local and Remote repositories.
- Master the three working areas: Working Directory, Staging Area, and Local Repository.
- Understand the four core Git Objects (Blob, Tree, Commit, Tag).
- Understand the `HEAD` pointer and its role.
- Learn the complete Git file lifecycle (Untracked, Tracked, Modified, Staged, Committed).
- Understand how Git stores and manages project history.

---

## 3.1 Introduction
A Git Repository is the storage engine where Git keeps your project files, commit history, branches, tags, and configuration. When you initialize a repository with:

```bash
git init
```

Git creates a hidden directory called `.git`. This directory contains the complete database required to manage your project's version history.

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
- **Example:** `C:\Projects\OnlineStore` or `/home/user/projects/OnlineStore`

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
A standard Git project layout consists of working files and the `.git` metadata database:

```text
MyProject/
├── .git/               # Git database & metadata
├── src/                # Application source code
├── README.md           # Project documentation
├── package.json        # Dependencies & scripts
└── index.html          # HTML entrypoint
```

### Important Components
- **Project Files:** Your source code, assets, and documentation.
- **`.git` Folder:** The local database storing objects, references, and logs.
- **Configuration Files:** Repository-specific settings (`.git/config`).
- **Commit History:** Permanent cryptographic log of previous snapshots.

---

## 3.5 The `.git` Directory
The `.git` directory is automatically created upon running `git init`. Its internal layout includes:

```text
.git/
├── objects/            # Stores Blobs, Trees, Commits, and Tags
├── refs/               # Stores pointers to branches and tags
├── hooks/              # Client-side and server-side automation scripts
├── config              # Repository-specific configuration file
├── HEAD                # Pointer to current branch / active commit
└── index               # Binary file representing the Staging Area
```

> [!WARNING]
> Never delete or manually edit files inside the `.git` directory unless you fully understand internal Git plumbing commands.

---

## 3.6 Git Three Working Areas
Git manages files across three primary areas:

```text
[ Working Directory ]
         │
         │ (git add)
         ▼
[ Staging Area (Index) ]
         │
         │ (git commit)
         ▼
[ Local Repository (.git) ]
```

1. **Working Directory:** The local filesystem folder where you create, edit, and delete project files. Files here can be *Untracked*, *Unmodified*, or *Modified*.
2. **Staging Area (Index):** A temporary preparation area where selected modifications are organized and formatted into a logical snapshot before committing.
3. **Local Repository:** The `.git` database that permanently records snapshots upon running `git commit`.

---

## 3.7 Git Workflow
The flow of code from inception to remote sharing:

```text
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
```

---

## 3.8 Git Objects
Git stores all data inside the `.git/objects/` directory as immutable, content-addressed **Objects**. There are four fundamental object types:

1. **Blob (Binary Large Object):** Stores the raw contents of a single file without file metadata or permissions.
2. **Tree:** Represents directory structures and folders. A Tree contains a list of filenames, file modes, and pointers to Blobs and child Trees.
3. **Commit Object:** Contains a top-level Tree pointer, author details, committer details, timestamp, commit message, and parent commit hash(es).
4. **Tag Object:** An annotated reference pointing to a specific commit, containing tagger name, date, and release message (e.g., `v1.0.0`).

---

## 3.9 HEAD Pointer
**HEAD** is an internal pointer that references the current branch and the latest commit in your working state.

```text
HEAD ──▶ main ──▶ Commit C3 (Latest Commit)
```

Whenever you make a new commit or switch branches using `git checkout` / `git switch`, the `HEAD` pointer automatically moves to point to the active reference.

---

## 3.10 Git File Lifecycle
Every file in a Git workspace transitions through distinct states:

```text
[ Untracked ] ──(git add)──▶ [ Staged ] ──(git commit)──▶ [ Committed ]
      ▲                           ▲                             │
      │                           │ (git add)                   │
      └──────(Edit File)─────── [ Modified ] ◀──────────────────┘
```

- **Untracked:** The file exists in your folder, but Git is not monitoring it.
- **Tracked:** Git knows about the file from a previous commit or staging.
- **Modified:** A tracked file has been changed in the working directory.
- **Staged:** Changes have been added to the staging area with `git add`.
- **Committed:** Changes are permanently saved into the repository database.

---

## 3.11 Repository Initialization & Storage Architecture

```text
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
```

---

## 3.12 Best Practices
- Keep one Git repository per distinct project.
- Commit frequently with focused, atomic changes.
- Write clear, descriptive commit messages.
- Synchronize with remote repositories regularly.
- Keep project folder structures clean and organized.
- Rely on `.gitignore` to exclude non-source files.

---

## 3.13 Common Mistakes
- ❌ Forgetting to initialize Git with `git init`.
- ❌ Accidentally deleting the `.git` directory and wiping out local history.
- ❌ Confusing the Working Directory with the Staging Area.
- ❌ Forgetting to commit staged changes.
- ❌ Pushing broken or untested code to the remote repository.

---

## Real-Time Scenario
A developer builds an Employee Management System:
1. Creates the project folder: `mkdir EmployeeSystem && cd EmployeeSystem`
2. Initializes the repository: `git init`
3. Develops features and creates application files.
4. Stages selected files: `git add .`
5. Commits snapshot: `git commit -m "Initial schema and employee routes"`
6. Pushes to GitHub: `git push -u origin main`
7. Collaborates with team members via Pull Requests.

---

## Interview Questions

### 1. What is a Git Repository?
**Answer:**
A Git Repository is a storage location containing project files, commit history, branches, tags, and configuration data managed by Git.

### 2. What is the purpose of the `.git` directory?
**Answer:**
The `.git` directory stores repository metadata, object databases (blobs, trees, commits, tags), branch references (`refs`), staging index, and configuration.

### 3. What is the difference between the Working Directory and the Staging Area?
**Answer:**
- **Working Directory:** The actual folder where you actively create and edit files.
- **Staging Area:** An intermediate index where changes are formatted and reviewed before being committed.

### 4. What is HEAD in Git?
**Answer:**
`HEAD` is a pointer that references the current branch and the latest commit in the working tree, telling Git where your active workspace is positioned.

### 5. What are the four primary Git Objects?
**Answer:**
1. **Blob:** Stores file content.
2. **Tree:** Stores directory structures and references to blobs/trees.
3. **Commit:** Stores snapshot metadata, author, date, and parent pointers.
4. **Tag:** Stores an annotated release marker pointing to a commit.

---

## Practical Lab

### Task 1
Initialize a new Git repository using `git init`.

### Task 2
Locate and inspect the hidden `.git` directory and its subfolders (`objects`, `refs`, `HEAD`).

### Task 3
Create three files (`index.html`, `style.css`, `app.js`) and observe their status using:
```bash
git status
```

### Task 4
Draw the Git workflow showing the Working Directory, Staging Area, Local Repository, and Remote Repository.

### Task 5
Explain the purpose of the four Git objects (Blob, Tree, Commit, Tag) with concrete examples.
