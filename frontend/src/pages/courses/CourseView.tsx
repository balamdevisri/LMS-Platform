import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  Terminal,
  CheckCircle2,
  ChevronRight,
  Star,
  Clock,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  Layers,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCourses } from '@/contexts/CourseContext';
import { gitLessonsData } from '@/data/gitLessonsData';

export const CourseView: React.FC = () => {
  const { courseId, slug } = useParams();
  const idOrSlug = courseId || slug || '1';
  const { getCourseById } = useCourses();
  const dynamicCourse = getCourseById(idOrSlug);

  const isGitCourse = idOrSlug === 'git-github-mastery-course-id' || idOrSlug === 'git-github-mastery' || dynamicCourse?.title?.toLowerCase().includes('git');

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-heading font-extrabold text-sm sm:text-base text-slate-900 mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('#### ')) {
        return <h5 key={idx} className="font-heading font-bold text-xs sm:text-sm text-slate-800 mt-3 mb-1">{line.replace('#### ', '')}</h5>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="ml-4 list-disc text-slate-700 my-1 text-xs">{line.replace('- ', '')}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-slate-700 my-1 text-xs leading-relaxed">{line}</p>;
    });
  };

  const [activeTab, setActiveTab] = useState<'intro' | 'index' | 'terminal' | 'quiz'>('intro');
  const [activeModule, setActiveModule] = useState<number | null>(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([101, 102]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(101);

  // Terminal Simulator State
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; output: string }>>([
    { cmd: 'uname -a', output: 'Linux shaivika-ai-kernel 6.8.0-generic x86_64 GNU/Linux' },
    { cmd: 'whoami', output: 'student@shaivika-lms' },
  ]);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Instant Terminal Command Execution Helper
  const executeCommandInTerminal = (rawCmd: string) => {
    const cleanCmd = rawCmd.replace(/^\$\s*/, '').trim();
    let output = '';
    const cmdLower = cleanCmd.toLowerCase();

    if (cmdLower === 'help') {
      output = 'Available commands: ls, pwd, whoami, uname -a, cat intro.txt, systemctl status, clear';
    } else if (cmdLower === 'pwd') {
      output = '/home/student/linux-essentials';
    } else if (cmdLower.includes('ls')) {
      output = 'drwxr-xr-x 4 student student 4096 Jul 22 20:30 .\ndrwxr-xr-x 3 student student 4096 Jul 22 20:30 ..\n-rw-r--r-- 1 student student  842 Jul 22 20:30 intro.txt\n-rwxr-xr-x 1 student student 1024 Jul 22 20:30 backup.sh';
    } else if (cmdLower.includes('mkdir')) {
      output = `[OK] Directory structure created: ${cleanCmd}`;
    } else if (cmdLower.includes('touch')) {
      output = `[OK] Created file(s) successfully: ${cleanCmd}`;
    } else if (cmdLower.includes('cp')) {
      output = `[OK] Copied target file/directory recursively.`;
    } else if (cmdLower.includes('mv')) {
      output = `[OK] Moved / renamed item successfully.`;
    } else if (cmdLower.includes('rm')) {
      output = `[OK] Removed file/directory permanently.`;
    } else if (cmdLower === 'whoami') {
      output = 'student@shaivika-lms';
    } else if (cmdLower.includes('tree')) {
      output = '.\n├── bin\n├── devops_lab\n│   └── scripts\n│       ├── build.sh\n│       └── deploy.sh\n└── test.sh';
    } else {
      output = `bash: ${cleanCmd}: command simulated successfully.`;
    }

    setTerminalHistory((prev) => [...prev, { cmd: cleanCmd, output }]);
    setActiveTab('terminal');
    toast.success(`Executed "${cleanCmd}" in CLI Terminal Lab!`);
  };

  const courseData = {
    id: dynamicCourse?.id || courseId || '1',
    title: dynamicCourse?.title || 'Introduction to Linux & System Administration',
    subtitle: dynamicCourse?.subtitle || '🐧 Linux Essentials',
    instructor: dynamicCourse?.instructor || 'Bhanu Prakash Achari',
    role: dynamicCourse?.role || 'Linux Systems Architect & AI Specialist',
    avatar: dynamicCourse?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: dynamicCourse?.rating || 5.0,
    reviews: dynamicCourse?.reviews || 1450,
    students: dynamicCourse?.students || '28,900',
    duration: dynamicCourse?.duration || '32 hrs',
    category: dynamicCourse?.category || 'Linux & Systems',
    level: dynamicCourse?.level || 'Beginner to Advanced',
    thumbnail: dynamicCourse?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
    introText: typeof dynamicCourse?.description === 'string' ? dynamicCourse.description.split('\n\n') : [
      `Welcome to Linux Essentials! Linux is one of the world's most powerful and widely used operating systems, powering everything from web servers and cloud platforms to Android devices, supercomputers, and embedded systems.`,
      `This course is designed for beginners who want to build a strong foundation in Linux. You will learn how Linux works, how to navigate the terminal, manage files and directories, understand permissions, and perform essential system operations using real-world commands.`
    ],
    outcomes: [
      'Master essential Linux CLI terminal navigation commands (cd, ls, pwd, find)',
      'Understand File System Hierarchy Standard (FHS) and directory structure',
      'Manage user accounts, groups, file permissions (chmod, chown) & umask',
      'Monitor processes, manage background jobs & configure Systemd services'
    ],
    quizQuestions: [
      {
        id: 'q1',
        questionText: 'Which layer of the Operating System directly manages hardware resources like CPU and RAM?',
        options: ['Shell', 'GUI', 'Kernel', 'User Space'],
        correctAnswerIndex: 2,
        marks: 5,
        explanation: 'The Kernel is the core component that interacts directly with physical hardware.'
      },
      {
        id: 'q2',
        questionText: 'In the command cp -r folder1 folder2, what does the -r option stand for?',
        options: ['Remove', 'Recursive', 'Read-only', 'Revert'],
        correctAnswerIndex: 1,
        marks: 5,
        explanation: '-r stands for recursive, which copies directories and their contents.'
      }
    ]
  };

  const gitCourseData = {
    id: 'git-github-mastery-course-id',
    title: 'Git & GitHub Mastery',
    subtitle: '🛠️ Git & GitHub Mastery',
    instructor: 'Admin',
    role: 'LMS Platform Systems Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '1,540',
    duration: '20 Hours',
    category: 'Development Tools',
    level: 'Beginner to Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80',
    introText: [
      `Welcome to Git & GitHub Mastery! Version control is a foundational skill for all developers. This course will take you from Git basics to advanced pipelines.`,
      `You will learn local repository initialization, stage-commit lifecycles, remote repository synchronization, pull requests, code reviews, rebasing, and automated pipelines using GitHub Actions.`,
      `By the end of this course, you will have a production-ready CI/CD setup and will earn your certification.`,
    ],
    outcomes: [
      'Configure Git globally and link local repositories to GitHub securely',
      'Create and merge branches, perform Pull Requests, and do collaborative code reviews',
      'Resolve complex merge conflicts and leverage stashing, rebasing, and cherry-picking',
      'Write custom GitHub Actions pipelines for automated testing & Netlify/Vercel deployments'
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Version Control & Git Basics',
        duration: '3 Hours • 15 Lessons',
        lessons: [
          { id: 'git-les-101', title: '1.1 Introduction to Version Control', duration: '15 mins', type: 'reading' },
          { id: 'git-les-102', title: '1.2 Centralized vs Distributed Version Control', duration: '15 mins', type: 'reading' },
          { id: 'git-les-103', title: '1.3 Why Git', duration: '10 mins', type: 'reading' },
          { id: 'git-les-104', title: '1.4 Why GitHub', duration: '10 mins', type: 'reading' },
          { id: 'git-les-105', title: '1.5 Installing Git', duration: '20 mins', type: 'lab' },
          { id: 'git-les-106', title: '1.6 Git Configuration', duration: '15 mins', type: 'lab' },
          { id: 'git-les-107', title: '1.7 SSH Keys', duration: '20 mins', type: 'lab' },
          { id: 'git-les-108', title: '1.8 Personal Access Tokens', duration: '15 mins', type: 'reading' },
          { id: 'git-les-109', title: '1.9 git init', duration: '10 mins', type: 'lab' },
          { id: 'git-les-110', title: '1.10 Git Lifecycle', duration: '20 mins', type: 'reading' },
          { id: 'git-les-111', title: '1.11 git status', duration: '10 mins', type: 'lab' },
          { id: 'git-les-112', title: '1.12 git add', duration: '10 mins', type: 'lab' },
          { id: 'git-les-113', title: '1.13 git commit', duration: '15 mins', type: 'lab' },
          { id: 'git-les-114', title: '1.14 git log', duration: '10 mins', type: 'lab' },
          { id: 'git-les-115', title: '1.15 git diff', duration: '15 mins', type: 'lab' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: GitHub Foundations',
        duration: '3 Hours • 16 Lessons',
        lessons: [
          { id: 'git-les-201', title: '2.1 Create Repository', duration: '10 mins', type: 'reading' },
          { id: 'git-les-202', title: '2.2 Remote Repository', duration: '10 mins', type: 'reading' },
          { id: 'git-les-203', title: '2.3 git remote add origin', duration: '10 mins', type: 'lab' },
          { id: 'git-les-204', title: '2.4 git push', duration: '15 mins', type: 'lab' },
          { id: 'git-les-205', title: '2.5 git pull', duration: '15 mins', type: 'lab' },
          { id: 'git-les-206', title: '2.6 git fetch', duration: '10 mins', type: 'lab' },
          { id: 'git-les-207', title: '2.7 git clone', duration: '15 mins', type: 'lab' },
          { id: 'git-les-208', title: '2.8 Git Branches', duration: '15 mins', type: 'reading' },
          { id: 'git-les-209', title: '2.9 git switch', duration: '10 mins', type: 'lab' },
          { id: 'git-les-210', title: '2.10 git checkout', duration: '10 mins', type: 'lab' },
          { id: 'git-les-211', title: '2.11 git merge', duration: '15 mins', type: 'lab' },
          { id: 'git-les-212', title: '2.12 Pull Requests', duration: '15 mins', type: 'reading' },
          { id: 'git-les-213', title: '2.13 Code Reviews', duration: '15 mins', type: 'reading' },
          { id: 'git-les-214', title: '2.14 Reviewers', duration: '10 mins', type: 'reading' },
          { id: 'git-les-215', title: '2.15 Labels', duration: '10 mins', type: 'reading' },
          { id: 'git-les-216', title: '2.16 Milestones', duration: '10 mins', type: 'reading' },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Advanced Git',
        duration: '4 Hours • 10 Lessons',
        lessons: [
          { id: 'git-les-301', title: '3.1 Merge Conflicts', duration: '20 mins', type: 'reading' },
          { id: 'git-les-302', title: '3.2 Conflict Resolution', duration: '20 mins', type: 'lab' },
          { id: 'git-les-303', title: '3.3 git restore', duration: '10 mins', type: 'lab' },
          { id: 'git-les-304', title: '3.4 git reset', duration: '15 mins', type: 'lab' },
          { id: 'git-les-305', title: '3.5 git revert', duration: '15 mins', type: 'lab' },
          { id: 'git-les-306', title: '3.6 git stash', duration: '15 mins', type: 'lab' },
          { id: 'git-les-307', title: '3.7 Git Rebase', duration: '15 mins', type: 'lab' },
          { id: 'git-les-308', title: '3.8 Interactive Rebase', duration: '20 mins', type: 'lab' },
          { id: 'git-les-309', title: '3.9 Squashing Commits', duration: '15 mins', type: 'reading' },
          { id: 'git-les-310', title: '3.10 Cherry Pick', duration: '15 mins', type: 'lab' },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Repository Management',
        duration: '3 Hours • 7 Lessons',
        lessons: [
          { id: 'git-les-401', title: '4.1 README.md', duration: '10 mins', type: 'reading' },
          { id: 'git-les-402', title: '4.2 Markdown', duration: '15 mins', type: 'reading' },
          { id: 'git-les-403', title: '4.3 LICENSE', duration: '10 mins', type: 'reading' },
          { id: 'git-les-404', title: '4.4 .gitignore', duration: '10 mins', type: 'reading' },
          { id: 'git-les-405', title: '4.5 GitHub Issues', duration: '15 mins', type: 'reading' },
          { id: 'git-les-406', title: '4.6 Project Boards', duration: '15 mins', type: 'reading' },
          { id: 'git-les-407', title: '4.7 GitHub Pages', duration: '20 mins', type: 'reading' },
        ],
      },
      {
        id: 5,
        title: 'Module 5: GitHub Actions',
        duration: '4 Hours • 12 Lessons',
        lessons: [
          { id: 'git-les-501', title: '5.1 CI/CD', duration: '15 mins', type: 'reading' },
          { id: 'git-les-502', title: '5.2 GitHub Actions', duration: '15 mins', type: 'reading' },
          { id: 'git-les-503', title: '5.3 Workflow Files', duration: '15 mins', type: 'reading' },
          { id: 'git-les-504', title: '5.4 YAML', duration: '15 mins', type: 'reading' },
          { id: 'git-les-505', title: '5.5 Jobs', duration: '10 mins', type: 'reading' },
          { id: 'git-les-506', title: '5.6 Steps', duration: '10 mins', type: 'reading' },
          { id: 'git-les-507', title: '5.7 Runners', duration: '10 mins', type: 'reading' },
          { id: 'git-les-508', title: '5.8 Automated Testing', duration: '15 mins', type: 'reading' },
          { id: 'git-les-509', title: '5.9 GitHub Secrets', duration: '15 mins', type: 'reading' },
          { id: 'git-les-510', title: '5.10 Deploy to Vercel', duration: '20 mins', type: 'reading' },
          { id: 'git-les-511', title: '5.11 Deploy to Netlify', duration: '20 mins', type: 'reading' },
          { id: 'git-les-512', title: '5.12 Deploy to AWS', duration: '20 mins', type: 'reading' },
        ],
      },
      {
        id: 6,
        title: 'Module 6: Modern GitHub',
        duration: '3 Hours • 7 Lessons',
        lessons: [
          { id: 'git-les-601', title: '6.1 GitHub Codespaces', duration: '15 mins', type: 'reading' },
          { id: 'git-les-602', title: '6.2 Dev Containers', duration: '15 mins', type: 'reading' },
          { id: 'git-les-603', title: '6.3 GitHub Copilot', duration: '15 mins', type: 'reading' },
          { id: 'git-les-604', title: '6.4 Prompt Engineering', duration: '15 mins', type: 'reading' },
          { id: 'git-les-605', title: '6.5 Dependabot', duration: '15 mins', type: 'reading' },
          { id: 'git-les-606', title: '6.6 Secret Scanning', duration: '15 mins', type: 'reading' },
          { id: 'git-les-607', title: '6.7 Branch Protection Rules', duration: '20 mins', type: 'reading' },
        ],
      }
    ],
    quizQuestions: [
      {
        id: 1,
        question: 'Which of the following is a Distributed VCS?',
        options: ['SVN', 'Perforce', 'Git', 'CVS'],
        correct: 2,
      },
      {
        id: 2,
        question: 'What hidden folder is initialized when running git init?',
        options: ['.github', '.gitignore', '.git', '.gitconfig'],
        correct: 2,
      },
      {
        id: 3,
        question: 'What reset flag undoes commits and completely deletes changes?',
        options: ['--soft', '--mixed', '--hard', '--clean'],
        correct: 2,
      },
      {
        id: 4,
        question: 'Which command stages all changes in the current directory?',
        options: ['git add .', 'git commit -a', 'git status', 'git push'],
        correct: 0,
      },
      {
        id: 5,
        question: 'What is the default tracking remote repository alias name?',
        options: ['main', 'origin', 'github', 'upstream'],
        correct: 1,
      },
    ],
  };

  interface LessonItem {
    id: string | number;
    title: string;
    duration: string;
    type: string;
  }

  interface ModuleItem {
    id: number;
    title: string;
    duration: string;
    lessons: LessonItem[];
  }

  interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correct: number;
  }

  interface CourseDataInterface {
    id: string | number;
    title: string;
    subtitle: string;
    instructor: string;
    role: string;
    avatar: string;
    rating: number;
    reviews: number;
    students: string;
    duration: string;
    category: string;
    level: string;
    thumbnail: string;
    introText: string[];
    outcomes: string[];
    modules: ModuleItem[];
    quizQuestions: QuizQuestion[];
  }

  const courseData = (isGitCourse ? gitCourseData : linuxCourseData) as CourseDataInterface;

  // Reusable Interactive Command Box with Auto Terminal Execution
  const InteractiveCmd: React.FC<{ cmd: string; desc?: string }> = ({ cmd, desc }) => (
    <div className="bg-slate-950 p-3.5 rounded-xl font-mono text-xs border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md my-2">
      <div className="space-y-1 min-w-0">
        {desc && <span className="text-[11px] text-slate-400 font-sans block">{desc}</span>}
        <span className="text-emerald-400 font-bold block truncate">{cmd.startsWith('$') ? cmd : `$ ${cmd}`}</span>
      </div>
      <button
        type="button"
        onClick={() => executeCommandInTerminal(cmd)}
        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold rounded-lg text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
        title="Execute command in Terminal Lab"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Run in Terminal</span>
      </button>
    </div>
  );

  // Module 1 Lessons Rich Content Renderer
  const module1LessonsContent: { [key: number]: any } = {
    101: {
      title: '1.1 Introduction to Unix & Linux Operating System Architecture',
      time: '45 mins',
      badge: 'Core Foundations',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">📌 OVERVIEW</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Unix and Linux operate on a multi-layered architecture designed for multi-user security, high performance, and modularity.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>🏗️ Architectural Layers</span>
            </h4>

            <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 font-mono text-xs space-y-3 shadow-xl">
              <div className="p-3 bg-sky-950/80 border border-sky-500/40 rounded-xl text-sky-300 text-center shadow-xs">
                <span className="font-bold block text-sky-400">USER APPLICATIONS</span>
                <span className="text-[11px] opacity-80">(Web Browser, VS Code, Python, MySQL)</span>
              </div>

              <div className="flex justify-center text-slate-500 font-bold">│  ▼</div>

              <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-xl text-indigo-300 text-center shadow-xs">
                <span className="font-bold block text-indigo-400">SHELL / CLI / GUI</span>
                <span className="text-[11px] opacity-80">(Bash, Zsh, GNOME, Terminal)</span>
              </div>

              <div className="flex justify-center text-slate-500 font-bold">│  ▼ (System Calls)</div>

              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-center shadow-xs">
                <span className="font-bold block text-emerald-400">KERNEL</span>
                <span className="text-[11px] opacity-80">• Process Scheduler  • Memory Manager  • File System Driver  • Network Stack</span>
              </div>

              <div className="flex justify-center text-slate-500 font-bold">│  ▼</div>

              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 text-center shadow-xs">
                <span className="font-bold block text-white">HARDWARE</span>
                <span className="text-[11px] opacity-80">(CPU, RAM, SSD/HDD, NIC, GPU)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">Key Components Explained:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-sky-100 space-y-1">
                <span className="font-bold text-sky-900 block">🖥️ Hardware:</span>
                <p className="text-slate-600 font-medium">Physical components (CPU, RAM, Disks, NIC, GPU).</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-sky-100 space-y-1">
                <span className="font-bold text-emerald-800 block">⚙️ Kernel:</span>
                <p className="text-slate-600 font-medium">The core engine. Directly manages hardware resources and isolates processes.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-sky-100 space-y-1">
                <span className="font-bold text-indigo-900 block">🐚 Shell:</span>
                <p className="text-slate-600 font-medium">Interface between user and kernel. Translates human commands into system calls.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-sky-100 space-y-1">
                <span className="font-bold text-purple-900 block">👤 User Space:</span>
                <p className="text-slate-600 font-medium">Applications run here with restricted permissions for safety.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-sky-600 text-white rounded-2xl shadow-md font-bold text-xs flex items-center gap-2">
            <span>💡 Key Takeaway:</span>
            <p className="font-medium">User programs never talk directly to hardware; they always go through System Calls to the Kernel.</p>
          </div>
        </div>
      ),
    },

    102: {
      title: '1.2 Understanding Shell Architecture & Command Anatomy',
      time: '60 mins',
      badge: 'CLI Mastery',
      render: (
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>🐚 What is a Shell?</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              A Shell is a command-line interpreter that executes commands entered by the user or from script files.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200/80 space-y-1">
                <span className="font-bold text-sky-900 block">Bash (Bourne Again Shell):</span>
                <p className="text-slate-600 font-medium">Default on most Linux distros (Ubuntu, RHEL, Debian).</p>
              </div>
              <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200/80 space-y-1">
                <span className="font-bold text-indigo-900 block">Zsh (Z Shell):</span>
                <p className="text-slate-600 font-medium">Default on macOS; offers advanced auto-completion and customization.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>📐 Anatomy of a Linux Command</span>
            </h4>
            <p className="text-xs text-slate-600 font-medium">Every Linux command follows a standard syntax:</p>

            <InteractiveCmd cmd="command -[options] [arguments]" desc="Standard Command Syntax Pattern" />

            <h5 className="font-bold text-xs text-slate-800 pt-2">🔍 Practical Breakdown:</h5>
            <InteractiveCmd cmd="ls -la /var/log" desc="List detailed files including hidden ones in /var/log" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200 text-center space-y-1">
                <span className="font-bold text-sky-900 block">Command: ls</span>
                <span className="text-[10px] text-slate-500 font-semibold block">What to run</span>
                <p className="text-[11px] text-slate-700 font-medium">List directory contents</p>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-1">
                <span className="font-bold text-amber-900 block">Options/Flags: -la</span>
                <span className="text-[10px] text-slate-500 font-semibold block">How to do it</span>
                <p className="text-[11px] text-slate-700 font-medium">-l: Long format | -a: Show hidden files (.)</p>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
                <span className="font-bold text-emerald-900 block">Argument: /var/log</span>
                <span className="text-[10px] text-slate-500 font-semibold block">Target of action</span>
                <p className="text-[11px] text-slate-700 font-medium">Target directory path</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    103: {
      title: '1.3 Navigating Files & Directories',
      time: '50 mins',
      badge: 'Navigation Skills',
      render: (
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>🌳 The Linux Directory Hierarchy Standard (FHS)</span>
            </h4>
            <p className="text-xs text-slate-700 font-medium">
              In Linux, everything is a file, and the system starts at the Root directory <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-sky-700">/</code>.
            </p>

            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 shadow-lg">
              <div className="text-sky-400 font-bold">/ (Root Directory)</div>
              <div className="pl-4">├── <span className="text-emerald-400 font-bold">bin</span>    --&gt; Essential user binaries (ls, cp, rm)</div>
              <div className="pl-4">├── <span className="text-amber-400 font-bold">etc</span>    --&gt; System configuration files</div>
              <div className="pl-4">├── <span className="text-sky-300 font-bold">home</span>   --&gt; User home directories (/home/user)</div>
              <div className="pl-4">├── <span className="text-rose-400 font-bold">root</span>   --&gt; Home directory for superuser</div>
              <div className="pl-4">├── <span className="text-indigo-300 font-bold">tmp</span>    --&gt; Temporary files (cleared on reboot)</div>
              <div className="pl-4">└── <span className="text-purple-300 font-bold">var</span>    --&gt; Variable data (logs, databases)</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">🛠️ Core Navigation Commands Table & Quick Execution</h4>

            <div className="space-y-2">
              <InteractiveCmd cmd="pwd" desc="Print Working Directory (Displays absolute path)" />
              <InteractiveCmd cmd="ls -la /home" desc="List all files & details in /home directory" />
              <InteractiveCmd cmd="cd /var/log" desc="Navigate to system log directory" />
              <InteractiveCmd cmd="tree -L 2" desc="Visualize directory tree up to depth 2" />
            </div>
          </div>

          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-3 text-xs">
            <span className="font-bold text-sky-900 block">💡 Essential cd Shortcuts:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => executeCommandInTerminal('cd ~')}
                className="p-2.5 bg-white hover:bg-sky-100 rounded-xl border border-sky-200 text-left cursor-pointer transition-all"
              >
                <span className="text-sky-700 font-bold block">cd ~</span>
                <span className="text-slate-500 text-[10px]">➜ Go to Home dir</span>
              </button>

              <button
                type="button"
                onClick={() => executeCommandInTerminal('cd ..')}
                className="p-2.5 bg-white hover:bg-sky-100 rounded-xl border border-sky-200 text-left cursor-pointer transition-all"
              >
                <span className="text-sky-700 font-bold block">cd ..</span>
                <span className="text-slate-500 text-[10px]">➜ Move up 1 level</span>
              </button>

              <button
                type="button"
                onClick={() => executeCommandInTerminal('cd -')}
                className="p-2.5 bg-white hover:bg-sky-100 rounded-xl border border-sky-200 text-left cursor-pointer transition-all"
              >
                <span className="text-sky-700 font-bold block">cd -</span>
                <span className="text-slate-500 text-[10px]">➜ Jump to previous dir</span>
              </button>
            </div>
          </div>

          {/* Center: Current lesson indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-150 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-655 max-w-md truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse shrink-0" />
            <span className="text-slate-400">Playing:</span>
            <span className="truncate text-slate-700 font-bold">{activePlayerUnit.title}</span>
          </div>

          {/* Right side: Badge and sidebar toggles */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[10px] sm:text-xs font-bold shadow-3xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Student Preview</span>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${leftSidebarOpen
                  ? 'bg-sky-50 border-sky-300 text-sky-750'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
              title="Toggle Curriculum Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${rightSidebarOpen
                  ? 'bg-sky-50 border-sky-300 text-sky-750'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
              title="Toggle Progress Sidebar"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Player Workspace Grid */ }
  <div className="flex-1 flex overflow-hidden relative">

    {/* Mobile sidebar overlay when either sidebar is open */}
    <div className={`fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ${(leftSidebarOpen || rightSidebarOpen) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} onClick={() => { setLeftSidebarOpen(false); setRightSidebarOpen(false); }} />

    {/* LEFT SIDEBAR: Syllabus Tree */}
    <aside className={`fixed lg:static top-16 bottom-0 left-0 z-50 lg:z-10 w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden lg:translate-x-0'
      }`}>
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 block">Curriculum Syllabus</h3>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-700">
            <button onClick={expandAllModules} className="hover:underline cursor-pointer">Expand All</button>
            <span>•</span>
            <button onClick={collapseAllModules} className="hover:underline cursor-pointer">Collapse All</button>
          </div>
        </div>
        <span className="text-[11px] text-slate-500 font-medium block">
          {completedCount} of {totalCount} lessons completed
        </span>
        <div className="w-full h-1.5 bg-slate-100 rounded-full border border-slate-205 mt-2.5 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      {/* Modules Accordion list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {modulesToRender.map((m: any, mIdx: number) => {
          const isModuleOpen = !!expandedModules[String(m.id)];
          return (
            <div key={m.id} className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/30">
              <button
                onClick={() => {
                  setExpandedModules(prev => ({
                    ...prev,
                    [String(m.id)]: !prev[String(m.id)]
                  }));
                }}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border-b border-slate-150 flex items-center justify-between transition-colors text-left cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-extrabold text-slate-800 leading-normal truncate">
                    M{mIdx + 1}: {m.title.replace(/^Module \d+:\s*/, '')}
                  </h4>
                  <span className="text-[9px] font-bold text-slate-455 block font-mono mt-0.5">{m.duration || '4 hours'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-450 shrink-0 transition-transform ${isModuleOpen ? 'rotate-180 text-sky-655' : ''}`} />
              </button>

              {isModuleOpen && (
                <div className="p-2 space-y-2.5 bg-white border-t border-slate-100">
                  {m.topics?.map((t: any) => (
                    <div key={t.id} className="space-y-1 pt-1 border-b border-slate-50 last:border-b-0 pb-1.5 last:pb-0">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-2 block mb-1 truncate">
                        {t.title}
                      </span>
                      <div className="space-y-1">
                        {t.learningUnits?.map((unit: any) => {
                          const isUnitDone = !!completedUnitIds[String(unit.id)];
                          const isUnitActive = activePlayerUnit.id === unit.id;

                          let UnitIcon = Play;
                          if (unit.type === 'Reading') UnitIcon = FileText;
                          if (unit.type === 'Quiz') UnitIcon = HelpCircle;
                          if (unit.type === 'Assignment') UnitIcon = FileCode;

                          return (
                            <div
                              key={unit.id}
                              onClick={() => setActivePlayerUnit(unit)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${isUnitActive
                                  ? 'bg-sky-50 border-sky-300 text-sky-850 font-bold ring-2 ring-sky-300/10'
                                  : 'bg-white border-transparent text-slate-650 hover:bg-slate-55'
                                }`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleUnitComplete(unit.id);
                                }}
                                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${isUnitDone
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 hover:border-sky-500 bg-white'
                                  }`}
                                title={isUnitDone ? "Mark Incomplete" : "Mark Complete"}
                              >
                                {isUnitDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>

                              <div className="min-w-0 flex-1">
                                <span className="block truncate">{unit.title}</span>
                                <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5 uppercase tracking-wide">
                                  <UnitIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{unit.type} • {unit.duration || '15 mins'}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>

    {/* CENTER CONTENT */}
    <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* breadcrumbs */}
        <div className="flex items-center justify-between border-b border-slate-205 pb-4">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">
              {activeModuleItem ? `Module ${modulesToRender.indexOf(activeModuleItem) + 1}` : 'Module'} • {activeTopicItem?.title || 'Topic'}
            </span>
            <h1 className="font-heading font-extrabold text-lg sm:text-xl md:text-2xl text-slate-900 mt-1 leading-tight">
              {activePlayerUnit.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider font-mono ${activePlayerUnit.type === 'Quiz'
                ? 'bg-amber-50 border-amber-250 text-amber-800'
                : activePlayerUnit.type === 'Assignment'
                  ? 'bg-indigo-50 border-indigo-250 text-indigo-850'
                  : 'bg-sky-50 border-sky-200 text-sky-800'
              }`}>
              {activePlayerUnit.type}
            </span>
            {activePlayerUnit.duration && (
              <span className="text-[10px] font-bold text-slate-450 font-mono flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-3xs">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{activePlayerUnit.duration} Est</span>
              </span>
            )}
          </div>
        </div>

        {/* dynamic lesson page viewer */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-3xs">

          {/* VIDEO TYPE */}
          {activePlayerUnit.type === 'Video' && (
            <div className="space-y-6">
              {activePlayerUnit.videoUrl ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-250 bg-slate-950 shadow-md">
                  <iframe
                    src={getEmbedUrl(activePlayerUnit.videoUrl)}
                    title={activePlayerUnit.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                /* Custom Video Player Simulation */
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 shadow-lg relative flex flex-col justify-between p-4 group select-none">

                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-900/40 to-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-0">
                      <Play className={`w-14 h-14 text-sky-400 transition-all duration-300 transform group-hover:scale-110 ${videoPlaying ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`} />
                      <div className={`mt-4 space-y-1 ${videoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity'}`}>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">{activePlayerUnit.title}</h4>
                        <p className="text-xs text-slate-300 max-w-sm mx-auto">Click play below to simulate watching this lesson video to completion.</p>
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between text-white/95 text-[10px] font-bold z-10 p-2 bg-slate-950/50 rounded-xl backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="truncate max-w-xs">{activePlayerUnit.title}</span>
                      <span className="font-mono bg-sky-600/90 px-2 py-0.5 rounded uppercase">LMS Stream 1</span>
                    </div>

                    <div className="h-10 w-full" />

                    <div className="w-full bg-slate-950/80 p-3 rounded-xl border border-slate-800 backdrop-blur-md flex flex-col gap-2.5 z-10 select-none shadow-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono text-slate-300">{formatTime(elapsedSeconds)}</span>
                        <div
                          className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80 cursor-pointer relative"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const percentage = Math.round((clickX / rect.width) * 100);
                            setVideoProgress(percentage);
                          }}
                        >
                          <div
                            className="h-full bg-sky-500 rounded-full transition-all duration-150"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold font-mono text-slate-300">{formatTime(totalSeconds)}</span>
                      </div>

                      <div className="flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setVideoPlaying(!videoPlaying)}
                            className="p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-sky-400 hover:text-sky-350"
                            title={videoPlaying ? 'Pause' : 'Play'}
                          >
                            {videoPlaying ? (
                              <span className="flex items-center justify-center gap-0.5">
                                <span className="w-1 h-3.5 bg-current rounded-xs" />
                                <span className="w-1 h-3.5 bg-current rounded-xs" />
                              </span>
                            ) : (
                              <Play className="w-4 h-4 fill-current" />
                            )}
                          </button>

                          <button
                            onClick={() => { setVideoProgress(0); setVideoPlaying(true); }}
                            className="p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-slate-400 hover:text-white"
                            title="Restart"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-1.5 pl-1.5">
                            <button
                              onClick={() => setVideoMuted(!videoMuted)}
                              className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              {videoMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-450" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
                            </button>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={videoMuted ? 0 : videoVolume}
                              onChange={(e) => {
                                setVideoVolume(Number(e.target.value));
                                setVideoMuted(false);
                              }}
                              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 hidden sm:inline"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 gap-1 text-[9px] font-bold">
                            <span className="text-slate-450">Speed:</span>
                            <select
                              value={videoSpeed}
                              onChange={(e) => setVideoSpeed(Number(e.target.value))}
                              className="bg-transparent text-sky-400 outline-hidden font-bold border-none cursor-pointer"
                            >
                              <option value="1" className="bg-slate-950 text-white">1.0x</option>
                              <option value="1.5" className="bg-slate-950 text-white">1.5x</option>
                              <option value="2" className="bg-slate-950 text-white">2.0x</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <h3 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-655" />
                  <span>Lesson Description</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed bg-slate-50 p-4 border border-slate-150 rounded-2xl">
                  {activePlayerUnit.description || 'Watch the lecture video completely to unlock next topic milestones.'}
                </p>
              </div>
            </div>
          )}

          {/* READING TYPE */}
          {activePlayerUnit.type === 'Reading' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center bg-sky-50/50 border border-sky-150 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-sky-700 bg-white border border-sky-200 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                    Document Reader
                  </span>
                  <span className="text-[10px] font-bold text-slate-450 block font-mono">
                    {getEstimatedReadingTime(activePlayerUnit.readingMarkdown || activePlayerUnit.readingContent || '')}
                  </span>
                </div>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full border overflow-hidden hidden sm:block">
                  <div className="h-full bg-sky-500 rounded-full animate-pulse" style={{ width: '75%' }} />
                </div>
              </div>

              <article
                className="text-xs sm:text-sm leading-relaxed text-slate-700 prose prose-slate max-w-none font-medium p-2 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(activePlayerUnit.readingMarkdown || activePlayerUnit.readingContent || '### Reading content\nNo content written yet.') }}
              />
            </div>
          )}

          {/* QUIZ TYPE */}
          {activePlayerUnit.type === 'Quiz' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-200/80 space-y-2 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest">Interactive Practice Quiz</h4>
                  <p className="text-[10px] sm:text-xs text-amber-800 leading-normal font-medium mt-0.5">
                    Passing criteria: score at least <strong className="font-bold">{activePlayerUnit.quizPassingScore || 70}%</strong>.
                  </p>
                </div>
              </div>

              {!activePlayerUnit.quizQuestions || activePlayerUnit.quizQuestions.length === 0 ? (
                <p className="text-xs text-slate-450 italic">No quiz questions configured for this block.</p>
              ) : (
                <div className="space-y-6">
                  {activePlayerUnit.quizQuestions.map((q: any, idx: number) => {
                    const selectedIdx = quizAnswers[q.id];
                    return (
                      <div key={q.id} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {idx + 1}. {q.questionText}
                          </h4>
                          <span className="text-[9px] font-extrabold font-mono text-slate-450 uppercase shrink-0 bg-white border px-2 py-0.5 rounded">
                            {q.marks || 5} pts
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium">
                          {q.options?.map((opt: string, oIdx: number) => {
                            const isSelected = selectedIdx === oIdx;
                            const isCorrect = q.correctAnswerIndex === oIdx;

                            let btnClass = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                            if (quizSubmitted) {
                              if (isCorrect) {
                                btnClass = 'border-emerald-300 bg-emerald-50 text-emerald-955 font-bold';
                              } else if (isSelected) {
                                btnClass = 'border-rose-300 bg-rose-50 text-rose-955 font-bold';
                              } else {
                                btnClass = 'border-slate-100 bg-slate-50 text-slate-400';
                              }
                            } else if (isSelected) {
                              btnClass = 'border-sky-500 bg-sky-50 text-sky-800 font-bold ring-2 ring-sky-300/30';
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                {quizSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && q.explanation && (
                          <div className="p-3 bg-white border border-slate-150 rounded-xl mt-3 text-[10px] sm:text-xs font-medium text-slate-600 leading-relaxed">
                            <strong className="text-slate-800 block font-bold mb-0.5">Explanation:</strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {quizSubmitted ? (
                    (() => {
                      const totalQuizMarks = activePlayerUnit.quizQuestions.reduce((acc: number, q: any) => acc + (q.marks || 5), 0);
                      const scoredMarks = activePlayerUnit.quizQuestions.reduce((acc: number, q: any) => {
                        return acc + (quizAnswers[q.id] === q.correctAnswerIndex ? (q.marks || 5) : 0);
                      }, 0);
                      const percentage = totalQuizMarks > 0 ? Math.round((scoredMarks / totalQuizMarks) * 100) : 0;
                      const isPassed = percentage >= (activePlayerUnit.quizPassingScore || 70);

                      return (
                        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isPassed ? 'bg-emerald-50 border-emerald-250 text-emerald-850' : 'bg-rose-50 border-rose-250 text-rose-850'
                          }`}>
                          <div className="space-y-1">
                            <span className="text-sm font-extrabold flex items-center gap-1.5">
                              {isPassed ? (
                                <>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  <span>Quiz Passed! Milestones Met</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-5 h-5 text-rose-600" />
                                  <span>Retry Recommended</span>
                                </>
                              )}
                            </span>
                            <span className="text-xs font-semibold block font-mono">
                              Score: {scoredMarks} / {totalQuizMarks} marks ({percentage}%) — passing score: {activePlayerUnit.quizPassingScore || 70}%
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setQuizSubmitted(false);
                              setQuizAnswers({});
                            }}
                            className="btn-blue-primary text-[11px] py-2 px-4 font-bold cursor-pointer rounded-xl max-w-fit"
                          >
                            Retry Quiz
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <button
                      onClick={() => {
                        const unanswered = activePlayerUnit.quizQuestions.filter((q: any) => quizAnswers[q.id] === undefined);
                        if (unanswered.length > 0) {
                          toast.warning(`Please answer all ${unanswered.length} questions before submitting.`);
                          return;
                        }
                        setQuizSubmitted(true);

                        const totalQuizMarks = activePlayerUnit.quizQuestions.reduce((acc: number, q: any) => acc + (q.marks || 5), 0);
                        const scoredMarks = activePlayerUnit.quizQuestions.reduce((acc: number, q: any) => {
                          return acc + (quizAnswers[q.id] === q.correctAnswerIndex ? (q.marks || 5) : 0);
                        }, 0);
                        const percentage = totalQuizMarks > 0 ? Math.round((scoredMarks / totalQuizMarks) * 100) : 0;

                        localStorage.setItem(`lms_quiz_score_${activePlayerUnit.id}`, JSON.stringify({
                          score: scoredMarks,
                          total: totalQuizMarks,
                          percentage,
                          date: new Date().toLocaleDateString('en-US')
                        }));

                        toast.success('Quiz submitted successfully!');
                        if (percentage >= (activePlayerUnit.quizPassingScore || 70)) {
                          toggleUnitComplete(activePlayerUnit.id);
                        }
                      }}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs cursor-pointer shadow-md transition-all active:scale-98"
                    >
                      Submit Quiz Answers
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENT TYPE */}
          {activePlayerUnit.type === 'Assignment' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-4 rounded-2xl bg-indigo-505 bg-indigo-50/5 border border-indigo-200/60 space-y-2 font-medium flex items-start gap-3">
                <FileCode className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest block">Project Assignment</h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${assignmentStatus === 'Submitted'
                        ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                      {assignmentStatus.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">
                    Follow the instructions, attach your files, and click submit.
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 border border-slate-150 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Instructions</h4>
                <div className="text-xs text-slate-700 leading-relaxed font-medium prose prose-slate">
                  {activePlayerUnit.assignmentInstructions ? (
                    <div dangerouslySetInnerHTML={{ __html: parseMarkdown(activePlayerUnit.assignmentInstructions) }} />
                  ) : (
                    <p>Complete lab exercises and submit build logs / code repositories.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4 font-mono text-xs font-bold text-slate-700">
                <div>
                  <span className="text-[9px] text-slate-400 block font-sans mb-0.5 font-bold uppercase tracking-wider">Maximum Points</span>
                  <span className="text-slate-800 font-extrabold text-sm">{activePlayerUnit.assignmentMaxMarks || 100} Marks</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-sans mb-0.5 font-bold uppercase tracking-wider">Deadline Schedule</span>
                  <span className="text-slate-850 truncate block max-w-full font-bold">{activePlayerUnit.assignmentDeadline || '7 Days'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-sans mb-0.5 font-bold uppercase tracking-wider">Accepted Formats</span>
                  <span className="text-sky-700 font-bold">{activePlayerUnit.assignmentAllowedTypes || 'PDF, ZIP, TXT'}</span>
                </div>
              </div>

              {activePlayerUnit.assignmentRubric && (
                <div className="space-y-2.5 bg-sky-50/30 border border-sky-100 p-4 rounded-2xl">
                  <span className="text-[10px] font-extrabold text-sky-850 uppercase tracking-wider block">Grading Rubric Criteria</span>
                  <p className="text-xs text-slate-650 font-medium leading-relaxed whitespace-pre-line">{activePlayerUnit.assignmentRubric}</p>
                </div>
              )}

              <div className="space-y-4 pt-2">
                {assignmentStatus === 'Submitted' ? (
                  <div className="p-5 bg-emerald-50 border border-emerald-250 rounded-2xl space-y-3 font-medium">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block">Assignment Submitted Successfully!</span>
                        <p className="text-[10px] text-emerald-800 leading-normal mt-0.5">Your instructor will grade your draft shortly.</p>
                      </div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Artifacts</span>
                      {attachedFiles.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono py-1">
                          <File className="w-4 h-4 text-emerald-600" />
                          <span>default_submission_payload.zip (1.1 MB)</span>
                        </div>
                      ) : (
                        attachedFiles.map((file, fIdx) => (
                          <div key={fIdx} className="flex items-center justify-between text-xs text-slate-700 font-mono py-1 border-b last:border-b-0 border-slate-100">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-emerald-600" />
                              <span>{file.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-450 font-sans">{file.size}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setAssignmentStatus('Not Submitted');
                        toast.info('Assignment submission set back to draft.');
                      }}
                      className="text-[10px] text-rose-600 hover:text-rose-800 underline font-bold mt-1.5 block cursor-pointer transition-colors"
                    >
                      Cancel Submission & Revert to Draft
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      onClick={handleFileUploadSimulation}
                      className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-sky-50/20 hover:border-sky-300 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <Download className="w-8 h-8 text-slate-400 group-hover:text-sky-500 transition-colors transform group-hover:-translate-y-0.5" />
                      <span className="text-xs font-bold text-slate-700">Drag & Drop assignment deliverables</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Or click to simulate attaching a file ({activePlayerUnit.assignmentAllowedTypes || 'ZIP, PDF'})</span>
                    </div>

                    {attachedFiles.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Attached Draft Files</span>
                        {attachedFiles.map((file, fIdx) => (
                          <div key={fIdx} className="flex items-center justify-between text-xs text-slate-700 font-mono p-1.5 bg-white border border-slate-150 rounded-lg">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-sky-550" />
                              <span>{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] text-slate-400 font-sans">{file.size}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAttachedFiles(attachedFiles.filter((_, i) => i !== fIdx));
                                }}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                                title="Delete file"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setAssignmentStatus('Submitted');
                        toast.success('Assignment submission simulated!');
                        toggleUnitComplete(activePlayerUnit.id);
                      }}
                      className="btn-blue-primary w-full py-3 text-xs font-bold shadow-md cursor-pointer justify-center rounded-xl"
                    >
                      Submit Assignment
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* PLAYER FOOTER CONTROLS NAVIGATION BAR */}
      <footer className="sticky bottom-0 border-t border-slate-200/80 p-4 sm:p-5 bg-white flex items-center justify-between shrink-0 select-none z-10 shadow-lg">
        <button
          disabled={!prevUnit}
          onClick={() => {
            setActivePlayerUnit(prevUnit);
          }}
          className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 bg-white hover:bg-slate-55 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white cursor-pointer flex items-center gap-1.5 transition-all shadow-3xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Lesson</span>
        </button>

        <button
          onClick={() => toggleUnitComplete(activePlayerUnit.id)}
          className={`py-2.5 px-6 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${isCompleted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-250 hover:bg-emerald-100'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:scale-102'
            }`}
        >
          {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Play className="w-4 h-4 fill-current text-white/90" />}
          <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
        </button>

        <button
          disabled={!nextUnit}
          onClick={() => {
            setActivePlayerUnit(nextUnit);
          }}
          className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-650 bg-white hover:bg-slate-55 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white cursor-pointer flex items-center gap-1.5 transition-all shadow-3xs"
        >
          <span>Next Lesson</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </main>

    {/* RIGHT SIDEBAR */}
    <aside className={`fixed lg:static top-16 bottom-0 right-0 z-50 lg:z-10 w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:hidden lg:translate-x-0'
      }`}>
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 block">Lesson Progress Info</h3>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* circular gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-sky-50/40 rounded-2xl border border-sky-100/60 shadow-3xs relative overflow-hidden">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="46" stroke="#F0F9FF" strokeWidth="8" fill="transparent" />
              <circle cx="56" cy="56" r="46" stroke="#0284C7" strokeWidth="8" fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - completionPercentage / 100)}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-slate-900 leading-none">{completionPercentage}%</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Complete</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-4 text-center border-t border-sky-100 pt-3">
            <div>
              <span className="text-[9px] text-slate-450 uppercase font-semibold block">Completed</span>
              <span className="text-xs font-extrabold text-emerald-600 block mt-0.5">{completedCount} Lessons</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-450 uppercase font-semibold block">Remaining</span>
              <span className="text-xs font-extrabold text-slate-700 block mt-0.5">{totalCount - completedCount} Lessons</span>
            </div>
          </div>
        </div>

        {/* remaining time */}
        <div className="p-4 rounded-2xl bg-white border border-slate-150 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-750">
            <span className="text-slate-450 uppercase text-[9px] tracking-wider font-semibold block">Time Remaining</span>
            <span className="text-sky-655 bg-sky-50 px-2 py-0.5 rounded font-mono text-[10px]">{remainingDurationStr}</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal font-medium">Estimated time remaining is calculated based on incomplete syllabus units.</p>
        </div>

        {/* Active module details */}
        {activeModuleItem && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
            <span className="text-[9px] text-slate-455 uppercase tracking-wider font-extrabold block">Current Module</span>
            <h4 className="text-xs font-bold text-slate-800 leading-normal">
              {activeModuleItem.title}
            </h4>
            {activeModuleItem.description && (
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                {activeModuleItem.description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-heading font-bold text-sm text-slate-900">📋 Capstone Implementation Verification Commands</h4>

          <div className="space-y-2">
            <InteractiveCmd cmd="sudo useradd -m -s /bin/bash deploy_admin" desc="Step 1: Create deploy_admin user" />
            <InteractiveCmd cmd="sudo ufw allow 22/tcp && sudo ufw allow 80/tcp" desc="Step 2: Lock down firewall ports" />
            <InteractiveCmd cmd="./health_audit.sh" desc="Step 3: Execute health audit script" />
            <InteractiveCmd cmd="crontab -l" desc="Step 4: Verify 15-minute cron automation deployment" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3 shadow-md">
          <Award className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
          <h3 className="font-heading font-extrabold text-xl text-emerald-900">
            🏆 ISO Verified Linux System Administrator Certification
          </h3>
          <p className="text-xs text-emerald-800 font-medium max-w-lg mx-auto">
            Complete all 4 module practical labs to unlock your verifiable ISO digital certificate badge!
          </p>
          <button
            onClick={() => toast.success('Congratulations! Linux Essentials Certificate Unlocked!')}
            className="btn-blue-primary text-xs py-3 px-6 font-extrabold shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            Claim Verifiable ISO Certificate
          </button>
        </div>
      </div>
      ),
    },
  };

  const handleTerminalExecute = (e: React.FormEvent) => {
        e.preventDefault();
      const command = terminalInput.trim();
      if (!command) return;

      executeCommandInTerminal(command);
      setTerminalInput('');
  };

  const toggleLessonComplete = (lessonId: number) => {
    if (completedLessons.includes(lessonId)) {
        setCompletedLessons(completedLessons.filter((id) => id !== lessonId));
    } else {
        setCompletedLessons([...completedLessons, lessonId]);
      toast.success('Lesson marked as completed!');
    }
  };

  const calculateScore = () => {
        let score = 0;
    courseData.quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) {
        score++;
      }
    });
      return score;
  };

      return (
      <div className="space-y-8 font-['Sora'] text-slate-900 max-w-7xl mx-auto pb-16">

        {/* Header Banner */}
        <div className="bg-white/95 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <Link to="/dashboard" className="hover:text-sky-600 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sky-600 font-bold">{dynamicCourse?.category || courseData.category}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
              <Terminal className="w-3.5 h-3.5 text-sky-500" />
              <span>{courseData.subtitle}</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
              {dynamicCourse?.title || courseData.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 font-medium">
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-4 h-4 fill-current text-amber-400" />
                {courseData.rating} ({courseData.reviews} reviews)
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-sky-600" /> {dynamicCourse?.duration || courseData.duration}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-sky-50/80 p-4 rounded-2xl border border-sky-200/80 shrink-0">
            <img
              src={courseData.avatar}
              alt={courseData.instructor}
              className="w-12 h-12 rounded-full object-cover border-2 border-sky-400 shrink-0"
            />
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Instructor</span>
              <span className="font-bold text-sm text-slate-900 block">{dynamicCourse?.instructor || courseData.instructor}</span>
              <span className="text-[11px] text-sky-700 block font-medium">{courseData.role}</span>
            </div>
          </div>
        </div>

        {/* Main Tab Navigation Header */}
        <div className="bg-white/90 border border-sky-200/80 p-2 rounded-2xl shadow-sm flex overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('intro')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'intro'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Introduction & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('index')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'index'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
              }`}
          >
            <Layers className="w-4 h-4" />
            <span>Syllabus Curriculum</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'terminal'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
              }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Live CLI Terminal Lab</span>
          </button>
        </div>

        {/* Tab 1: Introduction */}
        {activeTab === 'intro' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/95 border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 space-y-4">
                <div className="flex items-center gap-2 border-b border-sky-100 pb-3">
                  <Sparkles className="w-5 h-5 text-sky-600 animate-pulse" />
                  <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">
                    Course Description
                  </h2>
                </div>
                <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {courseData.introText.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Module 1 Deep Dive: Architecture Diagrams & Linux Distros */}
              <div className="bg-white/95 border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 space-y-6">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-sky-600" />
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">
                      Module 1: Linux Architecture & Components
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    Core Fundamentals
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Linux combines a wide range of open-source tools and components to form a complete computing environment. These components include file systems, user interfaces, system utilities and application programs, all working together to manage hardware and enable users to interact with their computer systems.
                </p>

                {/* Diagram 1: Unix and Linux OS Architecture */}
                <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-sky-100">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    1. Layered Architecture: Hardware → Kernel → Shell → User Applications
                  </h4>
                  <div className="rounded-2xl overflow-hidden border border-sky-200 bg-white shadow-xs">
                    <img
                      src="/assets/images/linux_os_architecture.png"
                      alt="Unix and Linux Operating Systems Architecture"
                      className="w-full object-cover max-h-96"
                    />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    User applications (Web Browsers, Text Editors, Compilers) interact with the <strong>Shell</strong> (Command Line & GUI). The Shell makes system calls to the <strong>Kernel</strong> (Core control program), which directly manages CPU, Memory, and Hardware Devices.
                  </p>
                </div>

                {/* Diagram 2: Monolithic Kernel vs Microkernel */}
                <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-sky-100">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    2. Monolithic Kernel Architecture (e.g. Linux) vs. Microkernel (e.g. Minix)
                  </h4>
                  <div className="rounded-2xl overflow-hidden border border-sky-200 bg-white shadow-xs">
                    <img
                      src="/assets/images/linux_monolithic_vs_microkernel.png"
                      alt="Monolithic Kernel vs Microkernel Architecture"
                      className="w-full object-cover max-h-96"
                    />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Linux uses a <strong>Monolithic Kernel</strong> where File System, Device Drivers, IPC (Inter-Process Communication), and Process Scheduler operate together inside a single Kernel Space for maximum performance and low-latency hardware execution.
                  </p>
                </div>

                {/* Diagram 3: Kernel Subsystem Managers */}
                <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-sky-100">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    3. Kernel Subsystem Managers & Hardware Interface
                  </h4>
                  <div className="rounded-2xl overflow-hidden border border-sky-200 bg-white shadow-xs">
                    <img
                      src="/assets/images/linux_kernel_managers.png"
                      alt="Kernel Subsystem Managers"
                      className="w-full object-cover max-h-96"
                    />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    The Linux Kernel coordinates four core managers: <strong>Process Scheduler</strong> (CPU queue allocation), <strong>Memory Manager</strong> (Virtual vs Physical RAM), <strong>Device Drivers</strong> (Storage, Display, USB), and <strong>File System Manager</strong>.
                  </p>
                </div>

                {/* Distributions in Linux */}
                <div className="space-y-4 pt-4 border-t border-sky-100">
                  <div className="space-y-1">
                    <h3 className="font-heading font-extrabold text-lg text-slate-900">
                      Distributions in Linux (Distros)
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      A Linux distribution (distro) is a complete operating system built around the Linux kernel along with system tools, libraries, and applications. Different distributions are designed for various purposes such as desktops, servers, cybersecurity, and development.
                    </p>
                  </div>

                  {/* Distros Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { name: 'Ubuntu', badge: 'Beginner-Friendly', color: 'border-orange-200 bg-orange-50/50 text-orange-900', desc: 'A beginner-friendly Linux distribution used for desktops, servers, and cloud computing.' },
                      { name: 'Debian', badge: 'Server & Stability', color: 'border-rose-200 bg-rose-50/50 text-rose-900', desc: 'A stable and reliable Linux distribution widely used for enterprise servers.' },
                      { name: 'Kali Linux', badge: 'Cybersecurity', color: 'border-sky-200 bg-sky-50/50 text-sky-900', desc: 'A security-focused Linux distribution used for ethical hacking and penetration testing.' },
                      { name: 'MX Linux', badge: 'Lightweight', color: 'border-slate-200 bg-slate-100/60 text-slate-900', desc: 'A lightweight Linux distribution suitable for older hardware.' },
                      { name: 'Manjaro', badge: 'Arch-Based', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900', desc: 'A user-friendly Arch-based Linux distribution with rolling updates.' },
                      { name: 'Linux Mint', badge: 'Windows Migrators', color: 'border-green-200 bg-green-50/50 text-green-900', desc: 'A simple and beginner-friendly Linux distribution ideal for Windows users.' },
                      { name: 'Solus', badge: 'Desktop Performance', color: 'border-blue-200 bg-blue-50/50 text-blue-900', desc: 'A modern Linux distribution focused on desktop performance and simplicity.' },
                      { name: 'Fedora', badge: 'Developer-Focused', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900', desc: 'A developer-focused Linux distribution featuring the latest technologies.' },
                      { name: 'openSUSE', badge: 'Enterprise & Dev', color: 'border-lime-200 bg-lime-50/50 text-lime-900', desc: 'A powerful Linux distribution used for development and enterprise environments.' },
                      { name: 'Deepin', badge: 'Visually Attractive', color: 'border-purple-200 bg-purple-50/50 text-purple-900', desc: 'A visually attractive Linux distribution with an easy-to-use aesthetic interface.' },
                    ].map((distro, i) => (
                      <div key={i} className={`p-3.5 rounded-2xl border ${distro.color} space-y-1 shadow-xs`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{distro.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200">
                            {distro.badge}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-90 font-medium leading-relaxed">{distro.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Outcomes Card */}
              <div className="bg-white/95 border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 space-y-4">
                <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>What You Will Learn</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
                  {courseData.outcomes.map((outcome, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-2.5 text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/95 border border-sky-200/80 p-6 rounded-3xl shadow-xl shadow-sky-500/10 space-y-4">
                <h3 className="font-heading font-bold text-base text-slate-900">Course Info</h3>
                <div className="space-y-3 text-xs font-medium">
                  <div className="flex justify-between py-2 border-b border-sky-100">
                    <span className="text-slate-500">Total Duration</span>
                    <span className="font-bold text-slate-900">32 Hours</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-sky-100">
                    <span className="text-slate-500">Modules</span>
                    <span className="font-bold text-slate-900">4 Modules</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-sky-100">
                    <span className="text-slate-500">Total Lessons</span>
                    <span className="font-bold text-slate-900">20 Lessons</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-sky-100">
                    <span className="text-slate-500">Interactive Labs</span>
                    <span className="font-bold text-slate-900">14 CLI Labs</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Certificate</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> ISO Verified
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('index')}
                  className="btn-blue-primary w-full py-3 text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>View Curriculum</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Syllabus tree */}
        {activeTab === 'index' && (
          <div className="bg-white/95 border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 space-y-6">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-slate-900">
                  Course Curriculum & Modules Index
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Click any lesson to open the Learning Player workspace.</p>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                {completedLessons.length} / 20 Lessons Completed
              </span>
            </div>

            <div className="space-y-4">
              {dynamicCourse?.modules?.map((mod: any, modIdx: number) => {
                const isOpen = activeModule === mod.id;
                return (
                  <div key={mod.id} className="border border-sky-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
                    <button
                      onClick={() => setActiveModule(isOpen ? null : mod.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between bg-white hover:bg-sky-50/50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-200">
                          {modIdx + 1}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                            {mod.title}
                          </h3>
                          <span className="text-[11px] text-slate-500 font-medium">{mod.duration || '4 hours'}</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sky-600' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="p-4 border-t border-sky-100 space-y-3 bg-slate-50">
                        {mod.lessons.map((lesson) => {
                          const isDone = completedLessons.includes(lesson.id);
                          const isSelected = selectedLessonId === lesson.id;
                          return (
                            <div key={lesson.id} className="space-y-2">
                              <div
                                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${isSelected
                                    ? 'bg-sky-50/90 border-sky-400 shadow-md ring-2 ring-sky-400/20'
                                    : 'bg-white border-sky-100 hover:border-sky-300 hover:shadow-xs'
                                  }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <button
                                    onClick={() => toggleLessonComplete(lesson.id)}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${isDone ? 'bg-emerald-500 text-white' : 'border border-slate-300 hover:border-sky-500'
                                      }`}
                                  >
                                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => setSelectedLessonId(isSelected ? null : lesson.id)}
                                    className="text-left font-bold text-slate-900 hover:text-sky-600 transition-colors truncate cursor-pointer"
                                  >
                                    {lesson.title}
                                  </button>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] text-slate-500 font-mono">{lesson.duration}</span>
                                  <button
                                    onClick={() => setSelectedLessonId(isSelected ? null : lesson.id)}
                                    className={`px-3 py-1 font-bold rounded-lg border text-[11px] transition-all cursor-pointer ${isSelected
                                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                        : 'bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 border-sky-200'
                                      }`}
                                  >
                                    {isSelected ? 'Hide Topic' : 'View Topic'}
                                  </button>
                                </div>
                              </div>

                              {/* Direct Inline Topic Content Drawer */}
                              {isSelected && (
                                <div className="p-5 sm:p-6 bg-white rounded-2xl border border-sky-200 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                                  <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                                      {module1LessonsContent[lesson.id]?.badge || 'Interactive Lesson'} • {lesson.duration}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setActiveTab('terminal');
                                        toast.info('Interactive CLI Terminal Lab launched!');
                                      }}
                                      className="btn-blue-primary text-xs py-1.5 px-3 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <Terminal className="w-3.5 h-3.5" />
                                      <span>Launch Terminal Lab</span>
                                    </button>
                                  </div>

                                  {module1LessonsContent[lesson.id]?.render || (
                                    <div className="p-4 bg-sky-50 text-slate-700 rounded-2xl text-xs font-medium">
                                      Detailed topic guide for this lesson is ready. Practice hands-on Linux CLI commands in the Terminal Lab!
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Terminal */}
        {activeTab === 'terminal' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col space-y-4 font-mono text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live CLI Unix Terminal Lab</span>
            </div>

            <div className="h-64 overflow-y-auto space-y-2 p-2 bg-slate-950 rounded-2xl border border-slate-850 text-xs">
              {terminalHistory.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex gap-2">
                    <span className="text-sky-400 font-bold">student@shaivika-lms:~$</span>
                    <span>{item.cmd}</span>
                  </div>
                  <div className="text-slate-400 whitespace-pre-wrap pl-4 pb-2">{item.output}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleTerminalExecute} className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <span className="text-sky-400 font-bold shrink-0">student@shaivika-lms:~$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type Linux command here..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-hidden font-mono"
              />
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shrink-0">
                Run
              </button>
            </form>
          </div>
        )}

      </div>
      );
};

      export default CourseView;
