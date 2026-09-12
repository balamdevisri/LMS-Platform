import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  HelpCircle,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Code2,
  Bookmark,
  FileText,
  ExternalLink,
  Video,
  Download,
  Terminal,
  Database,
  GitBranch,
  Code as CodeIcon,
  Server,
  Cloud,
  Layers,
  Cpu,
  ShieldCheck,
  BookOpen,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownContent } from './MarkdownContent';

const getThemeColorClass = (color?: string | null) => {
  switch (color) {
    case 'indigo': return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
    case 'sky': return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
    case 'emerald': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    case 'amber': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    case 'purple': return 'text-purple-400 border-purple-500/40 bg-purple-500/10';
    case 'rose': return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    case 'cyan': return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    case 'slate': return 'text-slate-400 border-slate-500/40 bg-slate-500/10';
    default: return 'text-slate-400 border-slate-700 bg-slate-800/60';
  }
};

const getThemeIconComp = (iconName?: string | null) => {
  switch (iconName) {
    case 'terminal': return Terminal;
    case 'database': return Database;
    case 'git-branch': return GitBranch;
    case 'code': return CodeIcon;
    case 'server': return Server;
    case 'cloud': return Cloud;
    case 'layers': return Layers;
    case 'cpu': return Cpu;
    case 'shield': return ShieldCheck;
    case 'book-open': return BookOpen;
    default: return null;
  }
};

interface LessonContentPanelProps {
  lessonTitle: string;
  moduleTitle?: string;
  lessonContent: string;
  shortDescription?: string;
  lessonIndex: number;
  totalLessons: number;
  isCompleted: boolean;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  onMarkComplete: () => void;
  isNightMode?: boolean;
  topicImageUrl?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
  learningObjectives?: any;
  codeExamples?: any;
  keyPoints?: any;
  practiceQuestions?: any;
  resourceLinks?: any;
}

/** Safely normalizes string arrays or formatted text/objects into clean string arrays */
export function normalizeStringList(val: any, fallback: string[] = []): string[] {
  if (val === null || val === undefined) return fallback;

  if (Array.isArray(val)) {
    const flattened: string[] = [];
    for (const item of val) {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) {
          if (trimmed.includes('\n') || trimmed.includes('•') || trimmed.includes('●')) {
            const splitItems = trimmed
              .split(/\r?\n|•|●/)
              .map((s) => s.trim().replace(/^[-•*●0-9.]+\s*/, '').trim())
              .filter(Boolean);
            flattened.push(...splitItems);
          } else {
            const cleaned = trimmed.replace(/^[-•*●0-9.]+\s*/, '').trim();
            flattened.push(cleaned || trimmed);
          }
        }
      } else if (typeof item === 'object' && item !== null) {
        const text = item.text || item.title || item.name || item.value || item.objective || item.point;
        if (typeof text === 'string' && text.trim()) {
          flattened.push(text.trim());
        }
      } else if (item !== null && item !== undefined) {
        const s = String(item).trim();
        if (s) flattened.push(s);
      }
    }
    return flattened.length > 0 ? flattened : fallback;
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return fallback;

    // Check if it's a JSON string
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeStringList(parsed, fallback);
      } catch {}
    }

    // Split on newlines, bullets, or semicolons if multiple items
    if (trimmed.includes('\n') || trimmed.includes('•') || trimmed.includes('●') || trimmed.includes(';')) {
      const parts = trimmed
        .split(/\r?\n|•|●|;/)
        .map((s) => s.trim().replace(/^[-•*●0-9.]+\s*/, '').trim())
        .filter((s) => s.length > 0);
      return parts.length > 0 ? parts : [trimmed];
    }

    return [trimmed];
  }

  if (typeof val === 'object') {
    const values = Object.values(val);
    if (values.length > 0) {
      return normalizeStringList(values, fallback);
    }
  }

  return fallback;
}

/** Safely normalizes code example objects */
export function normalizeCodeExamples(val: any): Array<{
  title?: string;
  language: string;
  code: string;
  explanation?: string;
}> {
  if (!val) return [];
  let list: any[] = [];
  if (Array.isArray(val)) {
    list = val;
  } else if (typeof val === 'object') {
    list = Object.values(val);
  } else if (typeof val === 'string' && val.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) list = parsed;
    } catch {}
  }

  return list
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (!trimmed) return null;
        return {
          title: 'Code Example',
          language: 'bash',
          code: trimmed,
        };
      }
      const code = typeof item.code === 'string' ? item.code : (typeof item.snippet === 'string' ? item.snippet : (typeof item.text === 'string' ? item.text : ''));
      if (!code || !code.trim()) return null;
      return {
        title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : undefined,
        language: typeof item.language === 'string' && item.language.trim() ? item.language.trim() : (typeof item.lang === 'string' && item.lang.trim() ? item.lang.trim() : 'code'),
        code: code.trim(),
        explanation: typeof item.explanation === 'string' && item.explanation.trim() ? item.explanation.trim() : (typeof item.desc === 'string' && item.desc.trim() ? item.desc.trim() : undefined),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

/** Safely normalizes practice question items */
export function normalizePracticeQuestions(val: any): Array<{
  question: string;
  answer?: string;
  explanation?: string;
  difficulty?: string;
}> {
  if (!val) return [];
  let list: any[] = [];
  if (Array.isArray(val)) {
    list = val;
  } else if (typeof val === 'object') {
    list = Object.values(val);
  } else if (typeof val === 'string' && val.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) list = parsed;
    } catch {}
  }

  return list
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (!trimmed) return null;
        return {
          question: trimmed,
        };
      }
      const question = typeof item.question === 'string' ? item.question : (typeof item.q === 'string' ? item.q : (typeof item.prompt === 'string' ? item.prompt : ''));
      if (!question || !question.trim()) return null;
      return {
        question: question.trim(),
        answer: typeof item.answer === 'string' && item.answer.trim() ? item.answer.trim() : (typeof item.solution === 'string' && item.solution.trim() ? item.solution.trim() : (typeof item.a === 'string' && item.a.trim() ? item.a.trim() : undefined)),
        explanation: typeof item.explanation === 'string' && item.explanation.trim() ? item.explanation.trim() : (typeof item.desc === 'string' && item.desc.trim() ? item.desc.trim() : undefined),
        difficulty: typeof item.difficulty === 'string' && item.difficulty.trim() ? item.difficulty.trim() : undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

/** Safely normalizes resource links */
export function normalizeResourceLinks(val: any): Array<{
  title: string;
  url: string;
  type?: string;
  description?: string;
}> {
  if (!val) return [];
  let list: any[] = [];
  if (Array.isArray(val)) {
    list = val;
  } else if (typeof val === 'object') {
    list = Object.values(val);
  } else if (typeof val === 'string' && val.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) list = parsed;
    } catch {}
  }

  return list
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const title = typeof item.title === 'string' ? item.title.trim() : (typeof item.name === 'string' ? item.name.trim() : '');
      const url = typeof item.url === 'string' ? item.url.trim() : (typeof item.link === 'string' ? item.link.trim() : '');
      if (!title || !url) return null;
      const u = url.toLowerCase();
      if (u.startsWith('javascript:') || u.startsWith('data:') || u.startsWith('file:') || u.startsWith('vbscript:')) {
        return null;
      }
      if (!u.startsWith('https://') && !u.startsWith('http://') && !u.startsWith('/')) {
        return null;
      }
      return {
        title,
        url,
        type: typeof item.type === 'string' ? item.type : (item.category ? String(item.category).toLowerCase() : 'link'),
        description: typeof item.description === 'string' && item.description.trim() ? item.description.trim() : undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

/** Estimate reading time from content */
function estimateReadingTime(content: any): string {
  if (!content) return '1 min read';
  const str = typeof content === 'string' ? content : String(content);
  const cleaned = str
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/[#*`!\[\]()>-]/g, ' ');
  const words = cleaned.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/**
 * LessonContentPanel — the main reading area for lesson content.
 * Follows the clean production layout:
 * - Unit Title + Short Description + Reading Time
 * - Learning Objectives
 * - Lesson Content (Markdown theory)
 * - Code Example (syntax highlighted code + optional explanation)
 * - Key Points
 * - Practice (questions with revealable solutions)
 * - Resources
 * - Previous Unit | Mark Complete | Next Unit
 */
export const LessonContentPanel: React.FC<LessonContentPanelProps> = ({
  lessonTitle,
  moduleTitle,
  lessonContent,
  shortDescription,
  lessonIndex,
  totalLessons,
  isCompleted,
  hasPrevLesson,
  hasNextLesson,
  onPrevLesson,
  onNextLesson,
  onMarkComplete,
  isNightMode = false,
  topicImageUrl,
  themeColor,
  themeIcon,
  learningObjectives,
  codeExamples,
  keyPoints,
  practiceQuestions,
  resourceLinks,
}) => {
  const readingTime = useMemo(() => estimateReadingTime(lessonContent), [lessonContent]);
  const [openSolutions, setOpenSolutions] = useState<Record<number, boolean>>({});

  const validObjectives = useMemo(() => {
    return normalizeStringList(learningObjectives);
  }, [learningObjectives]);

  const validCodeExamples = useMemo(() => {
    return normalizeCodeExamples(codeExamples);
  }, [codeExamples]);

  const validKeyPoints = useMemo(() => {
    return normalizeStringList(keyPoints);
  }, [keyPoints]);

  const validPracticeQuestions = useMemo(() => {
    return normalizePracticeQuestions(practiceQuestions);
  }, [practiceQuestions]);

  const validResourceLinks = useMemo(() => {
    return normalizeResourceLinks(resourceLinks);
  }, [resourceLinks]);

  const toggleSolution = (idx: number) => {
    setOpenSolutions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <article className="flex-1 min-w-0 flex flex-col">
      <div className="flex-1 px-5 sm:px-8 lg:px-12 py-8 max-w-[54rem] mx-auto w-full space-y-8">
        
        {/* ── 0. Topic / Module Banner Image ─────────────────────────────────── */}
        {topicImageUrl && (
          <div className="relative w-full h-44 sm:h-52 md:h-60 rounded-2xl overflow-hidden mb-6 border border-slate-200 dark:border-slate-800 shadow-md">
            <img
              src={topicImageUrl}
              alt={lessonTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          </div>
        )}

        {/* ── 1. Unit Title & Short Description ───────────────────────────────── */}
        <div className="space-y-3 pb-2 border-b border-[#E5E7EB] dark:border-[#25324A]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs font-semibold uppercase tracking-wider
              ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Unit {lessonIndex + 1} of {totalLessons}
            </span>
            {moduleTitle && (
              <>
                <span className={`text-xs ${isNightMode ? 'text-slate-700' : 'text-slate-300'}`}>•</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${isNightMode ? 'text-sky-400' : 'text-sky-600'}`}>
                  {moduleTitle.replace(/^(🟢|🟡|🔵|🔴)\s*/, '')}
                </span>
              </>
            )}
            {themeColor && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${getThemeColorClass(themeColor)}`}>
                {(() => {
                  const IconComp = getThemeIconComp(themeIcon);
                  return IconComp ? <IconComp className="w-3 h-3" /> : null;
                })()}
                <span className="capitalize">{themeColor}</span>
              </span>
            )}
            <span className={`text-xs ${isNightMode ? 'text-slate-700' : 'text-slate-300'}`}>•</span>
            <span className={`text-xs flex items-center gap-1 font-medium
              ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <Clock className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
              {readingTime}
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight
            ${isNightMode ? 'text-[#38BDF8]' : 'text-[#0284C7]'} dark:text-[#38BDF8]`}>
            {lessonTitle}
          </h1>

          {shortDescription && (
            <p className={`text-sm sm:text-base leading-relaxed
              ${isNightMode ? 'text-slate-400' : 'text-slate-600'} dark:text-slate-400`}>
              {shortDescription}
            </p>
          )}
        </div>

        {/* ── 2. Learning Objectives ──────────────────────────────────────────── */}
        {validObjectives.length > 0 && (
          <div className={`p-5 rounded-2xl border transition-colors
            ${isNightMode
              ? 'bg-[#172033]/60 border-[#25324A] text-slate-200'
              : 'bg-blue-50/70 border-blue-100 text-slate-800'
            }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2
              ${isNightMode ? 'text-[#38BDF8]' : 'text-[#0284C7]'} dark:text-[#38BDF8]`}>
              <Sparkles className="w-4 h-4" />
              <span>Learning Objectives</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm leading-relaxed">
              {validObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[#38BDF8] dark:text-[#38BDF8] font-bold mt-0.5">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── 3. Lesson Content (Rich Markdown Theory) ─────────────────────────── */}
        <section className="space-y-4">
          <MarkdownContent content={lessonContent} isNightMode={isNightMode} />
        </section>

        {/* ── 4. Code Examples (Syntax Highlighted) ───────────────────────────── */}
        {validCodeExamples.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-[#E5E7EB] dark:border-[#25324A]">
            <h3 className={`text-lg font-bold flex items-center gap-2
              ${isNightMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'} dark:text-[#60A5FA]`}>
              <Code2 className="w-5 h-5 text-[#38BDF8] dark:text-[#38BDF8]" />
              <span>Code Example{validCodeExamples.length > 1 ? 's' : ''}</span>
            </h3>

            <div className="space-y-5">
              {validCodeExamples.map((example, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border overflow-hidden
                    ${isNightMode ? 'border-[#25324A] bg-[#0F172A]' : 'border-slate-200 bg-slate-900'}`}
                >
                  {example.title && (
                    <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
                      <span>{example.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-400 uppercase tracking-wider">
                        {example.language || 'code'}
                      </span>
                    </div>
                  )}

                  <div className="p-4 overflow-x-auto text-xs font-mono text-slate-100">
                    <pre className="whitespace-pre leading-relaxed">
                      <code>{example.code}</code>
                    </pre>
                  </div>

                  {example.explanation && (
                    <div className={`p-3.5 text-xs border-t
                      ${isNightMode
                        ? 'border-slate-800 bg-[#172033]/60 text-slate-300'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300'}`}>
                      <span className="font-semibold text-sky-400 mr-1.5">Explanation:</span>
                      <span>{example.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. Key Points ───────────────────────────────────────────────────── */}
        {validKeyPoints.length > 0 && (
          <section className={`p-5 rounded-2xl border transition-colors space-y-3
            ${isNightMode
              ? 'bg-[#172033]/40 border-[#25324A]'
              : 'bg-emerald-50/50 border-emerald-100'
            }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2
              ${isNightMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              <Bookmark className="w-4 h-4" />
              <span>Key Takeaways</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm leading-relaxed">
              {validKeyPoints.map((kp, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                  <span className={isNightMode ? 'text-slate-300' : 'text-slate-700'}>{kp}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── 6. Practice Exercises ───────────────────────────────────────────── */}
        {validPracticeQuestions.length > 0 && (
          <section className="pt-4 border-t border-[#E5E7EB] dark:border-[#25324A] space-y-4">
            <h3 className={`text-lg font-bold flex items-center gap-2
              ${isNightMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'} dark:text-[#60A5FA]`}>
              <HelpCircle className="w-5 h-5 text-[#38BDF8] dark:text-[#38BDF8]" />
              <span>Practice Questions</span>
            </h3>

            <div className="space-y-4">
              {validPracticeQuestions.map((pq, idx) => {
                const isOpen = !!openSolutions[idx];
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-colors space-y-3
                      ${isNightMode
                        ? 'bg-[#172033]/40 border-[#25324A]'
                        : 'bg-[#F8FAFC] border-[#E5E7EB]'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[#38BDF8] dark:text-[#38BDF8]">
                        Question #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSolution(idx)}
                        className="text-xs font-semibold text-[#38BDF8] dark:text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>{isOpen ? 'Hide Solution' : 'Reveal Solution'}</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium
                      ${isNightMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {pq.question}
                    </p>

                    {isOpen && (
                      <div className="p-4 rounded-xl bg-[#0F172A] text-slate-100 text-xs font-mono border border-slate-800 space-y-2.5 mt-2 animate-in fade-in duration-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Reference Solution
                        </span>
                        <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                          {pq.answer || '// Solution code not specified.'}
                        </pre>
                        {pq.explanation && (
                          <div className="text-[11px] text-emerald-400 font-sans mt-2 pt-2 border-t border-slate-800 flex items-start gap-1.5">
                            <span>💡</span>
                            <span>{pq.explanation}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 7. Resources ────────────────────────────────────────────────────── */}
        {validResourceLinks.length > 0 && (
          <section className="pt-6 border-t border-[#E5E7EB] dark:border-[#25324A] space-y-4">
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2
                ${isNightMode ? 'text-[#60A5FA]' : 'text-[#2563EB]'} dark:text-[#60A5FA]`}>
                <LinkIcon className="w-4 h-4 text-[#38BDF8] dark:text-[#38BDF8]" />
                <span>Lesson Resources</span>
              </h3>
              <p className={`text-xs mt-0.5
                ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Curated documentation, downloadable reference notes, code repositories, and video guides.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {validResourceLinks.map((res, i) => {
                const resType = (res.type || 'link').toLowerCase();

                let IconComponent = ExternalLink;
                let badgeLabel = 'Documentation';
                let actionText = 'Open Resource';

                if (resType === 'pdf' || resType === 'doc') {
                  IconComponent = FileText;
                  badgeLabel = 'PDF Document';
                  actionText = 'Open PDF';
                } else if (resType === 'video') {
                  IconComponent = Video;
                  badgeLabel = 'Video Tutorial';
                  actionText = 'Watch Video';
                } else if (resType === 'github') {
                  IconComponent = Code2;
                  badgeLabel = 'GitHub Repository';
                  actionText = 'View Repository';
                } else if (resType === 'download' || resType === 'file') {
                  IconComponent = Download;
                  badgeLabel = 'Downloadable File';
                  actionText = 'Download File';
                }

                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-colors
                      ${isNightMode
                        ? 'bg-[#121829] border-[#25324A] hover:border-[#3B82F6]/70'
                        : 'bg-white border-[#E2E8F0] hover:border-[#2563EB]/70 shadow-xs'
                      }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide uppercase
                          ${isNightMode
                            ? 'bg-blue-950/70 text-blue-300 border border-blue-800/40'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {badgeLabel}
                        </span>
                        <IconComponent className={`w-4 h-4 flex-shrink-0
                          ${isNightMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>

                      <h4 className={`text-sm font-semibold leading-snug line-clamp-2
                        ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                        {res.title}
                      </h4>

                      {res.description && (
                        <p className={`text-xs line-clamp-2 leading-relaxed
                          ${isNightMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {res.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className={`font-mono text-[11px] truncate flex-1
                        ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {res.url}
                      </span>

                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex-shrink-0
                          ${isNightMode
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                      >
                        <span>{actionText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 8. Bottom Navigation & Completion Action Bar ────────────────────── */}
        <div className="pt-8 border-t border-[#E5E7EB] dark:border-[#25324A] flex items-center justify-between gap-3 pb-8">
          <button
            onClick={onPrevLesson}
            disabled={!hasPrevLesson}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold
              transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
              ${isNightMode
                ? 'bg-[#172033] hover:bg-[#1E293B] text-slate-300 border border-[#25324A]'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-[#E5E7EB]'
              }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Unit</span>
          </button>

          <div>
            {isCompleted ? (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs
                ${isNightMode
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>✓ Claimed (+50 XP) • Unit Completed</span>
              </div>
            ) : (
              <button
                onClick={onMarkComplete}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black
                  transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-md
                  bg-linear-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300
                  text-slate-950 border border-amber-300/80 shadow-amber-500/25 animate-pulse hover:animate-none"
                title="Claim +50 XP & mark unit completed"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>⚡ Claim +50 XP</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (!isCompleted) {
                toast.warning('🔒 XP Reward Pending! Please click "⚡ Claim +50 XP" to claim your XP before continuing to the next unit!');
                return;
              }
              onNextLesson();
            }}
            disabled={!hasNextLesson}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold
              transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
              ${isNightMode
                ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
              }`}
          >
            <span>Next Unit</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </article>
  );
};
