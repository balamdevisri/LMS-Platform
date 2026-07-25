import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  Terminal,
  CheckCircle2,
  ChevronRight,
  Star,
  Award,
  Clock,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  Layers,
  Play,
  Bot,
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
  const [completedLessons, setCompletedLessons] = useState<any[]>([101, 102]);
  const [selectedLessonId, setSelectedLessonId] = useState<any | null>(101);

  // Reset values when course changes
  React.useEffect(() => {
    if (isGitCourse) {
      setSelectedLessonId('git-les-101');
      setCompletedLessons([]);
      setActiveModule(1);
    } else {
      setSelectedLessonId(101);
      setCompletedLessons([101, 102]);
      setActiveModule(1);
    }
  }, [courseId, isGitCourse]);

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

    if (isGitCourse) {
      if (cmdLower === 'help') {
        output = 'Available git commands: git init, git status, git add, git commit, git log, git remote, git push, git clone, git branch, git checkout, git merge, git rebase, git stash';
      } else if (cmdLower.startsWith('git init')) {
        output = 'Initialized empty Git repository in /home/student/workspace/.git/';
      } else if (cmdLower.startsWith('git status')) {
        output = `On branch main\nNo commits yet\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\tindex.html\n\nnothing added to commit but untracked files present (use "git add" to track)`;
      } else if (cmdLower.startsWith('git add .') || cmdLower.startsWith('git add index.html')) {
        output = '[OK] Staged modifications and untracked files into index.';
      } else if (cmdLower.startsWith('git commit')) {
        output = `[main (root-commit) 7ca8c2f] feat: initial commit\n 1 file changed, 10 insertions(+)\n create mode 100644 index.html`;
      } else if (cmdLower.startsWith('git log --oneline')) {
        output = '7ca8c2f feat: initial commit';
      } else if (cmdLower.startsWith('git log')) {
        output = `commit 7ca8c2fd265ea58a2d1f (HEAD -> main)\nAuthor: Student <student@shaivika.ai>\nDate:   Jul 23 20:26:10 2026\n\n    feat: initial commit`;
      } else if (cmdLower.startsWith('git remote -v')) {
        output = 'origin\thttps://github.com/student/git-github-mastery.git (fetch)\norigin\thttps://github.com/student/git-github-mastery.git (push)';
      } else if (cmdLower.startsWith('git remote add')) {
        output = '[OK] Configured remote origin successfully.';
      } else if (cmdLower.startsWith('git push')) {
        output = `Enumerating objects: 3, done.\nCounting objects: 100% (3/3), done.\nWriting objects: 100% (3/3), 284 bytes, done.\nTo https://github.com/student/git-github-mastery.git\n * [new branch]      main -> main`;
      } else if (cmdLower.startsWith('git clone')) {
        output = 'Cloning into \'repo\'...\nremote: Enumerating objects: 12, done.\nremote: Total 12 (delta 2)\nReceiving objects: 100% (12/12), done.';
      } else if (cmdLower.startsWith('git branch')) {
        output = '* main\n  feature/auth';
      } else if (cmdLower.startsWith('git switch') || cmdLower.startsWith('git checkout')) {
        output = 'Switched to branch \'feature/auth\'';
      } else if (cmdLower.startsWith('git merge')) {
        output = 'Updating 7ca8c2f..48df21b\nFast-forward\n index.html | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)';
      } else if (cmdLower.startsWith('git stash')) {
        output = 'Saved working directory and index state WIP on main: 7ca8c2f feat: initial commit';
      } else {
        output = `git: '${cleanCmd}' is simulated successfully. Use 'git status' or 'git log' to see snapshots.`;
      }
    } else {
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
    }

    setTerminalHistory((prev) => [...prev, { cmd: cleanCmd, output }]);
    setActiveTab('terminal');
    toast.success(`Executed "${cleanCmd}" in CLI Terminal Lab!`);
  };

  const linuxCourseData = {
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
    thumbnail: dynamicCourse?.thumbnail || '/assets/images/linux_course_thumbnail.png',
    introText: typeof dynamicCourse?.description === 'string' ? dynamicCourse.description.split('\n\n') : [
      `Welcome to Linux Essentials! Linux is one of the world's most powerful and widely used operating systems, powering everything from web servers and cloud platforms to Android devices, supercomputers, and embedded systems.`,
      `This course is designed for beginners who want to build a strong foundation in Linux. You will learn how Linux works, how to navigate the terminal, manage files and directories, understand permissions, and perform essential system operations using real-world commands.`,
      `By the end of this course, you'll have the confidence to work efficiently in any Linux environment and be prepared for advanced topics such as shell scripting, DevOps, cloud computing, and cybersecurity.`,
    ],
    outcomes: [
      'Master essential Linux CLI terminal navigation commands (cd, ls, pwd, find)',
      'Understand File System Hierarchy Standard (FHS) and directory structure',
      'Manage user accounts, groups, file permissions (chmod, chown) & umask',
      'Monitor processes, manage background jobs & configure Systemd services',
      'Write automated Bash shell scripts with variables, conditionals & loops',
      'Configure SSH hardening, Linux Firewall (UFW) and basic networking tools',
    ],
    modules: [
      {
        id: 1,
        title: 'Module 1: Linux Architecture, Kernel & CLI Fundamentals',
        duration: '8 Hours • 5 Lessons',
        lessons: [
          { id: 101, title: '1.1 Introduction to Unix & Linux Operating System Architecture', duration: '45 mins', type: 'video' },
          { id: 102, title: '1.2 Understanding Shell Architecture & Command Anatomy', duration: '60 mins', type: 'lab' },
          { id: 103, title: '1.3 Navigating Files & Directories (pwd, ls -la, cd, tree)', duration: '50 mins', type: 'lab' },
          { id: 104, title: '1.4 Creating, Copying, Moving & Deleting Files (mkdir, cp, mv, rm)', duration: '60 mins', type: 'lab' },
          { id: 105, title: '1.5 Quiz & Hands-on Terminal Practice: Module 1', duration: '30 mins', type: 'quiz' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: File System Hierarchy, Permissions & Ownership',
        duration: '8 Hours • 5 Lessons',
        lessons: [
          { id: 201, title: '2.1 Linux File System Hierarchy Standard (/root, /etc, /var, /usr)', duration: '55 mins', type: 'video' },
          { id: 202, title: '2.2 File Permissions Demystified: Read, Write & Execute (chmod 755)', duration: '65 mins', type: 'lab' },
          { id: 203, title: '2.3 User & Group Management (chown, chgrp, useradd, sudo)', duration: '60 mins', type: 'lab' },
          { id: 204, title: '2.4 Text Search & Inspection Tools (cat, grep, head, tail, less)', duration: '70 mins', type: 'lab' },
          { id: 205, title: '2.5 Module 2 Practice Quiz', duration: '30 mins', type: 'quiz' },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Process Management, Systemd Services & Cron Jobs',
        duration: '8 Hours • 5 Lessons',
        lessons: [
          { id: 301, title: '3.1 Inspecting Active System Processes (top, htop, ps aux, kill)', duration: '60 mins', type: 'video' },
          { id: 302, title: '3.2 Controlling Daemon Services with Systemd (systemctl status/start)', duration: '75 mins', type: 'lab' },
          { id: 303, title: '3.3 Job Automation with Cron & Crontab Schedules', duration: '50 mins', type: 'lab' },
          { id: 304, title: '3.4 Monitoring System Logs with Journalctl', duration: '45 mins', type: 'lab' },
          { id: 305, title: '3.5 Module 3 Hands-on Assessment', duration: '40 mins', type: 'quiz' },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Bash Scripting, Networking & Security Hardening',
        duration: '8 Hours • 5 Lessons',
        lessons: [
          { id: 401, title: '4.1 Writing Your First Bash Script: Shebang (#!/bin/bash) & Variables', duration: '80 mins', type: 'lab' },
          { id: 402, title: '4.2 Control Flow in Shell Scripts: If/Else Statements & Loops', duration: '90 mins', type: 'lab' },
          { id: 403, title: '4.3 Network Diagnostics (ping, netstat, ss, curl, ip addr)', duration: '60 mins', type: 'lab' },
          { id: 404, title: '4.4 SSH Key Pair Authentication & UFW Firewall Rules', duration: '70 mins', type: 'lab' },
          { id: 405, title: '4.5 Final Course Capstone Project & Certificate Exam', duration: '90 mins', type: 'quiz' },
        ],
      },
    ],
    quizQuestions: [
      {
        id: 1,
        question: 'Which layer of the Operating System directly manages hardware resources like CPU and RAM?',
        options: ['Shell', 'GUI', 'Kernel', 'User Space'],
        correct: 2,
      },
      {
        id: 2,
        question: 'In the command cp -r folder1 folder2, what does the -r option stand for?',
        options: ['Remove', 'Recursive', 'Read-only', 'Revert'],
        correct: 1,
      },
      {
        id: 3,
        question: 'What command takes you back to your previous working directory?',
        options: ['cd ..', 'cd ~', 'cd -', 'pwd'],
        correct: 2,
      },
    ],
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
  const module1LessonsContent: { [key: string | number]: any } = {
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
        </div>
      ),
    },

    104: {
      title: '1.4 Creating, Copying, Moving & Deleting Files',
      time: '60 mins',
      badge: 'File Operations',
      render: (
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">🛠️ Essential File Operations</h4>

            <div className="p-4 bg-slate-50 rounded-2xl border border-sky-100 space-y-2">
              <span className="font-bold text-xs text-sky-900 block">1. Creating Folders & Files (mkdir, touch)</span>
              <InteractiveCmd cmd="mkdir project" desc="Create a single folder" />
              <InteractiveCmd cmd="mkdir -p project/src/components" desc="Create nested directory tree" />
              <InteractiveCmd cmd="touch project/index.js project/README.md" desc="Create empty files" />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-sky-100 space-y-2">
              <span className="font-bold text-xs text-sky-900 block">2. Copying Files & Directories (cp)</span>
              <InteractiveCmd cmd="cp file.txt copy_file.txt" desc="Copy a single file" />
              <InteractiveCmd cmd="cp -r project/ project_backup/" desc="Copy a directory recursively (-r)" />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-sky-100 space-y-2">
              <span className="font-bold text-xs text-sky-900 block">3. Moving & Renaming (mv)</span>
              <InteractiveCmd cmd="mv old_name.txt new_name.txt" desc="Rename a file" />
              <InteractiveCmd cmd="mv report.pdf ~/Documents/" desc="Move file to another directory" />
            </div>

            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
              <span className="font-bold text-xs text-rose-900 flex items-center gap-1">
                ⚠️ 4. Deleting Files & Directories (rm, rmdir) — Permanent!
              </span>
              <InteractiveCmd cmd="rm file.txt" desc="Remove a file" />
              <InteractiveCmd cmd="rmdir empty_folder/" desc="Remove empty directory" />
              <InteractiveCmd cmd="rm -rf unwanted_folder/" desc="Force delete directory and contents (-rf)" />
            </div>
          </div>
        </div>
      ),
    },

    105: {
      title: '1.5 Quiz & Hands-on Terminal Practice',
      time: '30 mins',
      badge: 'Lab Challenge',
      render: (
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">🧪 Hands-on Lab Challenge</h4>
            <p className="text-xs text-slate-700 font-medium">Run the following scenario in your terminal:</p>

            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs space-y-2 font-medium">
              <div className="font-bold text-sky-900">Challenge Scenario Steps:</div>
              <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                <li>Create directory structure: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">devops_lab/scripts</code></li>
                <li>Change directory into <code className="bg-white px-1.5 py-0.5 rounded border font-mono">devops_lab/scripts</code></li>
                <li>Create three empty files: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">deploy.sh, build.sh, test.sh</code></li>
                <li>Move <code className="bg-white px-1.5 py-0.5 rounded border font-mono">test.sh</code> one level up into <code className="bg-white px-1.5 py-0.5 rounded border font-mono">devops_lab</code></li>
                <li>Verify final structure using <code className="bg-white px-1.5 py-0.5 rounded border font-mono">tree</code> or <code className="bg-white px-1.5 py-0.5 rounded border font-mono">ls -la</code></li>
              </ol>
            </div>

            <div className="space-y-2 pt-2">
              <span className="font-bold text-xs text-slate-900 block">Verification Commands (Run Step-by-Step):</span>
              <InteractiveCmd cmd="mkdir -p devops_lab/scripts" desc="Step 1: Create nested directory" />
              <InteractiveCmd cmd="cd devops_lab/scripts" desc="Step 2: Change directory" />
              <InteractiveCmd cmd="touch deploy.sh build.sh test.sh" desc="Step 3: Create empty files" />
              <InteractiveCmd cmd="mv test.sh .." desc="Step 4: Move test.sh up one level" />
              <InteractiveCmd cmd="cd .." desc="Step 5: Change to devops_lab" />
              <InteractiveCmd cmd="ls -R" desc="Step 6: Verify recursive directory structure" />
            </div>
          </div>
        </div>
      ),
    },

    // Module 2 Gamified Lessons
    201: {
      title: '2.1 Linux File System Hierarchy Standard',
      time: '55 mins',
      badge: 'The Citadel Sectors',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "THE CITADEL SECTORS"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Welcome to the Linux Core Citadel. The File System Hierarchy Standard (FHS) is the map of our digital megacity. Every directory is a dedicated sector with a specific security clearance and purpose."
            </p>
          </div>

          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 shadow-lg">
            <div className="text-sky-400 font-bold">/ (Root Level 0)</div>
            <div className="pl-4">├── <span className="text-rose-400 font-bold">/root</span> (Admin Sanctuary)</div>
            <div className="pl-4">├── <span className="text-amber-400 font-bold">/etc</span>  (Control Center)</div>
            <div className="pl-4">├── <span className="text-emerald-400 font-bold">/var</span>  (Live Telemetry & Logs)</div>
            <div className="pl-4">└── <span className="text-sky-300 font-bold">/usr</span>  (User Arsenal)</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">🏢 Key Sectors Breakdown Table</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-sky-50 border-b border-sky-200 text-sky-900 font-bold">
                    <th className="p-3">Sector</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Access Level</th>
                    <th className="p-3">Gamified Analogy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 font-medium text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-rose-600">/root</td>
                    <td className="p-3">Superuser / System Admin home folder</td>
                    <td className="p-3 font-bold text-rose-600">🔴 Restricted (Root Only)</td>
                    <td className="p-3">The High Command Sanctum</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-amber-600">/etc</td>
                    <td className="p-3">System-wide configuration files</td>
                    <td className="p-3 font-bold text-amber-600">🟡 Admin Write / All Read</td>
                    <td className="p-3">The Power Grid & Control Switches</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-emerald-600">/var</td>
                    <td className="p-3">Variable data (logs, databases, mail queues)</td>
                    <td className="p-3 font-bold text-emerald-600">🟢 Dynamic System Writes</td>
                    <td className="p-3">Live Radar & Flight Recorders</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-sky-600">/usr</td>
                    <td className="p-3">User binaries, libraries, and documentation</td>
                    <td className="p-3 font-bold text-sky-600">🔵 Read-Only for Users</td>
                    <td className="p-3">The Equipment Arsenal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },

    202: {
      title: '2.2 File Permissions Demystified',
      time: '65 mins',
      badge: 'Access Badges & Octal Math',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "ACCESS BADGES & SECURITY KEYPADS"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Every data file is locked inside a digital vault. To access it, you need the right Access Badge. Permissions dictate who can Read (r), Write (w), or Execute (x) operations."
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">🔐 Permission Matrix & Octal Math</h4>
            <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 font-mono text-xs space-y-3 shadow-xl">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-sky-950/80 border border-sky-500/40 rounded-xl">
                  <span className="text-sky-400 font-bold block text-[11px]">Owner (User)</span>
                  <span className="text-white text-sm font-bold block mt-1">r  w  x</span>
                  <span className="text-sky-300 text-[10px] block mt-1">4 + 2 + 1 = 7</span>
                </div>
                <div className="p-3 bg-amber-950/80 border border-amber-500/40 rounded-xl">
                  <span className="text-amber-400 font-bold block text-[11px]">Group</span>
                  <span className="text-white text-sm font-bold block mt-1">r  -  x</span>
                  <span className="text-amber-300 text-[10px] block mt-1">4 + 0 + 1 = 5</span>
                </div>
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl">
                  <span className="text-emerald-400 font-bold block text-[11px]">Others</span>
                  <span className="text-white text-sm font-bold block mt-1">r  -  x</span>
                  <span className="text-emerald-300 text-[10px] block mt-1">4 + 0 + 1 = 5</span>
                </div>
              </div>

              <div className="pt-2 text-center text-emerald-400 font-bold text-sm border-t border-slate-800">
                Combined Octal Permission: 755
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-sky-100 font-medium">
                <span className="font-bold text-sky-900 block">r (Read) = 4:</span> Scan / view file contents.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-sky-100 font-medium">
                <span className="font-bold text-amber-900 block">w (Write) = 2:</span> Modify / rewrite data.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-sky-100 font-medium">
                <span className="font-bold text-emerald-900 block">x (Execute) = 1:</span> Run executable program.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-slate-900">🛠️ Key Permission Commands:</h4>
            <InteractiveCmd cmd="chmod 755 deployment_script.sh" desc="Grant Owner full control (7), Group & Others read+execute (5)" />
            <InteractiveCmd cmd="chmod 600 private_key.pem" desc="Restrict file access strictly to the Owner only (600)" />
          </div>
        </div>
      ),
    },

    203: {
      title: '2.3 User & Group Management',
      time: '60 mins',
      badge: 'Guilds & Superuser Overdrive',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "GUILDS, ROLES & SUPERUSER OVERDRIVE"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "In a multi-user OS, users belong to Guilds (Groups). When standard privileges aren't enough, sudo allows you to trigger Superuser Overdrive to override system boundaries."
            </p>
          </div>

          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 font-mono text-xs shadow-xl flex items-center justify-between gap-3 text-slate-300">
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 text-center flex-1">
              <span className="font-bold text-sky-400 block text-[11px]">Regular User</span>
              <span className="text-white text-[10px]">Dev-01</span>
            </div>
            <div className="text-amber-400 font-bold text-[10px] text-center">
              {'───( types: sudo )───►'}
            </div>
            <div className="p-2.5 bg-rose-950/80 rounded-xl border border-rose-500/40 text-center flex-1">
              <span className="font-bold text-rose-400 block text-[11px]">Superuser Overdrive</span>
              <span className="text-white text-[10px]">Root Privilege</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-slate-900">🛠️ Management Commands:</h4>
            <InteractiveCmd cmd="sudo useradd -m -s /bin/bash operative_01" desc="Create a new agent user account" />
            <InteractiveCmd cmd="sudo usermod -aG devops operative_01" desc="Assign operative to the 'devops' guild group" />
            <InteractiveCmd cmd="sudo chown -R operative_01:devops /opt/secure_vault" desc="Transfer directory ownership to user & group" />
          </div>
        </div>
      ),
    },

    204: {
      title: '2.4 Text Search & Inspection Tools',
      time: '70 mins',
      badge: 'Scanner Drones & Thermal Scopes',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "SCANNER DRONES & THERMAL SCOPES"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Searching through megabytes of raw server telemetry manually is impossible. Equipping scanner tools like grep and tail turns your terminal into a deep-range tactical radar."
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">🛠️ Tactical Toolkit & Commands:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-sky-100 font-medium">
                <span className="font-bold text-sky-900 block">cat / less:</span> Display full files / Paginated view.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-sky-100 font-medium">
                <span className="font-bold text-amber-900 block">head -n 20:</span> Inspect first 20 lines of a file.
              </div>
            </div>

            <InteractiveCmd cmd="tail -f /var/log/syslog" desc="Live-stream real-time incoming system log entries" />
            <InteractiveCmd cmd='grep -rn "ERROR" /var/log/' desc="Search for ERROR recursively with line numbers across all logs" />
            <InteractiveCmd cmd='tail -f /var/log/syslog | grep --color "CRITICAL"' desc="Real-time system log monitoring pipeline filtered for CRITICAL" />
          </div>
        </div>
      ),
    },

    205: {
      title: '2.5 Module 2 Practice Quiz',
      time: '30 mins',
      badge: 'Module 2 Assessment',
      render: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm text-slate-900">🎯 Module 2 Assessment Questions</h4>

            <div className="p-4 rounded-2xl bg-slate-50 border border-sky-100 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Q1. Where are global system configuration files stored in the Linux FHS?</span>
              <div className="grid grid-cols-2 gap-2 font-medium">
                <div className="p-2 rounded-xl bg-white border border-sky-100">A) /var</div>
                <div className="p-2 rounded-xl bg-white border border-sky-100">B) /usr</div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 font-bold text-emerald-800">C) /etc (Correct)</div>
                <div className="p-2 rounded-xl bg-white border border-sky-100">D) /root</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-sky-100 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Q2. What numeric permission code gives Owner Full Access (rwx), Group Read & Execute (r-x), and Others No Access (---)?</span>
              <div className="grid grid-cols-2 gap-2 font-medium">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 font-bold text-emerald-800">A) 750 (Correct)</div>
                <div className="p-2 rounded-xl bg-white border border-sky-100">B) 755</div>
                <div className="p-2 rounded-xl bg-white border border-sky-100">C) 644</div>
                <div className="p-2 rounded-xl bg-white border border-sky-100">D) 777</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-sky-100 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Q3. Which command continuously monitors incoming changes at the end of a log file in real-time?</span>
              <div className="grid grid-cols-2 gap-2 font-medium">
                <div className="p-2 rounded-xl bg-white border border-sky-100">A) head -f</div>
                <div className="p-2 rounded-xl bg-white border border-sky-100">B) cat -r</div>
                <div className="p-2 rounded-xl bg-white border border-sky-100">C) grep -live</div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 font-bold text-emerald-800">D) tail -f (Correct)</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Module 3 Gamified Lessons
    301: {
      title: '3.1 Inspecting Active System Processes',
      time: '60 mins',
      badge: 'Threat Radar & Process Extermination',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "THE THREAT RADAR & PROCESS EXTERMINATION"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Every application running on your system spawns a Process with a unique PID (Process ID). Some consume minimal energy, while rogue 'zombie' processes drain system memory like rogue AI entities. Your terminal acts as the threat radar to detect and terminate them."
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">📡 SYSTEM THREAT RADAR</h4>
            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-2 shadow-xl text-slate-300">
              <div className="text-sky-400 font-bold border-b border-slate-800 pb-1">LIVE SYSTEM THREAT MONITOR:</div>
              <div className="flex justify-between text-slate-400">
                <span>PID 1024 [ nginx ]</span>
                <span className="text-emerald-400 font-bold">0.2% CPU (Normal)</span>
              </div>
              <div className="flex justify-between text-rose-400 font-bold bg-rose-950/40 p-1.5 rounded-lg border border-rose-500/30">
                <span>PID 4096 [ python ]</span>
                <span>98.5% CPU ⚠️ (Rogue Process)</span>
              </div>
              <div className="pt-2 text-center text-emerald-400 font-bold border-t border-slate-800">
                Execute: kill -9 4096 💥 Terminated!
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-sky-100 font-medium">
                <span className="font-bold text-sky-900 block">ps aux:</span> Snapshots all running processes.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-sky-100 font-medium">
                <span className="font-bold text-amber-900 block">top / htop:</span> Real-time live CPU & RAM usage monitor.
              </div>
            </div>

            <div className="space-y-2">
              <InteractiveCmd cmd="ps aux | grep python" desc="Find rogue Python processes consuming memory" />
              <InteractiveCmd cmd="kill -9 4096" desc="Forcefully terminate a rogue process immediately (PID 4096)" />
            </div>
          </div>
        </div>
      ),
    },

    302: {
      title: '3.2 Controlling Daemon Services with Systemd',
      time: '75 mins',
      badge: 'Power Grid & Automated Drones',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "POWER GRID & AUTOMATED DRONES"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Daemons are background services—like web servers or database engines—that operate silently without direct user interaction. Systemd is the master power controller managing these background systems."
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">🛠️ Essential Systemctl Commands Table:</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-sky-50 border-b border-sky-200 text-sky-900 font-bold">
                    <th className="p-3">Action</th>
                    <th className="p-3">Command</th>
                    <th className="p-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 font-medium text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-sky-700">Check Status</td>
                    <td className="p-3 font-mono font-bold">systemctl status nginx</td>
                    <td className="p-3">View live operational status & recent log alerts</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-emerald-700">Power On</td>
                    <td className="p-3 font-mono font-bold">sudo systemctl start nginx</td>
                    <td className="p-3">Launch the background service immediately</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-rose-700">Power Off</td>
                    <td className="p-3 font-mono font-bold">sudo systemctl stop nginx</td>
                    <td className="p-3">Shutdown / suspend the service</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-indigo-700">Auto-Boot</td>
                    <td className="p-3 font-mono font-bold">sudo systemctl enable nginx</td>
                    <td className="p-3">Ensure service boots automatically on system startup</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2 pt-2">
              <InteractiveCmd cmd="systemctl status nginx" desc="Check live status of Nginx web service" />
              <InteractiveCmd cmd="sudo systemctl start nginx" desc="Power on Nginx background daemon" />
              <InteractiveCmd cmd="sudo systemctl stop nginx" desc="Power off Nginx background daemon" />
              <InteractiveCmd cmd="sudo systemctl enable nginx" desc="Enable auto-boot on system startup" />
            </div>
          </div>
        </div>
      ),
    },

    303: {
      title: '3.3 Job Automation with Cron & Crontab Schedules',
      time: '50 mins',
      badge: 'Automated Time-Warp Directives',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "AUTOMATED TIME-WARP DIRECTIVES"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Why execute daily backups or health checks manually when you can program automated background scripts? Cron is your system's automated scheduler that executes commands at precise timestamps."
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">⏱️ Crontab Syntax Blueprint</h4>
            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-2 shadow-xl text-slate-300">
              <div className="text-emerald-400 font-bold">* * * * *  /path/to/script.sh</div>
              <div className="text-[11px] text-slate-400 grid grid-cols-5 gap-1 text-center pt-1 border-t border-slate-800">
                <div>Minute (0-59)</div>
                <div>Hour (0-23)</div>
                <div>Day of Mo (1-31)</div>
                <div>Month (1-12)</div>
                <div>Day of Wk (0-6)</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <InteractiveCmd cmd="crontab -e" desc="Edit current user's automation crontab matrix" />
              <InteractiveCmd cmd="30 2 * * * /usr/local/bin/backup_db.sh" desc="Run database backup script every night at 2:30 AM" />
              <InteractiveCmd cmd="*/15 * * * * /scripts/health_check.sh" desc="Run health check ping every 15 minutes" />
            </div>
          </div>
        </div>
      ),
    },

    304: {
      title: '3.4 Monitoring System Logs with Journalctl',
      time: '45 mins',
      badge: 'The Black Box Flight Recorder',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "THE BLACK BOX FLIGHT RECORDER"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "When a system crash occurs, systemd-journald records every system event, kernel alert, and service output into a central, binary black box recorder. journalctl is your extraction scope."
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs shadow-xl text-center space-y-1 text-slate-300">
            <div className="text-rose-400 font-bold">[ System Crash / Error Alert ]</div>
            <div className="text-slate-500">│  ▼ Logged into systemd-journald</div>
            <div className="text-emerald-400 font-bold">journalctl -u nginx</div>
            <div className="text-sky-300 text-[11px] italic">"Critical Error: Out of Memory at 22:15"</div>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-slate-900">🛠️ Diagnostic Extraction Commands:</h4>
            <InteractiveCmd cmd="journalctl -f" desc="View real-time live system logs" />
            <InteractiveCmd cmd="journalctl -u nginx" desc="Extract logs specifically for Nginx web server" />
            <InteractiveCmd cmd="journalctl -b -p err" desc="Inspect high-severity system error logs from current boot" />
          </div>
        </div>
      ),
    },

    305: {
      title: '3.5 Module 3 Hands-on Assessment',
      time: '40 mins',
      badge: 'Incident Response Briefing',
      render: (
        <div className="space-y-6">
          <div className="bg-rose-50/80 p-4 sm:p-5 rounded-2xl border border-rose-200 space-y-2">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">🚨 INCIDENT RESPONSE: "RESCUING THE OVERLOADED SERVER"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Mission Objective: A rogue background process is overloading CPU resources, causing the primary web service to crash. Your objective as a DevOps System Administrator is to diagnose, terminate, automate, and restore normal operational parameters."
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">📝 Step-by-Step Task Objectives & Commands</h4>

            <div className="space-y-2">
              <InteractiveCmd cmd="ps aux | grep python" desc="Task 1: Identify rogue Python high-CPU process" />
              <InteractiveCmd cmd="kill -9 4096" desc="Task 1: Terminate rogue process PID 4096" />
              <InteractiveCmd cmd="systemctl status nginx" desc="Task 2: Check status of crashed web service" />
              <InteractiveCmd cmd="sudo systemctl restart nginx" desc="Task 2: Restart web service" />
              <InteractiveCmd cmd="*/10 * * * * /opt/monitor.sh" desc="Task 3: Schedule cron healthcheck every 10 mins" />
              <InteractiveCmd cmd="journalctl -u nginx" desc="Task 4: Forensic audit system logs for incident timestamp" />
            </div>
          </div>
        </div>
      ),
    },

    // Module 4 Gamified Lessons
    401: {
      title: '4.1 Writing Your First Bash Script',
      time: '80 mins',
      badge: 'Forging Automation Macros',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "FORGING AUTOMATION MACROS"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Manually executing individual commands is like firing single shots. Writing a Bash Script turns your commands into an automated rapid-fire macro. The Shebang (#!/bin/bash) tells the OS kernel which interpreter to use to execute your script."
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">📜 AUTOMATION SCRIPT ANATOMY</h4>
            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-2 shadow-xl text-slate-300">
              <div className="text-amber-400 font-bold">#!/bin/bash</div>
              <div className="text-slate-400"># Define Variables (No spaces around '=')</div>
              <div><span className="text-sky-400">SERVER_NAME</span>="Alpha-Node"</div>
              <div><span className="text-sky-400">BACKUP_DIR</span>="/var/backups"</div>
              <div className="pt-2 text-emerald-400">echo "Deploying update on $SERVER_NAME..."</div>
              <div className="text-emerald-400">echo "Target backup location: ${'{'}BACKUP_DIR{'}'}"</div>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs font-medium">
              <span className="font-bold text-sky-900 block">💡 Pro-Tip:</span>
              Execute <code className="bg-white px-1.5 py-0.5 rounded border border-sky-200 font-mono">chmod +x script.sh</code> to grant execute permissions before running <code className="bg-white px-1.5 py-0.5 rounded border border-sky-200 font-mono">./script.sh</code>.
            </div>

            <div className="space-y-2">
              <InteractiveCmd cmd="chmod +x deploy.sh" desc="Grant execute permission to script" />
              <InteractiveCmd cmd="./deploy.sh" desc="Execute automation script macro" />
            </div>
          </div>
        </div>
      ),
    },

    402: {
      title: '4.2 Control Flow in Shell Scripts',
      time: '90 mins',
      badge: 'Cybernetic Logic Gates & Loops',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "CYBERNETIC LOGIC GATES & LOOPS"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Static scripts execute linearly, but dynamic scripts make tactical decisions based on system states using If/Else Statements and repeat operations across multiple nodes using Loops."
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">🛠️ Logic & Iteration Examples:</h4>

            <div className="p-4 bg-slate-50 rounded-2xl border border-sky-100 space-y-2 text-xs font-mono">
              <span className="font-bold text-slate-900 font-sans block">1. Conditional Logic (if/else disk alert):</span>
              <div className="bg-slate-950 p-3.5 rounded-xl text-slate-300 space-y-1">
                <div className="text-amber-400 font-bold">THRESHOLD=80</div>
                <div className="text-emerald-400">if [ "$CURRENT_USAGE" -gt "$THRESHOLD" ]; then</div>
                <div className="pl-4 text-rose-400">echo "⚠️ ALERT: Disk Usage is critically high!"</div>
                <div className="text-emerald-400">else</div>
                <div className="pl-4 text-sky-300">echo "🟢 OK: Disk usage is normal."</div>
                <div className="text-emerald-400">fi</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-sky-100 space-y-2 text-xs font-mono">
              <span className="font-bold text-slate-900 font-sans block">2. Iterating through Nodes (for loop across IPs):</span>
              <div className="bg-slate-950 p-3.5 rounded-xl text-slate-300 space-y-1">
                <div className="text-sky-400">SERVERS=("192.168.1.10" "192.168.1.11" "192.168.1.12")</div>
                <div className="text-emerald-400">for IP in "${'{'}SERVERS[@]{'}'}"; do</div>
                <div className="pl-4 text-amber-300">echo "📡 Scanning target node: $IP..."</div>
                <div className="text-emerald-400">done</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <InteractiveCmd cmd="./check_disk.sh" desc="Execute conditional disk usage alert script" />
              <InteractiveCmd cmd="./scan_nodes.sh" desc="Execute node scanner loop script" />
            </div>
          </div>
        </div>
      ),
    },

    403: {
      title: '4.3 Network Diagnostics',
      time: '60 mins',
      badge: 'Cyber Scanners & Telemetry Radar',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "CYBER SCANNERS & TELEMETRY RADAR"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "When data packets stall, network diagnostic tools turn your terminal into a deep-space scanner to ping targets, inspect active socket ports, and test API endpoints."
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-slate-900">📡 Diagnostic Tool Arsenal:</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-sky-50 border-b border-sky-200 text-sky-900 font-bold">
                    <th className="p-3">Tool</th>
                    <th className="p-3">Full Form / Description</th>
                    <th className="p-3">Gamified Analogy</th>
                    <th className="p-3">Primary Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 font-medium text-slate-800">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-sky-700">ip addr</td>
                    <td className="p-3">IP Address Show</td>
                    <td className="p-3">Local Identification Badge</td>
                    <td className="p-3">Find machine's local/public IP</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-emerald-700">ping</td>
                    <td className="p-3">Packet InterNet Groper</td>
                    <td className="p-3">Pulse Echo Locator</td>
                    <td className="p-3">Check if remote host is reachable</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-amber-700">ss / netstat</td>
                    <td className="p-3">Socket Statistics</td>
                    <td className="p-3">Open Port Radar</td>
                    <td className="p-3">List listening open ports (80/443)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-purple-700">curl</td>
                    <td className="p-3">Client URL</td>
                    <td className="p-3">Tactical Data Retrieval Drone</td>
                    <td className="p-3">Query web servers & API endpoints</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2 pt-2">
              <InteractiveCmd cmd="curl -I https://api.github.com" desc="Test API endpoint response and print HTTP headers" />
              <InteractiveCmd cmd="sudo ss -tulpn" desc="Inspect all listening TCP ports and running process names" />
              <InteractiveCmd cmd="ping -c 4 google.com" desc="Send 4 pulse echo ICMP packets to target domain" />
            </div>
          </div>
        </div>
      ),
    },

    404: {
      title: '4.4 SSH Key Pair Authentication & UFW Firewall',
      time: '70 mins',
      badge: 'Encrypted Portal Keys & Citadel Shields',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-50/80 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">🎮 GAMIFIED LORE: "ENCRYPTED PORTAL KEYS & CITADEL DEFENSE SHIELDS"</span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "Passwords can be brute-forced. SSH Key Pair Authentication uses asymmetric encryption (Public & Private Keys) to open secure encrypted portals. UFW (Uncomplicated Firewall) acts as the defensive shield blocking unauthorized network traffic."
            </p>
          </div>

          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 font-mono text-xs shadow-xl flex items-center justify-between gap-3 text-slate-300">
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 text-center flex-1">
              <span className="font-bold text-sky-400 block text-[11px]">Private Key</span>
              <span className="text-white text-[10px]">(id_ed25519)</span>
            </div>
            <div className="text-emerald-400 font-bold text-[10px] text-center">
              {'🔐 Encrypted Portal ═════════►'}
            </div>
            <div className="p-2.5 bg-sky-950/80 rounded-xl border border-sky-500/40 text-center flex-1">
              <span className="font-bold text-sky-400 block text-[11px]">Public Key</span>
              <span className="text-white text-[10px]">(authorized_keys)</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading font-bold text-sm text-slate-900">🛠️ Key Citadel Defense Commands:</h4>
            <InteractiveCmd cmd='ssh-keygen -t ed25519 -C "admin@citadel.com"' desc="Generate secure ED25519 SSH Key Pair" />
            <InteractiveCmd cmd="ssh-copy-id user@remote_server_ip" desc="Deploy public key to remote server" />
            <InteractiveCmd cmd="sudo ufw default deny incoming" desc="Set UFW firewall default incoming shield block" />
            <InteractiveCmd cmd="sudo ufw allow 22/tcp" desc="Allow SSH access on port 22" />
            <InteractiveCmd cmd="sudo ufw allow 80/tcp" desc="Allow HTTP web traffic on port 80" />
            <InteractiveCmd cmd="sudo ufw enable" desc="Enable UFW firewall defensive shield" />
          </div>
        </div>
      ),
    },

    405: {
      title: '4.5 Final Course Capstone Project & Certificate Exam',
      time: '90 mins',
      badge: 'Operation Citadel Shield & Certification',
      render: (
        <div className="space-y-6">
          <div className="bg-sky-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-sky-700 space-y-4">
            <div className="flex items-center gap-2 border-b border-sky-700 pb-3">
              <Award className="w-6 h-6 text-amber-400" />
              <h3 className="font-heading font-extrabold text-xl text-white">
                🚀 CAPSTONE MISSION BRIEFING: "OPERATION CITADEL SHIELD"
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-sky-100 font-medium leading-relaxed">
              Scenario: You are tasked with setting up and securing a multi-tier Linux web server environment from scratch, automating system health checks, and locking down unauthorized network access.
            </p>

            <div className="p-4 bg-sky-950/80 rounded-2xl border border-sky-600/50 text-xs font-mono text-sky-300 space-y-2">
              <div className="font-bold text-amber-300">CAPSTONE PIPELINE WORKFLOW:</div>
              <div>1. User Setup {'──►'} 2. Firewall Shield {'──►'} 3. Automation Script {'──►'} 4. Final Audit</div>
              <div className="text-[11px] text-slate-400">(chown/sudo) ➜ (UFW Ports 22,80) ➜ (Disk & Log Check) ➜ (Crontab Deployment)</div>
            </div>
          </div>

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

  const toggleLessonComplete = (lessonId: number | string) => {
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
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Link to="/courses" className="hover:text-sky-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sky-600 font-bold">{courseData.category}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
            <Terminal className="w-3.5 h-3.5 text-sky-500" />
            <span>{courseData.subtitle}</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
            {courseData.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1 font-medium">
            <span className="flex items-center gap-1 font-bold text-amber-600">
              <Star className="w-4 h-4 fill-current text-amber-400" />
              {courseData.rating} ({courseData.reviews} reviews)
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-sky-600" /> {courseData.duration}
            </span>
            <span className="bg-sky-50 text-sky-700 font-bold px-2.5 py-0.5 rounded-lg border border-sky-200 text-[11px]">
              {courseData.level}
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
            <span className="font-bold text-sm text-slate-900 block">{courseData.instructor}</span>
            <span className="text-[11px] text-sky-700 block font-medium">{courseData.role}</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Header */}
      <div className="bg-white/90 border border-sky-200/80 p-2 rounded-2xl shadow-sm flex overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('intro')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'intro'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Introduction & Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('index')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'index'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Modules & Index Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'terminal'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Live CLI Terminal Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'quiz'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>AI Knowledge Quiz</span>
        </button>
      </div>

      {/* Tab 1: Course Introduction & Overview */}
      {activeTab === 'intro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Introduction Card */}
            <div className="bg-white/95 border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-sky-100 pb-3">
                <Sparkles className="w-5 h-5 text-sky-600 animate-pulse" />
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">
                  Course Introduction
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {courseData.introText.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            {!isGitCourse ? (
              /* Module 1 Deep Dive: Architecture Diagrams & Linux Distros */
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
            ) : (
              /* Git Architecture Visualization Card */
              <div className="bg-white/95 border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 space-y-6">
                <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-sky-600" />
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">
                      Git Architecture & Workflow Lifecycles
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    Distributed Version Control
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Git manages project history as a series of content snapshots. Files move dynamically through stages as you edit, stage, commit locally, and synchronize upstream to GitHub.
                </p>

                {/* Responsive Git Lifecycle Diagram */}
                <div className="space-y-4 bg-slate-900/95 p-5 rounded-2xl border border-slate-800 text-white font-mono">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    Local to Remote Git Pipeline
                  </h4>
                  
                  <div className="flex flex-col md:flex-row items-stretch justify-between gap-3 text-center text-[11px]">
                    <div className="flex-1 p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-red-400 text-xs">Working Directory</h5>
                        <p className="text-[10px] text-slate-400 mt-1">Untracked & Modified files</p>
                      </div>
                      <div className="text-slate-500 text-[10px] mt-2 italic">Local workspace</div>
                    </div>
                    
                    <div className="flex items-center justify-center text-emerald-400 font-extrabold text-xs py-1 md:py-0">
                      <span className="md:hidden">▼ git add</span>
                      <span className="hidden md:inline">➔ git add ➔</span>
                    </div>

                    <div className="flex-1 p-3.5 bg-amber-950/40 border border-amber-900/50 rounded-xl flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-amber-400 text-xs">Staging Area</h5>
                        <p className="text-[10px] text-slate-400 mt-1">Snapshot index file (.git/index)</p>
                      </div>
                      <div className="text-slate-500 text-[10px] mt-2 italic">Prepared modifications</div>
                    </div>

                    <div className="flex items-center justify-center text-emerald-400 font-extrabold text-xs py-1 md:py-0">
                      <span className="md:hidden">▼ git commit</span>
                      <span className="hidden md:inline">➔ git commit ➔</span>
                    </div>

                    <div className="flex-1 p-3.5 bg-blue-950/40 border border-blue-900/50 rounded-xl flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-blue-400 text-xs">Local Repo</h5>
                        <p className="text-[10px] text-slate-400 mt-1">Object database commits (.git/objects)</p>
                      </div>
                      <div className="text-slate-500 text-[10px] mt-2 italic">Permanent snapshot (HEAD)</div>
                    </div>

                    <div className="flex items-center justify-center text-emerald-400 font-extrabold text-xs py-1 md:py-0">
                      <span className="md:hidden">▼ git push</span>
                      <span className="hidden md:inline">➔ git push ➔</span>
                    </div>

                    <div className="flex-1 p-3.5 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-emerald-400 text-xs">Remote GitHub</h5>
                        <p className="text-[10px] text-slate-400 mt-1">Public or private hosting upstream</p>
                      </div>
                      <div className="text-slate-500 text-[10px] mt-2 italic">Cloud sharing hub</div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
                    * Run <strong>git pull</strong> or <strong>git clone</strong> to synchronize remote repositories back to your local environment.
                  </p>
                </div>

                {/* Git Workflow Steps */}
                <div className="space-y-4 pt-4 border-t border-sky-100">
                  <div className="space-y-1">
                    <h3 className="font-heading font-extrabold text-lg text-slate-900">
                      Git Collaboration Best Practices
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Follow standard branch-based pipelines to build robust, bug-free software packages dynamically.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { title: '1. Branch Strategy', desc: 'Never commit directly to main. Create feature branches (e.g. feature/auth, bugfix/layout) to isolate developmental changes.' },
                      { title: '2. Small Commits', desc: 'Keep commits small and descriptive. Use conventional commit prefix messages (feat: , fix: , docs: ) to document progress.' },
                      { title: '3. Pull Requests', desc: 'Open Pull Requests (PR) early to discuss additions. Assign teammates for code reviews and require checkmarks before merge.' },
                      { title: '4. Rebase vs Merge', desc: 'Use rebasing to maintain linear commit flows, and merging to record explicit branch additions in the history logs.' },
                    ].map((step, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-sky-100 bg-slate-50/50 space-y-1">
                        <span className="font-extrabold text-slate-900 block">{step.title}</span>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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

          {/* Sidebar Quick Info */}
          <div className="space-y-6">
            <div className="bg-white/95 border border-sky-200/80 p-6 rounded-3xl shadow-xl shadow-sky-500/10 space-y-4">
              <h3 className="font-heading font-bold text-base text-slate-900">Course Overview</h3>

              <div className="space-y-3 text-xs font-medium">
                <div className="flex justify-between py-2 border-b border-sky-100">
                  <span className="text-slate-500">Total Duration</span>
                  <span className="font-bold text-slate-900">{courseData.duration}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-sky-100">
                  <span className="text-slate-500">Modules</span>
                  <span className="font-bold text-slate-900">{courseData.modules.length} Modules</span>
                </div>
                <div className="flex justify-between py-2 border-b border-sky-100">
                  <span className="text-slate-500">Total Lessons</span>
                  <span className="font-bold text-slate-900">{courseData.modules.flatMap((m) => m.lessons).length} Lessons</span>
                </div>
                <div className="flex justify-between py-2 border-b border-sky-100">
                  <span className="text-slate-500">Interactive Labs</span>
                  <span className="font-bold text-slate-900">{courseData.modules.flatMap((m) => m.lessons).filter((l) => l.type === 'lab').length} CLI Labs</span>
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
                <span>View Modules & Start Learning</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Modules & Index Tree */}
      {activeTab === 'index' && (
        <div className="bg-white/95 border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 space-y-6">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900">
                Course Curriculum & Modules Index
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any lesson to read its content inline and run commands directly in the CLI terminal.</p>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              {completedLessons.length} / {courseData.modules.flatMap((m) => m.lessons).length} Lessons Completed
            </span>
          </div>

          <div className="space-y-4">
            {courseData.modules.map((mod) => {
              const isOpen = activeModule === mod.id;
              return (
                <div key={mod.id} className="border border-sky-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button
                    onClick={() => setActiveModule(isOpen ? null : mod.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between bg-white hover:bg-sky-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-200">
                        {mod.id}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                          {mod.title}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium">{mod.duration}</span>
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
                              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                                isSelected
                                  ? 'bg-sky-50/90 border-sky-400 shadow-md ring-2 ring-sky-400/20'
                                  : 'bg-white border-sky-100 hover:border-sky-300 hover:shadow-xs'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  onClick={() => toggleLessonComplete(lesson.id)}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                    isDone ? 'bg-emerald-500 text-white' : 'border border-slate-300 hover:border-sky-500'
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
                                  className={`px-3 py-1 font-bold rounded-lg border text-[11px] transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                      : 'bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 border-sky-200'
                                  }`}
                                >
                                  {isSelected ? 'Hide Topic' : 'View Topic'}
                                </button>
                              </div>
                            </div>

                            {/* Direct Inline Topic Content Drawer */}
                            {isSelected && (() => {
                              const activeLessonObj = isGitCourse 
                                ? (gitLessonsData[lesson.id] || {
                                    id: lesson.id,
                                    title: lesson.title,
                                    time: lesson.duration || '15 mins',
                                    badge: 'Topic Guide',
                                    content: `### ${lesson.title}\nDetailed syllabus notes for this topic are prepared. Practice related commands in the terminal lab!`,
                                  })
                                : module1LessonsContent[lesson.id];

                              const allLessons = courseData.modules.flatMap((m) => m.lessons);
                              const currentLessonIndex = allLessons.findIndex((l) => l.id === lesson.id);
                              const hasPrevLesson = currentLessonIndex > 0;
                              const hasNextLesson = currentLessonIndex < allLessons.length - 1;

                              const handlePrevLesson = () => {
                                if (hasPrevLesson) {
                                  setSelectedLessonId(allLessons[currentLessonIndex - 1].id);
                                }
                              };

                              const handleNextLesson = () => {
                                if (hasNextLesson) {
                                  setSelectedLessonId(allLessons[currentLessonIndex + 1].id);
                                }
                              };

                              const isDone = completedLessons.includes(lesson.id);

                              return (
                                <div className="p-5 sm:p-6 bg-white rounded-2xl border border-sky-200 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
                                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                                      {activeLessonObj?.badge || 'Interactive Lesson'} • {lesson.duration || activeLessonObj?.time}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          const event = new CustomEvent('open-ai-tutor', {
                                            detail: {
                                              lessonTitle: lesson.title,
                                              lessonContent: activeLessonObj?.content || ''
                                            }
                                          });
                                          window.dispatchEvent(event);
                                          toast.info('AI Tutor panel activated for this topic!');
                                        }}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                      >
                                        <Bot className="w-3.5 h-3.5" />
                                        <span>Ask AI Tutor</span>
                                      </button>
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
                                  </div>

                                  {isGitCourse ? (
                                    <div className="space-y-4">
                                      {/* Markdown content */}
                                      <div className="text-slate-700 space-y-2">
                                        {activeLessonObj?.content && renderMarkdown(activeLessonObj.content)}
                                      </div>

                                      {/* Practice Commands */}
                                      {activeLessonObj?.commands && activeLessonObj.commands.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                          <h5 className="font-heading font-bold text-xs text-slate-500 uppercase tracking-wider">Practice Commands:</h5>
                                          {activeLessonObj.commands.map((cmdObj: any, cidx: number) => (
                                            <InteractiveCmd key={cidx} cmd={cmdObj.command} desc={cmdObj.description} />
                                          ))}
                                        </div>
                                      )}

                                      {/* Study Resources */}
                                      {activeLessonObj?.resources && activeLessonObj.resources.length > 0 && (
                                        <div className="space-y-2 mt-4 pt-4 border-t border-sky-100">
                                          <h5 className="font-heading font-bold text-xs text-slate-500 uppercase tracking-wider">Study Resources:</h5>
                                          <div className="flex flex-wrap gap-2">
                                            {activeLessonObj.resources.map((res: any, ridx: number) => (
                                              <a
                                                key={ridx}
                                                href={res.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[11px] font-bold border border-sky-200 flex items-center gap-1.5"
                                              >
                                                <BookOpen className="w-3.5 h-3.5" />
                                                <span>{res.title}</span>
                                              </a>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    /* Linux Course render content fallback */
                                    activeLessonObj?.render || (
                                      <div className="p-4 bg-sky-50 text-slate-700 rounded-2xl text-xs font-medium">
                                        Detailed topic guide for this lesson is ready. Practice hands-on Linux CLI commands in the Terminal Lab!
                                      </div>
                                    )
                                  )}

                                  {/* Next/Prev Navigation and Mark as Complete */}
                                  <div className="flex items-center justify-between pt-5 border-t border-sky-100 mt-6">
                                    <button
                                      disabled={!hasPrevLesson}
                                      onClick={handlePrevLesson}
                                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                        hasPrevLesson
                                          ? 'border-sky-200 text-slate-700 hover:bg-sky-50 cursor-pointer'
                                          : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                                      }`}
                                    >
                                      <span>Previous Topic</span>
                                    </button>

                                    <button
                                      onClick={() => toggleLessonComplete(lesson.id)}
                                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                                        isDone
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                                      }`}
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>{isDone ? 'Topic Completed' : 'Mark as Complete'}</span>
                                    </button>

                                    <button
                                      disabled={!hasNextLesson}
                                      onClick={handleNextLesson}
                                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                        hasNextLesson
                                          ? 'border-sky-200 text-slate-700 hover:bg-sky-50 cursor-pointer'
                                          : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                                      }`}
                                    >
                                      <span>Next Topic</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
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

      {/* Tab 3: Live Interactive Terminal */}
      {activeTab === 'terminal' && (
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-4 font-mono text-xs text-emerald-400">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white text-sm">Interactive Linux CLI Terminal Lab</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Online • Kernel 6.8.0
            </span>
          </div>

          <div className="space-y-3 min-h-75 max-h-112 overflow-y-auto p-2">
            <p className="text-slate-400">
              Type Linux CLI commands below or click <span className="text-emerald-300">"▶ Run in Terminal"</span> next to any command in the curriculum!
            </p>

            {terminalHistory.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <span>student@shaivika-lms:~$</span>
                  <span className="text-white">{h.cmd}</span>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap pl-4 text-[11px] leading-relaxed">{h.output}</pre>
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

      {/* Tab 4: AI Knowledge Quiz */}
      {activeTab === 'quiz' && (
        <div className="bg-white/95 border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 space-y-6">
          <div className="flex items-center justify-between border-b border-sky-100 pb-4">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900">
                Linux Essentials Knowledge Check
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Test your understanding of Linux commands and file system permissions.</p>
            </div>
          </div>

          <div className="space-y-6">
            {courseData.quizQuestions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-sky-100 space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  {idx + 1}. {q.question}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                  {q.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        quizAnswers[q.id] === optIdx
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-800 border-sky-200 hover:bg-sky-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {quizSubmitted ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <h3 className="font-heading font-bold text-lg text-emerald-800">
                Quiz Complete! Score: {calculateScore()} / {courseData.quizQuestions.length}
              </h3>
              <p className="text-xs text-emerald-700 font-medium">
                Great job! You have demonstrated strong competency in fundamental Linux commands.
              </p>
            </div>
          ) : (
            <button
              onClick={() => {
                setQuizSubmitted(true);
                toast.success('Quiz submitted successfully!');
              }}
              className="btn-blue-primary w-full py-3 text-xs font-bold shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              Submit Quiz & Check Score
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default CourseView;
