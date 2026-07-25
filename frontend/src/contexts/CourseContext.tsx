import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

export type LearningUnitType = 'Video' | 'Reading' | 'Quiz' | 'Assignment';

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  marks?: number;
}

export interface LearningUnitItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: LearningUnitType;
  videoUrl?: string;
  readingContent?: string;
  quizQuestions?: QuizQuestion[];
  quizDifficulty?: 'Easy' | 'Medium' | 'Hard';
  quizPassingScore?: number;
  quizTimer?: number;
  assignmentInstructions?: string;
  assignmentReferenceFiles?: string;
  assignmentMaxMarks?: number;
  assignmentDeadline?: string;
  assignmentAllowedTypes?: string;
  assignmentRubric?: string;
  assignmentSubmissionStatus?: string;
  assignmentTeacherFeedback?: string;
}

export interface TopicItem {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  learningUnits: LearningUnitItem[];
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: TopicItem[];
}

export interface CourseItem {
  id: number | string;
  title: string;
  subtitle?: string;
  instructor: string;
  role?: string;
  avatar?: string;
  rating: number;
  reviews?: number;
  students: string;
  duration: string;
  category: string;
  level?: string;
  badge?: string;
  tracks?: string;
  thumbnail: string;
  status: 'Published' | 'Draft';
  description: string;
  syllabus: string[];
  modules?: ModuleItem[];
  createdAt?: string;
}

interface CourseContextType {
  courses: CourseItem[];
  publishedCourses: CourseItem[];
  addCourse: (course: Partial<CourseItem>) => Promise<void>;
  toggleCourseStatus: (id: number | string) => Promise<void>;
  deleteCourse: (id: number | string) => Promise<void>;
  getCourseById: (id: number | string) => CourseItem | undefined;
  updateCourse: (id: number | string, updates: Partial<CourseItem>) => Promise<void>;
}

// Helper to enrich learning units with default content if missing
const enrichCourseMockContent = (course: CourseItem): CourseItem => {
  if (!course.modules) return course;
  const enrichedModules = course.modules.map(m => {
    const enrichedTopics = m.topics.map(t => {
      const enrichedUnits = t.learningUnits.map(u => {
        const enrichedUnit = { ...u };
        if (u.type === 'Video' && !u.videoUrl) {
          enrichedUnit.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        } else if (u.type === 'Reading' && !u.readingContent) {
          enrichedUnit.readingContent = `## ${u.title}\n\n${u.description}\n\n### Core Study Guide\nGit and system configurations are essential to maintain workspace integrity. Ensure that you follow step-by-step instructions carefully.\n\n#### Key Takeaways\n- Verify configuration details using validation flags.\n- Log descriptive commit titles to ease review actions.\n- Push changes early to prevent merge conflicts.`;
        } else if (u.type === 'Quiz' && (!u.quizQuestions || u.quizQuestions.length === 0)) {
          enrichedUnit.quizDifficulty = 'Medium';
          enrichedUnit.quizPassingScore = 70;
          enrichedUnit.quizTimer = 10;
          enrichedUnit.quizQuestions = [
            {
              id: `q-${u.id}-1`,
              questionText: `Which of the following describes the core goal of "${u.title}"?`,
              options: [
                'Establishing structural configuration guidelines',
                'Simulating production environments locally',
                'Optimizing workspace pipeline runs',
                'All of the above'
              ],
              correctAnswerIndex: 3,
              explanation: 'This topic covers configurations, local simulations, and optimization pipelines, which are all part of the core goals.',
              marks: 5
            },
            {
              id: `q-${u.id}-2`,
              questionText: `What is a common best practice associated with this topic?`,
              options: [
                'Committing directly without branch validations',
                'Using descriptive commit logs and peer reviews',
                'Disabling branch protections for fast merges',
                'Ignoring configuration scopes'
              ],
              correctAnswerIndex: 1,
              explanation: 'Descriptive commit logs and robust peer review workflows maintain software codebase quality and tracking history.',
              marks: 5
            }
          ];
        } else if (u.type === 'Assignment' && !u.assignmentInstructions) {
          enrichedUnit.assignmentMaxMarks = 100;
          enrichedUnit.assignmentDeadline = '7 days after module start';
          enrichedUnit.assignmentAllowedTypes = 'PDF, ZIP, MD';
          enrichedUnit.assignmentReferenceFiles = 'git-cheat-sheet.pdf, lab-setup-guide.md';
          enrichedUnit.assignmentRubric = 'Completeness (50%), Correctness (30%), Quality (20%)';
          enrichedUnit.assignmentSubmissionStatus = 'Not Submitted';
          enrichedUnit.assignmentTeacherFeedback = 'Assignment pending student upload response.';
          enrichedUnit.assignmentInstructions = `### Practical Assignment: ${u.title}\n\n**Goal**: Implement the tasks described in the description: *${u.description}*.\n\n#### Instructions & Deliverables:\n1. Open your terminal or workspace panel.\n2. Perform the required steps as outlined in the lessons.\n3. Verify your configuration outputs run without errors.\n4. Write a short summary (150-300 words) describing your findings and commit your configuration file.\n\n#### Grading Rubric:\n- **Completeness (50%)**: All steps executed and logged.\n- **Correctness (30%)**: Correct parameters and inputs.\n- **Documentation (20%)**: Clean descriptions and summaries.`;
        }
        return enrichedUnit;
      });
      return { ...t, learningUnits: enrichedUnits };
    });
    return { ...m, topics: enrichedTopics };
  });
  return { ...course, modules: enrichedModules };
};

const initialDefaultCoursesRaw: CourseItem[] = [
  {
    id: 1,
    title: 'Introduction to Linux & System Administration',
    subtitle: '🐧 Linux Essentials',
    instructor: 'Bhanu Prakash Achari',
    role: 'Linux Systems Architect & AI Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 1450,
    students: '28,900',
    duration: '32 hrs',
    category: 'Linux & Systems',
    level: 'Beginner to Advanced',
    badge: 'Featured Track',
    tracks: '4 Modules (32 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/linux_course_thumbnail.png',
    description: `Welcome to Linux Essentials! Linux is one of the world's most powerful and widely used operating systems, powering everything from web servers and cloud platforms to Android devices, supercomputers, and embedded systems. This course is designed for beginners who want to build a strong foundation in Linux. You will learn how Linux works, how to navigate the terminal, manage files and directories, understand permissions, and perform essential system operations using real-world commands. By the end of this course, you'll have the confidence to work efficiently in any Linux environment and be prepared for advanced topics such as shell scripting, DevOps, cloud computing, and cybersecurity.`,
    syllabus: [
      'Module 1: Linux Architecture, Kernel & CLI Fundamentals',
      'Module 2: File System Hierarchy, Permissions & Ownership',
      'Module 3: Process Management, Systemd Services & Cron Jobs',
      'Module 4: Bash Scripting, Networking & Security Hardening',
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Linux Architecture, Kernel & CLI Fundamentals',
        description: 'Learn the architectural layers of Linux operating system and master basic command-line interface fundamentals.',
        duration: '8 hours',
        topics: [
          {
            id: 'topic-1-1',
            title: 'Introduction to Unix & Linux Architecture',
            description: 'Explore hardware interfaces, the Linux Kernel, and various Shell distributions.',
            estimatedDuration: '45 mins',
            learningUnits: [
              { id: 'unit-1-1-1', title: 'History of Unix and Linux OS', description: 'Brief introduction to Linus Torvalds and Unix history.', duration: '15 mins', type: 'Video' },
              { id: 'unit-1-1-2', title: 'Kernel vs User Space Architecture', description: 'Deep dive reading on system call mechanisms.', duration: '20 mins', type: 'Reading' },
              { id: 'unit-1-1-3', title: 'Architecture Basic Review', description: 'Assess comprehension of the kernel layers.', duration: '10 mins', type: 'Quiz' }
            ]
          },
          {
            id: 'topic-1-2',
            title: 'Understanding Shell & Command Anatomy',
            description: 'Deconstruct a command into executable name, option flags, and arguments.',
            estimatedDuration: '30 mins',
            learningUnits: [
              { id: 'unit-1-2-1', title: 'Deconstructing commands (ls, cd, pwd)', description: 'Video deconstruction of flags.', duration: '12 mins', type: 'Video' },
              { id: 'unit-1-2-2', title: 'Command Options & Arguments Lab', description: 'Hands-on assignment creating files using commands.', duration: '30 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'topic-1-3',
            title: 'Navigating Files & Directories',
            description: 'Print working directory and traverse folders with cd, ls, pwd, and tree.',
            estimatedDuration: '35 mins',
            learningUnits: [
              { id: 'unit-1-3-1', title: 'Standard traversal patterns', description: 'Learn cd absolute vs relative paths.', duration: '10 mins', type: 'Video' },
              { id: 'unit-1-3-2', title: 'Traversing the Citadel Directory Tree', description: 'Practice traversing files.', duration: '25 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'topic-1-4',
            title: 'Creating, Copying & Deleting Files',
            description: 'Manipulate filesystem items using mkdir, touch, cp, mv, and rm.',
            estimatedDuration: '40 mins',
            learningUnits: [
              { id: 'unit-1-4-1', title: 'File manipulation essentials', description: 'Overview of touch, mkdir, cp, mv, rm.', duration: '18 mins', type: 'Video' },
              { id: 'unit-1-4-2', title: 'File Operations Practice Quiz', description: 'Quick check on cp recursive options.', duration: '10 mins', type: 'Quiz' }
            ]
          },
          {
            id: 'topic-1-5',
            title: 'Terminal Hands-on Practice',
            description: 'Practice live commands inside simulated terminal environments.',
            estimatedDuration: '40 mins',
            learningUnits: [
              { id: 'unit-1-5-1', title: 'CLI terminal challenge', description: 'Execute final challenge in bash terminal.', duration: '40 mins', type: 'Assignment' }
            ]
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: File System Hierarchy, Permissions & Ownership',
        description: 'Understand file system layouts, standard directory structures, permissions, and managing files/directory access.',
        duration: '8 hours',
        topics: [
          {
            id: 'topic-2-1',
            title: 'Linux Directory Hierarchy Standard (FHS)',
            description: 'Understand standard directories like /etc, /bin, /var, and /usr.',
            estimatedDuration: '30 mins',
            learningUnits: [
              { id: 'unit-2-1-1', title: 'FHS Directory Map walkthrough', description: 'Explore standard directories.', duration: '12 mins', type: 'Video' },
              { id: 'unit-2-1-2', title: 'Directories Matching Quiz', description: 'Match directories to description.', duration: '10 mins', type: 'Quiz' }
            ]
          },
          {
            id: 'topic-2-2',
            title: 'File Permissions (chmod, chown, octal)',
            description: 'Learn numeric permission codes and access badges: Read, Write, and Execute.',
            estimatedDuration: '40 mins',
            learningUnits: [
              { id: 'unit-2-2-1', title: 'Octal permission logic (755 vs 600)', description: 'Video lesson explaining permissions math.', duration: '20 mins', type: 'Video' },
              { id: 'unit-2-2-2', title: 'Permissions Assignment', description: 'Modify private key files to chmod 600.', duration: '20 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'topic-2-3',
            title: 'User & Group Management',
            description: 'Create user accounts, groups, assign roles, and use sudo permissions.',
            estimatedDuration: '30 mins',
            learningUnits: [
              { id: 'unit-2-3-1', title: 'Creating Operative accounts (useradd)', description: 'Learn administrative control commands.', duration: '15 mins', type: 'Video' }
            ]
          },
          {
            id: 'topic-2-4',
            title: 'Text Search & Inspection (cat, grep, tail)',
            description: 'Search log files, output content, and monitor files in real-time.',
            estimatedDuration: '40 mins',
            learningUnits: [
              { id: 'unit-2-4-1', title: 'Deep Log Scanning with Grep and Tail', description: 'Monitor logs in real-time.', duration: '25 mins', type: 'Video' },
              { id: 'unit-2-4-2', title: 'Search & Inspection Assessment', description: 'Find error strings in access logs.', duration: '35 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'topic-2-5',
            title: 'Module 2 Assessment',
            description: 'Test knowledge of file structures, octal permissions, and user permissions.',
            estimatedDuration: '25 mins',
            learningUnits: [
              { id: 'unit-2-5-1', title: 'Module 2 Final Exam', description: '10-question evaluation on files, permissions, and users.', duration: '25 mins', type: 'Quiz' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'git-github-mastery',
    title: 'Git & GitHub Mastery',
    subtitle: '⚡ Git & GitHub Mastery',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '0',
    duration: '20 Hours',
    category: 'Development Tools',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '6 Modules (20 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80',
    description: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, GitHub Actions, CI/CD, Codespaces, and Copilot.',
    syllabus: [
      'Module 1: Version Control & Git Basics',
      'Module 2: GitHub Foundations',
      'Module 3: Advanced Git',
      'Module 4: Repository Management',
      'Module 5: GitHub Actions',
      'Module 6: Modern GitHub Ecosystem',
    ],
    modules: [
      {
        id: 'git-mod-1',
        title: 'Module 1: Version Control & Git Basics',
        description: 'Learn version control concepts, command line basics, and the local Git commit cycle.',
        duration: '3 hours',
        topics: [
          {
            id: 'git-topic-1-1',
            title: 'Introduction to Version Control',
            description: 'Learn what VCS is, the differences between Centralized and Distributed VCS, and the core benefits of Git.',
            estimatedDuration: '62 mins',
            learningUnits: [
              { id: 'git-unit-1-1-1', title: 'What is Version Control', description: 'Video lesson on distributed versus centralized repositories.', duration: '12 mins', type: 'Video' },
              { id: 'git-unit-1-1-2', title: 'Centralized vs Distributed Version Control', description: 'Detailed guide comparing SVN and Git.', duration: '15 mins', type: 'Video' },
              { id: 'git-unit-1-1-3', title: 'Git vs GitHub', description: 'Comparison of git CLI and cloud host platform.', duration: '10 mins', type: 'Video' },
              { id: 'git-unit-1-1-4', title: 'Version Control Basics', description: 'Introductory reading on commit logs, snapshots, and revision histories.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-1-1-5', title: 'VCS Core Knowledge Check', description: 'Quiz testing core VCS architectural rules.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-1-1-6', title: 'Compare VCS Paradigms', description: 'Submit written evaluation comparing SVN checkouts and Git clones.', duration: '20 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-1-2',
            title: 'Git Installation & Configuration',
            description: 'Installing Git on Windows, macOS, and Linux, and configuring user details.',
            estimatedDuration: '48 mins',
            learningUnits: [
              { id: 'git-unit-1-2-1', title: 'Installing and Configuring Git CLI', description: 'Video walkthrough of downloading git binary and testing versions.', duration: '8 mins', type: 'Video' },
              { id: 'git-unit-1-2-2', title: 'Understanding Configuration Scopes', description: 'Reading content on system, global, and local config levels.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-1-2-3', title: 'Git Config Parameters Check', description: 'Quiz on user.name, user.email, and core.editor variables.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-1-2-4', title: 'Configure your Global Config File', description: 'Configure email, editor, defaults, and export the file.', duration: '15 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-1-3',
            title: 'Creating and Initializing Repositories',
            description: 'Initializing repositories, tracking files, and creating your initial workspace setup.',
            estimatedDuration: '63 mins',
            learningUnits: [
              { id: 'git-unit-1-3-1', title: 'Initializing Local Repositories', description: 'Video lesson on running git init and checking empty repo spaces.', duration: '10 mins', type: 'Video' },
              { id: 'git-unit-1-3-2', title: 'Anatomy of the .git Directory', description: 'Reading file analyzing hooks, objects, refs, and configuration layout.', duration: '18 mins', type: 'Reading' },
              { id: 'git-unit-1-3-3', title: 'Repository Init Core Check', description: 'Quiz testing directory structure and metadata concepts.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-1-3-4', title: 'Initialize and Create README', description: 'Initialize repository, write a markdown README, and check status.', duration: '25 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-1-4',
            title: 'Staging Files and Core Commit Lifecycle',
            description: 'Staging workspace items and writing descriptive commit logs.',
            estimatedDuration: '65 mins',
            learningUnits: [
              { id: 'git-unit-1-4-1', title: 'Understanding Staging and Commits', description: 'Video explaining the three Git spaces (working, index, repo).', duration: '15 mins', type: 'Video' },
              { id: 'git-unit-1-4-2', title: 'Tracking File Changes and Lifecycle States', description: 'Reading detailing untracked, unmodified, modified, and staged states.', duration: '20 mins', type: 'Reading' },
              { id: 'git-unit-1-4-3', title: 'Git Commit and Staging States Quiz', description: 'Assessment testing command line status indicators.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-1-4-4', title: 'Make Your First Stage and Commit', description: 'Stage items via git add, write log via git commit.', duration: '20 mins', type: 'Assignment' }
            ]
          }
        ]
      },
      {
        id: 'git-mod-2',
        title: 'Module 2: GitHub Foundations',
        description: 'Understand cloud-based git hosting platforms, remote sync workflows, and baseline branching/merging features.',
        duration: '3 hours',
        topics: [
          {
            id: 'git-topic-2-1',
            title: 'GitHub Setup and Authentication',
            description: 'Setting up a GitHub account, linking SSH keys, and configuring profiles.',
            estimatedDuration: '62 mins',
            learningUnits: [
              { id: 'git-unit-2-1-1', title: 'Setting up GitHub & Registering SSH Keys', description: 'Video walkthrough of SSH key generation and GitHub registration.', duration: '12 mins', type: 'Video' },
              { id: 'git-unit-2-1-2', title: 'SSH vs HTTPS Connection Models', description: 'Reading highlighting the benefits of public-key cryptography over credentials.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-2-1-3', title: 'GitHub Security Basics Check', description: 'Quiz testing protocol choices and validation rules.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-2-1-4', title: 'Generate SSH Keys and Link Account', description: 'Create local ssh keys and register them on github settings panel.', duration: '25 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-2-2',
            title: 'Working with Remote Repositories',
            description: 'Linking local projects to cloud hosting spaces.',
            estimatedDuration: '60 mins',
            learningUnits: [
              { id: 'git-unit-2-2-1', title: 'Linking Local Repos to Remote GitHub Repos', description: 'Video lesson outlining remote addition and verification.', duration: '10 mins', type: 'Video' },
              { id: 'git-unit-2-2-2', title: 'Anatomy of Remote URLs and Origin Pointers', description: 'Reading defining origins and remote references.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-2-2-3', title: 'Remotes Syntax and Commands Quiz', description: 'Quiz on git remote add, rename, and set-url commands.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-2-2-4', title: 'Push Local repository to GitHub remote origin', description: 'Associate local project with remote and execute push.', duration: '25 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-2-3',
            title: 'Pulling, Fetching and Synchronizing Code',
            description: 'Fetching and pulling changes from shared remote branches.',
            estimatedDuration: '60 mins',
            learningUnits: [
              { id: 'git-unit-2-3-1', title: 'Push, Pull, and Fetch Operations', description: 'Video highlighting differences between pull and fetch commands.', duration: '15 mins', type: 'Video' },
              { id: 'git-unit-2-3-2', title: 'Tracking Upstream Branches and Sync Cycles', description: 'Reading detailing head synchronization and upstream pointers.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-2-3-3', title: 'Code Syncing & Pulling Mechanics', description: 'Quiz on merge issues occurring during direct pulls.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-2-3-4', title: 'Synchronize Collaborative Workspace', description: 'Simulate upstream changes, resolve local divergences, and fetch.', duration: '20 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-2-4',
            title: 'Basic Branching & Merging',
            description: 'Creating branches and merging features into base branches.',
            estimatedDuration: '60 mins',
            learningUnits: [
              { id: 'git-unit-2-4-1', title: 'Creating and Switching Branches', description: 'Video detailing git branch and git checkout commands.', duration: '12 mins', type: 'Video' },
              { id: 'git-unit-2-4-2', title: 'Merging Branches: Fast-Forward vs 3-Way Merge', description: 'Reading outlining fast-forward merge rules vs merge commits.', duration: '18 mins', type: 'Reading' },
              { id: 'git-unit-2-4-3', title: 'Branching Pointers and Merge Mechanics', description: 'Quiz on fast-forward requirements and base commits.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-2-4-4', title: 'Perform a Feature Branch Merge', description: 'Create branch, add file commit, switch back, and merge.', duration: '20 mins', type: 'Assignment' }
            ]
          }
        ]
      },
      {
        id: 'git-mod-3',
        title: 'Module 3: Advanced Git',
        description: 'Explore history rollback, stash workspaces, and interactive rebasing options.',
        duration: '4 hours',
        topics: [
          {
            id: 'git-topic-3-1',
            title: 'Resetting, Reverting & Checking Out',
            description: 'Distinguishing between git reset, git revert, and git checkout.',
            estimatedDuration: '73 mins',
            learningUnits: [
              { id: 'git-unit-3-1-1', title: 'Undoing Changes: Checkout, Reset, Revert', description: 'Video detailing checkout, soft/hard reset, and reverting commits.', duration: '18 mins', type: 'Video' },
              { id: 'git-unit-3-1-2', title: 'Soft, Mixed, and Hard Reset Modes', description: 'Reading defining index/staging modifications across resets.', duration: '20 mins', type: 'Reading' },
              { id: 'git-unit-3-1-3', title: 'Git Reset vs Revert Concept Check', description: 'Quiz evaluating clean commit preservation.', duration: '15 mins', type: 'Quiz' },
              { id: 'git-unit-3-1-4', title: 'Safely Revert a Bad Commit', description: 'Revert historical commit without modifying active indices.', duration: '20 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-3-2',
            title: 'Stashing Work in Progress',
            description: 'Temporarily saving working progress without committing.',
            estimatedDuration: '57 mins',
            learningUnits: [
              { id: 'git-unit-3-2-1', title: 'Git Stash Workspace Management', description: 'Video lesson on stashing changes and popping states.', duration: '12 mins', type: 'Video' },
              { id: 'git-unit-3-2-2', title: 'Stashing Partially Untracked or Ignored Files', description: 'Reading detailing --include-untracked and --all options.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-3-2-3', title: 'Stash Stack Operations Quiz', description: 'Quiz evaluating stash list, show, and pop mechanics.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-3-2-4', title: 'Stash WIP to Apply Direct Hotfix', description: 'Simulate workflow: stash modifications, apply hotfix commit, pop stash.', duration: '20 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-3-3',
            title: 'Interactive Rebasing',
            description: 'Rewriting local commit history.',
            estimatedDuration: '80 mins',
            learningUnits: [
              { id: 'git-unit-3-3-1', title: 'Rebasing vs Merging Histories', description: 'Video detailing rebase vs merge commit layouts.', duration: '15 mins', type: 'Video' },
              { id: 'git-unit-3-3-2', title: 'Interactive Rebase Actions: pick, squash, reword, drop', description: 'Reading detailing rebase configurations.', duration: '20 mins', type: 'Reading' },
              { id: 'git-unit-3-3-3', title: 'Interactive Rebasing Commands Quiz', description: 'Quiz on squash and reword configurations.', duration: '15 mins', type: 'Quiz' },
              { id: 'git-unit-3-3-4', title: 'Squash 4 Commits into 1 Clean Feature Commit', description: 'Combine history of local branch before pushing to remote repository.', duration: '30 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-3-4',
            title: 'Cherry-Picking and Reflog Recovery',
            description: 'Recovering deleted commits and branches.',
            estimatedDuration: '72 mins',
            learningUnits: [
              { id: 'git-unit-3-4-1', title: 'Applying Specific Commits with Cherry-Pick', description: 'Video lesson on applying single commits from other branches.', duration: '14 mins', type: 'Video' },
              { id: 'git-unit-3-4-2', title: 'Recovering Lost Commits with Git Reflog', description: 'Reading showing git reflog list structures.', duration: '18 mins', type: 'Reading' },
              { id: 'git-unit-3-4-3', title: 'Cherry-Picking and Reflog Commands Check', description: 'Quiz on reflog hash identification.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-3-4-4', title: 'Use Reflog to Restore Deleted Branch', description: 'Find reflog commit hash and recreate branch pointer.', duration: '30 mins', type: 'Assignment' }
            ]
          }
        ]
      },
      {
        id: 'git-mod-4',
        title: 'Module 4: Repository Management',
        description: 'Implement PR reviews, git submodules, and release tagging protocols.',
        duration: '3 hours',
        topics: [
          {
            id: 'git-topic-4-1',
            title: 'Submodules',
            description: 'Managing external libraries nested inside projects.',
            estimatedDuration: '65 mins',
            learningUnits: [
              { id: 'git-unit-4-1-1', title: 'Managing Nested Repositories with Submodules', description: 'Video lesson on git submodule add.', duration: '15 mins', type: 'Video' },
              { id: 'git-unit-4-1-2', title: 'Detached HEAD Hazards in Submodule Checkouts', description: 'Reading detailing submodule HEAD pointers.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-4-1-3', title: 'Submodules Layout and Sync Check', description: 'Quiz on submodule initialization workflows.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-4-1-4', title: 'Add and Initialize a Submodule in Your Project', description: 'Add submodule link, initialize it, and push changes.', duration: '25 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-4-2',
            title: 'Pull Request Workflows & Reviews',
            description: 'Collaborative code reviews on GitHub.',
            estimatedDuration: '72 mins',
            learningUnits: [
              { id: 'git-unit-4-2-1', title: 'Anatomy of a Collaborative PR workflow', description: 'Video outlining reviewers, status checks, and comments.', duration: '12 mins', type: 'Video' },
              { id: 'git-unit-4-2-2', title: 'PR Peer Review Standards & Communication Guidelines', description: 'Reading on review ethics and conventions.', duration: '20 mins', type: 'Reading' },
              { id: 'git-unit-4-2-3', title: 'PR Workflows and Approvals Quiz', description: 'Quiz on requesting changes and approvals.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-4-2-4', title: 'Review and Submit Feedback on Peer PR', description: 'Review changes, request revisions, approve.', duration: '30 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-4-3',
            title: 'Configuring Branch Protection Rules',
            description: 'Securing the main branch from direct pushes.',
            estimatedDuration: '57 mins',
            learningUnits: [
              { id: 'git-unit-4-3-1', title: 'Enforcing Branch Status Checks & Protections', description: 'Video lesson on GitHub setting panel restrictions.', duration: '12 mins', type: 'Video' },
              { id: 'git-unit-4-3-2', title: 'Requiring PR Reviews and Signed Commits', description: 'Reading on GPG key signatures and approval requirements.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-4-3-3', title: 'Branch Protection Protocols Quiz', description: 'Quiz on administrator restrictions and rules bypasses.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-4-3-4', title: 'Setup Main Branch Protection on GitHub', description: 'Configure branch rule: require PR review before merge.', duration: '20 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-4-4',
            title: 'Semantic Versioning and Releases',
            description: 'Publishing releases with tags.',
            estimatedDuration: '55 mins',
            learningUnits: [
              { id: 'git-unit-4-4-1', title: 'Git Tags: Lightweight vs Annotated Tags', description: 'Video on tag creation and remote synchronization.', duration: '10 mins', type: 'Video' },
              { id: 'git-unit-4-4-2', title: 'Understanding Semantic Versioning (SemVer) Standards', description: 'Reading on major, minor, patch version parameters.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-4-4-3', title: 'SemVer Rules and Release Tagging Quiz', description: 'Quiz checking versioning decisions.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-4-4-4', title: 'Annotate and Publish Release v1.0.0', description: 'Create annotated tag, push tag, publish GitHub release.', duration: '20 mins', type: 'Assignment' }
            ]
          }
        ]
      },
      {
        id: 'git-mod-5',
        title: 'Module 5: GitHub Actions',
        description: 'Build automation CI workflows, run tests, and publish releases automatically.',
        duration: '4 hours',
        topics: [
          {
            id: 'git-topic-5-1',
            title: 'Introduction to GitHub Actions and CI',
            description: 'Core concepts of Actions, YAML workflow layout.',
            estimatedDuration: '63 mins',
            learningUnits: [
              { id: 'git-unit-5-1-1', title: 'GitHub Actions Architecture & Core Concepts', description: 'Video lesson on events, runners, jobs, and steps.', duration: '15 mins', type: 'Video' },
              { id: 'git-unit-5-1-2', title: 'YAML Syntax for GitHub Actions Workflows', description: 'Reading detailing workflow syntax formatting rules.', duration: '18 mins', type: 'Reading' },
              { id: 'git-unit-5-1-3', title: 'Actions Workflows Components Quiz', description: 'Quiz on variables, environments, triggers.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-5-1-4', title: 'Write a Simple Hello World Workflow', description: 'Write workflow file triggering on push events.', duration: '20 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-5-2',
            title: 'Automating Testing Pipelines',
            description: 'Building continuous integration testing pipelines.',
            estimatedDuration: '78 mins',
            learningUnits: [
              { id: 'git-unit-5-2-1', title: 'Setting up CI Test Runners for Node.js/Python', description: 'Video configuring checkout action and node version setups.', duration: '18 mins', type: 'Video' },
              { id: 'git-unit-5-2-2', title: 'Configuring Trigger Events (push, pull_request)', description: 'Reading outlining events configurations.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-5-2-3', title: 'Workflow Trigger Events Quiz', description: 'Quiz testing filters by branch, path.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-5-2-4', title: 'Build a CI Workflow executing Jest tests', description: 'Configure action triggering test suite on pull request.', duration: '35 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-5-3',
            title: 'Security Scanner Workflows',
            description: 'Automating code vulnerability checks.',
            estimatedDuration: '67 mins',
            learningUnits: [
              { id: 'git-unit-5-3-1', title: 'Scanning Repositories for Exposed Secrets', description: 'Video on preventing credentials leakage using scanners.', duration: '12 mins', type: 'Video' },
              { id: 'git-unit-5-3-2', title: 'Implementing Dependabot Security Alerts', description: 'Reading on dependency audits and auto PR generation.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-5-3-3', title: 'DevSecOps Workflows Best Practices Check', description: 'Quiz evaluating security pipeline actions.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-5-3-4', title: 'Integrate CodeQL Static Security Scan', description: 'Integrate GitHub code scanning into action workflow.', duration: '30 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-5-4',
            title: 'Continuous Deployment (CD)',
            description: 'Deploying static sites and assets.',
            estimatedDuration: '75 mins',
            learningUnits: [
              { id: 'git-unit-5-4-1', title: 'CD Deployment with Secrets and Environments', description: 'Video setting environments.', duration: '20 mins', type: 'Video' },
              { id: 'git-unit-5-4-2', title: 'Managing Secret Keys and Deployment Variables', description: 'Reading on secrets integration.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-5-4-3', title: 'Secrets Injection and Deployment Quiz', description: 'Quiz testing secrets context extraction.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-5-4-4', title: 'CD workflow deploying static site to GitHub Pages', description: 'Setup site publishing pipeline using GitHub Actions.', duration: '30 mins', type: 'Assignment' }
            ]
          }
        ]
      },
      {
        id: 'git-mod-6',
        title: 'Module 6: Modern GitHub Ecosystem',
        description: 'Boost developer speed with cloud Codespaces and GitHub Copilot AI assistance.',
        duration: '3 hours',
        topics: [
          {
            id: 'git-topic-6-1',
            title: 'GitHub Codespaces',
            description: 'Using cloud developer environments.',
            estimatedDuration: '65 mins',
            learningUnits: [
              { id: 'git-unit-6-1-1', title: 'Setting up Cloud Codespaces Environments', description: 'Video launching codespaces and setting ports.', duration: '12 mins', type: 'Video' },
              { id: 'git-unit-6-1-2', title: 'Configuring Project Workspaces via devcontainer.json', description: 'Reading detailing container setting configurations.', duration: '18 mins', type: 'Reading' },
              { id: 'git-unit-6-1-3', title: 'Codespaces Dev Containers Quiz', description: 'Quiz testing container extension rules.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-6-1-4', title: 'Create a custom devcontainer configuration', description: 'Write configuration setting extensions, run times.', duration: '25 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-6-2',
            title: 'GitHub Copilot and AI Assistance',
            description: 'Using AI-assisted coding in IDEs.',
            estimatedDuration: '70 mins',
            learningUnits: [
              { id: 'git-unit-6-2-1', title: 'Pair Programming with GitHub Copilot Chat', description: 'Video lesson showing copilot chat features.', duration: '15 mins', type: 'Video' },
              { id: 'git-unit-6-2-2', title: 'Prompt Engineering Practices for Copilot suggestions', description: 'Reading on context guidelines and comments prompting.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-6-2-3', title: 'AI Development ethics and prompts Check', description: 'Quiz testing prompt boundaries.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-6-2-4', title: 'Refactor project functions using Copilot Chat', description: 'Refactor functions, improve space-time efficiency.', duration: '25 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-6-3',
            title: 'Managing Projects with GitHub Projects',
            description: 'Managing issues and projects.',
            estimatedDuration: '57 mins',
            learningUnits: [
              { id: 'git-unit-6-3-1', title: 'GitHub Issues, Projects Kanban, and Milestones', description: 'Video lesson detailing projects tracking.', duration: '12 mins', type: 'Video' },
              { id: 'git-unit-6-3-2', title: 'Organizing Tasks and Automation Rules in Projects', description: 'Reading outlining workflow rules.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-6-3-3', title: 'Agile Project Coordination Quiz', description: 'Quiz testing milestone connections.', duration: '10 mins', type: 'Quiz' },
              { id: 'git-unit-6-3-4', title: 'Configure a Project Board for Project v1.0.0', description: 'Build kanban card columns and assign issues.', duration: '20 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'git-topic-6-4',
            title: 'Software Security & License Compliance',
            description: 'Choosing project licensing.',
            estimatedDuration: '65 mins',
            learningUnits: [
              { id: 'git-unit-6-4-1', title: 'Choosing and Adding Software Licenses to GitHub', description: 'Video lesson on choosing licenses.', duration: '10 mins', type: 'Video' },
              { id: 'git-unit-6-4-2', title: 'Understanding GPL, MIT, Apache, and BSD License scopes', description: 'Reading detailing permissive vs copyleft licenses.', duration: '15 mins', type: 'Reading' },
              { id: 'git-unit-6-4-3', title: 'Software Licensing Compliance Final Quiz', description: 'Evaluation on commercial software deployment rules.', duration: '15 mins', type: 'Quiz' },
              { id: 'git-unit-6-4-4', title: 'Perform Project License audit check', description: 'Perform audit checking on dependency files.', duration: '25 mins', type: 'Assignment' }
            ]
          }
        ]
      }
    ]
  }
];

const initialDefaultCourses = initialDefaultCoursesRaw.map(enrichCourseMockContent);

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved) as CourseItem[];
        // Auto-heal missing default modules or missing content fields
        const merged = initialDefaultCourses.map((def) => {
          const match = parsed.find((p) => String(p.id) === String(def.id));
          if (!match) return def;
          // Auto-heal modules if missing or significantly different count
          if ((!match.modules || match.modules.length < def.modules!.length) && def.modules && def.modules.length > 0) {
            return enrichCourseMockContent({ ...match, modules: def.modules });
          }
          return enrichCourseMockContent(match);
        });

        // Retain other custom admin courses
        parsed.forEach((p) => {
          if (!merged.find((m) => String(m.id) === String(p.id))) {
            merged.push(enrichCourseMockContent(p));
          }
        });

        return merged;
      } catch (e) {
        console.warn('LocalStorage courses parse warning:', e);
      }
    }
    return initialDefaultCourses;
  });

  // Sync with Firestore if available
  useEffect(() => {
    const syncFirestoreCourses = async () => {
      if (!db) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        if (!querySnapshot.empty) {
          const loaded: CourseItem[] = [];
          querySnapshot.forEach((docSnap) => {
            loaded.push(enrichCourseMockContent(docSnap.data() as CourseItem));
          });
          setCourses(loaded);
          localStorage.setItem('shaivika_courses_data', JSON.stringify(loaded));
        }
      } catch (err) {
        console.warn('Firestore courses fetch notice:', err);
      }
    };
    syncFirestoreCourses();
  }, []);

  // Update LocalStorage whenever courses state changes
  useEffect(() => {
    localStorage.setItem('shaivika_courses_data', JSON.stringify(courses));
  }, [courses]);

  const publishedCourses = courses.filter((c) => c.status === 'Published');

  const addCourse = async (coursePayload: Partial<CourseItem>) => {
    const newId = Date.now();
    const created: CourseItem = {
      id: newId,
      title: coursePayload.title || 'Untitled Technical Course',
      subtitle: coursePayload.subtitle || '⚡ Enterprise Track',
      instructor: coursePayload.instructor || 'Bhanu Prakash Achari',
      role: coursePayload.role || 'Senior Technical Instructor',
      avatar: coursePayload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews: 1,
      students: '0',
      duration: coursePayload.duration || '20 hrs',
      category: coursePayload.category || 'Linux & Systems',
      level: coursePayload.level || 'Beginner to Advanced',
      badge: 'New Track',
      status: coursePayload.status || 'Published',
      thumbnail: coursePayload.thumbnail || '/assets/images/linux_course_thumbnail.png',
      description: coursePayload.description || 'Enterprise technical course with hands-on labs and automated AI evaluations.',
      syllabus: coursePayload.syllabus || [
        'Module 1: Fundamental Concepts & Environment Setup',
        'Module 2: Core Command Line & Configuration',
        'Module 3: Advanced Optimization & Security',
        'Module 4: Final Capstone Assessment',
      ],
    };

    const enriched = enrichCourseMockContent(created);
    const updated = [enriched, ...courses];
    setCourses(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'courses', String(newId)), enriched);
      } catch (e) {
        console.warn('Firestore setDoc notice:', e);
      }
    }
  };

  const toggleCourseStatus = async (id: number | string) => {
    const updated = courses.map((c) => {
      if (String(c.id) === String(id)) {
        const nextStatus: 'Published' | 'Draft' = c.status === 'Published' ? 'Draft' : 'Published';
        return { ...c, status: nextStatus };
      }
      return c;
    });

    setCourses(updated);

    if (db) {
      try {
        const target = updated.find((c) => String(c.id) === String(id));
        if (target) {
          await updateDoc(doc(db, 'courses', String(id)), { status: target.status });
        }
      } catch (e) {
        console.warn('Firestore updateDoc notice:', e);
      }
    }
  };

  const deleteCourse = async (id: number | string) => {
    const updated = courses.filter((c) => String(c.id) !== String(id));
    setCourses(updated);
  };

  const getCourseById = (id: number | string): CourseItem | undefined => {
    return courses.find((c) => String(c.id) === String(id)) || initialDefaultCourses[0];
  };

  const updateCourse = async (id: number | string, updates: Partial<CourseItem>) => {
    const updated = courses.map((c) => {
      if (String(c.id) === String(id)) {
        return { ...c, ...updates };
      }
      return c;
    });
    setCourses(updated);

    if (db) {
      try {
        await updateDoc(doc(db, 'courses', String(id)), updates);
      } catch (e) {
        console.warn('Firestore updateCourse notice:', e);
      }
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        publishedCourses,
        addCourse,
        toggleCourseStatus,
        deleteCourse,
        getCourseById,
        updateCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
