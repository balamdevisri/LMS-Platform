import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import {
  Clock,
  Terminal as TerminalIcon,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Zap,
  Loader2,
  BookOpen,
  Award,
  Lightbulb,
  FileDown,
  Activity,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LazyViewport } from './LazyViewport';

const Terminal = lazy(() => import('./Terminal').then(m => ({ default: m.Terminal })));

const TerminalSkeleton = () => (
  <div className="w-full h-80 bg-slate-950 rounded-2xl border border-slate-900 animate-pulse flex items-center justify-center">
    <div className="text-slate-500 font-mono text-xs">Loading Interactive Practice Sandbox...</div>
  </div>
);

export interface LessonDetails {
  id: string | number;
  title: string;
  duration?: string;
  type?: string;
  badge?: string;
  videoUrl?: string;
  content: string;
  commands?: Array<{ command: string; description: string }>;
  resources?: Array<{ title: string; url: string }>;
}

interface LessonViewerProps {
  lesson: LessonDetails;
  isGitCourse?: boolean;
  onExecuteCommand?: (cmd: string) => void;
  onMarkComplete: () => void;
  onNextLesson: () => void;
  isCompleted: boolean;
  isNightMode?: boolean;
  courseTitle?: string;
  courseId?: string;
  isCourseFullyCompleted?: boolean;
}

interface TabSectionData {
  introduction: string;
  useCases: string[];
  practices: string[];
  mistakes: string[];
  interview: { q: string; a: string }[];
  viva: { q: string; a: string }[];
  trouble: string[];
  preview: string;
}

function getTabSectionData(title: string, courseId?: string): TabSectionData {
  const t = title.toLowerCase();
  const cId = (courseId || '').toLowerCase();
  
  if (cId === 'react-js-complete-course' || t.includes('react')) {
    return {
      introduction: "React JS is a component-driven frontend library powering modern interactive web applications and scalable user interfaces.",
      useCases: [
        "Building dynamic, high-performance single page applications (SPAs).",
        "Designing reusable UI component libraries using JSX syntax.",
        "Handling client-side routing and asynchronous state updates dynamically."
      ],
      practices: [
        "Always specify unique key props when rendering dynamically mapped lists.",
        "Keep local components focused, lifting state up only when sharing is required."
      ],
      mistakes: [
        "Mutating state variables directly instead of using the setter functions (e.g. setState).",
        "Creating memory leaks by omitting cleanup functions in useEffect hooks."
      ],
      interview: [
        { q: "What is the Virtual DOM and how does React use it?", a: "The Virtual DOM is a lightweight memory representation of the real DOM. React uses it to compute diffs and batch updates, optimizing actual DOM manipulation for speed." },
        { q: "What are React Hooks and what rules must they follow?", a: "Hooks are functions that let you tap into React state and lifecycles. They must only be called at the top level of functional components and only from React functions." }
      ],
      viva: [
        { q: "Which tool starts a Vite development server?", a: "npm run dev." },
        { q: "What does JSX stand for?", a: "JavaScript XML." }
      ],
      trouble: [
        "Fix infinite re-renders: verify dependency arrays in useEffect hook bindings.",
        "Fix state lag: access updated values via functional updates: setVal(prev => prev + 1)."
      ],
      preview: "Next lesson will dive into JSX expressions, component props, and rendering lifecycles."
    };
  } else if (cId === 'kubernetes-complete-course-beginner-to-advanced' || t.includes('kubernetes') || t.includes('k8s')) {
    return {
      introduction: "Kubernetes (K8s) is the industry standard container orchestrator, automating deployment, auto-scaling, and lifecycle operations for microservices.",
      useCases: [
        "Scaling web microservices dynamically based on traffic spikes.",
        "Managing persistent volumes across stateful cloud database containers.",
        "Executing zero-downtime rolling updates with automatic rollbacks."
      ],
      practices: [
        "Always define CPU and memory resource requests and limits on pods.",
        "Deploy services securely using ServiceAccounts and explicit RBAC policies."
      ],
      mistakes: [
        "Using the 'latest' tag for container images in production deployment files.",
        "Storing passwords or credentials in plaintext environment variables instead of Secrets."
      ],
      interview: [
        { q: "What are Pods in Kubernetes?", a: "Pods are the smallest deployable units in Kubernetes, representing a single instance of a running process and containing one or more containers." },
        { q: "What is the difference between a Service and an Ingress?", a: "A Service provides an internal or external stable network endpoint for Pods, while Ingress manages external HTTP/S routing and SSL termination to services." }
      ],
      viva: [
        { q: "What command gets all running Pods?", a: "kubectl get pods." },
        { q: "Where does K8s store cluster configuration state?", a: "In etcd." }
      ],
      trouble: [
        "Debug pending pods: run kubectl describe pod <pod-name> to inspect scheduling rules.",
        "Examine container logs: execute kubectl logs <pod-name> -c <container-name>."
      ],
      preview: "Next lesson will explore Pod lifecycle states, replica configuration, and services networking."
    };
  } else if (cId === 'git-github-mastery' || t.includes('git') || t.includes('github') || t.includes('branch') || t.includes('action')) {
    return {
      introduction: "Git is the industry standard version control engine. It enables thousands of software developers to work collaboratively on a shared codebase.",
      useCases: [
        "Feature-branching workflows to isolate features before code reviews.",
        "Continuous testing pipelines triggered via GitHub Actions workflows on branch push.",
        "Reverting buggy commits in staging using interactive rebasing."
      ],
      practices: [
        "Write clean, imperative commit messages (e.g., 'feat: add login flow').",
        "Enable branch protection rules on main branches to prevent direct force pushes."
      ],
      mistakes: [
        "Committing credentials or API secret keys to public git repositories.",
        "Resolving merge conflicts by overwriting other developers' work without alignment."
      ],
      interview: [
        { q: "What is the difference between git merge and git rebase?", a: "git merge appends a merge commit preserving historical branches, whereas git rebase moves the base commit sequence to form a linear history." },
        { q: "What is git reflog used for?", a: "git reflog logs local HEAD changes, allowing you to recover lost branches or commits after accidental resets." }
      ],
      viva: [
        { q: "What is the default staging area file name in Git?", a: ".git/index." },
        { q: "How do you remove a file from staging but keep it locally?", a: "git rm --cached <file>." }
      ],
      trouble: [
        "Accidental reset recovery: use git reflog to find the commit hash, then git reset --hard <hash>.",
        "Discard uncommitted changes: run git checkout -- <file> or git restore <file>."
      ],
      preview: "Next lesson will explore collaborative branching, pull reviews, and release tags."
    };
  } else if (cId === 'database-management-system' || t.includes('data') || t.includes('dbms') || t.includes('sql') || t.includes('table')) {
    return {
      introduction: "Database management engines hold the structured core data of modern applications, enforcing relational constraints and transaction boundaries.",
      useCases: [
        "Configuring transaction boundaries to ensure zero loss in financial ledgers.",
        "Indexing database search columns to improve access speed from minutes to milliseconds.",
        "Normalizing schema designs to eliminate redundant records and data inconsistencies."
      ],
      practices: [
        "Design schemas targeting third normal form (3NF) by default.",
        "Analyze query execution paths using EXPLAIN commands before deploying indexes."
      ],
      mistakes: [
        "Creating duplicate records by failing to enforce UNIQUE constraints on identifier fields.",
        "Allowing transaction locks to stall the database by executing long operations inside write transactions."
      ],
      interview: [
        { q: "What are the ACID properties in database transactions?", a: "ACID stands for Atomicity (all or nothing), Consistency (preserves rules), Isolation (independent transactions), and Durability (permanent write)." },
        { q: "What is the difference between primary keys and unique keys?", a: "A primary key uniquely identifies rows and cannot contain NULL values, whereas unique keys enforce uniqueness but can allow NULL entries." }
      ],
      viva: [
        { q: "What does 3NF stand for?", a: "Third Normal Form." },
        { q: "Which key establishes relationships between tables?", a: "Foreign Key." }
      ],
      trouble: [
        "Slow query checks: run EXPLAIN query to check index usage.",
        "Deadlock resolution: inspect lock statuses and kill stalling process IDs."
      ],
      preview: "Next lesson will cover advanced indexing strategies and database security hardening."
    };
  } else {
    return {
      introduction: "Linux systems power 96.4% of the world's top 1 million web servers. Understanding systems administration is critical for building scalable cloud services.",
      useCases: [
        "Automating log rotations on production web servers.",
        "Managing system security profiles for developer access in enterprise workspaces.",
        "Configuring daemon startup scripts via systemd services."
      ],
      practices: [
        "Always use octal permissions instead of recursive wide open chmod 777 settings.",
        "Secure remote system daemons by configuring SSH key-based authentication and disabling root passwords."
      ],
      mistakes: [
        "Running destructive commands (like rm -rf) under root permissions without testing.",
        "Forgetting to check the system binary logs using journalctl when a daemon fails to start."
      ],
      interview: [
        { q: "What is the difference between a hard link and a soft link in Linux?", a: "A hard link points directly to the inode of the source file, whereas a soft (symbolic) link points to the filename itself. Soft links can cross file system boundaries, while hard links cannot." },
        { q: "How do you search for files modified in the last 24 hours?", a: "Use the find command: find /path/to/search -mtime -1" }
      ],
      viva: [
        { q: "Which directory stores system configuration files?", a: "/etc directory." },
        { q: "What is the PID of the systemd process?", a: "PID 1." }
      ],
      trouble: [
        "Check system status: systemctl status <service>",
        "Inspect authorization logs: tail -n 50 /var/log/auth.log"
      ],
      preview: "Next lesson will cover advanced process administration and automation scripts."
    };
  }
}

function enrichTheoryContent(title: string, content: string, courseId: string = ''): string {
  const titleLower = title.toLowerCase();
  const cId = courseId.toLowerCase();
  let enrichedMarkdown = content + "\n\n---\n\n";

  const isGitCourse = cId === 'git-github-mastery' || cId === 'git-github-mastery-course-id' || cId.includes('git');
  const isDbmsCourse = cId === 'database-management-system' || cId.includes('dbms') || cId.includes('database');
  const isLinuxCourse = cId === 'course_linux_101' || cId === 'linux-essentials' || cId.includes('linux') || cId === '1';

  if (isGitCourse) {
    // ----------------------------------------------------
    // GIT & GITHUB TRACK
    // ----------------------------------------------------
    if (titleLower.includes('action') || titleLower.includes('ci') || titleLower.includes('cd') || titleLower.includes('workflow') || titleLower.includes('pipeline')) {
      enrichedMarkdown += `## 🏗️ GitHub Actions CI/CD Architecture & Pipeline Blueprint

GitHub Actions provides an automated runtime container environment to execute checks, run unit tests, audit security compliance, and deploy production builds.

\`\`\`
[ GitHub Repository Event Trigger ]
                |
                v
    [ Workflow Runner Host ]
       | (reads workflow YAML)
       +---> [ Job 1: Test Runner (Ubuntu Runner Container) ]
       |        |---> Step 1: Checkout Repository Code
       |        |---> Step 2: Install Runtime Node Modules
       |        |---> Step 3: Run Jest / Mocha Unit Tests
       |
       +---> [ Job 2: Build & Deploy (Alpine Container) ]
                |---> Step 1: Package Compiled Assets
                |---> Step 2: Push Production Bundle to Server
\`\`\`

### ⚙️ Core Subcomponents of CI/CD Workflows
* **Workflows:** Configured in \`.github/workflows/\` using YAML files. They define automated procedures triggered by events.
* **Events:** Specific triggers (e.g., \`push\`, \`pull_request\`, \`release\`) that start a workflow execution.
* **Jobs:** Independent task blocks that execute on isolated Virtual Machine runners. Jobs run in parallel unless dependencies are declared.
* **Steps:** Individual script commands or modular actions executed sequentially inside a single job container.

---

## 🛠️ Step-by-Step GitHub Actions Operations Lifecycle

| Stage | Action | Execution Description |
| :--- | :--- | :--- |
| **1. Hook Event** | Push/Pull Request | Developer pushes a branch to GitHub, triggering a webhook hook event matching YAML triggers. |
| **2. Provision Runner** | VM Allocation | GitHub provisions a clean runner instance (e.g., \`ubuntu-latest\`) and pulls action definitions. |
| **3. Execution** | Step Runner | Steps execute sequentially. Env variables and secrets are injected securely into the container. |
| **4. Log Reporting** | Console Reporting | Runner streams output logs back to the GitHub actions console and reports pass/fail exit codes. |

---

## 🔬 Deep-Dive: YAML Runner Syntax & Parameter Specs
A typical enterprise workflow YAML file defines triggers, execution permissions, environment scopes, and action arrays:
* **Runs-on:** Specifies target operating systems (\`ubuntu-latest\`, \`windows-latest\`, \`macos-latest\`).
* **Uses:** Plugs in pre-built modular action files (e.g., \`actions/checkout@v4\` to clone the repo, \`actions/setup-node@v4\` to configure node runtimes).
* **Secrets:** Injects hidden environment variables (e.g., \`secrets.GITHUB_TOKEN\`, \`secrets.AWS_SECRET_KEY\`) safely without exposing them in codebase files.

---

## 🔒 Enterprise-Grade CI/CD Security Blueprint
* **Secrets Management:** Never echo or print secrets to step console logs. Always store api credentials in GitHub Secrets.
* **Least Privilege Scopes:** Pin actions to exact commit hashes (e.g., \`actions/checkout@8ade135b\`) instead of floating version tags to block dependency supply attacks.
* **Environment Protection Rules:** Set approval gates requiring senior developer signoffs before deploying jobs to production staging environments.`;
    } else if (titleLower.includes('branch') || titleLower.includes('merge') || titleLower.includes('rebase') || titleLower.includes('switch') || titleLower.includes('checkout') || titleLower.includes('conflict') || titleLower.includes('stash') || titleLower.includes('cherry')) {
      enrichedMarkdown += `## 🏗️ Git Branching Mechanics & Internal Tree Pointers

In Git, a branch is not a copy of directories or files; it is simply a lightweight, mutable pointer referencing a specific commit hash within the Directed Acyclic Graph (DAG).

\`\`\`
                 [ Feature Branch Pointer ]
                             |
                             v
[ commit A ] <--- [ commit B ] <--- [ commit C ] (feature branch)
       ^
       |
  [ commit D ] <--- [ commit E ] (main branch)
                             ^
                             |
                   [ Main Branch Pointer ] <--- [ HEAD Pointer ]
\`\`\`

### ⚙️ Branch References & Pointer Mechanics
* **HEAD:** A special reference pointer indicating the current active branch and commit workspace checkout.
* **Branch Pointers:** Stored inside \`.git/refs/heads/\` as plain text files containing the 40-character commit hash.
* **Detached HEAD State:** Occurs when checkout points directly to a commit hash instead of a branch pointer name. Commits made here are orphaned unless saved to a branch.

---

## 🛠️ Step-by-Step Operations: Merge vs Rebase Blueprints

| Operation | Historical Layout | Conflict Risk | Rollback Safety |
| :--- | :--- | :--- | :--- |
| **Git Merge** | Preserves branch structures. Appends a merge commit combining histories. | Resolved once in the final merge commit. | Straightforward. Revert the merge commit to restore pre-merge state. |
| **Git Rebase** | Re-applies local commits on top of another branch, forming a linear history. | Conflicts must be resolved commit-by-commit. | Harder. Requires rewriting history using \`git reflog\` in case of errors. |

---

## 🔬 Deep-Dive: Fast-Forward Merges vs Three-Way Merges
* **Fast-Forward Merge:** If the target branch has no new commits since the feature branch diverged, Git simply moves the branch pointer forward to the feature branch's latest commit. No merge commit is created.
* **Three-Way Merge:** If commits have occurred on both branches, Git locates the common ancestor commit, performs a delta merge between the common ancestor and the two tips, and creates a merge commit representing the union.

---

## 🔒 Enterprise Branching & Release Security Checklist
* **Enforce Clean Merges:** Require passing test pipelines and approvals on Pull Requests before merging feature branches.
* **Resolve Safely:** Never run manual conflict resolutions directly on the main production branch. Always merge/rebase main into your feature branch first, resolve conflict scopes, test locally, and push.
* **Prune Branches:** Clean up stale pointers. Run \`git branch -d\` on local systems and prune remotes using \`git fetch --prune\` to keep repositories tidy.`;
    } else {
      enrichedMarkdown += `## 🏗️ Git Core Architecture & DAG Internals

Git structures data as a content-addressable database. Every file, directory map, and history commit is serialized, compressed, and stored as an immutable object identified by its SHA-1 hash.

\`\`\`
               [ Staging Index ] <--- Tracked file configurations
                       |
                       v (on git commit)
  [ Commit Object (Author, Timestamp, Parent Hash) ]
                       |
                       v
         [ Tree Object (Directory Layout) ]
              /                 \\
             v                   v
   [ Blob Object (File 1) ]   [ Blob Object (File 2) ]
\`\`\`

### ⚙️ The Three Core Objects in Git Database
1. **Blobs:** Compressed binary files storing raw file contents (no metadata like file name or permission bits).
2. **Trees:** Directory-like structures linking filenames, permission flags, and inode modes to their corresponding Blob or sub-Tree hashes.
3. **Commits:** Metadata records pointing to a root Tree object, storing author data, timestamps, and an array of parent commit hashes.

---

## 🛠️ Step-by-Step Operations: The Git Object Lifecycle

| Stage | Action | System Level Execution |
| :--- | :--- | :--- |
| **1. Edit File** | Modify file.txt | File is updated in local Working Directory (untracked or modified state). |
| **2. Stage File** | \`git add file.txt\` | Hash is computed. Git writes a zlib-compressed object to \`.git/objects/\` and updates the Staging Index file. |
| **3. Record History** | \`git commit\` | Git creates Tree objects for files and directories, packages metadata into a Commit object, and moves branch refs. |

---

## 🔬 Deep-Dive: Staging Index and Workspace Status
The Staging Index (stored in \`.git/index\`) acts as a prepared commit blueprint. When you run \`git status\`, Git performs a quick comparison between:
* The filesystem metadata in your working directory and the index.
* The index hashes and the current commit (HEAD) reference.
This metadata comparison makes status updates extremely fast, even on codebases containing millions of lines.

---

## 🔒 Enterprise-Grade Git Security & Safety Checklist
* **Prevent Credential Commits:** Never add secrets to version control. Always setup a local \`.gitignore\` file.
* **Use PGP Signed Commits:** Configure GPG signing (\`git config --global commit.gpgsign true\`) to digitally sign commits, verifying identity and preventing author spoofing.
* **Backup Remotes:** Configure secondary automated backup mirrors of repositories to protect against server failures.`;
    }
  } else if (isDbmsCourse) {
    // ----------------------------------------------------
    // DATABASE & DBMS TRACK (Enriched)
    // ----------------------------------------------------
    if (titleLower.includes('normalization') || titleLower.includes('normal form') || titleLower.includes('3nf')) {
      enrichedMarkdown += `## 🏗️ Schema Normalization & Integrity Architecture

Normalization is a systematic database design methodology used to minimize data redundancy, eliminate data anomalies, and enforce relational consistency.

\`\`\`
[ Raw Schema (Repeating Groups) ]
               |
               v (satisfy 1NF: Atomic values, declare Primary Key)
   [ First Normal Form (1NF) ]
               |
               v (satisfy 2NF: Remove partial key dependencies)
   [ Second Normal Form (2NF) ]
               |
               v (satisfy 3NF: Remove transitive key dependencies)
   [ Third Normal Form (3NF) ]
\`\`\`

### ⚙️ Database Anomaly Risk Factors
* **Insert Anomalies:** Inability to insert data because other unrelated details must exist (e.g., cannot add a new course unless a student enrolls).
* **Update Anomalies:** Inconsistencies caused by updating duplicated values in some rows but not others (e.g., updating a student address in one record leaves old values in duplicate rows).
* **Delete Anomalies:** Unintentional data loss where deleting one record deletes other unrelated data (e.g., deleting a student registration deletes all course detail records).

---

## 🛠️ Step-by-Step Normalization Blueprint & Transition Rules

| Transition Phase | Target Requirements | Technical Action |
| :--- | :--- | :--- |
| **Convert to 1NF** | Atomic values in fields. Primary Key declared. | Break down arrays or comma-separated lists into individual rows. Assign unique identifiers. |
| **Convert to 2NF** | Satisfies 1NF. All non-key attributes fully depend on the complete Primary Key. | If a table has a composite key, separate columns that depend on only part of the key into a new table. |
| **Convert to 3NF** | Satisfies 2NF. No non-key attributes depend on other non-key attributes. | Move columns that depend on non-key attributes into separate lookup tables. |

---

## 🔬 Deep-Dive: Functional Dependency & Transitive Dependency
* **Functional Dependency (X -> Y):** If a value of attribute X uniquely determines the value of attribute Y. Primary keys functionally determine all non-key columns in a valid row.
* **Transitive Dependency (X -> Y -> Z):** When attribute X determines Y, and Y determines Z. Normalization decomposes tables to ensure dependencies only exist directly on the primary key (X -> Z).

---

## 🔒 Enterprise Schema Hardening Checklist
* **Enforce Integrity Constraints:** Always use FOREIGN KEY references with CASCADE actions configured to prevent orphaned rows on deletions.
* **Balance De-normalization:** For high-throughput analytics warehouses, selectively de-normalize tables to reduce expensive JOIN operations and improve read performance.`;
    } else if (titleLower.includes('transaction') || titleLower.includes('acid') || titleLower.includes('lock') || titleLower.includes('concurrency')) {
      enrichedMarkdown += `## 🏗️ Database Transactions & Concurrency Engine Architecture

Relational database engines must coordinate concurrent queries from thousands of users while ensuring strict safety boundaries called ACID properties.

\`\`\`
[ Transaction Start (BEGIN) ]
              |
              v (writes modified blocks to Buffer Pool)
      [ Buffer Manager ] <---> [ Write-Ahead Log (WAL) ]
              |                        | (flush logs first)
              v (enforces locks)       v
       [ Lock Manager ] ------> [ Disk / Permanent Storage ]
              |
              v (all or nothing)
   [ Commit (COMMIT) / Abort (ROLLBACK) ]
\`\`\`

### ⚙️ Concurrency Anomaly Risk Factors
* **Dirty Read (Grave anomaly):** Transaction A reads modifications made by Transaction B before B commits. If B rolls back, A's calculations are invalid.
* **Non-Repeatable Read:** Transaction A reads a row, Transaction B updates it and commits, and A reads the row again, getting different values.
* **Phantom Read:** Transaction A executes a range query, Transaction B inserts new rows matching the range and commits, and A queries again, getting new phantom rows.

---

## 🛠️ Step-by-Step Transaction Stages & Locks

| Execution Stage | Locks Acquired | Log Activity | Abort Mitigation |
| :--- | :--- | :--- | :--- |
| **1. Write Request** | Exclusive Lock (X-Lock) | Write-Ahead Log records pre-image. | If transaction fails, engine uses WAL to restore values. |
| **2. Read Request** | Shared Lock (S-Lock) | Page checked in Buffer Pool. | Read lock is released (or held based on isolation level). |
| **3. Committing** | Locks Released | Transaction commit log entry written to disk. | Changes are made permanent on disk. |

---

## 🔬 Deep-Dive: Multi-Version Concurrency Control (MVCC)
Modern database engines (e.g., PostgreSQL, InnoDB) use **MVCC** instead of locking tables for reads. When a row is modified:
* The database engine creates a new version of the row with a transaction timestamp.
* Read operations read older committed versions of the row without waiting for write locks.
* This allows concurrent reads and writes to execute simultaneously without blocking each other.

---

## 🔒 Enterprise Transaction Security & Performance Checklist
* **Keep Transactions Short:** Avoid putting slow operations or external API calls inside write transactions.
* **Enforce Deadlock Handling:** Design applications to acquire locks in a consistent order to prevent deadlocks.
* **Select Isolation Wisely:** Default to \`Read Committed\` for general tasks; use \`Serializable\` only when strict accuracy is mandatory (e.g., ledger updates).`;
    } else {
      enrichedMarkdown += `## 🏗️ Relational Database Management Systems Architecture

An enterprise Database Management System (DBMS) acts as a highly structured data supervisor, isolating physical disk files from logical query interfaces.

\`\`\`
[ Client Application ] ---> [ SQL Query Parser & Compiler ]
                                      |
                                      v
                             [ Query Optimizer ]
                                      | (Execution Plan)
                                      v
                             [ Database Engine ]
                               /            \\
                              v              v
                     [ Buffer Pool ]    [ Lock Manager ]
                            | (Reads/Writes)
                            v
                     [ Physical Storage / OS Disk Files ]
\`\`\`

### ⚙️ The Relational Data Model Foundations
* **Relations (Tables):** Structured grids consisting of rows (tuples) and columns (attributes) representing entities.
* **Attributes (Columns):** Fields defined with specific data types, enforcing domain constraints (e.g., VARCHAR, INT, TIMESTAMP).
* **Tuples (Rows):** Unique occurrences of records containing factual values corresponding to the relation's attributes.

---

## 🔬 Deep-Dive: Transaction Mechanics and ACID Boundaries
Transactions are sequences of one or more database operations executed as a single unit of work. Relational engines enforce ACID safety properties:

1. **Atomicity:** All operations within the transaction succeed completely, or the database is rolled back to its pre-transaction state. Managed by the **Transaction Log (WAL - Write Ahead Logging)**.
2. **Consistency:** Operations must transition the database from one valid state (respecting all schemas, keys, constraints, and triggers) to another.
3. **Isolation:** Concurrent transactions execute without cross-interference. Relational engines use **Locks** and **Multi-Version Concurrency Control (MVCC)** to support isolation levels:
   * **Read Uncommitted:** Allows dirty reads (reading uncommitted updates).
   * **Read Committed:** Prevents dirty reads; queries only read committed rows.
   * **Repeatable Read:** Ensures that reading the same row multiple times inside a transaction yields identical values.
   * **Serializable:** Strict serial execution simulation (prevents phantom reads).
4. **Durability:** Once a transaction commits, its modifications are permanently recorded on non-volatile disk storage, surviving system crashes.

---

## 🛠️ Step-by-Step Normalization Basics

| Normal Form | Primary Requirement | Elimination Target |
| :--- | :--- | :--- |
| **First Normal Form (1NF)** | All attribute values must be atomic (no arrays/nested groups). Rows must be unique. | Nested tables, repeating group columns. |
| **Second Normal Form (2NF)** | Must satisfy 1NF, and all non-key attributes must be fully functionally dependent on the entire Primary Key. | Partial dependencies (attributes dependent on only part of a composite primary key). |
| **Third Normal Form (3NF)** | Must satisfy 2NF, and no non-key attributes can be transitively dependent on the Primary Key. | Transitive dependencies (non-key columns depending on other non-key columns). |

---

## 🔒 Enterprise Schema Design & Hardening Checklist
* **Enforce Key Constraints:** Always declare PRIMARY KEY, UNIQUE, and FOREIGN KEY attributes to protect relational integrity.
* **Use Indexed Searches:** Create indexes on columns frequently used in WHERE conditions, JOIN clauses, or ORDER BY operations to prevent full table scans.
* **Sanitize Inputs:** Never concatenate raw user input into SQL queries. Always utilize Prepared Statements and Parameterized Queries to block SQL Injection attacks.`;
    }
  } else if (isLinuxCourse) {
    // ----------------------------------------------------
    // GENERAL / LINUX TRACK
    // ----------------------------------------------------
    if (titleLower.includes('permission') || titleLower.includes('chmod') || titleLower.includes('chown') || titleLower.includes('acl') || titleLower.includes('owner') || titleLower.includes('group')) {
      enrichedMarkdown += `## 🏗️ Linux Permissions & File Authorization Architecture

Linux is a secure multi-user operating system. Access control is managed through permission bits, owners, groups, and Access Control Lists (ACLs).

\`\`\`
[ User Request ] ---> [ System Kernel check ]
                             |
                             v
                 Owner matching check?
                / (yes)         \\ (no)
               v                 v
        [ Owner Bits ]     Group matching check?
        (read/write/exec)   / (yes)         \\ (no)
                           v                 v
                    [ Group Bits ]     [ Others Bits ]
                    (read/write/exec)  (read/write/exec)
\`\`\`

### ⚙️ The Nine Standard Permission Bits
Permissions are represented as three octal digits (e.g., \`755\`) mapping to Owner, Group, and Others:
* **Read (r - 4):** Allows viewing directory files list or reading file contents.
* **Write (w - 2):** Allows modifying file contents or adding/deleting files inside a directory.
* **Execute (x - 1):** Allows running files as binaries/scripts or navigating into a directory.

---

## 🛠️ Step-by-Step Permissions & Ownership Blueprint

| Command / Flag | Action Target | System Internal Effect |
| :--- | :--- | :--- |
| \`chmod 755 file.sh\` | File permission bits | Sets owner to Read/Write/Execute (\`7\`), group to Read/Execute (\`5\`), others to Read/Execute (\`5\`). |
| \`chmod u+s bin\` | SUID special bit | Allows users to run the file with the owner's privileges (e.g., executing changes as root). |
| \`chown root:dev file\` | Owner and Group | Changes ownership. Updates the file inode's UID to root (0) and GID to dev group. |

---

## 🔬 Deep-Dive: Special Permission Bits (SUID, SGID, Sticky Bit)
* **SUID (Set User ID - Octal value 4000):** Indicated by an \`s\` in owner execute bit (e.g., \`rwsr-xr-x\`). Runtimes execute files with the privileges of the file owner. E.g., \`/usr/bin/passwd\` runs as root to update passwords.
* **SGID (Set Group ID - Octal value 2000):** Indicated by an \`s\` in group execute bit. Files created in directories inherit the directory's group instead of the user's primary group.
* **Sticky Bit (Octal value 1000):** Indicated by a \`t\` at the end (e.g., \`rwxrwxrwt\`). Users can only delete files they own within the directory. E.g., \`/tmp\` directory.

---

## 🔒 Enterprise Administration & Security Checklist
* **Block Wide Access:** Never run \`chmod 777\` on production systems. Use specific, restricted permissions.
* **Audit SUID Executables:** Frequently audit SUID files using find commands: \`find / -perm -4000 -type f\` to detect unauthorized root privilege escalations.
* **Use Fine-Grained ACLs:** Use \`setfacl\` and \`getfacl\` to configure permissions for multiple specific users or groups without altering default owner/group flags.`;
    } else if (titleLower.includes('process') || titleLower.includes('systemd') || titleLower.includes('service') || titleLower.includes('daemon') || titleLower.includes('pid') || titleLower.includes('kill')) {
      enrichedMarkdown += `## 🏗️ Linux Process Management & systemd Architecture

Linux manages task execution through process trees. \`systemd\` is the default system initialization system (PID 1) that bootstraps user space and manages system service daemons.

\`\`\`
          [ Kernel Boot Phase ]
                    |
                    v
          [ systemd Init (PID 1) ]
         /          |           \\
        v           v            v
  [ Service A ] [ Service B ] [ Service C ]
   (Active)      (Failed)      (Inactive)
\`\`\`

### ⚙️ Process State Transitions
Processes transition between states during execution:
* **Running (R):** Currently executing on a CPU core or waiting in run queue.
* **Interruptible Sleep (S):** Waiting for an event or resource to become available.
* **Uninterruptible Sleep (D):** Waiting for disk I/O or kernel device drivers. Cannot be killed.
* **Zombie (Z):** Finished execution, but parent has not read exit status yet. Occupies PID registry space.

---

## 🛠️ Step-by-Step Process Operations & systemd Blueprints

| Command | Action Target | Operational Description |
| :--- | :--- | :--- |
| \`systemctl start <svc>\` | systemd daemon | Loads unit file configurations, creates child process, and sets up logging. |
| \`systemctl enable <svc>\` | Boot system | Creates symlinks in \`/etc/systemd/system/\` to launch the service during boot. |
| \`kill -9 <PID>\` | Process signal | Sends SIGKILL signal directly to target PID, forcing immediate termination. |

---

## 🔬 Deep-Dive: System Signals (SIGINT, SIGTERM, SIGKILL)
The kernel communicates lifecycle actions to processes using software signals:
* **SIGINT (Signal 2):** Sent via keyboard interrupt (\`Ctrl+C\`). Tells process to terminate gracefully.
* **SIGTERM (Signal 15):** Default termination signal sent by system shutdown. Allows processes to close files, flush caches, and release memory before exiting.
* **SIGKILL (Signal 9):** Forces immediate termination. The kernel terminates the process directly, preventing it from running cleanups.

---

## 🔒 Enterprise Administration & Security Checklist
* **Monitor Zombie Procs:** Audit zombie processes using \`ps aux | grep 'Z'\` to locate leaking applications.
* **Harden systemd Services:** Configure systemd unit files with \`ProtectSystem=full\` and \`PrivateDevices=true\` to sandbox service actions.
* **Run in Background:** Use tools like \`nohup\` or \`screen\` to keep execution running after SSH session disconnects.`;
    } else if (titleLower.includes('kernel') || titleLower.includes('monolithic') || titleLower.includes('microkernel') || titleLower.includes('subsystem')) {
      enrichedMarkdown += `## 🏗️ Linux Kernel Subsystems & Core Architecture

The Linux kernel is a monolithic operating system kernel that controls hardware execution, virtual memory allocation, process scheduling, and file accesses.

\`\`\`
[ User Space Applications (e.g., Shell / Chrome) ]
                      |
                      v (Trap / System Call Interface)
  [ Linux Kernel Space (Ring 0 System Level Permissions) ]
     |---> [ Process Scheduler ]
     |---> [ Virtual Memory Manager ]
     |---> [ Virtual File System (VFS) ]
     |---> [ Network Subsystem Driver ]
                      |
                      v
             [ Physical Hardware ]
\`\`\`

### ⚙️ Core Subsystem Responsibilities
* **Process Scheduler:** Coordinates execution priority queues, allocating CPU slices to active threads.
* **Memory Manager:** Sets up virtual memory space, page files, buffer cache, and limits process memory ranges.
* **Virtual File System (VFS):** Standardizes file access interfaces, translating calls like \`open()\` or \`read()\` for Ext4, XFS, or NFS.
* **Network Stack:** Parses IP/TCP network packets and routes incoming packets to applications.

---

## 🛠️ Step-by-Step Kernel Module Execution

| Operation | Command | Operational Description |
| :--- | :--- | :--- |
| \`lsmod\` | Kernel registry | Lists currently loaded kernel module drivers (e.g., ext4, nvidia, network). |
| \`modinfo <name>\` | Module details | Shows details, dependencies, and configuration parameters of a module. |
| \`modprobe <name>\` | Load module | Safely loads or removes driver modules along with all required dependencies. |

---

## 🔒 Enterprise Kernel Security Hardening Checklist
* **Disable Root Shells:** Secure server consoles by blocking direct root SSH connections.
* **Keep Kernel Updated:** Run updates (\`yum update kernel\` / \`apt upgrade linux-image\`) regularly to patch kernel vulnerabilities.
* **Harden sysctl:** Set kernel parameters in \`/etc/sysctl.conf\` (e.g., \`net.ipv4.conf.all.accept_redirects = 0\`) to secure networking.`;
    } else {
      enrichedMarkdown += `## 🏗️ Core System Administration & Kernel Architecture

Operating systems form the bridge between software instructions and physical hardware registers, organizing access through clean permission rings.

\`\`\`
[ User Space App (e.g., Bash Shell) ]
                |
                v (System Call Interface: read, write, fork)
   [ Kernel Space (CPU / Scheduler / Filesystem Driver) ]
                |
                v
        [ Physical Hardware ]
\`\`\`

### ⚙️ Crucial System Administration Subsystems
* **File System Layer:** Handles hierarchical directory mapping, inode directories, physical blocks allocation, and file permission flags.
* **Process Management Scheduler:** Dispatches CPU execution slices, controls thread states (Running, Thread Sleep, Zombie, Stopped), and coordinates priority limits.
* **Security Permission Rings:** Controls authorization boundaries. Kernel operations run in supervisor mode (Ring 0), while user applications are sandboxed in Ring 3.

---

## 🔬 Deep-Dive: File System Inodes and Permission Bits
Every file in a Linux/Unix filesystem is represented by an **Inode (Index Node)**. An inode is a metadata structure storing:
* File size, type (regular file, directory, symlink, block device).
* Owner ID and Group ID.
* Permission bits (Read/Write/Execute for Owner, Group, and Others).
* Timestamps (access time, modify time, change time).
* Pointers to physical data blocks holding the actual content.

*Note: The inode does NOT store the filename. Filenames are stored inside directory files mapped to inode numbers.*

---

## 🛠️ Step-by-Step System Call Workflow

| Step | Action | Description |
| :--- | :--- | :--- |
| **1. Application Request** | API Invocation | An application calls a high-level function like \`printf()\` which triggers the standard library wrapper. |
| **2. Trap Instruction** | Context Switch | The wrapper executes a software interrupt (Trap/Syscall instruction), switching the CPU from user mode to kernel mode. |
| **3. Kernel Execution** | Handler Dispatch | The kernel locates the system call number, executes the underlying driver instructions (e.g., writing bytes to disk/display buffer), and returns control. |

---

## 🔒 Enterprise Administration & Security Checklist
* **Least Privilege Model:** Never use administrative superuser (root) accounts for daily tasks or application runtimes. Use configured \`sudo\` profiles with strict command scopes.
* **Audit System Logs:** Continuously monitor authorization and security logs in \`/var/log/auth.log\` or \`/var/log/secure\` to detect anomalies.
* **Secure Permissions:** Restrict access using octal file masks. Run audits checking for world-writable directories and SUID/SGID executable binary configurations.`;
    }
  } else {
    return content;
  }

  return enrichedMarkdown;
}

interface GeneratedContent {
  studyGuide: string;
  takeaways: string[];
  aiBreakdown: string;
}

export function generateStructuredLessonContent(title: string, content: string): GeneratedContent {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Keyword extraction for validation
  const mainKeywords = titleLower
    .split(/\s+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 3 && w !== 'what' && w !== 'with' && w !== 'your');

  // Check if this is a Database/DBMS track lesson
  const isDatabaseCourse = titleLower.includes('data') || titleLower.includes('dbms') || titleLower.includes('sql') || titleLower.includes('table') || titleLower.includes('key') || titleLower.includes('constraint') || titleLower.includes('relation') || titleLower.includes('normalization') || titleLower.includes('transaction');

  let studyGuide = '';
  let takeaways: string[] = [];
  let aiBreakdown = '';

  // Course Isolation check for Database lessons
  const filterForbiddenWords = (text: string): string => {
    if (isDatabaseCourse) {
      let filtered = text;
      const forbidden = ['linux', 'ubuntu', 'github', 'git', 'bash', 'terminal configuration', 'operating system', 'command line interface', 'cli'];
      forbidden.forEach(word => {
        if (!contentLower.includes(word)) {
          const regex = new RegExp(word, 'gi');
          filtered = filtered.replace(regex, 'database system');
        }
      });
      return filtered;
    }
    return text;
  };

  const sentences = content
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && !s.startsWith('#') && !s.startsWith('-') && !s.startsWith('*') && !s.startsWith('`'));

  // Define database templates dynamically to guarantee uniqueness for DBMS lessons
  // Define database templates dynamically to guarantee uniqueness for DBMS lessons
  if (isDatabaseCourse) {
    if (titleLower.includes('what is data') || titleLower.includes('1.1')) {
      studyGuide = `This guide covers the entry point of information science:\n\n` +
        `📖 1. Definition of Data: Data is raw, unprocessed facts, numbers, or observations without context.\n\n` +
        `📖 2. Concept of Information: Information is data that has been structured and organized to have meaning.\n\n` +
        `📖 3. Definition of Metadata: Metadata provides descriptor details about other data elements.\n\n` +
        `📖 4. Representation: Computers represent data internally in binary format to handle calculations.`;
      takeaways = [
        'Data represents raw, unorganized elements like numbers and words.',
        'Information is processed data that provides context and meaning.',
        'Metadata acts as data about data, clarifying details like formats and sizes.',
        'Structured databases turn raw data into actionable information.'
      ];
      aiBreakdown = `Data & Information Breakdown:\n\n` +
        `• Data: Raw values like "38" or "Red". Alone, they have no contextual meaning.\n` +
        `• Information: When data is processed, e.g., "The user age is 38." It gives data purpose.\n` +
        `• Metadata: Structural data describing files, database columns, or parameters.`;
    } else if (titleLower.includes('what is database') || titleLower.includes('1.2')) {
      studyGuide = `This guide explores organized data storage systems:\n\n` +
        `📖 1. Database Definition: An organized collection of structured data stored electronically.\n\n` +
        `📖 2. Structure: Uses rows (tuples) and columns (attributes) inside grid tables.\n\n` +
        `📖 3. Querying: Relies on specific languages like SQL to retrieve records quickly.\n\n` +
        `📖 4. Management: Controlled by Database Management Systems (DBMS) for safety.`;
      takeaways = [
        'A database is an electronically stored, organized collection of data.',
        'Data is structured in tables containing fields (columns) and records (rows).',
        'A Database Management System (DBMS) acts as the control interface for the database.',
        'Databases enable faster retrieval, search, and update actions compared to flat files.'
      ];
      aiBreakdown = `Database Essentials:\n\n` +
        `• Database: A digital container holding structured info.\n` +
        `• Table: The base layout of columns (fields) and rows (records).\n` +
        `• Record: A single horizontal entry representing an entity.\n` +
        `• Field: A vertical attribute column detailing values.`;
    } else if (titleLower.includes('file system') || titleLower.includes('database vs') || titleLower.includes('1.4')) {
      studyGuide = `This guide compares flat storage models with database managers:\n\n` +
        `📖 1. Data Redundancy: File systems duplicate data files, leading to storage waste.\n\n` +
        `📖 2. Data Inconsistency: Updating one file in a file system leaves duplicates outdated.\n\n` +
        `📖 3. Concurrent Access: DBMS allows multiple users to read and write safely at the same time.\n\n` +
        `📖 4. Data Integrity: DBMS enforces validation rules to prevent corrupt entries.`;
      takeaways = [
        'File systems suffer from high data redundancy due to duplicated files.',
        'Data inconsistency is common in file systems when matching copies are not synchronized.',
        'A DBMS solves access conflicts using concurrency control mechanisms.',
        'Databases ensure data integrity by validating schemas and relationships.'
      ];
      aiBreakdown = `Database vs. File System Comparison:\n\n` +
        `• Data Redundancy: Having multiple copies of the same data item in different files.\n` +
        `• Data Inconsistency: Mismatched data values across separate files for the same entity.\n` +
        `• DBMS Control: Centralizes metadata to enforce rules and allow secure sharing.`;
    } else if (titleLower.includes('dbms introduction') || titleLower.includes('1.3')) {
      studyGuide = `This guide introduces Database Management Systems:\n\n` +
        `📖 1. Definition of DBMS: Software acting as an interface between users and databases.\n\n` +
        `📖 2. Data Definition: Creates and alters tables and schema structures.\n\n` +
        `📖 3. Data Update: Manages insertion, deletion, and updating of rows.\n\n` +
        `📖 4. Concurrency: Coordinates multi-user transactions without conflicts.`;
      takeaways = [
        'DBMS is the software controller that operates database schemas.',
        'It handles data definition (DDL) and data manipulation (DML) statements.',
        'Users query the DBMS to retrieve records securely.',
        'A DBMS ensures transactions commit completely or rollback on failure.'
      ];
      aiBreakdown = `DBMS Concept Breakdown:\n\n` +
        `• DBMS: Database Management System software.\n` +
        `• Data Definition: Organizing table layouts and key indices.\n` +
        `• Security: Enforcing user privileges to protect records.`;
    } else {
      const titleKeywords = mainKeywords.join(', ');
      studyGuide = `This study guide is focused on the database unit: "${title}":\n\n` +
        `📖 1. Topic Core: Understanding the role of ${titleKeywords || 'database schemas'}.\n\n` +
        `📖 2. Structural Rule: Organizing attributes and records to maintain design standards.\n\n` +
        `📖 3. Consistency: Enforcing data validations to avoid anomalies.\n\n` +
        `📖 4. Performance: Verifying correct queries to access the records.`;
      takeaways = [
        `Identify the main database properties associated with ${titleKeywords || 'schemas'}.`,
        `Apply strict rules to retrieve records without redundancy.`,
        `Verify table design columns and relational keys.`,
        `Optimize data organization inside the DBMS container.`
      ];
      aiBreakdown = `Database Concept: ${title}:\n\n` +
        `• Core Subject: Understanding the structural principles of ${titleKeywords || 'relational databases'}.\n` +
        `• Relational Link: Mapping attributes to table grids.\n` +
        `• Access Control: How the DBMS controls validation of values.`;
    }
  } else {
    // Non-database courses (Linux, Git, Python, Java, React)
    if (sentences.length >= 4) {
      studyGuide = `This guide covers the core concepts in the unit:\n\n` +
        sentences.slice(0, 4).map((s, i) => `📖 Key Point ${i+1}: ${s.replace(/\*/g, '')}.`).join('\n\n');
    } else {
      studyGuide = `This guide covers the core concepts in the unit:\n\n` +
        `📖 1. Topic Overview: Studying ${title}.\n\n` +
        `📖 2. Conceptual Pillar: Verifying workflows and structure.\n\n` +
        `📖 3. Execution Step: Running commands in the terminal workspace.\n\n` +
        `📖 4. Best Practice: Documenting configuration parameters.`;
    }

    if (sentences.length >= 4) {
      takeaways = sentences.slice(0, 5).map(s => s.replace(/^[-*+]\s*/, '').replace(/\*/g, '').trim());
    } else {
      takeaways = [
        `Understand the main setup steps for ${title}.`,
        'Verify configurations using interactive sandbox tools.',
        'Document instructions to share best practices.',
        'Track and log performance metrics during execution.'
      ];
    }

    if (titleLower.includes('git') || titleLower.includes('github')) {
      aiBreakdown = `Git Version Control Breakdown:\n\n` +
        `• Repository: Project storage containing complete file histories.\n` +
        `• Commit: Recorded state snapshots tracking local edits.\n` +
        `• Staging: Buffer index where updates are validated before commits.`;
    } else if (titleLower.includes('python')) {
      aiBreakdown = `Python Scripting Breakdown:\n\n` +
        `• Interpreter: Translates python statements into bytecode instructions.\n` +
        `• Functions: Modular blocks declared using the def keyword.\n` +
        `• Indentation: Syntactical scoping to group code commands.`;
    } else {
      aiBreakdown = `System Concept: ${title}:\n\n` +
        `• Core Execution: How applications interact with supervisor runtimes.\n` +
        `• Environment: Running command tests in sandbox workspaces.\n` +
        `• Security: Restricting access configurations using authorization key files.`;
    }
  }

  studyGuide = filterForbiddenWords(studyGuide).replace(/\*/g, '');
  takeaways = takeaways.map(t => filterForbiddenWords(t).replace(/\*/g, '').trim());
  aiBreakdown = filterForbiddenWords(aiBreakdown).replace(/\*/g, '');

  // Automated keyword validation
  const checkHasKeyword = (text: string) => {
    if (mainKeywords.length === 0) return true;
    return mainKeywords.some(k => text.toLowerCase().includes(k));
  };

  const checkHasKeywordInArray = (arr: string[]) => {
    if (mainKeywords.length === 0) return true;
    return arr.some(item => mainKeywords.some(k => item.toLowerCase().includes(k)));
  };

  if (!checkHasKeyword(studyGuide) || !checkHasKeywordInArray(takeaways) || !checkHasKeyword(aiBreakdown)) {
    const keyRef = mainKeywords[0] || 'relational concepts';
    if (!studyGuide.toLowerCase().includes(keyRef)) {
      studyGuide += `\n\n📌 Validation note: This study guide specifically covers terms relating to ${keyRef}.`;
    }
    if (!takeaways.some(t => t.toLowerCase().includes(keyRef))) {
      takeaways.push(`Review the primary principles and structures of ${keyRef}.`);
    }
    if (!aiBreakdown.toLowerCase().includes(keyRef)) {
      aiBreakdown += `\n\n🔍 AI Context Reference: Centered around ${keyRef} topics.`;
    }
  }

  return {
    studyGuide,
    takeaways,
    aiBreakdown
  };
}

export const LessonViewer: React.FC<LessonViewerProps> = React.memo(({
  lesson,
  isGitCourse = false,
  onExecuteCommand,
  onMarkComplete,
  onNextLesson,
  isCompleted,
  isNightMode = false,
  courseTitle = '',
  courseId: _courseId = '',
  isCourseFullyCompleted = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [activeTab, setActiveTab] = useState<'theory' | 'realworld' | 'sandbox' | 'resources'>('theory');

  useEffect(() => {
    if (isCompleted) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lesson.id, isCompleted]);

  const handleClaimXP = () => {
    if (isCompleted) {
      toast.info('XP already claimed for this lesson!');
      return;
    }
    if (timeLeft > 0) return;
    onMarkComplete();
    toast.success('🎉 +50 XP Claimed! Lesson marked as completed!');
  };

  const formattedBadge = useMemo(() => {
    const raw = lesson.badge || 'Core Lesson';
    if (/^unit-[\d-]+$/i.test(raw) || /^lesson\s+unit-[\d-]+$/i.test(raw)) {
      const nums = raw.match(/\d+/g);
      if (nums && nums.length > 0) {
        const lastNum = nums[nums.length - 1];
        return `Subtopic ${lastNum.padStart(2, '0')}`;
      }
    }
    return raw.replace(/^lesson\s+unit-[\d-]+\s*:?\s*/i, 'Subtopic ').replace(/^unit-[\d-]+\s*:?\s*/i, 'Subtopic ');
  }, [lesson.badge]);

  const formattedTitle = useMemo(() => {
    return lesson.title || '';
  }, [lesson.title]);

  const enrichedContent = useMemo(() => {
    return enrichTheoryContent(lesson.title, lesson.content, _courseId);
  }, [lesson.title, lesson.content, _courseId]);

  const generatedContent = useMemo(() => {
    return generateStructuredLessonContent(lesson.title, enrichedContent);
  }, [lesson.title, enrichedContent]);

  const illustrationUrl = useMemo(() => {
    const t = lesson.title.toLowerCase();
    
    // React JS Complete Course image routing
    if (_courseId === 'react-js-complete-course') {
      if (t.includes('jsx') || t.includes('xml')) {
        return 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('component')) {
        return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('prop')) {
        return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('state') || t.includes('hook') || t.includes('useeffect') || t.includes('usestate')) {
        return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('event') || t.includes('form')) {
        return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('router') || t.includes('route') || t.includes('navigate')) {
        return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('api') || t.includes('axios') || t.includes('fetch')) {
        return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('redux') || t.includes('context')) {
        return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('style') || t.includes('css') || t.includes('tailwind') || t.includes('bootstrap')) {
        return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('project') || t.includes('todo') || t.includes('weather')) {
        return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
      }
      return '/assets/images/react_logo_frontend.png';
    }

    // Kubernetes Complete Course image routing
    if (_courseId === 'kubernetes-complete-course-beginner-to-advanced') {
      if (t.includes('architecture') || t.includes('plane') || t.includes('node') || t.includes('master') || t.includes('cluster')) {
        return 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('service') || t.includes('network') || t.includes('ingress') || t.includes('port')) {
        return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('storage') || t.includes('volume') || t.includes('pv') || t.includes('pvc')) {
        return 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('security') || t.includes('rbac') || t.includes('secret') || t.includes('auth')) {
        return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('monitor') || t.includes('log') || t.includes('prometheus') || t.includes('grafana') || t.includes('elk')) {
        return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('helm') || t.includes('chart') || t.includes('package')) {
        return 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80';
      }
      if (t.includes('ci') || t.includes('cd') || t.includes('pipeline') || t.includes('argocd') || t.includes('jenkins')) {
        return 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80';
      }
      return '/assets/images/k8s_logo_orchestration.png';
    }

    // Database track
    const isDbmsCourse = _courseId === 'database-management-system' || _courseId.toLowerCase().includes('database') || _courseId.toLowerCase().includes('dbms');
    if (isDbmsCourse) {
      if (t.includes('normalization') || t.includes('normal form') || t.includes('3nf')) {
        return '/assets/images/dbms_normalization_stages.png';
      }
      if (t.includes('transaction') || t.includes('acid') || t.includes('lock') || t.includes('concurrency')) {
        return '/assets/images/dbms_acid_transactions.png';
      }
      if (t.includes('architecture') || t.includes('engine') || t.includes('optimizer')) {
        return '/assets/images/dbms_architecture_engine.png';
      }
      return '/assets/images/dbms_relational_tables.png';
    }

    // Git/GitHub track
    const isGit = _courseId === 'git-github-mastery' || isGitCourse || _courseId.toLowerCase().includes('git');
    if (isGit) {
      if (t.includes('action') || t.includes('ci') || t.includes('cd') || t.includes('workflow') || t.includes('pipeline')) {
        return '/assets/images/github_actions_pipeline.png';
      }
      if (t.includes('branch') || t.includes('merge') || t.includes('rebase') || t.includes('switch') || t.includes('checkout') || t.includes('conflict') || t.includes('stash') || t.includes('cherry')) {
        return '/assets/images/git_github_flow.png';
      }
      return '/assets/images/git_data_lifecycle.png';
    }

    // Linux Operating System track
    const isLinux = _courseId === 'course_linux_101' || _courseId === 'linux-essentials' || _courseId.toLowerCase().includes('linux') || _courseId === '1';
    if (isLinux) {
      if (t.includes('permission') || t.includes('chmod') || t.includes('chown') || t.includes('acl')) {
        return '/assets/images/linux_permissions_fhs.webp';
      }
      if (t.includes('process') || t.includes('systemd') || t.includes('service') || t.includes('daemon') || t.includes('pid') || t.includes('kill')) {
        return '/assets/images/linux_process_states.png';
      }
      if (t.includes('fhs') || t.includes('hierarchy') || t.includes('directory') || t.includes('folder') || t.includes('inode') || t.includes('link')) {
        return '/assets/images/linux_inode_filesystem.png';
      }
      if (t.includes('kernel') || t.includes('subsystem') || t.includes('monolithic') || t.includes('microkernel') || t.includes('system call') || t.includes('syscall') || t.includes('trap')) {
        return '/assets/images/linux_kernel_rings.png';
      }
      if (t.includes('sudo') || t.includes('security') || t.includes('hardening') || t.includes('root')) {
        return '/assets/images/linux_sudo_security_hardening.webp';
      }
      if (t.includes('bash') || t.includes('script') || t.includes('loop') || t.includes('variable')) {
        return '/assets/images/linux_bash_scripting.png';
      }
      if (t.includes('terminal') || t.includes('cli') || t.includes('navigation') || t.includes('ls') || t.includes('cd') || t.includes('pwd')) {
        return '/assets/images/linux_terminal_cli.png';
      }
      if (t.includes('editor') || t.includes('vim') || t.includes('nano') || t.includes('vi')) {
        return '/assets/images/topic_text_editors.webp';
      }
      if (t.includes('redirection') || t.includes('pipe') || t.includes('stdout') || t.includes('stdin') || t.includes('stderr')) {
        return '/assets/images/linux_io_redirection.png';
      }
      if (t.includes('storage') || t.includes('mount') || t.includes('disk') || t.includes('partition')) {
        return '/assets/images/topic_storage_mounting.webp';
      }
    }

    // Final default fallback based on course if possible, otherwise generic fallback
    if (_courseId.includes('linux') || _courseId === '1') {
      return '/assets/images/linux_course_thumbnail.webp';
    }
    if (_courseId === 'database-management-system') {
      return '/assets/images/dbms_relational_tables.png';
    }
    if (_courseId === 'git-github-mastery' || isGitCourse) {
      return '/assets/images/git_data_lifecycle.png';
    }
    return '/assets/images/react_logo_frontend.png';
  }, [lesson.title, isGitCourse, _courseId]);

  const tabData = useMemo(() => {
    return getTabSectionData(lesson.title, _courseId);
  }, [lesson.title, _courseId]);

  const tabs = [
    { id: 'theory', label: '📂 Theory & Details', icon: BookOpen },
    { id: 'realworld', label: '💡 Real-World & QA', icon: Lightbulb },
    { id: 'sandbox', label: '🛠️ Practice Sandbox', icon: TerminalIcon },
    { id: 'resources', label: '📚 Study Vault', icon: FileDown },
  ];

  // Dynamic Vault resources generation (8-15 high quality references)
  const vaultResources = useMemo(() => {
    const isLinux = lesson.title.toLowerCase().includes('linux') || lesson.title.toLowerCase().includes('kernel') || _courseId.includes('linux') || _courseId === '1';
    const isGit = lesson.title.toLowerCase().includes('git') || isGitCourse || _courseId.includes('git');
    const isReact = _courseId === 'react-js-complete-course';
    const isK8s = _courseId === 'kubernetes-complete-course-beginner-to-advanced';
    const isDbms = _courseId === 'database-management-system';
    
    const typeLabel = isLinux ? 'Linux' : (isGit ? 'Git' : (isReact ? 'React JS' : (isK8s ? 'Kubernetes' : (isDbms ? 'DBMS' : 'Course'))));

    return [
      { id: 'res-1', title: `${typeLabel} Beginner PDF Guide`, desc: 'Step-by-step introduction containing visual explanations of core concepts.', format: 'PDF', size: '2.4 MB' },
      { id: 'res-2', title: `${typeLabel} Advanced PDF Guide`, desc: 'Technical deep-dive covering kernel levels, workflows, and optimization rules.', format: 'PDF', size: '4.8 MB' },
      { id: 'res-3', title: `Core Commands Cheat Sheet`, desc: 'A quick-access cheat sheet with syntax examples for all daily workflows.', format: 'PDF', size: '1.2 MB' },
      { id: 'res-4', title: `Quick Reference Syllabus Notes`, desc: 'Summarized structural notes for exam preparation and viva review.', format: 'DOCX', size: '840 KB' },
      { id: 'res-5', title: `Technical Practice Workbook`, desc: 'Self-evaluation tasks, database questions, and scripting problems.', format: 'XLSX', size: '1.5 MB' },
      { id: 'res-6', title: `Lab Execution Manual`, desc: 'Practical configurations and challenges to execute inside the sandbox.', format: 'PDF', size: '3.1 MB' },
      { id: 'res-7', title: `Official Documentation Links`, desc: 'Reference documentation and standards checklists.', format: 'HTML Link', size: 'Online' },
      { id: 'res-8', title: `Sample configuration templates`, desc: 'Production-ready setting files and mock databases to experiment with.', format: 'JSON / CONF', size: '150 KB' },
      { id: 'res-9', title: `Interview Preparation Cheat sheet`, desc: 'Top questions and model answers with troubleshooting insights.', format: 'PDF', size: '1.9 MB' }
    ];
  }, [lesson.title, isGitCourse]);

  return (
    <article className="w-full space-y-6">
      {/* 1. Hero Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl border shadow-xl p-8 transition-all duration-300 ${
          isNightMode
            ? 'bg-linear-to-b from-slate-900 via-slate-950 to-slate-955/85 border-slate-800'
            : 'bg-linear-to-b from-sky-50/50 via-white to-sky-100/10 border-sky-100/80'
        }`}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {formattedBadge && (
              <span
                className={`px-3 py-1 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 border shadow-xs transition-all ${
                  isNightMode
                    ? 'bg-cyan-955/85 text-cyan-300 border-cyan-800/80'
                    : 'bg-sky-100/90 text-sky-850 border-sky-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{formattedBadge}</span>
              </span>
            )}

            <span
              className={`px-3 py-1 rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 border shadow-xs ${
                isNightMode
                  ? 'bg-slate-900/90 text-slate-350 border-slate-800'
                  : 'bg-white text-slate-700 border-sky-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Estimated: {lesson.duration || '15 mins'}</span>
            </span>

            <span
              className={`px-3 py-1 rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 border shadow-xs ${
                isNightMode
                  ? 'bg-emerald-955/80 text-emerald-300 border-emerald-800/80'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Difficulty: Intermediate</span>
            </span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight leading-tight ${
              isNightMode
                ? 'text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-slate-300'
                : 'text-slate-900'
            }`}
          >
            {formattedTitle}
          </h1>

          <p className={`text-xs max-w-2xl leading-relaxed ${isNightMode ? 'text-slate-400' : 'text-slate-550'}`}>
            {tabData.introduction}
          </p>
        </div>
      </div>

      {/* 2. Apple/Linear-style Tab Pill Bar */}
      <div
        className={`p-1.5 rounded-2xl border flex items-center gap-1 overflow-x-auto scrollbar-none shadow-sm ${
          isNightMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-100/80 border-slate-200/50'
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer select-none whitespace-nowrap active:scale-95 ${
                isActive
                  ? isNightMode
                    ? 'bg-slate-900 text-cyan-300 shadow-md shadow-slate-950 border border-slate-800'
                    : 'bg-white text-sky-850 shadow-sm border border-slate-200/40'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? (isNightMode ? 'text-cyan-400' : 'text-sky-600') : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Dynamic Tab Content Panels with Framer Motion transitions */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {/* TAB 1: THEORY */}
            {activeTab === 'theory' && (
              <div className="space-y-6">
                {/* Learning Objectives Callout */}
                <div
                  className={`p-5 rounded-3xl border flex gap-4 ${
                    isNightMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-sky-50/30 border-sky-100/80'
                  }`}
                >
                  <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-455 border border-sky-500/20 shrink-0 self-start">
                    <BookOpen className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="space-y-2">
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isNightMode ? 'text-sky-400' : 'text-sky-700'}`}>
                      Learning Objectives
                    </h4>
                    <p className={`text-xs leading-relaxed ${isNightMode ? 'text-slate-300' : 'text-slate-655'}`}>
                      By the end of this subtopic, you will master the fundamental syntax execution, study command structures, configuration file parameters, and core troubleshooting steps.
                    </p>
                  </div>
                </div>

                {/* Visual Topic Illustration Card */}
                {illustrationUrl && (
                  <div className={`overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 ${
                    isNightMode ? 'border-slate-800 bg-slate-950/60' : 'border-sky-100 bg-sky-50/10'
                  }`}>
                    <img 
                      src={illustrationUrl} 
                      alt={`${lesson.title} Architectural Visual`}
                      className="w-full h-auto max-h-[320px] object-cover hover:scale-101 transition-transform duration-500"
                    />
                    <div className={`p-4 border-t text-center text-xs font-semibold ${
                      isNightMode ? 'border-slate-800 text-slate-400' : 'border-sky-100 text-slate-650'
                    }`}>
                      💡 Interactive Learning Blueprint: Visualizing {lesson.title}
                    </div>
                  </div>
                )}

                {/* Main Lesson Content */}
                <div
                  className={`p-6 rounded-3xl border shadow-xs ${
                    isNightMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-sky-100 text-slate-900'
                  }`}
                >
                  <MarkdownRenderer content={enrichedContent} isNightMode={isNightMode} />
                </div>
              </div>
            )}

            {/* TAB 2: REAL-WORLD & QA */}
            {activeTab === 'realworld' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Use cases & Pitfalls */}
                <div className="space-y-6">
                  {/* Practical Use Cases Card */}
                  <div
                    className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
                      isNightMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-sky-100 text-slate-900'
                    }`}
                  >
                    <h3 className="text-sm font-extrabold flex items-center gap-2 text-cyan-405">
                      <Lightbulb className="w-4 h-4 text-cyan-400" />
                      Practical Use Cases
                    </h3>
                    <ul className="space-y-3">
                      {tabData.useCases.map((useCase, idx) => (
                        <li key={idx} className="flex gap-3 text-xs leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className={`${isNightMode ? 'text-slate-350' : 'text-slate-650'}`}>{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pitfalls & Mistakes Card */}
                  <div
                    className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
                      isNightMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-sky-100 text-slate-900'
                    }`}
                  >
                    <h3 className="text-sm font-extrabold flex items-center gap-2 text-amber-500">
                      <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                      Common Pitfalls & Mistakes
                    </h3>
                    <ul className="space-y-3">
                      {tabData.mistakes.map((mistake, idx) => (
                        <li key={idx} className="flex gap-3 text-xs leading-relaxed">
                          <span className="text-amber-500 font-black shrink-0">⚠️</span>
                          <span className={`${isNightMode ? 'text-slate-350' : 'text-slate-655'}`}>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Troubleshooting steps */}
                  <div
                    className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
                      isNightMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-sky-100 text-slate-900'
                    }`}
                  >
                    <h3 className="text-sm font-extrabold flex items-center gap-2 text-rose-455">
                      <Activity className="w-4 h-4 animate-pulse text-rose-450" />
                      Troubleshooting Guides
                    </h3>
                    <ul className="space-y-3">
                      {tabData.trouble.map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-xs leading-relaxed font-mono">
                          <span className="text-rose-450 shrink-0 font-bold">{idx + 1}.</span>
                          <span className={`${isNightMode ? 'text-slate-350' : 'text-slate-650'}`}>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column: Q&A Interview prep */}
                <div className="space-y-6">
                  {/* Interview Preparation Notes */}
                  <div
                    className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
                      isNightMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-sky-100 text-slate-900'
                    }`}
                  >
                    <h3 className="text-sm font-extrabold flex items-center gap-2 text-emerald-450">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Interview Preparation Q&A
                    </h3>
                    <div className="space-y-4 divide-y divide-slate-800/40">
                      {tabData.interview.map((qa, idx) => (
                        <div key={idx} className={`space-y-2 text-xs leading-relaxed ${idx > 0 ? 'pt-4' : ''}`}>
                          <p className="font-bold text-white flex gap-1.5">
                            <span className="text-cyan-400">Q:</span>
                            <span>{qa.q}</span>
                          </p>
                          <p className="text-slate-400 flex gap-1.5">
                            <span className="text-emerald-400 font-bold">A:</span>
                            <span>{qa.a}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Viva / Oral Prep */}
                  <div
                    className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
                      isNightMode ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-sky-100 text-slate-900'
                    }`}
                  >
                    <h3 className="text-sm font-extrabold flex items-center gap-2 text-indigo-400">
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      Viva Voce Questions
                    </h3>
                    <div className="space-y-4 divide-y divide-slate-800/40">
                      {tabData.viva.map((qa, idx) => (
                        <div key={idx} className={`space-y-2 text-xs leading-relaxed ${idx > 0 ? 'pt-4' : ''}`}>
                          <p className="font-bold text-white flex gap-1.5">
                            <span className="text-indigo-400">Q:</span>
                            <span>{qa.q}</span>
                          </p>
                          <p className="text-slate-400 flex gap-1.5">
                            <span className="text-emerald-400 font-bold">A:</span>
                            <span>{qa.a}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SANDBOX TERMINAL */}
            {activeTab === 'sandbox' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-bold flex items-center gap-2 font-heading ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                    <TerminalIcon className="w-5 h-5 text-emerald-500 animate-pulse" />
                    Hands-on Practice Terminal Sandbox
                  </h3>
                  <span className={`text-xs font-mono ${isNightMode ? 'text-slate-450' : 'text-slate-550'}`}>Live Interactive Execution</span>
                </div>
                <div className="touch-pan-y overscroll-y-auto w-full">
                  <LazyViewport placeholder={<div className="h-80 bg-slate-900 rounded-3xl animate-pulse" />}>
                    <Suspense fallback={<TerminalSkeleton />}>
                      <Terminal
                        initialCommands={lesson.commands || []}
                        isGitCourse={isGitCourse}
                        onExecuteCommand={onExecuteCommand as any}
                        courseTitle={courseTitle}
                        isNightMode={isNightMode}
                      />
                    </Suspense>
                  </LazyViewport>
                </div>
              </div>
            )}

            {/* TAB 4: RESOURCES STUDY VAULT */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                {/* Summarized Guide Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-3xl border shadow-xs space-y-3 ${isNightMode ? 'bg-slate-900 border-slate-800 text-slate-205' : 'bg-white border-sky-100 text-slate-700'}`}>
                    <h3 className={`text-sm font-extrabold flex items-center gap-2 uppercase tracking-wider ${isNightMode ? 'text-cyan-400' : 'text-sky-650'}`}>
                      <BookOpen className="w-4 h-4" />
                      Core Study Guide
                    </h3>
                    <p className={`text-xs leading-relaxed font-sans whitespace-pre-wrap ${isNightMode ? 'text-slate-350' : 'text-slate-655'}`}>
                      {generatedContent.studyGuide}
                    </p>
                  </div>

                  <div className={`p-6 rounded-3xl border shadow-xs space-y-3 ${isNightMode ? 'bg-slate-905 border-slate-800 text-slate-205' : 'bg-white border-sky-100 text-slate-700'}`}>
                    <h3 className={`text-sm font-extrabold flex items-center gap-2 uppercase tracking-wider ${isNightMode ? 'text-emerald-400' : 'text-emerald-650'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                      Key Takeaways
                    </h3>
                    <ul className={`list-disc pl-5 text-xs space-y-2 font-sans ${isNightMode ? 'text-slate-355' : 'text-slate-655'}`}>
                      {generatedContent.takeaways.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Breakdown Card */}
                <div
                  className={`p-6 rounded-3xl border shadow-xs space-y-3 ${
                    isNightMode
                      ? 'bg-slate-900 border-slate-800 text-slate-205 shadow-slate-950/40'
                      : 'bg-linear-to-r from-sky-50 via-white to-blue-50/60 border-sky-200/80 text-slate-750'
                  }`}
                >
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`}>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>SHAIVIKA AI Key Concept Breakdown</span>
                  </div>
                  <p className={`text-xs leading-relaxed font-sans whitespace-pre-wrap ${isNightMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {generatedContent.aiBreakdown}
                  </p>
                </div>

                {/* Download Vault Resource Grid (8-15 Items) */}
                <div className="space-y-4 pt-4">
                  <h3 className={`text-md font-heading font-black tracking-tight ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                    📥 Resource Download Vault (Classroom Syllabus Attachments)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vaultResources.map((res) => (
                      <div
                        key={res.id}
                        className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between gap-3 ${
                          isNightMode
                            ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-white shadow-slate-950/40'
                            : 'bg-white border-sky-100 hover:border-sky-200 text-slate-900 shadow-sky-500/5'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {res.format}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{res.size}</span>
                          </div>
                          <h4 className="text-xs font-extrabold tracking-tight">{res.title}</h4>
                          <p className="text-[10px] text-slate-450 leading-relaxed">{res.desc}</p>
                        </div>

                        <button
                          onClick={() => toast.success(`📥 Download started for: ${res.title}`)}
                          className={`w-full py-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                            isNightMode
                              ? 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300'
                              : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sky-855'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Download Resource</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Sleek Footer Actions Panel */}
      <footer
        className={`mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border shadow-xl ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/60'
            : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Zap className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              <span>Finished reading & practice?</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                +50 XP
              </span>
            </h4>
            <p className={`text-xs ${isNightMode ? 'text-slate-400' : 'text-slate-550'}`}>
              {isCompleted
                ? 'XP claimed for this lesson! Permanent record saved.'
                : timeLeft > 0
                ? `Read the lesson for ${timeLeft}s to unlock your XP reward.`
                : 'Your XP reward is ready to be claimed!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* CLAIM XP / COMPLETED BUTTON */}
          <button
            onClick={handleClaimXP}
            disabled={isCompleted || timeLeft > 0}
            className={`py-3 px-5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                : timeLeft > 0
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-955 font-black shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 animate-pulse'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ XP Claimed (+50 XP)</span>
              </>
            ) : timeLeft > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span>Claim XP in {timeLeft}s...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-955 fill-current" />
                <span>⚡ Claim +50 XP</span>
              </>
            )}
          </button>

          {/* NEXT LESSON BUTTON */}
          <button
            onClick={() => {
              if (isCourseFullyCompleted) {
                toast.success("🏆 Course Completed! Congrats! Access your certificate via the header.");
                return;
              }
              onNextLesson();
            }}
            className={`py-3 px-5 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto ${
              isCourseFullyCompleted
                ? 'bg-linear-to-r from-amber-500 to-yellow-450 border-amber-300 text-slate-950 hover:brightness-105 shadow-md shadow-amber-500/10'
                : isNightMode
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 shadow-lg shadow-cyan-950'
                : 'btn-blue-primary shadow-lg shadow-sky-500/20'
            }`}
          >
            {isCourseFullyCompleted ? (
              <>
                <Award className="w-4 h-4 fill-slate-950 animate-pulse" />
                <span>Completed 🎉 Congrats!</span>
              </>
            ) : (
              <>
                <span>Next Lesson</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </footer>
    </article>
  );
});
