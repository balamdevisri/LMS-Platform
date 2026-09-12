import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateCourseSchema } from '../../../../shared/validators/course.validator';
import type { UpdateCourseInput } from '../../../../shared/validators/course.validator';
import { courseService } from '../../services/courseService';
import { useCourses } from '@/contexts/CourseContext';
import type { ModuleItem, TopicItem, LearningUnitItem, LearningUnitType } from '@/contexts/CourseContext';
import { LoadingSkeleton } from '../../components/courses/LoadingSkeleton';
import { CloudinaryUploadZone } from '../../components/admin/CloudinaryUploadZone';
import { aiAutofillService } from '@/services/aiAutofillService';
import { MarkdownContent } from '@/components/learning/MarkdownContent';
import { normalizeStringList } from '@/components/learning/LessonContentPanel';
import { AdminQuizManager } from '@/components/admin/AdminQuizManager';
import { MermaidDiagram } from '@/components/learning/MermaidDiagram';
import { ContentBlockArranger } from '@/components/admin/ContentBlockArranger';
import { Reorder } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  Image as ImageIcon,
  Layers,
  FileText,
  Paperclip,
  Settings,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
  ExternalLink,
  Video,
  FileCode,
  GitFork,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code2,
  Quote,
  Table,
  Terminal,
  Database,
  GitBranch,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Minus,
  Check,
  Target,
  Key,
  Award,
  Workflow,
  CheckSquare,
  GripVertical,
  Columns2,
  Copy,
  ChevronsUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

export type CourseTab = 'details' | 'curriculum' | 'content' | 'resources' | 'assessment' | 'settings';

export const AdminCourseEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCourses } = useCourses();

  // Active Tab State
  const initialTab = (searchParams.get('tab') as CourseTab) || 'details';
  const [activeTab, setActiveTab] = useState<CourseTab>(initialTab);

  // Sync tab with URL
  const handleTabChange = (tab: CourseTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);

  // Save State Tracking
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Saved');
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictServerVersion, setConflictServerVersion] = useState<number | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavDestination, setPendingNavDestination] = useState<string | null>(null);

  // Cloudinary Media States (Course Level)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailPublicId, setThumbnailPublicId] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverPublicId, setCoverPublicId] = useState<string>('');

  // Course Basic Fields
  const [skillsInput, setSkillsInput] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [outcomesInput, setOutcomesInput] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);

  // Curriculum & Lesson Hierarchy State
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<LearningUnitItem | null>(null);
  const [selectedModId, setSelectedModId] = useState<string | null>(null);
  const [selectedTopId, setSelectedTopId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Curriculum Modals & Inline Edit State
  const [newModuleName, setNewModuleName] = useState('');
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [activeTopicParentModId, setActiveTopicParentModId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [activeUnitParentInfo, setActiveUnitParentInfo] = useState<{ modId: string; topId: string } | null>(null);
  const [newUnitName, setNewUnitName] = useState('');
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  // ── Lesson Content Tab States ─────────────────────────────────────────────
  const [unitTitle, setUnitTitle] = useState<string>('');
  const [unitDuration, setUnitDuration] = useState<string>('15 mins');
  const [unitType, setUnitType] = useState<LearningUnitType>('Reading');
  const [lessonMarkdown, setLessonMarkdown] = useState<string>('');
  const [lessonDescription, setLessonDescription] = useState<string>('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState<string>('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [contentMode, setContentMode] = useState<'arranger' | 'raw'>('arranger');
  const [splitRatio, setSplitRatio] = useState<number>(50); // 50% left, 50% right
  const isResizingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Image Insertion Modal State
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageToInsertUrl, setImageToInsertUrl] = useState('');
  const [imageToInsertPublicId, setImageToInsertPublicId] = useState('');
  const [imageAltText, setImageAltText] = useState('');

  // Link Insertion Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Code Block Insertion Modal State
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('c');

  // Flowchart & Architecture Diagram Builder Modal State
  const [showFlowchartModal, setShowFlowchartModal] = useState(false);
  const [flowchartType, setFlowchartType] = useState<string>('decision');
  const [flowchartMermaidCode, setFlowchartMermaidCode] = useState<string>(
    'flowchart TD\n  Start([🚀 Start]) --> Validate{Is Input Valid?}\n  Validate -- Yes --> Process[⚙️ Process Execution]\n  Validate -- No --> HandleError[⚠️ Log Error & Retry]\n  HandleError --> Start\n  Process --> Result[/📤 Return Result/]\n  Result --> End([✅ Complete])'
  );

  // Resources Tab State
  const [unitResources, setUnitResources] = useState<any[]>([]);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [resTitle, setResTitle] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [resType, setResType] = useState<string>('pdf');
  const [resUrl, setResUrl] = useState('');
  const [resDownloadable, setResDownloadable] = useState(true);

  // Settings Tab State
  const [courseStatus, setCourseStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [courseVisibility, setCourseVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);

  const {
    register,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateCourseInput>({
    resolver: zodResolver(UpdateCourseSchema) as any,
  });

  const watchTitle = watch('title');

  // Mark dirty on any user change
  const markDirty = () => {
    setIsDirty(true);
    setSaveStatus('unsaved');
  };

  // Prevent accidental navigation when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Draggable Splitter Mouse Move Listeners
  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = moveEvent.clientX - rect.left;
      const totalWidth = rect.width;
      const newRatio = Math.max(25, Math.min(75, Math.round((offsetX / totalWidth) * 100)));
      setSplitRatio(newRatio);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S to Save All Changes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveAll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modules, selectedUnit, selectedModId, selectedTopId, lessonMarkdown, lessonDescription, unitTitle, unitDuration, unitType, learningObjectives, keyPoints, unitResources, skillsInput, outcomesInput, courseStatus, courseVisibility, isFeatured]);

  // Load Course Data from Service
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const course = await courseService.getCourseBySlugOrId(id);
        if (course) {
          setCourseData(course);
          reset(course as any);

          // Thumbnails & Cover
          const thumb = course.thumbnail || (course as any).thumbnailUrl || '';
          setThumbnailPreview(thumb);
          setThumbnailPublicId((course as any).thumbnailPublicId || '');

          const cov = (course as any).coverImage || (course as any).coverImageUrl || (course as any).banner || '';
          setCoverPreview(cov);
          setCoverPublicId((course as any).coverImagePublicId || '');

          // Skills & Outcomes
          setSkillsInput(course.skills || []);
          setOutcomesInput(course.learningOutcomes || []);

          // Settings
          setCourseStatus((course.status as any) || 'published');
          setCourseVisibility((course.visibility as any) || 'public');
          setIsFeatured(Boolean(course.featured));

          // Modules & Units
          const courseMods = (course.modules as ModuleItem[]) || [];
          setModules(courseMods);

          // Expand all modules by default
          const exp: Record<string, boolean> = {};
          courseMods.forEach((m) => {
            exp[m.id] = true;
          });
          setExpandedModules(exp);

          // Auto-select first lesson if exists
          if (courseMods.length > 0 && courseMods[0].topics && courseMods[0].topics[0]?.learningUnits?.[0]) {
            const firstMod = courseMods[0];
            const firstTop = firstMod.topics[0];
            const firstUnit = firstTop.learningUnits[0];
            setSelectedUnit(firstUnit);
            setSelectedModId(firstMod.id);
            setSelectedTopId(firstTop.id);
            setUnitTitle(firstUnit.title || '');
            setUnitDuration(firstUnit.duration || '15 mins');
            setUnitType(firstUnit.type || 'Reading');
            setLessonMarkdown(firstUnit.readingContent || firstUnit.conceptTheory || '');
            setLessonDescription(firstUnit.description || '');
            setLearningObjectives(normalizeStringList(firstUnit.learningObjectives, []));
            setKeyPoints(normalizeStringList(firstUnit.keyPoints, []));
            setUnitResources(Array.isArray(firstUnit.resources) ? firstUnit.resources : (Array.isArray(firstUnit.resourceLinks) ? firstUnit.resourceLinks : []));
          }

          setIsDirty(false);
          setSaveStatus('saved');
        } else {
          toast.error('Course not found.');
          navigate('/admin/courses');
        }
      } catch (err) {
        toast.error('Error fetching course data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, reset, navigate]);

  // AI Autofill Trigger
  const handleAiAutofill = async () => {
    const titleVal = getValues('title');
    if (!titleVal || titleVal.trim().length < 3) {
      toast.error('Please enter at least 3 characters in the Course Title first.');
      return;
    }

    setIsAutofilling(true);
    try {
      const result = await aiAutofillService.autofillCourse({
        title: titleVal.trim(),
        category: getValues('category'),
        level: getValues('level'),
      });

      if (result.shortDescription) setValue('shortDescription', result.shortDescription);
      if (result.fullDescription) setValue('description', result.fullDescription);
      if (result.category) setValue('category', result.category as any);
      if (result.level) setValue('level', result.level as any);
      if (result.durationHours) setValue('duration', `${result.durationHours} Hours`);
      if (result.learningOutcomes && result.learningOutcomes.length > 0) {
        setOutcomesInput(result.learningOutcomes);
        setValue('learningOutcomes', result.learningOutcomes as any);
      }
      if (result.tags && result.tags.length > 0) {
        setSkillsInput(result.tags);
        setValue('skills', result.tags as any);
      }

      markDirty();
      toast.success('✨ Course details autofilled! Review and save your changes.');
    } catch (err: any) {
      toast.error(err.message || 'Autofill failed — please try again.');
    } finally {
      setIsAutofilling(false);
    }
  };

  // Skill Helpers
  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...skillsInput, newSkill.trim()];
    setSkillsInput(updated);
    setValue('skills', updated as any);
    setNewSkill('');
    markDirty();
  };

  const removeSkill = (index: number) => {
    const updated = skillsInput.filter((_, i) => i !== index);
    setSkillsInput(updated);
    setValue('skills', updated as any);
    markDirty();
  };

  // Outcome Helpers
  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    const updated = [...outcomesInput, newOutcome.trim()];
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated as any);
    setNewOutcome('');
    markDirty();
  };

  const removeOutcome = (index: number) => {
    const updated = outcomesInput.filter((_, i) => i !== index);
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated as any);
    markDirty();
  };

  // ── Curriculum Tree Actions ────────────────────────────────────────────────
  const toggleModuleExpand = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleExpandAll = () => {
    const allExpanded = modules.length > 0 && modules.every((m) => expandedModules[m.id]);
    const newState: Record<string, boolean> = {};
    modules.forEach((m) => {
      newState[m.id] = !allExpanded;
    });
    setExpandedModules(newState);
  };

  const handleDuplicateModule = (modId: string) => {
    const target = modules.find((m) => m.id === modId);
    if (!target) return;
    const now = Date.now();
    const clonedMod: ModuleItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `module-${now}`,
      title: `${target.title} (Copy)`,
      topics: (target.topics || []).map((t: any, tIdx: number) => ({
        ...JSON.parse(JSON.stringify(t)),
        id: `topic-${now}-${tIdx + 1}`,
        learningUnits: (t.learningUnits || []).map((u: any, uIdx: number) => ({
          ...JSON.parse(JSON.stringify(u)),
          id: `unit-${now}-${tIdx + 1}-${uIdx + 1}`,
        })),
      })),
    };
    const modIndex = modules.findIndex((m) => m.id === modId);
    const updated = [...modules];
    updated.splice(modIndex + 1, 0, clonedMod);
    setModules(updated);
    setExpandedModules((prev) => ({ ...prev, [clonedMod.id]: true }));
    markDirty();
    toast.success(`Module "${clonedMod.title}" duplicated.`);
  };

  const handleDuplicateUnit = (modId: string, topId: string, unit: LearningUnitItem) => {
    const now = Date.now();
    const clonedUnit: LearningUnitItem = {
      ...JSON.parse(JSON.stringify(unit)),
      id: `unit-${now}`,
      title: `${unit.title} (Copy)`,
    };
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          topics: (m.topics || []).map((t) => {
            if (t.id !== topId) return t;
            const units = [...(t.learningUnits || [])];
            const uIdx = units.findIndex((u) => u.id === unit.id);
            clonedUnit.order = units.length + 1;
            units.splice(uIdx + 1, 0, clonedUnit);
            units.forEach((u, i) => {
              u.order = i + 1;
            });
            return { ...t, learningUnits: units };
          }),
        };
      })
    );
    markDirty();
    toast.success(`Unit "${clonedUnit.title}" duplicated.`);
  };

  // Sync active unit state into local modules hierarchy
  const syncCurrentUnitToModules = useCallback(() => {
    if (selectedUnit && selectedModId && selectedTopId) {
      setModules((prevMods) =>
        prevMods.map((m) => {
          if (m.id !== selectedModId) return m;
          return {
            ...m,
            topics: (m.topics || []).map((t) => {
              if (t.id !== selectedTopId) return t;
              return {
                ...t,
                learningUnits: (t.learningUnits || []).map((u) => {
                  if (u.id !== selectedUnit.id) return u;
                  return {
                    ...u,
                    title: unitTitle || u.title,
                    duration: unitDuration || u.duration,
                    type: unitType || u.type,
                    readingContent: lessonMarkdown,
                    conceptTheory: lessonMarkdown,
                    description: lessonDescription,
                    learningObjectives,
                    keyPoints,
                    resources: unitResources,
                    resourceLinks: unitResources,
                  };
                }),
              };
            }),
          };
        })
      );
    }
  }, [selectedUnit, selectedModId, selectedTopId, unitTitle, unitDuration, unitType, lessonMarkdown, lessonDescription, learningObjectives, keyPoints, unitResources]);

  const handleSelectUnit = (unit: LearningUnitItem, modId: string, topId: string) => {
    syncCurrentUnitToModules();

    setSelectedUnit(unit);
    setSelectedModId(modId);
    setSelectedTopId(topId);
    setUnitTitle(unit.title || '');
    setUnitDuration(unit.duration || '15 mins');
    setUnitType(unit.type || 'Reading');
    setLessonMarkdown(unit.readingContent || unit.conceptTheory || '');
    setLessonDescription(unit.description || '');
    setLearningObjectives(normalizeStringList(unit.learningObjectives, []));
    setKeyPoints(normalizeStringList(unit.keyPoints, []));
    setUnitResources(Array.isArray(unit.resources) ? unit.resources : (Array.isArray(unit.resourceLinks) ? unit.resourceLinks : []));
  };

  const handleAddModule = () => {
    if (!newModuleName.trim()) return;
    const newMod: ModuleItem = {
      id: `module-${Date.now()}`,
      title: newModuleName.trim(),
      description: 'Core concepts and architectural overview',
      duration: '4 Hours',
      topics: [
        {
          id: `topic-${Date.now()}-1`,
          title: 'Foundations & Core Concepts',
          description: 'Topic introduction and fundamental theory',
          estimatedDuration: '45 mins',
          learningUnits: [
            {
              id: `unit-${Date.now()}-1`,
              title: 'Introduction & Overview',
              description: 'Core introduction to this module concept.',
              type: 'Reading',
              duration: '15 mins',
              readingContent: '# Introduction\n\nWelcome to this lesson topic.',
              order: 1,
            },
          ],
        },
      ],
    };
    const updated = [...modules, newMod];
    setModules(updated);
    setExpandedModules((prev) => ({ ...prev, [newMod.id]: true }));
    setNewModuleName('');
    setShowAddModuleModal(false);
    markDirty();
    toast.success(`Module "${newMod.title}" created.`);
  };

  const handleDeleteModule = (modId: string) => {
    const target = modules.find((m) => m.id === modId);
    if (!target) return;
    if (confirm(`Are you sure you want to delete module "${target.title}"?`)) {
      const updated = modules.filter((m) => m.id !== modId);
      setModules(updated);
      if (selectedModId === modId) {
        setSelectedUnit(null);
        setSelectedModId(null);
        setSelectedTopId(null);
      }
      markDirty();
      toast.success('Module removed.');
    }
  };

  const handleAddTopic = () => {
    if (!newTopicName.trim() || !activeTopicParentModId) return;
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== activeTopicParentModId) return m;
        const newTop: TopicItem = {
          id: `topic-${Date.now()}`,
          title: newTopicName.trim(),
          description: 'Topic overview and practice exercises',
          estimatedDuration: '45 mins',
          learningUnits: [
            {
              id: `unit-${Date.now()}-1`,
              title: 'Lesson 1',
              description: 'Topic introduction',
              type: 'Reading',
              duration: '15 mins',
              readingContent: '# Lesson Overview\n\nWrite lesson markdown here.',
              order: 1,
            },
          ],
        };
        return {
          ...m,
          topics: [...(m.topics || []), newTop],
        };
      })
    );
    setNewTopicName('');
    setShowAddTopicModal(false);
    setActiveTopicParentModId(null);
    markDirty();
    toast.success('Topic added.');
  };

  const handleAddUnit = () => {
    if (!newUnitName.trim() || !activeUnitParentInfo) return;
    const { modId, topId } = activeUnitParentInfo;
    const newUnit: LearningUnitItem = {
      id: `unit-${Date.now()}`,
      title: newUnitName.trim(),
      description: 'Lesson overview',
      type: 'Reading',
      duration: '15 mins',
      readingContent: `# ${newUnitName.trim()}\n\nAdd your lesson content here.`,
      order: 1,
    };

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          topics: (m.topics || []).map((t) => {
            if (t.id !== topId) return t;
            newUnit.order = (t.learningUnits || []).length + 1;
            return {
              ...t,
              learningUnits: [...(t.learningUnits || []), newUnit],
            };
          }),
        };
      })
    );

    setSelectedUnit(newUnit);
    setSelectedModId(modId);
    setSelectedTopId(topId);
    setUnitTitle(newUnit.title);
    setUnitDuration(newUnit.duration);
    setUnitType(newUnit.type);
    setLessonMarkdown(newUnit.readingContent || '');
    setLessonDescription(newUnit.description || '');
    setLearningObjectives([]);
    setKeyPoints([]);
    setUnitResources([]);
    setNewUnitName('');
    setShowAddUnitModal(false);
    setActiveUnitParentInfo(null);
    markDirty();
    toast.success(`Unit "${newUnit.title}" added.`);
  };

  const handleDeleteUnit = (modId: string, topId: string, unitId: string) => {
    if (confirm('Are you sure you want to delete this learning unit?')) {
      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== modId) return m;
          return {
            ...m,
            topics: (m.topics || []).map((t) => {
              if (t.id !== topId) return t;
              return {
                ...t,
                learningUnits: (t.learningUnits || []).filter((u) => u.id !== unitId),
              };
            }),
          };
        })
      );
      if (selectedUnit?.id === unitId) {
        setSelectedUnit(null);
      }
      markDirty();
      toast.success('Learning unit removed.');
    }
  };

  // Reorder Modules Up/Down
  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === modules.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...modules];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setModules(updated);
    markDirty();
  };

  // Reorder Units Up/Down
  const moveUnit = (modId: string, topId: string, unitIdx: number, direction: 'up' | 'down') => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== modId) return m;
        return {
          ...m,
          topics: (m.topics || []).map((t) => {
            if (t.id !== topId) return t;
            const units = [...(t.learningUnits || [])];
            if (direction === 'up' && unitIdx === 0) return t;
            if (direction === 'down' && unitIdx === units.length - 1) return t;
            const targetIdx = direction === 'up' ? unitIdx - 1 : unitIdx + 1;
            const temp = units[unitIdx];
            units[unitIdx] = units[targetIdx];
            units[targetIdx] = temp;
            units.forEach((u, i) => {
              u.order = i + 1;
            });
            return { ...t, learningUnits: units };
          }),
        };
      })
    );
    markDirty();
  };

  // ── Markdown Toolbar Helpers ───────────────────────────────────────────────
  const insertMarkdown = (syntax: string, customPayload?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = lessonMarkdown.substring(start, end);
    let prefix = '';
    let suffix = '';
    let placeholder = selected;

    switch (syntax) {
      case 'bold':
        prefix = '**';
        suffix = '**';
        placeholder = selected || 'bold text';
        break;
      case 'italic':
        prefix = '*';
        suffix = '*';
        placeholder = selected || 'italic text';
        break;
      case 'h1':
        prefix = '\n# ';
        placeholder = selected || 'Main Heading';
        break;
      case 'h2':
        prefix = '\n## ';
        placeholder = selected || 'Section Heading';
        break;
      case 'h3':
        prefix = '\n### ';
        placeholder = selected || 'Sub-section Heading';
        break;
      case 'list':
        prefix = '\n- ';
        placeholder = selected || 'List item';
        break;
      case 'list-ordered':
        prefix = '\n1. ';
        placeholder = selected || 'Numbered item';
        break;
      case 'step-list':
        prefix = '\n1. **Step 1: Setup Environment** — Prepare your local toolchain.\n2. **Step 2: Core Implementation** — Execute the primary algorithm logic.\n3. **Step 3: Verification & Testing** — Validate outputs against edge cases.\n';
        placeholder = '';
        break;
      case 'checklist':
        prefix = '\n- [ ] Conceptual review completed\n- [ ] Run hands-on simulator lab\n- [ ] Examine boundary and performance constraints\n- [ ] Submit module assessment\n';
        placeholder = '';
        break;
      case 'pros-cons':
        prefix = '\n| Approach / Design | ✅ Advantages (Pros) | ❌ Tradeoffs / Cons |\n|---|---|---|\n| Solution A | High performance, low latency | Greater memory overhead |\n| Solution B | Compact footprint | Slightly higher execution time |\n';
        placeholder = '';
        break;
      case 'callout-tip':
        prefix = '\n> **Tip**: ';
        placeholder = selected || 'Key practical insight or efficiency suggestion.';
        suffix = '\n';
        break;
      case 'callout-note':
        prefix = '\n> **Note**: ';
        placeholder = selected || 'Important background context or architectural rule.';
        suffix = '\n';
        break;
      case 'callout-warning':
        prefix = '\n> **Warning**: ';
        placeholder = selected || 'Potential pitfall, memory leak, or breaking change to avoid.';
        suffix = '\n';
        break;
      case 'divider':
        prefix = '\n\n---\n\n';
        placeholder = '';
        break;
      case 'code':
        {
          const lang = customPayload || 'typescript';
          prefix = `\n\`\`\`${lang}\n`;
          suffix = '\n\`\`\`\n';
          placeholder = selected || `// Write ${lang.toUpperCase()} code here`;
        }
        break;
      case 'quote':
        prefix = '\n> ';
        placeholder = selected || 'Key takeaway or important note';
        break;
      case 'table':
        prefix = '\n| Concept | Description | Syntax / Example |\n|---|---|---|\n| Pointer Declaration | Defines a pointer variable | `int *ptr = &val;` |\n| Dereferencing | Accesses value at memory address | `*ptr = 100;` |\n| Memory Address | Location in memory | `&val` |\n';
        placeholder = '';
        break;
      case 'image':
        prefix = customPayload || `\n![Illustration](https://images.unsplash.com/photo-1516116211227-bbc03e3c6628?auto=format&fit=crop&w=800&q=80)\n`;
        placeholder = '';
        break;
      case 'link':
        prefix = customPayload || `\n[Reference Link](https://example.com)\n`;
        placeholder = '';
        break;
      case 'flowchart':
        prefix = `\n\`\`\`mermaid\n${customPayload || 'flowchart TD\n  Start([Start]) --> Process[Execute Process] --> End([Done])'}\n\`\`\`\n`;
        placeholder = '';
        break;
      case 'practice-sql':
        prefix = '\n```practice-sql\n-- @title: SQL Hands-on Lab\nCREATE TABLE learners (id INT, name TEXT, score INT);\nINSERT INTO learners VALUES (1, "Bhanu", 95);\nSELECT * FROM learners;\n```\n';
        break;
      case 'practice-terminal':
        prefix = '\n```practice-terminal\n# @title: Linux Terminal Practice\n```\n';
        break;
      case 'practice-git':
        prefix = '\n```practice-git\n# @title: Interactive Git Sandbox\n```\n';
        break;
      case 'practice-code':
        prefix = '\n```practice-python\ndef solution():\n    print("Hello from KaizenQ!")\nsolution()\n```\n';
        break;
      case 'practice-web':
        prefix = '\n```practice-web\n<h1>Interactive Web Component</h1>\n```\n';
        break;
      case 'practice-k8s':
        prefix = '\n```practice-k8s\n# Interactive Kubernetes Simulator\n```\n';
        break;
      default:
        break;
    }

    const replacement = prefix + placeholder + suffix;
    const newContent = lessonMarkdown.substring(0, start) + replacement + lessonMarkdown.substring(end);
    setLessonMarkdown(newContent);
    markDirty();

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + placeholder.length);
    }, 50);
  };

  // Flowchart Template Selector Handler
  const handleSelectFlowchartTemplate = (type: string) => {
    setFlowchartType(type);
    switch (type) {
      case 'decision':
        setFlowchartMermaidCode(
          'flowchart TD\n  Start([🚀 Start]) --> Validate{Is Input Valid?}\n  Validate -- Yes --> Process[⚙️ Process Execution]\n  Validate -- No --> HandleError[⚠️ Log Error & Retry]\n  HandleError --> Start\n  Process --> Result[/📤 Return Result/]\n  Result --> End([✅ Complete])'
        );
        break;
      case 'architecture':
        setFlowchartMermaidCode(
          'flowchart LR\n  Client[💻 Web Client] --> Gateway[⚡ API Gateway]\n  Gateway --> Auth[🔐 Auth Service]\n  Gateway --> NodeAPI[📦 Express Core API]\n  NodeAPI --> DB[(🗄️ Cloud Firestore)]\n  NodeAPI --> Storage[(☁️ Cloudinary Media)]\n  NodeAPI --> Cache[(⚡ Redis Cache)]'
        );
        break;
      case 'sequence':
        setFlowchartMermaidCode(
          'sequenceDiagram\n  autonumber\n  actor Student as 🧑‍🎓 Student Learner\n  participant Web as 💻 Frontend Client\n  participant API as ⚡ Backend Server\n  participant DB as 🗄️ Firestore Database\n\n  Student->>Web: Click Start Quiz\n  Web->>API: POST /api/quizzes/:id/start\n  API->>DB: Check Max Attempts & Init\n  DB-->>API: Attempt Document\n  API-->>Web: 200 OK (Sanitized Questions)\n  Web-->>Student: Display Live Quiz & Timer'
        );
        break;
      case 'roadmap':
        setFlowchartMermaidCode(
          'flowchart TD\n  Step1[1️⃣ Foundations & Syntax Theory] --> Step2[2️⃣ Interactive Lab & Live Simulator]\n  Step2 --> Step3[3️⃣ Real-world Coding Exercises]\n  Step3 --> Step4[4️⃣ Comprehensive Assessment Quiz]\n  Step4 --> Step5([🎓 Verified Certificate Issued])'
        );
        break;
      case 'mindmap':
        setFlowchartMermaidCode(
          'mindmap\n  root((Core Topic Concepts))\n    Theoretical Foundations\n      Core Principles\n      System Architecture\n    Practical Implementations\n      Code Examples\n      Edge Case Handling\n    Performance & Scaling\n      Memory Optimization\n      Time Complexity'
        );
        break;
      case 'state':
        setFlowchartMermaidCode(
          'stateDiagram-v2\n  [*] --> Draft: Content Created\n  Draft --> Review: Submit for Review\n  Review --> Published: Approve Lesson\n  Review --> Draft: Request Revisions\n  Published --> Archived: Deprecate Lesson\n  Archived --> [*]'
        );
        break;
      default:
        break;
    }
  };

  const handleInsertFlowchart = () => {
    insertMarkdown('flowchart', flowchartMermaidCode.trim());
    setShowFlowchartModal(false);
    toast.success('Flowchart diagram inserted into lesson!');
  };

  // Image Modal Insert Handler
  const handleInsertCloudinaryImage = () => {
    if (!imageToInsertUrl.trim()) {
      toast.error('Please upload or provide an image URL first.');
      return;
    }
    const alt = imageAltText.trim() || 'Diagram';
    const markdownImg = `\n![${alt}](${imageToInsertUrl.trim()})\n`;
    insertMarkdown('image', markdownImg);
    setShowImageModal(false);
    setImageToInsertUrl('');
    setImageToInsertPublicId('');
    setImageAltText('');
    toast.success('Image inserted into lesson markdown!');
  };

  // Link Modal Insert Handler
  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      toast.error('Please provide a URL.');
      return;
    }
    const label = linkText.trim() || linkUrl.trim();
    const markdownLink = `[${label}](${linkUrl.trim()})`;
    insertMarkdown('link', markdownLink);
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
  };

  // Code Block Modal Insert Handler
  const handleInsertCodeBlock = () => {
    insertMarkdown('code', codeLanguage);
    setShowCodeModal(false);
  };

  // Learning Objectives Helpers
  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    const updated = [...learningObjectives, newObjective.trim()];
    setLearningObjectives(updated);
    setNewObjective('');
    markDirty();
  };

  const handleRemoveObjective = (idx: number) => {
    const updated = learningObjectives.filter((_, i) => i !== idx);
    setLearningObjectives(updated);
    markDirty();
  };

  // Key Takeaways Helpers
  const handleAddKeyPoint = () => {
    if (!newKeyPoint.trim()) return;
    const updated = [...keyPoints, newKeyPoint.trim()];
    setKeyPoints(updated);
    setNewKeyPoint('');
    markDirty();
  };

  const handleRemoveKeyPoint = (idx: number) => {
    const updated = keyPoints.filter((_, i) => i !== idx);
    setKeyPoints(updated);
    markDirty();
  };

  // ── Resource Manager Helpers ──────────────────────────────────────────────
  const handleSaveResource = () => {
    if (!resTitle.trim() || !resUrl.trim()) {
      toast.error('Please enter both Resource Title and URL.');
      return;
    }

    const newRes = {
      id: editingResourceIndex !== null ? unitResources[editingResourceIndex]?.id || `res-${Date.now()}` : `res-${Date.now()}`,
      title: resTitle.trim(),
      description: resDescription.trim(),
      type: resType,
      url: resUrl.trim(),
      downloadable: resDownloadable,
    };

    let updated: any[];
    if (editingResourceIndex !== null) {
      updated = [...unitResources];
      updated[editingResourceIndex] = newRes;
    } else {
      updated = [...unitResources, newRes];
    }

    setUnitResources(updated);
    setShowAddResourceModal(false);
    setEditingResourceIndex(null);
    setResTitle('');
    setResDescription('');
    setResUrl('');
    setResDownloadable(true);
    markDirty();
    toast.success('Resource saved for unit.');
  };

  const handleDeleteResource = (idx: number) => {
    const updated = unitResources.filter((_, i) => i !== idx);
    setUnitResources(updated);
    markDirty();
    toast.success('Resource removed.');
  };

  const moveResource = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === unitResources.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...unitResources];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setUnitResources(updated);
    markDirty();
  };

  // ── Master Save Handler ───────────────────────────────────────────────────
  const handleSaveAll = async (forceVersion?: number) => {
    if (!id) return;
    if (outcomesInput.length < 2) {
      toast.error('Please provide at least 2 learning outcomes in Details.');
      setActiveTab('details');
      return;
    }

    setSaveStatus('saving');

    // Make sure active unit values are baked into the latest modules state
    let currentModulesState = [...modules];
    if (selectedUnit && selectedModId && selectedTopId) {
      currentModulesState = currentModulesState.map((m) => {
        if (m.id !== selectedModId) return m;
        return {
          ...m,
          topics: (m.topics || []).map((t) => {
            if (t.id !== selectedTopId) return t;
            return {
              ...t,
              learningUnits: (t.learningUnits || []).map((u) => {
                if (u.id !== selectedUnit.id) return u;
                return {
                  ...u,
                  title: unitTitle || u.title,
                  duration: unitDuration || u.duration,
                  type: unitType || u.type,
                  readingContent: lessonMarkdown,
                  conceptTheory: lessonMarkdown,
                  description: lessonDescription,
                  learningObjectives,
                  keyPoints,
                  resources: unitResources,
                  resourceLinks: unitResources,
                };
              }),
            };
          }),
        };
      });
      setModules(currentModulesState);
    }

    try {
      const formValues = getValues();
      const resolvedVersion = typeof forceVersion === 'number' ? forceVersion : (courseData?.version || 1);
      const payload: any = {
        ...courseData,
        ...formValues,
        version: resolvedVersion,
        thumbnail: thumbnailPreview || formValues.thumbnail || courseData.thumbnail,
        thumbnailUrl: thumbnailPreview || formValues.thumbnail || courseData.thumbnail,
        thumbnailPublicId: thumbnailPublicId || undefined,
        coverImage: coverPreview || undefined,
        coverImageUrl: coverPreview || undefined,
        coverImagePublicId: coverPublicId || undefined,
        skills: skillsInput,
        learningOutcomes: outcomesInput,
        modules: currentModulesState,
        status: courseStatus,
        visibility: courseVisibility,
        featured: isFeatured,
        updatedAt: new Date().toISOString(),
      };

      const updated = await courseService.updateCourse(id, payload);
      await refreshCourses();

      if (updated && updated.version) {
        setCourseData((prev: any) => ({ ...prev, version: updated.version }));
      }

      setIsDirty(false);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
      toast.success('🎉 Course and lesson changes saved successfully!');
    } catch (err: any) {
      setSaveStatus('error');
      if (err.status === 409 || err.conflict) {
        setConflictServerVersion(err.serverVersion || null);
        setShowConflictModal(true);
      } else {
        toast.error(err.message || 'Failed to save course changes.');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-['Sora'] text-slate-100 max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      
      {/* Top Header & Save Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isDirty) {
                setPendingNavDestination('/admin/courses');
                setShowUnsavedModal(true);
              } else {
                navigate('/admin/courses');
              }
            }}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Back to Courses"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                Course CMS Editor
              </span>
              {isDirty ? (
                <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Unsaved changes (Ctrl+S to save)
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {lastSavedTime === 'Saved' ? 'Saved' : `Saved at ${lastSavedTime}`}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate max-w-xl">
              {watchTitle || 'Edit Course'}
            </h1>
          </div>
        </div>

        {/* Global Save & Student View Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={`/dashboard/course/${id}`}
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-4 h-4 text-sky-500" />
            <span>Student View</span>
          </Link>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saveStatus === 'saving'}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Tabbed Navigation Bar ─────────────────────────────────────────── */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-2xl px-2 py-1.5 shadow-xs">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold">
          {[
            { id: 'details', label: '1. Course Details', icon: BookOpen },
            { id: 'curriculum', label: `2. Curriculum (${modules.length} Modules)`, icon: Layers },
            { id: 'content', label: `3. Lesson Content (${unitTitle ? unitTitle.substring(0, 18) + '...' : 'Select Unit'})`, icon: FileText },
            { id: 'resources', label: `4. Resources (${unitResources.length})`, icon: Paperclip },
            { id: 'assessment', label: '5. Quiz / Assessment', icon: Award },
            { id: 'settings', label: '6. Settings & Visibility', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as CourseTab)}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: COURSE DETAILS                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  Basic Course Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update course headline, level, categorization, and pricing.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAiAutofill}
                disabled={isAutofilling || !watchTitle || watchTitle.trim().length < 3}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAutofilling ? 'animate-spin text-amber-300' : 'text-amber-300'}`} />
                <span>{isAutofilling ? 'Autofilling...' : '✨ Autofill with AI'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Title *</label>
                <input
                  type="text"
                  {...register('title', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
                {errors.title && <span className="text-rose-500 text-[11px]">{errors.title.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
                <select
                  {...register('category', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                >
                  <option value="Linux & Systems">Linux & Systems</option>
                  <option value="AI & Data">AI & Data</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Development Tools">Development Tools</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Programming">Programming</option>
                  <option value="Database">Database</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty Level *</label>
                <select
                  {...register('level', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                >
                  <option value="all_levels">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estimated Duration *</label>
                <input
                  type="text"
                  {...register('duration', { onChange: markDirty })}
                  placeholder="e.g. 40 Hours or 6 Weeks"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Price (₹ INR)</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true, onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Short Summary *</label>
                <textarea
                  rows={2}
                  {...register('shortDescription', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Course Description *</label>
                <textarea
                  rows={4}
                  {...register('description', { onChange: markDirty })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                />
              </div>
            </div>
          </div>

          {/* Cloudinary Media Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Course Thumbnail */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500" /> Course Thumbnail
                </h3>
                <span className="text-[10px] font-mono text-slate-400">16:9 • 1280x720</span>
              </div>
              <CloudinaryUploadZone
                currentImageUrl={thumbnailPreview}
                currentPublicId={thumbnailPublicId}
                folder={`kaizenq/courses/${id || 'course'}/thumbnail`}
                onUploadSuccess={(res) => {
                  setThumbnailPreview(res.secureUrl);
                  setThumbnailPublicId(res.publicId);
                  setValue('thumbnail', res.secureUrl, { shouldValidate: true });
                  markDirty();
                }}
                onImageRemove={() => {
                  setThumbnailPreview('');
                  setThumbnailPublicId('');
                  setValue('thumbnail', '');
                  markDirty();
                }}
              />
            </div>

            {/* Course Cover / Banner */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-sky-500" /> Cover / Banner Image
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Panoramic • 1920x600</span>
              </div>
              <CloudinaryUploadZone
                currentImageUrl={coverPreview}
                currentPublicId={coverPublicId}
                folder={`kaizenq/courses/${id || 'course'}/cover`}
                onUploadSuccess={(res) => {
                  setCoverPreview(res.secureUrl);
                  setCoverPublicId(res.publicId);
                  markDirty();
                }}
                onImageRemove={() => {
                  setCoverPreview('');
                  setCoverPublicId('');
                  markDirty();
                }}
              />
            </div>

          </div>

          {/* Skills & Learning Outcomes */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Skills Taught</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Docker, TypeScript, Microservices..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsInput.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {s}
                    <button type="button" onClick={() => removeSkill(idx)} className="text-rose-500 hover:text-rose-600 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Learning Outcomes *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  placeholder="e.g. Master state management and performance tuning in large applications"
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={addOutcome}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 pt-1">
                {outcomesInput.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    <span className="text-slate-800 dark:text-slate-200">✓ {outcome}</span>
                    <button type="button" onClick={() => removeOutcome(idx)} className="text-rose-500 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: CURRICULUM TREE & DRAG/DROP REORDERING                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                Curriculum Structure
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize Course Modules, Topics, and Learning Units with smooth drag handles.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleExpandAll}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronsUpDown className="w-4 h-4" />
                <span>{modules.length > 0 && modules.every((m) => expandedModules[m.id]) ? 'Collapse All' : 'Expand All'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddModuleModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Module</span>
              </button>
            </div>
          </div>

          <Reorder.Group
            axis="y"
            values={modules}
            onReorder={(newMods) => {
              setModules(newMods);
              markDirty();
            }}
            className="space-y-4"
          >
            {modules.map((mod, modIdx) => {
              const isExpanded = expandedModules[mod.id] ?? true;
              return (
                <Reorder.Item
                  key={mod.id}
                  value={mod}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                >
                  {/* Module Header Bar */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleModuleExpand(mod.id)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold flex items-center justify-center">
                        {String(modIdx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {mod.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveModule(modIdx, 'up')}
                        disabled={modIdx === 0}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Module Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveModule(modIdx, 'down')}
                        disabled={modIdx === modules.length - 1}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Module Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTopicParentModId(mod.id);
                          setShowAddTopicModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Topic
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateModule(mod.id)}
                        className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-indigo-500 transition-colors cursor-pointer"
                        title="Duplicate Module"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-500 transition-colors cursor-pointer"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Topics and Units Container */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {(mod.topics || []).map((top) => (
                        <div
                          key={top.id}
                          className="pl-4 sm:pl-6 border-l-2 border-indigo-500/30 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              {top.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveUnitParentInfo({ modId: mod.id, topId: top.id });
                                setShowAddUnitModal(true);
                              }}
                              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Unit
                            </button>
                          </div>

                          {/* Unit Cards List with Drag & Reorder */}
                          <Reorder.Group
                            axis="y"
                            values={top.learningUnits || []}
                            onReorder={(newUnits) => {
                              setModules((prev) =>
                                prev.map((m) => {
                                  if (m.id !== mod.id) return m;
                                  return {
                                    ...m,
                                    topics: (m.topics || []).map((t) => {
                                      if (t.id !== top.id) return t;
                                      return { ...t, learningUnits: newUnits };
                                    }),
                                  };
                                })
                              );
                              markDirty();
                            }}
                            className="space-y-2"
                          >
                            {(top.learningUnits || []).map((unit, uIdx) => {
                              const isSelected = selectedUnit?.id === unit.id;
                              return (
                                <Reorder.Item
                                  key={unit.id}
                                  value={unit}
                                  onClick={() => handleSelectUnit(unit, mod.id, top.id)}
                                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-white shadow-xs'
                                      : 'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200">
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                    <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold truncate">{unit.title}</p>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{unit.duration || '15 mins'} • {unit.type || 'Reading'}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveUnit(mod.id, top.id, uIdx, 'up');
                                      }}
                                      disabled={uIdx === 0}
                                      className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-20 cursor-pointer"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveUnit(mod.id, top.id, uIdx, 'down');
                                      }}
                                      disabled={uIdx === (top.learningUnits || []).length - 1}
                                      className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-20 cursor-pointer"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDuplicateUnit(mod.id, top.id, unit);
                                      }}
                                      className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-indigo-500 cursor-pointer"
                                      title="Duplicate Unit"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectUnit(unit, mod.id, top.id);
                                        handleTabChange('content');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold cursor-pointer"
                                    >
                                      Edit Content
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteUnit(mod.id, top.id, unit.id);
                                      }}
                                      className="p-1 text-rose-500 hover:text-rose-600 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </Reorder.Item>
                              );
                            })}
                          </Reorder.Group>
                        </div>
                      ))}
                    </div>
                  )}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: PROFESSIONAL LESSON CONTENT STUDIO                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'content' && (
        <div className="space-y-5">
          {selectedUnit ? (
            <div className="space-y-5">
              
              {/* Unit Headline & Metadata Form */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500">
                      Lesson Configuration
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {unitTitle || 'Untitled Lesson'}
                    </h3>
                  </div>

                  {/* Mode & Split View Toggles */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Content Editor Mode Toggle */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setContentMode('arranger')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                          contentMode === 'arranger' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                        }`}
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                        <span>Drag & Set Blocks</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentMode('raw')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                          contentMode === 'raw' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Raw Markdown</span>
                      </button>
                    </div>

                    {/* Split View Toggle */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('editor')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          previewMode === 'editor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                        }`}
                      >
                        Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('split')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          previewMode === 'split' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                        }`}
                      >
                        <Columns2 className="w-3.5 h-3.5" />
                        <span>Split</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('preview')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          previewMode === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-white'
                        }`}
                      >
                        Preview
                      </button>
                    </div>

                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Lesson Title *</label>
                    <input
                      type="text"
                      value={unitTitle}
                      onChange={(e) => {
                        setUnitTitle(e.target.value);
                        markDirty();
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Duration</label>
                      <input
                        type="text"
                        value={unitDuration}
                        onChange={(e) => {
                          setUnitDuration(e.target.value);
                          markDirty();
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Type</label>
                      <select
                        value={unitType}
                        onChange={(e) => {
                          setUnitType(e.target.value as any);
                          markDirty();
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                      >
                        <option value="Reading">Reading</option>
                        <option value="Video">Video</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Assignment">Assignment</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Short Summary / Overview</label>
                    <textarea
                      rows={2}
                      value={lessonDescription}
                      onChange={(e) => {
                        setLessonDescription(e.target.value);
                        markDirty();
                      }}
                      placeholder="Brief synopsis of what this lesson covers..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                {/* Learning Objectives & Key Takeaways Collapsible Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Learning Objectives */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-500" /> Learning Objectives ({learningObjectives.length})
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        placeholder="e.g. Understand pointer dereferencing"
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleAddObjective}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {learningObjectives.map((obj, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium flex items-center gap-1">
                          {obj}
                          <button type="button" onClick={() => handleRemoveObjective(i)} className="text-rose-500 hover:text-rose-600 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500" /> Key Takeaways ({keyPoints.length})
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newKeyPoint}
                        onChange={(e) => setNewKeyPoint(e.target.value)}
                        placeholder="e.g. Always free allocated heap memory"
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyPoint}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {keyPoints.map((kp, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] font-medium flex items-center gap-1">
                          {kp}
                          <button type="button" onClick={() => handleRemoveKeyPoint(i)} className="text-rose-500 hover:text-rose-600 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Markdown Content Toolbar (Active in Raw Markdown Mode) ─────── */}
              {contentMode === 'raw' && (
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-1 text-slate-200 text-xs font-mono shadow-xs">
                  
                  {/* Headings */}
                  <button type="button" onClick={() => insertMarkdown('h1')} className="px-2 py-1 hover:bg-slate-800 rounded-lg font-extrabold cursor-pointer" title="Heading 1">H1</button>
                  <button type="button" onClick={() => insertMarkdown('h2')} className="px-2 py-1 hover:bg-slate-800 rounded-lg font-bold cursor-pointer" title="Heading 2">H2</button>
                  <button type="button" onClick={() => insertMarkdown('h3')} className="px-2 py-1 hover:bg-slate-800 rounded-lg font-semibold cursor-pointer" title="Heading 3">H3</button>

                  <div className="h-4 w-px bg-slate-700 mx-1" />

                  {/* Typography */}
                  <button type="button" onClick={() => insertMarkdown('bold')} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Bold (**text**)"><Bold className="w-4 h-4" /></button>
                  <button type="button" onClick={() => insertMarkdown('italic')} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Italic (*text*)"><Italic className="w-4 h-4" /></button>
                  <button type="button" onClick={() => insertMarkdown('quote')} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Blockquote (> text)"><Quote className="w-4 h-4" /></button>
                  <button type="button" onClick={() => insertMarkdown('divider')} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Horizontal Divider (---)"><Minus className="w-4 h-4" /></button>

                  <div className="h-4 w-px bg-slate-700 mx-1" />

                  {/* Lists & Ordering Tools */}
                  <button type="button" onClick={() => insertMarkdown('list')} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Bullet List (- item)"><List className="w-4 h-4" /></button>
                  <button type="button" onClick={() => insertMarkdown('list-ordered')} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Numbered List (1. item)"><ListOrdered className="w-4 h-4" /></button>
                  <button type="button" onClick={() => insertMarkdown('step-list')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer" title="Step-by-Step Process List">
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Steps</span>
                  </button>
                  <button type="button" onClick={() => insertMarkdown('checklist')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer" title="Task Checklist">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Checklist</span>
                  </button>
                  <button type="button" onClick={() => insertMarkdown('pros-cons')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer" title="Pros & Cons Table">
                    <span>⚖️ Pros/Cons</span>
                  </button>

                  <div className="h-4 w-px bg-slate-700 mx-1" />

                  {/* Flowchart & Architecture Diagram Builder */}
                  <button
                    type="button"
                    onClick={() => setShowFlowchartModal(true)}
                    className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 border border-indigo-500/50 text-indigo-200 rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                    title="Create Content Flowchart / Architecture Diagram"
                  >
                    <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Flowchart Builder</span>
                  </button>

                  {/* Tables & Images */}
                  <button type="button" onClick={() => insertMarkdown('table')} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Table Generator"><Table className="w-4 h-4" /></button>
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="px-2 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                    title="Upload & Insert Cloudinary Image"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(true)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Insert Hyperlink"
                  >
                    <LinkIcon className="w-4 h-4 text-sky-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCodeModal(true)}
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    title="Insert Code Block"
                  >
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Code</span>
                  </button>

                  <div className="h-4 w-px bg-slate-700 mx-1" />

                  {/* Callout Boxes */}
                  <button type="button" onClick={() => insertMarkdown('callout-tip')} className="p-1 hover:bg-slate-800 rounded text-emerald-400 font-bold text-[10px]" title="Insert Tip Callout">💡 Tip</button>
                  <button type="button" onClick={() => insertMarkdown('callout-note')} className="p-1 hover:bg-slate-800 rounded text-sky-400 font-bold text-[10px]" title="Insert Note Callout">ℹ️ Note</button>
                  <button type="button" onClick={() => insertMarkdown('callout-warning')} className="p-1 hover:bg-slate-800 rounded text-amber-400 font-bold text-[10px]" title="Insert Warning Callout">⚠️ Warn</button>

                  <div className="h-4 w-px bg-slate-700 mx-1" />

                  {/* Interactive Practice Templates */}
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => insertMarkdown('practice-sql')} className="px-2 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                      <Database className="w-3 h-3" /> SQL
                    </button>
                    <button type="button" onClick={() => insertMarkdown('practice-terminal')} className="px-2 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                      <Terminal className="w-3 h-3" /> Linux
                    </button>
                    <button type="button" onClick={() => insertMarkdown('practice-git')} className="px-2 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                      <GitBranch className="w-3 h-3" /> Git
                    </button>
                    <button type="button" onClick={() => insertMarkdown('practice-code')} className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                      <Code2 className="w-3 h-3" /> Runner
                    </button>
                    <button type="button" onClick={() => insertMarkdown('practice-web')} className="px-2 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer">
                      <Eye className="w-3 h-3" /> Web
                    </button>
                  </div>

                </div>
              )}

              {/* ── Editor / Student Preview Draggable & Resizable Split View ─────── */}
              <div ref={containerRef} className="flex flex-col md:flex-row gap-3 min-h-[550px] relative items-stretch">
                
                {/* Left Side: Drag & Set Block Arranger OR Raw Markdown Editor */}
                {(previewMode === 'split' || previewMode === 'editor') && (
                  <div
                    style={{
                      width: previewMode === 'split' ? `${splitRatio}%` : '100%',
                    }}
                    className="flex flex-col min-w-[280px] transition-[width] duration-75"
                  >
                    {contentMode === 'arranger' ? (
                      <ContentBlockArranger
                        markdown={lessonMarkdown}
                        onChange={(newMd) => {
                          setLessonMarkdown(newMd);
                          markDirty();
                        }}
                        isNightMode={true}
                      />
                    ) : (
                      <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-2 h-full">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                          <span>Raw Markdown Editor</span>
                          <span>{lessonMarkdown.length} characters • {lessonMarkdown.split(/\s+/).filter(Boolean).length} words</span>
                        </div>
                        <textarea
                          ref={textareaRef}
                          value={lessonMarkdown}
                          onChange={(e) => {
                            setLessonMarkdown(e.target.value);
                            markDirty();
                          }}
                          className="w-full flex-1 min-h-[480px] p-3 bg-transparent font-mono text-xs text-slate-100 focus:outline-hidden leading-relaxed resize-y"
                          placeholder="Write your comprehensive Markdown lesson here..."
                          spellCheck={false}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Draggable Divider Splitter Handle */}
                {previewMode === 'split' && (
                  <div
                    onMouseDown={handleStartResize}
                    className="hidden md:flex w-2.5 hover:w-3.5 bg-slate-800/80 hover:bg-indigo-600 rounded-full cursor-col-resize transition-all items-center justify-center select-none shrink-0 group"
                    title="Drag left or right to adjust layout width"
                  >
                    <div className="w-0.5 h-8 bg-slate-500 group-hover:bg-white rounded transition-colors" />
                  </div>
                )}

                {/* Right Side: Real-time Student Preview (Synchronized with MarkdownContent) */}
                {(previewMode === 'split' || previewMode === 'preview') && (
                  <div
                    style={{
                      width: previewMode === 'split' ? `${100 - splitRatio}%` : '100%',
                    }}
                    className="flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-y-auto max-h-[780px] space-y-4 min-w-[280px] transition-[width] duration-75"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-[11px] font-mono text-slate-400">
                      <span>Student View Live Preview</span>
                      <span className="text-emerald-500 font-bold">Synchronized</span>
                    </div>

                    {/* Lesson Header Banner inside preview */}
                    <div className="space-y-2">
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {unitTitle || 'Lesson Title'}
                      </h2>
                      {lessonDescription && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                          {lessonDescription}
                        </p>
                      )}
                      {learningObjectives.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {learningObjectives.map((obj, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                              🎯 {obj}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <MarkdownContent content={lessonMarkdown} />
                    </div>

                    {keyPoints.length > 0 && (
                      <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2">
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-amber-500" /> Key Takeaways
                        </h4>
                        <ul className="list-disc pl-5 text-xs space-y-1">
                          {keyPoints.map((kp, i) => (
                            <li key={i}>{kp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Lesson Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please select a learning unit from the Curriculum tab to begin editing its title, markdown content, and resources.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange('curriculum')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Go to Curriculum
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: UNIT RESOURCES                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                Downloadable & External Resources
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attach PDFs, lab workbooks, GitHub repositories, and links to {unitTitle ? `"${unitTitle}"` : 'the selected unit'}.
              </p>
            </div>

            {selectedUnit && (
              <button
                type="button"
                onClick={() => {
                  setEditingResourceIndex(null);
                  setResTitle('');
                  setResDescription('');
                  setResUrl('');
                  setResType('pdf');
                  setResDownloadable(true);
                  setShowAddResourceModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            )}
          </div>

          {selectedUnit ? (
            <div className="space-y-3">
              {unitResources.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                  No resources attached to this unit yet. Click <strong>Add Resource</strong> above to link documentation, PDFs, or GitHub repos.
                </div>
              ) : (
                unitResources.map((res, idx) => (
                  <div
                    key={res.id || idx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {res.type === 'github' ? <GitFork className="w-4 h-4" /> : res.type === 'video' ? <Video className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{res.title}</p>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {res.type}
                          </span>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-sky-500 hover:underline flex items-center gap-1 truncate"
                        >
                          <span>{res.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveResource(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveResource(idx, 'down')}
                        disabled={idx === unitResources.length - 1}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingResourceIndex(idx);
                          setResTitle(res.title || '');
                          setResDescription(res.description || '');
                          setResUrl(res.url || '');
                          setResType(res.type || 'pdf');
                          setResDownloadable(Boolean(res.downloadable));
                          setShowAddResourceModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(idx)}
                        className="p-1 text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <Paperclip className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Unit Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a learning unit to configure attachments, workbooks, and resource links.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: QUIZ & ASSESSMENT MANAGEMENT                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'assessment' && (
        <AdminQuizManager
          courseId={id || ''}
          courseTitle={watchTitle}
          lessonId={selectedUnit?.id}
          unitTitle={unitTitle}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 6: COURSE SETTINGS & VISIBILITY                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
              Publication & Visibility
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Status</label>
                <select
                  value={courseStatus}
                  onChange={(e) => {
                    setCourseStatus(e.target.value as any);
                    markDirty();
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="published">🟢 Published (Live in catalog)</option>
                  <option value="draft">🟡 Draft (Hidden from students)</option>
                  <option value="archived">🔴 Archived</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Access Visibility</label>
                <select
                  value={courseVisibility}
                  onChange={(e) => {
                    setCourseVisibility(e.target.value as any);
                    markDirty();
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="public">Public (Visible to everyone)</option>
                  <option value="private">Private (Restricted access)</option>
                  <option value="unlisted">Unlisted (Direct link only)</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => {
                      setIsFeatured(e.target.checked);
                      markDirty();
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Feature this course on platform homepage banner
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Flowchart & Diagram Builder Modal ─────────────────────────────── */}
      {showFlowchartModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-500" /> Content Flowchart & Diagram Builder
              </h3>
              <button type="button" onClick={() => setShowFlowchartModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagram Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select Flowchart Template</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: 'decision', label: 'Decision Flow' },
                  { id: 'architecture', label: 'Architecture' },
                  { id: 'sequence', label: 'Sequence' },
                  { id: 'roadmap', label: 'Roadmap' },
                  { id: 'mindmap', label: 'Mindmap' },
                  { id: 'state', label: 'State Machine' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectFlowchartTemplate(tpl.id)}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      flowchartType === tpl.id
                        ? 'bg-indigo-600 text-white border-indigo-600 font-extrabold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mermaid Code Editor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Mermaid Diagram Code</label>
              <textarea
                rows={5}
                value={flowchartMermaidCode}
                onChange={(e) => setFlowchartMermaidCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-indigo-200 font-mono focus:outline-hidden leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Real-time Flowchart Diagram Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Interactive Visual Preview</label>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 max-h-56 overflow-y-auto">
                <MermaidDiagram chart={flowchartMermaidCode} isNightMode={true} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowFlowchartModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertFlowchart}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Insert Flowchart into Lesson</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Module Modal ──────────────────────────────────────────────── */}
      {showAddModuleModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Add New Module</h3>
            <input
              type="text"
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              placeholder="e.g. Module 01: Core Architecture"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModuleModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddModule}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Create Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Topic Modal ───────────────────────────────────────────────── */}
      {showAddTopicModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Add Topic to Module</h3>
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="e.g. Topic: Memory Allocation & Pointers"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddTopicModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Unit Modal ────────────────────────────────────────────────── */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Add Learning Unit</h3>
            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="e.g. Pointer Arithmetic & Buffer Safety"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddUnit}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Add Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Insert Cloudinary Image Modal ─────────────────────────────────── */}
      {showImageModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" /> Insert Image into Lesson
              </h3>
              <button type="button" onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Upload via Cloudinary (JPG, PNG, WEBP)</label>
                <CloudinaryUploadZone
                  currentImageUrl={imageToInsertUrl}
                  currentPublicId={imageToInsertPublicId}
                  folder={`kaizenq/courses/${id || 'course'}/lessons/${selectedUnit?.id || 'unit'}`}
                  onUploadSuccess={(res) => {
                    setImageToInsertUrl(res.secureUrl);
                    setImageToInsertPublicId(res.publicId);
                  }}
                  onImageRemove={() => {
                    setImageToInsertUrl('');
                    setImageToInsertPublicId('');
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Image Alt / Caption Text</label>
                <input
                  type="text"
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="e.g. Memory Layout of Pointers Diagram"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertCloudinaryImage}
                disabled={!imageToInsertUrl}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Insert into Lesson</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Insert Link Modal ─────────────────────────────────────────────── */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-sky-500" /> Insert Link
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Display Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Official Documentation"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">URL *</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Insert Code Block Modal ───────────────────────────────────────── */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-500" /> Insert Code Example
            </h3>
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select Programming Language</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'c', label: 'C' },
                  { id: 'cpp', label: 'C++' },
                  { id: 'java', label: 'Java' },
                  { id: 'python', label: 'Python' },
                  { id: 'javascript', label: 'JavaScript' },
                  { id: 'typescript', label: 'TypeScript' },
                  { id: 'html', label: 'HTML' },
                  { id: 'css', label: 'CSS' },
                  { id: 'sql', label: 'SQL' },
                  { id: 'bash', label: 'Bash / Shell' },
                  { id: 'json', label: 'JSON' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setCodeLanguage(lang.id)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      codeLanguage === lang.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertCodeBlock}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold cursor-pointer"
              >
                Insert Code Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Resource Modal ─────────────────────────────────────── */}
      {showAddResourceModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
              {editingResourceIndex !== null ? 'Edit Resource' : 'Add Resource'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Title *</label>
                <input
                  type="text"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Official Documentation PDF"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="github">GitHub Repository</option>
                  <option value="video">Video Recording</option>
                  <option value="article">Article / Documentation</option>
                  <option value="practice">Practice Lab</option>
                  <option value="download">Downloadable Archive</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Resource URL *</label>
                <input
                  type="url"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resDownloadable}
                    onChange={(e) => setResDownloadable(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Downloadable asset</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddResourceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveResource}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Save Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Concurrency Conflict Modal ── */}
      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Version Conflict Detected
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This course was modified elsewhere since you opened it. Saving now could overwrite newer changes made by another admin session.
            </p>
            {conflictServerVersion && (
              <p className="text-[11px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                Your Version: {courseData?.version || 1} • Server Version: {conflictServerVersion}
              </p>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  setShowConflictModal(false);
                  setLoading(true);
                  try {
                    const fresh = await courseService.getCourseBySlugOrId(id);
                    if (fresh) {
                      setCourseData(fresh);
                      setModules((fresh.modules as ModuleItem[]) || []);
                      reset(fresh as any);
                      setIsDirty(false);
                      toast.info('Reloaded latest course version from Firestore.');
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Reload Latest Version
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConflictModal(false);
                  if (conflictServerVersion) {
                    setCourseData((prev: any) => ({ ...prev, version: conflictServerVersion }));
                    handleSaveAll(conflictServerVersion);
                  } else {
                    handleSaveAll();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Overwrite Anyway (Force Save)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unsaved Changes Navigation Safeguard Modal ── */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Unsaved Changes
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You have unsaved changes in this course. If you leave now, any changes you made will be lost.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  setPendingNavDestination(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  setIsDirty(false);
                  if (pendingNavDestination) {
                    navigate(pendingNavDestination);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Discard & Leave
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCourseEdit;
