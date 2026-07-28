import type { ModuleItem, LearningUnitItem, QuizQuestion } from '../contexts/CourseContext';

const getChallengeForLessonId = (id: string) => {
  if (id === 'git-unit-2-1') {
    return {
      id: 'git-init-challenge',
      title: 'Initialize Project Repository',
      difficulty: 'Easy',
      topic: 'Git Fundamentals',
      estimatedTime: '10 mins',
      learningObjectives: ['Run git init commands'],
      constraints: ['Must return exactly "git init"'],
      inputFormat: 'Empty parameters',
      outputFormat: 'String: git init',
      sampleInput: '""',
      sampleOutput: '"git init"',
      explanation: 'git init is the base command used to initialize new local repositories.',
      tags: ['Git Basics', 'Cli'],
      hints: ['Use lowercase letters.', 'Type it exactly as instructed.'],
      templates: {
        javascript: `function initializeRepo() {\n  // Return the command to initialize a repository\n  return "";\n}`
      },
      solutions: {
        javascript: `function initializeRepo() {\n  return "git init";\n}`
      },
      testCases: [
        { id: 'git-init-tc-1', input: '""', expectedOutput: '"git init"', isPrivate: false }
      ]
    };
  }
  if (id === 'git-unit-2-4') {
    return {
      id: 'git-add-challenge',
      title: 'Stage All Working Changes',
      difficulty: 'Easy',
      topic: 'Git Fundamentals',
      estimatedTime: '10 mins',
      learningObjectives: ['Run git add commands'],
      constraints: ['Must return exactly "git add ."'],
      inputFormat: 'Empty parameters',
      outputFormat: 'String: git add .',
      sampleInput: '""',
      sampleOutput: '"git add ."',
      explanation: 'git add . stages all changes in the current directory recursively.',
      tags: ['Git Basics', 'Staging'],
      hints: ['Do not forget the dot space.', 'Use lowercase.'],
      templates: {
        javascript: `function stageAllFiles() {\n  // Return the command to stage all modified files\n  return "";\n}`
      },
      solutions: {
        javascript: `function stageAllFiles() {\n  return "git add .";\n}`
      },
      testCases: [
        { id: 'git-add-tc-1', input: '""', expectedOutput: '"git add ."', isPrivate: false }
      ]
    };
  }
  if (id === 'git-unit-2-5') {
    return {
      id: 'git-commit-challenge',
      title: 'Commit Staged Changes',
      difficulty: 'Easy',
      topic: 'Git Fundamentals',
      estimatedTime: '10 mins',
      learningObjectives: ['Run git commit commands with messages'],
      constraints: ['Must use the message parameter'],
      inputFormat: 'Message string',
      outputFormat: 'String: git commit -m "<msg>"',
      sampleInput: '"feat: add login"',
      sampleOutput: '"git commit -m \\"feat: add login\\""',
      explanation: 'git commit -m wraps the commit message in double quotes to document the changes.',
      tags: ['Git Basics', 'Commits'],
      hints: ['Use double quotes inside.', 'Concatenate message correctly.'],
      templates: {
        javascript: `function commitChanges(message) {\n  // Return the commit command using message\n  return "";\n}`
      },
      solutions: {
        javascript: `function commitChanges(message) {\n  return "git commit -m \\"" + message + "\\"";\n}`
      },
      testCases: [
        { id: 'git-commit-tc-1', input: '"feat: add login"', expectedOutput: '"git commit -m \\"feat: add login\\""', isPrivate: false }
      ]
    };
  }
  if (id === 'git-unit-3-4') {
    return {
      id: 'git-merge-challenge',
      title: 'Merge Feature Branches',
      difficulty: 'Easy',
      topic: 'Branches',
      estimatedTime: '10 mins',
      learningObjectives: ['Merge target branch'],
      constraints: ['Must use the branchName parameter'],
      inputFormat: 'Branch name string',
      outputFormat: 'String: git merge <branch>',
      sampleInput: '"feature/landing"',
      sampleOutput: '"git merge feature/landing"',
      explanation: 'git merge combines history of feature branches back into base branches.',
      tags: ['Branching', 'Merging'],
      hints: ['Concatenate branchName.', 'Ensure correct format.'],
      templates: {
        javascript: `function mergeBranch(branchName) {\n  // Return merge command\n  return "";\n}`
      },
      solutions: {
        javascript: `function mergeBranch(branchName) {\n  return "git merge " + branchName;\n}`
      },
      testCases: [
        { id: 'git-merge-tc-1', input: '"feature/landing"', expectedOutput: '"git merge feature/landing"', isPrivate: false }
      ]
    };
  }
  if (id === 'git-unit-6-3') {
    return {
      id: 'git-stash-challenge',
      title: 'Stash Work in Progress',
      difficulty: 'Medium',
      topic: 'Advanced Git',
      estimatedTime: '12 mins',
      learningObjectives: ['Stash changes'],
      constraints: ['Must return "git stash"'],
      inputFormat: 'Empty parameters',
      outputFormat: 'String: git stash',
      sampleInput: '""',
      sampleOutput: '"git stash"',
      explanation: 'git stash temporarily shelters dirty working changes for clean hotfixes.',
      tags: ['Stashing', 'Advanced'],
      hints: ['Type it exactly as instructed.'],
      templates: {
        javascript: `function stashActiveChanges() {\n  return "";\n}`
      },
      solutions: {
        javascript: `function stashActiveChanges() {\n  return "git stash";\n}`
      },
      testCases: [
        { id: 'git-stash-tc-1', input: '""', expectedOutput: '"git stash"', isPrivate: false }
      ]
    };
  }
  return undefined;
};

// Helper to create a standard lesson
const createLesson = (
  id: string,
  title: string,
  desc: string,
  duration: string,
  type: 'Video' | 'Reading',
  readingContent: string,
  videoUrl = 'https://www.youtube.com/embed/apGV9Ad7XY0'
): LearningUnitItem => ({
  id,
  title,
  description: desc,
  duration,
  type,
  videoUrl,
  readingContent,
  practiceLabChallenge: getChallengeForLessonId(id),
  resources: [
    {
      id: `res-${id}-notes`,
      name: `${title} - Study Notes.pdf`,
      description: 'Comprehensive study guide and references.',
      category: 'PDF',
      fileSize: '1.2 MB',
      downloadPermission: true
    },
    {
      id: `res-${id}-cheatsheet`,
      name: 'Git Command Reference Card.pdf',
      description: 'Quick reference sheet for daily git commands.',
      category: 'PDF',
      fileSize: '450 KB',
      downloadPermission: true
    }
  ]
});

// Mock Quiz Questions for Modules
const createQuizQuestions = (modNum: number): QuizQuestion[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `git-q-m${modNum}-${i + 1}`,
    questionText: `Under Module ${modNum}, which of the following best describes standard version control concept check #${i + 1}?`,
    options: [
      'Establishing linear commit chains and reference pointers',
      'Minimizing detached head configurations in repositories',
      'Optimizing cloud synchronization rules',
      'All of the above statements are valid best practices'
    ],
    correctAnswerIndex: 3,
    explanation: 'Correct version control architecture requires linear commit chains, avoiding detached HEAD states, and standardizing remote synchronization loops.',
    marks: 10
  }));
};

export const gitCourseModules: ModuleItem[] = [
  // Module 1: Introduction to Git
  {
    id: 'git-mod-1',
    title: 'Module 1: Introduction to Git',
    description: 'Learn version control concepts, architectures, and standard Git configurations.',
    duration: '2 Hours',
    topics: [
      {
        id: 'git-topic-1-1',
        title: 'VCS & Setup Lessons',
        description: 'Core concepts, architectural overviews, installation, and user settings.',
        estimatedDuration: '90 mins',
        learningUnits: [
          createLesson(
            'git-unit-1-1',
            'What is Git?',
            'Explore the design, origins, and speed mechanics of Git version control.',
            '15 mins',
            'Video',
            `### Introduction to Git
Git is a distributed version control system designed to handle everything from small to very large projects with speed and efficiency.
- **Distributed**: Every developer has a full copy of the repository history.
- **Speed**: Operations are local and incredibly fast.
- **Integrity**: Every file and commit is checksummed using SHA hashing.`
          ),
          createLesson(
            'git-unit-1-2',
            'Why Version Control?',
            'Understanding historical versioning models, backups, and tracking.',
            '12 mins',
            'Reading',
            `### Why Version Control Systems?
Version Control Systems (VCS) record changes to files over time, allowing developers to:
1. Revert files back to a previous state.
2. Review historical modifications.
3. Compare changes over time.
4. Locate bugs in code lines easily.`
          ),
          createLesson(
            'git-unit-1-3',
            'Git vs GitHub',
            'Distinguishing local git command line utilities from cloud platforms.',
            '10 mins',
            'Reading',
            `### Git vs GitHub: Clarifying the Difference
- **Git** is the local command-line software tool you install on your machine to manage files locally.
- **GitHub** is a remote hosting service provider owned by Microsoft that holds Git repositories in the cloud.`
          ),
          createLesson(
            'git-unit-1-4',
            'Git Architecture',
            'Detailed guide explaining working directory, index staging, and local commits.',
            '15 mins',
            'Reading',
            `### The Three Git Stages
Git tracks project folders using three conceptual zones:
1. **Working Directory**: The active directory where you modify code.
2. **Staging Index**: The intermediate zone containing files prepared for commit.
3. **Repository (.git)**: The directory holding finalized commit logs and history references.`
          ),
          createLesson(
            'git-unit-1-5',
            'Installing Git',
            'Step-by-step setup guides for Linux, Mac OS, and Windows systems.',
            '10 mins',
            'Video',
            `### Installing the Git CLI
Set up Git on your local OS:
- **Mac**: Install Homebrew and run \`brew install git\`
- **Linux**: Run \`sudo apt update && sudo apt install git\`
- **Windows**: Download Git Bash installer from the official site.`
          ),
          createLesson(
            'git-unit-1-6',
            'Configuring Git',
            'Setting up global values like user.name and user.email.',
            '15 mins',
            'Video',
            `### Global Configuration Settings
Before committing code, configure your commit identity globally:
\`\`\`bash
git config --global user.name "John Doe"
git config --global user.email "john@example.com"
\`\`\``
          ),
          createLesson(
            'git-unit-1-7',
            'First Repository',
            'Initializing your first project repository and creating tracking directories.',
            '13 mins',
            'Reading',
            `### Initializing a Project
Run \`git init\` inside an empty folder to create a new Git repository. This generates the hidden \`.git\` metadata directory which stores your commit data.`
          )
        ]
      },
      {
        id: 'git-topic-1-2-assess',
        title: 'Module 1 Graded Checkpoints',
        description: 'Module 1 Final Quiz and practical repository setup homework.',
        estimatedDuration: '30 mins',
        learningUnits: [
          {
            id: 'git-unit-1-quiz',
            title: 'Module 1 Graded Quiz',
            description: '10 questions testing your knowledge of VCS, installation, and config.',
            duration: '15 mins',
            type: 'Quiz',
            quizPassingScore: 70,
            quizQuestions: createQuizQuestions(1)
          },
          {
            id: 'git-unit-1-assignment',
            title: 'Assignment: Local Config Setup',
            description: 'Write configurations and initialize a local repository workspace.',
            duration: '15 mins',
            type: 'Assignment',
            assignmentInstructions: `### Assignment Guidelines
1. Install Git on your computer if not already installed.
2. Open your terminal or Git Bash.
3. Configure your username and email using \`git config --global\`.
4. Initialize a new repository called \`git-mastery\` and add a \`README.md\` file.
5. Save your global configuration properties list to a text file and upload it here.`,
            assignmentMaxMarks: 100
          }
        ]
      }
    ]
  },

  // Module 2: Git Fundamentals
  {
    id: 'git-mod-2',
    title: 'Module 2: Git Fundamentals',
    description: 'Master core commands, staging flows, committing changes, logs, and diff views.',
    duration: '2 Hours',
    topics: [
      {
        id: 'git-topic-2-1',
        title: 'Core Git Commands',
        description: 'Working with init, clone, status, add, commit, messages, logs, and diffs.',
        estimatedDuration: '90 mins',
        learningUnits: [
          createLesson(
            'git-unit-2-1',
            'git init',
            'Create new local repositories.',
            '10 mins',
            'Reading',
            `### Git Init command
Use \`git init\` to convert an unversioned directory into a Git repository. It initializes the base commit databases.`
          ),
          createLesson(
            'git-unit-2-2',
            'git clone',
            'Downloading existing repository codes from remote providers.',
            '12 mins',
            'Reading',
            `### Git Clone command
Copies a remote repository locally, automatically setting up upstream tracking references.`
          ),
          createLesson(
            'git-unit-2-3',
            'git status',
            'Viewing staging flags, modifications, and untracked file statuses.',
            '10 mins',
            'Reading',
            `### Git Status command
Inspects active file states, displaying staged vs unstaged modifications.`
          ),
          createLesson(
            'git-unit-2-4',
            'git add',
            'Adding modified files to the staging index.',
            '12 mins',
            'Video',
            `### Staging changes with git add
Prepares changes in files to be committed. Use \`git add <file>\` or \`git add .\` to stage modifications.`
          ),
          createLesson(
            'git-unit-2-5',
            'git commit',
            'Creating permanent snapshots of staged changes.',
            '12 mins',
            'Video',
            `### Committing changes
Saves your staged index snapshot as a commit in the project history database. Use \`git commit -m "Message"\`.`
          ),
          createLesson(
            'git-unit-2-6',
            'Commit Messages',
            'Writing professional commit logs using conventional commit guidelines.',
            '10 mins',
            'Reading',
            `### Writing conventional commits
Follow clean formats like: \`feat: add login feature\` or \`fix: resolve memory leak\`. Keep descriptions concise.`
          ),
          createLesson(
            'git-unit-2-7',
            'Git Log',
            'Inspecting commit hashes, authors, and project version timelines.',
            '12 mins',
            'Reading',
            `### Inspecting History with git log
Displays the list of all commits in the current branch in reverse chronological order.`
          ),
          createLesson(
            'git-unit-2-8',
            'Git Diff',
            'Comparing file changes across staging, working directories, and branches.',
            '12 mins',
            'Reading',
            `### Inspecting code changes with git diff
Shows line-by-line differences between unstaged modifications and staging records.`
          )
        ]
      },
      {
        id: 'git-topic-2-2-assess',
        title: 'Module 2 Graded Checkpoints',
        description: 'Module 2 Final Quiz, practical staging, committing, and logs tasks.',
        estimatedDuration: '30 mins',
        learningUnits: [
          {
            id: 'git-unit-2-quiz',
            title: 'Module 2 Graded Quiz',
            description: '10 questions testing staging indices, status, commits, and logs.',
            duration: '15 mins',
            type: 'Quiz',
            quizPassingScore: 70,
            quizQuestions: createQuizQuestions(2)
          },
          {
            id: 'git-unit-2-assignment',
            title: 'Assignment: Perform First Staged Commit',
            description: 'Perform git add, status checks, and create commits.',
            duration: '15 mins',
            type: 'Assignment',
            assignmentInstructions: `### Assignment Guidelines
1. In your \`git-mastery\` repository, create a text file named \`index.html\`.
2. Check \`git status\`.
3. Use \`git add index.html\` to stage it.
4. Run \`git commit -m "feat: add index html file"\`.
5. Run \`git log\` and capture your console log output to a text file. Upload it.`,
            assignmentMaxMarks: 100
          }
        ]
      }
    ]
  },

  // Module 3: Branches
  {
    id: 'git-mod-3',
    title: 'Module 3: Branches',
    description: 'Master branch creation, merging patterns, conflict resolution, and branching practices.',
    duration: '2 Hours',
    topics: [
      {
        id: 'git-topic-3-1',
        title: 'Branching & Merging',
        description: 'Create branches, switch HEAD, merge, and resolve conflicts.',
        estimatedDuration: '90 mins',
        learningUnits: [
          createLesson(
            'git-unit-3-1',
            'Branch Basics',
            'Understand branches as references pointing to commits.',
            '12 mins',
            'Reading',
            `### What is a Branch?
Branches are lightweight pointer references that point to specific commits. The default base branch is usually called \`main\` or \`master\`.`
          ),
          createLesson(
            'git-unit-3-2',
            'Creating Branches',
            'Create feature branches in isolation.',
            '10 mins',
            'Reading',
            `### Creating Branches
Create a branch with \`git branch <name>\` without switching to it immediately.`
          ),
          createLesson(
            'git-unit-3-3',
            'Switching Branches',
            'Checkout different branches and switch HEAD pointers.',
            '12 mins',
            'Video',
            `### Switching branches
Use \`git checkout <branch-name>\` or \`git switch <branch-name>\` to update workspace files.`
          ),
          createLesson(
            'git-unit-3-4',
            'Merging',
            'Combine branch timelines back into main branch paths.',
            '15 mins',
            'Video',
            `### Merging Branches
Integrate changes from one branch into another using the \`git merge <source-branch>\` command.`
          ),
          createLesson(
            'git-unit-3-5',
            'Merge Conflicts',
            'Identify and resolve overlapping text changes manually.',
            '18 mins',
            'Video',
            `### Resolving Merge Conflicts
Occurs when two branches edit the exact same lines of code. Manually resolve conflict markers: \`<<<<<<<\`, \`=======\`, \`>>>>>>>\`.`
          ),
          createLesson(
            'git-unit-3-6',
            'Fast Forward Merge',
            'Understanding linear history forwarding vs merge commits.',
            '13 mins',
            'Reading',
            `### Fast-Forward Merges
If the target branch hasn't diverged, Git simply slides the pointer forward to the source commit hash.`
          ),
          createLesson(
            'git-unit-3-7',
            'Branch Best Practices',
            'Branch conventions, naming strategies, and clean branch sweeps.',
            '10 mins',
            'Reading',
            `### Branch Conventions
Always write descriptive prefix titles: \`feature/login-form\`, \`bugfix/alert-box\`, or \`hotfix/auth-leak\`.`
          )
        ]
      },
      {
        id: 'git-topic-3-2-assess',
        title: 'Module 3 Graded Checkpoints',
        description: 'Module 3 Final Quiz and branch merge conflicts assignment.',
        estimatedDuration: '30 mins',
        learningUnits: [
          {
            id: 'git-unit-3-quiz',
            title: 'Module 3 Graded Quiz',
            description: '10 questions testing branches, fast-forwarding, and conflicts.',
            duration: '15 mins',
            type: 'Quiz',
            quizPassingScore: 70,
            quizQuestions: createQuizQuestions(3)
          },
          {
            id: 'git-unit-3-assignment',
            title: 'Assignment: Resolve Merge Conflict',
            description: 'Manually resolve overlapping code modifications.',
            duration: '15 mins',
            type: 'Assignment',
            assignmentInstructions: `### Assignment Guidelines
1. In your repository, create a branch named \`feature-conflict\`.
2. On \`main\`, edit \`README.md\` line 1 to say "Hello Main". Commit it.
3. On \`feature-conflict\`, edit \`README.md\` line 1 to say "Hello Feature". Commit it.
4. Switch to \`main\` and merge \`feature-conflict\`.
5. Resolve the merge conflict markers, commit the resolved code, and upload a copy of your resolved README.md.`,
            assignmentMaxMarks: 100
          }
        ]
      }
    ]
  },

  // Module 4: GitHub
  {
    id: 'git-mod-4',
    title: 'Module 4: GitHub',
    description: 'Learn cloud remote management, repositories creation, syncing, forking, and PRs.',
    duration: '2 Hours',
    topics: [
      {
        id: 'git-topic-4-1',
        title: 'Cloud Workflows',
        description: 'GitHub registration, pushing, pulling, forks, clones, and PRs.',
        estimatedDuration: '90 mins',
        learningUnits: [
          createLesson(
            'git-unit-4-1',
            'Creating GitHub Account',
            'Setting up accounts, profile preferences, and public keys.',
            '10 mins',
            'Video',
            `### Account Setup
Sign up at github.com and link SSH keys on your account settings panel for authentication.`
          ),
          createLesson(
            'git-unit-4-2',
            'Creating Repository',
            'Create remote repositories, configure templates, and add licenses.',
            '12 mins',
            'Video',
            `### Creating Remote Repos
Click the "New" button on GitHub to instantiate remote hosting repositories.`
          ),
          createLesson(
            'git-unit-4-3',
            'Push',
            'Uploading local commit logs to remote origin branches.',
            '10 mins',
            'Reading',
            `### Uploading with git push
Transfers local branch commit hashes to GitHub: \`git push -u origin main\`.`
          ),
          createLesson(
            'git-unit-4-4',
            'Pull',
            'Fetching and merging remote modifications instantly.',
            '12 mins',
            'Reading',
            `### Pulling Changes
Combines remote changes into your local workspace. Runs git fetch then git merge automatically.`
          ),
          createLesson(
            'git-unit-4-5',
            'Fetch',
            'Downloading remote pointers without altering local working folders.',
            '12 mins',
            'Reading',
            `### Fetching Updates
Downloads history database data from remotes: \`git fetch origin\`. It updates remote tracking pointers.`
          ),
          createLesson(
            'git-unit-4-6',
            'Fork',
            'Copying external repositories into your private GitHub organization spaces.',
            '10 mins',
            'Reading',
            `### Forking Repositories
Creates a copy of someone else's repository in your own account, allowing modifications without impacting source codes.`
          ),
          createLesson(
            'git-unit-4-7',
            'Clone',
            'Cloning remote repository addresses via SSH or HTTPS protocols.',
            '12 mins',
            'Video',
            `### Git Clone
Downloads a local copy of a hosted project workspace: \`git clone <url>\`.`
          ),
          createLesson(
            'git-unit-4-8',
            'Pull Requests',
            'Submitting code modification requests to original branches.',
            '12 mins',
            'Video',
            `### Collaborative Pull Requests
A request to merge code edits into a target branch. Supports peer review discussion logs.`
          )
        ]
      },
      {
        id: 'git-topic-4-2-assess',
        title: 'Module 4 Graded Checkpoints',
        description: 'Module 4 Final Quiz and remote sync assignment.',
        estimatedDuration: '30 mins',
        learningUnits: [
          {
            id: 'git-unit-4-quiz',
            title: 'Module 4 Graded Quiz',
            description: '10 questions testing pushes, remote url additions, forking, and PR approvals.',
            duration: '15 mins',
            type: 'Quiz',
            quizPassingScore: 70,
            quizQuestions: createQuizQuestions(4)
          },
          {
            id: 'git-unit-4-assignment',
            title: 'Assignment: Link Remote Repository',
            description: 'Push your local git-mastery commits to GitHub.',
            duration: '15 mins',
            type: 'Assignment',
            assignmentInstructions: `### Assignment Guidelines
1. Log into your GitHub account.
2. Create a new public repository named \`git-mastery\`.
3. In your local workspace, link the remote URL: \`git remote add origin <your-repo-url>\`.
4. Push your commits: \`git push -u origin main\`.
5. Submit the link to your public GitHub repository here.`,
            assignmentMaxMarks: 100
          }
        ]
      }
    ]
  },

  // Module 5: Collaboration
  {
    id: 'git-mod-5',
    title: 'Module 5: Collaboration',
    description: 'Work with team workflows, code reviews, issues, labels, milestones, and discussions.',
    duration: '2 Hours',
    topics: [
      {
        id: 'git-topic-5-1',
        title: 'Team Workflows',
        description: 'Collaborative development workflows, agile planning, and reviews.',
        estimatedDuration: '90 mins',
        learningUnits: [
          createLesson(
            'git-unit-5-1',
            'Team Workflow',
            'Coordinating branches and merge rules within multi-developer setups.',
            '15 mins',
            'Video',
            `### Collaborative Team Workflows
Coordinates how updates are pushed. Establishes branch guidelines to prevent overlapping changes.`
          ),
          createLesson(
            'git-unit-5-2',
            'Code Review',
            'Performing peer reviews, leaving feedback lines, and request revisions.',
            '15 mins',
            'Video',
            `### Peer Code Reviews
Developers comment on code revisions in PR requests, helping identify bugs before production merges.`
          ),
          createLesson(
            'git-unit-5-3',
            'Issue Tracking',
            'Filing bugs, documenting feature requests, and tracing bug histories.',
            '15 mins',
            'Reading',
            `### GitHub Issues
A bug tracker to log software issues, assign tasks, and track project features.`
          ),
          createLesson(
            'git-unit-5-4',
            'Labels',
            'Categorizing issues and PRs (bug, documentation, enhancement).',
            '10 mins',
            'Reading',
            `### Issues Labels
Helpful badges (e.g. bug, duplicate, help wanted) to organize backlog tickets.`
          ),
          createLesson(
            'git-unit-5-5',
            'Milestones',
            'Grouping issues into release targets and sprint dates.',
            '15 mins',
            'Reading',
            `### Project Milestones
Aggregates ticket completion metrics to measure version release milestones (e.g. sprint v1.0.0).`
          ),
          createLesson(
            'git-unit-5-6',
            'Discussions',
            'Using GitHub Discussions forums for community ideas.',
            '20 mins',
            'Reading',
            `### GitHub Discussions
A community space for open design conversations, QA forums, and knowledge bases.`
          )
        ]
      },
      {
        id: 'git-topic-5-2-assess',
        title: 'Module 5 Graded Checkpoints',
        description: 'Module 5 Final Quiz and agile workflow setup assignment.',
        estimatedDuration: '30 mins',
        learningUnits: [
          {
            id: 'git-unit-5-quiz',
            title: 'Module 5 Graded Quiz',
            description: '10 questions testing code reviews, milestones tracking, and labels.',
            duration: '15 mins',
            type: 'Quiz',
            quizPassingScore: 70,
            quizQuestions: createQuizQuestions(5)
          },
          {
            id: 'git-unit-5-assignment',
            title: 'Assignment: Create a GitHub Issue',
            description: 'Log feature requests and organize sprint milestones.',
            duration: '15 mins',
            type: 'Assignment',
            assignmentInstructions: `### Assignment Guidelines
1. In your GitHub repository, create a new issue titled \`feature: add landing page layout\`.
2. Add a clear description, assign it to yourself, and associate the label \`enhancement\`.
3. Create a sprint milestone named \`v1.1.0\` and assign the issue to this milestone.
4. Capture a screenshot of the issue showing labels and milestones, and upload it here.`,
            assignmentMaxMarks: 100
          }
        ]
      }
    ]
  },

  // Module 6: Advanced Git
  {
    id: 'git-mod-6',
    title: 'Module 6: Advanced Git',
    description: 'Learn history rewrites, stash buffers, resetting, reverting, and bisect debugs.',
    duration: '2 Hours',
    topics: [
      {
        id: 'git-topic-6-1',
        title: 'History Control',
        description: 'Interactive rebases, cherry-pick commands, stash states, resets, and bisect.',
        estimatedDuration: '90 mins',
        learningUnits: [
          createLesson(
            'git-unit-6-1',
            'Rebase',
            'Applying commits on top of another base branch for a linear project history.',
            '15 mins',
            'Video',
            `### Git Rebase command
Integrates changes from a source branch, rewriting history commits: \`git rebase main\`. Useful for keeping logs linear.`
          ),
          createLesson(
            'git-unit-6-2',
            'Cherry Pick',
            'Applying specific commits from other branches individually.',
            '12 mins',
            'Reading',
            `### Cherry Picking Commits
Copy specific commits from one branch to another using: \`git cherry-pick <commit-hash>\`.`
          ),
          createLesson(
            'git-unit-6-3',
            'Stash',
            'Saving uncommitted progress and restoring clean directories.',
            '15 mins',
            'Video',
            `### Git Stash workspace buffers
Saves your work-in-progress modifications, returning the workspace to a clean head: \`git stash\` and \`git stash pop\`.`
          ),
          createLesson(
            'git-unit-6-4',
            'Tags',
            'Annotating and tagging release checkpoints (SemVer release version tags).',
            '10 mins',
            'Reading',
            `### Release Version Tagging
Annotates commit states to declare release milestones (e.g. \`git tag -a v1.0.0 -m "Release v1.0.0"\`).`
          ),
          createLesson(
            'git-unit-6-5',
            'Reset',
            'Resetting workspace indices, staging areas, and hard commits.',
            '15 mins',
            'Video',
            `### Git Reset options
Moves branch HEAD pointers back:
- \`--soft\`: Retains changes staged.
- \`--mixed\`: Retains changes unstaged (default).
- \`--hard\`: Discards modifications entirely.`
          ),
          createLesson(
            'git-unit-6-6',
            'Revert',
            'Creating safe opposing commits to undo previous modifications.',
            '10 mins',
            'Reading',
            `### Git Revert undo actions
Generates a new commit that undoes the changes of a target commit hash, preserving history timelines.`
          ),
          createLesson(
            'git-unit-6-7',
            'Bisect',
            'Running binary searches to isolate bug-introducing commits.',
            '13 mins',
            'Reading',
            `### Binary bug isolation with git bisect
A diagnostic tool that conducts a binary search through project commit histories to locate bug-introducing commits.`
          )
        ]
      },
      {
        id: 'git-topic-6-2-assess',
        title: 'Module 6 Graded Checkpoints',
        description: 'Module 6 Final Quiz and advanced git rollback operations.',
        estimatedDuration: '30 mins',
        learningUnits: [
          {
            id: 'git-unit-6-quiz',
            title: 'Module 6 Graded Quiz',
            description: '10 questions testing rebase risks, git reset flags, and cherry-picks.',
            duration: '15 mins',
            type: 'Quiz',
            quizPassingScore: 70,
            quizQuestions: createQuizQuestions(6)
          },
          {
            id: 'git-unit-6-assignment',
            title: 'Assignment: Perform Git Revert',
            description: 'Rollback a commit safely without destroying history records.',
            duration: '15 mins',
            type: 'Assignment',
            assignmentInstructions: `### Assignment Guidelines
1. In your local repository, create a commit that introduces a bug (e.g. write "BUGGY CODE" in a text file).
2. Switch branch and note the commit hash of this buggy commit.
3. Undo this commit safely: \`git revert <commit-hash>\`.
4. Inspect your commit history logs: \`git log --oneline\`.
5. Upload a text file output of your \`git log --oneline\` showing the revert log.`,
            assignmentMaxMarks: 100
          }
        ]
      }
    ]
  },

  // Module 7: GitHub Actions
  {
    id: 'git-mod-7',
    title: 'Module 7: GitHub Actions',
    description: 'Learn CI/CD automation, YAML workflow configurations, credentials secrets, and deployments.',
    duration: '2 Hours',
    topics: [
      {
        id: 'git-topic-7-1',
        title: 'CI/CD Pipelines',
        description: 'Understand GitHub Actions, YAML parameters, trigger keys, and secrets.',
        estimatedDuration: '90 mins',
        learningUnits: [
          createLesson(
            'git-unit-7-1',
            'CI/CD Basics',
            'Core definitions of Continuous Integration and Continuous Deployment pipelines.',
            '15 mins',
            'Video',
            `### Introduction to CI/CD
- **Continuous Integration (CI)**: Automatically builds and runs tests whenever changes are pushed.
- **Continuous Deployment (CD)**: Automatically deploys approved commits to production environments.`
          ),
          createLesson(
            'git-unit-7-2',
            'Workflow Files',
            'YAML configuration files nested under .github/workflows directory.',
            '18 mins',
            'Reading',
            `### Actions Workflow Configuration Files
Written in YAML syntax and placed under \`.github/workflows/main.yml\`. Configures event triggers, runner operating systems, and sequential jobs.`
          ),
          createLesson(
            'git-unit-7-3',
            'Running Actions',
            'Inspecting workflow execution runs and logs on GitHub.',
            '12 mins',
            'Video',
            `### Monitoring Workflows
Push code to trigger workflows and monitor progress under the "Actions" tab on GitHub.`
          ),
          createLesson(
            'git-unit-7-4',
            'Secrets',
            'Injecting encrypted credential secrets and access tokens.',
            '15 mins',
            'Reading',
            `### Encrypted Secrets Keys
Store API credentials or server SSH private keys in GitHub settings under Secrets/Actions. Injected via: \`\${{ secrets.API_KEY }}\`.`
          ),
          createLesson(
            'git-unit-7-5',
            'Deployments',
            'Publishing web deployments automatically (e.g. GitHub Pages).',
            '15 mins',
            'Video',
            `### Automated Deployments
Trigger actions to publish build directories directly to servers or static hosting providers.`
          )
        ]
      },
      {
        id: 'git-topic-7-2-assess',
        title: 'Module 7 Graded Checkpoints',
        description: 'Module 7 Final Quiz and Actions continuous integration workflow setup.',
        estimatedDuration: '30 mins',
        learningUnits: [
          {
            id: 'git-unit-7-quiz',
            title: 'Module 7 Graded Quiz',
            description: '10 questions testing YAML syntax, runners, jobs matrix, and credentials injection.',
            duration: '15 mins',
            type: 'Quiz',
            quizPassingScore: 70,
            quizQuestions: createQuizQuestions(7)
          },
          {
            id: 'git-unit-7-assignment',
            title: 'Assignment: Setup Jest CI action',
            description: 'Configure continuous integration to run project test suites.',
            duration: '15 mins',
            type: 'Assignment',
            assignmentInstructions: `### Assignment Guidelines
1. In your repository, create the subfolder: \`.github/workflows/\`.
2. Write a workflow config file named \`ci.yml\` that triggers on push.
3. Configure the runner to run on \`ubuntu-latest\` and define a build step using Node.js.
4. Commit and push the folder to your remote repository.
5. Provide a link to the Actions tab showing a successful run of your workflow file.`,
            assignmentMaxMarks: 100
          }
        ]
      }
    ]
  },

  // Module 8: Enterprise Git Workflow
  {
    id: 'git-mod-8',
    title: 'Module 8: Enterprise Git Workflow',
    description: 'Learn branching workflows (Git Flow, Feature Branch), hotfix cycles, and branch protection.',
    duration: '2 Hours',
    topics: [
      {
        id: 'git-topic-8-1',
        title: 'Enterprise Workflows',
        description: 'Git Flow structures, feature branches, release/hotfix, and protected branches.',
        estimatedDuration: '90 mins',
        learningUnits: [
          createLesson(
            'git-unit-8-1',
            'Git Flow',
            'Standard branches layout with main, develop, feature, release, and hotfix branches.',
            '15 mins',
            'Video',
            `### Git Flow Branching Architecture
A structured branching model defining specific roles for branch timelines:
- \`main\`: Holds stable production releases.
- \`develop\`: Integrates features.
- \`feature/*\`: Isolated feature branch development.`
          ),
          createLesson(
            'git-unit-8-2',
            'Feature Branch Workflow',
            'Using pull requests to merge feature branches into develop branches.',
            '15 mins',
            'Reading',
            `### Feature Branch Workflows
Developers do not push directly to \`main\` or \`develop\`. They develop on isolated feature branches and merge via pull requests.`
          ),
          createLesson(
            'git-unit-8-3',
            'Release Workflow',
            'Preparing software release tags and logs systematically.',
            '12 mins',
            'Reading',
            `### Releases pipelines
Releases branches isolate release preparation, allowing develop to receive new feature changes concurrently.`
          ),
          createLesson(
            'git-unit-8-4',
            'Hotfix Workflow',
            'Applying urgent hotfix patches to production main branches.',
            '15 mins',
            'Video',
            `### Urgent Production Hotfixes
Urgent patches branched directly from \`main\`. Merged immediately into both \`main\` and \`develop\` branches.`
          ),
          createLesson(
            'git-unit-8-5',
            'Protected Branches',
            'GitHub branch rules (require PR approvals, signed commits, check passes).',
            '15 mins',
            'Reading',
            `### Enforcing Branch Protections
Protects branches from direct pushes. Enforces rules like requiring PR reviews or status check completions before merging.`
          ),
          createLesson(
            'git-unit-8-6',
            'Enterprise Best Practices',
            'Code signing, large file handling (LFS), and clean commit histories.',
            '18 mins',
            'Reading',
            `### Enterprise Best Practices
Use GPG keys for signed commits, ignore massive build assets via \`.gitignore\`, and clean history lines using rebases.`
          )
        ]
      },
      {
        id: 'git-topic-8-2-assess',
        title: 'Module 8 Graded Checkpoints',
        description: 'Module 8 Final Quiz and branch protection rules setup assignment.',
        estimatedDuration: '30 mins',
        learningUnits: [
          {
            id: 'git-unit-8-quiz',
            title: 'Module 8 Graded Quiz',
            description: '10 questions testing hotfix branch paths, Git Flow, and security rules.',
            duration: '15 mins',
            type: 'Quiz',
            quizPassingScore: 70,
            quizQuestions: createQuizQuestions(8)
          },
          {
            id: 'git-unit-8-assignment',
            title: 'Assignment: Setup Branch Rule',
            description: 'Enforce branch merge rules on main repository branch.',
            duration: '15 mins',
            type: 'Assignment',
            assignmentInstructions: `### Assignment Guidelines
1. In your GitHub repository, open the settings panel and select "Branches".
2. Add a branch protection rule for the \`main\` branch.
3. Check the rule "Require a pull request before merging" and check "Require approvals".
4. Capture a screenshot of the rule setup and upload it here.`,
            assignmentMaxMarks: 100
          }
        ]
      }
    ]
  }
];
