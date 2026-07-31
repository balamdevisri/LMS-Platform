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

  async generateQuiz(
    courseId: string,
    courseTitle: string,
    _lessonId: string,
    lessonTitle: string,
    _lessonContent: string,
    config: AIQuizConfig
  ): Promise<AIQuizQuestion[]> {
    // Simulate generation latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const cTitleLower = (courseTitle || '').toLowerCase();
    const cIdLower = (courseId || '').toLowerCase();
    const lTitleLower = (lessonTitle || '').toLowerCase();

    let pool: AIQuizQuestion[] = [];

    // Course-specific matching logic
    if (cTitleLower.includes('git') || cIdLower.includes('git')) {
      pool = [...this.mockQuestionsPool['git-mastery'], ...this.mockQuestionsPool['git-config']];
    } else if (cTitleLower.includes('linux') || cIdLower.includes('linux') || lTitleLower.includes('concentric')) {
      pool = [...this.mockQuestionsPool['1.1.3']];
    } else {
      pool = [...this.mockQuestionsPool['1.1.3'], ...this.mockQuestionsPool['git-mastery']];
    }

    // Filter by type & difficulty if specified (not Adaptive)
    let filtered = [...pool];

    if (config.difficulty !== 'Adaptive') {
      filtered = filtered.filter((q) => q.difficulty === config.difficulty);
    }

    // Filter by question types if filtered is empty or configured
    if (config.questionTypes.length > 0) {
      const typesSet = new Set(config.questionTypes);
      const matched = filtered.filter((q) => typesSet.has(q.type));
      if (matched.length > 0) filtered = matched;
    }

    // Shuffle and pick requested number of questions
    filtered = this.shuffleArray(filtered);

    // If pool is smaller than requested, clone and customize IDs to prevent shortages
    let results: AIQuizQuestion[] = [];
    while (results.length < config.numQuestions) {
      const remaining = config.numQuestions - results.length;
      const slice = filtered.slice(0, remaining).map((q, idx) => ({
        ...q,
        id: `${q.id}_gen_${results.length}_${idx}`
      }));
      results = [...results, ...slice];
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
  private shuffleArray<T>(array: T[]): T[] {
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
