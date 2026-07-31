import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { gitCourseModules } from '@/data/gitCourseFullData';
import { courseService } from '@/services/courseService';

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
  practiceLabChallenge?: any;
  resources?: any[];
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
  refreshCourses: () => Promise<void>;
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
    id: 'course_linux_101',
    title: 'Linux Systems & Administration Mastery',
    subtitle: '🐧 Linux Systems Mastery',
    instructor: 'KaizenQ Team',
    role: 'Linux Systems Architect & AI Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 145,
    students: '3',
    duration: '32 hrs',
    category: 'Linux & Systems',
    level: 'Beginner to Advanced',
    badge: 'Featured Track',
    tracks: '4 Modules (32 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/linux_course_thumbnail.png',
    description: `Welcome to Linux Systems & Administration Mastery! Linux powers modern cloud infrastructure, supercomputers, and enterprise AI clusters. In this comprehensive production-ready track, you will explore Linux Kernel mechanics, master file system hierarchy standards (FHS), manage systemd background daemons, automate workflows via Bash scripts, and harden network security using SSH and host firewalls.`,
    syllabus: [
      'Module 1: Linux Architecture, Kernel & CLI Fundamentals',
      'Module 2: File System Hierarchy, Permissions & Ownership',
      'Module 3: Process Management, Systemd Services & Cron Jobs',
      'Module 4: Bash Scripting, Networking & Security Hardening',
    ],
    createdAt: new Date('2026-07-01').toISOString(),
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
      },
      {
        id: 'mod-3',
        title: 'Module 3: Process Management, Log Analysis & Real-World Command Challenges',
        description: 'Master background daemons, system log parsing with realistic datasets, and solve real-world administration challenges.',
        duration: '8 hours',
        topics: [
          {
            id: 'topic-3-1',
            title: 'System Process Management & Daemons',
            description: 'Monitor active processes, manage background jobs with ps, top, htop, and systemctl.',
            estimatedDuration: '45 mins',
            learningUnits: [
              { id: 'unit-3-1-1', title: 'Managing Linux Services with Systemd', description: 'Video lesson on systemctl, journalctl, and daemon signals.', duration: '20 mins', type: 'Video' },
              { id: 'unit-3-1-2', title: 'Process Control & Signals Lab', description: 'Practice killing rogue processes using kill, pkill, and killall.', duration: '25 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'topic-3-2',
            title: '📊 Resource 7: Linux Log Analysis Dataset',
            description: 'A collection of realistic Linux system log files that students can use to practice searching, filtering, sorting, and extracting information using command-line tools.',
            estimatedDuration: '60 mins',
            learningUnits: [
              {
                id: 'unit-3-2-1',
                title: 'Exploring Log Files (system.log, auth.log, apache.log, nginx.log)',
                description: 'Hands-on reading walkthrough analyzing system.log, auth.log, apache.log, nginx.log, access.log, and error.log.',
                duration: '30 mins',
                type: 'Reading',
                readingContent: `## 📊 Resource 7: Linux Log Analysis Dataset\n\n### Overview\nA collection of realistic Linux system log files that students can use to practice searching, filtering, sorting, and extracting information using command-line tools.\n\n### Files Included in Dataset:\n- 📄 **system.log**: General system event logs, kernel messages, and driver warnings.\n- 🔐 **auth.log**: Authentication logs, sshd login attempts, sudo executions, and PAM security events.\n- 🌐 **apache.log**: Apache HTTP Web server request logs and status codes.\n- 🚀 **nginx.log**: Nginx reverse proxy logs and upstream connection telemetry.\n- 📥 **access.log**: Client IP HTTP requests, user-agents, and bandwidth data.\n- ⚠️ **error.log**: Application crash tracebacks, 4xx/5xx HTTP errors, and daemon failures.\n\n---\n### 🛠️ Key Commands & Concepts:\n\n#### 1. Inspect Last 50 Lines of Auth Log\n\`\`\`bash\ntail -n 50 /var/log/auth.log\n\`\`\`\n\n#### 2. Live Monitoring of System Logs\n\`\`\`bash\ntail -f /var/log/system.log\n\`\`\`\n\n#### 3. Search HTTP 500 Errors in Web Logs\n\`\`\`bash\ngrep "HTTP/1.1 \\" 500" /var/log/nginx/access.log\n\`\`\`\n\n#### 4. Filter Critical Errors & Count Occurrences\n\`\`\`bash\ngrep -i "error" /var/log/error.log | wc -l\n\`\`\``
              },
              {
                id: 'unit-3-2-2',
                title: 'Log Extraction & Filtering Challenge',
                description: 'Extract IP addresses, HTTP status codes, and failed authentications using grep, awk, cut, and sort.',
                duration: '30 mins',
                type: 'Assignment'
              }
            ]
          },
          {
            id: 'topic-3-3',
            title: '🎯 Resource 8: Real-World Command Challenges',
            description: 'A series of practical challenges designed to simulate real Linux administration tasks commonly performed by system administrators and DevOps engineers.',
            estimatedDuration: '90 mins',
            learningUnits: [
              {
                id: 'unit-3-3-1',
                title: 'Mastering Real-World Admin Commands & Workflows',
                description: 'Step-by-step guide with highlighted concepts and production commands for real-world sysadmin tasks.',
                duration: '40 mins',
                type: 'Reading',
                readingContent: `## 🎯 Resource 8: Real-World Command Challenges\n\n### Overview\nA series of practical challenges designed to simulate real Linux administration tasks commonly performed by system administrators and DevOps engineers.\n\n---\n\n### 🚀 Challenge 1: Find the Largest File\n**Goal**: Identify top 10 largest files occupying disk space in \`/var/log\` or \`/home\`.\n\n\`\`\`bash\ndf -h\ndu -ah /var/log | sort -rh | head -n 10\nfind / -type f -size +100M -exec ls -lh {} \\; 2>/dev/null\n\`\`\`\n\n---\n\n### 🔐 Challenge 2: Search Failed Login Attempts\n**Goal**: Identify brute-force SSH attacks by counting failed password attempts.\n\n\`\`\`bash\ngrep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr\n\`\`\`\n\n---\n\n### 👥 Challenge 3: Count Unique Users & Logins\n**Goal**: List all active human users and unique login sessions.\n\n\`\`\`bash\ncut -d: -f1 /etc/passwd\nwho | awk '{print $1}' | sort -u | wc -l\n\`\`\`\n\n---\n\n### 📧 Challenge 4: Extract Email Addresses from Files\n**Goal**: Use RegEx with grep to extract all valid email patterns from log dumps.\n\n\`\`\`bash\ngrep -E -o "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}" /var/log/system.log | sort -u\n\`\`\`\n\n---\n\n### ⚠️ Challenge 5: Filter Error Logs & Generate Incident Reports\n**Goal**: Filter 4xx/5xx HTTP errors and generate a summary report.\n\n\`\`\`bash\nawk '$9 >= 400 {print $1, $7, $9}' /var/log/nginx/access.log | sort | uniq -c > incident_report.txt\ncat incident_report.txt\n\`\`\``
              },
              {
                id: 'unit-3-3-2',
                title: 'Real-World SysAdmin Hands-On Lab Challenge',
                description: 'Solve the 6 real-world challenges inside the live interactive Linux terminal sandbox.',
                duration: '50 mins',
                type: 'Assignment'
              }
            ]
          }
        ]
      },
      {
        id: 'mod-4',
        title: 'Module 4: User & Group Administration, Granular Permissions (ACLs) & Account Security',
        description: 'Identity creation, usermod flags, visudo delegation rules, POSIX vs Access Control Lists (setfacl), and password aging policies (chage).',
        duration: '8 hours',
        topics: [
          {
            id: 'topic-4-1',
            title: 'User & Group Management Architecture',
            description: 'Explore /etc/passwd, /etc/shadow, /etc/group, and useradd/usermod lifecycle operations.',
            estimatedDuration: '45 mins',
            learningUnits: [
              {
                id: 'unit-4-1-1',
                title: 'Module 4 Architecture & Account Security Guide',
                description: 'Complete architecture guide covering identity creation, usermod flags, sudoers visudo, ACL setfacl, and chage password policies.',
                duration: '35 mins',
                type: 'Reading',
                readingContent: `## 🛡️ Module 4 Architecture: User & Group Administration\n\n![Module 4 User Group ACL Architecture](/assets/images/linux_user_group_acl_architecture.png)\n\n### 📐 Module Architecture Overview\n\`\`\`text\nModule 4 Architecture\n├── Identity Creation (useradd, groupadd)\n├── Identity Modification (usermod, passwd)\n├── Elevated Access Control (sudo, /etc/sudoers)\n├── Granular Permissions (ACLs: setfacl, getfacl)\n└── Account Security (chage, account locking)\n\`\`\`\n\n---\n\n### 🛠️ Key Topics & Essential Commands\n\n#### 1. User & Group Management\nLinux tracks identities via core files in \`/etc/\`:\n- 📄 **\`\/etc\/passwd\`**: User account information (UID, GID, home dir, default shell).\n- 🔐 **\`\/etc\/shadow\`**: Encrypted user passwords, hash algorithms, and aging info.\n- 👥 **\`\/etc\/group\`**: Group definitions and membership arrays.\n\n| Task | Key Command | Example Command |\n| :--- | :--- | :--- |\n| **Create User** | \`useradd\` | \`sudo useradd -m -s /bin/bash devuser\` |\n| **Modify User** | \`usermod\` | \`sudo usermod -aG sysadmin devuser\` |\n| **Change Password** | \`passwd\` | \`sudo passwd devuser\` |\n| **Create Group** | \`groupadd\` | \`sudo groupadd sysadmin\` |\n| **Lock Account** | \`usermod / passwd\` | \`sudo usermod -L devuser\` or \`sudo passwd -l devuser\` |\n\n> 💡 **Pro Tip**: Always use **\`-aG\`** (append supplementary group) with \`usermod\`. Forgetting \`-a\` will replace all existing secondary groups for that user!\n\n---\n\n### 🔐 2. Privilege Delegation (\`sudo\`) & Visudo\nInstead of sharing the root password, \`sudo\` grants temporary elevated rights.\n\n![Linux Sudo Security Hardening](/assets/images/linux_sudo_security_hardening.png)\n\n> 🛡️ **Safe Editing**: Always edit the configuration file with **\`sudo visudo\`** or \`/etc/sudoers.d/\` files to prevent syntax errors that could lock you out of the server!\n\n**Syntax Rule**: \`user host=(runas_user:runas_group) commands\`\n\n\`\`\`bash\n# Example /etc/sudoers entry for a junior sysadmin\ndevuser ALL=(ALL:ALL) /usr/bin/systemctl restart nginx\n\`\`\`\n\n---\n\n### 🏷️ 3. Access Control Lists (ACLs)\nStandard POSIX permissions (\`rwx\` for Owner, Group, Other) fall short when a third entity needs distinct permissions. ACLs extend file system security.\n\n\`\`\`bash\n# View ACLs on a file\ngetfacl /var/www/html/index.html\n\n# Grant read/write to a specific user outside owner/group\nsetfacl -m u:devuser:rw- /var/www/html/index.html\n\n# Set default ACL on a directory (applies to future files created inside)\nsetfacl -d -m g:sysadmin:rwx /var/www/project\n\`\`\`\n\n---\n\n### ⏰ 4. Password & Account Aging Policies (\`chage\`)\nUse \`chage\` to enforce password rotation and expiration policies defined in \`/etc/shadow\`.\n\n\`\`\`bash\n# Force password change every 90 days, warn 7 days before\nsudo chage -M 90 -W 7 devuser\n\n# Force user to change password on next login\nsudo chage -d 0 devuser\n\n# Check current password status/aging rules\nsudo chage -l devuser\n\`\`\`\n\n---\n\n### 🧪 Real Server Example & Lab Scenario\n**Scenario**: Create an environment for a web developer named \`alex\` who needs to manage Nginx services without root access, plus shared write access to \`/var/www/app\`.\n\n#### 1️⃣ Create Group & User Account\n\`\`\`bash\nsudo groupadd webdevs\nsudo useradd -m -s /bin/bash -g webdevs alex\nsudo passwd alex\n\`\`\`\n\n#### 2️⃣ Configure Granular ACLs on Web Directory\n\`\`\`bash\nsudo setfacl -R -m u:alex:rwx /var/www/app\nsudo setfacl -R -d -m u:alex:rwx /var/www/app\n\`\`\`\n\n#### 3️⃣ Grant Passwordless Sudo for Specific System Commands\n\`\`\`bash\necho "alex ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx, /usr/bin/systemctl reload nginx" | sudo tee /etc/sudoers.d/webdevs\nsudo chmod 0440 /etc/sudoers.d/webdevs\n\`\`\`\n\n#### 4️⃣ Enforce Password Rotation Policy\n\`\`\`bash\nsudo chage -M 60 -W 10 alex\n\`\`\``
              },
              {
                id: 'unit-4-1-2',
                title: 'User & Group Administration Hands-on Assignment',
                description: 'Execute useradd, usermod -aG, setfacl, and chage policy configurations inside the interactive sandbox terminal.',
                duration: '40 mins',
                type: 'Assignment'
              }
            ]
          },
          {
            id: 'topic-4-2',
            title: 'Module 4 Knowledge Check & Final Exam',
            description: 'Evaluate mastery of Linux identities, sudoers visudo syntax, ACL setfacl flags, and chage account security policies.',
            estimatedDuration: '30 mins',
            learningUnits: [
              {
                id: 'unit-4-2-1',
                title: 'Module 4 Exam: User Administration, ACLs & Security',
                description: 'Comprehensive test evaluating Module 4 command syntax, sudoers rules, and security policies.',
                duration: '30 mins',
                type: 'Quiz'
              }
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
    duration: '15 Hours',
    category: 'Development Tools',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '8 Modules (15 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/github_course_banner.png',
    description: 'Transform your development velocity by mastering Git and GitHub. Learn version control, branching, PR review workflows, GitHub Actions, CI/CD, and enterprise release management patterns.',
    syllabus: [
      'Module 1: Introduction to Git',
      'Module 2: Git Fundamentals',
      'Module 3: Branches',
      'Module 4: GitHub',
      'Module 5: Collaboration',
      'Module 6: Advanced Git',
      'Module 7: GitHub Actions',
      'Module 8: Enterprise Git Workflow',
    ],
    modules: gitCourseModules
  }
];

const initialDefaultCourses = initialDefaultCoursesRaw.map(enrichCourseMockContent);
const sanitizeCourseList = (list: CourseItem[]): CourseItem[] => {
  const map = new Map<string, CourseItem>();
  list.forEach((c) => {
    const title = (c.title || '').toLowerCase();
    const slug = ((c as any).slug || '').toLowerCase();

    // Completely remove/ignore 'Linux Essentials' sample course
    if (title === 'linux essentials' || slug === 'linux-essentials' || String(c.id) === 'linux-essentials') {
      return;
    }

    if (
      title.includes('linux systems') ||
      title.includes('introduction to linux') ||
      String(c.id) === '1' ||
      String(c.id) === 'course_linux_101'
    ) {
      const key = 'course_linux_101';
      const updatedItem: CourseItem = {
        ...c,
        id: 'course_linux_101',
        title: 'Linux Systems & Administration Mastery',
        subtitle: '🐧 Linux Systems Mastery',
        thumbnail: c.thumbnail || '/assets/images/linux_course_thumbnail.png',
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('git & github') ||
      title.includes('git and github') ||
      String(c.id) === 'git-github-mastery' ||
      String(c.id) === 'git-github-mastery-course-id'
    ) {
      const key = 'git-github-mastery';
      const updatedItem: CourseItem = {
        ...c,
        id: 'git-github-mastery',
        title: 'Git & GitHub Mastery',
        subtitle: '⚡ Git & GitHub Mastery',
        thumbnail: '/assets/images/github_course_banner.png',
      };
      map.set(key, updatedItem);
    } else {
      map.set(String(c.id), c);
    }
  });

  if (!map.has('course_linux_101')) {
    map.set('course_linux_101', initialDefaultCourses[0]);
  }
  if (!map.has('git-github-mastery')) {
    map.set('git-github-mastery', initialDefaultCourses[1]);
  }

  return Array.from(map.values());
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved) as CourseItem[];
        const normalizedParsed = parsed.map((c: any) => {
          const statusVal = c.status && c.status.toLowerCase() === 'published' ? 'Published' : 'Draft';
          const instructorName = typeof c.instructor === 'object' && c.instructor !== null
            ? (c.instructor.name || 'Kaizen Q Team')
            : (c.instructor || 'Kaizen Q Team');
          return {
            ...c,
            status: statusVal,
            instructor: instructorName,
          } as CourseItem;
        });

        // Auto-heal missing default modules or missing content fields
        const merged = initialDefaultCourses.map((def) => {
          const match = normalizedParsed.find((p) => String(p.id) === String(def.id));
          if (!match) return def;
          // Auto-heal modules if missing or significantly different count
          if ((!match.modules || match.modules.length < def.modules!.length) && def.modules && def.modules.length > 0) {
            return enrichCourseMockContent({ ...match, modules: def.modules });
          }
          return enrichCourseMockContent(match);
        });

        // Retain other custom admin courses
        normalizedParsed.forEach((p) => {
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

  const refreshCourses = async () => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    let localList = initialDefaultCourses;
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((c: any) => {
            const statusVal = c.status && c.status.toLowerCase() === 'published' ? 'Published' : 'Draft';
            const instructorName = typeof c.instructor === 'object' && c.instructor !== null
              ? (c.instructor.name || 'Kaizen Q Team')
              : (c.instructor || 'Kaizen Q Team');
            return {
              ...c,
              status: statusVal,
              instructor: instructorName,
            } as CourseItem;
          });
          localList = sanitizeCourseList(mapped);
        }
      } catch (e) {
        console.warn('LocalStorage courses parse warning in refreshCourses:', e);
      }
    }
    
    setCourses(localList);

    if (!db) return;
    try {
      const loadedResult = await courseService.getCourses();
      const loaded = loadedResult.courses;
      if (loaded && loaded.length > 0) {
        const normalized = loaded.map((c: any) => {
          const statusVal = c.status && c.status.toLowerCase() === 'published' ? 'Published' : 'Draft';
          const instructorName = typeof c.instructor === 'object' && c.instructor !== null
            ? (c.instructor.name || 'Kaizen Q Team')
            : (c.instructor || 'Kaizen Q Team');
          return {
            ...c,
            status: statusVal,
            instructor: instructorName,
          } as CourseItem;
        });

        const merged = sanitizeCourseList([...localList, ...normalized]);
        setCourses(merged);
        localStorage.setItem('shaivika_courses_data', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Firestore courses fetch notice in refreshCourses:', err);
    }
  };

  // Sync with Firestore if available
  useEffect(() => {
    refreshCourses();
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
      instructor: coursePayload.instructor || 'KaizenQ Team',
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
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    const updated = courses.map((c) => {
      if (String(c.id) === targetId) {
        const nextStatus: 'Published' | 'Draft' = c.status === 'Published' ? 'Draft' : 'Published';
        return { ...c, status: nextStatus };
      }
      return c;
    });

    setCourses(updated);

    if (db) {
      try {
        const target = updated.find((c) => String(c.id) === targetId);
        if (target) {
          await updateDoc(doc(db, 'courses', String(targetId)), { status: target.status });
        }
      } catch (e) {
        console.warn('Firestore updateDoc notice:', e);
      }
    }
  };

  const deleteCourse = async (id: number | string) => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    const updated = courses.filter((c) => String(c.id) !== targetId);
    setCourses(updated);
  };

  const getCourseById = (id: number | string): CourseItem | undefined => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    return courses.find((c) => String(c.id) === targetId) || initialDefaultCourses[0];
  };

  const updateCourse = async (id: number | string, updates: Partial<CourseItem>) => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    const updated = courses.map((c) => {
      if (String(c.id) === targetId) {
        return { ...c, ...updates };
      }
      return c;
    });
    setCourses(updated);

    if (db) {
      try {
        await updateDoc(doc(db, 'courses', String(targetId)), updates);
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
        refreshCourses,
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
