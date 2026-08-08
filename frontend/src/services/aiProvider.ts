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
  formulaSheet?: string[];
}

export interface PracticeQuestion {
  id: string;
  type: 'mcq' | 'tf' | 'fib' | 'coding' | 'scenario';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  options?: string[]; // for mcq & tf
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

export interface AIFlashcard {
  id: string;
  term: string;
  definition: string;
}

export interface WeakTopicItem {
  topic: string;
  score: number;
  timeSpentMins: number;
  struggleReason: string;
  remedyAction: string;
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
  
  // Newly Added Capabilities
  generateTeluguExplanation(lessonTitle: string, content: string): Promise<string>;
  generateEnglishExplanation(lessonTitle: string, content: string): Promise<string>;
  generateBeginnerExplanation(lessonTitle: string, content: string): Promise<string>;
  generateAdvancedExplanation(lessonTitle: string, content: string): Promise<string>;
  generateExamplesExplanation(lessonTitle: string, content: string): Promise<string>;
  generateFlashcards(lessonId: string, lessonTitle: string): Promise<AIFlashcard[]>;
  generateQuizByType(lessonId: string, lessonTitle: string, type: 'mcq' | 'tf' | 'fib' | 'coding'): Promise<PracticeQuestion[]>;
  getWeakTopicAnalysis(userId: string): Promise<WeakTopicItem[]>;
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
    await new Promise((resolve) => setTimeout(resolve, 800));

    const query = message.toLowerCase().trim();
    const topic = context.lessonTitle || 'the lesson';

    const lastCode = typeof window !== 'undefined' ? localStorage.getItem('shaivika_last_active_code') : null;
    const lastLang = typeof window !== 'undefined' ? localStorage.getItem('shaivika_last_active_language') || 'javascript' : 'javascript';

    // Practice Lab code overrides
    if (query.includes('explain my code') || query.includes('explain code')) {
      if (!lastCode) return "I couldn't find any active code in your Practice Lab. Try writing or loading some code first!";
      return `### AI Code Review (${lastLang.toUpperCase()})\n\n\`\`\`${lastLang}\n${lastCode}\n\`\`\`\n\n1. **Architecture**: Implements clean algorithmic modular components.\n2. **Flow**: Linear parameter mapping and loop validations.\n\nLet me know if you would like me to optimize this code or find bugs!`;
    }

    if (query.includes('find bugs') || query.includes('bugs in my code')) {
      if (!lastCode) return "No code detected. Please write code in the Practice Lab editor.";
      return `### AI Bug Inspection (${lastLang.toUpperCase()})\n\n\`\`\`${lastLang}\n${lastCode}\n\`\`\`\n\n- **Edge cases**: Verify your null/empty constraints.\n- **Syntax check**: All statements are closed. No active syntactic errors detected.`;
    }

    if (query.includes('suggest optimizations') || query.includes('optimize my code')) {
      if (!lastCode) return "No code detected to optimize.";
      return `### AI Code Optimizations (${lastLang.toUpperCase()})\n\n- **Pre-allocation**: Allocate static array sizes beforehand to reduce GC cycles.\n- **Exit early**: Stop loop execution once your match criteria are satisfied.`;
    }

    if (query.includes('time complexity')) {
      return `### AI Time Complexity\n\nYour current solution processes inputs in **O(N)** linear complexity.`;
    }

    if (query.includes('space complexity')) {
      return `### AI Space Complexity\n\nYour current solution operates with **O(1)** auxiliary space.`;
    }

    // Contextual responses
    if (query.includes('explain this lesson') || query.includes('explain the lesson')) {
      return `### Lesson Breakdown: **${topic}**\n\nThis lesson introduces core paradigms of **${context.courseTitle}**.\n\nKey Concepts:\n1. **Setup Rules**: Ensure directory parameters are correctly initialized.\n2. **Diagnostic Telemetry**: Run commands inside simulated terminals.\n3. **Safety Verification**: Ensure proper permissions are assigned.\n\nWould you like me to translate this to Telugu or show real-world examples?`;
    }

    if (query.includes('telugu') || query.includes('te')) {
      return await this.generateTeluguExplanation(topic, context.lessonContent || '');
    }

    if (query.includes('simplify') || query.includes('beginner')) {
      return await this.generateBeginnerExplanation(topic, context.lessonContent || '');
    }

    if (query.includes('advanced')) {
      return await this.generateAdvancedExplanation(topic, context.lessonContent || '');
    }

    if (query.includes('example') || query.includes('real world')) {
      return await this.generateExamplesExplanation(topic, context.lessonContent || '');
    }

    return `Regarding your query about "**${message}**" in the context of "**${topic}**":\n\nWe cover parameter setups, shell diagnostic instructions, and validation scripts.\n\nKey commands to verify:\n- \`ls -la\` to trace file attributes.\n- \`chmod\` to handle security parameters.\n\nLet me know if you would like me to compile notes, flashcards, or a practice quiz for this topic!`;
  }

  async generateTeluguExplanation(lessonTitle: string, _content: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return `### 🌟 తెలుగులో వివరణ (Telugu Explanation) - **${lessonTitle}**\n\nనమస్కారం! ఈ పాఠాన్ని మన తెలుగు భాషలో సులభంగా అర్థం చేసుకుందాం:\n\n1. **ముఖ్యమైన భావన (Core Concept)**: ఈ టాపిక్ మన సిస్టమ్స్ లేదా ప్రోగ్రామింగ్ యొక్క పునాదిని వివరిస్తుంది. \n2. **ఎలా పనిచేస్తుంది (How it Works)**:\n   - యూజర్ ఇచ్చే ఇన్పుట్ లేదా కమాండ్ను సిస్టమ్ అర్థం చేసుకుని, ప్రాసెస్ చేస్తుంది.\n   - కమాండ్ లైన్ (\`CLI\`) ఉపయోగించి మనం సిస్టమ్తో వేగంగా సంభాషించవచ్చు.\n3. **నిజ జీవిత ఉదాహరణ (Real-world Example)**: మనం ఒక బ్యాంకు కౌంటర్కు వెళ్లి రిక్వెస్ట్ ఫామ్ ఇచ్చినట్లు, సిస్టమ్ కాల్ కూడా ఓఎస్ కెర్నల్కు అభ్యర్థనను పంపుతుంది.\n\nమీకు ఇంకా ఏదైనా సందేహం ఉంటే అడగండి, నేను సహాయం చేస్తాను!`;
  }

  async generateEnglishExplanation(lessonTitle: string, _content: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `### 📘 English Explanation - **${lessonTitle}**\n\nHere is a clear and professional conceptual overview of **${lessonTitle}**:\n\n1. **Primary Intent**: Establishes structural guidelines and processes for this syllabus area.\n2. **Execution Process**: Requests are captured, validated, and translated into system execution sequences.\n3. **Best Practices**: Keep scripts modular, restrict security contexts, and verify execution output codes regularly.`;
  }

  async generateBeginnerExplanation(lessonTitle: string, _content: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 550));
    return `### 👶 Beginner Mode: Simple Analogy for **${lessonTitle}**\n\nLet's keep it simple! Imagine you are at a restaurant:\n- **You** are the customer (User Space).\n- **The Waiter** is the translator (Shell / System Call).\n- **The Kitchen** is the locked vault where the food is prepared (Kernel / Operating System).\n\nYou cannot go directly into the kitchen to make food. You tell the waiter what you want, and the waiter safely fetches it from the kitchen. This is exactly how user programs request data from the OS kernel!`;
  }

  async generateAdvancedExplanation(lessonTitle: string, _content: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return `### 🚀 Advanced Mode: Deep Dive Architecture for **${lessonTitle}**\n\nAnalyzing micro-architecture mechanics:\n- **Privilege Transition**: Transfers control from ring 3 to ring 0 via software trap vectors (\`int 0x80\` or \`syscall\` instruction).\n- **Context Saving**: CPU registers are saved to the kernel stack.\n- **Vector Dispatch**: The system call handler queries the syscall dispatch table to find the requested function pointer.\n- **MMU Isolation**: Ensures memory pages remain strictly bounded between virtual spaces.`;
  }

  async generateExamplesExplanation(lessonTitle: string, _content: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `### 💡 Practical Real-World Examples - **${lessonTitle}**\n\n1. **Cloud Orchestration**: Automating micro-instance checks using bash scripts that run telemetry monitoring commands.\n2. **Security Audits**: Scanning authentication authorization access logs with tools like \`grep\` or \`awk\` to find failed logins.\n3. **Storage Quota Enforcement**: Creating user permissions and directory access rights to prevent data corruption.`;
  }

  async generateSummary(_lessonId: string, lessonTitle: string, _content: string): Promise<LessonSummary> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      keyConcepts: [
        `Core architectures of ${lessonTitle}.`,
        'Safe parameter values and system directory hierarchies.',
        'Analyzing standard outputs and diagnosing error exceptions.'
      ],
      importantPoints: [
        'Always check permissions using ls -la before executing local shell scripts.',
        'Redirect stderr streams using 2> to log error files separately.',
        'Staging and committing files helps maintain clean version histories.'
      ],
      commonMistakes: [
        'Bypassing system call interfaces unnecessarily.',
        'Executing shell scripts with elevated sudo permissions unless required.'
      ],
      revisionNotes: [
        'Run man <command> (e.g. man chmod) to look up options and parameters.',
        'Inspect trace logs with strace to audit system requests.'
      ],
      learningObjectives: [
        `Identify system calls and layer boundaries in ${lessonTitle}.`,
        'Verify configurations using local virtual terminal sandboxes.',
        'Troubleshoot network parameters and script loops.'
      ],
      formulaSheet: [
        'DAC Permissions Octal Model: Read (4) + Write (2) + Execute (1)',
        'Redirections: > (Overwrite), >> (Append), 2> (Error redirect), &> (All outputs)',
        'Git Cycle: git add (Index) -> git commit (Local DB) -> git push (Remote server)'
      ]
    };
  }

  async generatePracticeQuestions(_lessonId: string, lessonTitle: string, _content: string): Promise<PracticeQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return [
      {
        id: 'pq_1',
        type: 'mcq',
        difficulty: 'Beginner',
        question: `What is the primary utility of ${lessonTitle}?`,
        options: ['Automating workflows', 'Understanding key architectures', 'Consuming network data', 'Structuring file metadata'],
        answer: 'Understanding key architectures',
        explanation: 'Acquiring an architectural understanding is the first step towards configuring safe system environments.'
      },
      {
        id: 'pq_2',
        type: 'tf',
        difficulty: 'Beginner',
        question: `True or False: System commands run in Ring 0 supervisor mode at all times.`,
        options: ['True', 'False'],
        answer: 'False',
        explanation: 'User space utilities run in Ring 3 (restricted mode). Only the core kernel runs in Ring 0 supervisor mode.'
      },
      {
        id: 'pq_3',
        type: 'fib',
        difficulty: 'Intermediate',
        question: `The command used to alter file and directory permissions in Linux is ______.`,
        answer: 'chmod',
        explanation: 'The `chmod` command (change mode) modifies permission access rights for owners, groups, and others.'
      },
      {
        id: 'pq_4',
        type: 'coding',
        difficulty: 'Advanced',
        question: `Write a bash command that prints the time complexity of compiling an app.`,
        answer: 'time make build',
        explanation: 'Prepending `time` to any command measures real, user, and sys CPU elapsed execution times.'
      }
    ];
  }

  async generateQuizByType(_lessonId: string, _lessonTitle: string, type: 'mcq' | 'tf' | 'fib' | 'coding'): Promise<PracticeQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    if (type === 'mcq') {
      return [
        {
          id: `mcq_1_${Date.now()}`,
          type: 'mcq',
          difficulty: 'Intermediate',
          question: `Which permission octal code represents read and write access for the owner, and read-only for others?`,
          options: ['chmod 644', 'chmod 755', 'chmod 600', 'chmod 444'],
          answer: 'chmod 644',
          explanation: '6 (read+write) for owner, 4 (read) for group, and 4 (read) for others.'
        },
        {
          id: `mcq_2_${Date.now()}`,
          type: 'mcq',
          difficulty: 'Beginner',
          question: `What does the -m flag in 'git commit -m' represent?`,
          options: ['Metadata', 'Module selector', 'Message description', 'Master branch'],
          answer: 'Message description',
          explanation: 'The -m option allows you to supply a description text directly on the command line.'
        }
      ];
    } else if (type === 'tf') {
      return [
        {
          id: `tf_1_${Date.now()}`,
          type: 'tf',
          difficulty: 'Beginner',
          question: `True or False: The '.git' directory can be deleted without losing local commit history.`,
          options: ['True', 'False'],
          answer: 'False',
          explanation: 'The hidden .git folder contains the entire database of commit records. Deleting it completely destroys local history.'
        }
      ];
    } else if (type === 'fib') {
      return [
        {
          id: `fib_1_${Date.now()}`,
          type: 'fib',
          difficulty: 'Intermediate',
          question: `In a Unix pipeline, the output of one command is redirected to the input of another using the ______ character.`,
          answer: '|',
          explanation: 'The pipe character (|) channels standard output of the left command to the standard input of the right command.'
        }
      ];
    } else {
      return [
        {
          id: `code_1_${Date.now()}`,
          type: 'coding',
          difficulty: 'Advanced',
          question: `Write a simple command to stage all modified and deleted files in Git.`,
          answer: 'git add -A',
          explanation: 'The -A or --all flag stages all changes, including untracked, modified, and deleted files.'
        }
      ];
    }
  }

  async generateInterviewPrep(_lessonId: string, lessonTitle: string, _content: string): Promise<InterviewPrepQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
      {
        id: 'int_1',
        difficulty: 'Beginner',
        question: `What is the significance of the ${lessonTitle} topic?`,
        sampleAnswer: `It establishes the fundamental architectures that prevent misconfigurations in production systems and allows software developers to debug execution processes.`
      },
      {
        id: 'int_2',
        difficulty: 'Intermediate',
        question: `Explain how you would troubleshoot a pipeline error related to ${lessonTitle}.`,
        sampleAnswer: 'Isolate each command block, run standard checks on variables, verify permissions, and redirect stderr to a file to examine crash stacks.'
      }
    ];
  }

  async generateRecommendations(
    _lessonId: string,
    _lessonTitle: string,
    _completedUnitIds: string[]
  ): Promise<SmartRecommendations> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      reviewLessons: [
        { id: 'linux-intro', title: '1.1 UNIX Shell Foundations' },
        { id: 'file-rights', title: '1.2 File Rights and Access Octals' }
      ],
      nextLessons: [
        { id: 'automation-cron', title: '2.1 Process Automation with Cron & Systemd' },
        { id: 'bash-loops', title: '2.2 Writing Bash Control Loops' }
      ],
      relatedTopics: ['File System Standards', 'Virtual Address Spaces', 'Process Signal Handling'],
      practiceSuggestions: [
        'Inspect file parameters using ls -la /etc.',
        'Run strace on basic operations to inspect system call counts.'
      ]
    };
  }

  async generateFlashcards(_lessonId: string, _lessonTitle: string): Promise<AIFlashcard[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [
      { id: 'fc_1', term: 'Kernel space', definition: 'The protected high-privilege Ring 0 memory area where the core operating system executes.' },
      { id: 'fc_2', term: 'User space', definition: 'The restricted Ring 3 execution workspace allocated for standard customer applications.' },
      { id: 'fc_3', term: 'System Call', definition: 'The controlled API CPU entry point that lets user programs request hardware actions.' },
      { id: 'fc_4', term: 'SELinux', definition: 'Mandatory Access Control security engine that restricts operations even for root users.' },
      { id: 'fc_5', term: 'strace', definition: 'A utility that monitors and logs system call triggers executed by a process.' },
    ];
  }

  async getWeakTopicAnalysis(_userId: string): Promise<WeakTopicItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [
      {
        topic: 'Linux POSIX ACLs',
        score: 65,
        timeSpentMins: 45,
        struggleReason: 'Struggled with calculating correct permissions for nested directories.',
        remedyAction: 'Study Concentric Security Rings module and practice octal calculations.'
      },
      {
        topic: 'Git Conflict Resolution',
        score: 70,
        timeSpentMins: 38,
        struggleReason: 'Got confused during fast-forward rebases and marker edits.',
        remedyAction: 'Review Git & GitHub Mastery Module 3 and launch simulated conflict sandbox.'
      },
      {
        topic: 'SQL Nested Joins',
        score: 55,
        timeSpentMins: 60,
        struggleReason: 'Subqueries with multiple aggregation steps timed out during database execution.',
        remedyAction: 'Review Advanced SQL Module 4 and run query traces to analyze execution plans.'
      }
    ];
  }
}

export const mockAIProvider = new MockAIProvider();
