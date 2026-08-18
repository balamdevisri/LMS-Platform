import React, { useState, useEffect } from 'react';
import { useCourses } from '@/contexts/CourseContext';
import type { ModuleItem, TopicItem, LearningUnitItem } from '@/contexts/CourseContext';
import {
  Folder,
  FolderOpen,
  FileText,
  FileVideo,
  FileCheck2,
  Layers,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Eye,
  Search,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileCode,
  Save,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ContentService,
  LessonEditorService,
  MediaService,
  PublishService
} from '@/services/contentManagementService';
import type { ResourceItem } from '@/services/contentManagementService';
import { sanitizeAdminInput, sanitizeMarkdownContent } from '@/utils/adminDataSanitizer';

// Initialize services
const contentService = new ContentService();
const editorService = new LessonEditorService();
const mediaService = new MediaService();
const publishService = new PublishService();

export const AdminContentManagement: React.FC = () => {
  const { courses, updateCourse } = useCourses();

  // Active state selections
  const [selectedCourseId, setSelectedCourseId] = useState<string | number>('');
  const [selectedLesson, setSelectedLesson] = useState<LearningUnitItem | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  // Expanded syllabus nodes mapping
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Tree search/filter variables
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterWarning, setFilterWarning] = useState<string>('all');

  // Bulk selections
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());

  // Editor Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'video' | 'reading' | 'resources' | 'quiz' | 'assignment' | 'practice-lab' | 'ai' | 'settings'>('overview');

  // Autosave Status: 'idle' | 'saving' | 'saved'
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Find active course record
  const activeCourse = courses.find(c => String(c.id) === String(selectedCourseId)) || courses[0];

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses]);

  // Expand module if lesson selected
  const handleSelectLesson = (lesson: LearningUnitItem, mId: string, tId: string) => {
    setSelectedLesson({ ...lesson });
    setActiveModuleId(mId);
    setActiveTopicId(tId);
  };

  // Helper to commit edits to context
  const saveLessonEdits = (updatedLesson: LearningUnitItem) => {
    if (!activeCourse || !activeModuleId || !activeTopicId) return;

    const sanitized: LearningUnitItem = {
      ...updatedLesson,
      title: sanitizeAdminInput(updatedLesson.title),
      description: sanitizeAdminInput(updatedLesson.description),
      readingContent: updatedLesson.readingContent ? sanitizeMarkdownContent(updatedLesson.readingContent) : updatedLesson.readingContent,
      assignmentInstructions: updatedLesson.assignmentInstructions ? sanitizeMarkdownContent(updatedLesson.assignmentInstructions) : updatedLesson.assignmentInstructions,
      videoUrl: sanitizeAdminInput(updatedLesson.videoUrl)
    };

    const nextModules = activeCourse.modules ? activeCourse.modules.map(m => {
      if (m.id !== activeModuleId) return m;

      const nextTopics = m.topics.map(t => {
        if (t.id !== activeTopicId) return t;

        const nextUnits = t.learningUnits.map(u => {
          if (u.id === sanitized.id) {
            return sanitized;
          }
          return u;
        });
        return { ...t, learningUnits: nextUnits };
      });
      return { ...m, topics: nextTopics };
    }) : [];

    updateCourse(activeCourse.id, { modules: nextModules });
  };

  // Autosave listener trigger
  const handleInputChange = (field: keyof LearningUnitItem, value: any) => {
    if (!selectedLesson) return;
    const updated = { ...selectedLesson, [field]: value };
    setSelectedLesson(updated);

    editorService.triggerAutosave(() => {
      saveLessonEdits(updated);
    }, setSaveStatus);
  };

  // Drag and drop / button reordering actions
  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    if (!activeCourse || !activeCourse.modules) return;
    const updated = contentService.reorderModule(activeCourse.modules, moduleId, direction);
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Module reordered successfully.');
  };

  const moveTopic = (mId: string, topicId: string, direction: 'up' | 'down') => {
    if (!activeCourse || !activeCourse.modules) return;
    const updated = activeCourse.modules.map(m => {
      if (m.id === mId) {
        return { ...m, topics: contentService.reorderTopic(m.topics, topicId, direction) };
      }
      return m;
    });
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Topic reordered successfully.');
  };

  const moveLesson = (mId: string, tId: string, lessonId: string, direction: 'up' | 'down') => {
    if (!activeCourse || !activeCourse.modules) return;
    const updated = activeCourse.modules.map(m => {
      if (m.id === mId) {
        const nextTopics = m.topics.map(t => {
          if (t.id === tId) {
            return { ...t, learningUnits: contentService.reorderLesson(t.learningUnits, lessonId, direction) };
          }
          return t;
        });
        return { ...m, topics: nextTopics };
      }
      return m;
    });
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Lesson reordered successfully.');
  };

  // Node deletion triggers
  const deleteModule = (moduleId: string) => {
    if (!activeCourse || !activeCourse.modules) return;
    const updated = activeCourse.modules.filter(m => m.id !== moduleId);
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Module deleted.');
  };

  const deleteTopic = (mId: string, topicId: string) => {
    if (!activeCourse || !activeCourse.modules) return;
    const updated = activeCourse.modules.map(m => {
      if (m.id === mId) {
        return { ...m, topics: m.topics.filter(t => t.id !== topicId) };
      }
      return m;
    });
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Topic deleted.');
  };

  const deleteLesson = (mId: string, tId: string, lessonId: string) => {
    if (!activeCourse || !activeCourse.modules) return;
    const updated = activeCourse.modules.map(m => {
      if (m.id === mId) {
        const nextTopics = m.topics.map(t => {
          if (t.id === tId) {
            return { ...t, learningUnits: t.learningUnits.filter(u => u.id !== lessonId) };
          }
          return t;
        });
        return { ...m, topics: nextTopics };
      }
      return m;
    });
    updateCourse(activeCourse.id, { modules: updated });
    if (selectedLesson?.id === lessonId) setSelectedLesson(null);
    toast.success('Lesson deleted.');
  };

  // Node duplications
  const duplicateLesson = (mId: string, tId: string, lesson: LearningUnitItem) => {
    if (!activeCourse || !activeCourse.modules) return;
    const duplicated: LearningUnitItem = {
      ...lesson,
      id: `copy_${Date.now()}_${lesson.id}`,
      title: `${lesson.title} (Copy)`,
      assignmentSubmissionStatus: undefined,
      assignmentTeacherFeedback: undefined
    };

    const updated = activeCourse.modules.map(m => {
      if (m.id === mId) {
        const nextTopics = m.topics.map(t => {
          if (t.id === tId) {
            return { ...t, learningUnits: [...t.learningUnits, duplicated] };
          }
          return t;
        });
        return { ...m, topics: nextTopics };
      }
      return m;
    });
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Lesson duplicated successfully.');
  };

  // Node additions
  const addModuleNode = () => {
    if (!activeCourse) return;
    const newMod: ModuleItem = {
      id: `mod_${Date.now()}`,
      title: 'New Course Module',
      description: 'Module Description',
      duration: '4 hours',
      topics: []
    };
    const updated = [...(activeCourse.modules || []), newMod];
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Added new Module.');
  };

  const addTopicNode = (mId: string) => {
    if (!activeCourse || !activeCourse.modules) return;
    const newTopic: TopicItem = {
      id: `topic_${Date.now()}`,
      title: 'New Syllabus Topic',
      description: 'Topic details',
      estimatedDuration: '45 mins',
      learningUnits: []
    };
    const updated = activeCourse.modules.map(m => {
      if (m.id === mId) {
        return { ...m, topics: [...m.topics, newTopic] };
      }
      return m;
    });
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Added new Topic.');
  };

  const addLessonNode = (mId: string, tId: string) => {
    if (!activeCourse || !activeCourse.modules) return;
    const newLesson: LearningUnitItem = {
      id: `lesson_${Date.now()}`,
      title: 'New Educational Lesson',
      description: 'Introduce your learners to this lesson topic.',
      duration: '15 mins',
      type: 'Reading',
      readingContent: '## New Lesson content\nWrite study guidelines here.'
    };
    const updated = activeCourse.modules.map(m => {
      if (m.id === mId) {
        const nextTopics = m.topics.map(t => {
          if (t.id === tId) {
            return { ...t, learningUnits: [...t.learningUnits, newLesson] };
          }
          return t;
        });
        return { ...m, topics: nextTopics };
      }
      return m;
    });
    updateCourse(activeCourse.id, { modules: updated });
    toast.success('Added new Lesson.');
  };

  // Bulk Actions
  const handleToggleBulkSelect = (lessonId: string) => {
    const next = new Set(selectedLessonIds);
    if (next.has(lessonId)) next.delete(lessonId);
    else next.add(lessonId);
    setSelectedLessonIds(next);
  };

  const handleBulkPublish = (status: 'Published' | 'Draft') => {
    if (!activeCourse || !activeCourse.modules || selectedLessonIds.size === 0) return;
    const updated = activeCourse.modules.map(m => {
      const nextTopics = m.topics.map(t => {
        const nextUnits = t.learningUnits.map(u => {
          if (selectedLessonIds.has(u.id)) {
            return { ...u, assignmentSubmissionStatus: status === 'Published' ? 'Published' : 'Draft' };
          }
          return u;
        });
        return { ...t, learningUnits: nextUnits };
      });
      return { ...m, topics: nextTopics };
    });
    updateCourse(activeCourse.id, { modules: updated });
    setSelectedLessonIds(new Set());
    toast.success(`Bulk updated ${selectedLessonIds.size} lessons to ${status}.`);
  };

  const handleBulkDelete = () => {
    if (!activeCourse || !activeCourse.modules || selectedLessonIds.size === 0) return;
    const updated = activeCourse.modules.map(m => {
      const nextTopics = m.topics.map(t => {
        return { ...t, learningUnits: t.learningUnits.filter(u => !selectedLessonIds.has(u.id)) };
      });
      return { ...m, topics: nextTopics };
    });
    updateCourse(activeCourse.id, { modules: updated });
    setSelectedLessonIds(new Set());
    setSelectedLesson(null);
    toast.success(`Bulk deleted ${selectedLessonIds.size} lessons.`);
  };

  // Resource handling states
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceCat, setNewResourceCat] = useState<'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'ZIP' | 'Image' | 'Source Code' | 'External Link'>('PDF');
  const newResourceSize = '1.5 MB';

  const addResourceToLesson = () => {
    if (!selectedLesson) return;
    const resList = (selectedLesson as any).resources || [];
    const newRes: ResourceItem = {
      id: `res_${Date.now()}`,
      name: newResourceName || 'Attached PDF Document',
      description: 'Study resource reference file',
      category: newResourceCat,
      fileSize: newResourceSize,
      downloadPermission: true
    };
    handleInputChange('resources' as any, [...resList, newRes]);
    setNewResourceName('');
    toast.success('Resource attached successfully.');
  };

  const deleteResource = (resId: string) => {
    if (!selectedLesson) return;
    const resList = (selectedLesson as any).resources || [];
    handleInputChange('resources' as any, resList.filter((r: any) => r.id !== resId));
    toast.success('Resource detached.');
  };

  // Quiz questions helper states
  const [newQuizQText, setNewQuizQText] = useState('');
  const newQuizOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
  const [newQuizCorrectIdx, setNewQuizCorrectIdx] = useState(0);

  const addQuizQuestion = () => {
    if (!selectedLesson) return;
    const qList = selectedLesson.quizQuestions || [];
    const newQ = {
      id: `q_${Date.now()}`,
      questionText: newQuizQText || 'Select the correct statement...',
      options: [...newQuizOptions],
      correctAnswerIndex: newQuizCorrectIdx,
      explanation: 'General conceptual review details.',
      marks: 5
    };
    handleInputChange('quizQuestions', [...qList, newQ]);
    setNewQuizQText('');
    toast.success('Quiz question added.');
  };

  // Practice test cases helper states
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcExpected, setNewTcExpected] = useState('');

  const addTestCase = () => {
    if (!selectedLesson) return;
    const challenge = (selectedLesson as any).practiceLabChallenge || {};
    const tcList = challenge.testCases || [];
    const newTc = {
      id: `tc_${Date.now()}`,
      input: newTcInput || '5',
      expectedOutput: newTcExpected || '["1","2","Fizz","4","Buzz"]',
      isPrivate: false
    };
    const updatedChallenge = { ...challenge, testCases: [...tcList, newTc] };
    handleInputChange('practiceLabChallenge' as any, updatedChallenge);
    setNewTcInput('');
    setNewTcExpected('');
    toast.success('Sandbox test case added.');
  };

  // Video URL parser
  const videoDetails = selectedLesson?.videoUrl ? mediaService.validateVideoUrl(selectedLesson.videoUrl) : null;

  // Reading Markdown injection utilities
  const insertMarkdown = (tag: string) => {
    const textarea = document.getElementById('readingTextarea') as HTMLTextAreaElement;
    if (!textarea || !selectedLesson) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    let replacement = '';
    switch (tag) {
      case 'heading': replacement = `\n## ${selected || 'Subheading'}\n`; break;
      case 'bold': replacement = `**${selected || 'bold text'}**`; break;
      case 'italic': replacement = `*${selected || 'italic text'}*`; break;
      case 'list': replacement = `\n- ${selected || 'item'}\n`; break;
      case 'code': replacement = `\n\`\`\`javascript\n${selected || '// code block'}\n\`\`\`\n`; break;
      case 'callout': replacement = `\n> [!NOTE]\n> ${selected || 'Callout information detail.'}\n`; break;
      case 'quote': replacement = `\n> "${selected || 'Quote'}"\n`; break;
      default: replacement = selected;
    }

    const updatedText = text.substring(0, start) + replacement + text.substring(end);
    handleInputChange('readingContent', updatedText);
    textarea.focus();
  };

  // Publish validation checklist
  const validationChecklist = selectedLesson ? publishService.validateLesson(selectedLesson) : [];
  const hasErrors = validationChecklist.some(v => v.status === 'error');

  return (
    <div className="space-y-8 font-['Sora'] text-slate-800 dark:text-slate-200 pb-12 select-text animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="border-b border-sky-100 dark:border-slate-800 pb-4 select-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-blue-600 dark:text-cyan-400" />
            <span>Enterprise Content Management (CMS)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage course modules, topics, lessons, sandboxes, resource files, and publications.
          </p>
        </div>

        {/* Course Select dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Active Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setSelectedLesson(null);
            }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-all cursor-pointer shadow-3xs"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="dark:bg-slate-900">
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. CMS WORKSPACE SPLIT PANES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT PANE: COURSE CONTENT EXPLORER ================= */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-5 shadow-3xs space-y-5 flex flex-col h-[750px] relative">
          
          {/* Header search & filters */}
          <div className="space-y-3.5 select-none shrink-0">
            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">Curriculum Explorer</h3>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search curriculum items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Tree Filters Swaps */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
              <div>
                <label className="text-slate-400 dark:text-slate-500 block mb-0.5 uppercase tracking-wide">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg p-1.5 focus:outline-hidden cursor-pointer"
                >
                  <option value="all" className="dark:bg-slate-900">All Types</option>
                  <option value="Video" className="dark:bg-slate-900">Video</option>
                  <option value="Reading" className="dark:bg-slate-900">Reading</option>
                  <option value="Quiz" className="dark:bg-slate-900">Quiz</option>
                  <option value="Assignment" className="dark:bg-slate-900">Assignment</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 dark:text-slate-500 block mb-0.5 uppercase tracking-wide">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg p-1.5 focus:outline-hidden cursor-pointer"
                >
                  <option value="all" className="dark:bg-slate-900">All Status</option>
                  <option value="Published" className="dark:bg-slate-900">Published</option>
                  <option value="Draft" className="dark:bg-slate-900">Draft</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 dark:text-slate-500 block mb-0.5 uppercase tracking-wide">Validation</label>
                <select
                  value={filterWarning}
                  onChange={(e) => setFilterWarning(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg p-1.5 focus:outline-hidden cursor-pointer"
                >
                  <option value="all" className="dark:bg-slate-900">All Warnings</option>
                  <option value="video" className="dark:bg-slate-900">Missing Video</option>
                  <option value="reading" className="dark:bg-slate-900">Missing Text</option>
                  <option value="quiz" className="dark:bg-slate-900">Missing Quiz</option>
                  <option value="assignment" className="dark:bg-slate-900">Missing Homework</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expandable Folder Hierarchy Scroll container */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 text-xs font-semibold">
            {activeCourse?.modules && activeCourse.modules.length > 0 ? (
              activeCourse.modules.map((m, mIdx) => {
                const isModExpanded = expandedModules[m.id] !== false;
                return (
                  <div key={m.id} className="border border-slate-150 dark:border-slate-800 rounded-2xl p-3 space-y-2 bg-slate-50/20 dark:bg-slate-950/30">
                    
                    {/* Module Row */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 select-none">
                      <button
                        onClick={() => setExpandedModules({ ...expandedModules, [m.id]: !isModExpanded })}
                        className="flex items-center gap-2 text-slate-900 dark:text-white font-bold hover:text-blue-600 dark:hover:text-cyan-400 transition-all cursor-pointer text-left flex-1"
                      >
                        {isModExpanded ? <FolderOpen className="w-4.5 h-4.5 text-blue-500 dark:text-cyan-400 shrink-0" /> : <Folder className="w-4.5 h-4.5 text-blue-500 dark:text-cyan-400 shrink-0" />}
                        <span className="truncate max-w-[180px]">{m.title}</span>
                      </button>

                      {/* Module control keys */}
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveModule(m.id, 'up')} disabled={mIdx === 0} className="p-1 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded disabled:opacity-30 cursor-pointer text-slate-500 dark:text-slate-400"><ChevronUp className="w-3.5 h-3.5" /></button>
                        <button onClick={() => moveModule(m.id, 'down')} disabled={mIdx === activeCourse.modules!.length - 1} className="p-1 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded disabled:opacity-30 cursor-pointer text-slate-500 dark:text-slate-400"><ChevronDown className="w-3.5 h-3.5" /></button>
                        <button onClick={() => addTopicNode(m.id)} title="Add Topic" className="p-1 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-cyan-400 text-slate-500 dark:text-slate-400 rounded cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteModule(m.id)} title="Delete Module" className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-slate-500 dark:text-slate-400 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    {/* Topics Wrapper */}
                    {isModExpanded && (
                      <div className="pl-3.5 space-y-2.5">
                        {m.topics && m.topics.length > 0 ? (
                          m.topics.map((t, tIdx) => {
                            const isTopicExpanded = expandedTopics[t.id] !== false;
                            return (
                              <div key={t.id} className="border-l-2 border-slate-200 dark:border-slate-700 pl-2.5 space-y-2">
                                
                                {/* Topic Row */}
                                <div className="flex items-center justify-between gap-2 select-none">
                                  <button
                                    onClick={() => setExpandedTopics({ ...expandedTopics, [t.id]: !isTopicExpanded })}
                                    className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-all cursor-pointer text-left flex-1"
                                  >
                                    {isTopicExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                    <span className="truncate max-w-[140px]">{t.title}</span>
                                  </button>

                                  {/* Topic control keys */}
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => moveTopic(m.id, t.id, 'up')} disabled={tIdx === 0} className="p-1 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded disabled:opacity-30 cursor-pointer text-slate-500 dark:text-slate-400"><ChevronUp className="w-3 h-3" /></button>
                                    <button onClick={() => moveTopic(m.id, t.id, 'down')} disabled={tIdx === m.topics.length - 1} className="p-1 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded disabled:opacity-30 cursor-pointer text-slate-500 dark:text-slate-400"><ChevronDown className="w-3 h-3" /></button>
                                    <button onClick={() => addLessonNode(m.id, t.id)} title="Add Lesson" className="p-1 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-cyan-400 text-slate-500 dark:text-slate-400 rounded cursor-pointer"><Plus className="w-3 h-3" /></button>
                                    <button onClick={() => deleteTopic(m.id, t.id)} title="Delete Topic" className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-slate-500 dark:text-slate-400 rounded cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                </div>

                                {/* Lessons Wrapper */}
                                {isTopicExpanded && (
                                  <div className="pl-3.5 space-y-1.5">
                                    {t.learningUnits && t.learningUnits.length > 0 ? (
                                      t.learningUnits.map((u, uIdx) => {
                                        const isSelected = selectedLesson?.id === u.id;
                                        const isChecked = selectedLessonIds.has(u.id);
                                        
                                        // Simple checklist check for explorer warnings
                                        const hasWarn = !u.title || !u.description || (u.type === 'Video' && !u.videoUrl) || (u.type === 'Quiz' && (!u.quizQuestions || u.quizQuestions.length === 0));

                                        return (
                                          <div
                                            key={u.id}
                                            className={`group p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                              isSelected 
                                                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-cyan-300' 
                                                : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggleBulkSelect(u.id)}
                                                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer shrink-0"
                                              />
                                              
                                              <button
                                                onClick={() => handleSelectLesson(u, m.id, t.id)}
                                                className="flex items-center gap-1.5 font-medium text-left truncate cursor-pointer text-xs"
                                              >
                                                {u.type === 'Video' ? <FileVideo className="w-3.5 h-3.5 text-blue-500 shrink-0" /> : u.type === 'Quiz' ? <FileCheck2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />}
                                                <span className="truncate max-w-[120px]">{u.title}</span>
                                              </button>
                                            </div>

                                            {/* Status indicator and actions */}
                                            <div className="flex items-center gap-1 select-none">
                                              {hasWarn && <span title="Missing required content details"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /></span>}
                                              
                                              {/* Tiny reorder and copy/delete options */}
                                              <div className="hidden group-hover:flex items-center gap-0.5">
                                                <button onClick={() => moveLesson(m.id, t.id, u.id, 'up')} disabled={uIdx === 0} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-20 cursor-pointer text-slate-500 dark:text-slate-400"><ChevronUp className="w-3 h-3" /></button>
                                                <button onClick={() => moveLesson(m.id, t.id, u.id, 'down')} disabled={uIdx === t.learningUnits.length - 1} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-20 cursor-pointer text-slate-500 dark:text-slate-400"><ChevronDown className="w-3 h-3" /></button>
                                                <button onClick={() => duplicateLesson(m.id, t.id, u)} title="Duplicate" className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer"><Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /></button>
                                                <button onClick={() => deleteLesson(m.id, t.id, u.id)} title="Delete" className="p-0.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-rose-500" /></button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No lessons</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No topics</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 dark:text-slate-500 italic">No modules exist. Create a new module to start building syllabus tracks.</p>
            )}
          </div>

          {/* Sticky Bottom bulk actions panel */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 select-none flex items-center justify-between gap-2 shrink-0">
            <button
              onClick={addModuleNode}
              className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Module</span>
            </button>

            {selectedLessonIds.size > 0 && (
              <div className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-1 text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400 px-1">{selectedLessonIds.size} checked</span>
                <button
                  onClick={() => handleBulkPublish('Published')}
                  className="py-1 px-2 hover:bg-white dark:hover:bg-slate-850 text-emerald-700 dark:text-emerald-400 hover:border-slate-350 border border-transparent rounded cursor-pointer"
                >
                  Publish
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="py-1 px-2 hover:bg-white dark:hover:bg-slate-850 text-rose-700 dark:text-rose-400 hover:border-slate-350 border border-transparent rounded cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANE: LESSON CONTENT EDITOR ================= */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden flex flex-col h-[750px]">
          
          {!selectedLesson ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 select-none">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-slate-950 border border-blue-100 dark:border-slate-800 flex items-center justify-center text-blue-500 dark:text-cyan-400">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="font-heading font-extrabold text-sm text-slate-800 dark:text-slate-200">No Lesson Selected</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
                  Select a syllabus unit from the explorer hierarchy on the left, or add modules and topics to start structuring content.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between h-full">
              
              {/* Sticky Top editor toolbar */}
              <div className="bg-slate-50/50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 p-4 select-none shrink-0 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">Currently Editing</span>
                  <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white truncate max-w-sm">{selectedLesson.title}</h4>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold select-none">
                  {/* Validation checklist status */}
                  <div className="relative group">
                    <button className="py-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      {hasErrors ? <AlertCircle className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      <span>Checks</span>
                    </button>
                    
                    {/* Hover dropdown list of checks */}
                    <div className="hidden group-hover:block absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl p-3.5 z-40 space-y-2 leading-relaxed text-left text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-1">Publication Checklist</span>
                      {validationChecklist.map((v) => (
                        <div key={v.id} className="flex items-start gap-1.5">
                          {v.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> : v.status === 'warning' ? <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />}
                          <div>
                            <strong className="text-slate-800 dark:text-slate-200">{v.label}</strong>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{v.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Saving status indicator */}
                  <span className={`font-medium ${
                    saveStatus === 'saving' ? 'text-blue-500 font-bold animate-pulse' : saveStatus === 'saved' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-450 dark:text-slate-500'
                  }`}>
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Autosaved'}
                  </span>
                </div>
              </div>

              {/* Editor Tabs switcher */}
              <div className="flex bg-slate-50/30 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold overflow-x-auto gap-1 p-1 scrollbar-none select-none shrink-0">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'video', label: 'Video' },
                  { id: 'reading', label: 'Reading Content' },
                  { id: 'resources', label: 'Resources' },
                  { id: 'quiz', label: 'Quiz' },
                  { id: 'assignment', label: 'Assignment' },
                  { id: 'practice-lab', label: 'Practice Lab' },
                  { id: 'ai', label: 'AI Context' },
                  { id: 'settings', label: 'Settings' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-1.5 px-3 rounded-lg cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                      activeTab === tab.id ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-3xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Tab Editor Forms */}
              <div className="flex-1 overflow-y-auto p-5 text-xs font-semibold space-y-4">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 block mb-1">Lesson Title</label>
                        <input
                          type="text"
                          value={selectedLesson.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 block mb-1">Estimated Duration</label>
                        <input
                          type="text"
                          value={selectedLesson.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-500 dark:text-slate-400 block mb-1">Lesson Summary / Description</label>
                      <textarea
                        value={selectedLesson.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 block mb-1">Difficulty level</label>
                        <select
                          value={(selectedLesson as any).quizDifficulty || 'Medium'}
                          onChange={(e) => handleInputChange('quizDifficulty', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden cursor-pointer"
                        >
                          <option value="Easy" className="dark:bg-slate-900">Easy</option>
                          <option value="Medium" className="dark:bg-slate-900">Medium</option>
                          <option value="Hard" className="dark:bg-slate-900">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 block mb-1">Content Delivery Type</label>
                        <select
                          value={selectedLesson.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden cursor-pointer"
                        >
                          <option value="Video" className="dark:bg-slate-900">Video</option>
                          <option value="Reading" className="dark:bg-slate-900">Reading</option>
                          <option value="Quiz" className="dark:bg-slate-900">Quiz</option>
                          <option value="Assignment" className="dark:bg-slate-900">Assignment</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. VIDEO TAB */}
                {activeTab === 'video' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 block mb-1">Streaming Video URL (YouTube / Vimeo)</label>
                      <input
                        type="text"
                        value={selectedLesson.videoUrl || ''}
                        onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden"
                      />
                      {selectedLesson.videoUrl && videoDetails && !videoDetails.isValid && (
                        <span className="text-[10px] font-bold text-rose-600 block mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Invalid Streaming Link structure. Must match YouTube/Vimeo.</span>
                      )}
                    </div>

                    {selectedLesson.videoUrl && videoDetails && videoDetails.isValid && (
                      <div className="space-y-2">
                        <label className="text-slate-500 dark:text-slate-400 block">Streaming Preview Player</label>
                        <div className="aspect-video w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-900 relative select-none">
                          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-10 px-4 py-2 flex items-center justify-between pointer-events-auto">
                            <span className="px-2.5 py-0.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 text-[10px] font-extrabold">
                              SHAIVIKA PLAYER
                            </span>
                            <span className="text-xs font-bold text-white truncate max-w-xs">{selectedLesson.title}</span>
                          </div>
                          <iframe
                            title="Video Preview"
                            src={videoDetails.embedUrl}
                            className="w-full h-full border-none"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800 rounded-2xl flex items-center justify-between select-none">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Media Asset Upload (Cloud integration placeholder)</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Select and drag raw MP4 video structures directly to stream.</p>
                      </div>
                      <button type="button" onClick={() => toast.info('Cloud S3/Firebase upload interface invoked (placeholder).')} className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer hover:border-slate-400 dark:hover:border-slate-600">
                        <UploadCloud className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                        <span>Upload Video</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. READING CONTENT TAB */}
                {activeTab === 'reading' && (
                  <div className="space-y-3.5 animate-in fade-in duration-200 h-full flex flex-col">
                    {/* Markdown buttons toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 select-none shrink-0">
                      {[
                        { id: 'heading', label: 'Heading' },
                        { id: 'bold', label: 'Bold' },
                        { id: 'italic', label: 'Italic' },
                        { id: 'list', label: 'List' },
                        { id: 'code', label: 'Code' },
                        { id: 'callout', label: 'Callout' },
                        { id: 'quote', label: 'Quote' }
                      ].map(act => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => insertMarkdown(act.id)}
                          className="py-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-3xs"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      id="readingTextarea"
                      value={selectedLesson.readingContent || ''}
                      onChange={(e) => handleInputChange('readingContent', e.target.value)}
                      rows={14}
                      placeholder="Write rich markdown course materials here..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-3.5 focus:outline-hidden font-mono text-[11px] leading-relaxed flex-1"
                    />
                  </div>
                )}

                {/* 4. RESOURCES TAB */}
                {activeTab === 'resources' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <label className="text-slate-500 dark:text-slate-400 block">Attached Resource Files</label>
                      
                      {!(selectedLesson as any).resources || (selectedLesson as any).resources.length === 0 ? (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No resources attached to this lesson.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
                          {((selectedLesson as any).resources as ResourceItem[]).map((res) => (
                            <div key={res.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileCode className="w-4 h-4 text-blue-500 dark:text-cyan-400 shrink-0" />
                                <div className="min-w-0">
                                  <span className="block truncate text-slate-800 dark:text-slate-200 text-[11px]">{res.name}</span>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block">{res.category} • {res.fileSize}</span>
                                </div>
                              </div>
                              <button onClick={() => deleteResource(res.id)} className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Form to attach resource */}
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 select-none">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Attach New Resource Asset</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="File Name (e.g. cheat-sheet.pdf)"
                          value={newResourceName}
                          onChange={(e) => setNewResourceName(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 focus:outline-hidden"
                        />
                        <select
                          value={newResourceCat}
                          onChange={(e) => setNewResourceCat(e.target.value as any)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 focus:outline-hidden cursor-pointer"
                        >
                          <option value="PDF" className="dark:bg-slate-900">PDF Document</option>
                          <option value="DOCX" className="dark:bg-slate-900">Word Document</option>
                          <option value="ZIP" className="dark:bg-slate-900">ZIP Archive</option>
                          <option value="Source Code" className="dark:bg-slate-900">Source Code File</option>
                          <option value="External Link" className="dark:bg-slate-900">External URL Link</option>
                        </select>
                        <button
                          type="button"
                          onClick={addResourceToLesson}
                          className="bg-slate-900 dark:bg-sky-600 hover:bg-slate-850 dark:hover:bg-sky-500 text-white font-bold rounded-lg py-2 cursor-pointer shadow-sm text-center"
                        >
                          Attach Resource
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. QUIZ TAB */}
                {activeTab === 'quiz' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center select-none">
                        <label className="text-slate-500 dark:text-slate-400 block">Graded Assessment Questions</label>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-bold font-mono">
                          Passing score: {selectedLesson.quizPassingScore || 70}%
                        </span>
                      </div>

                      {!selectedLesson.quizQuestions || selectedLesson.quizQuestions.length === 0 ? (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No questions currently attached to this quiz.</p>
                      ) : (
                        <div className="space-y-2 select-text">
                          {selectedLesson.quizQuestions.map((q, idx) => (
                            <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1.5 relative">
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono font-bold">QUESTION {idx + 1}</span>
                              <p className="text-slate-800 dark:text-slate-200 font-bold text-[11px] pr-8">{q.questionText}</p>
                              
                              <div className="pl-3.5 space-y-0.5 font-medium text-slate-500 dark:text-slate-400">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${oIdx === q.correctAnswerIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                    <span className={oIdx === q.correctAnswerIndex ? 'text-emerald-700 dark:text-emerald-400 font-bold' : ''}>{opt}</span>
                                  </div>
                                ))}
                              </div>

                              <button
                                onClick={() => handleInputChange('quizQuestions', selectedLesson.quizQuestions!.filter(item => item.id !== q.id))}
                                className="absolute right-3 top-3 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded cursor-pointer"
                                title="Remove Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Question Builder */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3.5 select-none">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Append New Quiz Question</span>
                      <textarea
                        placeholder="Question Prompt Text (e.g. What is the standard configuration file for SSH?)"
                        value={newQuizQText}
                        onChange={(e) => setNewQuizQText(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 focus:outline-hidden"
                      />

                      <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                        <div>
                          <label className="text-slate-400 dark:text-slate-500 block mb-0.5">Correct Option Index</label>
                          <select
                            value={newQuizCorrectIdx}
                            onChange={(e) => setNewQuizCorrectIdx(parseInt(e.target.value, 10))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 focus:outline-hidden cursor-pointer"
                          >
                            <option value={0} className="dark:bg-slate-900">Option 1 (Index 0)</option>
                            <option value={1} className="dark:bg-slate-900">Option 2 (Index 1)</option>
                            <option value={2} className="dark:bg-slate-900">Option 3 (Index 2)</option>
                            <option value={3} className="dark:bg-slate-900">Option 4 (Index 3)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={addQuizQuestion}
                          className="h-10 self-end bg-slate-900 dark:bg-sky-600 hover:bg-slate-850 dark:hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer shadow-sm text-center"
                        >
                          Append Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ASSIGNMENT TAB */}
                {activeTab === 'assignment' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 block mb-1">Homework Instructions (Markdown supported)</label>
                      <textarea
                        value={selectedLesson.assignmentInstructions || ''}
                        onChange={(e) => handleInputChange('assignmentInstructions', e.target.value)}
                        rows={6}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 block mb-1">Maximum Grades / Marks</label>
                        <input
                          type="number"
                          value={selectedLesson.assignmentMaxMarks || 100}
                          onChange={(e) => handleInputChange('assignmentMaxMarks', parseInt(e.target.value, 10) || 100)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 block mb-1">Allowed Upload Formats</label>
                        <input
                          type="text"
                          value={selectedLesson.assignmentAllowedTypes || 'ZIP, PDF, TXT'}
                          onChange={(e) => handleInputChange('assignmentAllowedTypes', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 dark:text-slate-400 block mb-1">Due Deadline Period</label>
                        <input
                          type="text"
                          value={selectedLesson.assignmentDeadline || '7 days'}
                          onChange={(e) => handleInputChange('assignmentDeadline', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-500 dark:text-slate-400 block mb-1">Grading Rubric Matrix Details</label>
                      <textarea
                        value={selectedLesson.assignmentRubric || ''}
                        onChange={(e) => handleInputChange('assignmentRubric', e.target.value)}
                        placeholder="Completeness (50%), Accuracy (30%), Formatting (20%)"
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* 7. PRACTICE LAB TAB */}
                {activeTab === 'practice-lab' && (() => {
                  const challenge = (selectedLesson as any).practiceLabChallenge || {
                    id: `challenge_${selectedLesson.id}`,
                    title: `Lab: ${selectedLesson.title}`,
                    difficulty: 'Medium',
                    topic: 'Practical evaluation',
                    starterCode: 'function solve() {\n  // Write code here\n}',
                    testCases: []
                  };

                  const updateChallengeField = (field: string, val: any) => {
                    const nextCh = { ...challenge, [field]: val };
                    handleInputChange('practiceLabChallenge' as any, nextCh);
                  };

                  return (
                    <div className="space-y-4 animate-in fade-in duration-200 text-slate-800 dark:text-slate-200">
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-slate-550 dark:text-slate-400 block mb-1">Coding Challenge Title</label>
                          <input
                            type="text"
                            value={challenge.title}
                            onChange={(e) => updateChallengeField('title', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-555 dark:text-slate-400 block mb-1">Difficulty level</label>
                          <select
                            value={challenge.difficulty}
                            onChange={(e) => updateChallengeField('difficulty', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden text-xs font-semibold cursor-pointer"
                          >
                            <option value="Easy" className="dark:bg-slate-900">Easy</option>
                            <option value="Medium" className="dark:bg-slate-900">Medium</option>
                            <option value="Hard" className="dark:bg-slate-900">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-550 dark:text-slate-400 block mb-1">Starter Code Template</label>
                        <textarea
                          value={challenge.starterCode}
                          onChange={(e) => updateChallengeField('starterCode', e.target.value)}
                          rows={6}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden font-mono text-[11px]"
                        />
                      </div>

                      {/* Test cases list */}
                      <div className="space-y-2 select-none">
                        <label className="text-slate-550 dark:text-slate-400 block font-semibold">Compiler Test Cases</label>
                        
                        {challenge.testCases.length === 0 ? (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No compiler test cases. Add one below.</p>
                        ) : (
                          <div className="space-y-2">
                            {challenge.testCases.map((tc: any, idx: number) => (
                              <div key={tc.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 text-[11px]">
                                <div>
                                  <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">CASE #{idx+1}:</span>
                                  <span className="ml-1.5 text-slate-500 dark:text-slate-400">Input: <code className="bg-white dark:bg-slate-900 px-1 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">{tc.input}</code></span>
                                  <span className="ml-3 text-slate-500 dark:text-slate-400">Expected: <code className="bg-white dark:bg-slate-900 px-1 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200">{tc.expectedOutput}</code></span>
                                </div>
                                <button
                                  onClick={() => {
                                    const nextTc = challenge.testCases.filter((item: any) => item.id !== tc.id);
                                    updateChallengeField('testCases', nextTc);
                                  }}
                                  className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add Test Case Form */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Add Test Case Case</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Input String (e.g. 15)"
                            value={newTcInput}
                            onChange={(e) => setNewTcInput(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 focus:outline-hidden"
                          />
                          <input
                            type="text"
                            placeholder="Expected Output String"
                            value={newTcExpected}
                            onChange={(e) => setNewTcExpected(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={addTestCase}
                            className="bg-slate-900 dark:bg-sky-600 hover:bg-slate-850 dark:hover:bg-sky-500 text-white font-bold rounded-lg py-2 cursor-pointer shadow-sm text-center"
                          >
                            Add Test Case
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* 8. AI CONTEXT TAB */}
                {activeTab === 'ai' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="text-slate-550 dark:text-slate-400 block mb-1">AI Context Summary Guide (Used by chatbot reviews)</label>
                      <textarea
                        value={(selectedLesson as any).aiSummary || ''}
                        onChange={(e) => handleInputChange('aiSummary' as any, e.target.value)}
                        placeholder="Add summarizing notes for the AI Learning Assistant..."
                        rows={4}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-slate-550 dark:text-slate-400 block mb-1">Key Concepts (Comma separated)</label>
                      <input
                        type="text"
                        value={(selectedLesson as any).aiKeyConcepts || 'Linux CLI, File permissions'}
                        onChange={(e) => handleInputChange('aiKeyConcepts' as any, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-slate-550 dark:text-slate-400 block mb-1">Suggested User Prompts for Assistant panel</label>
                      <textarea
                        value={(selectedLesson as any).aiSuggestedPrompts || 'How do file permissions work in Linux?\nExplain the differences between owner and group.'}
                        onChange={(e) => handleInputChange('aiSuggestedPrompts' as any, e.target.value)}
                        placeholder="One prompt per line..."
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-hidden text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 9. SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div className="space-y-4 animate-in fade-in duration-200 select-none">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">Lesson Publication Status</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Published lessons are visible in student learning player catalog views.</span>
                        </div>
                        <select
                          value={selectedLesson.assignmentSubmissionStatus === 'Published' ? 'Published' : 'Draft'}
                          onChange={(e) => handleInputChange('assignmentSubmissionStatus' as any, e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-1.5 font-bold cursor-pointer"
                        >
                          <option value="Published" className="dark:bg-slate-900">Published</option>
                          <option value="Draft" className="dark:bg-slate-900">Draft</option>
                        </select>
                      </div>

                      <div className="border-t border-slate-200/50 dark:border-slate-800 pt-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">Free Preview Mode</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Allows unsubscribed or guest visitors to view study materials.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={!!(selectedLesson as any).freePreview}
                          onChange={(e) => handleInputChange('freePreview' as any, e.target.checked)}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <div className="border-t border-slate-200/50 dark:border-slate-800 pt-4 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">Completion Verification requirement</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Condition that marks progress checkpoint as completed.</span>
                        </div>
                        <select
                          value={(selectedLesson as any).completionRequirement || 'View'}
                          onChange={(e) => handleInputChange('completionRequirement' as any, e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-1.5 font-bold cursor-pointer"
                        >
                          <option value="View" className="dark:bg-slate-900">View Content (Default)</option>
                          <option value="PassQuiz" className="dark:bg-slate-900">Pass Quiz Assessment</option>
                          <option value="SubmitAssignment" className="dark:bg-slate-900">Submit homework files</option>
                          <option value="SolveCode" className="dark:bg-slate-900">Solve practice lab sandbox</option>
                        </select>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Sticky action bar */}
              <div className="bg-slate-50/50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 p-4 select-none shrink-0 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => toast.info('Preview mode launched (simulation placeholder).')}
                  className="py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Lesson</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    saveLessonEdits(selectedLesson);
                    toast.success('Changes successfully persisted manually.');
                  }}
                  className="py-2.5 px-5 bg-slate-900 dark:bg-sky-600 hover:bg-slate-850 dark:hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Force Save Changes</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminContentManagement;
