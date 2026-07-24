import React, { useState, useEffect } from 'react';
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
  Check,
  X,
  FileText,
  FileCode,
  FolderArchive,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useCourses } from '@/contexts/CourseContext';

export const CourseView: React.FC = () => {
  const { courseId } = useParams();
  const { getCourseById } = useCourses();
  const dynamicCourse = getCourseById(courseId || '1');

  const [activeTab, setActiveTab] = useState<'intro' | 'index' | 'terminal' | 'quiz'>('intro');
  const [activeModule, setActiveModule] = useState<number | null>(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([101, 102]);
  
  // Dedicated Learning Player States
  const [activePlayerUnit, setActivePlayerUnit] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState('Not Submitted');

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

  // Auto-complete progress metrics
  const completedCount = flatLessons.filter(l => completedUnitIds[String(l.id)]).length;
  const totalCount = flatLessons.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Render player layout if a unit is active
  if (activePlayerUnit) {
    const isCompleted = !!completedUnitIds[String(activePlayerUnit.id)];
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-['Sora'] text-slate-900">
        
        {/* Player Header Banner */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shrink-0 shadow-3xs select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePlayerUnit(null)}
              className="p-2 rounded-xl hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Syllabus</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-bold block uppercase tracking-wider max-w-fit">
                {dynamicCourse?.category || 'Development'}
              </span>
              <h2 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 truncate max-w-md mt-0.5">
                {dynamicCourse?.title || courseData.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Meter */}
            <div className="text-right space-y-0.5 hidden sm:block">
              <span className="text-[10px] font-bold text-slate-450 uppercase block">Course Completion</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
                </div>
                <span className="text-xs font-extrabold text-slate-800 font-mono">{completionPercentage}%</span>
              </div>
            </div>
          </div>
        </header>

        {/* Player Workspace Grid */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR: Index tree */}
          <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden lg:flex">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 block">Curriculum Syllabus</h3>
              <span className="text-[11px] text-slate-500 font-medium block mt-1">
                {completedCount} of {totalCount} lessons completed
              </span>
            </div>

            {/* Modules Accordion list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {dynamicCourse?.modules?.map((m: any, mIdx: number) => {
                return (
                  <div key={m.id} className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/30">
                    <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 leading-normal">
                          M{mIdx + 1}: {m.title.replace(/^Module \d+:\s*/, '')}
                        </h4>
                        <span className="text-[9px] font-bold text-slate-450 block font-mono">{m.duration || '4 hours'}</span>
                      </div>
                    </div>

                    <div className="p-2 space-y-1 bg-white">
                      {m.topics?.map((t: any) => (
                        <div key={t.id} className="space-y-1 pt-1">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-2 block mb-1">
                            {t.title}
                          </span>
                          {t.learningUnits?.map((unit: any) => {
                            const isUnitDone = !!completedUnitIds[String(unit.id)];
                            const isUnitActive = activePlayerUnit.id === unit.id;
                            
                            return (
                              <button
                                key={unit.id}
                                onClick={() => setActivePlayerUnit(unit)}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                                  isUnitActive
                                    ? 'bg-sky-50 border-sky-300 text-sky-850 font-bold ring-2 ring-sky-300/10'
                                    : 'bg-white border-transparent text-slate-650 hover:bg-slate-50'
                                }`}
                              >
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleUnitComplete(unit.id);
                                  }}
                                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                                    isUnitDone 
                                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                                      : 'border-slate-300 hover:border-sky-500 bg-white'
                                  }`}
                                >
                                  {isUnitDone && <Check className="w-3 h-3 stroke-[3]" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <span className="block truncate">{unit.title}</span>
                                  <span className="text-[9px] text-slate-400 font-semibold block font-mono mt-0.5 uppercase">
                                    {unit.type} • {unit.duration || '15 mins'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* MAIN PLAYER PANEL CONTENT CONTAINER */}
          <main className="flex-1 flex flex-col overflow-hidden bg-white">
            
            {/* Scrollable body content */}
            <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-6">
              
              {/* Header Titles */}
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wider font-mono ${
                    activePlayerUnit.type === 'Quiz'
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : activePlayerUnit.type === 'Assignment'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-sky-50 border-sky-200 text-sky-700'
                  }`}>
                    {activePlayerUnit.type}
                  </span>
                  {activePlayerUnit.duration && (
                    <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activePlayerUnit.duration} Est</span>
                    </span>
                  )}
                </div>

                <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 leading-tight">
                  {activePlayerUnit.title}
                </h1>
              </div>

              {/* Viewer panels depending on unit type */}
              <div className="space-y-4">
                
                {/* 1. Video Lesson Viewer */}
                {activePlayerUnit.type === 'Video' && (
                  <div className="space-y-6">
                    {activePlayerUnit.videoUrl ? (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-md">
                        <iframe
                          src={getEmbedUrl(activePlayerUnit.videoUrl)}
                          title={activePlayerUnit.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 text-center space-y-1 font-medium">
                        <Play className="w-8 h-8 text-slate-400 mx-auto" />
                        <h4 className="text-xs text-slate-700">No YouTube URL defined for this video unit.</h4>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h3 className="font-heading font-bold text-sm text-slate-900">Lesson Description</h3>
                      <p className="text-xs sm:text-sm text-slate-650 font-medium leading-relaxed">
                        {activePlayerUnit.description || 'Watch the lecture video completely to unlock next topic milestones.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Reading Lesson Viewer */}
                {activePlayerUnit.type === 'Reading' && (
                  <div className="space-y-5 max-w-4xl">
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Document Reader Mode</span>
                      <span className="text-[10px] font-bold text-sky-700 bg-white border px-2 py-0.5 rounded font-mono">
                        {getEstimatedReadingTime(activePlayerUnit.readingMarkdown || '')}
                      </span>
                    </div>

                    <div 
                      className="text-xs sm:text-sm leading-relaxed text-slate-700 prose prose-slate max-w-none font-medium prose-p:my-2 prose-li:my-1"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(activePlayerUnit.readingMarkdown || '### Syllabus Reading Content\nDetailed documentation will load here.') }}
                    />
                  </div>
                )}

                {/* 3. Quiz Simulator Viewer */}
                {activePlayerUnit.type === 'Quiz' && (
                  <div className="space-y-6 max-w-3xl">
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-200/80 space-y-2">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest">Interactive Practice Quiz</h4>
                      <p className="text-[10px] text-amber-800 leading-normal font-medium">
                        Passing criteria: score at least <strong className="font-bold">{activePlayerUnit.quizPassingScore || 70}%</strong>.
                      </p>
                    </div>

                    {!activePlayerUnit.quizQuestions || activePlayerUnit.quizQuestions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No quiz questions configured for this block.</p>
                    ) : (
                      <div className="space-y-6">
                        {activePlayerUnit.quizQuestions.map((q: any, idx: number) => {
                          const selectedIdx = quizAnswers[q.id];
                          return (
                            <div key={q.id} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-3">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                {idx + 1}. {q.questionText}
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                                {q.options?.map((opt: string, oIdx: number) => {
                                  const isSelected = selectedIdx === oIdx;
                                  const isCorrect = q.correctAnswerIndex === oIdx;
                                  
                                  let btnClass = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                                  if (quizSubmitted) {
                                    if (isCorrect) {
                                      btnClass = 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold';
                                    } else if (isSelected) {
                                      btnClass = 'border-rose-300 bg-rose-50 text-rose-950 font-bold';
                                    } else {
                                      btnClass = 'border-slate-100 bg-slate-50 text-slate-400';
                                    }
                                  } else if (isSelected) {
                                    btnClass = 'border-sky-500 bg-sky-50 text-sky-800 font-bold';
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={quizSubmitted}
                                      onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                                    >
                                      <span>{opt}</span>
                                      {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                      {quizSubmitted && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {quizSubmitted && q.explanation && (
                                <p className="text-[10px] text-slate-500 leading-normal font-medium bg-white p-2.5 rounded-xl border border-slate-100 mt-2">
                                  <strong className="text-slate-700 font-bold">Explanation:</strong> {q.explanation}
                                </p>
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
                              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                                isPassed ? 'bg-emerald-50 border-emerald-250 text-emerald-800' : 'bg-rose-50 border-rose-250 text-rose-800'
                              }`}>
                                <div className="space-y-0.5">
                                  <span className="text-xs font-extrabold block">{isPassed ? 'Passed! (Competency Score Saved)' : 'Try Again'}</span>
                                  <span className="text-[10px] font-semibold font-mono">
                                    Scored: {scoredMarks} / {totalQuizMarks} marks ({percentage}%)
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setQuizSubmitted(false);
                                    setQuizAnswers({});
                                  }}
                                  className="btn-blue-primary text-[10px] py-1.5 px-3 font-bold cursor-pointer"
                                >
                                  Retry Quiz
                                </button>
                              </div>
                            );
                          })()
                        ) : (
                          <button
                            onClick={() => {
                              setQuizSubmitted(true);
                              
                              // Save quiz score to localStorage
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
                            }}
                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
                          >
                            Submit Answers
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Assignment Viewer */}
                {activePlayerUnit.type === 'Assignment' && (
                  <div className="space-y-6 max-w-3xl">
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-200/60 space-y-3 font-medium">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest block">Project Assignment Details</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                          assignmentStatus === 'Submitted'
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          STATUS: {assignmentStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Submit assignments within deadlines to ensure academic board eligibility credits.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-heading font-bold text-xs text-slate-450 uppercase tracking-wider">Instructions</h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {activePlayerUnit.assignmentInstructions || 'Complete lab exercises and submit build logs / code repositories.'}
                      </p>
                    </div>

                    {/* Meta values */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4 font-mono text-xs font-bold text-slate-700">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans mb-0.5">Maximum Points</span>
                        <span className="text-slate-800 font-extrabold text-sm">{activePlayerUnit.assignmentMaxMarks || 100} Marks</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans mb-0.5">Deadline Schedule</span>
                        <span className="text-slate-850 truncate block max-w-full">{activePlayerUnit.assignmentDeadline || '7 Days'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans mb-0.5">Accepted Formats</span>
                        <span className="text-sky-700">{activePlayerUnit.assignmentAllowedTypes || 'PDF, ZIP, TXT'}</span>
                      </div>
                    </div>

                    {/* Rubric Breakdown */}
                    {activePlayerUnit.assignmentRubric && (
                      <div className="space-y-2 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Grading Rubric Criteria</span>
                        <p className="text-xs text-slate-650 font-medium leading-relaxed">{activePlayerUnit.assignmentRubric}</p>
                      </div>
                    )}

                    {/* Simulate Submissions */}
                    <div className="pt-2">
                      {assignmentStatus === 'Submitted' ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl space-y-1">
                          <span className="text-xs font-extrabold text-emerald-800 block">Simulation Submitted Successfully!</span>
                          <p className="text-[10px] text-emerald-700 font-medium">Under active grading. Feedback will log here.</p>
                          <button
                            onClick={() => setAssignmentStatus('Not Submitted')}
                            className="text-[10px] text-rose-600 underline font-bold mt-1 block cursor-pointer"
                          >
                            Cancel Submission
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              setAssignmentStatus('Submitted');
                              toast.success('Assignment submission simulation logged!');
                            }}
                            className="btn-blue-primary w-full py-3 text-xs font-bold shadow-md cursor-pointer justify-center"
                          >
                            Simulate File Submission
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* PLAYER FOOTER CONTROLS NAVIGATION BAR */}
            <footer className="border-t border-slate-200/80 p-4 sm:p-5 bg-slate-50/80 flex items-center justify-between shrink-0 select-none">
              <button
                disabled={!prevUnit}
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                  setActivePlayerUnit(prevUnit);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-slate-50/80 cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Lesson</span>
              </button>

              <button
                onClick={() => toggleUnitComplete(activePlayerUnit.id)}
                className={`py-2.5 px-6 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Play className="w-4 h-4 fill-current text-white/90" />}
                <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
              </button>

              <button
                disabled={!nextUnit}
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                  setActivePlayerUnit(nextUnit);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-slate-50/80 cursor-pointer flex items-center gap-1"
              >
                <span>Next Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </footer>
          </main>

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
