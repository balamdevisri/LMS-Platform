# Module 10: Git Internals

## Learning Objectives
After completing this module, you will be able to:
- Understand Git's internal architecture as a content-addressable database.
- Learn how Git stores and retrieves data using SHA-1 / SHA-256 cryptographic hashes.
- Master the four core Git internal objects: Blob, Tree, Commit, and Tag.
- Understand how Git tracks references (`refs/heads`, `refs/tags`, `refs/remotes`).
- Understand the role of the `HEAD` reference and detached HEAD states.
- Understand the internal structure of the Staging Index (`.git/index`).
- Inspect low-level Git plumbing objects using `git cat-file`.

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
The `.git` directory is organized into several key components:

```text
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
```

---

## 10.3 Cryptographic Hashing (SHA-1)
Every object stored in Git is uniquely named after its 40-character SHA-1 hash (160 bits), computed from its type, size, and content.

### Hash Structure
```text
SHA-1 Hash Example:
9fceb02d0ae598e95dc970b74767f19372d61af8
──┬─  ──────────────────┬─────────────────
  │                     │
Folder Name        File Name in .git/objects/
(.git/objects/9f/) (ceb02d0ae598e95dc970b74767f19372d61af8)
```

### Benefits of Content Addressing
- **Immutability:** If a single character in a file changes, its hash changes completely.
- **Deduplication:** Identical files across different directories or commits share the exact same Blob object.
- **Tamper Evidence:** Any corruption or tampering is immediately detectable.

---

## 10.4 The Four Fundamental Git Objects

```text
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
```

### 1. Blob Object
Stores the raw file content. It does not store filenames, permissions, or directory paths.
- Inspecting a Blob: `git cat-file -p <hash>`

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

## 10.5 Low-Level Inspection with `git cat-file`
Git provides low-level plumbing commands to inspect objects:

```bash
# View the type of an object (blob, tree, commit, tag)
git cat-file -t 9fceb02

# View the size of an object in bytes
git cat-file -s 9fceb02

# Pretty-print the content of any Git object
git cat-file -p 9fceb02
```

---

## 10.6 The HEAD Reference & Detached HEAD
The `.git/HEAD` file contains a symbolic reference pointing to the currently checked-out branch:

```text
ref: refs/heads/main
```

### Detached HEAD State
When you check out a specific commit directly instead of a branch (`git checkout <commit-hash>`), `HEAD` points directly to the commit SHA rather than a named branch ref:

```text
HEAD ──▶ Commit C2 (Detached HEAD - No branch tracking!)
```

> [!TIP]
> To save changes made in a detached HEAD state, create a new branch: `git switch -c new-feature-branch`.

---

## 10.7 Git Index (The Staging Area)
The file `.git/index` is a binary file that stores the staging area. It tracks:
- Cached file paths
- Timestamps and file sizes
- SHA-1 hashes of the Blobs corresponding to staged files

When you run `git add`, Git writes the file content as a Blob into `.git/objects/` and updates `.git/index` with the new Blob hash.

---

## 10.8 Best Practices
- Never manually delete or edit files inside `.git/objects/` or `.git/refs/`.
- Use `git fsck` to verify database integrity if you suspect filesystem corruption.
- Use `git gc` (Garbage Collection) to optimize repository size and prune unreachable objects.

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
A detached HEAD occurs when `HEAD` points directly to a commit hash rather than a named branch reference. Commits created in this state will become orphaned unless a new branch is created.

### 4. What command is used to inspect the contents and type of an internal Git object?
**Answer:**
`git cat-file -p <hash>` to pretty-print content and `git cat-file -t <hash>` to check object type.

---

## Practical Lab

### Task 1
Initialize a new Git repository and inspect the contents of the `.git` folder:
```bash
ls -la .git
```

### Task 2
Create a file `sample.txt`, add content, stage it with `git add sample.txt`, and verify that a new object was created in `.git/objects/`.

### Task 3
Use `git log --oneline` to get the latest commit hash and inspect it with:
```bash
git cat-file -p HEAD
```

### Task 4
Inspect the Tree object referenced by the commit using `git cat-file -p <tree-hash>`.

### Task 5
Inspect a Blob object referenced inside the Tree using `git cat-file -p <blob-hash>`.
