import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ICourse } from '../../../../shared/types/course';
import { courseService } from '../../services/courseService';
import { InteractiveTerminalModal } from './InteractiveTerminalModal';
import { MODULE_1_FULL_CURRICULUM } from '../../data/linuxModuleContent';
import { MODULE_2_FULL_CURRICULUM } from '../../data/linuxModule2Content';
import { MODULE_3_FULL_CURRICULUM } from '../../data/linuxModule3Content';
import type { SubtopicDetail, LessonDetail } from '../../data/linuxModuleContent';
import {
  PlayCircle,
  CheckCircle2,
  X,
  ChevronRight,
  Award,
  Terminal,
  BookOpen,
  Clock,
  ChevronLeft,
  Sparkles,
  Layers,
  ImageIcon,
  Gift,
  Lock,
  Zap,
  FolderDown,
  Menu as MenuIcon,
  Sun,
  Moon,
  Download,
  FileText,
  Code,
  Flame,
  FileArchive,
  Search,
  ExternalLink,
  Inbox,
  Presentation,
  Circle,
  Bookmark,
  Pin,
  Edit2,
  Trash2,
  MessageSquare,
  HelpCircle,
  Brain,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { DiscussionCenter } from './DiscussionCenter';
import { discussionService } from '@/services/discussionService';
import { AssignmentPortal } from './AssignmentPortal';
import { AIAssistantPanel } from '../ai/AIAssistantPanel';
import { AIQuizPortal } from './AIQuizPortal';
import { PracticeLab } from './PracticeLab';
import { ChallengeProvider } from '../../services/practice/practiceEngine';

const challengeProvider = new ChallengeProvider();

export interface CoursePlayerModalProps {
  course: ICourse;
  onClose: () => void;
  onProgressUpdate?: (newProgress: number) => void;
  initialSubtopicId?: string;
  initialNotesOpen?: boolean;
  initialTab?: 'notes' | 'bookmarks';
}

export const logRecentActivity = (
  courseId: string | number,
  courseTitle: string,
  type: 'started' | 'completed' | 'quiz' | 'assignment' | 'note' | 'bookmark',
  title: string
) => {
  try {
    const cached = localStorage.getItem('shaivika_user_activities');
    let list = [];
    if (cached) {
      list = JSON.parse(cached);
    }
    const newActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      courseId,
      courseTitle,
      type,
      title,
      timestamp: new Date().toISOString(),
    };
    list = [newActivity, ...list].slice(0, 50);
    localStorage.setItem('shaivika_user_activities', JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

const ARCHITECTURE_SLIDES = [
  {
    id: 'slide_1',
    title: 'Unix & Linux Concentric Layered Architecture',
    subtitle: 'Rings of Isolation: Hardware ➔ Kernel ➔ Shell ➔ User Applications',
    image: '/assets/images/linux_os_architecture.png',
    badge: 'Layered Ring Model',
    description: `Linux organizes execution into isolated concentric rings. At the core is physical Hardware (CPU, Memory, Devices). Direct access to Hardware is restricted exclusively to the Kernel (Core Control Program). Applications (Web Browsers, Editors, Python scripts) run in User Space and communicate with the Shell via System Calls & System Requests.`,
    takeaways: [
      'Kernel manages CPU, RAM, and hardware device access exclusively.',
      'Shell acts as an interactive command-line or GUI bridge between user applications and the Kernel.',
      'System Calls enforce security boundaries between User Space and Kernel Space.',
    ],
  },
  {
    id: 'slide_2',
    title: 'Monolithic Kernel (Linux) vs Microkernel (Minix)',
    subtitle: 'Unified Kernel Memory Space vs Isolated User-Space Drivers',
    image: '/assets/images/linux_monolithic_vs_microkernel.png',
    badge: 'Kernel Architectural Comparison',
    description: `Linux utilizes a Monolithic Kernel architecture where the File System, Device Drivers, Inter-Process Communication (IPC), and Process Scheduler operate within a single, highly-optimized Kernel Space for maximum execution performance. In contrast, Microkernels move File Systems and Drivers into User Space, relying on message passing.`,
    takeaways: [
      'Monolithic Kernel (Linux): High speed execution, direct memory sharing between subsystems.',
      'Microkernel (Minix): Increased fault isolation, but higher IPC messaging overhead.',
      'Modern Linux uses dynamic loadable kernel modules (.ko) for modular flexibility.',
    ],
  },
  {
    id: 'slide_3',
    title: 'Linux Kernel Subsystem Managers & Hardware Pipelines',
    subtitle: 'Process Scheduler, Memory Manager, Device Drivers, File System Manager',
    image: '/assets/images/linux_kernel_managers.png',
    badge: 'Subsystem Managers',
    description: `Inside the Linux Kernel chamber, 4 primary Manager Subsystems coordinate data flow directly to Physical Hardware: 1) Process Scheduler (CPU queue allocation), 2) Memory Manager (Virtual vs Physical RAM mapping), 3) Device Drivers Manager (Disk/Hardware control), and 4) File System Manager (Hierarchical Directory Tree).`,
    takeaways: [
      'Process Scheduler: Allocates CPU time slices across active threads and processes.',
      'Memory Manager: Translates virtual memory addresses to physical RAM hardware.',
      'File System Manager: Maps files, inodes, and permissions to physical storage sectors.',
    ],
  },
];

// Production Command References per Module
const MODULE_COMMAND_TABLES: Record<number, { command: string; category: string; description: string; usage: string }[]> = {
  0: [
    { command: 'pwd', category: 'Navigation', description: 'Displays the current working directory path', usage: 'pwd' },
    { command: 'ls', category: 'File Management', description: 'Lists directory contents. Flags: -l (long format), -a (hidden), -h (human)', usage: 'ls -lah' },
    { command: 'cd', category: 'Navigation', description: 'Changes the current working directory', usage: 'cd /var/log' },
    { command: 'mkdir', category: 'File Management', description: 'Creates a new directory. Flag -p builds nested parent directories', usage: 'mkdir -p project/src' },
    { command: 'touch', category: 'File Management', description: 'Creates an empty file or updates the timestamp of an existing file', usage: 'touch index.html' },
    { command: 'cp', category: 'File Management', description: 'Copies files/directories. Flag -r copies recursively', usage: 'cp -r src/ backup/' },
    { command: 'mv', category: 'File Management', description: 'Moves or renames files and directories', usage: 'mv old.txt new.txt' },
    { command: 'rm', category: 'File Management', description: 'Deletes files/directories. Flag -rf forces recursive deletion', usage: 'rm -rf temp_dir/' },
    { command: 'cat', category: 'Text Processing', description: 'Displays the complete contents of a file in the terminal', usage: 'cat /etc/os-release' },
    { command: 'head / tail', category: 'Log Analysis', description: 'Displays top (head) or bottom (tail) lines. Flag -f streams live updates', usage: 'tail -f -n 50 /var/log/syslog' },
    { command: 'grep', category: 'Search Utility', description: 'Filters text matching a specific pattern. Flags: -i (case-insensitive), -r (recursive)', usage: 'grep -ir "error" /var/log/' },
    { command: '> / >>', category: 'Redirection', description: 'Redirects output to a file. > overwrites, >> appends', usage: 'echo "log data" >> app.log' },
    { command: '|', category: 'Pipeline', description: 'Passes the output of one command as the input to another', usage: 'cat /etc/passwd | grep "bash"' },
  ],
  1: [
    { command: 'useradd', category: 'User Management', description: 'Creates a new user account. Flag -m creates a home directory', usage: 'sudo useradd -m -s /bin/bash dev_user' },
    { command: 'usermod', category: 'User Management', description: 'Modifies existing user properties', usage: 'sudo usermod -aG docker dev_user' },
    { command: 'passwd', category: 'User Management', description: 'Sets or changes a user account password', usage: 'sudo passwd dev_user' },
    { command: 'groupadd', category: 'Group Management', description: 'Creates a new user group', usage: 'sudo groupadd developers' },
    { command: 'chmod', category: 'Permissions', description: 'Changes file access permissions using Octal notation (Read=4, Write=2, Execute=1)', usage: 'chmod 755 script.sh' },
    { command: 'chown', category: 'Ownership', description: 'Changes file or directory ownership (User and Group)', usage: 'sudo chown -R dev_user:developers /var/www' },
    { command: 'getfacl', category: 'Advanced Security', description: 'Displays file Access Control Lists (ACLs)', usage: 'getfacl /shared/file.txt' },
    { command: 'setfacl', category: 'Advanced Security', description: 'Configures custom ACL permissions for specific users/groups', usage: 'setfacl -m u:alice:rw /shared/file.txt' },
  ],
  2: [
    { command: 'ps', category: 'Process Control', description: 'Displays a snapshot of current running processes', usage: 'ps aux | grep python' },
    { command: 'htop', category: 'Process Control', description: 'Interactive real-time process manager and system monitor', usage: 'htop' },
    { command: 'kill', category: 'Process Control', description: 'Sends a termination signal to a process using its PID', usage: 'kill -9 1234' },
    { command: 'pkill', category: 'Process Control', description: 'Terminates processes based on their execution name', usage: 'pkill -f node' },
    { command: 'nice / renice', category: 'Process Control', description: 'Launches a process with adjusted priority or alters an active process priority', usage: 'renice -n -5 -p 1234' },
    { command: 'systemctl', category: 'Service Control', description: 'Manages system services (start, stop, restart, status, enable, disable)', usage: 'sudo systemctl status nginx' },
    { command: 'journalctl', category: 'Log Parsing', description: 'Inspects systemd logs. Flag -u filters by service unit', usage: 'sudo journalctl -u nginx -n 100 --no-pager' },
    { command: 'crontab', category: 'Task Automation', description: 'Schedules recurring background tasks. Options: -e (edit), -l (list)', usage: 'crontab -e' },
  ],
  3: [
    { command: 'ip', category: 'Networking', description: 'Replaces legacy ifconfig. Inspects IP addresses, interfaces, and routes', usage: 'ip addr show' },
    { command: 'ping', category: 'Networking', description: 'Tests network layer connectivity to a remote host', usage: 'ping -c 4 8.8.8.8' },
    { command: 'ss', category: 'Networking', description: 'Replaces netstat. Audits active network sockets and open ports', usage: 'ss -tulnp' },
    { command: 'curl', category: 'Networking', description: 'Downloads data or interacts with web endpoints/REST APIs', usage: 'curl -I https://api.github.com' },
    { command: 'wget', category: 'Networking', description: 'Downloads files directly from web URLs to the server', usage: 'wget https://example.com/package.tar.gz' },
    { command: 'ssh', category: 'Security', description: 'Connects securely to a remote Linux server via encrypted SSH protocol', usage: 'ssh -i key.pem user@10.0.0.1' },
    { command: 'ssh-keygen', category: 'Security', description: 'Generates a secure SSH public/private key pair', usage: 'ssh-keygen -t ed25519' },
    { command: 'ufw', category: 'Security', description: 'Simplifies firewall management to allow or block port traffic', usage: 'sudo ufw allow 22/tcp && sudo ufw enable' },
    { command: 'visudo', category: 'Security', description: 'Safely edits the /etc/sudoers file to prevent syntax corruption', usage: 'sudo visudo' },
  ],
};

const MOTIVATION_QUOTES = [
  '🔥 INCREDIBLE WORK! You crushed this subtopic! +20 XP Added to your account!',
  '⚡ BOOM! Knowledge Unlocked! You are on fire, keep the momentum going!',
  '🚀 FANTASTIC JOB! You are 1 step closer to becoming a Certified Linux Systems Specialist!',
  '🌟 MASTERCLASS! Your focus and discipline are paying off. Next Subtopic Ready!',
  '🎯 POWER MOVE! You mastered the concept! Keep building your tech empire!',
];

export interface LessonResource {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'zip' | 'docx' | 'ppt' | 'image' | 'code' | 'link';
  size?: string;
  badge: 'Required' | 'Optional' | 'Reference' | 'Starter Code' | 'Project Files';
  uploadedAt: string;
}

export interface PersonalNote {
  id: string;
  courseId: string;
  subtopicId: string;
  subtopicTitle: string;
  moduleTitle: string;
  lessonType: 'video' | 'quiz' | 'assignment' | 'reading';
  title: string;
  content: string;
  videoTimestamp?: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonBookmark {
  id: string;
  courseId: string;
  subtopicId: string;
  subtopicTitle: string;
  moduleTitle: string;
  lessonType: 'video' | 'quiz' | 'assignment' | 'reading';
  createdAt: string;
}

const MOCK_RESOURCES_DATABASE: Record<string, LessonResource[]> = {
  '1.1.1': [
    {
      id: 'res_1.1.1_1',
      name: 'Linux Evolution History Outline.pdf',
      url: 'https://arxiv.org/pdf/1709.06732.pdf',
      type: 'pdf',
      size: '1.8 MB',
      badge: 'Required',
      uploadedAt: '2026-07-15T09:00:00Z',
    },
    {
      id: 'res_1.1.1_2',
      name: 'UNIX vs Linux Architecture Slides.ppt',
      url: '/assets/resources/unix_vs_linux_architecture.ppt',
      type: 'ppt',
      size: '5.2 MB',
      badge: 'Reference',
      uploadedAt: '2026-07-16T10:30:00Z',
    },
    {
      id: 'res_1.1.1_3',
      name: 'Richard Stallman GNU Manifesto.docx',
      url: '/assets/resources/gnu_manifesto.docx',
      type: 'docx',
      size: '340 KB',
      badge: 'Optional',
      uploadedAt: '2026-07-14T08:15:00Z',
    },
  ],
  '1.1.2': [
    {
      id: 'res_1.1.2_1',
      name: 'DistroWatch Live Rankings & Directory.lnk',
      url: 'https://distrowatch.com',
      type: 'link',
      badge: 'Reference',
      uploadedAt: '2026-07-17T11:00:00Z',
    },
    {
      id: 'res_1.1.2_2',
      name: 'Alpine Linux Spec Sheet.pdf',
      url: 'https://arxiv.org/pdf/2203.01311.pdf',
      type: 'pdf',
      size: '850 KB',
      badge: 'Optional',
      uploadedAt: '2026-07-18T14:20:00Z',
    },
  ],
  '1.1.3': [
    {
      id: 'res_1.1.3_1',
      name: 'OS Architecture Concept Map.png',
      url: '/assets/images/linux_os_architecture.png',
      type: 'image',
      size: '1.2 MB',
      badge: 'Project Files',
      uploadedAt: '2026-07-19T09:00:00Z',
    },
    {
      id: 'res_1.1.3_2',
      name: 'Kernel Space System Call Code.c',
      url: '/assets/resources/syscall_example.c',
      type: 'code',
      size: '15 KB',
      badge: 'Starter Code',
      uploadedAt: '2026-07-19T16:45:00Z',
    },
  ],
  '1.2.1': [
    {
      id: 'res_1.2.1_1',
      name: 'Virtual File System Spec.pdf',
      url: 'https://arxiv.org/pdf/1908.05603.pdf',
      type: 'pdf',
      size: '2.9 MB',
      badge: 'Required',
      uploadedAt: '2026-07-20T10:00:00Z',
    },
  ],
  '1.2.2': [
    {
      id: 'res_1.2.2_1',
      name: 'Loadable Kernel Module Template.zip',
      url: '/assets/resources/lkm_template.zip',
      type: 'zip',
      size: '4.1 MB',
      badge: 'Starter Code',
      uploadedAt: '2026-07-21T09:30:00Z',
    },
    {
      id: 'res_1.2.2_2',
      name: 'Compiling Custom LKM Tutorial.pdf',
      url: 'https://arxiv.org/pdf/2105.02989.pdf',
      type: 'pdf',
      size: '3.3 MB',
      badge: 'Reference',
      uploadedAt: '2026-07-22T13:10:00Z',
    },
  ],
};

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({
  course,
  onClose,
  onProgressUpdate,
  initialSubtopicId,
  initialNotesOpen,
  initialTab,
}) => {
  const syllabus = course.syllabus || [];

  // 1. Dynamic Curriculum Loader
  const getCurriculumForModule = (mIdx: number): LessonDetail[] => {
    const courseAny = course as any;
    if (courseAny.modules && courseAny.modules[mIdx]) {
      const mod = courseAny.modules[mIdx];
      return mod.topics.map((t: any) => ({
        title: t.title,
        badge: t.id || 'Topic',
        subtopics: t.learningUnits.map((u: any) => ({
          id: u.id,
          title: u.title,
          content: u.readingContent || u.description || '',
          type: u.type,
          learningUnit: u,
        })),
      }));
    }

    let baseCurriculum: LessonDetail[] = [];
    if (mIdx === 2) {
      baseCurriculum = MODULE_3_FULL_CURRICULUM;
    } else if (mIdx === 1) {
      baseCurriculum = MODULE_2_FULL_CURRICULUM;
    } else {
      baseCurriculum = MODULE_1_FULL_CURRICULUM;
    }

    const modNum = mIdx + 1;
    if (modNum !== 1 && modNum !== 2 && modNum !== 3) {
      return baseCurriculum.map((lesson: LessonDetail) => ({
        ...lesson,
        title: lesson.title.replace(/Lesson 1\./g, `Lesson ${modNum}.`),
        subtopics: lesson.subtopics.map((sub: SubtopicDetail) => ({
          ...sub,
          id: sub.id.replace(/^1\./, `${modNum}.`),
          title: sub.title.replace(/^1\./, `${modNum}.`),
        })),
      }));
    }
    return baseCurriculum;
  };

  // Flattened array of all lessons across all modules
  interface CourseLessonPath {
    moduleIdx: number;
    lessonIdx: number;
    subtopicIdx: number;
    subtopicId: string;
    subtopicTitle: string;
    topicTitle: string;
    moduleTitle: string;
    subtopic: SubtopicDetail;
    lesson: LessonDetail;
    module: any;
  }

  const allLessons: CourseLessonPath[] = [];
  syllabus.forEach((mod: any, mIdx: number) => {
    const curr = getCurriculumForModule(mIdx);
    curr.forEach((lesson: LessonDetail, lIdx: number) => {
      lesson.subtopics.forEach((sub: SubtopicDetail, sIdx: number) => {
        allLessons.push({
          moduleIdx: mIdx,
          lessonIdx: lIdx,
          subtopicIdx: sIdx,
          subtopicId: sub.id,
          subtopicTitle: sub.title,
          topicTitle: lesson.title,
          moduleTitle: mod.title,
          subtopic: sub,
          lesson: lesson,
          module: mod,
        });
      });
    });
  });



  const { userProfile, user } = useAuth();
  const currentUserId = userProfile?.uid || user?.uid || 'default_student';

  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'commands' | 'slides' | 'lab' | 'discussions' | 'practice-lab'>('content');
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([0]);

  const [unreadDiscussions, setUnreadDiscussions] = useState(0);
  const [forceOpenCreateQuestion, setForceOpenCreateQuestion] = useState(false);
  const [targetLessonId, setTargetLessonId] = useState<string | undefined>(undefined);
  const [targetLessonName, setTargetLessonName] = useState<string | undefined>(undefined);

  const updateUnread = () => {
    setUnreadDiscussions(discussionService.getUnreadCount(String(course.id), currentUserId));
  };

  useEffect(() => {
    updateUnread();
  }, [course.id, currentUserId]);

  // Sequential Subtopic Stepper State
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [currentSubtopicIdx, setCurrentSubtopicIdx] = useState(0);
  const [completedSubtopics, setCompletedSubtopics] = useState<string[]>(['1.1.1', '2.1.1', '3.1.1']);

  // Modals & Drawers State
  const [activeTerminalCmd, setActiveTerminalCmd] = useState<string | null>(null);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModulesMenuOpen, setIsModulesMenuOpen] = useState(false);

  // Encouragement & Module Locking Popup Overlays
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [lockedModulePopup, setLockedModulePopup] = useState<number | null>(null);

  // Subtopic Timer State (auto-calculated spend time per subtopic)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [claimedPointsModules, setClaimedPointsModules] = useState<number[]>([]);
  const [userXP, setUserXP] = useState(courseService.getUserXPPoints());

  // Dynamic Curriculum for active Module
  const activeCurriculum = getCurriculumForModule(activeModuleIdx);

  // Collapsible Sidebar & In Progress tracking states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [inProgressSubtopics, setInProgressSubtopics] = useState<string[]>([]);

  // ----------------- PHASE 23: LESSON RESOURCES STATES -----------------
  const [resourcesSearch, setResourcesSearch] = useState<string>('');
  const [resourcesSort, setResourcesSort] = useState<string>('newest');
  const [sessionDownloads, setSessionDownloads] = useState<string[]>([]);
  const [previewingResource, setPreviewingResource] = useState<LessonResource | null>(null);

  // ----------------- PHASE 24: AUTO LESSON COMPLETION STATES -----------------
  const [videoWatchedPercent, setVideoWatchedPercent] = useState<Record<string, number>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<number, number>>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [quizPassed, setQuizPassed] = useState<Record<string, boolean>>({});

  // ----------------- PHASE 25: PERSONAL NOTES & SMART BOOKMARKS STATES -----------------
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [bookmarks, setBookmarks] = useState<LessonBookmark[]>([]);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isQuizPortalOpen, setIsQuizPortalOpen] = useState(false);
  const [rightActiveTab, setRightActiveTab] = useState<'notes' | 'bookmarks'>('notes');
  const [notesSearch, setNotesSearch] = useState<string>('');
  const [notesFilter, setNotesFilter] = useState<'all' | 'video' | 'reading' | 'recent' | 'oldest'>('all');
  const [notesSort, setNotesSort] = useState<'newest' | 'oldest' | 'alpha'>('newest');
  const [noteInputTitle, setNoteInputTitle] = useState<string>('');
  const [noteInputContent, setNoteInputContent] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<'saving' | 'saved' | null>(null);

  const [isCheckpointLoaded, setIsCheckpointLoaded] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Load notes and bookmarks from localStorage on mount
  useEffect(() => {
    const cachedNotes = localStorage.getItem(`shaivika_notes_${course.id}`);
    if (cachedNotes) {
      try {
        setNotes(JSON.parse(cachedNotes));
      } catch (e) {
        console.error(e);
      }
    }
    const cachedBookmarks = localStorage.getItem(`shaivika_bookmarks_${course.id}`);
    if (cachedBookmarks) {
      try {
        setBookmarks(JSON.parse(cachedBookmarks));
      } catch (e) {
        console.error(e);
      }
    }
  }, [course.id]);

  useEffect(() => {
    const handleOpenQuiz = () => {
      setIsQuizPortalOpen(true);
      setIsAiPanelOpen(false);
      setIsNotesPanelOpen(false);
    };
    window.addEventListener('open-ai-quiz', handleOpenQuiz);
    return () => window.removeEventListener('open-ai-quiz', handleOpenQuiz);
  }, []);



  // Restore saved checkpoint or initial overrides on mount
  useEffect(() => {
    // 1. Initial values from props overrides (such as Quick Open or Quick Action notes)
    if (initialSubtopicId) {
      const path = allLessons.find((l) => l.subtopicId === initialSubtopicId);
      if (path) {
        setActiveModuleIdx(path.moduleIdx);
        setCurrentLessonIdx(path.lessonIdx);
        setCurrentSubtopicIdx(path.subtopicIdx);
        
        const saved = courseService.getCourseCheckpoint(course.id);
        if (saved) {
          if (saved.completedSubtopics?.length) setCompletedSubtopics(saved.completedSubtopics);
          if (saved.completedModules?.length) setCompletedModules(saved.completedModules);
          if (saved.inProgressSubtopics?.length) setInProgressSubtopics(saved.inProgressSubtopics);
        }
        
        setIsCheckpointLoaded(true);
        toast.info(`📍 Opened bookmarked lesson: ${path.subtopicTitle}`);
        return;
      }
    }

    // 2. Normal checkpoint restoration
    const saved = courseService.getCourseCheckpoint(course.id);
    if (saved) {
      if (typeof saved.lastModuleIdx === 'number') setActiveModuleIdx(saved.lastModuleIdx);
      if (typeof saved.lastLessonIdx === 'number') setCurrentLessonIdx(saved.lastLessonIdx);
      if (typeof saved.lastSubtopicIdx === 'number') setCurrentSubtopicIdx(saved.lastSubtopicIdx);
      if (saved.completedSubtopics?.length) setCompletedSubtopics(saved.completedSubtopics);
      if (saved.completedModules?.length) setCompletedModules(saved.completedModules);
      if (saved.inProgressSubtopics?.length) setInProgressSubtopics(saved.inProgressSubtopics);
      toast.info(`📍 Resumed track from Module ${saved.lastModuleIdx + 1}, Lesson ${saved.lastLessonIdx + 1}`);
    }
    setIsCheckpointLoaded(true);
  }, [course.id, initialSubtopicId]);

  // Load notes/bookmarks panel state on mount
  useEffect(() => {
    if (initialNotesOpen) {
      setIsNotesPanelOpen(true);
    }
    if (initialTab) {
      setRightActiveTab(initialTab);
    }
  }, [initialNotesOpen, initialTab]);

  const prevCompletedRef = React.useRef<string[]>([]);
  useEffect(() => {
    if (!isCheckpointLoaded) {
      prevCompletedRef.current = completedSubtopics;
      return;
    }
    completedSubtopics.forEach((subId) => {
      if (!prevCompletedRef.current.includes(subId)) {
        const path = allLessons.find((l) => l.subtopicId === subId);
        const title = path ? path.subtopicTitle : subId;
        logRecentActivity(course.id, course.title, 'completed', title);
      }
    });
    prevCompletedRef.current = completedSubtopics;
  }, [completedSubtopics, isCheckpointLoaded, course.id, course.title, allLessons]);

  const activeModule = syllabus[activeModuleIdx] || {
    id: `m${activeModuleIdx + 1}`,
    title: `Module 0${activeModuleIdx + 1}: Technical Operations`,
    duration: '8 hrs 00 mins',
    lessonsCount: 6,
  };

  const activeSlide = ARCHITECTURE_SLIDES[currentSlideIdx];
  const progressPercent = Math.round((completedSubtopics.length / allLessons.length) * 100);
  const activeCommands = MODULE_COMMAND_TABLES[activeModuleIdx] || MODULE_COMMAND_TABLES[0];

  const currentLesson = activeCurriculum[currentLessonIdx] || activeCurriculum[0];
  const currentSubtopic: SubtopicDetail = currentLesson?.subtopics?.[currentSubtopicIdx] || currentLesson?.subtopics?.[0];
  const hasChallenge = currentSubtopic ? !!challengeProvider.getChallengeForLesson(currentSubtopic.id) : false;

  const requiredSubtopicSeconds = Math.min(
    15,
    Math.max(5, Math.round((currentSubtopic?.content || '').length / 200))
  );

  const getLessonType = (subtopicId: string): 'video' | 'quiz' | 'assignment' | 'reading' => {
    const found = allLessons.find(l => l.subtopicId === subtopicId);
    if (found && found.subtopic && (found.subtopic as any).type) {
      const type = (found.subtopic as any).type.toLowerCase();
      if (type === 'video') return 'video';
      if (type === 'quiz') return 'quiz';
      if (type === 'assignment') return 'assignment';
      return 'reading';
    }
    if (subtopicId === '1.1.1' || subtopicId === '1.2.2') return 'video';
    if (subtopicId === '1.1.2') return 'quiz';
    if (subtopicId === '1.1.3') return 'assignment';
    return 'reading';
  };

  const getModuleStatus = (mIdx: number): 'Completed' | 'In Progress' | 'Not Started' => {
    const moduleLessons = allLessons.filter((l) => l.moduleIdx === mIdx);
    if (moduleLessons.length === 0) return 'Not Started';
    const completedCount = moduleLessons.filter((l) => completedSubtopics.includes(l.subtopicId)).length;
    if (completedCount === moduleLessons.length) return 'Completed';
    const inProgressCount = moduleLessons.filter((l) =>
      inProgressSubtopics.includes(l.subtopicId) && !completedSubtopics.includes(l.subtopicId)
    ).length;
    if (completedCount > 0 || inProgressCount > 0) return 'In Progress';
    return 'Not Started';
  };

  const completedLessonsCount = allLessons.filter((l) => completedSubtopics.includes(l.subtopicId)).length;
  const courseStatus: 'Completed' | 'In Progress' | 'Not Started' =
    completedLessonsCount === allLessons.length
      ? 'Completed'
      : completedLessonsCount > 0 || inProgressSubtopics.length > 0
      ? 'In Progress'
      : 'Not Started';

  const isCurrentSubtopicBookmarked = bookmarks.some((b) => b.subtopicId === currentSubtopic?.id);

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(notesSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (notesFilter === 'video') return n.lessonType === 'video';
    if (notesFilter === 'reading') return n.lessonType === 'reading';
    
    if (notesFilter === 'recent') {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return new Date(n.createdAt).getTime() >= oneDayAgo;
    }
    
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (notesSort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (notesSort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (notesSort === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const currentLessonFlatIdx = allLessons.findIndex(
    (item) =>
      item.moduleIdx === activeModuleIdx &&
      item.lessonIdx === currentLessonIdx &&
      item.subtopicIdx === currentSubtopicIdx
  );

  const safeFlatIdx = currentLessonFlatIdx === -1 ? 0 : currentLessonFlatIdx;

  const currentResources: LessonResource[] = [
    ...(MOCK_RESOURCES_DATABASE[currentSubtopic?.id || ''] || []),
    ...(((currentSubtopic as any).learningUnit?.resources || []) as any[]).map(res => ({
      id: res.id,
      name: res.name,
      url: res.fileUrl || `https://dummy-file-url/${res.name}`,
      type: (res.category === 'PDF' ? 'pdf' : 
             res.category === 'ZIP' ? 'zip' : 
             res.category === 'DOCX' ? 'docx' :
             res.category === 'Image' ? 'image' :
             res.category === 'Source Code' ? 'code' : 'link') as any,
      size: res.fileSize || '1.5 MB',
      badge: 'Required' as any,
      uploadedAt: new Date().toISOString()
    }))
  ];

  // Filter resources by search term
  const filteredResources = currentResources.filter((res) =>
    res.name.toLowerCase().includes(resourcesSearch.toLowerCase())
  );

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (resourcesSort === 'newest') {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
    if (resourcesSort === 'oldest') {
      return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    }
    if (resourcesSort === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (resourcesSort === 'type') {
      return a.type.localeCompare(b.type);
    }
    return 0;
  });

  // Automatically mark current lesson as In Progress if it's not completed
  useEffect(() => {
    if (currentSubtopic && !completedSubtopics.includes(currentSubtopic.id) && !inProgressSubtopics.includes(currentSubtopic.id)) {
      setInProgressSubtopics((prev) => [...prev, currentSubtopic.id]);
      logRecentActivity(course.id, course.title, 'started', currentSubtopic.title);
    }
  }, [currentSubtopic, completedSubtopics, inProgressSubtopics, course.id, course.title]);

  // Automatically update completedModules based on lesson completion
  useEffect(() => {
    const newlyCompletedModules: number[] = [];
    syllabus.forEach((_, mIdx) => {
      const moduleLessons = allLessons.filter((l) => l.moduleIdx === mIdx);
      const isAllDone = moduleLessons.every((l) => completedSubtopics.includes(l.subtopicId));
      if (isAllDone && moduleLessons.length > 0) {
        newlyCompletedModules.push(mIdx);
      }
    });

    const isSame =
      newlyCompletedModules.length === completedModules.length &&
      newlyCompletedModules.every((v) => completedModules.includes(v));

    if (!isSame) {
      setCompletedModules(newlyCompletedModules);
    }
  }, [completedSubtopics, syllabus, allLessons, completedModules]);

  // Auto-complete reading lesson if timer meets requirements
  useEffect(() => {
    if (
      currentSubtopic &&
      getLessonType(currentSubtopic.id) === 'reading' &&
      timerSeconds >= requiredSubtopicSeconds &&
      !completedSubtopics.includes(currentSubtopic.id)
    ) {
      setCompletedSubtopics((prev) => {
        if (prev.includes(currentSubtopic.id)) return prev;
        toast.success(`📖 Minimum study time met! Marked lesson as completed.`);
        return [...prev, currentSubtopic.id];
      });
    }
  }, [timerSeconds, requiredSubtopicSeconds, currentSubtopic?.id, completedSubtopics]);

  // Scroll to end auto completion for Reading lessons
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (!mainEl || getLessonType(currentSubtopic?.id || '') !== 'reading' || completedSubtopics.includes(currentSubtopic?.id || '')) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = mainEl;
      if (scrollHeight - scrollTop <= clientHeight + 30) {
        if (!completedSubtopics.includes(currentSubtopic.id)) {
          setCompletedSubtopics((prev) => {
            if (prev.includes(currentSubtopic.id)) return prev;
            toast.success(`📖 Scrolled to end! Reading lesson marked as completed.`);
            return [...prev, currentSubtopic.id];
          });
        }
      }
    };

    mainEl.addEventListener('scroll', handleScroll);
    return () => {
      mainEl.removeEventListener('scroll', handleScroll);
    };
  }, [currentSubtopic?.id, completedSubtopics, activeTab]);

  // Reset search when active subtopic changes
  useEffect(() => {
    setResourcesSearch('');
  }, [currentSubtopic?.id]);

  // Expand module on change
  useEffect(() => {
    setExpandedModules((prev) => ({
      ...prev,
      [activeModuleIdx]: true,
    }));
  }, [activeModuleIdx]);

  const handlePrevLesson = () => {
    if (safeFlatIdx > 0) {
      const prevItem = allLessons[safeFlatIdx - 1];
      setActiveModuleIdx(prevItem.moduleIdx);
      setCurrentLessonIdx(prevItem.lessonIdx);
      setCurrentSubtopicIdx(prevItem.subtopicIdx);
    }
  };

  const handleNextLesson = () => {
    if (safeFlatIdx < allLessons.length - 1) {
      const nextItem = allLessons[safeFlatIdx + 1];
      setActiveModuleIdx(nextItem.moduleIdx);
      setCurrentLessonIdx(nextItem.lessonIdx);
      setCurrentSubtopicIdx(nextItem.subtopicIdx);
    }
  };

  // Keyboard Shortcuts: ArrowLeft (Previous Lesson), ArrowRight (Next Lesson), Escape (Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        activeTerminalCmd !== null ||
        isResourcesOpen ||
        previewingResource !== null
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevLesson();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextLesson();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [safeFlatIdx, allLessons, activeTerminalCmd, isResourcesOpen, previewingResource]);

  // Smooth scroll content to top and sidebar to active lesson
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (currentSubtopic) {
      const element = document.getElementById(`lesson-item-${currentSubtopic.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeModuleIdx, currentLessonIdx, currentSubtopicIdx, currentSubtopic]);

  const handleDownloadResource = (res: LessonResource) => {
    if (res.type === 'link') {
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } else {
      const link = document.createElement('a');
      link.href = res.url;
      link.download = res.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (!sessionDownloads.includes(res.id)) {
      setSessionDownloads((prev) => [...prev, res.id]);
    }
    toast.success(`Successfully opened/downloaded: ${res.name}`);
  };

  // Seek video jump handler
  const handleJumpToTimestamp = (timestamp: number, subtopicId: string) => {
    if (currentSubtopic.id !== subtopicId) {
      const path = allLessons.find(l => l.subtopicId === subtopicId);
      if (path) {
        setActiveModuleIdx(path.moduleIdx);
        setCurrentLessonIdx(path.lessonIdx);
        setCurrentSubtopicIdx(path.subtopicIdx);
      }
    }
    
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = timestamp;
        videoRef.current.play().catch(() => {});
        toast.info(`Seeking video to ${formatTime(timestamp)}...`);
      }
    }, 400);
  };

  // Debounced auto-save for note edits
  useEffect(() => {
    if (!editingNoteId) return;

    setSavingStatus('saving');
    const timer = setTimeout(() => {
      setNotes((prevNotes) => {
        const updated = prevNotes.map((note) =>
          note.id === editingNoteId
            ? { ...note, title: noteInputTitle, content: noteInputContent, updatedAt: new Date().toISOString() }
            : note
        );
        localStorage.setItem(`shaivika_notes_${course.id}`, JSON.stringify(updated));
        return updated;
      });
      setSavingStatus('saved');
      const clearTimer = setTimeout(() => setSavingStatus(null), 1500);
      return () => clearTimeout(clearTimer);
    }, 800);

    return () => clearTimeout(timer);
  }, [noteInputTitle, noteInputContent, editingNoteId, course.id]);

  const handleAddNote = () => {
    if (!noteInputContent.trim()) {
      toast.warning('Note content cannot be empty.');
      return;
    }

    const lessonType = getLessonType(currentSubtopic.id);
    let videoTimestamp: number | undefined;

    if (lessonType === 'video' && videoRef.current) {
      videoTimestamp = Math.floor(videoRef.current.currentTime);
    }

    const newNote: PersonalNote = {
      id: `note_${Date.now()}`,
      courseId: course.id,
      subtopicId: currentSubtopic.id,
      subtopicTitle: currentSubtopic.title,
      moduleTitle: activeModule.title,
      lessonType,
      title: noteInputTitle.trim() || `Note on ${currentSubtopic.title}`,
      content: noteInputContent,
      videoTimestamp,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem(`shaivika_notes_${course.id}`, JSON.stringify(updatedNotes));
    logRecentActivity(course.id, course.title, 'note', newNote.title);

    setNoteInputTitle('');
    setNoteInputContent('');
    toast.success('Note added successfully!');
  };

  const handleTogglePinNote = (noteId: string) => {
    const updated = notes.map((n) => (n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
    setNotes(updated);
    localStorage.setItem(`shaivika_notes_${course.id}`, JSON.stringify(updated));
    toast.success('Note pin status toggled.');
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    localStorage.setItem(`shaivika_notes_${course.id}`, JSON.stringify(updated));
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setNoteInputTitle('');
      setNoteInputContent('');
    }
    toast.success('Note deleted.');
  };

  const handleExportNotes = () => {
    const markdownContent = notes
      .map(
        (n) =>
          `# ${n.title || 'Untitled Note'}\n` +
          `**Lesson:** ${n.subtopicTitle} (${n.lessonType})\n` +
          `**Created:** ${new Date(n.createdAt).toLocaleString()}\n` +
          `**Pinned:** ${n.isPinned ? 'Yes' : 'No'}\n` +
          `${n.videoTimestamp !== undefined ? `**Video Timestamp:** ${formatTime(n.videoTimestamp)}\n` : ''}` +
          `\n` +
          `${n.content}\n` +
          `\n---\n`
      )
      .join('\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${course.title.replace(/\s+/g, '_')}_Study_Notes.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Study notes exported successfully as Markdown (.md)!');
  };

  const handleToggleBookmark = () => {
    if (!currentSubtopic) return;

    const isBookmarked = bookmarks.some((b) => b.subtopicId === currentSubtopic.id);
    let updated: LessonBookmark[];

    if (isBookmarked) {
      updated = bookmarks.filter((b) => b.subtopicId !== currentSubtopic.id);
      toast.info('Bookmark removed.');
    } else {
      const lessonType = getLessonType(currentSubtopic.id);
      const newBookmark: LessonBookmark = {
        id: currentSubtopic.id,
        courseId: course.id,
        subtopicId: currentSubtopic.id,
        subtopicTitle: currentSubtopic.title,
        moduleTitle: activeModule.title,
        lessonType,
        createdAt: new Date().toISOString(),
      };
      updated = [...bookmarks, newBookmark];
      toast.success('Lesson bookmarked successfully!');
      logRecentActivity(course.id, course.title, 'bookmark', currentSubtopic.title);
    }

    setBookmarks(updated);
    localStorage.setItem(`shaivika_bookmarks_${course.id}`, JSON.stringify(updated));
  };

  const isLessonLocked = (item: CourseLessonPath) => {
    const mIdx = item.moduleIdx;
    if (mIdx > 0 && !completedModules.includes(mIdx - 1)) {
      return true;
    }
    const moduleLessons = allLessons.filter((l) => l.moduleIdx === mIdx);
    const indexInModule = moduleLessons.findIndex((l) => l.subtopicId === item.subtopicId);
    if (indexInModule === 0) {
      return false;
    }
    const prevLessonInModule = moduleLessons[indexInModule - 1];
    return !completedSubtopics.includes(prevLessonInModule.subtopicId);
  };

  // Auto-save checkpoint continuously whenever position or completion changes
  useEffect(() => {
    if (course.id && currentLesson && currentSubtopic) {
      courseService.saveCourseCheckpoint(course.id, {
        courseId: course.id,
        progressPercent: Math.min(100, Math.max(5, progressPercent)),
        lastModuleIdx: activeModuleIdx,
        lastLessonIdx: currentLessonIdx,
        lastSubtopicIdx: currentSubtopicIdx,
        lastSubtopicTitle: currentSubtopic.title,
        completedSubtopics,
        completedModules,
        inProgressSubtopics,
        lastUpdated: new Date().toISOString(),
      });
      if (onProgressUpdate) {
        onProgressUpdate(Math.min(100, Math.max(5, progressPercent)));
      }
    }
  }, [course.id, activeModuleIdx, currentLessonIdx, currentSubtopicIdx, completedSubtopics, completedModules, inProgressSubtopics, progressPercent, currentLesson, currentSubtopic]);


  // Mandatory 15 Seconds Spended Time per Subtopic before Claiming XP

  useEffect(() => {
    setTimerSeconds(0);
  }, [activeModuleIdx, currentLessonIdx, currentSubtopicIdx]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeModuleIdx, currentLessonIdx, currentSubtopicIdx]);

  const remainingSeconds = Math.max(0, requiredSubtopicSeconds - timerSeconds);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isSubtopicTimeMet = timerSeconds >= requiredSubtopicSeconds;
  const isSubtopicCompleted = completedSubtopics.includes(currentSubtopic?.id || '');

  // Strict Sequential Lock Validation
  const canAccessSubtopic = (lessonIndex: number, subtopicIndex: number): boolean => {
    if (lessonIndex === 0 && subtopicIndex === 0) return true;

    for (let l = 0; l <= lessonIndex; l++) {
      const lesson = activeCurriculum[l];
      if (!lesson) continue;
      const maxSubIdx = l === lessonIndex ? subtopicIndex - 1 : lesson.subtopics.length - 1;
      for (let s = 0; s <= maxSubIdx; s++) {
        const sub = lesson.subtopics[s];
        if (sub && !completedSubtopics.includes(sub.id)) {
          return false;
        }
      }
    }
    return true;
  };

  const canAccessModule = (moduleIdx: number): boolean => {
    if (moduleIdx === 0) return true;
    for (let m = 0; m < moduleIdx; m++) {
      if (!completedModules.includes(m)) return false;
    }
    return true;
  };

  const handleCompleteSubtopic = () => {
    if (!isSubtopicTimeMet && !isSubtopicCompleted) {
      toast.warning(`⏳ Required focus time not reached! Spend ${remainingSeconds} seconds more studying this subtopic.`);
      return;
    }

    if (!isSubtopicCompleted && currentSubtopic) {
      const newXP = courseService.addXPPoints(20);
      setUserXP(newXP);
      setCompletedSubtopics((prev) => [...prev, currentSubtopic.id]);

      // Detailed Claim Log
      courseService.addXPClaim({
        id: `claim_${Date.now()}`,
        title: `Subtopic ${currentSubtopic.id}: ${currentSubtopic.title}`,
        xp: 20,
        category: 'Subtopic Completion',
        timestamp: new Date().toISOString(),
        courseId: course.id,
        courseTitle: course.title,
      });

      const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
      setCelebrationMessage(quote);
    } else {
      advanceNextSubtopic();
    }
  };

  const advanceNextSubtopic = () => {
    setCelebrationMessage(null);
    if (safeFlatIdx < allLessons.length - 1) {
      const nextItem = allLessons[safeFlatIdx + 1];
      setActiveModuleIdx(nextItem.moduleIdx);
      setCurrentLessonIdx(nextItem.lessonIdx);
      setCurrentSubtopicIdx(nextItem.subtopicIdx);
      toast.success(`Advancing to Lesson ${nextItem.subtopicId}!`);
    } else {
      if (!completedModules.includes(activeModuleIdx)) {
        setCompletedModules((prev) => [...prev, activeModuleIdx]);
        if (!claimedPointsModules.includes(activeModuleIdx)) {
          setClaimedPointsModules((prev) => [...prev, activeModuleIdx]);
          const newXP = courseService.addXPPoints(50);
          setUserXP(newXP);
          courseService.addXPClaim({
            id: `mod_bonus_${Date.now()}`,
            title: `Module 0${activeModuleIdx + 1} Mastery Bonus`,
            xp: 50,
            category: 'Module Completion Bonus',
            timestamp: new Date().toISOString(),
            courseId: course.id,
            courseTitle: course.title,
          });
        }
      }
      toast.success(`🎉 Module 0${activeModuleIdx + 1} 100% Completed! Next Module Unlocked!`);
    }
  };



  const handlePrevModule = () => {
    if (activeModuleIdx > 0) {
      setActiveModuleIdx(activeModuleIdx - 1);
    }
  };

  const isModulePointsEligible = timerSeconds >= 15;
  const hasClaimedModulePoints = claimedPointsModules.includes(activeModuleIdx);

  const handleClaimModulePoints = async () => {
    if (!hasClaimedModulePoints) {
      const updatedXP = courseService.addXPPoints(50);
      setUserXP(updatedXP);
      setClaimedPointsModules([...claimedPointsModules, activeModuleIdx]);
      toast.success(`🎁 +50 Module Mastery XP Claimed! Total: ${updatedXP} XP`);
    }

    let updatedCompleted = completedModules;
    if (!completedModules.includes(activeModuleIdx)) {
      updatedCompleted = [...completedModules, activeModuleIdx];
      setCompletedModules(updatedCompleted);
    }

    const newProgress = Math.round((updatedCompleted.length / syllabus.length) * 100);
    await courseService.updateCourseProgress(course.id, newProgress);
    if (onProgressUpdate) onProgressUpdate(newProgress);

    if (activeModuleIdx < syllabus.length - 1) {
      setActiveModuleIdx(activeModuleIdx + 1);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 w-screen h-screen font-['Sora'] flex flex-col overflow-hidden transition-colors duration-300 ${
      isReadingMode
        ? 'bg-[#faf6ee] text-[#2c2416]'
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* ----------------- 1. WHITE & SKY BLUE TOP NAVIGATION HEADER ----------------- */}
      <header className={`h-16 shrink-0 border-b px-4 sm:px-8 flex items-center justify-between gap-4 z-10 shadow-xs transition-colors ${
        isReadingMode ? 'bg-[#f4efe4] border-[#e2d9c8]' : 'bg-white border-sky-100'
      }`}>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Toggle Button (Drawer) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-sky-50 border border-sky-200 md:hidden text-sky-700 cursor-pointer"
          >
            <MenuIcon className="w-4 h-4" />
          </button>

          {/* Desktop/Tablet Collapse Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <MenuIcon className="w-4 h-4" />
            <span className="hidden lg:inline">{sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Exit Classroom</span>
          </button>

          <div className="h-6 w-px bg-sky-200 hidden sm:block" />

          <div className="space-y-1">
            <h1 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 truncate max-w-40 sm:max-w-xl leading-none">
              {course.title}
            </h1>
            <span className="text-[9px] font-bold text-slate-500 block">
              Category: {course.category}
            </span>
          </div>

          <div className="h-6 w-px bg-sky-200 hidden sm:block" />

          {/* Upgraded Animated Progress Tracker */}
          <div className="hidden md:flex flex-col gap-1 w-48 lg:w-60">
            <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-600 uppercase">
              <span className="text-sky-700">{progressPercent}% Completed</span>
              <span className="text-emerald-700">{completedLessonsCount}/{allLessons.length} Lessons</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-sky-100/50 relative">
              <div
                className="h-full bg-linear-to-r from-sky-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase">
              <span>Remaining: {allLessons.length - completedLessonsCount}</span>
              <span>~{Math.max(0, (allLessons.length - completedLessonsCount) * 5)} mins left</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Modules Menu Drawer Button */}
          <button
            onClick={() => setIsModulesMenuOpen(true)}
            className="py-1.5 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-sky-600/20"
          >
            <Layers className="w-4 h-4 text-white" />
            <span>Modules Menu</span>
          </button>

          {/* Reading Mode Toggle Button */}
          <button
            onClick={() => {
              setIsReadingMode(!isReadingMode);
              toast.info(isReadingMode ? 'Switched to Sky Blue Theme' : '📖 Sepia Reading Mode Activated!');
            }}
            className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isReadingMode
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100'
            }`}
          >
            {isReadingMode ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-sky-600" />}
            <span className="hidden md:inline">{isReadingMode ? 'Sepia Mode' : 'Reading Mode'}</span>
          </button>

          {/* Resources Button */}
          <button
            onClick={() => setIsResourcesOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <FolderDown className="w-4 h-4" />
            <span className="hidden md:inline">Resources</span>
          </button>

          {/* Bookmark Toggle Icon Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isCurrentSubtopicBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-2xs animate-in'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={isCurrentSubtopicBookmarked ? 'Remove Bookmark' : 'Bookmark this Lesson'}
          >
            <Bookmark className={`w-4 h-4 ${isCurrentSubtopicBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>

          {/* Notes & Bookmarks Toggle Button */}
          <button
            onClick={() => {
              setIsNotesPanelOpen(!isNotesPanelOpen);
              setIsAiPanelOpen(false);
            }}
            className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isNotesPanelOpen
                ? 'bg-sky-100 border-sky-300 text-sky-800'
                : 'bg-white border-sky-200 text-slate-700 hover:bg-sky-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span className="hidden lg:inline">Notes & Bookmarks</span>
            {bookmarks.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-extrabold leading-none">
                {bookmarks.length}
              </span>
            )}
          </button>

          {/* AI Learning Assistant Toggle Button */}
          <button
            onClick={() => {
              setIsAiPanelOpen(!isAiPanelOpen);
              setIsNotesPanelOpen(false);
              setIsQuizPortalOpen(false);
            }}
            className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isAiPanelOpen
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-white border-sky-200 text-slate-700 hover:bg-sky-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="hidden lg:inline">AI Tutor</span>
          </button>

          {/* AI Quiz Generator Toggle Button */}
          <button
            onClick={() => {
              setIsQuizPortalOpen(!isQuizPortalOpen);
              setIsAiPanelOpen(false);
              setIsNotesPanelOpen(false);
            }}
            className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isQuizPortalOpen
                ? 'bg-purple-100 border-purple-300 text-purple-800'
                : 'bg-white border-sky-200 text-slate-700 hover:bg-sky-50'
            }`}
          >
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="hidden lg:inline">AI Quiz</span>
          </button>

          {/* XP Reward Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-current animate-bounce" />
            <span>{userXP} XP</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ----------------- 2. MAIN CLASSROOM BODY (WHITE & SKY BLUE THEME) ----------------- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR: Mobile Drawer / Desktop Sidebar */}
        <aside className={`shrink-0 border-r p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4 transition-all duration-300 ${
          mobileMenuOpen
            ? 'fixed inset-y-16 left-0 z-40 w-72 shadow-2xl bg-white'
            : 'hidden md:flex'
        } ${
          sidebarCollapsed
            ? 'md:w-16 md:p-2'
            : 'md:w-72 lg:w-80'
        } ${isReadingMode ? 'bg-[#f4efe4] border-[#e2d9c8]' : 'bg-sky-50/60 border-sky-100'}`}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-4">
              {syllabus.map((mod, idx) => {
                const isActive = idx === activeModuleIdx;
                const isCompleted = completedModules.includes(idx);
                return (
                  <button
                    key={mod.id || idx}
                    onClick={() => {
                      setSidebarCollapsed(false);
                      if (idx > 0 && !completedModules.includes(idx - 1)) {
                        setLockedModulePopup(idx);
                        return;
                      }
                      setActiveModuleIdx(idx);
                    }}
                    title={mod.title}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-sky-600 border-sky-500 text-white shadow-md'
                        : isCompleted
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-white border-sky-100 text-slate-600 hover:bg-sky-50'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sky-200">
                <h2 className="font-heading font-bold text-xs text-sky-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-600" /> Syllabus Flow ({syllabus.length})
                </h2>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[11px] font-semibold text-slate-500">{course.duration}</span>
                  {courseStatus === 'Completed' ? (
                    <span className="text-[8px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      ✔ Course Completed
                    </span>
                  ) : courseStatus === 'In Progress' ? (
                    <span className="text-[8px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      ⏳ Course In Progress
                    </span>
                  ) : (
                    <span className="text-[8px] font-extrabold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      ○ Course Not Started
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {syllabus.map((mod, idx) => {
                  const isActive = idx === activeModuleIdx;
                  const isCompleted = completedModules.includes(idx);
                  const isExpanded = !!expandedModules[idx];
                  
                  // Get all lessons for this module
                  const moduleLessons = allLessons.filter(l => l.moduleIdx === idx);

                  return (
                    <div key={mod.id || idx} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isActive ? 'border-sky-300 bg-sky-50/30' : 'border-sky-100 bg-white'
                    }`}>
                      <button
                        onClick={() => {
                          setExpandedModules(prev => ({
                            ...prev,
                            [idx]: !prev[idx]
                          }));
                        }}
                        className="w-full text-left p-3.5 transition-all cursor-pointer flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : isActive ? (
                              <PlayCircle className="w-4 h-4 text-sky-600 animate-pulse" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-sky-300 text-[10px] font-bold flex items-center justify-center text-sky-600">
                                {idx + 1}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 text-xs min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold block leading-snug text-slate-900">
                                Module 0{idx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {getModuleStatus(idx) === 'Completed' ? (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    ✔ Completed
                                  </span>
                                ) : getModuleStatus(idx) === 'In Progress' ? (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded animate-pulse">
                                    ⏳ In Progress
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                    ○ Not Started
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold block leading-tight text-slate-600 truncate">
                              {mod.title.replace(/^(🟢|🟡|🔵|🔴)\s*Module \d+:\s*/, '')}
                            </span>
                            <div className="flex items-center gap-3 text-[10px] font-medium pt-0.5">
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3.5 h-3.5 text-sky-500" /> {mod.duration}
                              </span>
                              <span className="text-slate-500">
                                • {Math.round((moduleLessons.filter(l => completedSubtopics.includes(l.subtopicId)).length / Math.max(1, moduleLessons.length)) * 100)}% progress
                              </span>
                            </div>
                            </div>
                          </div>
                        <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 mt-1 ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Subtopic / Lesson list inside the expanded module */}
                      {isExpanded && (
                        <div className="pl-4 pr-2 pb-3.5 space-y-1 border-t border-sky-100/50 bg-white/50 pt-2">
                          {moduleLessons.map((item) => {
                            const isCur = item.moduleIdx === activeModuleIdx &&
                                          item.lessonIdx === currentLessonIdx &&
                                          item.subtopicIdx === currentSubtopicIdx;
                            const isLsnDone = completedSubtopics.includes(item.subtopicId);
                            const isLsnLocked = isLessonLocked(item);
                            const isLsnInProgress = inProgressSubtopics.includes(item.subtopicId) && !isLsnDone;

                            let statusIcon = <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
                             if (isLsnDone) {
                               statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
                             } else if (isLsnLocked) {
                               statusIcon = <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
                             } else if (isCur || isLsnInProgress) {
                               statusIcon = <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
                             }

                            return (
                              <button
                                key={item.subtopicId}
                                id={`lesson-item-${item.subtopicId}`}
                                onClick={() => {
                                  if (isLsnLocked) {
                                    toast.error(`🔒 This lesson is locked. Complete preceding lessons first.`);
                                    return;
                                  }
                                  setActiveModuleIdx(item.moduleIdx);
                                  setCurrentLessonIdx(item.lessonIdx);
                                  setCurrentSubtopicIdx(item.subtopicIdx);
                                  setMobileMenuOpen(false);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl text-[11px] flex items-start gap-2.5 transition-all duration-200 cursor-pointer ${
                                  isCur
                                    ? 'bg-sky-100/80 text-sky-950 font-bold border-l-2 border-sky-600 shadow-2xs'
                                    : 'hover:bg-slate-100/60 text-slate-700 font-medium'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">{statusIcon}</div>
                                <div className="flex-1 min-w-0">
                                  <span className="block truncate leading-tight">{item.subtopicTitle}</span>
                                  <span className="text-[9px] text-slate-400 font-normal mt-0.5 block">
                                    {isLsnDone ? 'Completed' : isLsnInProgress ? 'In Progress' : isLsnLocked ? 'Locked' : 'Not Started'}
                                  </span>
                                </div>
                              </button>
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

          {!sidebarCollapsed && (
            <div className="p-3.5 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                Lead Instructor
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={course.instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={course.instructor.name}
                  className="w-9 h-9 rounded-full object-cover border border-sky-300"
                />
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">{course.instructor.name}</h4>
                  <p className="text-[10px] text-slate-500">{course.instructor.role || 'Senior Specialist'}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT MAIN CLASSROOM CONTENT VIEWER */}
        <main className={`flex-1 p-4 sm:p-10 flex flex-col justify-between overflow-y-auto space-y-8 transition-colors ${
          isReadingMode ? 'bg-[#faf6ee]' : 'bg-slate-50'
        }`}>
          <div className="space-y-8 max-w-5xl mx-auto w-full">
            {/* Breadcrumb Display */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium pb-2 border-b border-sky-100">
              <span className="text-slate-400 hover:text-sky-600 transition-colors cursor-pointer">{course.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 hover:text-sky-600 transition-colors cursor-pointer">Module 0{activeModuleIdx + 1}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 truncate max-w-xs" title={currentLesson.title}>
                {currentLesson.title.replace(/^(Lesson \d+\.\d+:\s*|Topic \d+:\s*)/, '')}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sky-600 font-bold truncate max-w-xs animate-in fade-in duration-200" title={currentSubtopic.title}>
                {currentSubtopic.title.replace(/^(\d+\.\d+\.\d+\s*)/, '')}
              </span>
            </div>

            {/* Top Module Header & Navigation Tabs */}
            <div className="space-y-4 border-b border-sky-200 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider">
                    Module 0{activeModuleIdx + 1} of 0{syllabus.length}
                  </span>
                  <h2 className="font-heading font-extrabold text-xl sm:text-3xl text-slate-900 mt-2">
                    {activeModule.title}
                  </h2>
                </div>

                {/* Subtopic Focus Spend Timer Widget */}
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                    isSubtopicTimeMet || isSubtopicCompleted
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                  }`}>
                    <Clock className={`w-4 h-4 ${isSubtopicTimeMet || isSubtopicCompleted ? 'text-emerald-600 animate-pulse' : 'text-amber-600 animate-spin'}`} />
                    <div className="text-xs font-mono">
                      <span className="block text-[10px] font-bold text-slate-500 font-sans uppercase">Spended Time (Min 15s)</span>
                      <span className="font-extrabold text-sm text-slate-900">
                        {formatTime(timerSeconds)} / 00:15
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson View Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'content'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Sequential Subtopics
                </button>

                <button
                  onClick={() => setActiveTab('commands')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'commands'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-emerald-600" /> Commands Matrix
                </button>

                {activeModuleIdx === 0 && (
                  <button
                    onClick={() => setActiveTab('slides')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'slides'
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                        : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-50'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-sky-600" /> Diagrams
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab('lab');
                    setForceOpenCreateQuestion(false);
                    setTargetLessonId(undefined);
                    setTargetLessonName(undefined);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'lab'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" /> Live Lab
                </button>

                {hasChallenge && (
                  <button
                    onClick={() => {
                      setActiveTab('practice-lab');
                      setForceOpenCreateQuestion(false);
                      setTargetLessonId(undefined);
                      setTargetLessonName(undefined);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'practice-lab'
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                        : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-50'
                    }`}
                  >
                    <Code className="w-4 h-4 text-emerald-600 animate-pulse" /> Practice Lab
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveTab('discussions');
                    setForceOpenCreateQuestion(false);
                    setTargetLessonId(undefined);
                    setTargetLessonName(undefined);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'discussions'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> Discussion Center
                  {unreadDiscussions > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-extrabold leading-none animate-pulse">
                      {unreadDiscussions}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: SEQUENTIAL SUBTOPIC STEPPER & CONTENT */}
            {activeTab === 'content' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="space-y-8">
                  {/* Subtopic Stepper Pills */}
                  <div className="p-4 rounded-3xl bg-white border border-sky-100 space-y-3 shadow-xs">
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest block">
                      Topic {currentLessonIdx + 1}: {currentLesson.title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentLesson.subtopics.map((sub: SubtopicDetail, sIdx: number) => {
                        const isCur = sIdx === currentSubtopicIdx;
                        const isDone = completedSubtopics.includes(sub.id);

                        // Hide future topics completely until preceding topic is completed & claimed
                        if (!isCur && !isDone) {
                          return null;
                        }

                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              if (canAccessSubtopic(currentLessonIdx, sIdx)) {
                                setCurrentSubtopicIdx(sIdx);
                              } else {
                                toast.error(`🔒 Strict Order Lock: You must complete preceding subtopics in order first!`);
                              }
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                              isCur
                                ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/20'
                                : isDone
                                ? 'bg-sky-50 border-sky-200 text-sky-900 font-semibold'
                                : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            {isCur ? (
                              <PlayCircle className="w-3.5 h-3.5 text-white animate-pulse" />
                            ) : !isDone ? (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            ) : null}
                            <span>Subtopic {sub.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Subtopic Card */}
                  <motion.div
                    key={`${activeModuleIdx}_${currentLessonIdx}_${currentSubtopicIdx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`p-6 sm:p-8 rounded-3xl border space-y-6 shadow-md backdrop-blur-xl ${
                      isReadingMode
                        ? 'bg-[#f4efe4] border-[#e2d9c8]'
                        : 'bg-white border-sky-100'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                      <div className="space-y-1">
                        <span className="px-3 py-1 rounded-lg bg-sky-100 border border-sky-200 text-sky-800 text-xs font-extrabold uppercase">
                          Subtopic {currentSubtopic.id} • Exam & Interview Target
                        </span>
                        <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">
                          {currentSubtopic.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {completedSubtopics.includes(currentSubtopic.id) ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>✔ Completed</span>
                          </div>
                        ) : inProgressSubtopics.includes(currentSubtopic.id) ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold uppercase shrink-0">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>⏳ In Progress</span>
                          </div>
                        ) : getLessonType(currentSubtopic.id) === 'assignment' ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold uppercase shrink-0">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>⏳ Pending Submission</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase shrink-0">
                            <Circle className="w-3.5 h-3.5 text-slate-400" />
                            <span>○ Not Started</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setActiveTab('discussions');
                            setForceOpenCreateQuestion(true);
                            setTargetLessonId(String(currentSubtopic.id));
                            setTargetLessonName(currentSubtopic.title);
                            toast.info('Opening Q&A center for this lesson...');
                          }}
                          className="py-2 px-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-105 transition-all cursor-pointer text-xs font-extrabold flex items-center gap-1.5"
                        >
                          <HelpCircle className="w-4 h-4 text-indigo-600" />
                          <span>Ask a Question</span>
                        </button>

                        {currentSubtopic.terminalCommand && (
                          <button
                            onClick={() => setActiveTerminalCmd(currentSubtopic.terminalCommand!)}
                            className="py-2 px-3.5 rounded-xl bg-black border border-slate-800 text-emerald-400 hover:bg-slate-900 transition-all cursor-pointer text-xs font-extrabold flex items-center gap-2 shadow-md"
                          >
                            <Terminal className="w-4 h-4 text-emerald-400" /> Launch Black Terminal Sandbox
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dynamic content rendering based on lesson type */}
                    {getLessonType(currentSubtopic.id) === 'video' && (
                      <div className="space-y-4">
                        <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-sky-100 flex items-center justify-center">
                          <video
                            ref={videoRef}
                            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                            className="w-full h-full object-cover"
                            controls
                            onTimeUpdate={(e) => {
                              const video = e.currentTarget;
                              const percent = (video.currentTime / video.duration) * 100;
                              if (percent > 0) {
                                setVideoWatchedPercent((prev) => ({
                                  ...prev,
                                  [currentSubtopic.id]: percent,
                                }));
                              }
                              if (percent >= 90 && !completedSubtopics.includes(currentSubtopic.id)) {
                                setCompletedSubtopics((prev) => {
                                  if (prev.includes(currentSubtopic.id)) return prev;
                                  toast.success(`🎥 Video Watched! Marked as Completed.`);
                                  return [...prev, currentSubtopic.id];
                                });
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-sky-100/50">
                          <span>Progress: {Math.min(100, Math.round(videoWatchedPercent[currentSubtopic.id] || 0))}% watched</span>
                          {completedSubtopics.includes(currentSubtopic.id) ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setCompletedSubtopics((prev) => {
                                  if (prev.includes(currentSubtopic.id)) return prev;
                                  toast.success(`🎥 Video Marked as Completed!`);
                                  return [...prev, currentSubtopic.id];
                                });
                              }}
                              className="py-1 px-3 rounded-lg bg-sky-600 text-white font-bold text-[11px] cursor-pointer hover:bg-sky-700 transition-all"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {getLessonType(currentSubtopic.id) === 'quiz' && (
                      <div className="p-4 sm:p-6 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-4">
                        <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                          <h4 className="font-heading font-extrabold text-sm text-slate-900">
                            Knowledge Check Quiz: {currentSubtopic.title}
                          </h4>
                          <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                            Passing Score: {(currentSubtopic as any).learningUnit?.quizPassingScore || 70}%
                          </span>
                        </div>

                        {(currentSubtopic as any).learningUnit?.quizQuestions && (currentSubtopic as any).learningUnit.quizQuestions.length > 0 ? (
                          <div className="space-y-4">
                            {((currentSubtopic as any).learningUnit.quizQuestions as any[]).map((q, qIdx) => (
                              <div key={q.id || qIdx} className="space-y-2">
                                <p className="text-xs font-bold text-slate-800">{qIdx + 1}. {q.questionText}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt: string, oIdx: number) => {
                                    const isSelected = quizAnswers[currentSubtopic.id]?.[qIdx] === oIdx;
                                    return (
                                      <button
                                        key={oIdx}
                                        disabled={quizPassed[currentSubtopic.id]}
                                        onClick={() => setQuizAnswers(prev => ({
                                          ...prev,
                                          [currentSubtopic.id]: {
                                            ...(prev[currentSubtopic.id] || {}),
                                            [qIdx]: oIdx
                                          }
                                        }))}
                                        className={`p-2.5 rounded-xl border text-xs text-left cursor-pointer transition-all ${
                                          isSelected
                                            ? 'bg-sky-600 border-sky-600 text-white font-bold'
                                            : 'bg-white border-sky-100 text-slate-700 hover:bg-sky-50'
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                                {quizSubmitted[currentSubtopic.id] && q.explanation && (
                                  <p className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 mt-1">
                                    💡 <strong>Explanation:</strong> {q.explanation}
                                  </p>
                                )}
                              </div>
                            ))}

                            <div className="pt-4 border-t border-sky-100 flex items-center justify-between gap-4">
                              <div>
                                {quizSubmitted[currentSubtopic.id] && (
                                  <p className={`text-xs font-bold ${quizPassed[currentSubtopic.id] ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {quizPassed[currentSubtopic.id] ? '✓ Quiz Passed!' : '✗ Some answers were incorrect. Try again!'}
                                  </p>
                                )}
                              </div>
                              {!quizPassed[currentSubtopic.id] ? (
                                <button
                                  onClick={() => {
                                    const questions = (currentSubtopic as any).learningUnit.quizQuestions;
                                    const userAns = quizAnswers[currentSubtopic.id] || {};
                                    const answeredCount = Object.keys(userAns).length;
                                    if (answeredCount < questions.length) {
                                      toast.warning('Please answer all questions first!');
                                      return;
                                    }

                                    let correctCount = 0;
                                    questions.forEach((q: any, idx: number) => {
                                      if (userAns[idx] === q.correctAnswerIndex) {
                                        correctCount++;
                                      }
                                    });

                                    const scorePercent = (correctCount / questions.length) * 100;
                                    const passing = (currentSubtopic as any).learningUnit.quizPassingScore || 70;
                                    const passed = scorePercent >= passing;

                                    setQuizSubmitted(prev => ({ ...prev, [currentSubtopic.id]: true }));
                                    setQuizPassed(prev => ({ ...prev, [currentSubtopic.id]: passed }));
                                    
                                    if (passed) {
                                      logRecentActivity(course.id, course.title, 'quiz', currentSubtopic.title);
                                      setCompletedSubtopics(prev => {
                                        if (prev.includes(currentSubtopic.id)) return prev;
                                        toast.success('🎉 Quiz Passed! Lesson Completed.');
                                        return [...prev, currentSubtopic.id];
                                      });
                                    } else {
                                      toast.error(`Quiz Failed. You got ${Math.round(scorePercent)}% (Required: ${passing}%)`);
                                    }
                                  }}
                                  className="py-2 px-5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                                >
                                  Submit Answers
                                </button>
                              ) : (
                                <div className="py-2 px-4 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Completed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Fallback to legacy hardcoded quiz content
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-800">1. Which Linux distribution is known as the enterprise gold standard with commercial support?</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {['Debian GNU/Linux', 'RHEL (Red Hat Enterprise Linux)', 'Alpine Linux', 'Gentoo Linux'].map((opt, oIdx) => (
                                  <button
                                    key={oIdx}
                                    disabled={quizPassed[currentSubtopic.id]}
                                    onClick={() => setQuizAnswers(prev => ({
                                      ...prev,
                                      [currentSubtopic.id]: {
                                        ...(prev[currentSubtopic.id] || {}),
                                        0: oIdx
                                      }
                                    }))}
                                    className={`p-2.5 rounded-xl border text-xs text-left cursor-pointer transition-all ${
                                      quizAnswers[currentSubtopic.id]?.[0] === oIdx
                                        ? 'bg-sky-600 border-sky-600 text-white font-bold'
                                        : 'bg-white border-sky-100 text-slate-700 hover:bg-sky-50'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-800">2. Which lightweight Linux distribution is widely used as a base image for Docker containers?</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {['Ubuntu Linux', 'CentOS Linux', 'Fedora Linux', 'Alpine Linux'].map((opt, oIdx) => (
                                  <button
                                    key={oIdx}
                                    disabled={quizPassed[currentSubtopic.id]}
                                    onClick={() => setQuizAnswers(prev => ({
                                      ...prev,
                                      [currentSubtopic.id]: {
                                        ...(prev[currentSubtopic.id] || {}),
                                        1: oIdx
                                      }
                                    }))}
                                    className={`p-2.5 rounded-xl border text-xs text-left cursor-pointer transition-all ${
                                      quizAnswers[currentSubtopic.id]?.[1] === oIdx
                                        ? 'bg-sky-600 border-sky-600 text-white font-bold'
                                        : 'bg-white border-sky-100 text-slate-700 hover:bg-sky-50'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="pt-4 border-t border-sky-100 flex items-center justify-between gap-4">
                              <div>
                                {quizSubmitted[currentSubtopic.id] && (
                                  <p className={`text-xs font-bold ${quizPassed[currentSubtopic.id] ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {quizPassed[currentSubtopic.id] ? '✓ Quiz Passed (100% Score)' : '✗ Incorrect Answer(s). Try again!'}
                                  </p>
                                )}
                              </div>
                              {!quizPassed[currentSubtopic.id] ? (
                                <button
                                  onClick={() => {
                                    const ans1 = quizAnswers[currentSubtopic.id]?.[0];
                                    const ans2 = quizAnswers[currentSubtopic.id]?.[1];
                                    if (ans1 === undefined || ans2 === undefined) {
                                      toast.warning('Please answer all questions first!');
                                      return;
                                    }
                                    const isCorrect = ans1 === 1 && ans2 === 3;
                                    setQuizSubmitted(prev => ({ ...prev, [currentSubtopic.id]: true }));
                                    setQuizPassed(prev => ({ ...prev, [currentSubtopic.id]: isCorrect }));
                                    if (isCorrect) {
                                      logRecentActivity(course.id, course.title, 'quiz', currentSubtopic.title);
                                      setCompletedSubtopics(prev => {
                                        if (prev.includes(currentSubtopic.id)) return prev;
                                        toast.success('🎉 Quiz Passed! Lesson Completed.');
                                        return [...prev, currentSubtopic.id];
                                      });
                                    } else {
                                      toast.error('Quiz Failed! Review your choices and resubmit.');
                                    }
                                  }}
                                  className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs cursor-pointer transition-all"
                                >
                                  Submit Quiz
                                </button>
                              ) : (
                                <div className="py-2 px-4 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Completed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {getLessonType(currentSubtopic.id) === 'assignment' && (
                      <AssignmentPortal
                        assignmentId={currentSubtopic.id}
                        assignmentTitle={currentSubtopic.title}
                        courseId={String(course.id)}
                        dueDate={(currentSubtopic as any).learningUnit?.assignmentDeadline || "2026-07-25T23:59:59Z"}
                        maxMarks={(currentSubtopic as any).learningUnit?.assignmentMaxMarks || 100}
                        passingMarks={Math.round(((currentSubtopic as any).learningUnit?.assignmentMaxMarks || 100) * 0.7)}
                        instructions={(currentSubtopic as any).learningUnit?.assignmentInstructions || "Map the concentric layers of a typical Linux system (Hardware, Kernel, Shell, User Utilities)..."}
                        description={(currentSubtopic as any).learningUnit?.description || "Linux Concentric Layers Architecture Assignment"}
                        allowedTypes={(currentSubtopic as any).learningUnit?.assignmentAllowedTypes?.split(',').map((s: string) => s.trim().toLowerCase()) || ['.pdf', '.docx', '.zip', '.sh', '.js', '.png', '.jpg']}
                      />
                    )}

                    {getLessonType(currentSubtopic.id) === 'reading' && (
                      <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal text-slate-800">
                        {currentSubtopic.content}
                      </div>
                    )}

                    {/* Table Data */}
                    {currentSubtopic.tableData && (
                      <div className="overflow-x-auto pt-2">
                        <table className="w-full text-left text-xs border-collapse min-w-150">
                          <thead>
                            <tr className="border-b border-sky-200 bg-sky-50 text-sky-900 font-semibold uppercase text-[10px]">
                              <th className="py-2.5 px-3">Directory / Item</th>
                              <th className="py-2.5 px-3">Category</th>
                              <th className="py-2.5 px-3">Spec</th>
                              <th className="py-2.5 px-3">Purpose & Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-sky-100 font-sans">
                            {currentSubtopic.tableData.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-sky-50/40">
                                <td className="py-2.5 px-3 font-bold text-sky-700">{row.distro}</td>
                                <td className="py-2.5 px-3 text-slate-700">{row.upstream}</td>
                                <td className="py-2.5 px-3 font-mono text-emerald-700">{row.packageManager}</td>
                                <td className="py-2.5 px-3 text-slate-700">{row.useCase}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ASCII Diagram */}
                    {currentSubtopic.asciiDiagram && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre leading-snug">
                        {currentSubtopic.asciiDiagram}
                      </div>
                    )}

                    {/* Code Snippet */}
                    {currentSubtopic.codeSnippet && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Code className="w-3.5 h-3.5 text-sky-600" /> Command Line Syntax
                          </span>
                        </div>
                        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                          {currentSubtopic.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* SUBTOPIC COMPLETION & GAMIFIED SCORE CLAIM BUTTON */}
                    <div className="pt-6 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        onClick={handlePrevLesson}
                        disabled={safeFlatIdx === 0}
                        className="py-2.5 px-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold cursor-pointer transition-all duration-200"
                      >
                        ◄ Previous Lesson
                      </button>

                      {!isSubtopicTimeMet && !isSubtopicCompleted ? (
                        <div className="flex flex-col items-center gap-1.5 w-full sm:w-auto">
                          <button
                            disabled
                            className="py-3 px-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs flex items-center justify-center gap-2 cursor-not-allowed shadow-xs w-full sm:w-auto"
                          >
                            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                            <span>⏳ Spended Time: {timerSeconds}s / 15s (Claim XP unlocks in {remainingSeconds}s)</span>
                          </button>
                          <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.round((timerSeconds / 15) * 100))}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleCompleteSubtopic}
                          className={`py-3.5 px-7 rounded-2xl text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 w-full sm:w-auto ${
                            isSubtopicCompleted
                              ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
                              : 'bg-linear-to-r from-sky-600 via-indigo-600 to-amber-500 hover:from-sky-500 hover:to-amber-400 shadow-sky-500/25'
                          }`}
                        >
                          {!isSubtopicCompleted ? (
                            <>
                              <Gift className="w-4 h-4 text-amber-200" />
                              <span>🎁 Claim +20 XP & Unlock Next Lesson ➔</span>
                            </>
                          ) : (
                            <>
                              <span>Next Lesson ➔</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* ----------------- PHASE 23: LESSON RESOURCES PANEL ----------------- */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border shadow-md backdrop-blur-xl transition-all duration-300 mt-8 ${
                    isReadingMode
                      ? 'bg-[#f4efe4] border-[#e2d9c8]'
                      : 'bg-white border-sky-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/60 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <FolderDown className="w-5 h-5 text-sky-600" />
                      <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900">
                        Lesson Resources
                      </h3>
                      {currentResources.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-[10px] font-bold">
                          {currentResources.length}
                        </span>
                      )}
                    </div>

                    {currentResources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={resourcesSearch}
                            onChange={(e) => setResourcesSearch(e.target.value)}
                            placeholder="Search Resources..."
                            className="pl-9 pr-4 py-1.5 rounded-xl border border-sky-100 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all w-full sm:w-44"
                          />
                        </div>

                        {/* Sort Dropdown */}
                        <select
                          value={resourcesSort}
                          onChange={(e) => setResourcesSort(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-sky-100 bg-slate-50/50 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all"
                        >
                          <option value="newest">Sort: Newest</option>
                          <option value="oldest">Sort: Oldest</option>
                          <option value="name">Sort: Name</option>
                          <option value="type">Sort: Type</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* MODULE 100% COMPLETED NEXT MODULE NAVIGATOR BANNER */}
                  {completedModules.includes(activeModuleIdx) && activeModuleIdx < syllabus.length - 1 && (
                    <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-emerald-600 via-sky-600 to-indigo-600 text-white shadow-xl space-y-4 font-['Sora'] text-center animate-in zoom-in-95 border border-sky-300">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                        <h3 className="font-heading font-extrabold text-xl sm:text-2xl">Module 0{activeModuleIdx + 1} 100% Completed!</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-sky-100 font-medium max-w-xl mx-auto">
                        Awesome effort! You have completed all lessons and claimed XP in Module 0{activeModuleIdx + 1}. You can now navigate to the Next Module below!
                      </p>
                      <button
                        onClick={() => {
                          const nextIdx = activeModuleIdx + 1;
                          setActiveModuleIdx(nextIdx);
                          setCurrentLessonIdx(0);
                          setCurrentSubtopicIdx(0);
                          toast.success(`🚀 Unlocked & Navigated to Module 0${nextIdx + 1}!`);
                        }}
                        className="py-3.5 px-8 rounded-2xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm shadow-lg hover:bg-sky-50 transition-all cursor-pointer inline-flex items-center gap-2.5 hover:scale-103"
                      >
                        <span>Navigate to Next Module (Module 0{activeModuleIdx + 2}) ➔</span>
                        <ChevronRight className="w-4 h-4 text-sky-600" />
                      </button>
                    </div>
                  )}

                  {/* Resources list / Empty State */}
                  {currentResources.length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-sky-50 border border-sky-100 text-sky-500 mx-auto flex items-center justify-center shadow-xs">
                        <Inbox className="w-6 h-6 text-sky-600" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-heading font-extrabold text-sm text-slate-800">
                          No Resources Available
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal">
                          There are no downloadable materials or references configured for this lesson subtopic.
                        </p>
                      </div>
                    </div>
                  ) : sortedResources.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <p className="text-xs text-slate-500 font-medium">
                        No resources matched your search query: <span className="font-bold text-slate-700">"{resourcesSearch}"</span>.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sortedResources.map((res) => {
                        const isDownloaded = sessionDownloads.includes(res.id);
                        
                        // Select file icon
                        let fileIcon = <FileText className="w-5 h-5 text-sky-600" />;
                        if (res.type === 'zip') {
                          fileIcon = <FileArchive className="w-5 h-5 text-amber-600" />;
                        } else if (res.type === 'image') {
                          fileIcon = <ImageIcon className="w-5 h-5 text-emerald-600" />;
                        } else if (res.type === 'code') {
                          fileIcon = <Code className="w-5 h-5 text-purple-600" />;
                        } else if (res.type === 'link') {
                          fileIcon = <ExternalLink className="w-5 h-5 text-sky-500" />;
                        } else if (res.type === 'ppt') {
                          fileIcon = <Presentation className="w-5 h-5 text-rose-500" />;
                        }

                        // Select badge style
                        let badgeStyle = "bg-sky-50 text-sky-800 border border-sky-100";
                        if (res.badge === 'Required') {
                          badgeStyle = "bg-rose-50 text-rose-800 border border-rose-100";
                        } else if (res.badge === 'Starter Code') {
                          badgeStyle = "bg-purple-50 text-purple-800 border border-purple-100";
                        } else if (res.badge === 'Project Files') {
                          badgeStyle = "bg-emerald-50 text-emerald-800 border border-emerald-100";
                        } else if (res.badge === 'Optional') {
                          badgeStyle = "bg-slate-100 text-slate-700 border border-slate-200";
                        }

                        return (
                          <div
                            key={res.id}
                            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 group hover:shadow-md hover:-translate-y-0.5 ${
                              isReadingMode
                                ? 'bg-[#faf6ee]/70 border-[#e2d9c8] hover:border-amber-400/40'
                                : 'bg-slate-50/50 border-sky-100/60 hover:bg-white hover:border-sky-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2.5 rounded-xl border ${
                                isReadingMode ? 'bg-[#f4efe4] border-[#e2d9c8]' : 'bg-white border-sky-100/40 shadow-2xs'
                              }`}>
                                {fileIcon}
                              </div>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${badgeStyle}`}>
                                    {res.badge}
                                  </span>
                                  {res.size && (
                                    <span className="text-[9px] text-slate-400 font-medium font-sans">
                                      {res.size}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-slate-400 font-medium uppercase font-sans">
                                    {res.type}
                                  </span>
                                </div>
                                <h4 className="font-heading font-extrabold text-xs text-slate-800 group-hover:text-sky-900 transition-colors truncate" title={res.name}>
                                  {res.name}
                                </h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-sky-100/50 mt-auto">
                              {/* Preview Button for PDF / Image */}
                              {(res.type === 'pdf' || res.type === 'image') && (
                                <button
                                  onClick={() => setPreviewingResource(res)}
                                  className="flex-1 py-1.5 px-3 rounded-xl border border-sky-200 text-sky-800 hover:bg-sky-50 text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>Preview</span>
                                </button>
                              )}

                              {/* Download Button */}
                              <button
                                onClick={() => handleDownloadResource(res)}
                                className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                                  isDownloaded
                                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                                    : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm shadow-sky-600/10'
                                }`}
                              >
                                {isDownloaded ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>✓ Downloaded</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{res.type === 'link' ? 'Open Link' : 'Download'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: COMMAND REFERENCE TABLE WITH CLICKABLE TERMINAL ICONS */}
            {activeTab === 'commands' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-4 sm:p-6 rounded-3xl bg-white border border-sky-100 space-y-4 backdrop-blur-xl shadow-md">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                    <div>
                      <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-sky-600" /> Module 0{activeModuleIdx + 1} Command Matrix
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Terminal icon only present on Linux CLI commands</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-800 border-collapse min-w-150">
                      <thead>
                        <tr className="border-b border-sky-200 bg-sky-50 text-sky-900 font-semibold uppercase text-[10px]">
                          <th className="py-3 px-3">Terminal</th>
                          <th className="py-3 px-3">Command</th>
                          <th className="py-3 px-3">Category</th>
                          <th className="py-3 px-3">Description</th>
                          <th className="py-3 px-3">Usage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sky-100">
                        {activeCommands.map((cmd, idx) => (
                          <tr key={idx} className="hover:bg-sky-50/50 font-mono text-[11px]">
                            <td className="py-3 px-3">
                              <button
                                onClick={() => setActiveTerminalCmd(cmd.usage || cmd.command)}
                                className="p-1.5 rounded-lg bg-black text-emerald-400 border border-slate-800 hover:bg-slate-900 transition-colors cursor-pointer"
                              >
                                <Terminal className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="py-3 px-3 font-bold text-sky-700">{cmd.command}</td>
                            <td className="py-3 px-3 font-sans text-slate-700 font-medium">{cmd.category}</td>
                            <td className="py-3 px-3 font-sans text-slate-700">{cmd.description}</td>
                            <td className="py-3 px-3 text-emerald-700 font-bold">{cmd.usage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DIAGRAM SLIDES CAROUSEL */}
            {activeTab === 'slides' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-4 sm:p-6 rounded-3xl bg-white border border-sky-100 space-y-6 backdrop-blur-xl shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sky-100 pb-4">
                    <div className="space-y-1">
                      <span className="px-3 py-1 rounded-md bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider">
                        {activeSlide.badge} • Slide 0{currentSlideIdx + 1} of 0{ARCHITECTURE_SLIDES.length}
                      </span>
                      <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">
                        {activeSlide.title}
                      </h3>
                      <p className="text-xs text-sky-700 font-semibold">{activeSlide.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCurrentSlideIdx((prev) => (prev - 1 + ARCHITECTURE_SLIDES.length) % ARCHITECTURE_SLIDES.length)}
                        className="py-2 px-3.5 rounded-xl bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>
                      <button
                        onClick={() => setCurrentSlideIdx((prev) => (prev + 1) % ARCHITECTURE_SLIDES.length)}
                        className="py-2 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-sky-600/20"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2 shadow-xl">
                    <img
                      src={activeSlide.image}
                      alt={activeSlide.title}
                      className="w-full max-h-95 object-contain rounded-xl mx-auto bg-slate-950"
                    />
                  </div>

                  <div className="p-4 sm:p-6 rounded-2xl bg-sky-50 border border-sky-100 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      {activeSlide.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LIVE INTERACTIVE LAB */}
            {activeTab === 'lab' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="rounded-3xl bg-black border border-slate-800 overflow-hidden shadow-2xl space-y-4 p-6 text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-300 font-mono">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span>shaivika-terminal-sandbox.sh</span>
                    </div>
                    <button
                      onClick={() => setActiveTerminalCmd('pwd')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Terminal className="w-3.5 h-3.5" /> Launch Black Terminal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRACTICE LAB */}
            {activeTab === 'practice-lab' && (
              <div className="flex-1 min-h-[500px] md:h-[600px] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
                <PracticeLab
                  lessonId={currentSubtopic?.id}
                  lessonTitle={currentSubtopic?.title}
                  courseId={String(course.id)}
                  courseTitle={course.title}
                  customChallenge={(currentSubtopic as any).learningUnit?.practiceLabChallenge}
                />
              </div>
            )}

            {/* TAB 5: DISCUSSION CENTER */}
            {activeTab === 'discussions' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <DiscussionCenter
                  courseId={String(course.id)}
                  currentLessonId={targetLessonId}
                  currentLessonName={targetLessonName}
                  forceCreateOpen={forceOpenCreateQuestion}
                  onCloseCreate={() => {
                    setForceOpenCreateQuestion(false);
                    setTargetLessonId(undefined);
                    setTargetLessonName(undefined);
                  }}
                  onUnreadCountChange={updateUnread}
                  lessonsList={allLessons.map(l => ({ id: String(l.subtopicId), title: l.subtopicTitle }))}
                />
              </div>
            )}
          </div>

          {/* ----------------- 3. BOTTOM CLASSROOM ACTION FOOTER ----------------- */}
          <footer className="pt-6 border-t border-sky-200 max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevModule}
                disabled={activeModuleIdx === 0}
                className="py-3 px-5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Module
              </button>

              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Module 0{activeModuleIdx + 1} of 0{syllabus.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {!isModulePointsEligible && !hasClaimedModulePoints ? (
                <button
                  disabled
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>🔒 Module Mastery Locked</span>
                </button>
              ) : (
                <button
                  onClick={handleClaimModulePoints}
                  className="w-full sm:w-auto py-3.5 px-7 rounded-2xl bg-linear-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Award className="w-4 h-4 text-emerald-300" />
                  <span>
                    {activeModuleIdx === syllabus.length - 1
                      ? 'Complete Track & Unlock Certificate 🎉'
                      : 'Mark Module Complete & Next Module ➔'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </footer>
        </main>
 
        {/* RIGHT PANEL: PERSONAL NOTES & SMART BOOKMARKS */}
        {isNotesPanelOpen && (
          <aside
            className={`shrink-0 border-l p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4 transition-all duration-300 ${
              mobileMenuOpen ? 'hidden' : ''
            } w-full md:w-80 lg:w-96 ${
              isReadingMode ? 'bg-[#f4efe4] border-[#e2d9c8]' : 'bg-sky-50/60 border-sky-100'
            } fixed inset-y-16 right-0 z-30 md:static h-[calc(100vh-64px)]`}
          >
            {/* Header with Switch Tabs (My Notes vs Bookmarks) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sky-200">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-xs text-sky-900 uppercase tracking-wider">
                    Study Assistant
                  </span>
                </div>
                <button
                  onClick={() => setIsNotesPanelOpen(false)}
                  className="p-1 rounded-lg hover:bg-rose-100 hover:text-rose-700 text-slate-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs Switcher */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100/80 border border-sky-100/50">
                <button
                  onClick={() => setRightActiveTab('notes')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rightActiveTab === 'notes'
                      ? 'bg-white text-sky-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  My Notes
                </button>
                <button
                  onClick={() => setRightActiveTab('bookmarks')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rightActiveTab === 'bookmarks'
                      ? 'bg-white text-sky-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Bookmarks ({bookmarks.length})
                </button>
              </div>
            </div>

            {/* TAB CONTENT: MY NOTES */}
            {rightActiveTab === 'notes' && (
              <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto pt-2">
                {/* Note Editor Card */}
                <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-3.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-sky-800 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md">
                      {editingNoteId ? '✏ Editing Note' : '📝 Create Study Note'}
                    </span>
                    {savingStatus && (
                      <span className="text-[9px] font-bold text-sky-600 animate-pulse">
                        {savingStatus === 'saving' ? 'Saving...' : 'Saved ✓'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={noteInputTitle}
                      onChange={(e) => setNoteInputTitle(e.target.value)}
                      placeholder="Note title (optional)..."
                      className="w-full p-2.5 rounded-xl border border-sky-100 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                    <textarea
                      value={noteInputContent}
                      onChange={(e) => setNoteInputContent(e.target.value)}
                      placeholder="Write your study notes here..."
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-sky-100 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {getLessonType(currentSubtopic.id) === 'video' && videoRef.current && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        ⏱ Will tag at {formatTime(Math.floor(videoRef.current.currentTime))}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {editingNoteId && (
                        <button
                          onClick={() => {
                            setEditingNoteId(null);
                            setNoteInputTitle('');
                            setNoteInputContent('');
                          }}
                          className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={editingNoteId ? () => setEditingNoteId(null) : handleAddNote}
                        className="py-1.5 px-3.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-extrabold cursor-pointer transition-all shadow-sm"
                      >
                        {editingNoteId ? 'Finish Editing' : 'Add Note'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filters, Sorting & Search Panel */}
                {notes.length > 0 && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={notesSearch}
                        onChange={(e) => setNotesSearch(e.target.value)}
                        placeholder="Search Notes..."
                        className="w-full pl-8 pr-4 py-1.5 rounded-xl border border-sky-100 bg-white/70 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={notesFilter}
                        onChange={(e) => setNotesFilter(e.target.value as any)}
                        className="flex-1 px-2 py-1 rounded-lg border border-sky-100 bg-white/80 text-[10px] font-medium text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="all">Filter: All</option>
                        <option value="video">Filter: Videos</option>
                        <option value="reading">Filter: Readings</option>
                        <option value="recent">Filter: 24h Recent</option>
                      </select>

                      <select
                        value={notesSort}
                        onChange={(e) => setNotesSort(e.target.value as any)}
                        className="flex-1 px-2 py-1 rounded-lg border border-sky-100 bg-white/80 text-[10px] font-medium text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="newest">Sort: Newest</option>
                        <option value="oldest">Sort: Oldest</option>
                        <option value="alpha">Sort: A-Z</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Note Cards List */}
                {sortedNotes.length === 0 ? (
                  <div className="text-center py-8 space-y-2 bg-white/40 rounded-2xl border border-sky-100/50 p-4">
                    <Inbox className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-[11px] text-slate-500 font-medium">
                      {notesSearch ? 'No notes matched search query.' : 'No notes written yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {sortedNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 bg-white hover:shadow-sm space-y-2.5 relative group ${
                          note.isPinned ? 'border-amber-300 bg-amber-50/5' : 'border-sky-100/60'
                        }`}
                      >
                        {/* Note Actions (Pin, Edit, Delete) */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleTogglePinNote(note.id)}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              note.isPinned ? 'text-amber-600 bg-amber-100/50' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={note.isPinned ? 'Unpin note' : 'Pin note'}
                          >
                            <Pin className="w-3 h-3 fill-current animate-in" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setNoteInputTitle(note.title);
                              setNoteInputContent(note.content);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                            title="Edit note"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="space-y-1 pr-16 min-w-0">
                          {/* Note meta: Timestamp & Type */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-semibold text-slate-400">
                            <span className="uppercase text-sky-700 bg-sky-50 border border-sky-100 px-1 rounded-sm">
                              {note.lessonType}
                            </span>
                            {note.videoTimestamp !== undefined && (
                              <button
                                onClick={() => handleJumpToTimestamp(note.videoTimestamp!, note.subtopicId)}
                                className="text-sky-600 hover:underline font-extrabold flex items-center gap-0.5 cursor-pointer"
                                title="Click to jump playback position"
                              >
                                ⏱ {formatTime(note.videoTimestamp)}
                              </button>
                            )}
                            <span className="truncate max-w-28" title={note.subtopicTitle}>
                              {note.subtopicTitle}
                            </span>
                          </div>
                          <h5 className="font-heading font-extrabold text-xs text-slate-800 truncate">
                            {note.title}
                          </h5>
                        </div>

                        <p className="text-[11px] leading-relaxed text-slate-600 font-sans whitespace-pre-wrap">
                          {note.content}
                        </p>

                        <div className="text-[8px] text-slate-400 font-medium pt-1 border-t border-slate-100 flex justify-between">
                          <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                          {note.updatedAt !== note.createdAt && <span>Edited</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Export Notes Button */}
                {notes.length > 0 && (
                  <button
                    onClick={handleExportNotes}
                    className="w-full py-2.5 rounded-xl border border-sky-200 text-sky-800 hover:bg-sky-50 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shrink-0 bg-white"
                  >
                    <Download className="w-4 h-4" /> Export Notes (.md)
                  </button>
                )}
              </div>
            )}

            {/* TAB CONTENT: BOOKMARKS */}
            {rightActiveTab === 'bookmarks' && (
              <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto pt-2">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-10 space-y-2 bg-white/40 rounded-2xl border border-sky-100/50 p-4">
                    <Bookmark className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-[11px] text-slate-500 font-medium">No bookmarks saved yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 overflow-y-auto flex-1">
                    {bookmarks.map((bm) => (
                      <button
                        key={bm.subtopicId}
                        onClick={() => {
                          const path = allLessons.find((l) => l.subtopicId === bm.subtopicId);
                          if (path) {
                            setActiveModuleIdx(path.moduleIdx);
                            setCurrentLessonIdx(path.lessonIdx);
                            setCurrentSubtopicIdx(path.subtopicIdx);
                            toast.success(`Navigated to bookmark: ${bm.subtopicTitle}`);
                          }
                        }}
                        className="w-full text-left p-3.5 rounded-2xl border border-sky-100/60 bg-white hover:bg-sky-50 hover:shadow-xs transition-all duration-200 flex flex-col gap-1.5 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[8px] font-extrabold uppercase text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-md">
                            {bm.lessonType}
                          </span>
                          <span className="text-[8px] font-medium text-slate-400 font-sans">
                            Saved: {new Date(bm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-heading font-extrabold text-xs text-slate-800 truncate group-hover:text-sky-900 transition-colors">
                          {bm.subtopicTitle}
                        </h4>
                        <span className="text-[9px] font-medium text-slate-400 block truncate">
                          {bm.moduleTitle}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        )}

        {/* RIGHT PANEL: AI LEARNING ASSISTANT */}
        {isAiPanelOpen && (
          <AIAssistantPanel
            courseId={String(course.id)}
            courseTitle={course.title}
            moduleId={String(activeModuleIdx + 1)}
            moduleTitle={syllabus?.[activeModuleIdx]?.title || ''}
            topicId={currentSubtopic?.id || ''}
            topicTitle={currentSubtopic?.title || ''}
            lessonId={currentSubtopic?.id || ''}
            lessonTitle={currentSubtopic?.title || ''}
            lessonType={getLessonType(currentSubtopic?.id || '')}
            lessonContent={currentSubtopic?.content || ''}
            isOpen={isAiPanelOpen}
            onClose={() => setIsAiPanelOpen(false)}
            isDocked={true}
          />
        )}
      </div>

      {isQuizPortalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Sora']">
          <AIQuizPortal
            courseId={String(course.id)}
            courseTitle={course.title}
            lessonId={currentSubtopic?.id || ''}
            lessonTitle={currentSubtopic?.title || 'Current Syllabus Lesson'}
            lessonContent={currentSubtopic?.content || ''}
            onClose={() => setIsQuizPortalOpen(false)}
          />
        </div>
      )}

      {/* GAMIFIED MOTIVATIONAL CELEBRATION MODAL */}
      {celebrationMessage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white border border-sky-300 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl font-['Sora'] relative overflow-hidden text-slate-900">
            <div className="w-16 h-16 rounded-3xl bg-sky-100 border border-sky-300 text-sky-600 mx-auto flex items-center justify-center shadow-md">
              <Flame className="w-8 h-8 fill-current animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold uppercase">
                Subtopic Mastered • +20 XP Claimed!
              </span>
              <h3 className="font-heading font-extrabold text-xl text-slate-900 pt-2 leading-snug">
                {celebrationMessage}
              </h3>
            </div>

            <button
              onClick={advanceNextSubtopic}
              className="w-full py-4 rounded-2xl bg-linear-to-r from-sky-600 via-indigo-600 to-amber-500 hover:from-sky-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Keep Crushing It! Next Subtopic ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ENGLISH LOCKED MODULE POPUP MODAL */}
      {lockedModulePopup && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200 font-['Sora']">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl text-slate-900">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-300 text-rose-600 mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-8 h-8 text-rose-600" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-extrabold uppercase tracking-wider">
                Module Locked 🔒
              </span>
              <h3 className="font-heading font-extrabold text-xl text-slate-900 pt-2 leading-snug">
                Please Complete the Previous Module First!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                You must complete all topics in <strong className="text-sky-700 font-bold">Module 0{lockedModulePopup}</strong> and claim your XP mastery reward before unlocking <strong className="text-rose-600 font-bold">Module 0{lockedModulePopup + 1}</strong>.
              </p>
            </div>

            <button
              onClick={() => setLockedModulePopup(null)}
              className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all"
            >
              Understood! Take Me Back
            </button>
          </div>
        </div>
      )}

      {/* RESOURCES & DOWNLOADS MODAL DRAWER */}
      {isResourcesOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-end p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-sky-200 rounded-3xl w-full max-w-md h-[90vh] flex flex-col justify-between p-6 shadow-2xl font-['Sora'] text-slate-900">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div className="flex items-center gap-2">
                  <FolderDown className="w-5 h-5 text-sky-600" />
                  <h3 className="font-heading font-extrabold text-base text-slate-900">Course Resources & Downloads</h3>
                </div>
                <button onClick={() => setIsResourcesOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-sky-700 uppercase tracking-wider">Downloadable Guides & Cheatsheets</h4>

                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-sky-600 shrink-0" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Linux CLI Cheatsheet PDF</h5>
                      <span className="text-[10px] text-slate-500">PDF • 2.4 MB</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.success('Downloading Linux CLI Cheatsheet PDF...')}
                    className="p-2 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsResourcesOpen(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
            >
              Close Resources Drawer
            </button>
          </div>
        </div>
      )}

      {/* ALL COURSE MODULES MENU DRAWER MODAL */}
      {isModulesMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-sky-100 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl font-['Sora']">
            <div className="p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50/80">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">Course Modules Syllabus Menu</h3>
                  <p className="text-xs text-slate-500 font-medium">Click any unlocked module to navigate directly</p>
                </div>
              </div>
              <button
                onClick={() => setIsModulesMenuOpen(false)}
                className="p-2 rounded-xl bg-white border border-sky-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {syllabus.map((mod, idx) => {
                const isActive = idx === activeModuleIdx;
                const isCompleted = completedModules.includes(idx);
                const isLocked = !canAccessModule(idx);

                return (
                  <div
                    key={mod.id || idx}
                    onClick={() => {
                      if (isLocked) {
                        toast.error(`🔒 Strict Order Lock: Please complete Module 0${idx} in order before unlocking Module 0${idx + 1}!`);
                        return;
                      }
                      setActiveModuleIdx(idx);
                      setCurrentLessonIdx(0);
                      setCurrentSubtopicIdx(0);
                      setIsModulesMenuOpen(false);
                      toast.success(`Switched to Module 0${idx + 1}!`);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20'
                        : isCompleted
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100/60'
                        : isLocked
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                        : 'bg-white border-sky-100 text-slate-800 hover:bg-sky-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isActive ? (
                          <PlayCircle className="w-5 h-5 text-white animate-pulse" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-extrabold text-xs">Module 0{idx + 1}</span>
                          {isCompleted && (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                              ✓ Completed
                            </span>
                          )}
                          {isActive && (
                            <span className="text-[10px] font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md border border-sky-300">
                              Active Learning
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-[10px] font-extrabold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md border border-slate-300">
                              🔒 Locked
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm mt-0.5">{mod.title}</h4>
                        <span className="text-xs text-slate-500 block mt-0.5">{mod.duration} • 5 Lessons</span>

                        {/* Detailed Lesson Index Tree */}
                        <div className="mt-3 pt-3 border-t border-sky-100/60 space-y-1.5 font-mono text-[11px]">
                          {idx === 0 && (
                            <>
                              <div className="flex items-center justify-between text-slate-600">
                                <span>101 • 1.1 Unix & Linux OS Architecture</span>
                                <span>45 mins</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span>102 • 1.2 Shell Architecture & Command Anatomy</span>
                                <span>60 mins</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span>103 • 1.3 Navigating Files & Directories</span>
                                <span>50 mins</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span>104 • 1.4 Creating, Copying, Moving & Deleting</span>
                                <span>60 mins</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span>105 • 1.5 Quiz & Hands-on Terminal Practice</span>
                                <span>30 mins</span>
                              </div>
                            </>
                          )}
                          {idx > 0 && (
                            <span className="text-[10px] text-slate-400 font-sans italic">
                              5 Lessons • Complete preceding modules to view details
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Terminal Execution Modal */}
      {activeTerminalCmd && (
        <InteractiveTerminalModal
          initialCommand={activeTerminalCmd}
          onClose={() => setActiveTerminalCmd(null)}
        />
      )}

      {/* ----------------- PHASE 23: RESOURCE INLINE PREVIEW MODAL ----------------- */}
      {previewingResource && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200 font-['Sora']">
          <div className="bg-white border border-sky-300 rounded-3xl p-6 max-w-4xl w-full flex flex-col gap-4 shadow-2xl relative overflow-hidden text-slate-900 h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
                  {previewingResource.type === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 truncate" title={previewingResource.name}>
                    {previewingResource.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {previewingResource.size || ''} • {previewingResource.badge}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewingResource(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl flex items-center justify-center p-2 relative">
              {previewingResource.type === 'pdf' ? (
                <iframe
                  src={previewingResource.url}
                  className="w-full h-full border-0 rounded-xl bg-white shadow-inner"
                  title={previewingResource.name}
                />
              ) : previewingResource.type === 'image' ? (
                <img
                  src={previewingResource.url}
                  alt={previewingResource.name}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="text-center p-6">
                  <p className="text-xs text-slate-500">Preview not supported for this file type.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
              <button
                onClick={() => setPreviewingResource(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-all"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownloadResource(previewingResource);
                  setPreviewingResource(null);
                }}
                className="py-2.5 px-5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/10 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
