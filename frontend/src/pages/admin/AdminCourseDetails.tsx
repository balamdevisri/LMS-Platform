import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Users,
  Star,
  Clock,
  Layers,
  Settings,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  X,
  CheckCircle2,
  Play,
  HelpCircle,
  FileText,
  Eye,
  EyeOff,
  Sparkles,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { AssignmentPortal } from '@/components/courses/AssignmentPortal';
import {
  useCourses,
  type ModuleItem,
  type TopicItem,
  type LearningUnitItem,
  type LearningUnitType,
  type QuizQuestion
} from '@/contexts/CourseContext';
import { gitCourseModules } from '@/data/gitCourseFullData';

export const AdminCourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { getCourseById, toggleCourseStatus, updateCourse } = useCourses();

  const course = getCourseById(courseId || '');

  // Local Modules State (synced from Context)
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Track expanded Topic IDs
  const [expandedTopicIds, setExpandedTopicIds] = useState<Record<string, boolean>>({});

  // Add Module Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDuration, setNewDuration] = useState('8 hours');

  // Edit Module Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');

  // Add Topic Modal State
  const [addTopicModalOpen, setAddTopicModalOpen] = useState(false);
  const [activeModuleIdForTopic, setActiveModuleIdForTopic] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [newTopicEstimatedDuration, setNewTopicEstimatedDuration] = useState('45 mins');

  // Edit Topic Modal State
  const [editTopicModalOpen, setEditTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicItem | null>(null);
  const [editTopicTitle, setEditTopicTitle] = useState('');
  const [editTopicDescription, setEditTopicDescription] = useState('');
  const [editTopicEstimatedDuration, setEditTopicEstimatedDuration] = useState('');

  // Add Learning Unit Modal State
  const [addUnitModalOpen, setAddUnitModalOpen] = useState(false);
  const [activeModuleIdForUnit, setActiveModuleIdForUnit] = useState<string | null>(null);
  const [activeTopicIdForUnit, setActiveTopicIdForUnit] = useState<string | null>(null);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitDescription, setNewUnitDescription] = useState('');
  const [newUnitDuration, setNewUnitDuration] = useState('15 mins');
  const [newUnitType, setNewUnitType] = useState<LearningUnitType>('Video');

  // Side Drawer Unit Editor State (replaces unit edit modals)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeUnit, setActiveUnit] = useState<LearningUnitItem | null>(null);
  const [drawerModuleId, setDrawerModuleId] = useState<string | null>(null);
  const [drawerTopicId, setDrawerTopicId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'grading'>('edit');
  const [selectedGradingAssignmentId, setSelectedGradingAssignmentId] = useState<string>('1.1.3');

  // Extract all assignments in this course dynamically
  const courseAssignments = React.useMemo(() => {
    const list: Array<{ id: string; title: string }> = [];
    // Always include Linux assignment 1.1.3 for testing
    list.push({ id: '1.1.3', title: '1.3 Practical Core Assignment: concentric Linux layers' });
    
    course?.modules?.forEach((m) => {
      m.topics?.forEach((t) => {
        t.learningUnits?.forEach((u) => {
          if (u.type === 'Assignment') {
            list.push({ id: String(u.id), title: u.title });
          }
        });
      });
    });

    const seen = new Set<string>();
    return list.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [course]);

  // Student Preview Mode Toggle
  const [isStudentPreviewMode, setIsStudentPreviewMode] = useState(false);

  // Completed Lesson Tracking state
  const [completedUnitIds, setCompletedUnitIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`lms_completed_units_${courseId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist completedUnitIds to localStorage
  useEffect(() => {
    localStorage.setItem(`lms_completed_units_${courseId}`, JSON.stringify(completedUnitIds));
  }, [completedUnitIds, courseId]);

  // Certificate Generation Modals and States
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certStudentName, setCertStudentName] = useState('Shaivika Scholar');
  const [certUniqueId, setCertUniqueId] = useState('');
  const [certCompletionDate, setCertCompletionDate] = useState('');

  // Quiz Simulation & Timer State inside Preview Tab
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number>(0);
  const [quizTimerActive, setQuizTimerActive] = useState<boolean>(false);

  // Drag and Drop State for Modules
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);

  // Drag and Drop State for Topics
  const [draggedTopic, setDraggedTopic] = useState<{ moduleId: string; index: number } | null>(null);

  // Drag and Drop State for Learning Units
  const [draggedUnit, setDraggedUnit] = useState<{ moduleId: string; topicId: string; index: number } | null>(null);

  // Sync state with Course Context
  useEffect(() => {
    const isGit = course && (
      String(course.id) === 'git-github-mastery' ||
      String(course.id) === 'git-github-mastery-course-id' ||
      (course.title || '').toLowerCase().includes('git')
    );
    if (course?.modules && course.modules.length > 0) {
      setModules(course.modules);
    } else if (isGit) {
      setModules(gitCourseModules);
    } else {
      setModules(course?.modules || []);
    }
  }, [course]);

  if (!course) {
    return (
      <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12 text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-500 mb-4 shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900">Course Track Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 font-medium">
          The requested course track does not exist or may have been deleted.
        </p>
        <div className="pt-6">
          <Link
            to="/admin/courses"
            className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Course Tracks</span>
          </Link>
        </div>
      </div>
    );
  }

  // Helper to parse duration string (e.g. "15 mins", "2 hours") to decimal hours
  const parseDurationToHours = (durationStr: string): number => {
    if (!durationStr) return 0;
    const clean = durationStr.toLowerCase().trim();
    const numMatch = clean.match(/([\d.]+)/);
    if (!numMatch) return 0;
    
    const val = parseFloat(numMatch[1]);
    if (clean.includes('min')) {
      return val / 60;
    }
    return val;
  };

  // ================= CALCULATE PROGRESS ANALYTICS =================
  const totalModules = modules.length;
  let totalTopics = 0;
  let totalVideos = 0;
  let totalReadings = 0;
  let totalQuizzes = 0;
  let totalAssignments = 0;
  let totalLearningHours = 0;
  let populatedUnitsCount = 0;
  let totalUnitsCount = 0;

  // Student progress trackers
  let completedVideosCount = 0;
  let completedReadingsCount = 0;
  let completedQuizzesCount = 0;
  let completedAssignmentsCount = 0;
  let completedLearningHours = 0;
  let completedUnitsCount = 0;

  modules.forEach((m) => {
    totalTopics += m.topics.length;
    m.topics.forEach((t) => {
      totalUnitsCount += t.learningUnits.length;
      t.learningUnits.forEach((u) => {
        // Increment asset breakdown
        if (u.type === 'Video') totalVideos++;
        else if (u.type === 'Reading') totalReadings++;
        else if (u.type === 'Quiz') totalQuizzes++;
        else if (u.type === 'Assignment') totalAssignments++;

        // Add duration contribution
        const durationHours = parseDurationToHours(u.duration);
        totalLearningHours += durationHours;

        // Check if content resources are successfully populated (Auditing Completeness)
        if (u.type === 'Video' && u.videoUrl) populatedUnitsCount++;
        else if (u.type === 'Reading' && u.readingContent) populatedUnitsCount++;
        else if (u.type === 'Quiz' && u.quizQuestions && u.quizQuestions.length > 0) populatedUnitsCount++;
        else if (u.type === 'Assignment' && u.assignmentInstructions) populatedUnitsCount++;

        // Student progress checking
        const isCompleted = !!completedUnitIds[u.id];
        if (isCompleted) {
          completedUnitsCount++;
          completedLearningHours += durationHours;
          if (u.type === 'Video') completedVideosCount++;
          else if (u.type === 'Reading') completedReadingsCount++;
          else if (u.type === 'Quiz') completedQuizzesCount++;
          else if (u.type === 'Assignment') completedAssignmentsCount++;
        }
      });
    });
  });

  const completionPercentage = totalUnitsCount > 0 ? Math.round((populatedUnitsCount / totalUnitsCount) * 100) : 0;
  const studentCompletionPercentage = totalUnitsCount > 0 ? Math.round((completedUnitsCount / totalUnitsCount) * 100) : 0;
  const isEligibleForCertificate = completedUnitsCount === totalUnitsCount && totalUnitsCount > 0;

  const handleOpenCertificateModal = () => {
    // Generate a unique ID (e.g. KQ-CERT-XXXXXX)
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    setCertUniqueId(`KQ-CERT-${randomHex}`);
    
    // Set current formatted date
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCertCompletionDate(formatted);
    setCertificateModalOpen(true);
  };

  const handlePrintCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Kaizen Q Certificate - ${course.title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap" rel="stylesheet">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #fafafa;
                font-family: 'Sora', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .cert-container {
                width: 800px;
                height: 560px;
                background: white;
                border: 20px solid #f59e0b; /* Amber gold border */
                padding: 40px;
                box-sizing: border-box;
                position: relative;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
              }
              .cert-inner {
                border: 2px solid #fbbf24;
                height: 100%;
                width: 100%;
                box-sizing: border-box;
                padding: 30px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .branding {
                font-size: 16px;
                font-weight: 800;
                letter-spacing: 0.1em;
                color: #0f172a;
                text-transform: uppercase;
              }
              .cert-title {
                font-family: 'Playfair Display', serif;
                font-size: 32px;
                font-weight: 700;
                color: #b45309;
                margin: 10px 0 0 0;
              }
              .cert-subtitle {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #64748b;
                margin: 5px 0 0 0;
              }
              .recipient-label {
                font-size: 11px;
                color: #64748b;
                font-style: italic;
                margin-top: 15px;
              }
              .recipient-name {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 700;
                color: #0f172a;
                border-bottom: 2px solid #e2e8f0;
                display: inline-block;
                padding-bottom: 5px;
                min-width: 300px;
                margin: 10px auto;
              }
              .cert-text {
                font-size: 12px;
                color: #475569;
                line-height: 1.6;
                max-width: 500px;
                margin: 10px auto 0 auto;
                font-weight: 500;
              }
              .course-name {
                font-weight: 700;
                color: #0f172a;
              }
              .footer-signatures {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 30px;
              }
              .sig-block {
                width: 180px;
                text-align: center;
              }
              .sig-line {
                border-top: 1px solid #cbd5e1;
                margin-top: 8px;
                padding-top: 5px;
                font-size: 9px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .sig-name {
                font-size: 11px;
                font-weight: 700;
                color: #1e293b;
              }
              .cert-seal {
                width: 70px;
                height: 70px;
                background: radial-gradient(circle, #fcd34d 0%, #fbbf24 100%);
                border: 4px double #d97706;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                font-weight: 800;
                color: #78350f;
                text-transform: uppercase;
                box-shadow: 0 4px 10px rgba(217, 119, 6, 0.15);
              }
              .cert-meta {
                position: absolute;
                bottom: 15px;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
                padding: 0 50px;
                font-size: 8px;
                font-weight: 750;
                color: #94a3b8;
                font-family: monospace;
              }
              @media print {
                body {
                  background: white;
                }
                .cert-container {
                  box-shadow: none;
                  border-color: #f59e0b !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="cert-container">
              <div class="cert-inner">
                <div>
                  <div class="branding">Kaizen Q</div>
                  <div class="cert-title">Certificate of Completion</div>
                  <div class="cert-subtitle">Enterprise Learning Management System</div>
                </div>

                <div>
                  <div class="recipient-label">This credential is proudly presented to</div>
                  <div class="recipient-name">${certStudentName}</div>
                  <div class="cert-text">
                    for successfully mastering all lectures, coding challenges, quizzes, and project evaluations in the course track
                    <div class="course-name" style="margin-top: 5px; font-size: 14px;">${course.title}</div>
                  </div>
                </div>

                <div class="footer-signatures">
                  <div class="sig-block">
                    <div class="sig-name">${course.instructor}</div>
                    <div class="sig-line">Lead Instructor</div>
                  </div>
                  
                  <div class="cert-seal">
                    <div>Official Seal</div>
                  </div>

                  <div class="sig-block">
                    <div class="sig-name">Kaizen Q Academic Board</div>
                    <div class="sig-line">Registrar Division</div>
                  </div>
                </div>
              </div>

              <div class="cert-meta">
                <span>DATE: ${certCompletionDate}</span>
                <span>CERTIFICATE ID: ${certUniqueId}</span>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Flattened list of syllabus units for navigation
  const getSyllabusUnits = (): { moduleId: string; topicId: string; unit: LearningUnitItem }[] => {
    const list: { moduleId: string; topicId: string; unit: LearningUnitItem }[] = [];
    modules.forEach((m) => {
      m.topics.forEach((t) => {
        t.learningUnits.forEach((u) => {
          list.push({ moduleId: m.id, topicId: t.id, unit: u });
        });
      });
    });
    return list;
  };

  const syllabusUnits = getSyllabusUnits();
  const currentUnitIndex = activeUnit ? syllabusUnits.findIndex(item => item.unit.id === activeUnit.id) : -1;
  const prevUnitIndex = currentUnitIndex > 0 ? currentUnitIndex - 1 : -1;
  const nextUnitIndex = currentUnitIndex !== -1 && currentUnitIndex < syllabusUnits.length - 1 ? currentUnitIndex + 1 : -1;

  const navigateToPrevUnit = () => {
    if (prevUnitIndex === -1) return;
    const target = syllabusUnits[prevUnitIndex];
    openEditUnitDrawer(target.moduleId, target.topicId, target.unit);
  };

  const navigateToNextUnit = () => {
    if (nextUnitIndex === -1) return;
    const target = syllabusUnits[nextUnitIndex];
    openEditUnitDrawer(target.moduleId, target.topicId, target.unit);
  };

  const handleToggleComplete = (unitId: string) => {
    setCompletedUnitIds((prev) => {
      const next = { ...prev, [unitId]: !prev[unitId] };
      toast.success(next[unitId] ? 'Lesson marked as completed!' : 'Lesson marked as incomplete.');
      return next;
    });
  };

  // Quiz Simulation Timer effects
  useEffect(() => {
    let interval: any = null;
    if (activeTab === 'preview' && activeUnit?.type === 'Quiz' && quizTimerActive && quizTimeRemaining > 0 && !quizSubmitted) {
      interval = setInterval(() => {
        setQuizTimeRemaining(prev => {
          if (prev <= 1) {
            setQuizSubmitted(true);
            setQuizTimerActive(false);

            // Save score to localStorage for Student Dashboard
            const totalQuizMarks = activeUnit.quizQuestions?.reduce((acc: number, q: any) => acc + (q.marks || 5), 0) || 0;
            const scoredMarks = activeUnit.quizQuestions?.reduce((acc: number, q: any) => {
              return acc + (quizSelectedAnswers[q.id] === q.correctAnswerIndex ? (q.marks || 5) : 0);
            }, 0) || 0;
            const percentage = totalQuizMarks > 0 ? Math.round((scoredMarks / totalQuizMarks) * 100) : 0;
            
            localStorage.setItem(`lms_quiz_score_${activeUnit.id}`, JSON.stringify({
              score: scoredMarks,
              total: totalQuizMarks,
              percentage,
              date: new Date().toLocaleDateString('en-US')
            }));

            toast.error('Time is up! Quiz submitted automatically.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, activeUnit, quizTimerActive, quizTimeRemaining, quizSubmitted, quizSelectedAnswers]);

  useEffect(() => {
    if (activeTab === 'preview' && activeUnit?.type === 'Quiz') {
      startQuizSimulation();
    } else {
      setQuizTimerActive(false);
    }
  }, [activeTab, activeUnit?.id]);

  const startQuizSimulation = () => {
    setQuizSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizTimeRemaining((activeUnit?.quizTimer || 10) * 60);
    setQuizTimerActive(true);
  };

  const formatQuizTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const parseMarkdownToHtml = (md: string): string => {
    if (!md) return '';
    let html = md;

    // Escape basic HTML tags to prevent custom injected scripts
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Code blocks (fenced with ```)
    const codeBlocks: string[] = [];
    html = html.replace(/```(?:(\w+)\n)?([\s\S]+?)```/g, (_, _lang, code) => {
      const index = codeBlocks.length;
      const highlighted = code
        .replace(/(\/\/.+)/g, '<span class="text-slate-400 font-mono font-medium">$1</span>')
        .replace(/\b(const|let|var|function|return|import|export|class|from|default|type|interface|public|private)\b/g, '<span class="text-sky-600 font-bold font-mono">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-amber-600 font-mono">$1</span>')
        .replace(/(['"`])(.*?)\1/g, '<span class="text-emerald-600 font-mono">$1$2$1</span>');
      
      codeBlocks.push(
        `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800 leading-normal my-4"><code class="font-mono block">${highlighted}</code></pre>`
      );
      return `__CODE_BLOCK_${index}__`;
    });

    // 2. Images: ![alt](url)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-xl border border-slate-200 shadow-sm max-w-full h-auto object-cover mx-auto" />');

    // 3. Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-sky-600 font-bold hover:underline">$1</a>');

    // 4. Headings
    html = html.replace(/^# (.*?)$/gm, '<h1 class="font-heading font-extrabold text-lg text-slate-900 border-b pb-2 mt-6 mb-3">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="font-heading font-bold text-sm text-slate-900 mt-5 mb-2.5">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 class="font-heading font-bold text-xs text-slate-800 mt-4 mb-2">$1</h3>');

    // 5. Tables
    html = html.replace(/((?:\|[^\n]+\|\r?\n?)+)/g, (tableText) => {
      const lines = tableText.trim().split('\n');
      if (lines.length < 2) return tableText;
      
      const rows = lines.map(line => {
        return line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      });

      const headerCells = rows[0].map(c => `<th class="border border-slate-200 bg-slate-50/50 p-2 text-left text-[11px] font-bold text-slate-700">${c}</th>`).join('');
      
      // Filter out divider lines (e.g. |---|---|)
      const dataRows = rows.slice(1).filter(r => !r.every(c => c.startsWith('-')));
      
      const bodyRows = dataRows.map(r => {
        const tdCells = r.map(c => `<td class="border border-slate-200 p-2 text-[11px] font-medium text-slate-600">${c}</td>`).join('');
        return `<tr class="hover:bg-slate-50/50 transition-colors">${tdCells}</tr>`;
      }).join('');

      return `<div class="overflow-x-auto my-5 border border-slate-200 rounded-xl shadow-3xs"><table class="w-full border-collapse bg-white"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
    });

    // 6. Bullet lists
    html = html.replace(/^(?:-|\*)\s+(.*?)$/gm, '<li class="ml-4 list-disc text-slate-600 font-medium pl-1.5 my-1 leading-relaxed">$1</li>');

    // 7. Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

    // 8. Line breaks & Paragraphs (wrapped around plain text lines)
    html = html.replace(/^(?!<h|<li|<tr|<td|<th|<pre|<img|<\/?table|<\/?thead|<\/?tbody|<\/?tr|__CODE_BLOCK_)(.+)$/gm, '<p class="my-3 text-slate-600 font-medium leading-relaxed">$1</p>');

    // Restore Code Blocks
    codeBlocks.forEach((block, idx) => {
      html = html.replace(`__CODE_BLOCK_${idx}__`, block);
    });

    return html;
  };

  const getEstimatedReadingTime = (text: string): string => {
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).length;
    const time = Math.max(1, Math.round(words / 200));
    return `${time} min read`;
  };

  // Toggle module expansion
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      [id]: !prev[id],
    }));
  };

  // Toggle topic expansion
  const toggleTopicExpand = (id: string) => {
    setExpandedTopicIds((prev) => ({
      [id]: !prev[id],
    }));
  };

  // ================= MODULE OPERATIONS =================

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Module title is required.');
      return;
    }

    const newModule: ModuleItem = {
      id: `mod-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      duration: newDuration.trim() || '8 hours',
      topics: [],
    };

    const updated = [...modules, newModule];
    updateCourse(course.id, { modules: updated });
    
    setExpandedIds({ [newModule.id]: true });

    setNewTitle('');
    setNewDescription('');
    setNewDuration('8 hours');
    setAddModalOpen(false);
    toast.success(`Module "${newModule.title}" created successfully!`);
  };

  const openEditModal = (module: ModuleItem) => {
    setEditingModule(module);
    setEditTitle(module.title);
    setEditDescription(module.description);
    setEditDuration(module.duration);
    setEditModalOpen(true);
  };

  const handleEditModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !editTitle.trim()) {
      toast.error('Module title is required.');
      return;
    }

    const updated = modules.map((m) =>
      m.id === editingModule.id
        ? {
            ...m,
            title: editTitle.trim(),
            description: editDescription.trim(),
            duration: editDuration.trim() || '8 hours',
          }
        : m
    );

    updateCourse(course.id, { modules: updated });
    setEditModalOpen(false);
    setEditingModule(null);
    toast.success('Module updated successfully!');
  };

  const handleDeleteModule = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? All of its topics will be removed.`)) {
      const updated = modules.filter((m) => m.id !== id);
      updateCourse(course.id, { modules: updated });
      toast.success('Module deleted successfully');
    }
  };

  // ================= TOPIC OPERATIONS =================

  const openAddTopicModal = (moduleId: string) => {
    setActiveModuleIdForTopic(moduleId);
    setNewTopicTitle('');
    setNewTopicDescription('');
    setNewTopicEstimatedDuration('45 mins');
    setAddTopicModalOpen(true);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleIdForTopic || !newTopicTitle.trim()) {
      toast.error('Topic title is required.');
      return;
    }

    const newTopic: TopicItem = {
      id: `topic-${Date.now()}`,
      title: newTopicTitle.trim(),
      description: newTopicDescription.trim(),
      estimatedDuration: newTopicEstimatedDuration.trim() || '45 mins',
      learningUnits: [],
    };

    const updated = modules.map((m) => {
      if (m.id === activeModuleIdForTopic) {
        return {
          ...m,
          topics: [...m.topics, newTopic],
        };
      }
      return m;
    });

    updateCourse(course.id, { modules: updated });
    setExpandedTopicIds({ [newTopic.id]: true });
    setAddTopicModalOpen(false);
    setActiveModuleIdForTopic(null);
    toast.success(`Topic "${newTopic.title}" added successfully!`);
  };

  const openEditTopicModal = (moduleId: string, topic: TopicItem) => {
    setActiveModuleIdForTopic(moduleId);
    setEditingTopic(topic);
    setEditTopicTitle(topic.title);
    setEditTopicDescription(topic.description);
    setEditTopicEstimatedDuration(topic.estimatedDuration || '45 mins');
    setEditTopicModalOpen(true);
  };

  const handleEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleIdForTopic || !editingTopic || !editTopicTitle.trim()) {
      toast.error('Topic title is required.');
      return;
    }

    const updated = modules.map((m) => {
      if (m.id === activeModuleIdForTopic) {
        const nextTopics = m.topics.map((t) =>
          t.id === editingTopic.id
            ? {
                ...t,
                title: editTopicTitle.trim(),
                description: editTopicDescription.trim(),
                estimatedDuration: editTopicEstimatedDuration.trim() || '45 mins',
              }
            : t
        );
        return { ...m, topics: nextTopics };
      }
      return m;
    });

    updateCourse(course.id, { modules: updated });
    setEditTopicModalOpen(false);
    setEditingTopic(null);
    setActiveModuleIdForTopic(null);
    toast.success('Topic updated successfully!');
  };

  const handleDeleteTopic = (moduleId: string, topicId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete topic "${title}"?`)) {
      const updated = modules.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            topics: m.topics.filter((t) => t.id !== topicId),
          };
        }
        return m;
      });
      updateCourse(course.id, { modules: updated });
      toast.success('Topic deleted successfully');
    }
  };

  // ================= SIDE DRAWER UNIT EDITOR =================

  const openEditUnitDrawer = (moduleId: string, topicId: string, unit: LearningUnitItem) => {
    setDrawerModuleId(moduleId);
    setDrawerTopicId(topicId);
    setActiveUnit(JSON.parse(JSON.stringify(unit)));
    setActiveTab(isStudentPreviewMode ? 'preview' : 'edit');
    setQuizSelectedAnswers({});
    setQuizSubmitted(false);
    setDrawerOpen(true);
  };

  const handleSaveUnitDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerModuleId || !drawerTopicId || !activeUnit || !activeUnit.title.trim()) {
      toast.error('Learning unit title is required.');
      return;
    }

    const updated = modules.map((m) => {
      if (m.id === drawerModuleId) {
        const nextTopics = m.topics.map((t) => {
          if (t.id === drawerTopicId) {
            const nextUnits = t.learningUnits.map((u) =>
              u.id === activeUnit.id ? activeUnit : u
            );
            return { ...t, learningUnits: nextUnits };
          }
          return t;
        });
        return { ...m, topics: nextTopics };
      }
      return m;
    });

    setModules(updated);
    updateCourse(course.id, { modules: updated });
    setDrawerOpen(false);
    setActiveUnit(null);
    toast.success('Learning unit saved successfully!');
  };

  const handleDeleteUnitDrawer = () => {
    if (!activeUnit || !drawerModuleId || !drawerTopicId) return;
    if (window.confirm(`Are you sure you want to delete unit "${activeUnit.title}"?`)) {
      const updated = modules.map((m) => {
        if (m.id === drawerModuleId) {
          const nextTopics = m.topics.map((t) => {
            if (t.id === drawerTopicId) {
              return {
                ...t,
                learningUnits: t.learningUnits.filter((u) => u.id !== activeUnit.id),
              };
            }
            return t;
          });
          return { ...m, topics: nextTopics };
        }
        return m;
      });
      setModules(updated);
      updateCourse(course.id, { modules: updated });
      setDrawerOpen(false);
      setActiveUnit(null);
      toast.success('Learning unit deleted successfully');
    }
  };

  // --- Quiz Questions Builders ---
  const addQuizQuestion = () => {
    if (!activeUnit) return;
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      questionText: 'New Multiple Choice Question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswerIndex: 0,
      explanation: '',
      marks: 5
    };
    const updatedQuestions = [...(activeUnit.quizQuestions || []), newQuestion];
    setActiveUnit({ ...activeUnit, quizQuestions: updatedQuestions });
    toast.success('New question template added');
  };

  const updateQuestionText = (index: number, val: string) => {
    if (!activeUnit || !activeUnit.quizQuestions) return;
    const updated = [...activeUnit.quizQuestions];
    updated[index].questionText = val;
    setActiveUnit({ ...activeUnit, quizQuestions: updated });
  };

  const updateQuestionOption = (qIdx: number, optIdx: number, val: string) => {
    if (!activeUnit || !activeUnit.quizQuestions) return;
    const updated = [...activeUnit.quizQuestions];
    updated[qIdx].options[optIdx] = val;
    setActiveUnit({ ...activeUnit, quizQuestions: updated });
  };

  const updateQuestionAnswer = (qIdx: number, val: number) => {
    if (!activeUnit || !activeUnit.quizQuestions) return;
    const updated = [...activeUnit.quizQuestions];
    updated[qIdx].correctAnswerIndex = val;
    setActiveUnit({ ...activeUnit, quizQuestions: updated });
  };

  const deleteQuizQuestion = (index: number) => {
    if (!activeUnit || !activeUnit.quizQuestions) return;
    const updated = activeUnit.quizQuestions.filter((_, i) => i !== index);
    setActiveUnit({ ...activeUnit, quizQuestions: updated });
    toast.success('Question removed');
  };

  // ================= UNIT ACCORDION OPERATIONS =================

  const openAddUnitModal = (moduleId: string, topicId: string) => {
    setActiveModuleIdForUnit(moduleId);
    setActiveTopicIdForUnit(topicId);
    setNewUnitTitle('');
    setNewUnitDescription('');
    setNewUnitDuration('15 mins');
    setNewUnitType('Video');
    setAddUnitModalOpen(true);
  };

  const handleAddLearningUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleIdForUnit || !activeTopicIdForUnit || !newUnitTitle.trim()) {
      toast.error('Learning unit title is required.');
      return;
    }

    const newUnit: LearningUnitItem = {
      id: `unit-${Date.now()}`,
      title: newUnitTitle.trim(),
      description: newUnitDescription.trim(),
      duration: newUnitDuration.trim() || '15 mins',
      type: newUnitType,
    };

    if (newUnit.type === 'Video') {
      newUnit.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    } else if (newUnit.type === 'Reading') {
      newUnit.readingContent = `## ${newUnit.title}\n\n${newUnit.description}\n\n### Core Concept Reading\nFill in the detailed course notes here. Markdown syntax is supported.`;
    } else if (newUnit.type === 'Quiz') {
      newUnit.quizQuestions = [
        {
          id: `q-${newUnit.id}-1`,
          questionText: 'Select the primary component discussed in this lesson:',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: 0
        }
      ];
    } else if (newUnit.type === 'Assignment') {
      newUnit.assignmentInstructions = `### Practical Assignment: ${newUnit.title}\n\n#### Instructions:\n1. Complete active tasks described in description: *${newUnit.description}*.\n2. Submit files to admin.`;
    }

    const updated = modules.map((m) => {
      if (m.id === activeModuleIdForUnit) {
        const nextTopics = m.topics.map((t) => {
          if (t.id === activeTopicIdForUnit) {
            return {
              ...t,
              learningUnits: [...t.learningUnits, newUnit],
            };
          }
          return t;
        });
        return { ...m, topics: nextTopics };
      }
      return m;
    });

    updateCourse(course.id, { modules: updated });
    setAddUnitModalOpen(false);
    setActiveModuleIdForUnit(null);
    setActiveTopicIdForUnit(null);
    toast.success(`Learning unit "${newUnit.title}" added successfully!`);

    openEditUnitDrawer(activeModuleIdForUnit, activeTopicIdForUnit, newUnit);
  };

  const handleDeleteLearningUnit = (moduleId: string, topicId: string, unitId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete unit "${title}"?`)) {
      const updated = modules.map((m) => {
        if (m.id === moduleId) {
          const nextTopics = m.topics.map((t) => {
            if (t.id === topicId) {
              return {
                ...t,
                learningUnits: t.learningUnits.filter((u) => u.id !== unitId),
              };
            }
            return t;
          });
          return { ...m, topics: nextTopics };
        }
        return m;
      });
      updateCourse(course.id, { modules: updated });
      toast.success('Learning unit deleted successfully');
    }
  };

  // ================= DRAG AND DROP HANDLERS =================

  // --- Module Drag/Drop ---
  const handleModuleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedModuleIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-40');
  };

  const handleModuleDragEnd = (e: React.DragEvent) => {
    setDraggedModuleIndex(null);
    e.currentTarget.classList.remove('opacity-40');
  };

  const handleModuleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleModuleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedModuleIndex === null || draggedModuleIndex === targetIndex) return;

    const reordered = [...modules];
    const [removed] = reordered.splice(draggedModuleIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    setModules(reordered);
    updateCourse(course.id, { modules: reordered });
    toast.success('Modules reordered successfully!');
  };

  // --- Topic Drag/Drop ---
  const handleTopicDragStart = (e: React.DragEvent, moduleId: string, index: number) => {
    setDraggedTopic({ moduleId, index });
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('bg-sky-50');
    e.stopPropagation();
  };

  const handleTopicDragEnd = (e: React.DragEvent) => {
    setDraggedTopic(null);
    e.currentTarget.classList.remove('bg-sky-50');
  };

  const handleTopicDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTopicDrop = (e: React.DragEvent, targetModuleId: string, targetTopicIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedTopic) return;
    if (draggedTopic.moduleId !== targetModuleId) {
      toast.error('Topics can only be reordered within the same module');
      return;
    }
    if (draggedTopic.index === targetTopicIndex) return;

    const updated = modules.map((m) => {
      if (m.id === targetModuleId) {
        const reorderedTopics = [...m.topics];
        const [removed] = reorderedTopics.splice(draggedTopic.index, 1);
        reorderedTopics.splice(targetTopicIndex, 0, removed);
        return { ...m, topics: reorderedTopics };
      }
      return m;
    });

    setModules(updated);
    updateCourse(course.id, { modules: updated });
    toast.success('Topics reordered successfully!');
  };

  // --- Learning Unit Drag/Drop ---
  const handleUnitDragStart = (e: React.DragEvent, moduleId: string, topicId: string, index: number) => {
    setDraggedUnit({ moduleId, topicId, index });
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('bg-slate-100');
    e.stopPropagation();
  };

  const handleUnitDragEnd = (e: React.DragEvent) => {
    setDraggedUnit(null);
    e.currentTarget.classList.remove('bg-slate-100');
  };

  const handleUnitDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUnitDrop = (e: React.DragEvent, targetModuleId: string, targetTopicId: string, targetUnitIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedUnit) return;
    if (draggedUnit.moduleId !== targetModuleId || draggedUnit.topicId !== targetTopicId) {
      toast.error('Learning units can only be reordered within the same topic');
      return;
    }
    if (draggedUnit.index === targetUnitIndex) return;

    const updated = modules.map((m) => {
      if (m.id === targetModuleId) {
        const nextTopics = m.topics.map((t) => {
          if (t.id === targetTopicId) {
            const reorderedUnits = [...t.learningUnits];
            const [removed] = reorderedUnits.splice(draggedUnit.index, 1);
            reorderedUnits.splice(targetUnitIndex, 0, removed);
            return { ...t, learningUnits: reorderedUnits };
          }
          return t;
        });
        return { ...m, topics: nextTopics };
      }
      return m;
    });

    setModules(updated);
    updateCourse(course.id, { modules: updated });
    toast.success('Learning units reordered successfully!');
  };

  // Reusable Unit Icon Resolver
  const renderUnitIcon = (type: LearningUnitType) => {
    switch (type) {
      case 'Video':
        return <Play className="w-3.5 h-3.5 text-sky-500 fill-current" />;
      case 'Reading':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Quiz':
        return <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Assignment':
        return <FileText className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  // Reusable Unit Badge Class Resolver
  const getUnitTypeBadgeStyles = (type: LearningUnitType) => {
    switch (type) {
      case 'Video':
        return 'bg-sky-50 text-sky-700 border border-sky-200/80';
      case 'Reading':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200/80';
      case 'Quiz':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
      case 'Assignment':
        return 'bg-amber-50 text-amber-700 border border-amber-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200/80';
    }
  };

  // Safe YouTube Embed cleaner
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const ytIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return ytIdMatch ? `https://www.youtube.com/embed/${ytIdMatch[1]}` : url;
  };

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12 animate-in fade-in-50 duration-300">
      {isStudentPreviewMode && (
        <div className="bg-amber-500/10 border border-amber-200/80 py-3 px-4 rounded-2xl text-center text-xs font-bold text-amber-800 flex items-center justify-center gap-2 select-none shadow-3xs">
          <Sparkles className="w-4 h-4 animate-bounce text-amber-600 shrink-0" />
          <span>You are viewing this course track in Student Preview Mode. Editing controls are disabled.</span>
          <button
            onClick={() => {
              setIsStudentPreviewMode(false);
              setDrawerOpen(false);
            }}
            className="underline hover:text-amber-900 cursor-pointer ml-1 font-extrabold"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* Navigation Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/courses"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-sky-600 hover:bg-sky-50/80 transition-all border border-sky-100/50 bg-white"
        >
          <ArrowLeft className="w-4 h-4 text-sky-500" />
          <span>Back to Course Tracks</span>
        </Link>
      </div>

      {/* Course Header Banner */}
      <div className="bg-white/95 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-md border border-sky-200">
              {course.category}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              course.status === 'Published'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {course.status}
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Lead Instructor: <span className="text-slate-800 font-bold">{course.instructor}</span>
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setIsStudentPreviewMode(!isStudentPreviewMode);
              setDrawerOpen(false);
            }}
            className={`font-bold text-xs border py-3 px-5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              isStudentPreviewMode
                ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                : 'bg-white text-slate-800 border border-sky-200 hover:bg-sky-50/80'
            }`}
          >
            {isStudentPreviewMode ? (
              <>
                <EyeOff className="w-4 h-4 text-sky-600" />
                <span>Exit Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Student Preview</span>
              </>
            )}
          </button>

          {!isStudentPreviewMode && (
            <button
              onClick={() => {
                toggleCourseStatus(course.id);
                toast.success(`Course status toggled successfully!`);
              }}
              className="bg-white hover:bg-sky-50/80 text-slate-800 font-bold text-xs border border-sky-200 py-3 px-5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Toggle Status</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= PROGRESS ANALYTICS DASHBOARD ================= */}
      {!isStudentPreviewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Completion Progress Card */}
          <div className="bg-white border border-sky-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Curriculum Completion
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                completionPercentage === 100
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border border-sky-200'
              }`}>
                {completionPercentage}% Populated
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {completionPercentage}%
              </div>
              
              {/* Progress Bar Container */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <span className="text-[10px] text-slate-400 font-semibold block">
                Audited units: {populatedUnitsCount} of {totalUnitsCount} fully set up.
              </span>
            </div>
          </div>

          {/* Syllabus Scale Card */}
          <div className="bg-white border border-sky-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Syllabus Structure
              </span>
              <Layers className="w-4 h-4 text-sky-500" />
            </div>

            <div className="space-y-1.5">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1.5">
                <span>{totalModules}</span>
                <span className="text-xs text-slate-400 font-bold">Modules</span>
              </div>
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span className="text-sky-700 bg-sky-50 border px-1.5 py-0.5 rounded font-mono">
                  {totalTopics}
                </span>
                <span>Topics & Lessons configured</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                Avg {totalModules > 0 ? (totalTopics / totalModules).toFixed(1) : 0} topics per module.
              </span>
            </div>
          </div>

          {/* Distribution Details Card */}
          <div className="bg-white border border-sky-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Asset Distributions
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border font-mono">
                {totalUnitsCount} Units Total
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold font-mono">
              <div className="bg-sky-50/50 border border-sky-100 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">🎥 Videos</span>
                <span className="text-sky-800 font-extrabold">{totalVideos}</span>
              </div>
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">📖 Readings</span>
                <span className="text-indigo-800 font-extrabold">{totalReadings}</span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">📝 Quizzes</span>
                <span className="text-emerald-800 font-extrabold">{totalQuizzes}</span>
              </div>
              <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">📂 Tasks</span>
                <span className="text-amber-800 font-extrabold">{totalAssignments}</span>
              </div>
            </div>
          </div>

          {/* Estimated Hours Card */}
          <div className="bg-white border border-sky-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Total Learning Volume
              </span>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>

            <div className="space-y-1.5">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {totalLearningHours.toFixed(1)} hrs
              </div>
              <div className="text-xs font-semibold text-slate-600">
                Approx. {totalUnitsCount > 0 ? Math.round((totalLearningHours * 60) / totalUnitsCount) : 0} mins per learning unit
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                Calculated dynamically from live curriculum items.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Student Overall Completion Progress Card */}
          <div className="bg-white border border-sky-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Overall Completion
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                studentCompletionPercentage === 100
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                  : 'bg-sky-50 text-sky-700 border border-sky-200'
              }`}>
                {studentCompletionPercentage}% Completed
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {studentCompletionPercentage}%
              </div>
              
              {/* Progress Bar Container */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${studentCompletionPercentage}%` }}
                />
              </div>

              <span className="text-[10px] text-slate-400 font-semibold block">
                Lessons: {completedUnitsCount} of {totalUnitsCount} completed.
              </span>
            </div>
          </div>

          {/* 2. Completed Learning Hours Card */}
          <div className="bg-white border border-sky-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 animate-in fade-in slide-in-from-bottom duration-300 delay-75">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Completed Hours
              </span>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>

            <div className="space-y-1.5">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {completedLearningHours.toFixed(1)} / {totalLearningHours.toFixed(1)} hrs
              </div>
              <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">
                {studentCompletionPercentage === 100 
                  ? 'Incredible! You have finished the full learning volume.' 
                  : `You have completed ${totalLearningHours > 0 ? Math.round((completedLearningHours / totalLearningHours) * 100) : 0}% of the course volume.`}
              </p>
            </div>
          </div>

          {/* 3. Completed Assets Progress Card */}
          <div className="bg-white border border-sky-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 animate-in fade-in slide-in-from-bottom duration-300 delay-150">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Completed Units
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border font-mono">
                {completedUnitsCount} / {totalUnitsCount} Done
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold font-mono">
              <div className="bg-sky-50/50 border border-sky-100 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-slate-550 flex items-center gap-1">🎥 Videos</span>
                <span className="text-sky-850 font-extrabold">{completedVideosCount} / {totalVideos}</span>
              </div>
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-slate-550 flex items-center gap-1">📖 Readings</span>
                <span className="text-indigo-850 font-extrabold">{completedReadingsCount} / {totalReadings}</span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-slate-550 flex items-center gap-1">📝 Quizzes</span>
                <span className="text-emerald-850 font-extrabold">{completedQuizzesCount} / {totalQuizzes}</span>
              </div>
              <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-slate-550 flex items-center gap-1">📂 Tasks</span>
                <span className="text-amber-850 font-extrabold">{completedAssignmentsCount} / {totalAssignments}</span>
              </div>
            </div>
          </div>

          {/* 4. Certificate Eligibility Card */}
          <div className={`border rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-3 transition-all duration-500 animate-in fade-in slide-in-from-bottom duration-300 delay-200 ${
            isEligibleForCertificate 
              ? 'bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-sky-500/5 border-amber-300 shadow-md shadow-amber-500/5'
              : 'bg-white border-sky-200/80'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Certificate Status
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isEligibleForCertificate 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-bounce'
                  : 'bg-slate-100 text-slate-650 border border-slate-200'
              }`}>
                {isEligibleForCertificate ? 'Eligible' : 'Locked'}
              </span>
            </div>

            <div className="space-y-1">
              {isEligibleForCertificate ? (
                <>
                  <div className="text-[11px] font-extrabold text-amber-900 tracking-tight flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Certificate Unlocked!</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCertificateModal}
                    className="w-full mt-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[10px] tracking-wide shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Download Certificate</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="text-[11px] font-bold text-slate-500">Course Incomplete</div>
                  <p className="text-[9px] font-medium text-slate-400 leading-relaxed">
                    Complete remaining {totalUnitsCount - completedUnitsCount} items to claim your verified certificate of completion.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Switcher */}
      {!isStudentPreviewMode && (
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold bg-white p-4 rounded-3xl border border-sky-100/50 shadow-3xs mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`pb-1 transition-all border-b-2 cursor-pointer ${
              activeTab === 'edit'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Curriculum Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grading')}
            className={`pb-1 transition-all border-b-2 cursor-pointer ${
              activeTab === 'grading'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Assignment Grading Center
          </button>
        </div>
      )}

      {/* Main Grid: Modules & Sidebar */}
      {(isStudentPreviewMode || activeTab === 'edit') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Modules Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <div>
                <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-600" />
                  <span>Course Curriculum Modules</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Structure learning modules, topics, and granular learning units. Click on any unit's edit icon to configure content settings in the editor drawer.
                </p>
              </div>
              {!isStudentPreviewMode && (
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="btn-blue-primary text-xs py-2.5 px-4 shadow-md shadow-sky-500/10 flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Module</span>
                </button>
              )}
            </div>

            {/* Empty State or Modules List */}
            {modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-slate-50 border border-dashed border-sky-200 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-100/50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="font-heading font-bold text-sm text-slate-900">Curriculum is Empty</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    There are no modules defined for this course track yet. Click the "Add Module" button above to start adding lessons, labs, and interactive content.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, index) => {
                  const isExpanded = !!expandedIds[module.id];
                  return (
                    <div
                      key={module.id}
                      onDragOver={handleModuleDragOver}
                      onDrop={(e) => handleModuleDrop(e, index)}
                      className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? 'border-sky-300 bg-sky-50/20 shadow-xs'
                          : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      {/* Module Header Area */}
                      <div className="flex items-center justify-between p-4 sm:p-5 select-none gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Drag Handle */}
                          {!isStudentPreviewMode && (
                            <div
                              draggable
                              onDragStart={(e) => handleModuleDragStart(e, index)}
                              onDragEnd={handleModuleDragEnd}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                              title="Drag to reorder module"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                          )}

                          {/* Expansion Toggle Header */}
                          <div
                            onClick={() => toggleExpand(module.id)}
                            className="min-w-0 flex-1 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5"
                          >
                            <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {module.title}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                                {module.duration}
                              </span>
                              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-mono">
                                {module.topics.length} {module.topics.length === 1 ? 'Topic' : 'Topics'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!isStudentPreviewMode && (
                            <>
                              <button
                                onClick={() => openEditModal(module)}
                                className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                                title="Edit Module"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteModule(module.id, module.title)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                                title="Delete Module"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => toggleExpand(module.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Module Expanded Details (Nested Accordion Transition wrapper) */}
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}>
                        <div className="p-4 sm:p-5 border-t border-sky-100 bg-white/90 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Description
                            </span>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              {module.description || 'No description provided.'}
                            </p>
                          </div>

                          {/* Topics List */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                                Topics & Lessons
                              </span>
                              {!isStudentPreviewMode && (
                                <button
                                  onClick={() => openAddTopicModal(module.id)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/80 border border-sky-100 py-1 px-2.5 rounded-lg transition-all cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Topic</span>
                                </button>
                              )}
                            </div>

                            {module.topics.length === 0 ? (
                              <p className="text-xs text-slate-400 italic py-2">No topics added to this module yet.</p>
                            ) : (
                              <div className="space-y-3">
                                {module.topics.map((topic, topicIdx) => {
                                  const isTopicExpanded = !!expandedTopicIds[topic.id];
                                  return (
                                    <div
                                      key={topic.id}
                                      onDragOver={handleTopicDragOver}
                                      onDrop={(e) => handleTopicDrop(e, module.id, topicIdx)}
                                      className={`rounded-2xl border transition-all duration-300 ${
                                        isTopicExpanded
                                          ? 'border-sky-200 bg-sky-50/10 shadow-2xs'
                                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                                      }`}
                                    >
                                      {/* Topic Header Area */}
                                      <div className="p-4 flex items-center justify-between gap-4 select-none">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          {/* Topic Drag Handle */}
                                          {!isStudentPreviewMode && (
                                            <div
                                              draggable
                                              onDragStart={(e) => handleTopicDragStart(e, module.id, topicIdx)}
                                              onDragEnd={handleTopicDragEnd}
                                              className="p-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                                              title="Drag to reorder topic"
                                            >
                                              <GripVertical className="w-3.5 h-3.5" />
                                            </div>
                                          )}

                                          {/* Topic Expand Trigger */}
                                          <div
                                            onClick={() => toggleTopicExpand(topic.id)}
                                            className="min-w-0 flex-1 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5"
                                          >
                                            <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 truncate">
                                              {topic.title}
                                            </h4>
                                            <div className="flex items-center gap-2 shrink-0">
                                              <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                                                {topic.estimatedDuration || '45 mins'}
                                              </span>
                                              <span className="text-[9px] font-bold text-sky-700 bg-sky-100/50 px-2 py-0.5 rounded-full border border-sky-100 font-mono shrink-0">
                                                {topic.learningUnits ? topic.learningUnits.length : 0} {(!topic.learningUnits || topic.learningUnits.length === 1) ? 'Unit' : 'Units'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                          {!isStudentPreviewMode && (
                                            <>
                                              <button
                                                onClick={() => openEditTopicModal(module.id, topic)}
                                                className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                                                title="Edit Topic"
                                              >
                                                <Edit className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteTopic(module.id, topic.id, topic.title)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                                                title="Delete Topic"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </>
                                          )}
                                          <button
                                            onClick={() => toggleTopicExpand(topic.id)}
                                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                                          >
                                            {isTopicExpanded ? (
                                              <ChevronUp className="w-3.5 h-3.5" />
                                            ) : (
                                              <ChevronDown className="w-3.5 h-3.5" />
                                            )}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Topic Expanded Details (Host to Learning Units) */}
                                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                        isTopicExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                                      }`}>
                                        <div className="p-4 border-t border-sky-100 bg-white/70 space-y-4 rounded-b-2xl">
                                          {/* Description */}
                                          <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                              Topic Description
                                            </span>
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                              {topic.description || 'No description provided.'}
                                            </p>
                                          </div>

                                          {/* Learning Units Section */}
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                                                Learning Units
                                              </span>
                                              {!isStudentPreviewMode && (
                                                <button
                                                  onClick={() => openAddUnitModal(module.id, topic.id)}
                                                  className="inline-flex items-center gap-1 text-[9px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 border border-sky-100 py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
                                                >
                                                  <Plus className="w-2.5 h-2.5" />
                                                  <span>Add Learning Unit</span>
                                                </button>
                                              )}
                                            </div>

                                            {!topic.learningUnits || topic.learningUnits.length === 0 ? (
                                              <p className="text-xs text-slate-400 italic py-1">No learning units defined for this topic.</p>
                                            ) : (
                                              <div className="space-y-2">
                                                {topic.learningUnits.map((unit, unitIdx) => (
                                                  <div
                                                    key={unit.id}
                                                    onDragOver={handleUnitDragOver}
                                                    onDrop={(e) => handleUnitDrop(e, module.id, topic.id, unitIdx)}
                                                    onClick={() => openEditUnitDrawer(module.id, topic.id, unit)}
                                                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-200 transition-all flex items-start justify-between gap-4 shadow-3xs cursor-pointer hover:bg-sky-50/20"
                                                  >
                                                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                                      {/* Unit Drag Handle */}
                                                      {!isStudentPreviewMode && (
                                                        <div
                                                          draggable
                                                          onDragStart={(e) => handleUnitDragStart(e, module.id, topic.id, unitIdx)}
                                                          onDragEnd={handleUnitDragEnd}
                                                          onClick={(e) => e.stopPropagation()}
                                                          className="p-1 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing transition-colors shrink-0 mt-0.5"
                                                          title="Drag to reorder unit"
                                                        >
                                                          <GripVertical className="w-3.5 h-3.5" />
                                                        </div>
                                                      )}

                                                      {/* Unit Details */}
                                                      <div className="space-y-1 min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                          {renderUnitIcon(unit.type)}
                                                          <h5 className="font-heading font-bold text-xs text-slate-900 truncate">
                                                            {unit.title}
                                                          </h5>
                                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${getUnitTypeBadgeStyles(unit.type)}`}>
                                                            {unit.type}
                                                          </span>
                                                          <span className="text-[9px] font-semibold text-slate-500 bg-white border px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 font-mono">
                                                            <Clock className="w-2.5 h-2.5 text-sky-500" />
                                                            {unit.duration}
                                                          </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                          {unit.description || 'No description.'}
                                                        </p>
                                                      </div>
                                                    </div>

                                                    {/* Unit Actions */}
                                                    {!isStudentPreviewMode && (
                                                      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                          onClick={() => openEditUnitDrawer(module.id, topic.id, unit)}
                                                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                                          title="Edit Unit Drawer"
                                                        >
                                                          <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                          onClick={() => handleDeleteLearningUnit(module.id, topic.id, unit.id, unit.title)}
                                                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                          title="Delete Unit"
                                                        >
                                                          <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar / Meta Info */}
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-sky-100 pb-3 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-sky-600" />
              <span>Track Parameters</span>
            </h3>

            <div className="space-y-3 font-medium text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-sky-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-500" />
                  <span>Enrolled Students</span>
                </span>
                <span className="font-bold text-slate-800">{course.students || '0'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-sky-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>Average Rating</span>
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-amber-400" />
                  <span>{course.rating || '5.0'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-sky-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span>Duration</span>
                </span>
                <span className="font-bold text-slate-800">{course.duration || '20 hrs'}</span>
              </div>
            </div>
          </div>

          {/* Instructor Bio Card */}
          <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-heading font-bold text-sm text-slate-900 border-b border-sky-100 pb-3">
              Instructor Profile
            </h3>

            <div className="flex items-start gap-3.5">
              <img
                src={course.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={course.instructor}
                className="w-12 h-12 rounded-xl object-cover border border-sky-200"
              />
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 text-xs block">{course.instructor}</span>
                <span className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider block">
                  {course.role || 'Senior Technical Instructor'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Enterprise system architectures instructor focusing on Linux system administration, virtualization, shell scripting, and AI-assisted evaluations.
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Grading Center View */}
      {!isStudentPreviewMode && activeTab === 'grading' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-sky-200 p-6 rounded-3xl shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Select Course Assignment to Evaluate
            </label>
            <div className="relative">
              <select
                value={selectedGradingAssignmentId}
                onChange={(e) => setSelectedGradingAssignmentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {courseAssignments.map((ass) => (
                  <option key={ass.id} value={ass.id}>
                    {ass.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AssignmentPortal
            assignmentId={selectedGradingAssignmentId}
            assignmentTitle={
              courseAssignments.find((a) => a.id === selectedGradingAssignmentId)?.title ||
              'Course Assignment'
            }
            courseId={String(courseId)}
          />
        </div>
      )}

      {/* ================= MODALS SECTION ================= */}

      {/* Add Module Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" /> Create New Module
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Module 3: Process Scheduling & Systemd"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide a brief summary of what this module covers..."
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Duration</label>
                <input
                  type="text"
                  required
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="e.g. 8 hours, 4 lessons"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Module</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-600" /> Edit Module Details
              </h3>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingModule(null);
                }}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditModule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Duration</label>
                <input
                  type="text"
                  required
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingModule(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {addTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" /> Add Topic to Module
              </h3>
              <button
                onClick={() => {
                  setAddTopicModalOpen(false);
                  setActiveModuleIdForTopic(null);
                }}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. 1.3 Navigating Files & Directories"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
                  placeholder="Summarize key learning concepts, instructions, or CLI lab goals..."
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Duration</label>
                <input
                  type="text"
                  required
                  value={newTopicEstimatedDuration}
                  onChange={(e) => setNewTopicEstimatedDuration(e.target.value)}
                  placeholder="e.g. 45 mins, 1 hour"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddTopicModalOpen(false);
                    setActiveModuleIdForTopic(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Add Topic</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {editTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-600" /> Edit Topic Details
              </h3>
              <button
                onClick={() => {
                  setEditTopicModalOpen(false);
                  setEditingTopic(null);
                  setActiveModuleIdForTopic(null);
                }}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTopic} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  value={editTopicTitle}
                  onChange={(e) => setEditTopicTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editTopicDescription}
                  onChange={(e) => setEditTopicDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Duration</label>
                <input
                  type="text"
                  required
                  value={editTopicEstimatedDuration}
                  onChange={(e) => setEditTopicEstimatedDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditTopicModalOpen(false);
                    setEditingTopic(null);
                    setActiveModuleIdForTopic(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Learning Unit Modal */}
      {addUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" /> Create Learning Unit
              </h3>
              <button
                onClick={() => {
                  setAddUnitModalOpen(false);
                  setActiveModuleIdForUnit(null);
                  setActiveTopicIdForUnit(null);
                }}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLearningUnit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Unit Title</label>
                <input
                  type="text"
                  required
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  placeholder="e.g. 1.1 Unix Shell History Overview"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newUnitDescription}
                  onChange={(e) => setNewUnitDescription(e.target.value)}
                  placeholder="Summarize the specific goal, content overview, or grading rubric of this unit..."
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={newUnitDuration}
                    onChange={(e) => setNewUnitDuration(e.target.value)}
                    placeholder="e.g. 15 mins, 2 hours"
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit Type</label>
                  <select
                    value={newUnitType}
                    onChange={(e) => setNewUnitType(e.target.value as LearningUnitType)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium cursor-pointer"
                  >
                    <option value="Video">Video</option>
                    <option value="Reading">Reading</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddUnitModalOpen(false);
                    setActiveModuleIdForUnit(null);
                    setActiveTopicIdForUnit(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create & Configure</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= HIGH-FIDELITY SIDE DRAWER FOR UNIT AUTHORING ================= */}
      {drawerOpen && activeUnit && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => {
              setDrawerOpen(false);
              setActiveUnit(null);
            }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
          />

          {/* Side Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-[460px] sm:w-[580px] bg-white shadow-2xl border-l border-slate-200/80 z-50 flex flex-col animate-in slide-in-from-right duration-300 text-slate-900 font-['Sora']">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${getUnitTypeBadgeStyles(activeUnit.type)}`}>
                    {activeUnit.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    LMS Content Builder
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900 mt-1 truncate" title={activeUnit.title}>
                  {activeUnit.title}
                </h3>
              </div>
              
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setActiveUnit(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Tab Bar Selector (only shown if not in Student Preview Mode) */}
            {!isStudentPreviewMode ? (
              <div className="flex border-b border-slate-100 bg-white">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'edit'
                      ? 'border-sky-600 text-sky-700 bg-sky-50/20'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Content</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'preview'
                      ? 'border-sky-600 text-sky-700 bg-sky-50/20'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Student Preview</span>
                </button>
              </div>
            ) : (
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Registered Student view</span>
                <h4 className="font-heading font-extrabold text-sm text-slate-800 mt-0.5">{activeUnit?.title}</h4>
              </div>
            )}

            {/* Drawer Body Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'edit' ? (
                // EDIT CONTENT TAB PANEL
                <form onSubmit={handleSaveUnitDrawer} className="space-y-5">
                  {/* Basic Metadata */}
                  <div className="space-y-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Settings className="w-3 h-3 text-sky-600" />
                      <span>Standard Metadata</span>
                    </h4>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">Unit Title</label>
                      <input
                        type="text"
                        required
                        value={activeUnit.title}
                        onChange={(e) => setActiveUnit({ ...activeUnit, title: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">Estimated Duration</label>
                        <input
                          type="text"
                          required
                          value={activeUnit.duration}
                          onChange={(e) => setActiveUnit({ ...activeUnit, duration: e.target.value })}
                          placeholder="e.g. 15 mins"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">Unit Type</label>
                        <select
                          value={activeUnit.type}
                          onChange={(e) => {
                            const newType = e.target.value as LearningUnitType;
                            const updated: LearningUnitItem = { ...activeUnit, type: newType };
                            if (newType === 'Video' && !updated.videoUrl) updated.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
                            if (newType === 'Reading' && !updated.readingContent) updated.readingContent = '## Reading Notes\n\nStudy guidelines here.';
                            if (newType === 'Quiz' && (!updated.quizQuestions || updated.quizQuestions.length === 0)) {
                              updated.quizQuestions = [{ id: `q-${Date.now()}`, questionText: 'Sample Question', options: ['Option 1', 'Option 2'], correctAnswerIndex: 0 }];
                            }
                            if (newType === 'Assignment' && !updated.assignmentInstructions) updated.assignmentInstructions = '### Assignment Instructions\n\nComplete lab tasks.';
                            setActiveUnit(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900 cursor-pointer"
                        >
                          <option value="Video">Video</option>
                          <option value="Reading">Reading</option>
                          <option value="Quiz">Quiz</option>
                          <option value="Assignment">Assignment</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">Brief Description</label>
                      <textarea
                        rows={2}
                        value={activeUnit.description}
                        onChange={(e) => setActiveUnit({ ...activeUnit, description: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium resize-none text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Type-Specific Contents Editor */}
                  <div className="space-y-4">
                    {activeUnit.type === 'Video' && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-sky-600" />
                          <span>Video Asset Configuration</span>
                        </h4>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">Video Resource URL (YouTube, Vimeo, MP4)</label>
                          <input
                            type="url"
                            required
                            value={activeUnit.videoUrl || ''}
                            onChange={(e) => setActiveUnit({ ...activeUnit, videoUrl: e.target.value })}
                            placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900"
                          />
                          <p className="text-[9px] text-slate-400 font-medium mt-1">
                            Paste standard video links. The system automatically converts them to secure iframe embeds for preview checks.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeUnit.type === 'Reading' && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Reading Markdown content</span>
                        </h4>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">Structured Lesson Text (Markdown Support)</label>
                          <textarea
                            rows={12}
                            required
                            value={activeUnit.readingContent || ''}
                            onChange={(e) => setActiveUnit({ ...activeUnit, readingContent: e.target.value })}
                            placeholder="Write your study notes, code snippets, or reference links here..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium font-mono text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {activeUnit.type === 'Quiz' && (
                      <div className="space-y-4">
                        {/* Quiz Unit Parameters */}
                        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-emerald-50/20 border border-emerald-100/50">
                          <div>
                            <label className="text-[9px] font-bold text-slate-700 block mb-1">Difficulty</label>
                            <select
                              value={activeUnit.quizDifficulty || 'Medium'}
                              onChange={(e) => setActiveUnit({ ...activeUnit, quizDifficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-[11px] font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-700 block mb-1">Timer (minutes)</label>
                            <input
                              type="number"
                              min={1}
                              value={activeUnit.quizTimer || 10}
                              onChange={(e) => setActiveUnit({ ...activeUnit, quizTimer: parseInt(e.target.value) || 10 })}
                              className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-700 block mb-1">Passing Score (%)</label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={activeUnit.quizPassingScore || 70}
                              onChange={(e) => setActiveUnit({ ...activeUnit, quizPassingScore: parseInt(e.target.value) || 70 })}
                              className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Quiz Questions Builder</span>
                          </h4>
                          <button
                            type="button"
                            onClick={addQuizQuestion}
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add Question</span>
                          </button>
                        </div>

                        {(!activeUnit.quizQuestions || activeUnit.quizQuestions.length === 0) ? (
                          <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 italic">No questions created yet. Click "Add Question" to begin.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activeUnit.quizQuestions.map((q, qIdx) => (
                              <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-3 relative">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                                      Question {qIdx + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[8px] font-bold text-slate-400 uppercase">Marks:</span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={q.marks || 5}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 5;
                                          const nextQs = [...(activeUnit.quizQuestions || [])];
                                          nextQs[qIdx] = { ...q, marks: val };
                                          setActiveUnit({ ...activeUnit, quizQuestions: nextQs });
                                        }}
                                        className="w-12 bg-white border border-slate-200 rounded-md py-0.5 px-1.5 text-[10px] font-bold text-slate-700 focus:outline-hidden font-mono"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => deleteQuizQuestion(qIdx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                                    title="Delete Question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div>
                                  <input
                                    type="text"
                                    required
                                    value={q.questionText}
                                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                                    placeholder="Enter question prompt..."
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 font-bold text-slate-900"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Options & Correct Flag
                                  </span>
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`correct-ans-${q.id}`}
                                        checked={q.correctAnswerIndex === optIdx}
                                        onChange={() => updateQuestionAnswer(qIdx, optIdx)}
                                        className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        title="Select as correct option"
                                      />
                                      <input
                                        type="text"
                                        required
                                        value={opt}
                                        onChange={(e) => updateQuestionOption(qIdx, optIdx, e.target.value)}
                                        placeholder={`Option ${optIdx + 1}`}
                                        className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs text-slate-800 focus:outline-hidden font-medium"
                                      />
                                    </div>
                                  ))}
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Explanation (shown to student after submit)</label>
                                  <textarea
                                    rows={2}
                                    value={q.explanation || ''}
                                    onChange={(e) => {
                                      const nextQs = [...(activeUnit.quizQuestions || [])];
                                      nextQs[qIdx] = { ...q, explanation: e.target.value };
                                      setActiveUnit({ ...activeUnit, quizQuestions: nextQs });
                                    }}
                                    placeholder="Provide detailed explanation for correct answer..."
                                    className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs focus:outline-hidden focus:border-sky-500 font-medium text-slate-800"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeUnit.type === 'Assignment' && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>Assignment Builder Configuration</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-700 block mb-1">Maximum Marks</label>
                            <input
                              type="number"
                              min={1}
                              value={activeUnit.assignmentMaxMarks || 100}
                              onChange={(e) => setActiveUnit({ ...activeUnit, assignmentMaxMarks: parseInt(e.target.value) || 100 })}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-700 block mb-1">Submission Deadline</label>
                            <input
                              type="text"
                              value={activeUnit.assignmentDeadline || '7 days after module start'}
                              onChange={(e) => setActiveUnit({ ...activeUnit, assignmentDeadline: e.target.value })}
                              placeholder="e.g. 7 days or date"
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-slate-700 block mb-1">Allowed File Types</label>
                            <input
                              type="text"
                              value={activeUnit.assignmentAllowedTypes || 'PDF, ZIP, MD'}
                              onChange={(e) => setActiveUnit({ ...activeUnit, assignmentAllowedTypes: e.target.value })}
                              placeholder="e.g. PDF, ZIP, DOCX"
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-700 block mb-1">Submission Status</label>
                            <select
                              value={activeUnit.assignmentSubmissionStatus || 'Not Submitted'}
                              onChange={(e) => setActiveUnit({ ...activeUnit, assignmentSubmissionStatus: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900 cursor-pointer"
                            >
                              <option value="Not Submitted">Not Submitted</option>
                              <option value="Submitted">Submitted</option>
                              <option value="Graded">Graded</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-700 block mb-1">Reference Files (comma-separated)</label>
                          <input
                            type="text"
                            value={activeUnit.assignmentReferenceFiles || ''}
                            onChange={(e) => setActiveUnit({ ...activeUnit, assignmentReferenceFiles: e.target.value })}
                            placeholder="e.g. git-cheatsheet.pdf, lab-instructions.md"
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-700 block mb-1">Detailed Instructions (Markdown Support)</label>
                          <textarea
                            rows={6}
                            required
                            value={activeUnit.assignmentInstructions || ''}
                            onChange={(e) => setActiveUnit({ ...activeUnit, assignmentInstructions: e.target.value })}
                            placeholder="Define steps, build commands, expected layout guidelines..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-800 leading-relaxed font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-700 block mb-1">Grading Rubric Description</label>
                          <textarea
                            rows={3}
                            value={activeUnit.assignmentRubric || ''}
                            onChange={(e) => setActiveUnit({ ...activeUnit, assignmentRubric: e.target.value })}
                            placeholder="e.g. Completeness (50%), Accuracy (30%), Formatting (20%)"
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900 leading-normal"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-700 block mb-1">Teacher Feedback Notes</label>
                          <textarea
                            rows={3}
                            value={activeUnit.assignmentTeacherFeedback || ''}
                            onChange={(e) => setActiveUnit({ ...activeUnit, assignmentTeacherFeedback: e.target.value })}
                            placeholder="Provide descriptive feedback for student submission..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-hidden focus:border-sky-500 transition-all font-medium text-slate-900 leading-normal"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              ) : (
                // STUDENT PREVIEW TAB PANEL
                <div className="space-y-5">
                  <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600 shrink-0 animate-bounce" />
                    <p className="text-[10px] text-sky-800 font-semibold">
                      This shows how this learning unit displays to registered students inside the curriculum view.
                    </p>
                  </div>

                  {activeUnit.type === 'Video' && (
                    <div className="space-y-4">
                      {activeUnit.videoUrl ? (
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
                          <iframe
                            src={getEmbedUrl(activeUnit.videoUrl)}
                            title={activeUnit.title}
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full rounded-2xl flex flex-col items-center justify-center bg-slate-900 text-slate-400 border border-slate-800">
                          <Play className="w-12 h-12 text-slate-600 mb-2 animate-pulse" />
                          <span className="text-xs font-semibold">No Video URL Configured</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <h4 className="font-heading font-extrabold text-sm text-slate-900">
                          {activeUnit.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          ESTIMATED DURATION: {activeUnit.duration}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                          {activeUnit.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeUnit.type === 'Reading' && (
                    <div className="space-y-4">
                      {/* Reading Time Badge */}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 font-mono bg-slate-100 border py-1.5 px-3 rounded-xl w-fit">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>ESTIMATED DURATION: {activeUnit.duration} ({getEstimatedReadingTime(activeUnit.readingContent || '')})</span>
                      </div>

                      {/* Scrollable Reader Container */}
                      <div className="p-6 sm:p-7 rounded-3xl bg-amber-50/15 border border-amber-100/70 shadow-3xs max-h-[500px] overflow-y-auto pr-3 select-text leading-relaxed">
                        {activeUnit.readingContent ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(activeUnit.readingContent) }}
                            className="text-xs text-slate-800 space-y-3 font-medium select-text"
                          />
                        ) : (
                          <p className="text-slate-400 italic font-medium">No reading text configured. Write your study notes in the edit tab.</p>
                        )}
                      </div>

                      <div className="space-y-1 bg-slate-50 border p-4 rounded-2xl">
                        <h5 className="font-heading font-bold text-xs text-slate-800">
                          {activeUnit.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          {activeUnit.description || 'No description.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeUnit.type === 'Quiz' && (
                    <div className="space-y-5">
                      {/* Quiz Banner & Meta Badges */}
                      <div className="p-4 rounded-2xl bg-emerald-50/20 border border-emerald-100 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                            DIFFICULTY: {activeUnit.quizDifficulty || 'Medium'}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono">
                            PASSING SCORE: {activeUnit.quizPassingScore || 70}%
                          </span>
                        </div>

                        {/* Live Timer Countdown */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-mono bg-white border border-slate-200 shadow-3xs py-1.5 px-3 rounded-xl">
                          <Clock className={`w-3.5 h-3.5 ${quizTimeRemaining < 60 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
                          <span className={quizTimeRemaining < 60 ? 'text-rose-600 font-bold' : ''}>
                            {quizSubmitted ? 'Timer Stopped' : formatQuizTime(quizTimeRemaining)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 border-b pb-3">
                        <h4 className="font-heading font-extrabold text-sm text-slate-900">
                          {activeUnit.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          {activeUnit.description || 'Practice quiz evaluation.'}
                        </p>
                      </div>

                      {(!activeUnit.quizQuestions || activeUnit.quizQuestions.length === 0) ? (
                        <p className="text-xs text-slate-400 italic">No questions defined in this quiz.</p>
                      ) : (
                        <div className="space-y-5">
                          {activeUnit.quizQuestions.map((q, qIdx) => {
                            const selectedIdx = quizSelectedAnswers[q.id];
                            return (
                              <div key={q.id} className="space-y-3 p-4 rounded-2xl border bg-slate-50/40">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-bold text-slate-900 leading-relaxed">
                                    {qIdx + 1}. {q.questionText}
                                  </h5>
                                  <span className="text-[9px] font-bold text-slate-400 font-mono">
                                    {q.marks || 5} Marks
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {q.options.map((opt, optIdx) => {
                                    const isSelected = selectedIdx === optIdx;
                                    const isCorrect = q.correctAnswerIndex === optIdx;
                                    
                                    let btnStyles = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';
                                    if (quizSubmitted) {
                                      if (isCorrect) {
                                        btnStyles = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold';
                                      } else if (isSelected) {
                                        btnStyles = 'border-rose-300 bg-rose-50 text-rose-900 font-bold';
                                      } else {
                                        btnStyles = 'border-slate-100 bg-slate-50 text-slate-400';
                                      }
                                    } else if (isSelected) {
                                      btnStyles = 'border-sky-500 bg-sky-50 text-sky-800 font-bold';
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        disabled={quizSubmitted}
                                        onClick={() => setQuizSelectedAnswers({ ...quizSelectedAnswers, [q.id]: optIdx })}
                                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyles}`}
                                      >
                                        <span>{opt}</span>
                                        {quizSubmitted && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                        {quizSubmitted && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Explanation block shown post-submission */}
                                {quizSubmitted && q.explanation && (
                                  <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-700 leading-relaxed font-medium">
                                    <strong className="text-slate-800 block mb-0.5 font-bold">Explanation:</strong>
                                    {q.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          <div className="pt-2 flex items-center justify-between">
                            {quizSubmitted ? (
                              (() => {
                                const totalQuizMarks = activeUnit.quizQuestions.reduce((acc, q) => acc + (q.marks || 5), 0);
                                const scoredMarks = activeUnit.quizQuestions.reduce((acc, q) => {
                                  return acc + (quizSelectedAnswers[q.id] === q.correctAnswerIndex ? (q.marks || 5) : 0);
                                }, 0);
                                const percentage = totalQuizMarks > 0 ? Math.round((scoredMarks / totalQuizMarks) * 100) : 0;
                                const isPassed = percentage >= (activeUnit.quizPassingScore || 70);

                                return (
                                  <div className="w-full space-y-3">
                                    <div className={`p-4 rounded-xl border flex items-center justify-between ${
                                      isPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                                    }`}>
                                      <div className="space-y-0.5">
                                        <span className="text-xs font-extrabold block">
                                          {isPassed ? 'Passed!' : 'Try Again'}
                                        </span>
                                        <span className="text-[10px] font-bold font-mono">
                                          Score: {scoredMarks} / {totalQuizMarks} ({percentage}%) — Required: {activeUnit.quizPassingScore || 70}%
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={startQuizSimulation}
                                        className="btn-blue-primary text-[10px] py-2 px-3 font-bold"
                                      >
                                        Retry Simulation
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setQuizSubmitted(true);
                                  setQuizTimerActive(false);

                                  // Save score to localStorage for Student Dashboard
                                  const totalQuizMarks = activeUnit.quizQuestions?.reduce((acc: number, q: any) => acc + (q.marks || 5), 0) || 0;
                                  const scoredMarks = activeUnit.quizQuestions?.reduce((acc: number, q: any) => {
                                    return acc + (quizSelectedAnswers[q.id] === q.correctAnswerIndex ? (q.marks || 5) : 0);
                                  }, 0) || 0;
                                  const percentage = totalQuizMarks > 0 ? Math.round((scoredMarks / totalQuizMarks) * 100) : 0;
                                  
                                  localStorage.setItem(`lms_quiz_score_${activeUnit.id}`, JSON.stringify({
                                    score: scoredMarks,
                                    total: totalQuizMarks,
                                    percentage,
                                    date: new Date().toLocaleDateString('en-US')
                                  }));
                                }}
                                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                Submit Quiz Answers
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeUnit.type === 'Assignment' && (
                    <div className="space-y-4">
                      {/* Assignment Meta Header */}
                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-200/50 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Assignment Scope</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            activeUnit.assignmentSubmissionStatus === 'Graded'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : activeUnit.assignmentSubmissionStatus === 'Submitted'
                              ? 'bg-sky-50 border-sky-200 text-sky-800'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            STATUS: {activeUnit.assignmentSubmissionStatus || 'Not Submitted'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-2.5">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold text-slate-400 uppercase block">Max Score</span>
                            <span className="text-xs font-extrabold text-slate-800">{activeUnit.assignmentMaxMarks || 100} pts</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold text-slate-400 uppercase block">Deadline</span>
                            <span className="text-xs font-extrabold text-slate-800 truncate block max-w-full">{activeUnit.assignmentDeadline || '7 Days'}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold text-slate-400 uppercase block">Formats</span>
                            <span className="text-xs font-extrabold text-slate-800">{activeUnit.assignmentAllowedTypes || 'Any'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reference Files List */}
                      {activeUnit.assignmentReferenceFiles && (
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Attachment Resources</span>
                          <div className="flex flex-wrap gap-2">
                            {activeUnit.assignmentReferenceFiles.split(',').map((file, idx) => {
                              const cleanName = file.trim();
                              if (!cleanName) return null;
                              return (
                                <a
                                  key={idx}
                                  href="#"
                                  onClick={(e) => { e.preventDefault(); toast.success(`Simulating download: ${cleanName}`); }}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-sky-700 bg-white border border-slate-200 hover:border-sky-200 shadow-3xs py-1 px-2.5 rounded-lg transition-all"
                                >
                                  <FileText className="w-3 h-3 text-sky-500" />
                                  <span>{cleanName}</span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Instructions reader */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Instructions Guidelines</span>
                        <div
                          dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(activeUnit.assignmentInstructions || '') }}
                          className="text-xs text-slate-800 leading-relaxed font-medium"
                        />
                      </div>

                      {/* Grading Rubric Card */}
                      {activeUnit.assignmentRubric && (
                        <div className="p-4 rounded-xl border border-slate-200/60 bg-white space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Grading Rubric</span>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {activeUnit.assignmentRubric}
                          </p>
                        </div>
                      )}

                      {/* Submission Upload Action Area */}
                      <div className="border border-dashed border-sky-300 bg-sky-50/10 p-6 rounded-2xl text-center space-y-2">
                        <FileText className="w-8 h-8 text-sky-500 mx-auto" />
                        <div>
                          <span className="text-xs font-bold text-sky-800 hover:underline cursor-pointer">
                            Click to upload response document
                          </span>{' '}
                          <span className="text-xs text-slate-500">
                            or drag and drop your files ({activeUnit.assignmentAllowedTypes || 'PDF, ZIP'})
                          </span>
                        </div>
                      </div>

                      {/* Teacher Feedback Card */}
                      {activeUnit.assignmentTeacherFeedback && (
                        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide">Instructor Evaluations Feedback</span>
                          </div>
                          <p className="text-xs text-indigo-950 font-medium leading-relaxed pt-0.5">
                            {activeUnit.assignmentTeacherFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation and Completion Actions */}
                  <div className="pt-5 border-t border-slate-100 space-y-3 mt-6">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(activeUnit.id)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        completedUnitIds[activeUnit.id]
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-900 text-white border-transparent hover:bg-slate-800'
                      }`}
                    >
                      {completedUnitIds[activeUnit.id] ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Completed (Undo)</span>
                        </>
                      ) : (
                        <span>Mark Complete</span>
                      )}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={prevUnitIndex === -1}
                        onClick={navigateToPrevUnit}
                        className={`flex-1 py-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                          prevUnitIndex === -1
                            ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Previous Lesson
                      </button>
                      <button
                        type="button"
                        disabled={nextUnitIndex === -1}
                        onClick={navigateToNextUnit}
                        className={`flex-1 py-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                          nextUnitIndex === -1
                            ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Next Lesson
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            {!isStudentPreviewMode ? (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleDeleteUnitDrawer}
                  className="py-2.5 px-3.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                  title="Delete Unit from course curriculum"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setActiveUnit(null);
                    }}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveUnitDrawer}
                    className="btn-blue-primary text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setActiveUnit(null);
                  }}
                  className="py-2.5 px-6 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Close Lesson Viewer
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {/* Certificate Modal */}
      {certificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Configure & Generate Certificate</span>
              </h3>
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={certStudentName}
                  onChange={(e) => setCertStudentName(e.target.value)}
                  placeholder="Enter your name as it should appear..."
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-bold"
                />
              </div>

              {/* Certificate Preview Box */}
              <div className="border-4 border-amber-500 rounded-2xl p-6 bg-amber-50/5 relative text-center space-y-6 select-none overflow-hidden max-w-full font-sans">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 font-mono">Kaizen Q Academy</span>
                  <h4 className="font-serif text-xl sm:text-2xl font-extrabold text-amber-800 leading-tight">Certificate of Completion</h4>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Enterprise Learning Credential</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 italic block">This is proudly presented to</span>
                  <span className="font-serif text-2xl font-extrabold text-slate-950 border-b border-slate-200 pb-1.5 px-6 inline-block min-w-[200px]">
                    {certStudentName || 'Your Name'}
                  </span>
                  <p className="text-[10px] text-slate-500 max-w-md mx-auto leading-relaxed">
                    for successfully mastering all modules, labs, and evaluation milestones for the course track
                  </p>
                  <span className="text-xs font-extrabold text-slate-800 block uppercase tracking-wide">
                    {course.title}
                  </span>
                </div>

                <div className="flex items-end justify-between pt-4 text-[9px] font-bold text-slate-450">
                  <div className="text-center w-1/3">
                    <span className="text-slate-800 block text-[10px] font-semibold">{course.instructor}</span>
                    <span className="border-t border-slate-200 pt-1 block uppercase tracking-wider">Lead Instructor</span>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-double border-amber-500 bg-amber-50 flex items-center justify-center text-[8px] font-extrabold text-amber-800 uppercase tracking-wider shrink-0 shadow-sm mx-auto">
                    Seal
                  </div>
                  <div className="text-center w-1/3">
                    <span className="text-slate-800 block text-[10px] font-semibold">Kaizen Q Board</span>
                    <span className="border-t border-slate-200 pt-1 block uppercase tracking-wider">Academic Registrar</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 border-t border-slate-100 pt-3">
                  <span>DATE: {certCompletionDate}</span>
                  <span>ID: {certUniqueId}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCertificateModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <span>Print / Save PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseDetails;
