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
  Check,
  X,
  FileText,
  FileCode,
  ArrowRight,
  Menu,
  Info,
  Volume2,
  VolumeX,
  RotateCcw,
  File,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useCourses } from '@/contexts/CourseContext';

export const CourseView: React.FC = () => {
  const { courseId } = useParams();
  const { getCourseById } = useCourses();
  const dynamicCourse = getCourseById(courseId || '1');

  const [activeTab, setActiveTab] = useState<'intro' | 'index' | 'terminal' | 'quiz'>('intro');
  const [activeModule, setActiveModule] = useState<number | null>(1);
  
  // Dedicated Learning Player States
  const [activePlayerUnit, setActivePlayerUnit] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState('Not Submitted');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  // Custom video playback simulation
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [videoVolume, setVideoVolume] = useState(80);
  const [videoMuted, setVideoMuted] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string; type: string }>>([]);

  // Terminal Simulator State
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; output: string }>>([
    { cmd: 'uname -a', output: 'Linux shaivika-ai-kernel 6.8.0-generic x86_64 GNU/Linux' },
    { cmd: 'whoami', output: 'student@shaivika-lms' },
  ]);

  // Load completed unit IDs from localStorage
  const [completedUnitIds, setCompletedUnitIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`lms_completed_units_${courseId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem(`lms_completed_units_${courseId}`, JSON.stringify(completedUnitIds));
  }, [completedUnitIds, courseId]);

  // Fallback seed data if the course is not loaded dynamically
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
    } else if (cmdLower === 'whoami') {
      output = 'student@shaivika-lms';
    } else {
      output = `bash: ${cleanCmd}: command simulated successfully.`;
    }

    setTerminalHistory((prev) => [...prev, { cmd: cleanCmd, output }]);
    setActiveTab('terminal');
    toast.success(`Executed "${cleanCmd}" in CLI Terminal Lab!`);
  };

  const handleTerminalExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const command = terminalInput.trim();
    if (!command) return;
    executeCommandInTerminal(command);
    setTerminalInput('');
  };

  // Parse YouTube URL to embed friendly link
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const ytIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return ytIdMatch ? `https://www.youtube.com/embed/${ytIdMatch[1]}` : url;
  };

  // Markdown parsing utility
  const parseMarkdown = (markdown: string): string => {
    if (!markdown) return '';
    let html = markdown;

    // 1. Syntax highlighted code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 my-4 shadow-inner"><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });

    // 2. Tables
    html = html.replace(/((?:\|[^\n]+\|\r?\n?)+)/g, (tableText) => {
      const lines = tableText.trim().split('\n');
      if (lines.length < 2) return tableText;
      const rows = lines.map(line => line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1));
      const headerCells = rows[0].map(c => `<th class="border border-slate-200 bg-slate-50/50 p-2 text-left text-[11px] font-bold text-slate-700">${c}</th>`).join('');
      const dataRows = rows.slice(1).filter(r => !r.every(c => c.startsWith('-')));
      const bodyRows = dataRows.map(r => {
        const tdCells = r.map(c => `<td class="border border-slate-200 p-2 text-[11px] font-medium text-slate-600">${c}</td>`).join('');
        return `<tr class="hover:bg-slate-50/50 transition-colors">${tdCells}</tr>`;
      }).join('');
      return `<div class="overflow-x-auto my-4 border border-slate-200 rounded-xl"><table class="w-full border-collapse bg-white"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
    });

    // 3. Bullet lists
    html = html.replace(/^(?:-|\*)\s+(.*?)$/gm, '<li class="ml-4 list-disc text-slate-600 font-medium pl-1.5 my-1">$1</li>');

    // 4. Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

    // 5. Paragraphs
    html = html.replace(/^(?!<h|<li|<tr|<td|<th|<pre|<\/?table|<\/?thead|<\/?tbody|<\/?tr)(.+)$/gm, '<p class="my-3 text-slate-600 font-medium leading-relaxed">$1</p>');

    return html;
  };

  const getEstimatedReadingTime = (text: string): string => {
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).length;
    const time = Math.max(1, Math.round(words / 200));
    return `${time} min read`;
  };

  // Flattened list of syllabus units for player sidebar & footer navigation
  const getFlatLessons = () => {
    const list: any[] = [];
    if (!dynamicCourse) {
      // Return hardcoded placeholders for standard Linux course
      return [
        { id: 101, title: '1.1 Introduction to Linux Architecture', duration: '45 mins', type: 'Video', videoUrl: 'https://www.youtube.com/watch?v=V1y-mcPM3Kw', description: 'Detailed Unix core concepts.' },
        { id: 102, title: '1.2 Understanding Shell Commands', duration: '60 mins', type: 'Reading', readingMarkdown: '### Command Anatomy\nEvery command runs with parameters.' },
        { id: 103, title: '1.3 Navigating Files & Permissions', duration: '50 mins', type: 'Quiz', quizQuestions: courseData.quizQuestions },
        { id: 104, title: '1.4 Final Capstone Lab', duration: '90 mins', type: 'Assignment', assignmentInstructions: 'Configure firewall shields and upload files.', assignmentMaxMarks: 100 }
      ];
    }

    if (dynamicCourse.modules) {
      dynamicCourse.modules.forEach((m: any) => {
        if (m.topics) {
          m.topics.forEach((t: any) => {
            t.learningUnits.forEach((u: any) => {
              list.push({
                ...u,
                moduleId: m.id,
                moduleTitle: m.title,
                topicId: t.id,
                topicTitle: t.title
              });
            });
          });
        }
      });
    }
    return list;
  };

  const flatLessons = getFlatLessons();
  const currentUnitIndex = activePlayerUnit ? flatLessons.findIndex(item => item.id === activePlayerUnit.id) : -1;
  const prevUnit = currentUnitIndex > 0 ? flatLessons[currentUnitIndex - 1] : null;
  const nextUnit = currentUnitIndex !== -1 && currentUnitIndex < flatLessons.length - 1 ? flatLessons[currentUnitIndex + 1] : null;

  // Toggle completion
  const toggleUnitComplete = (unitId: string | number) => {
    const key = String(unitId);
    setCompletedUnitIds((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(next[key] ? 'Lesson marked complete!' : 'Lesson marked incomplete.');
      return next;
    });
  };

  // Auto-expand module when lesson changes
  useEffect(() => {
    if (activePlayerUnit?.moduleId) {
      setExpandedModules(prev => ({
        ...prev,
        [String(activePlayerUnit.moduleId)]: true
      }));
    } else if (activePlayerUnit && !activePlayerUnit.moduleId) {
      // Mock lesson modules expand
      setExpandedModules(prev => ({
        ...prev,
        'mod-mock-1': true
      }));
    }
    // Reset transient player states
    setVideoPlaying(false);
    setVideoProgress(0);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setAttachedFiles([]);
    if (activePlayerUnit?.assignmentSubmissionStatus === 'Submitted') {
      setAssignmentStatus('Submitted');
    } else {
      setAssignmentStatus('Not Submitted');
    }
  }, [activePlayerUnit]);

  // Simulated video playback timer tick
  useEffect(() => {
    let interval: any;
    if (videoPlaying && activePlayerUnit?.type === 'Video') {
      interval = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setVideoPlaying(false);
            toast.success("Lesson video completed!");
            toggleUnitComplete(activePlayerUnit.id);
            return 100;
          }
          return prev + (1 * videoSpeed);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [videoPlaying, activePlayerUnit, videoSpeed]);

  // Auto-complete progress metrics
  const completedCount = flatLessons.filter(l => completedUnitIds[String(l.id)]).length;
  const totalCount = flatLessons.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;  // Render player layout if a unit is active
  if (activePlayerUnit) {
    const isCompleted = !!completedUnitIds[String(activePlayerUnit.id)];

    const modulesToRender: any[] = dynamicCourse?.modules || [
      {
        id: 'mod-mock-1',
        title: 'Module 1: Linux Essentials Preview',
        description: 'Module 1 Linux fundamentals description.',
        duration: '4 hours',
        topics: [
          {
            id: 'topic-mock-1',
            title: 'Getting Started',
            description: 'Topic description for Linux core details.',
            estimatedDuration: '45 mins',
            learningUnits: [
              { id: '101', title: '1.1 Introduction to Linux Architecture', duration: '45 mins', type: 'Video', videoUrl: 'https://www.youtube.com/watch?v=V1y-mcPM3Kw', description: 'Detailed Unix core concepts.' },
              { id: '102', title: '1.2 Understanding Shell Commands', duration: '60 mins', type: 'Reading', readingContent: '### Command Anatomy\nEvery command runs with parameters.', description: 'Brief guide to command anatomy.' },
              { id: '103', title: '1.3 Navigating Files & Permissions', duration: '50 mins', type: 'Quiz', quizQuestions: courseData.quizQuestions, description: 'Practice quiz on permissions.' },
              { id: '104', title: '1.4 Final Capstone Lab', duration: '90 mins', type: 'Assignment', assignmentInstructions: 'Configure firewall shields and upload files.', assignmentMaxMarks: 100, description: 'Simulate final lab configuration.' }
            ]
          }
        ]
      }
    ];

    const remainingUnits = flatLessons.filter(l => !completedUnitIds[String(l.id)]);
    const totalRemainingMinutes = remainingUnits.reduce((acc, unit) => {
      const durationStr = unit.duration || '15 mins';
      const num = parseInt(durationStr.replace(/[^\d]/g, ''), 10);
      if (isNaN(num)) return acc + 15;
      if (durationStr.toLowerCase().includes('hour') || durationStr.toLowerCase().includes('hr')) {
        return acc + (num * 60);
      }
      return acc + num;
    }, 0);

    const formatMinutes = (totalMinutes: number) => {
      if (totalMinutes === 0) return '0 mins';
      const hrs = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (hrs > 0) {
        return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ${mins > 0 ? `${mins} mins` : ''}`;
      }
      return `${mins} mins`;
    };

    const remainingDurationStr = formatMinutes(totalRemainingMinutes);

    const activeModuleItem = modulesToRender.find(m => 
      m.id === activePlayerUnit?.moduleId || 
      m.topics?.some((t: any) => t.learningUnits?.some((u: any) => u.id === activePlayerUnit?.id))
    );
    const activeTopicItem = activeModuleItem?.topics?.find((t: any) => 
      t.id === activePlayerUnit?.topicId || 
      t.learningUnits?.some((u: any) => u.id === activePlayerUnit?.id)
    );

    const activeResources = [
      ...(activePlayerUnit.assignmentReferenceFiles ? activePlayerUnit.assignmentReferenceFiles.split(',').map((f: string, i: number) => ({ id: `res-user-${i}`, name: f.trim(), size: '1.2 MB' })) : [])
    ];
    if (activePlayerUnit.type === 'Video') {
      activeResources.push({ id: 'res-vid-1', name: `lecture_slides_${activePlayerUnit.id}.pdf`, size: '2.4 MB' });
      activeResources.push({ id: 'res-vid-2', name: 'transcript_and_notes.txt', size: '45 KB' });
    } else if (activePlayerUnit.type === 'Reading') {
      activeResources.push({ id: 'res-read-1', name: 'quick_reference_cheatsheet.pdf', size: '920 KB' });
      activeResources.push({ id: 'res-read-2', name: 'recommended_external_resources.md', size: '12 KB' });
    } else if (activePlayerUnit.type === 'Quiz') {
      activeResources.push({ id: 'res-quiz-1', name: 'key_concepts_study_guide.pdf', size: '1.8 MB' });
    } else if (activePlayerUnit.type === 'Assignment') {
      activeResources.push({ id: 'res-assign-1', name: 'rubric_checklist.pdf', size: '340 KB' });
    }

    const expandAllModules = () => {
      const next: Record<string, boolean> = {};
      modulesToRender.forEach(m => {
        next[String(m.id)] = true;
      });
      setExpandedModules(next);
      toast.success("All modules expanded");
    };

    const collapseAllModules = () => {
      setExpandedModules({});
      toast.success("All modules collapsed");
    };

    // Video simulator details
    const totalSeconds = 360;
    const elapsedSeconds = Math.round((videoProgress / 100) * totalSeconds);
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const triggerResourceDownload = (name: string) => {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1200)),
        {
          loading: `Preparing ${name} for download...`,
          success: `${name} downloaded successfully!`,
          error: 'Failed to download resource.'
        }
      );
    };

    const handleFileUploadSimulation = () => {
      const mockFiles = [
        { name: 'solution_draft_v1.zip', size: '3.8 MB', type: 'zip' },
        { name: 'linux_terminal_logs.txt', size: '14 KB', type: 'txt' }
      ];
      const nextFile = attachedFiles.length === 0 ? mockFiles[0] : mockFiles[1];
      if (attachedFiles.some(f => f.name === nextFile.name)) {
        toast.info("File is already attached!");
        return;
      }
      setAttachedFiles([...attachedFiles, nextFile]);
      toast.success(`Attached file: ${nextFile.name}`);
    };

    return (
      <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col font-['Sora'] text-slate-900 overflow-hidden select-none animate-fade-in">
        
        {/* Sticky Header */}
        <header className="sticky top-0 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-2xs select-none">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setActivePlayerUnit(null)}
              className="p-2 md:px-3 md:py-2 rounded-xl hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
              title="Exit Learning Player"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Exit Player</span>
            </button>
            <div className="h-6 w-px bg-slate-200 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-bold uppercase tracking-wider block max-w-fit truncate">
                {dynamicCourse?.category || courseData.category}
              </span>
              <h2 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 truncate max-w-xs sm:max-w-md md:max-w-lg mt-0.5">
                {dynamicCourse?.title || courseData.title}
              </h2>
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
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                leftSidebarOpen 
                  ? 'bg-sky-50 border-sky-300 text-sky-750' 
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title="Toggle Curriculum Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                rightSidebarOpen 
                  ? 'bg-sky-50 border-sky-300 text-sky-750' 
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title="Toggle Progress Sidebar"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Player Workspace Grid */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Mobile sidebar overlay when either sidebar is open */}
          <div className={`fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ${
            (leftSidebarOpen || rightSidebarOpen) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`} onClick={() => { setLeftSidebarOpen(false); setRightSidebarOpen(false); }} />

          {/* LEFT SIDEBAR: Syllabus Tree */}
          <aside className={`fixed lg:static top-16 bottom-0 left-0 z-50 lg:z-10 w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
            leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden lg:translate-x-0'
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
                                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                                      isUnitActive
                                        ? 'bg-sky-50 border-sky-300 text-sky-850 font-bold ring-2 ring-sky-300/10'
                                        : 'bg-white border-transparent text-slate-650 hover:bg-slate-55'
                                    }`}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleUnitComplete(unit.id);
                                      }}
                                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                                        isUnitDone 
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
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider font-mono ${
                    activePlayerUnit.type === 'Quiz'
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
                              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                isPassed ? 'bg-emerald-50 border-emerald-250 text-emerald-850' : 'bg-rose-50 border-rose-250 text-rose-850'
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
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            assignmentStatus === 'Submitted'
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
                className={`py-2.5 px-6 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  isCompleted
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
          <aside className={`fixed lg:static top-16 bottom-0 right-0 z-50 lg:z-10 w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
            rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:hidden lg:translate-x-0'
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

              {/* resources */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 block pl-1">Lesson Resources</span>
                
                {activeResources.length === 0 ? (
                  <p className="text-xs text-slate-450 italic pl-1">No reference files available for this lesson.</p>
                ) : (
                  <div className="space-y-2">
                    {activeResources.map((res: any) => {
                      return (
                        <div 
                          key={res.id} 
                          onClick={() => triggerResourceDownload(res.name)}
                          className="p-3 bg-white hover:bg-sky-50/20 border border-slate-150 hover:border-sky-350 rounded-xl transition-all flex items-center justify-between cursor-pointer group shadow-3xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <FileCode className="w-4 h-4 text-slate-450 group-hover:text-sky-600 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-700 block truncate group-hover:text-slate-900">{res.name}</span>
                              <span className="text-[9px] text-slate-450 font-medium font-mono">{res.size}</span>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-slate-450 group-hover:text-sky-600 shrink-0 transform group-hover:translate-y-0.5 transition-all" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </aside>

        </div>
      </div>
    );
  }

  // Fallback to introducing layout if no learning unit is playing
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
          <span>Syllabus Curriculum</span>
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
                  <span className="text-slate-500">Duration</span>
                  <span className="font-bold text-slate-900">{dynamicCourse?.duration || '10 hours'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-sky-100">
                  <span className="text-slate-500">Modules</span>
                  <span className="font-bold text-slate-900">{dynamicCourse?.modules?.length || 2} Modules</span>
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
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 font-mono">
              {completedCount} / {totalCount} Completed
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
                    <div className="p-4 border-t border-sky-100 space-y-4 bg-slate-50">
                      {mod.topics?.map((topic: any) => (
                        <div key={topic.id} className="space-y-2">
                          <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block pl-1">
                            {topic.title}
                          </h4>
                          <div className="space-y-2">
                            {topic.learningUnits?.map((unit: any) => {
                              const isDone = !!completedUnitIds[String(unit.id)];
                              return (
                                <div
                                  key={unit.id}
                                  onClick={() => setActivePlayerUnit(unit)}
                                  className="p-3.5 rounded-2xl border border-sky-100 hover:border-sky-350 bg-white hover:shadow-xs cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                                      isDone 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                        : 'bg-slate-50 border-slate-200 text-slate-400'
                                    }`}>
                                      {isDone ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Play className="w-4 h-4 fill-current text-slate-400" />}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-bold text-slate-800 block truncate">{unit.title}</span>
                                      <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wide font-mono block mt-0.5">
                                        {unit.type} • {unit.duration || '15 mins'}
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
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
