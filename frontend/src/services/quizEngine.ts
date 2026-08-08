export interface AIQuizQuestion {
  id: string;
  type: 'mcq' | 'tf' | 'ms' | 'blank' | 'short' | 'code';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options?: string[]; // for mcq & ms
  answer: string | string[]; // correct answer string or array of correct values
  explanation: string;
  learningTip?: string;
  relatedLessonLink?: string;
  topic: string;
  estTime: string;
}

export interface AIQuizConfig {
  numQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive';
  questionTypes: string[]; // e.g. ['mcq', 'tf', 'ms', 'blank', 'short', 'code']
  hasTimer: boolean;
  timeLimitSec?: number;
}

export interface AIQuizAttempt {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  config: AIQuizConfig;
  questions: AIQuizQuestion[];
  userAnswers: Record<string, string | string[]>; // questionId -> student answer
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  skippedAnswersCount: number;
  score: number; // percentage (0-100)
  timeTakenSeconds: number;
  timestamp: string;
  topicBreakdown: Record<string, { total: number; correct: number }>;
  difficultyBreakdown: Record<string, { total: number; correct: number }>;
  recommendations: {
    weakTopics: string[];
    reviewLessons: Array<{ id: string; title: string }>;
    practiceResources: string[];
    nextSteps: string[];
  };
}

export interface QuizGenerator {
  generateQuiz(
    courseId: string,
    courseTitle: string,
    lessonId: string,
    lessonTitle: string,
    lessonContent: string,
    config: AIQuizConfig
  ): Promise<AIQuizQuestion[]>;
}

export interface QuizEvaluator {
  evaluateAttempt(
    courseId: string,
    courseTitle: string,
    lessonId: string,
    lessonTitle: string,
    config: AIQuizConfig,
    questions: AIQuizQuestion[],
    userAnswers: Record<string, string | string[]>,
    timeTakenSeconds: number
  ): Promise<AIQuizAttempt>;
}

class MockQuizEngine implements QuizGenerator, QuizEvaluator {
  private storageKey = 'shaivika_quiz_attempts_all_v1';

  // High-fidelity pre-cooked questions for key topics
  private mockQuestionsPool: Record<string, AIQuizQuestion[]> = {
    // Linux Architecture concentric layers (lesson 1.1.3 or '103')
    '1.1.3': [
      // EASY
      {
        id: 'lin_e1',
        type: 'mcq',
        difficulty: 'Easy',
        question: 'Which of the following is responsible for translating command line strings into kernel execution orders?',
        options: ['Hardware', 'Shell', 'File System', 'BIOS'],
        answer: 'Shell',
        explanation: 'The shell functions as a user space command line interpreter, parsing text input and invoking the corresponding kernel system calls.',
        learningTip: 'Think of the shell as a translator standing between you and the operating system kernel.',
        relatedLessonLink: '1.2 Understanding Shell Architecture & Command Anatomy',
        topic: 'Shell Architecture',
        estTime: '30s'
      },
      {
        id: 'lin_e2',
        type: 'tf',
        difficulty: 'Easy',
        question: 'True or False: User applications run with absolute administrative CPU privileges (Ring 0) in standard Linux systems.',
        answer: 'False',
        explanation: 'User applications run in Ring 3 (User Space) with restricted access privileges to protect systems from application failures.',
        learningTip: 'CPU rings enforce execution containment; Ring 0 is reserved for the kernel.',
        relatedLessonLink: '1.1 Introduction to Unix & Linux Operating System Architecture',
        topic: 'Kernel Privilege Rings',
        estTime: '20s'
      },
      {
        id: 'lin_e3',
        type: 'blank',
        difficulty: 'Easy',
        question: 'The core of the Linux operating system which interacts directly with hardware is called the ________.',
        answer: 'kernel',
        explanation: 'The kernel is the core layer of the OS, managing hardware resources, process allocation, and system execution schedules.',
        learningTip: 'The kernel is the absolute heart of operating system layers.',
        relatedLessonLink: '1.1 Introduction to Unix & Linux Operating System Architecture',
        topic: 'Operating System Core',
        estTime: '30s'
      },
      // MEDIUM
      {
        id: 'lin_m1',
        type: 'mcq',
        difficulty: 'Medium',
        question: 'What is the correct transition mechanism from restricted User Mode to privileged Kernel Mode?',
        options: ['Direct memory mapping', 'Executing a system call (syscall)', 'Updating shell parameters', 'Triggering a hardware reboot'],
        answer: 'Executing a system call (syscall)',
        explanation: 'A system call is the standardized gatekeepers programmatic API. It triggers a software interrupt switching CPU privilege layers safely.',
        learningTip: 'Syscalls are the bridges across user/kernel privilege boundaries.',
        relatedLessonLink: '1.3 Practical Core Assignment: concentric Linux layers',
        topic: 'System Calls (Syscalls)',
        estTime: '45s'
      },
      {
        id: 'lin_m2',
        type: 'ms',
        difficulty: 'Medium',
        question: 'Select all components that execute in the protected Kernel space: (Select all that apply)',
        options: ['File system drivers', 'Process schedulers', 'BASH terminal shell', 'Network interface card drivers'],
        answer: ['File system drivers', 'Process schedulers', 'Network interface card drivers'],
        explanation: 'Drivers, process scheduling, and memory allocation execute in kernel space. Shell runs in user space.',
        learningTip: 'Kernel space executes code requiring direct raw hardware or memory pointers.',
        relatedLessonLink: '1.1 Introduction to Unix & Linux Operating System Architecture',
        topic: 'Space Allocation',
        estTime: '60s'
      },
      {
        id: 'lin_m3',
        type: 'code',
        difficulty: 'Medium',
        question: 'Write a bash command that prints only the counts and timings of system calls for running the command "ls".',
        answer: 'strace -c ls',
        explanation: 'The `strace` tool tracks syscall inputs/outputs. Adding the `-c` flag aggregates count and performance metrics.',
        learningTip: 'strace is the absolute primary diagnostic utility for debugging system calls.',
        relatedLessonLink: '1.3 Practical Core Assignment: concentric Linux layers',
        topic: 'System Call Diagnostics',
        estTime: '90s'
      },
      // HARD
      {
        id: 'lin_h1',
        type: 'mcq',
        difficulty: 'Hard',
        question: 'Which assembly instruction or interrupt vector is historically triggered on x86 architectures to execute a 32-bit Linux syscall?',
        options: ['int 0x80', 'sysenter', 'int 0x21', 'syscall'],
        answer: 'int 0x80',
        explanation: 'Historically, legacy x86 architectures utilized software interrupt `int 0x80` to transition control. Modern 64-bit systems utilize the `syscall` assembly instruction.',
        learningTip: 'Look at interrupt vector maps to see standard system handlers.',
        relatedLessonLink: '1.3 Practical Core Assignment: concentric Linux layers',
        topic: 'CPU Privilege Operations',
        estTime: '60s'
      },
      {
        id: 'lin_h2',
        type: 'blank',
        difficulty: 'Hard',
        question: 'What is the full name of the Mandatory Access Control (MAC) security module that enforces strict context labels on files and processes in RedHat systems?',
        answer: 'SELinux',
        explanation: 'Security-Enhanced Linux (SELinux) is a MAC kernel module enforcing context labels, restricting processes beyond default Unix permissions.',
        learningTip: 'SELinux stands for Security-Enhanced Linux.',
        relatedLessonLink: '1.3 Practical Core Assignment: concentric Linux layers',
        topic: 'Kernel Security MAC',
        estTime: '45s'
      },
      {
        id: 'lin_h3',
        type: 'mcq',
        difficulty: 'Hard',
        question: 'If a user application attempts to write directly to a kernel memory address without executing a syscall, what error is triggered by the hardware MMU?',
        options: ['Segmentation fault (SIGSEGV)', 'Invalid parameter exception', 'Null pointer dereference', 'Out of memory kernel panic'],
        answer: 'Segmentation fault (SIGSEGV)',
        explanation: 'The Memory Management Unit (MMU) checks CPU ring authorization. Unauthorized address accesses trigger hardware exceptions, mapping to SIGSEGV.',
        learningTip: 'MMU hardware enforcement prevents user space memory overrides.',
        relatedLessonLink: '1.1 Introduction to Unix & Linux Operating System Architecture',
        topic: 'Memory Protection',
        estTime: '60s'
      }
    ],

    // Git & GitHub Mastery pool
    'git-mastery': [
      {
        id: 'git_e1',
        type: 'mcq',
        difficulty: 'Easy',
        question: 'Which Git command initializes a new empty repository in the current directory?',
        options: ['git init', 'git create', 'git start', 'git new'],
        answer: 'git init',
        explanation: '`git init` creates a hidden `.git` subdirectory containing repository metadata.',
        learningTip: 'Use `git init` whenever creating a new local project repository.',
        topic: 'Repository Initialization',
        estTime: '20s'
      },
      {
        id: 'git_e2',
        type: 'tf',
        difficulty: 'Easy',
        question: 'True or False: The command `git add .` stages all modified and new untracked files for commit.',
        answer: 'True',
        explanation: '`git add .` recursively adds changes from the current working directory to the staging index.',
        learningTip: 'Check `git status` before committing to inspect staged files.',
        topic: 'Staging Area',
        estTime: '20s'
      },
      {
        id: 'git_e3',
        type: 'blank',
        difficulty: 'Easy',
        question: 'To record staged changes into repository history with a message, run `git ________ -m "message"`.',
        answer: 'commit',
        explanation: '`git commit` creates a snapshot commit object with author details and commit message.',
        learningTip: 'Write descriptive, imperative commit messages.',
        topic: 'Commit Snapshots',
        estTime: '20s'
      },
      {
        id: 'git_m1',
        type: 'mcq',
        difficulty: 'Medium',
        question: 'What is the main advantage of `git rebase` over `git merge` when updating a feature branch?',
        options: ['It creates a clean linear commit history without merge commits', 'It runs faster without network connectivity', 'It automatically resolves all merge conflicts', 'It encrypts commit signatures'],
        answer: 'It creates a clean linear commit history without merge commits',
        explanation: 'Rebasing rewires feature commits onto the tip of the upstream branch, creating a clean linear timeline.',
        learningTip: 'Never rebase public shared branches to prevent rewriting remote history.',
        topic: 'Branching & Merging',
        estTime: '45s'
      },
      {
        id: 'git_m2',
        type: 'ms',
        difficulty: 'Medium',
        question: 'Which commands safely store uncommitted local changes without losing work? (Select all that apply)',
        options: ['git stash', 'git stash pop', 'git reset --hard HEAD', 'git checkout -b temp-branch'],
        answer: ['git stash', 'git stash pop', 'git checkout -b temp-branch'],
        explanation: '`git stash` shelves changes, while creating a temp branch preserves commits. `git reset --hard` destroys uncommitted work!',
        learningTip: 'Use `git stash` to quickly switch branches without committing incomplete work.',
        topic: 'Worktree Stash & Branches',
        estTime: '45s'
      },
      {
        id: 'git_m3',
        type: 'code',
        difficulty: 'Medium',
        question: 'Write a Git command to fetch changes from all remotes and prune deleted remote-tracking branches.',
        answer: 'git fetch --all --prune',
        explanation: '`git fetch --all --prune` updates all remote refs and removes stale branch references.',
        learningTip: 'Pruning cleans up local tracking references for merged/deleted remote branches.',
        topic: 'Remote Repositories',
        estTime: '45s'
      },
      {
        id: 'git_h1',
        type: 'mcq',
        difficulty: 'Hard',
        question: 'Which Git command applies the exact changes introduced by a specific commit from another branch onto your current branch?',
        options: ['git cherry-pick <commit-hash>', 'git apply <commit-hash>', 'git merge-commit <commit-hash>', 'git rebase --onto <commit-hash>'],
        answer: 'git cherry-pick <commit-hash>',
        explanation: '`git cherry-pick` selects a single commit hash and applies its diff to your checked-out branch.',
        learningTip: 'Cherry-picking is ideal for backporting bug fixes to release branches.',
        topic: 'Cherry Pick & Patching',
        estTime: '60s'
      },
      {
        id: 'git_h2',
        type: 'code',
        difficulty: 'Hard',
        question: 'Write a Git command to start an interactive rebase for the last 4 commits.',
        answer: 'git rebase -i HEAD~4',
        explanation: '`git rebase -i HEAD~4` opens interactive rebase editor to squash, edit, or reorder the last 4 commits.',
        learningTip: 'Interactive rebase is essential for squashing WIP commits before submitting PRs.',
        topic: 'Interactive Rebase',
        estTime: '60s'
      }
    ],

    // Default Git configuration questions
    'git-config': [
      {
        id: 'git_cfg_e1',
        type: 'mcq',
        difficulty: 'Easy',
        question: 'Which file holds user global configurations for Git?',
        options: ['~/.gitconfig', '/etc/gitconfig', '.git/config', 'git.ini'],
        answer: '~/.gitconfig',
        explanation: 'Global settings are written in the user home directory under the hidden file `.gitconfig`.',
        learningTip: 'Tilde (~) represents the user home directory in Unix/Git Bash.',
        relatedLessonLink: '1.6 Git Configuration & Settings',
        topic: 'Git File Paradigm',
        estTime: '20s'
      },
      {
        id: 'git_cfg_m1',
        type: 'code',
        difficulty: 'Medium',
        question: 'Configure git to globally register the user email "student@shaivika.edu".',
        answer: 'git config --global user.email "student@shaivika.edu"',
        explanation: 'The `git config --global` statement sets parameters across all user repositories.',
        learningTip: 'Always configure your username and email before initiating commits.',
        relatedLessonLink: '1.6 Git Configuration & Settings',
        topic: 'Git Configuration Settings',
        estTime: '45s'
      },
      {
        id: 'git_cfg_h1',
        type: 'mcq',
        difficulty: 'Hard',
        question: 'What is the precedence structure of Git configuration files?',
        options: ['Local overrides Global, which overrides System', 'System overrides Global, which overrides Local', 'Global overrides Local, which overrides System', 'Local overrides System, which overrides Global'],
        answer: 'Local overrides Global, which overrides System',
        explanation: 'Git reads configurations starting at the System level (`/etc`), then Global (`~`), then Local (`.git/config`), with local overriding preceding layers.',
        learningTip: 'Local options are evaluated first during repository operations.',
        relatedLessonLink: '1.6 Git Configuration & Settings',
        topic: 'Precedence Architecture',
        estTime: '60s'
      }
    ]
  };

  getPoolForReference() {
    return this.mockQuestionsPool;
  }

  async generateQuiz(
    _courseId: string,
    courseTitle: string,
    _lessonId: string,
    lessonTitle: string,
    lessonContent: string,
    config: AIQuizConfig
  ): Promise<AIQuizQuestion[]> {
    // Simulate generation latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const courseLower = (courseTitle || '').toLowerCase();

    const isDatabase = courseLower.includes('database') || courseLower.includes('dbms') || courseLower.includes('sql');
    const isPython = courseLower.includes('python');
    const isJava = courseLower.includes('java');
    const isReact = courseLower.includes('react');
    const isGit = courseLower.includes('git') || courseLower.includes('github');
    
    const generated: AIQuizQuestion[] = [];
    
    if (isDatabase) {
      // 1. MCQ
      generated.push({
        id: `db_q_mcq_${Date.now()}`,
        type: 'mcq',
        difficulty: 'Easy',
        question: `In the context of the lesson "${lessonTitle}", which of the following is the primary purpose of this topic?`,
        options: [
          'Structuring and organizing relational schemas',
          'Improving read queries using clustered indexes',
          'Ensuring atomic transaction states',
          'Managing system process pipelines'
        ],
        answer: 'Structuring and organizing relational schemas',
        explanation: `The lesson "${lessonTitle}" centers around database schemas and SQL operations.`,
        topic: 'Database Administration',
        estTime: '30s'
      });
      
      // 2. SQL Coding
      generated.push({
        id: `db_q_code_${Date.now()}`,
        type: 'code',
        difficulty: 'Medium',
        question: `Write an SQL query to retrieve all active records from a table named 'users' where the column 'role' matches 'Student'.`,
        answer: "SELECT * FROM users WHERE role = 'Student'",
        explanation: 'The SELECT statement combined with WHERE clause filters matching tuples based on attribute criteria.',
        topic: 'SQL Data Retrieval',
        estTime: '60s'
      });
      
      // 3. Fill in the blanks
      generated.push({
        id: `db_q_blank_${Date.now()}`,
        type: 'blank',
        difficulty: 'Medium',
        question: `The SQL DDL statement used to remove a table schema structure permanently from a database is ________.`,
        answer: 'DROP TABLE',
        explanation: 'DROP TABLE completely removes the schema definition and all its data.',
        topic: 'SQL Schema Definition',
        estTime: '45s'
      });
      
      // 4. True/False
      generated.push({
        id: `db_q_tf_${Date.now()}`,
        type: 'tf',
        difficulty: 'Easy',
        question: `True or False: The UPDATE statement is a Data Definition Language (DDL) command in SQL.`,
        answer: 'False',
        explanation: 'UPDATE is a Data Manipulation Language (DML) statement, as it modifies data inside rows.',
        topic: 'SQL Command Types',
        estTime: '30s'
      });
      
      // 5. Database Design
      generated.push({
        id: `db_q_design_${Date.now()}`,
        type: 'mcq',
        difficulty: 'Hard',
        question: `When designing a relational database, which normalization form addresses transitively dependent attributes?`,
        options: [
          'First Normal Form (1NF)',
          'Second Normal Form (2NF)',
          'Third Normal Form (3NF)',
          'Boyce-Codd Normal Form (BCNF)'
        ],
        answer: 'Third Normal Form (3NF)',
        explanation: 'A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key.',
        topic: 'Database Normalization',
        estTime: '60s'
      });
    } else if (isPython) {
      generated.push({
        id: `py_q_mcq_${Date.now()}`,
        type: 'mcq',
        difficulty: 'Easy',
        question: `Which Python keyword is used to declare a functional block?`,
        options: ['function', 'def', 'void', 'define'],
        answer: 'def',
        explanation: 'In Python, functions are defined using the `def` keyword.',
        topic: 'Python Syntax',
        estTime: '20s'
      });
      generated.push({
        id: `py_q_code_${Date.now()}`,
        type: 'code',
        difficulty: 'Medium',
        question: `Write a print statement that outputs the text "Hello, Python!" to stdout.`,
        answer: 'print("Hello, Python!")',
        explanation: 'The built-in print() function writes text streams to console stdout.',
        topic: 'Python Output',
        estTime: '30s'
      });
      generated.push({
        id: `py_q_tf_${Date.now()}`,
        type: 'tf',
        difficulty: 'Easy',
        question: `True or False: Python requires explicit curly braces {} to define block scopes.`,
        answer: 'False',
        explanation: 'Python uses indentation to signify blocks instead of curly braces.',
        topic: 'Python Scope',
        estTime: '20s'
      });
    } else if (isJava) {
      generated.push({
        id: `ja_q_mcq_${Date.now()}`,
        type: 'mcq',
        difficulty: 'Easy',
        question: `Which command compiles a Java source file into JVM bytecode?`,
        options: ['java', 'javac', 'javadoc', 'javap'],
        answer: 'javac',
        explanation: '`javac` is the compiler CLI command producing .class files.',
        topic: 'Java Compilation',
        estTime: '30s'
      });
      generated.push({
        id: `ja_q_code_${Date.now()}`,
        type: 'code',
        difficulty: 'Medium',
        question: `Write the statement to print "Hello" in Java.`,
        answer: 'System.out.println("Hello");',
        explanation: 'System.out.println prints a line to standard console output.',
        topic: 'Java stdout',
        estTime: '40s'
      });
    } else if (isReact) {
      generated.push({
        id: `re_q_mcq_${Date.now()}`,
        type: 'mcq',
        difficulty: 'Easy',
        question: `Which React Hook is used to track and store local component state?`,
        options: ['useEffect', 'useState', 'useContext', 'useRef'],
        answer: 'useState',
        explanation: 'useState declares a state variable and state setter.',
        topic: 'React Hooks',
        estTime: '30s'
      });
      generated.push({
        id: `re_q_tf_${Date.now()}`,
        type: 'tf',
        difficulty: 'Easy',
        question: `True or False: React components can only return a single root JSX element.`,
        answer: 'True',
        explanation: 'JSX requires a single wrapper element or Fragment to reconcile.',
        topic: 'React JSX rules',
        estTime: '20s'
      });
    } else if (isGit) {
      generated.push({
        id: `git_q_mcq_${Date.now()}`,
        type: 'mcq',
        difficulty: 'Easy',
        question: `Which Git command is used to record staged snapshots into the local history logs?`,
        options: ['git push', 'git commit', 'git add', 'git stash'],
        answer: 'git commit',
        explanation: 'git commit saves staged changes locally.',
        topic: 'Git Commits',
        estTime: '25s'
      });
      generated.push({
        id: `git_q_code_${Date.now()}`,
        type: 'code',
        difficulty: 'Medium',
        question: `Write the Git command to check the active state and staged status of local workspace files.`,
        answer: 'git status',
        explanation: 'git status prints work tree differences.',
        topic: 'Git Status',
        estTime: '30s'
      });
    } else if (courseLower.includes('kubernetes') || courseLower.includes('k8s')) {
      generated.push({
        id: `k8s_q_mcq_${Date.now()}`,
        type: 'mcq',
        difficulty: 'Easy',
        question: `Which Kubernetes object is the smallest deployable unit that represents a single instance of a running process?`,
        options: ['Pod', 'Deployment', 'Service', 'ReplicaSet'],
        answer: 'Pod',
        explanation: 'A Pod is the basic execution unit of a Kubernetes application, encapsulating one or more containers.',
        topic: 'Kubernetes Objects',
        estTime: '30s'
      });
      generated.push({
        id: `k8s_q_code_${Date.now()}`,
        type: 'code',
        difficulty: 'Medium',
        question: `Write the kubectl command to retrieve a list of all Pods in the default namespace.`,
        answer: 'kubectl get pods',
        explanation: 'The get action retrieves resource lists, and pods specifies the Pod resource type.',
        topic: 'Kubectl CLI',
        estTime: '45s'
      });
      generated.push({
        id: `k8s_q_tf_${Date.now()}`,
        type: 'tf',
        difficulty: 'Easy',
        question: `True or False: A ClusterIP Service makes a Pod accessible from outside the Kubernetes cluster.`,
        answer: 'False',
        explanation: 'ClusterIP exposes the Service on a cluster-internal IP, making it only reachable from within the cluster.',
        topic: 'Kubernetes Networking',
        estTime: '30s'
      });
      generated.push({
        id: `k8s_q_blank_${Date.now()}`,
        type: 'blank',
        difficulty: 'Medium',
        question: `The command-line tool used to install and manage Kubernetes applications via charts is ________.`,
        answer: 'helm',
        explanation: 'Helm is the package manager for Kubernetes, using package definitions called charts.',
        topic: 'Kubernetes Package Management',
        estTime: '30s'
      });
    } else {
      // Linux default
      generated.push({
        id: `lin_q_mcq_${Date.now()}`,
        type: 'mcq',
        difficulty: 'Easy',
        question: `Which Linux command lists the contents of the current directory?`,
        options: ['pwd', 'cd', 'ls', 'mkdir'],
        answer: 'ls',
        explanation: 'ls lists files in standard format.',
        topic: 'Linux Navigation',
        estTime: '20s'
      });
      generated.push({
        id: `lin_q_code_${Date.now()}`,
        type: 'code',
        difficulty: 'Medium',
        question: `Write the Linux CLI command to print the absolute path of the current active working directory.`,
        answer: 'pwd',
        explanation: 'pwd prints active path.',
        topic: 'Linux Paths',
        estTime: '30s'
      });
    }
    
    // Dynamic question parser from lesson content if it has sentences
    const cleanContent = (lessonContent || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*`>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const sentences = cleanContent.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 25);
    
    if (sentences.length > 0) {
      const sentence = sentences[0];
      const words = sentence.split(' ');
      if (words.length > 8) {
        const blankWordIndex = Math.floor(words.length / 2);
        const blankWord = words[blankWordIndex].replace(/[^a-zA-Z]+/g, '');
        if (blankWord.length > 3) {
          words[blankWordIndex] = '________';
          const questionText = words.join(' ') + '.';
          generated.push({
            id: `dyn_q_blank_${Date.now()}`,
            type: 'blank',
            difficulty: 'Medium',
            question: `Based on the lesson content: "${questionText}"`,
            answer: blankWord,
            explanation: `The sentence directly from the lesson text states: "${sentence}".`,
            topic: 'Lesson Comprehension',
            estTime: '45s'
          });
        }
      }
    }
    
    // Fill up to the requested volume by copying or returning generated questions
    let results: AIQuizQuestion[] = [];
    let attempts = 0;
    const shuffledPool = this._shuffleArray(generated);
    while (results.length < config.numQuestions && attempts < 10) {
      shuffledPool.forEach((q, idx) => {
        if (results.length < config.numQuestions) {
          results.push({
            ...q,
            id: `${q.id}_gen_${results.length}_${idx}`
          });
        }
      });
      attempts++;
    }
    
    return results;
  }

  async evaluateAttempt(
    courseId: string,
    courseTitle: string,
    lessonId: string,
    lessonTitle: string,
    config: AIQuizConfig,
    questions: AIQuizQuestion[],
    userAnswers: Record<string, string | string[]>,
    timeTakenSeconds: number
  ): Promise<AIQuizAttempt> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    const topicBreakdown: Record<string, { total: number; correct: number }> = {};
    const difficultyBreakdown: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q) => {
      const studentAns = userAnswers[q.id];
      const correctAns = q.answer;

      // Initialize structures
      if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { total: 0, correct: 0 };
      if (!difficultyBreakdown[q.difficulty]) difficultyBreakdown[q.difficulty] = { total: 0, correct: 0 };

      topicBreakdown[q.topic].total += 1;
      difficultyBreakdown[q.difficulty].total += 1;

      if (studentAns === undefined || studentAns === '' || (Array.isArray(studentAns) && studentAns.length === 0)) {
        skipped += 1;
      } else {
        const isMatched = this.compareAnswers(studentAns, correctAns);
        if (isMatched) {
          correct += 1;
          topicBreakdown[q.topic].correct += 1;
          difficultyBreakdown[q.difficulty].correct += 1;
        } else {
          incorrect += 1;
        }
      }
    });

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

    // Formulate recommendations
    const weakTopics: string[] = [];
    Object.entries(topicBreakdown).forEach(([topic, stats]) => {
      if (stats.correct / stats.total < 0.7) {
        weakTopics.push(topic);
      }
    });

    // Populate default lists
    const reviewLessons = [
      { id: '101', title: '1.1 Introduction to Unix & Linux Operating System Architecture' },
      { id: '102', title: '1.2 Understanding Shell Architecture & Command Anatomy' }
    ];
    const practiceResources = [
      'Interactive Linux Terminal Shell Sandbox Exercises',
      'SELinux Security Context Reference Guides'
    ];
    const nextSteps = [
      'Advance to Module 1.4: Creating & Deleting files',
      'Attempt the Practical concentric layered graded assignment'
    ];

    const recommendations = {
      weakTopics: weakTopics.length > 0 ? weakTopics : ['Advanced Memory Privilege Enforcement'],
      reviewLessons,
      practiceResources,
      nextSteps
    };

    const attempt: AIQuizAttempt = {
      id: `attempt_${Date.now()}`,
      courseId,
      courseTitle,
      lessonId,
      lessonTitle,
      config,
      questions,
      userAnswers,
      correctAnswersCount: correct,
      incorrectAnswersCount: incorrect,
      skippedAnswersCount: skipped,
      score,
      timeTakenSeconds,
      timestamp: new Date().toISOString(),
      topicBreakdown,
      difficultyBreakdown,
      recommendations
    };

    // Save to history
    this.saveAttemptToHistory(attempt);

    return attempt;
  }

  // Helper validation comparator
  private compareAnswers(student: string | string[], correct: string | string[]): boolean {
    if (Array.isArray(student) && Array.isArray(correct)) {
      if (student.length !== correct.length) return false;
      const sortedStudent = [...student].sort();
      const sortedCorrect = [...correct].sort();
      return sortedStudent.every((val, idx) => val.toLowerCase().trim() === sortedCorrect[idx].toLowerCase().trim());
    }

    if (!Array.isArray(student) && !Array.isArray(correct)) {
      return student.toLowerCase().trim() === correct.toLowerCase().trim();
    }

    return false;
  }

  // Shuffle questions helper
  private _shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Local Storage attempts history list manager
  private saveAttemptToHistory(attempt: AIQuizAttempt) {
    let list: AIQuizAttempt[] = [];
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) list = JSON.parse(stored);
    } catch {}

    list.unshift(attempt); // prepend newest
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  public getHistory(): AIQuizAttempt[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public clearHistory() {
    localStorage.removeItem(this.storageKey);
  }
}

export const mockQuizEngine = new MockQuizEngine();
export const quizService = mockQuizEngine; // Alias helper
