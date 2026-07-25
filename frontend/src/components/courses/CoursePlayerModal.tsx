import React, { useState, useEffect } from 'react';
import type { ICourse } from '../../../../shared/types/course';
import { courseService } from '../../services/courseService';
import { InteractiveTerminalModal } from './InteractiveTerminalModal';
import { MODULE_1_FULL_CURRICULUM } from '../../data/linuxModuleContent';
import { MODULE_2_FULL_CURRICULUM } from '../../data/linuxModule2Content';
import { MODULE_3_FULL_CURRICULUM } from '../../data/linuxModule3Content';
import type { SubtopicDetail } from '../../data/linuxModuleContent';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface CoursePlayerModalProps {
  course: ICourse;
  onClose: () => void;
  onProgressUpdate?: (newProgress: number) => void;
}

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

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({
  course,
  onClose,
  onProgressUpdate,
}) => {
  const syllabus = course.syllabus || [];
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'content' | 'commands' | 'slides' | 'lab'>('content');
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([0]);

  // Sequential Subtopic Stepper State
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [currentSubtopicIdx, setCurrentSubtopicIdx] = useState(0);
  const [completedSubtopics, setCompletedSubtopics] = useState<string[]>(['1.1.1', '2.1.1', '3.1.1']);

  // Modals & Drawers State
  const [activeTerminalCmd, setActiveTerminalCmd] = useState<string | null>(null);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Encouragement & Module Locking Popup Overlays
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [lockedModulePopup, setLockedModulePopup] = useState<number | null>(null);

  // Subtopic Timer State (auto-calculated spend time per subtopic)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [claimedPointsModules, setClaimedPointsModules] = useState<number[]>([]);
  const [userXP, setUserXP] = useState(courseService.getUserXPPoints());

  // Dynamic Curriculum for active Module
  const activeCurriculum =
    activeModuleIdx === 2
      ? MODULE_3_FULL_CURRICULUM
      : activeModuleIdx === 1
      ? MODULE_2_FULL_CURRICULUM
      : MODULE_1_FULL_CURRICULUM;

  // Restore saved checkpoint on mount
  useEffect(() => {
    const saved = courseService.getCourseCheckpoint(course.id);
    if (saved) {
      if (typeof saved.lastModuleIdx === 'number') setActiveModuleIdx(saved.lastModuleIdx);
      if (typeof saved.lastLessonIdx === 'number') setCurrentLessonIdx(saved.lastLessonIdx);
      if (typeof saved.lastSubtopicIdx === 'number') setCurrentSubtopicIdx(saved.lastSubtopicIdx);
      if (saved.completedSubtopics?.length) setCompletedSubtopics(saved.completedSubtopics);
      if (saved.completedModules?.length) setCompletedModules(saved.completedModules);
      toast.info(`📍 Resumed track from Module ${saved.lastModuleIdx + 1}, Lesson ${saved.lastLessonIdx + 1}`);
    }
  }, [course.id]);

  const activeModule = syllabus[activeModuleIdx] || {
    id: `m${activeModuleIdx + 1}`,
    title: `Module 0${activeModuleIdx + 1}: Technical Operations`,
    duration: '8 hrs 00 mins',
    lessonsCount: 6,
  };

  const activeSlide = ARCHITECTURE_SLIDES[currentSlideIdx];
  const progressPercent = Math.round((completedSubtopics.length / 15) * 100);
  const activeCommands = MODULE_COMMAND_TABLES[activeModuleIdx] || MODULE_COMMAND_TABLES[0];

  const currentLesson = activeCurriculum[currentLessonIdx] || activeCurriculum[0];
  const currentSubtopic: SubtopicDetail = currentLesson?.subtopics?.[currentSubtopicIdx] || currentLesson?.subtopics?.[0];

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
        lastUpdated: new Date().toISOString(),
      });
      if (onProgressUpdate) {
        onProgressUpdate(Math.min(100, Math.max(5, progressPercent)));
      }
    }
  }, [course.id, activeModuleIdx, currentLessonIdx, currentSubtopicIdx, completedSubtopics, completedModules, progressPercent, currentLesson, currentSubtopic]);

  // Quick & Fast Spend Timer: Auto-calculated between 5 to 15 seconds based on content length
  const requiredSubtopicSeconds = Math.min(
    15,
    Math.max(5, Math.round((currentSubtopic?.content || '').length / 200))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeModuleIdx, currentLessonIdx, currentSubtopicIdx]);

  useEffect(() => {
    setTimerSeconds(0);
  }, [activeModuleIdx, currentLessonIdx, currentSubtopicIdx]);

  const remainingSeconds = Math.max(0, requiredSubtopicSeconds - timerSeconds);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isSubtopicTimeMet = timerSeconds >= requiredSubtopicSeconds;
  const isSubtopicCompleted = completedSubtopics.includes(currentSubtopic?.id || '');

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
    if (currentSubtopicIdx < currentLesson.subtopics.length - 1) {
      setCurrentSubtopicIdx(currentSubtopicIdx + 1);
      toast.success(`Advancing to Subtopic ${currentLesson.subtopics[currentSubtopicIdx + 1].id}!`);
    } else if (currentLessonIdx < activeCurriculum.length - 1) {
      setCurrentLessonIdx(currentLessonIdx + 1);
      setCurrentSubtopicIdx(0);
      toast.success(`Topic Complete! Moving to ${activeCurriculum[currentLessonIdx + 1].title}!`);
    } else {
      toast.success(`🎉 Module ${activeModuleIdx + 1} Fully Mastered! XP Bonus Granted!`);
    }
  };

  const handlePrevSubtopic = () => {
    if (currentSubtopicIdx > 0) {
      setCurrentSubtopicIdx(currentSubtopicIdx - 1);
    } else if (currentLessonIdx > 0) {
      const prevLsnIdx = currentLessonIdx - 1;
      setCurrentLessonIdx(prevLsnIdx);
      setCurrentSubtopicIdx(activeCurriculum[prevLsnIdx].subtopics.length - 1);
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
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-sky-50 border border-sky-200 lg:hidden text-sky-700 cursor-pointer"
          >
            <MenuIcon className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Exit Classroom</span>
          </button>

          <div className="h-6 w-px bg-sky-200 hidden sm:block" />

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block">
              {course.category} • Progress: {progressPercent}%
            </span>
            <h1 className="font-heading font-extrabold text-xs sm:text-base text-slate-900 truncate max-w-40 sm:max-w-xl">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden relative">
        {/* LEFT SIDEBAR: Mobile Drawer / Desktop Sidebar */}
        <aside className={`lg:col-span-1 border-r p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4 transition-all duration-300 ${
          mobileMenuOpen ? 'fixed inset-y-16 left-0 z-40 w-72 shadow-2xl bg-white' : 'hidden lg:flex'
        } ${isReadingMode ? 'bg-[#f4efe4] border-[#e2d9c8]' : 'bg-sky-50/60 border-sky-100'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-200">
              <h2 className="font-heading font-bold text-xs text-sky-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" /> Syllabus Flow ({syllabus.length})
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">{course.duration}</span>
            </div>

            <div className="space-y-2.5">
              {syllabus.map((mod, idx) => {
                const isActive = idx === activeModuleIdx;
                const isCompleted = completedModules.includes(idx);
                const hasPoints = claimedPointsModules.includes(idx);

                return (
                  <button
                    key={mod.id || idx}
                    onClick={() => {
                      if (idx > 0 && !completedModules.includes(idx - 1)) {
                        setLockedModulePopup(idx);
                        toast.error(`🔒 Please complete Module 0${idx} first before unlocking Module 0${idx + 1}!`);
                        return;
                      }
                      setActiveModuleIdx(idx);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20'
                        : isCompleted
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/60'
                        : 'bg-white border-sky-100 text-slate-700 hover:bg-sky-100/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isActive ? (
                        <PlayCircle className="w-4 h-4 text-white animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-sky-300 text-[10px] font-bold flex items-center justify-center text-sky-600">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold block leading-snug ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          Module 0{idx + 1}
                        </span>
                        {hasPoints && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            +50 XP
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] font-semibold block leading-tight ${isActive ? 'text-sky-100' : 'text-slate-600'}`}>
                        {mod.title.replace(/^(🟢|🟡|🔵|🔴)\s*Module \d+:\s*/, '')}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] font-medium pt-1">
                        <span className={`flex items-center gap-1 ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                          <Clock className="w-3 h-3 text-sky-500" /> {mod.duration}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

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
        </aside>

        {/* RIGHT MAIN CLASSROOM CONTENT VIEWER */}
        <main className={`lg:col-span-3 p-4 sm:p-10 flex flex-col justify-between overflow-y-auto space-y-8 transition-colors ${
          isReadingMode ? 'bg-[#faf6ee]' : 'bg-slate-50'
        }`}>
          <div className="space-y-8 max-w-5xl mx-auto w-full">
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
                    isSubtopicTimeMet
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-sky-200 text-slate-800 shadow-xs'
                  }`}>
                    <Clock className={`w-4 h-4 ${isSubtopicTimeMet ? 'text-emerald-600 animate-pulse' : 'text-sky-600'}`} />
                    <div className="text-xs font-mono">
                      <span className="block text-[10px] font-bold text-slate-500 font-sans uppercase">Focus Timer</span>
                      <span className="font-extrabold text-sm text-slate-900">
                        {formatTime(timerSeconds)} / {formatTime(requiredSubtopicSeconds)}
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
                  onClick={() => setActiveTab('lab')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'lab'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-white border border-sky-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-600" /> Live Lab
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
                      {currentLesson.subtopics.map((sub, sIdx) => {
                        const isCur = sIdx === currentSubtopicIdx;
                        const isDone = completedSubtopics.includes(sub.id);

                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              if (isDone || isCur || sIdx === 0 || completedSubtopics.includes(currentLesson.subtopics[sIdx - 1]?.id)) {
                                setCurrentSubtopicIdx(sIdx);
                              } else {
                                toast.warning(`🔒 Subtopic ${sub.id} is locked! Complete preceding subtopics first.`);
                              }
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                              isCur
                                ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/20'
                                : isDone
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : isCur ? (
                              <PlayCircle className="w-3.5 h-3.5 text-white animate-pulse" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>Subtopic {sub.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Subtopic Card */}
                  <div
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

                      {/* Terminal Icon ONLY for Subtopics with actual Commands */}
                      {currentSubtopic.terminalCommand && (
                        <button
                          onClick={() => setActiveTerminalCmd(currentSubtopic.terminalCommand!)}
                          className="py-2 px-3.5 rounded-xl bg-black border border-slate-800 text-emerald-400 hover:bg-slate-900 transition-all cursor-pointer text-xs font-extrabold flex items-center gap-2 shrink-0 shadow-md"
                        >
                          <Terminal className="w-4 h-4 text-emerald-400" /> Launch Black Terminal Sandbox
                        </button>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal text-slate-800">
                      {currentSubtopic.content}
                    </div>

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
                        onClick={handlePrevSubtopic}
                        disabled={currentLessonIdx === 0 && currentSubtopicIdx === 0}
                        className="py-2.5 px-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 disabled:opacity-40 text-xs font-bold cursor-pointer"
                      >
                        ◄ Previous Subtopic
                      </button>

                      {!isSubtopicTimeMet && !isSubtopicCompleted ? (
                        <button
                          disabled
                          className="py-3 px-6 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs flex items-center gap-2 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>🔒 Spend {remainingSeconds}s to unlock +20 XP</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleCompleteSubtopic}
                          className={`py-3.5 px-7 rounded-2xl text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                            isSubtopicCompleted
                              ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
                              : 'bg-linear-to-r from-sky-600 via-indigo-600 to-amber-500 hover:from-sky-500 hover:to-amber-400 shadow-sky-500/25 animate-bounce'
                          }`}
                        >
                          {!isSubtopicCompleted ? (
                            <>
                              <Gift className="w-4 h-4 text-amber-200" />
                              <span>🎁 Claim +20 XP & Unlock Next Subtopic ➔</span>
                            </>
                          ) : (
                            <>
                              <span>Next Subtopic ➔</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
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
      </div>

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

      {/* Interactive Terminal Execution Modal */}
      {activeTerminalCmd && (
        <InteractiveTerminalModal
          initialCommand={activeTerminalCmd}
          onClose={() => setActiveTerminalCmd(null)}
        />
      )}
    </div>
  );
};
