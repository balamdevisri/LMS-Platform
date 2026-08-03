import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Clock, Terminal as TerminalIcon, Sparkles, CheckCircle2, ChevronRight, Zap, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownRenderer } from './MarkdownRenderer';
import { LazyViewport } from './LazyViewport';

const Terminal = lazy(() => import('./Terminal').then(m => ({ default: m.Terminal })));

const TerminalSkeleton = () => (
  <div className="w-full h-80 bg-slate-950 rounded-2xl border border-slate-900 animate-pulse flex items-center justify-center">
    <div className="text-slate-500 font-mono text-xs">Loading Interactive Practice Sandbox...</div>
  </div>
);

export interface LessonDetails {
  id: string | number;
  title: string;
  duration?: string;
  type?: string;
  badge?: string;
  videoUrl?: string;
  content: string;
  commands?: Array<{ command: string; description: string }>;
  resources?: Array<{ title: string; url: string }>;
}

interface LessonViewerProps {
  lesson: LessonDetails;
  isGitCourse?: boolean;
  onExecuteCommand?: (cmd: string) => void;
  onMarkComplete: () => void;
  onNextLesson: () => void;
  isCompleted: boolean;
  isNightMode?: boolean;
  courseTitle?: string;
  courseId?: string;
}

interface GeneratedContent {
  studyGuide: string;
  takeaways: string[];
  aiBreakdown: string;
}

export function generateStructuredLessonContent(title: string, content: string): GeneratedContent {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Keyword extraction for validation
  const mainKeywords = titleLower
    .split(/\s+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 3 && w !== 'what' && w !== 'with' && w !== 'your');

  // Check if this is a Database/DBMS track lesson
  const isDatabaseCourse = titleLower.includes('data') || titleLower.includes('dbms') || titleLower.includes('sql') || titleLower.includes('table') || titleLower.includes('key') || titleLower.includes('constraint') || titleLower.includes('relation') || titleLower.includes('normalization') || titleLower.includes('transaction');

  let studyGuide = '';
  let takeaways: string[] = [];
  let aiBreakdown = '';

  // Course Isolation check for Database lessons
  const filterForbiddenWords = (text: string): string => {
    if (isDatabaseCourse) {
      let filtered = text;
      const forbidden = ['linux', 'ubuntu', 'github', 'git', 'bash', 'terminal configuration', 'operating system', 'command line interface', 'cli'];
      forbidden.forEach(word => {
        if (!contentLower.includes(word)) {
          const regex = new RegExp(word, 'gi');
          filtered = filtered.replace(regex, 'database system');
        }
      });
      return filtered;
    }
    return text;
  };

  const sentences = content
    .split(/[.!?\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && !s.startsWith('#') && !s.startsWith('-') && !s.startsWith('*') && !s.startsWith('`'));

  // Define database templates dynamically to guarantee uniqueness for DBMS lessons
  // Define database templates dynamically to guarantee uniqueness for DBMS lessons
  if (isDatabaseCourse) {
    if (titleLower.includes('what is data') || titleLower.includes('1.1')) {
      studyGuide = `This guide covers the entry point of information science:\n\n` +
        `📖 1. Definition of Data: Data is raw, unprocessed facts, numbers, or observations without context.\n\n` +
        `📖 2. Concept of Information: Information is data that has been structured and organized to have meaning.\n\n` +
        `📖 3. Definition of Metadata: Metadata provides descriptor details about other data elements.\n\n` +
        `📖 4. Representation: Computers represent data internally in binary format to handle calculations.`;
      takeaways = [
        'Data represents raw, unorganized elements like numbers and words.',
        'Information is processed data that provides context and meaning.',
        'Metadata acts as data about data, clarifying details like formats and sizes.',
        'Structured databases turn raw data into actionable information.'
      ];
      aiBreakdown = `Data & Information Breakdown:\n\n` +
        `• Data: Raw values like "38" or "Red". Alone, they have no contextual meaning.\n` +
        `• Information: When data is processed, e.g., "The user age is 38." It gives data purpose.\n` +
        `• Metadata: Structural data describing files, database columns, or parameters.`;
    } else if (titleLower.includes('what is database') || titleLower.includes('1.2')) {
      studyGuide = `This guide explores organized data storage systems:\n\n` +
        `📖 1. Database Definition: An organized collection of structured data stored electronically.\n\n` +
        `📖 2. Structure: Uses rows (tuples) and columns (attributes) inside grid tables.\n\n` +
        `📖 3. Querying: Relies on specific languages like SQL to retrieve records quickly.\n\n` +
        `📖 4. Management: Controlled by Database Management Systems (DBMS) for safety.`;
      takeaways = [
        'A database is an electronically stored, organized collection of data.',
        'Data is structured in tables containing fields (columns) and records (rows).',
        'A Database Management System (DBMS) acts as the control interface for the database.',
        'Databases enable faster retrieval, search, and update actions compared to flat files.'
      ];
      aiBreakdown = `Database Essentials:\n\n` +
        `• Database: A digital container holding structured info.\n` +
        `• Table: The base layout of columns (fields) and rows (records).\n` +
        `• Record: A single horizontal entry representing an entity.\n` +
        `• Field: A vertical attribute column detailing values.`;
    } else if (titleLower.includes('file system') || titleLower.includes('database vs') || titleLower.includes('1.4')) {
      studyGuide = `This guide compares flat storage models with database managers:\n\n` +
        `📖 1. Data Redundancy: File systems duplicate data files, leading to storage waste.\n\n` +
        `📖 2. Data Inconsistency: Updating one file in a file system leaves duplicates outdated.\n\n` +
        `📖 3. Concurrent Access: DBMS allows multiple users to read and write safely at the same time.\n\n` +
        `📖 4. Data Integrity: DBMS enforces validation rules to prevent corrupt entries.`;
      takeaways = [
        'File systems suffer from high data redundancy due to duplicated files.',
        'Data inconsistency is common in file systems when matching copies are not synchronized.',
        'A DBMS solves access conflicts using concurrency control mechanisms.',
        'Databases ensure data integrity by validating schemas and relationships.'
      ];
      aiBreakdown = `Database vs. File System Comparison:\n\n` +
        `• Data Redundancy: Having multiple copies of the same data item in different files.\n` +
        `• Data Inconsistency: Mismatched data values across separate files for the same entity.\n` +
        `• DBMS Control: Centralizes metadata to enforce rules and allow secure sharing.`;
    } else if (titleLower.includes('dbms introduction') || titleLower.includes('1.3')) {
      studyGuide = `This guide introduces Database Management Systems:\n\n` +
        `📖 1. Definition of DBMS: Software acting as an interface between users and databases.\n\n` +
        `📖 2. Data Definition: Creates and alters tables and schema structures.\n\n` +
        `📖 3. Data Update: Manages insertion, deletion, and updating of rows.\n\n` +
        `📖 4. Concurrency: Coordinates multi-user transactions without conflicts.`;
      takeaways = [
        'DBMS is the software controller that operates database schemas.',
        'It handles data definition (DDL) and data manipulation (DML) statements.',
        'Users query the DBMS to retrieve records securely.',
        'A DBMS ensures transactions commit completely or rollback on failure.'
      ];
      aiBreakdown = `DBMS Concept Breakdown:\n\n` +
        `• DBMS: Database Management System software.\n` +
        `• Data Definition: Organizing table layouts and key indices.\n` +
        `• Security: Enforcing user privileges to protect records.`;
    } else {
      const titleKeywords = mainKeywords.join(', ');
      studyGuide = `This study guide is focused on the database unit: "${title}":\n\n` +
        `📖 1. Topic Core: Understanding the role of ${titleKeywords || 'database schemas'}.\n\n` +
        `📖 2. Structural Rule: Organizing attributes and records to maintain design standards.\n\n` +
        `📖 3. Consistency: Enforcing data validations to avoid anomalies.\n\n` +
        `📖 4. Performance: Verifying correct queries to access the records.`;
      takeaways = [
        `Identify the main database properties associated with ${titleKeywords || 'schemas'}.`,
        `Apply strict rules to retrieve records without redundancy.`,
        `Verify table design columns and relational keys.`,
        `Optimize data organization inside the DBMS container.`
      ];
      aiBreakdown = `Database Concept: ${title}:\n\n` +
        `• Core Subject: Understanding the structural principles of ${titleKeywords || 'relational databases'}.\n` +
        `• Relational Link: Mapping attributes to table grids.\n` +
        `• Access Control: How the DBMS controls validation of values.`;
    }
  } else {
    // Non-database courses (Linux, Git, Python, Java, React)
    if (sentences.length >= 4) {
      studyGuide = `This guide covers the core concepts in the unit:\n\n` +
        sentences.slice(0, 4).map((s, i) => `📖 Key Point ${i+1}: ${s.replace(/\*/g, '')}.`).join('\n\n');
    } else {
      studyGuide = `This guide covers the core concepts in the unit:\n\n` +
        `📖 1. Topic Overview: Studying ${title}.\n\n` +
        `📖 2. Conceptual Pillar: Verifying workflows and structure.\n\n` +
        `📖 3. Execution Step: Running commands in the terminal workspace.\n\n` +
        `📖 4. Best Practice: Documenting configuration parameters.`;
    }

    if (sentences.length >= 4) {
      takeaways = sentences.slice(0, 5).map(s => s.replace(/^[-*+]\s*/, '').replace(/\*/g, '').trim());
    } else {
      takeaways = [
        `Understand the main setup steps for ${title}.`,
        'Verify configurations using interactive sandbox tools.',
        'Document instructions to share best practices.',
        'Track and log performance metrics during execution.'
      ];
    }

    if (titleLower.includes('git') || titleLower.includes('github')) {
      aiBreakdown = `Git Version Control Breakdown:\n\n` +
        `• Repository: Project storage containing complete file histories.\n` +
        `• Commit: Recorded state snapshots tracking local edits.\n` +
        `• Staging: Buffer index where updates are validated before commits.`;
    } else if (titleLower.includes('python')) {
      aiBreakdown = `Python Scripting Breakdown:\n\n` +
        `• Interpreter: Translates python statements into bytecode instructions.\n` +
        `• Functions: Modular blocks declared using the def keyword.\n` +
        `• Indentation: Syntactical scoping to group code commands.`;
    } else {
      aiBreakdown = `System Concept: ${title}:\n\n` +
        `• Core Execution: How applications interact with supervisor runtimes.\n` +
        `• Environment: Running command tests in sandbox workspaces.\n` +
        `• Security: Restricting access configurations using authorization key files.`;
    }
  }

  studyGuide = filterForbiddenWords(studyGuide).replace(/\*/g, '');
  takeaways = takeaways.map(t => filterForbiddenWords(t).replace(/\*/g, '').trim());
  aiBreakdown = filterForbiddenWords(aiBreakdown).replace(/\*/g, '');

  // Automated keyword validation
  const checkHasKeyword = (text: string) => {
    if (mainKeywords.length === 0) return true;
    return mainKeywords.some(k => text.toLowerCase().includes(k));
  };

  const checkHasKeywordInArray = (arr: string[]) => {
    if (mainKeywords.length === 0) return true;
    return arr.some(item => mainKeywords.some(k => item.toLowerCase().includes(k)));
  };

  if (!checkHasKeyword(studyGuide) || !checkHasKeywordInArray(takeaways) || !checkHasKeyword(aiBreakdown)) {
    const keyRef = mainKeywords[0] || 'relational concepts';
    if (!studyGuide.toLowerCase().includes(keyRef)) {
      studyGuide += `\n\n📌 Validation note: This study guide specifically covers terms relating to ${keyRef}.`;
    }
    if (!takeaways.some(t => t.toLowerCase().includes(keyRef))) {
      takeaways.push(`Review the primary principles and structures of ${keyRef}.`);
    }
    if (!aiBreakdown.toLowerCase().includes(keyRef)) {
      aiBreakdown += `\n\n🔍 AI Context Reference: Centered around ${keyRef} topics.`;
    }
  }

  return {
    studyGuide,
    takeaways,
    aiBreakdown
  };
}

export const LessonViewer: React.FC<LessonViewerProps> = React.memo(({
  lesson,
  isGitCourse = false,
  onExecuteCommand,
  onMarkComplete,
  onNextLesson,
  isCompleted,
  isNightMode = false,
  courseTitle = '',
  courseId: _courseId = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(15);

  useEffect(() => {
    if (isCompleted) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lesson.id, isCompleted]);

  const handleClaimXP = () => {
    if (isCompleted) {
      toast.info('XP already claimed for this lesson!');
      return;
    }
    if (timeLeft > 0) return;
    onMarkComplete();
    toast.success('🎉 +50 XP Claimed! Lesson marked as completed!');
  };

  const formattedBadge = useMemo(() => {
    const raw = lesson.badge || 'Core Lesson';
    if (/^unit-[\d-]+$/i.test(raw) || /^lesson\s+unit-[\d-]+$/i.test(raw)) {
      const nums = raw.match(/\d+/g);
      if (nums && nums.length > 0) {
        const lastNum = nums[nums.length - 1];
        return `Subtopic ${lastNum.padStart(2, '0')}`;
      }
    }
    return raw.replace(/^lesson\s+unit-[\d-]+\s*:?\s*/i, 'Subtopic ').replace(/^unit-[\d-]+\s*:?\s*/i, 'Subtopic ');
  }, [lesson.badge]);

  const formattedTitle = useMemo(() => {
    return lesson.title || '';
  }, [lesson.title]);

  const generatedContent = useMemo(() => {
    return generateStructuredLessonContent(lesson.title, lesson.content);
  }, [lesson.title, lesson.content]);

  const studyGuideText = generatedContent.studyGuide;
  const takeawaysList = generatedContent.takeaways;
  const conceptBreakdown = generatedContent.aiBreakdown;

  return (
    <article className="w-full space-y-8 py-2 px-1">
      <header className={`space-y-4 border-b pb-8 ${isNightMode ? 'border-slate-800/80' : 'border-sky-100'}`}>
        <div className="flex flex-wrap items-center gap-3">
          {formattedBadge && (
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-2 border shadow-xs transition-all ${
                isNightMode
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80 shadow-cyan-950/40'
                  : 'bg-sky-100/90 text-sky-800 border-sky-200 shadow-sky-500/10'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
              <span>{formattedBadge}</span>
            </span>
          )}

          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-semibold flex items-center gap-2 border shadow-xs ${
              isNightMode
                ? 'bg-slate-900/90 text-slate-300 border-slate-800'
                : 'bg-white text-slate-700 border-sky-100'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
            <span>Estimated: {lesson.duration || '15 mins'}</span>
          </span>
        </div>

        <h1
          className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight ${
            isNightMode
              ? 'text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-slate-300'
              : 'text-slate-900'
          }`}
        >
          {formattedTitle}
        </h1>
      </header>

      <section className="space-y-4">
        <MarkdownRenderer content={lesson.content} isNightMode={isNightMode} />
      </section>

      {/* Dynamic Core Study Guide & Key Takeaways Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div className={`p-6 rounded-3xl border shadow-md space-y-3 ${isNightMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-sky-200 text-slate-700'}`}>
          <h3 className={`text-sm font-extrabold flex items-center gap-2 uppercase tracking-wider ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`}>
            <BookOpen className="w-4 h-4" />
            Core Study Guide
          </h3>
          <p className={`text-xs leading-relaxed font-sans whitespace-pre-wrap ${isNightMode ? 'text-slate-300' : 'text-slate-655'}`}>
            {studyGuideText}
          </p>
        </div>

        <div className={`p-6 rounded-3xl border shadow-md space-y-3 ${isNightMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-sky-200 text-slate-700'}`}>
          <h3 className={`text-sm font-extrabold flex items-center gap-2 uppercase tracking-wider ${isNightMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <CheckCircle2 className="w-4 h-4" />
            Key Takeaways
          </h3>
          <ul className={`list-disc pl-5 text-xs space-y-2 font-sans ${isNightMode ? 'text-slate-300' : 'text-slate-655'}`}>
            {takeawaysList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className={`my-8 p-6 rounded-3xl border shadow-md space-y-3 ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-slate-950/40'
            : 'bg-linear-to-r from-sky-50 via-white to-blue-50/60 border-sky-200/80 text-slate-700 shadow-sky-500/5'
        }`}
      >
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`}>
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>SHAIVIKA AI Key Concept Breakdown</span>
        </div>
        <p className={`text-xs leading-relaxed font-sans whitespace-pre-wrap ${isNightMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {conceptBreakdown}
        </p>
      </section>

      <section className="my-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-bold flex items-center gap-2 font-heading ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
            <TerminalIcon className="w-5 h-5 text-emerald-500" />
            Hands-on Practice Terminal Sandbox
          </h3>
          <span className={`text-xs font-mono ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>Live Interactive Execution</span>
        </div>
        <div className="touch-pan-y overscroll-y-auto w-full">
          <LazyViewport placeholder={<TerminalSkeleton />}>
            <Suspense fallback={<TerminalSkeleton />}>
              <Terminal
                initialCommands={lesson.commands || []}
                isGitCourse={isGitCourse}
                onExecuteCommand={onExecuteCommand}
                courseTitle={courseTitle}
                isNightMode={isNightMode}
              />
            </Suspense>
          </LazyViewport>
        </div>
      </section>

      <footer
        className={`mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border shadow-xl ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/60'
            : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Zap className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              <span>Finished reading & practice?</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                +50 XP
              </span>
            </h4>
            <p className={`text-xs ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isCompleted
                ? 'XP claimed for this lesson! Permanent record saved.'
                : timeLeft > 0
                ? `Read the lesson for ${timeLeft}s to unlock your XP reward.`
                : 'Your XP reward is ready to be claimed!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* CLAIM XP / COMPLETED BUTTON */}
          <button
            onClick={handleClaimXP}
            disabled={isCompleted || timeLeft > 0}
            className={`py-3 px-5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                : timeLeft > 0
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 animate-pulse'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ XP Claimed (+50 XP)</span>
              </>
            ) : timeLeft > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span>Claim XP in {timeLeft}s...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950 fill-current" />
                <span>⚡ Claim +50 XP</span>
              </>
            )}
          </button>

          {/* NEXT LESSON BUTTON */}
          <button
            onClick={onNextLesson}
            className={`py-3 px-5 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto ${
              isNightMode
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 shadow-lg shadow-cyan-950'
                : 'btn-blue-primary shadow-lg shadow-sky-500/20'
            }`}
          >
            <span>Next Lesson</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </article>
  );
});
