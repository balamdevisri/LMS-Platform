import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Code2,
  BookOpen,
  HelpCircle,
  Link as LinkIcon,
  FileCode,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type LearningUnitItem,
  type LearningUnitType,
  type CodeExampleItem,
  type PracticeQuestionItem,
  type ResourceLinkItem,
  type QuizQuestion
} from '@/contexts/CourseContext';
import { MarkdownContent } from '../learning/MarkdownContent';

interface UnitContentEditorProps {
  isOpen: boolean;
  unit: LearningUnitItem | null;
  moduleTitle?: string;
  topicTitle?: string;
  onSave: (updatedUnit: LearningUnitItem, isDraft?: boolean) => Promise<void> | void;
  onClose: () => void;
  onDelete?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'java', label: 'Java' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
];

export const UnitContentEditor: React.FC<UnitContentEditorProps> = ({
  isOpen,
  unit,
  moduleTitle,
  topicTitle,
  onSave,
  onClose,
  onDelete,
}) => {
  if (!isOpen || !unit) return null;

  // Track the current loaded unit ID and dirty state in refs to safely distinguish
  // switching units vs parent re-renders of the same unit
  const lastLoadedUnitIdRef = React.useRef<string | null>(unit.id || null);
  const isDirtyRef = React.useRef<boolean>(false);

  // Local editor draft state
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [title, setTitle] = useState(unit.title || '');
  const [description, setDescription] = useState(unit.description || '');
  const [duration, setDuration] = useState(unit.duration || '15 mins');
  const [type, setType] = useState<LearningUnitType>(unit.type || 'Reading');
  const [videoUrl, setVideoUrl] = useState(unit.videoUrl || '');
  
  // Structured sections state
  const [objectives, setObjectives] = useState<string[]>(() => {
    return unit.learningObjectives && unit.learningObjectives.length > 0
      ? unit.learningObjectives
      : [''];
  });

  const [conceptTheory, setConceptTheory] = useState<string>(() => {
    return unit.conceptTheory || unit.readingContent || '';
  });

  const [codeExamples, setCodeExamples] = useState<CodeExampleItem[]>(() => {
    return unit.codeExamples && unit.codeExamples.length > 0
      ? unit.codeExamples
      : [];
  });

  const [keyPoints, setKeyPoints] = useState<string[]>(() => {
    return unit.keyPoints && unit.keyPoints.length > 0
      ? unit.keyPoints
      : [];
  });

  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestionItem[]>(() => {
    return unit.practiceQuestions && unit.practiceQuestions.length > 0
      ? unit.practiceQuestions
      : [];
  });

  const [resourceLinks, setResourceLinks] = useState<ResourceLinkItem[]>(() => {
    return unit.resourceLinks && unit.resourceLinks.length > 0
      ? unit.resourceLinks
      : [];
  });

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => {
    return unit.quizQuestions && unit.quizQuestions.length > 0
      ? unit.quizQuestions
      : [];
  });

  const [assignmentInstructions, setAssignmentInstructions] = useState(unit.assignmentInstructions || '');
  const [notes, setNotes] = useState(unit.notes || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewPracticeOpen, setPreviewPracticeOpen] = useState<Record<number, boolean>>({});

  const markDirty = () => {
    isDirtyRef.current = true;
    if (!isDirty) setIsDirty(true);
  };

  // Sync state safely: ONLY reset if a genuinely different unit ID is opened,
  // or synchronize clean props if no unsaved changes exist for the same unit.
  useEffect(() => {
    if (!unit) {
      lastLoadedUnitIdRef.current = null;
      return;
    }

    const previousUnitId = lastLoadedUnitIdRef.current;
    const isNewUnit = previousUnitId !== unit.id;

    console.log('[EDITOR-INIT]', {
      unitId: unit.id,
      previousUnitId,
      isDirty: isDirtyRef.current,
      isNewUnit,
    });

    if (isNewUnit) {
      console.log('[EDITOR-RESET]', {
        unitId: unit.id,
        reason: previousUnitId === null ? 'initial_mount' : 'unit_switched',
      });
      lastLoadedUnitIdRef.current = unit.id;
      isDirtyRef.current = false;
      setIsDirty(false);
      setTitle(unit.title || '');
      setDescription(unit.description || '');
      setDuration(unit.duration || '15 mins');
      setType(unit.type || 'Reading');
      setVideoUrl(unit.videoUrl || '');
      setObjectives(unit.learningObjectives && unit.learningObjectives.length > 0 ? unit.learningObjectives : ['']);
      setConceptTheory(unit.conceptTheory || unit.readingContent || '');
      setCodeExamples(unit.codeExamples || []);
      setKeyPoints(unit.keyPoints || []);
      setPracticeQuestions(unit.practiceQuestions || []);
      setResourceLinks(unit.resourceLinks || []);
      setQuizQuestions(unit.quizQuestions || []);
      setAssignmentInstructions(unit.assignmentInstructions || '');
      setNotes(unit.notes || '');
      setActiveTab('editor');
    } else if (!isDirtyRef.current) {
      // Same unit with NO unsaved changes: safe to sync external updates from parent
      console.log('[EDITOR-RESET]', {
        unitId: unit.id,
        reason: 'clean_state_sync',
      });
      setTitle(unit.title || '');
      setDescription(unit.description || '');
      setDuration(unit.duration || '15 mins');
      setType(unit.type || 'Reading');
      setVideoUrl(unit.videoUrl || '');
      setObjectives(unit.learningObjectives && unit.learningObjectives.length > 0 ? unit.learningObjectives : ['']);
      setConceptTheory(unit.conceptTheory || unit.readingContent || '');
      setCodeExamples(unit.codeExamples || []);
      setKeyPoints(unit.keyPoints || []);
      setPracticeQuestions(unit.practiceQuestions || []);
      setResourceLinks(unit.resourceLinks || []);
      setQuizQuestions(unit.quizQuestions || []);
      setAssignmentInstructions(unit.assignmentInstructions || '');
      setNotes(unit.notes || '');
    } else {
      // Same unit with UNSAVED changes: preserve local editor state and ignore parent object reference updates!
      console.log('[EDITOR-RESET]', {
        unitId: unit.id,
        reason: 'skipped_due_to_unsaved_changes',
      });
    }
  }, [unit]);

  // ─── Objectives Handlers ──────────────────────────────────────────────────
  const handleAddObjective = () => {
    setObjectives((prev) => [...prev, '']);
    markDirty();
    console.log('[EDITOR-CHANGE]', { unitId: unit.id, field: 'objectives', valueSnippet: 'add_objective' });
  };

  const handleUpdateObjective = (index: number, value: string) => {
    setObjectives((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    markDirty();
    console.log('[EDITOR-CHANGE]', { unitId: unit.id, field: `objective_${index}`, valueSnippet: value.slice(0, 30) });
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  };

  // ─── Code Examples Handlers ───────────────────────────────────────────────
  const handleAddCodeExample = () => {
    const defaultLang = type === 'Reading' ? 'c' : 'python';
    setCodeExamples((prev) => [
      ...prev,
      {
        id: `code-${Date.now()}`,
        title: 'Example',
        language: defaultLang,
        code: '// Enter code snippet here\n',
        explanation: '',
      },
    ]);
    markDirty();
  };

  const handleUpdateCodeExample = (index: number, updates: Partial<CodeExampleItem>) => {
    setCodeExamples((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
    markDirty();
  };

  const handleRemoveCodeExample = (index: number) => {
    setCodeExamples((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  };

  // ─── Key Points Handlers ──────────────────────────────────────────────────
  const handleAddKeyPoint = () => {
    setKeyPoints((prev) => [...prev, '']);
    markDirty();
  };

  const handleUpdateKeyPoint = (index: number, value: string) => {
    setKeyPoints((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    markDirty();
  };

  const handleRemoveKeyPoint = (index: number) => {
    setKeyPoints((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  };

  // ─── Practice Questions Handlers ──────────────────────────────────────────
  const handleAddPracticeQuestion = () => {
    setPracticeQuestions((prev) => [
      ...prev,
      {
        id: `prac-${Date.now()}`,
        question: 'Write a program to solve this challenge:',
        answer: '// Sample solution code or expected answer\n',
        explanation: 'Key logic explanation for this practice exercise.',
        difficulty: 'Easy',
      },
    ]);
    markDirty();
  };

  const handleUpdatePracticeQuestion = (index: number, updates: Partial<PracticeQuestionItem>) => {
    setPracticeQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
    markDirty();
  };

  const handleRemovePracticeQuestion = (index: number) => {
    setPracticeQuestions((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  };

  // ─── Resource Links Handlers ──────────────────────────────────────────────
  const handleAddResourceLink = () => {
    setResourceLinks((prev) => [
      ...prev,
      {
        id: `res-${Date.now()}`,
        title: 'New Resource',
        url: 'https://',
        type: 'link',
        description: 'Resource documentation, guide, or downloadable asset.',
      },
    ]);
    markDirty();
  };

  const handleUpdateResourceLink = (index: number, updates: Partial<ResourceLinkItem>) => {
    setResourceLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
    markDirty();
  };

  const handleMoveResourceLink = (index: number, direction: 'up' | 'down') => {
    setResourceLinks((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    markDirty();
  };

  const handleRemoveResourceLink = (index: number) => {
    setResourceLinks((prev) => prev.filter((_, i) => i !== index));
    markDirty();
  };

  // ─── Quiz Questions Handlers ──────────────────────────────────────────────
  const handleAddQuizQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      questionText: 'Which of the following is correct?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: 0,
      explanation: 'Explanation of why Option A is correct.',
      marks: 5,
    };
    setQuizQuestions((prev) => [...prev, newQ]);
    markDirty();
  };

  const handleUpdateQuizQuestion = (qIdx: number, updates: Partial<QuizQuestion>) => {
    setQuizQuestions((prev) => {
      const next = [...prev];
      next[qIdx] = { ...next[qIdx], ...updates };
      return next;
    });
    markDirty();
  };

  const handleUpdateQuizOption = (qIdx: number, optIdx: number, val: string) => {
    setQuizQuestions((prev) => {
      const next = [...prev];
      const opts = [...next[qIdx].options];
      opts[optIdx] = val;
      next[qIdx].options = opts;
      return next;
    });
    markDirty();
  };

  const handleRemoveQuizQuestion = (qIdx: number) => {
    setQuizQuestions((prev) => prev.filter((_, i) => i !== qIdx));
    markDirty();
  };

  // ─── Compile Structured Content into Unified Lesson Markdown ─────────────
  const compiledLessonContent = useMemo((): string => {
    const parts: string[] = [];

    // Concept / Theory
    if (conceptTheory.trim()) {
      parts.push(conceptTheory.trim());
    }

    // Code Examples
    if (codeExamples.length > 0) {
      codeExamples.forEach((ex, idx) => {
        if (ex.code && ex.code.trim()) {
          const titleHeading = ex.title ? `### Code Example ${idx + 1}: ${ex.title}` : `### Code Example ${idx + 1}`;
          parts.push(titleHeading);
          parts.push(`\`\`\`${ex.language || 'text'}\n${ex.code.trim()}\n\`\`\``);
          if (ex.explanation && ex.explanation.trim()) {
            parts.push(`> **Explanation:** ${ex.explanation.trim()}`);
          }
        }
      });
    }

    // Key Points
    const validKeyPoints = keyPoints.filter((kp) => kp.trim().length > 0);
    if (validKeyPoints.length > 0) {
      parts.push('### Key Points & Takeaways');
      validKeyPoints.forEach((kp) => {
        parts.push(`- ${kp.trim()}`);
      });
    }

    // Notes
    if (notes && notes.trim()) {
      parts.push(`> **Important Note:** ${notes.trim()}`);
    }

    return parts.join('\n\n');
  }, [conceptTheory, codeExamples, keyPoints, notes]);

  // ─── Save & Publish Handlers ──────────────────────────────────────────────
  const handleSave = async (isDraft = false) => {
    if (!title.trim()) {
      toast.error('Unit title is required.');
      return;
    }

    const filteredObjectives = objectives.map((o) => o.trim()).filter((o) => o.length > 0);
    const filteredKeyPoints = keyPoints.map((k) => k.trim()).filter((k) => k.length > 0);

    const updatedUnit: LearningUnitItem = {
      ...unit,
      id: unit.id,
      title: title.trim(),
      description: description.trim(),
      duration: duration.trim() || '15 mins',
      type,
      videoUrl: type === 'Video' ? videoUrl.trim() : undefined,
      readingContent: compiledLessonContent,
      conceptTheory: conceptTheory.trim(),
      learningObjectives: filteredObjectives,
      codeExamples: codeExamples.filter((c) => c.code.trim().length > 0),
      keyPoints: filteredKeyPoints,
      practiceQuestions: practiceQuestions.filter((p) => p.question.trim().length > 0),
      resourceLinks: resourceLinks.filter((r) => r.title.trim().length > 0 && r.url.trim().length > 0),
      quizQuestions: type === 'Quiz' ? quizQuestions : undefined,
      assignmentInstructions: type === 'Assignment' ? assignmentInstructions.trim() : undefined,
      notes: notes.trim(),
      isDraft,
      lastSavedAt: new Date().toISOString(),
    };

    console.log('[UNIT-EDITOR-TRACE] 1. UnitContentEditor handleSave called:', {
      unitId: unit.id,
      title: updatedUnit.title,
      readingContentSnippet: (updatedUnit.conceptTheory || updatedUnit.readingContent || '').slice(0, 60),
      isDraft,
    });

    try {
      setIsSaving(true);
      await onSave(updatedUnit, isDraft);
      isDirtyRef.current = false;
      setIsDirty(false);
      lastLoadedUnitIdRef.current = updatedUnit.id;
      toast.success(isDraft ? 'Unit saved as draft.' : 'Unit published successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save unit content.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes in this unit. Are you sure you want to exit without saving?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#111827] w-full max-w-5xl h-[92vh] max-h-[950px] rounded-2xl border border-[#E5E7EB] dark:border-[#25324A] shadow-2xl flex flex-col overflow-hidden text-[#111827] dark:text-[#F8FAFC]">
        
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#25324A] bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
              {moduleTitle && <span>{moduleTitle}</span>}
              {topicTitle && (
                <>
                  <span>/</span>
                  <span className="truncate max-w-[200px]">{topicTitle}</span>
                </>
              )}
              <span>/</span>
              <span className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">Unit Editor</span>
              {isDirty && (
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                  Unsaved changes
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold truncate text-[#111827] dark:text-white mt-0.5">
              {title || 'Untitled Learning Unit'}
            </h2>
          </div>

          {/* Action Tabs & Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 dark:bg-[#172033] text-xs font-medium mr-2">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#3B82F6] font-semibold shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#3B82F6] font-semibold shadow-xs'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Student Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#25324A] text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Publishing...' : 'Publish & Update'}</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* TAB 1: STRUCTURED EDITOR */}
          {activeTab === 'editor' && (
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Section 1: Basic Metadata */}
              <section className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span>1. Unit Metadata & Overview</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#111827] dark:text-slate-200 block mb-1">
                      Unit Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        markDirty();
                        console.log('[EDITOR-CHANGE]', { unitId: unit.id, field: 'title', valueSnippet: e.target.value.slice(0, 30) });
                      }}
                      placeholder="e.g. Introduction to Variables and Memory in C"
                      className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-2.5 px-3 text-sm text-[#111827] dark:text-white focus:outline-hidden focus:border-[#2563EB] dark:focus:border-[#3B82F6] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#111827] dark:text-slate-200 block mb-1">
                        Unit Delivery Type
                      </label>
                      <select
                        value={type}
                        onChange={(e) => {
                          setType(e.target.value as LearningUnitType);
                          markDirty();
                          console.log('[EDITOR-CHANGE]', { unitId: unit.id, field: 'type', valueSnippet: e.target.value });
                        }}
                        className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-2 px-3 text-xs text-[#111827] dark:text-white focus:outline-hidden focus:border-[#2563EB] cursor-pointer"
                      >
                        <option value="Reading">Reading / Structured Notes</option>
                        <option value="Video">Video Lecture</option>
                        <option value="Quiz">Interactive Quiz Assessment</option>
                        <option value="Assignment">Practical Assignment</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#111827] dark:text-slate-200 block mb-1">
                        Estimated Duration
                      </label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => {
                          setDuration(e.target.value);
                          markDirty();
                          console.log('[EDITOR-CHANGE]', { unitId: unit.id, field: 'duration', valueSnippet: e.target.value });
                        }}
                        placeholder="e.g. 15 mins"
                        className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-2 px-3 text-xs text-[#111827] dark:text-white focus:outline-hidden focus:border-[#2563EB] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#111827] dark:text-slate-200 block mb-1">
                      Short Description / Overview
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        markDirty();
                        console.log('[EDITOR-CHANGE]', { unitId: unit.id, field: 'description', valueSnippet: e.target.value.slice(0, 30) });
                      }}
                      placeholder="Brief overview explaining what students will learn in this unit..."
                      className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-2 px-3 text-xs text-[#111827] dark:text-white focus:outline-hidden focus:border-[#2563EB] resize-none"
                    />
                  </div>

                  {type === 'Video' && (
                    <div>
                      <label className="text-xs font-semibold text-[#111827] dark:text-slate-200 block mb-1">
                        Video Resource URL (YouTube, Vimeo, MP4)
                      </label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          markDirty();
                          console.log('[EDITOR-CHANGE]', { unitId: unit.id, field: 'videoUrl', valueSnippet: e.target.value.slice(0, 30) });
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-2 px-3 text-xs text-[#111827] dark:text-white focus:outline-hidden focus:border-[#2563EB]"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Section 2: Learning Objectives */}
              <section className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span>2. Learning Objectives</span>
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      List specific competencies students will acquire upon completing this unit.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Objective
                  </button>
                </div>

                <div className="space-y-2">
                  {objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#F8FAFC] dark:bg-[#172033] border border-[#E5E7EB] dark:border-[#25324A] text-[11px] font-mono font-bold text-[#64748B] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                        placeholder="e.g. Understand how integers and floats are stored in stack memory"
                        className="flex-1 bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-1.5 px-3 text-xs text-[#111827] dark:text-white focus:outline-hidden focus:border-[#2563EB]"
                      />
                      {objectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveObjective(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Remove objective"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Concept / Theory Content (Markdown) */}
              <section className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                    <span>3. Lesson Concept & Theory Content (Markdown)</span>
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Main technical notes, paragraphs, subheadings, and formatting. Supports full Markdown syntax.
                  </p>
                </div>

                <textarea
                  rows={10}
                  value={conceptTheory}
                  onChange={(e) => {
                    setConceptTheory(e.target.value);
                    markDirty();
                    console.log('[EDITOR-CHANGE]', { unitId: unit.id, field: 'conceptTheory', valueSnippet: e.target.value.slice(0, 30) });
                  }}
                  placeholder="## Core Concept Overview&#10;&#10;Write detailed lesson text here...&#10;&#10;### Sub-topic heading&#10;Explain low-level mechanics or workflow..."
                  className="w-full bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-[#25324A] rounded-xl p-4 text-xs font-mono text-[#111827] dark:text-slate-200 focus:outline-hidden focus:border-[#2563EB] leading-relaxed"
                />
              </section>

              {/* Section 4: Code Examples */}
              <section className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span>4. Code Examples</span>
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Add syntax-highlighted code snippets with programming language and optional line-by-line explanation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCodeExample}
                    className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Code Block
                  </button>
                </div>

                {codeExamples.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-dashed border-[#E5E7EB] dark:border-[#25324A] text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                    No code examples added. Click "Add Code Block" to provide executable demonstrations.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {codeExamples.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-[#25324A] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="text"
                              value={ex.title || ''}
                              onChange={(e) => handleUpdateCodeExample(idx, { title: e.target.value })}
                              placeholder="Snippet Label (e.g. main.c, Pointer Example)"
                              className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-1 px-2.5 text-xs font-semibold text-[#111827] dark:text-white flex-1"
                            />
                            <select
                              value={ex.language || 'c'}
                              onChange={(e) => handleUpdateCodeExample(idx, { language: e.target.value })}
                              className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-1 px-2.5 text-xs font-mono font-medium text-[#2563EB] dark:text-[#3B82F6] cursor-pointer"
                            >
                              {SUPPORTED_LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                  {lang.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCodeExample(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Remove snippet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          rows={6}
                          value={ex.code}
                          onChange={(e) => handleUpdateCodeExample(idx, { code: e.target.value })}
                          placeholder="// Paste source code here..."
                          className="w-full bg-[#111827] text-slate-100 border border-slate-700/60 rounded-xl p-3 text-xs font-mono leading-relaxed"
                        />

                        <input
                          type="text"
                          value={ex.explanation || ''}
                          onChange={(e) => handleUpdateCodeExample(idx, { explanation: e.target.value })}
                          placeholder="Optional explanation of code behavior or edge cases..."
                          className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-1.5 px-3 text-xs text-[#111827] dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 5: Key Points */}
              <section className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span>5. Key Points & Summary Takeaways</span>
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Quick reference bullet points displayed at the end of the lesson.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddKeyPoint}
                    className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Point
                  </button>
                </div>

                <div className="space-y-2">
                  {keyPoints.map((kp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[#2563EB] dark:text-[#3B82F6] font-bold">•</span>
                      <input
                        type="text"
                        value={kp}
                        onChange={(e) => handleUpdateKeyPoint(idx, e.target.value)}
                        placeholder="e.g. Always initialize pointers before dereferencing to prevent segmentation faults"
                        className="flex-1 bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-1.5 px-3 text-xs text-[#111827] dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyPoint(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Remove point"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {keyPoints.length === 0 && (
                    <div className="text-xs text-[#64748B] italic">No key points added.</div>
                  )}
                </div>
              </section>

              {/* Section 6: Practice Questions */}
              <section className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span>6. Practice Questions & Exercises</span>
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Hands-on practice exercises with expandable solutions and hints for self-study.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPracticeQuestion}
                    className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Practice Challenge
                  </button>
                </div>

                {practiceQuestions.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-dashed border-[#E5E7EB] dark:border-[#25324A] text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                    No practice exercises configured for this unit.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {practiceQuestions.map((pq, idx) => (
                      <div
                        key={pq.id || idx}
                        className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-[#25324A] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2563EB] dark:text-[#3B82F6]">
                            Practice Challenge #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePracticeQuestion(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                            Question Prompt
                          </label>
                          <textarea
                            rows={2}
                            value={pq.question}
                            onChange={(e) => handleUpdatePracticeQuestion(idx, { question: e.target.value })}
                            placeholder="State the programming task or question..."
                            className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg p-2.5 text-xs text-[#111827] dark:text-white resize-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                            Expected Answer / Solution Code
                          </label>
                          <textarea
                            rows={3}
                            value={pq.answer}
                            onChange={(e) => handleUpdatePracticeQuestion(idx, { answer: e.target.value })}
                            placeholder="Provide reference answer or code solution..."
                            className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg p-2.5 text-xs font-mono text-[#111827] dark:text-white resize-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                            Explanation / Approach Notes
                          </label>
                          <input
                            type="text"
                            value={pq.explanation || ''}
                            onChange={(e) => handleUpdatePracticeQuestion(idx, { explanation: e.target.value })}
                            placeholder="Why this approach works and algorithmic complexity..."
                            className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-1.5 px-3 text-xs text-[#111827] dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 7: Interactive Quiz (When type === 'Quiz') */}
              {type === 'Quiz' && (
                <section className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>7. Multiple Choice Quiz Questions</span>
                      </h3>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        Assessment questions evaluated automatically by the LMS.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddQuizQuestion}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add MCQ
                    </button>
                  </div>

                  <div className="space-y-4">
                    {quizQuestions.map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-[#25324A] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            Question {qIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuizQuestion(qIdx)}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={q.questionText}
                          onChange={(e) => handleUpdateQuizQuestion(qIdx, { questionText: e.target.value })}
                          placeholder="Enter question text..."
                          className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-2 px-3 text-xs font-semibold text-[#111827] dark:text-white"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`quiz-ans-${qIdx}`}
                                checked={q.correctAnswerIndex === optIdx}
                                onChange={() => handleUpdateQuizQuestion(qIdx, { correctAnswerIndex: optIdx })}
                                className="text-[#2563EB] cursor-pointer"
                                title="Set as correct answer"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleUpdateQuizOption(qIdx, optIdx, e.target.value)}
                                placeholder={`Option ${optIdx + 1}`}
                                className="flex-1 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-md py-1 px-2 text-xs text-[#111827] dark:text-white"
                              />
                            </div>
                          ))}
                        </div>

                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleUpdateQuizQuestion(qIdx, { explanation: e.target.value })}
                          placeholder="Explanation shown after student submits answer..."
                          className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-md py-1 px-2.5 text-[11px] text-[#64748B] dark:text-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 8: Additional Resources */}
              {/* Section 8: Resources & Downloads */}
              <section className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span>8. Lesson Resources & Downloads</span>
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Attach PDFs, documentation guides, video links, GitHub repositories, and downloadable files.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddResourceLink}
                    className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] text-xs font-semibold flex items-center gap-1 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Resource
                  </button>
                </div>

                <div className="space-y-3">
                  {resourceLinks.map((res, idx) => {
                    const cleanUrl = (res.url || '').trim();
                    const isUrlValid = cleanUrl.startsWith('https://') || cleanUrl.startsWith('http://') || cleanUrl.startsWith('/');
                    return (
                      <div
                        key={res.id || idx}
                        className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-[#25324A] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#2563EB] dark:text-[#3B82F6]">
                              Resource #{idx + 1}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {res.type || 'link'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveResourceLink(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveResourceLink(idx, 'down')}
                              disabled={idx === resourceLinks.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveResourceLink(idx)}
                              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                              Resource Title
                            </label>
                            <input
                              type="text"
                              value={res.title}
                              onChange={(e) => handleUpdateResourceLink(idx, { title: e.target.value })}
                              placeholder="e.g. Complete Course Textbook & Reference Notes"
                              className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-1.5 px-3 text-xs text-[#111827] dark:text-white font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                              Resource Type
                            </label>
                            <select
                              value={res.type || 'link'}
                              onChange={(e) => handleUpdateResourceLink(idx, { type: e.target.value as any })}
                              className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-1.5 px-3 text-xs text-[#111827] dark:text-white"
                            >
                              <option value="pdf">📄 PDF / Document</option>
                              <option value="link">🔗 External Link / Docs</option>
                              <option value="video">🎥 Video Tutorial</option>
                              <option value="github">💻 GitHub Repository</option>
                              <option value="download">⬇️ Downloadable File</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                            Short Description / Note (Optional)
                          </label>
                          <input
                            type="text"
                            value={res.description || ''}
                            onChange={(e) => handleUpdateResourceLink(idx, { description: e.target.value })}
                            placeholder="e.g. Official ISO C standard documentation and syntax reference"
                            className="w-full bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] rounded-lg py-1.5 px-3 text-xs text-[#111827] dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                            <span>Resource URL (HTTPS / HTTP)</span>
                            {!isUrlValid && res.url && (
                              <span className="text-rose-500 normal-case font-normal">Must start with https:// or http://</span>
                            )}
                          </label>
                          <input
                            type="url"
                            value={res.url}
                            onChange={(e) => handleUpdateResourceLink(idx, { url: e.target.value })}
                            placeholder="https://..."
                            className={`w-full bg-white dark:bg-[#111827] border rounded-lg py-1.5 px-3 text-xs font-mono
                              ${!isUrlValid && res.url
                                ? 'border-rose-500 text-rose-500'
                                : 'border-[#E5E7EB] dark:border-[#25324A] text-[#2563EB] dark:text-[#3B82F6]'
                              }`}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {resourceLinks.length === 0 && (
                    <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#0B1120] border border-dashed border-[#E5E7EB] dark:border-[#25324A] text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                      No resources configured for this lesson yet. Click "Add Resource" to attach PDFs, links, or code repositories.
                    </div>
                  )}
                </div>
              </section>

              {/* Danger Zone: Delete Unit */}
              {onDelete && (
                <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#25324A] flex justify-end">
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Unit</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LIVE STUDENT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="max-w-[52rem] mx-auto space-y-8 py-4">
              
              {/* Header meta row */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Learning Unit Preview
                </span>
                <span>•</span>
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {duration}
                </span>
              </div>

              {/* Unit Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0284C7] dark:text-[#38BDF8]">
                {title || 'Untitled Learning Unit'}
              </h1>

              {/* Learning Objectives Box */}
              {objectives.filter((o) => o.trim().length > 0).length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0284C7] dark:text-[#38BDF8] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Learning Objectives
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#334155] dark:text-[#CBD5E1]">
                    {objectives.filter((o) => o.trim().length > 0).map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#38BDF8] dark:text-[#38BDF8] font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compiled Markdown Body */}
              {compiledLessonContent ? (
                <MarkdownContent content={compiledLessonContent} />
              ) : (
                <div className="p-8 text-center text-xs text-[#64748B] italic">
                  No lesson content written yet. Switch to the "Editor" tab to add theory and code examples.
                </div>
              )}

              {/* Practice Questions Preview */}
              {practiceQuestions.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-[#E5E7EB] dark:border-[#25324A]">
                  <h3 className="text-lg font-bold text-[#2563EB] dark:text-[#60A5FA] flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#0284C7] dark:text-[#38BDF8]" />
                    <span>Practice Exercises</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {practiceQuestions.map((pq, idx) => {
                      const isOpen = !!previewPracticeOpen[idx];
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8]">
                              Exercise {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewPracticeOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                              className="text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span>{isOpen ? 'Hide Solution' : 'Reveal Solution'}</span>
                              {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          <p className="text-xs text-[#334155] dark:text-slate-300 whitespace-pre-wrap">
                            {pq.question}
                          </p>

                          {isOpen && (
                            <div className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono border border-slate-800 space-y-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                Reference Solution:
                              </span>
                              <pre className="overflow-x-auto whitespace-pre-wrap">{pq.answer}</pre>
                              {pq.explanation && (
                                <p className="text-[11px] text-emerald-400 font-sans mt-2 pt-2 border-t border-slate-800">
                                  💡 {pq.explanation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resource Links Preview */}
              {resourceLinks.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-[#E5E7EB] dark:border-[#25324A]">
                  <h3 className="text-base font-bold text-[#2563EB] dark:text-[#60A5FA] flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
                    <span>Lesson Resources</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resourceLinks.map((res, i) => {
                      const resType = res.type || 'link';
                      const badgeLabel =
                        resType === 'pdf' ? 'PDF Document' :
                        resType === 'video' ? 'Video Tutorial' :
                        resType === 'github' ? 'GitHub Repository' :
                        resType === 'download' ? 'Downloadable Asset' : 'External Documentation';

                      return (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition-colors flex flex-col justify-between text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold text-[#111827] dark:text-white truncate">{res.title}</div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] font-semibold flex-shrink-0">
                              {badgeLabel}
                            </span>
                          </div>
                          {res.description && (
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-2">
                              {res.description}
                            </p>
                          )}
                          <div className="font-mono text-[10px] text-[#2563EB] dark:text-[#3B82F6] truncate flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{res.url}</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
