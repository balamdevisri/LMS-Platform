# Module 2: Installing Git and Initial Configuration

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

```bash
# Update package lists
sudo apt update

# Install Git
sudo apt install git -y
```

---

## 2.5 Installing Git on Fedora / RHEL
Open your terminal and run:

```bash
sudo dnf install git -y
```

---

## 2.6 Installing Git on macOS
The easiest method is using the Homebrew package manager:

```bash
brew install git
```

Alternatively, run `git --version` in Terminal to prompt the Xcode Command Line Tools installer.

---

## 2.7 Verify Git Installation
After installation completes, verify that Git is accessible from your command line:

```bash
git --version
```

**Example Output:**
```text
git version 2.50.1
```

This output confirms that Git is installed and available in your system `PATH`.

---

## 2.8 Git Configuration
Git records author details with every commit. Set your global identity:

```bash
# Configure global username
git config --global user.name "Prasanna"

# Configure global email address
git config --global user.email "prasanna@example.com"
```

> [!NOTE]
> Replace `"Prasanna"` and `"prasanna@example.com"` with your own name and actual GitHub email address.

---

## 2.9 Git Configuration Levels
Git supports three distinct configuration levels, with narrower scopes overriding broader ones:

| Level | Scope | Flag | Description |
| :--- | :--- | :--- | :--- |
| **System** | Entire Computer | `--system` | Applies to all operating system users (requires admin/root privileges) |
| **Global** | Current User | `--global` | Applies to all repositories created by the current user |
| **Local** | Current Repository | `--local` | Applies only to the active repository (overrides Global settings) |

### Examples
```bash
# System configuration (machine-wide)
git config --system core.editor "nano"

# Global configuration (current user)
git config --global user.name "Prasanna"

# Local configuration (active repo only)
git config --local user.name "Developer"
```

---

## 2.10 View Git Configuration
To inspect active settings:

```bash
# List all configuration settings
git config --list

# Display currently configured username
git config user.name

# Display currently configured email
git config user.email
```

---

## 2.11 Initialize a Git Repository
To convert any directory into a Git repository:

```bash
# Create a new project directory
mkdir MyProject

# Navigate into the project folder
cd MyProject

# Initialize Git
git init
```

**Output:**
```text
Initialized empty Git repository in /Users/username/MyProject/.git/
```

Git creates a hidden `.git` directory inside your project folder to track history, snapshots, and configuration.

---

## 2.12 First Git Project
Create a sample file and inspect repository status:

```bash
# Create a README file
touch README.md

# Check repository status
git status
```

**Output:**
```text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	README.md

nothing added to commit but untracked files present (use "git add" to track)
```

Git recognizes that `README.md` exists in the working directory as an untracked file ready to be staged.

---

## 2.13 Repository Initialization Workflow

```text
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
```

---

## 2.14 Common Git Setup Commands Summary

| Command | Purpose |
| :--- | :--- |
| `git --version` | Verify Git installation and view installed version |
| `git config --global user.name "Name"` | Set global commit author name |
| `git config --global user.email "email"` | Set global commit author email |
| `git config --list` | Display all active Git configuration variables |
| `mkdir <folder>` | Create a new directory |
| `cd <folder>` | Change directory / navigate into folder |
| `git init` | Initialize a new local Git repository |
| `git status` | Inspect working directory and staging area status |

---

## 2.15 Best Practices
- Install the latest stable release of Git.
- Configure your primary GitHub email to ensure commits link to your profile.
- Verify installation and configuration before creating projects.
- Keep one Git repository per distinct project.
- Never manually edit or alter files inside the `.git` directory.

---

## 2.16 Common Mistakes
- ❌ Forgetting to configure `user.name` and `user.email` before making commits.
- ❌ Running `git init` in a root or home directory (e.g., `C:\Users\username` or `/home/user`).
- ❌ Accidentally deleting the `.git` folder.
- ❌ Using mismatched email addresses across machines causing unverified GitHub commits.

---

## Real-Time Scenario
A newly hired developer sets up their workstation on day one:

```bash
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
```

The repository is now fully initialized and ready for version control.

---

## Interview Questions

### 1. Why is Git configuration required?
**Answer:**
Git uses the configured `user.name` and `user.email` to stamp every commit with author metadata. This provides clear traceability and enables team collaboration.

### 2. What is the purpose of `git init`?
**Answer:**
The `git init` command creates a new Git repository by initializing a hidden `.git` directory containing metadata, object databases, and branch references.

### 3. What is stored inside the `.git` directory?
**Answer:**
The `.git` directory stores commit objects, tree objects, blobs, branch pointers (`refs`), the `HEAD` file, configuration, and the staging index.

### 4. What is the difference between Global and Local Git configuration?
**Answer:**
- **Global configuration (`--global`):** Applies to all repositories for the current operating system user.
- **Local configuration (`--local`):** Applies strictly to the current repository, overriding global values when specified.

### 5. How do you verify that Git is installed correctly?
**Answer:**
Run `git --version` in your terminal. If installed, it outputs the version number (e.g., `git version 2.50.1`).

---

## Practical Lab

### Task 1
Install Git on your operating system (Windows, Linux, or macOS).

### Task 2
Verify the installation from your terminal using:
```bash
git --version
```

### Task 3
Configure your global Git username and email:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Task 4
Create a folder named `GitPractice` and initialize it as a Git repository:
```bash
mkdir GitPractice
cd GitPractice
git init
```

### Task 5
Display your active configuration settings to verify author identity:
```bash
git config --list
```
