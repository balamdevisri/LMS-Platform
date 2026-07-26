export interface AIChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface LessonSummary {
  keyConcepts: string[];
  importantPoints: string[];
  commonMistakes: string[];
  revisionNotes: string[];
  learningObjectives: string[];
}

export interface PracticeQuestion {
  id: string;
  type: 'mcq' | 'short_answer' | 'coding' | 'scenario';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  options?: string[]; // only for mcq
  answer: string;
  explanation: string;
}

export interface InterviewPrepQuestion {
  id: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  sampleAnswer: string;
}

export interface SmartRecommendations {
  reviewLessons: Array<{ id: string; title: string }>;
  nextLessons: Array<{ id: string; title: string }>;
  relatedTopics: string[];
  practiceSuggestions: string[];
}

export interface AIProvider {
  sendMessage(
    message: string,
    history: AIChatMessage[],
    context: {
      courseId: string;
      courseTitle: string;
      moduleId?: string;
      moduleTitle?: string;
      topicId?: string;
      topicTitle?: string;
      lessonId?: string;
      lessonTitle?: string;
      lessonType?: string;
      lessonContent?: string;
    }
  ): Promise<string>;

  generateSummary(lessonId: string, lessonTitle: string, content: string): Promise<LessonSummary>;

  generatePracticeQuestions(lessonId: string, lessonTitle: string, content: string): Promise<PracticeQuestion[]>;

  generateInterviewPrep(lessonId: string, lessonTitle: string, content: string): Promise<InterviewPrepQuestion[]>;

  generateRecommendations(
    lessonId: string,
    lessonTitle: string,
    completedUnitIds: string[]
  ): Promise<SmartRecommendations>;
}

class MockAIProvider implements AIProvider {
  async sendMessage(
    message: string,
    _history: AIChatMessage[],
    context: {
      courseId: string;
      courseTitle: string;
      moduleId?: string;
      moduleTitle?: string;
      topicId?: string;
      topicTitle?: string;
      lessonId?: string;
      lessonTitle?: string;
      lessonType?: string;
      lessonContent?: string;
    }
  ): Promise<string> {
    // Simulate thinking delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const query = message.toLowerCase().trim();
    const topic = context.lessonTitle || 'the lesson';

    // 1. Check for specific quick triggers
    if (query.includes('explain this lesson') || query.includes('explain the lesson')) {
      return `Here is a detailed explanation of "**${topic}**":\n\nThis lesson covers core concepts in ${context.courseTitle}. In systems engineering, understanding the configuration paradigms and execution sequences is crucial. \n\nKey takeaways include:\n1. Establishing proper permissions and settings.\n2. Running diagnostic tests using local sandboxes.\n3. Analyzing output streams for error logs.\n\nWould you like me to go deeper into any particular system call, permission settings, or configurations?`;
    }

    if (query.includes('simplify this topic') || query.includes('simplify')) {
      return `Let's break down "**${topic}**" into simple terms using an analogy:\n\nThink of the system as a secure library. \n- The **Kernel** is the library headquarter vault where the books are stored.\n- The **System Call** is the request form you write to borrow a book.\n- The **Shell** is the receptionist who translates your plain English request into the vault's numeric code.\n- The **User space** is the reading room where you get to browse.\n\nThis division ensures that readers don't accidentally walk into the vault and mess up the filing system!`;
    }

    if (query.includes('real-world examples') || query.includes('real world')) {
      return `Here are some real-world production use cases of the concepts taught in "**${topic}**":\n\n1. **Automated Server Scaling**: DevOps engineers write automated bash scheduling configurations (` + "`crontab`" + `) to run resource diagnostic checks and spin up backup mirrors.\n2. **Security Audits**: Security teams check log streams to identify unauthorized ssh attempts by parsing logs with search tools like ` + "`grep`" + `.\n3. **Permission Hardening**: Limiting SSH private key access (using ` + "`chmod 600`" + `) prevents other users on a shared machine from extracting keys and gaining remote access.`;
    }

    if (query.includes('what should i learn next') || query.includes('learn next')) {
      return `Based on your progress in **${context.courseTitle}**, here is your recommended path:\n\n1. **Review**: Check if you have configured permissions or credentials correctly on recent labs.\n2. **Next Milestone**: Dive into automation scripting and daemons. Knowing how to write control flows and manage services makes troubleshooting twice as fast.\n3. **Practical Challenge**: Launch the terminal sandbox and write a loop script that monitors background process signals.`;
    }

    // 2. Check general educational queries
    if (query.includes('react hooks') || query.includes('react hook')) {
      return `**React Hooks** (introduced in React 16.8) are functions that let you "hook into" React state and lifecycle features from function components. They eliminate the need for class components.\n\n**Common Hooks**:\n- ` + "`useState`" + `: Preserves state values across renders.\n- ` + "`useEffect`" + `: Handles side effects (fetching data, listening to events, subscriptions).\n- ` + "`useContext`" + `: Consumes values from React Context.\n- ` + "`useMemo`" + ` / ` + "`useCallback`" + `: Cache calculations and functions for performance optimization.`;
    }

    if (query.includes('dependency injection')) {
      return `**Dependency Injection (DI)** is a software design pattern where an object receives other objects (dependencies) that it helper-relies on, rather than instantiating them internally.\n\n**Benefits**:\n- **Decoupling**: Classes don't need to know how to construct their dependencies.\n- **Testability**: You can easily inject mock implementations (like this MockAIProvider!) during testing.\n- **Maintainability**: Swapping concrete classes (e.g., switching from Local Storage to Firestore) requires editing only the config binder, not the workspace pages.`;
    }

    if (query.includes('algorithm') && (query.includes('o(n log n)') || query.includes('log'))) {
      return `An algorithm with a time complexity of **O(n log n)** represents a logarithmic linear complexity. It is the gold standard for sorting algorithms.\n\n**How it works**:\n- The **log n** part comes from a divide-and-conquer approach, dividing the problem in half at each step (e.g., binary tree height).\n- The **n** part comes from doing linear work at each level of the tree (e.g., merging sorted lists).\n\n**Examples**:\n- Merge Sort\n- Quick Sort (average case)\n- Heap Sort`;
    }

    if (query.includes('shebang') || query.includes('#!/bin/bash')) {
      return `The shebang (\`#!/bin/bash\`) at the top of a script is an instruction pointing to the path of the interpreter to run the script. In Linux systems, when you execute a file \`./script.sh\`, the kernel reads the shebang line and invokes \`/bin/bash\` to parse the statements.`;
    }

    // Default contextual answer
    return `Regarding your question about "**${message}**" in the context of "**${topic}**":\n\nTo apply this to your studies, remember that system logs, command arguments, and security parameters play a key role. \n\nFor example, if you are working on terminal exercises, ensure you check file ownership settings using \`ls -la\` and edit file permissions using \`chmod\`. \n\nLet me know if you would like me to generate practice questions, summarize the concepts, or provide code examples for this!`;
  }

  async generateSummary(lessonId: string, lessonTitle: string, _content: string): Promise<LessonSummary> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Custom summaries for key lessons
    if (lessonId === '1.1.3' || lessonTitle.toLowerCase().includes('concentric')) {
      return {
        keyConcepts: [
          'Concentric Layered Security Rings: Hardware, Kernel, Shell, User space.',
          'System Calls (Syscalls): The protected bridge between User programs and the Kernel.',
          'Kernel Mode vs User Mode execution privilege rings.'
        ],
        importantPoints: [
          'The Kernel executes in Ring 0 with raw hardware permissions.',
          'User utilities (like browsers or text editors) run in Ring 3 with restricted access.',
          'The Shell acts as the command line translator, converting string arguments into binary actions.'
        ],
        commonMistakes: [
          'Confusing the Shell for the Kernel: The shell is just a user program, not the core operating system.',
          'Writing programs that bypass syscall vectors: Direct hardware access is blocked by CPU privilege levels.'
        ],
        revisionNotes: [
          'Run `strace -c` on any command to view the count and duration of system calls executed.',
          'User applications call libc library functions, which in turn trigger actual assembly-level syscall instructions.'
        ],
        learningObjectives: [
          'Map the 4 layers of typical Linux OS architectures.',
          'Explain how user space instructions request kernel assistance.',
          'Perform diagnostic traces on common system commands.'
        ]
      };
    }

    // Default template-based summaries
    return {
      keyConcepts: [
        `Core principles of ${lessonTitle}.`,
        'Structuring correct configurations and commands.',
        'Analyzing outcomes and system outputs.'
      ],
      importantPoints: [
        'Always verify syntax arguments before executing scripts.',
        'Proper execution context requires checking system directories.',
        'Local changes should be staged, committed, and monitored.'
      ],
      commonMistakes: [
        'Running scripts with root privileges unnecessarily.',
        'Neglecting to review error output streams (stderr).'
      ],
      revisionNotes: [
        'Consult man pages (e.g. `man grep`) to inspect options flags.',
        `Review the prompt description guidelines for ${lessonTitle}.`
      ],
      learningObjectives: [
        `Understand the fundamental concepts of ${lessonTitle}.`,
        'Apply configuration settings correctly in local systems.',
        'Troubleshoot environment or parameter divergences.'
      ]
    };
  }

  async generatePracticeQuestions(lessonId: string, lessonTitle: string, _content: string): Promise<PracticeQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (lessonId === '1.1.3' || lessonTitle.toLowerCase().includes('concentric')) {
      return [
        {
          id: 'q_1',
          type: 'mcq',
          difficulty: 'Beginner',
          question: 'In which CPU execution ring does the Linux Kernel run?',
          options: ['Ring 3', 'Ring 1', 'Ring 0', 'Ring 2'],
          answer: 'Ring 0',
          explanation: 'The Kernel executes in Ring 0 (Supervisor Mode) where it has unrestricted access to CPU instructions and system memory.'
        },
        {
          id: 'q_2',
          type: 'coding',
          difficulty: 'Intermediate',
          question: 'Write a basic shell command to trace system calls and count them for the execution of "ls -la".',
          answer: 'strace -c ls -la',
          explanation: 'The `strace` tool is used to trace system calls. The `-c` flag summarizes the counts, errors, and timing of each syscall.'
        },
        {
          id: 'q_3',
          type: 'scenario',
          difficulty: 'Advanced',
          question: 'An application is trying to write to a log file but fails with "Operation not permitted" despite having correct write permissions. What kernel security layer might be blocking this?',
          answer: 'SELinux or AppArmor MAC rules',
          explanation: 'Even with standard DAC permissions, Mandatory Access Control (MAC) layers like SELinux or AppArmor can block operations on specific paths.'
        }
      ];
    }

    return [
      {
        id: 'pq_1',
        type: 'mcq',
        difficulty: 'Beginner',
        question: `What is the primary objective of ${lessonTitle}?`,
        options: ['Automating system setup', 'Configuring parameters', 'Understanding core concepts', 'Replacing local databases'],
        answer: 'Understanding core concepts',
        explanation: 'Familiarizing yourself with core concepts is the foundation for successfully configuring local settings.'
      },
      {
        id: 'pq_2',
        type: 'short_answer',
        difficulty: 'Intermediate',
        question: `How should you verify that configurations for ${lessonTitle} are correct?`,
        answer: 'Run local test scripts and inspect output streams.',
        explanation: 'Inspecting outputs and diagnostics is the best way to verify system parameters.'
      }
    ];
  }

  async generateInterviewPrep(lessonId: string, lessonTitle: string, _content: string): Promise<InterviewPrepQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (lessonId === '1.1.3' || lessonTitle.toLowerCase().includes('concentric')) {
      return [
        {
          id: 'int_1',
          difficulty: 'Beginner',
          question: 'What is a system call (syscall)? Provide an example.',
          sampleAnswer: 'A system call is an programmatic interface that allows user-space programs to request services from the operating system kernel. Examples include `sys_read` to read a file, `sys_write` to output text, and `sys_fork` to create a new process.'
        },
        {
          id: 'int_2',
          difficulty: 'Intermediate',
          question: 'Explain the difference between user space and kernel space.',
          sampleAnswer: 'User space is the memory area where user applications execute with restricted privileges (Ring 3) to prevent system crashes. Kernel space is the protected memory area where the core operating system runs with high privileges (Ring 0), managing CPU, memory, and devices.'
        },
        {
          id: 'int_3',
          difficulty: 'Advanced',
          question: 'What happens at the hardware level when a system call is made?',
          sampleAnswer: 'The CPU switches from User Mode to Kernel Mode by executing a software interrupt instruction (like `syscall` or `int 0x80`). This transfers control to the kernel interrupt vector table, saves the CPU state, processes the syscall, and then switches back to User Mode.'
        }
      ];
    }

    return [
      {
        id: 'iint_1',
        difficulty: 'Beginner',
        question: `Why is ${lessonTitle} important in a production codebase?`,
        sampleAnswer: `It ensures clean, modular configurations that prevent developers from introducing regression bugs and makes troubleshooting faster.`
      },
      {
        id: 'iint_2',
        difficulty: 'Intermediate',
        question: `What are some best practices when configuring ${lessonTitle}?`,
        sampleAnswer: 'Document options flags, keep security variables restricted in local configurations, and test setups in virtual sandboxes before pushing.'
      }
    ];
  }

  async generateRecommendations(
    lessonId: string,
    lessonTitle: string,
    _completedUnitIds: string[]
  ): Promise<SmartRecommendations> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const isGit = lessonId.startsWith('git') || lessonTitle.toLowerCase().includes('git');

    if (isGit) {
      return {
        reviewLessons: [
          { id: 'git-les-106', title: '1.6 Git Configuration' },
          { id: 'git-les-107', title: '1.7 SSH Keys Setup' }
        ],
        nextLessons: [
          { id: 'git-les-114', title: '1.14 git log' },
          { id: 'git-les-115', title: '1.15 git diff' }
        ],
        relatedTopics: ['VCS Branching Strategies', 'Resolving Commit Conflicts', 'Forking PR workflows'],
        practiceSuggestions: [
          'Configure a custom git editor alias in your config.',
          'Execute a git commit with a detailed multi-line message.'
        ]
      };
    }

    return {
      reviewLessons: [
        { id: '101', title: '1.1 Introduction to Unix & Linux Operating System Architecture' },
        { id: '102', title: '1.2 Understanding Shell Architecture & Command Anatomy' }
      ],
      nextLessons: [
        { id: '104', title: '1.4 Creating, Copying, Moving & Deleting Files' },
        { id: '105', title: '1.5 Quiz & Hands-on Terminal Practice' }
      ],
      relatedTopics: ['Linux Directory Standards (FHS)', 'File Permissions (chmod)', 'Standard Input/Output Redirection'],
      practiceSuggestions: [
        'Run `ls -la /usr/bin` to inspect user utilities permissions.',
        'Use `strace ls` inside your terminal to view syscall operations.'
      ]
    };
  }
}

export const mockAIProvider = new MockAIProvider();
