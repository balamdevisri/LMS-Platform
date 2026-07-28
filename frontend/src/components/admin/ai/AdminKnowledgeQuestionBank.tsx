import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  BarChart3,
  Brain,
  RefreshCw,
  Terminal,
  Zap,
  Code2,
  FileText,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { aiLmsService } from '../../../services/aiLmsService';
import type {
  CourseKnowledgeDoc,
  QuestionBankStats,
  QuestionItem,
  LinuxCommandDoc,
  DefinitionDoc,
  PracticalTaskDoc,
} from '../../../types/aiLmsTypes';

interface Props {
  courseId?: string;
  courseTitle?: string;
}

export const AdminKnowledgeQuestionBank: React.FC<Props> = ({
  courseId = 'course_linux_101',
  courseTitle = 'Fullstack Systems & Linux Engineering',
}) => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'questions' | 'stats'>('knowledge');
  const [loading, setLoading] = useState(false);

  // Lesson inputs for analysis
  const [lessonId, setLessonId] = useState('lesson_linux_perm');
  const [lessonTitle, setLessonTitle] = useState('Linux File Permissions & Security Access Control');
  const [lessonContent, setLessonContent] = useState(
    'Linux uses numeric and symbolic modes for file permissions. Permission levels: 4 = Read (r), 2 = Write (w), 1 = Execute (x). The chmod command modifies permissions on files and directories. For example, chmod 755 script.sh grants full control to owner and execute rights to group/others.'
  );

  // Output States
  const [knowledge, setKnowledge] = useState<CourseKnowledgeDoc | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [stats, setStats] = useState<QuestionBankStats | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    fetchStats();
  }, [courseId]);

  const fetchStats = async () => {
    try {
      const res = await aiLmsService.getQuestionStats(courseId);
      setStats(res.stats);
    } catch (e) {
      console.warn('Failed fetching stats:', e);
    }
  };

  const handleAnalyzeKnowledge = async () => {
    setLoading(true);
    try {
      const res = await aiLmsService.analyzeCourseLesson({
        courseId,
        lessonId,
        lessonTitle,
        lessonContent,
      });
      setKnowledge(res.knowledge);
      toast.success('Course knowledge extracted & indexed successfully.');
      setActiveTab('knowledge');
    } catch (err) {
      toast.error('Failed extracting course knowledge.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestionBank = async () => {
    setLoading(true);
    try {
      const res = await aiLmsService.generateQuestionBank({
        courseId,
        lessonId,
        lessonTitle,
        lessonContent,
        countPerDifficulty: 4,
      });
      setQuestions(res.questions);
      toast.success(`Generated ${res.count} unique questions across 8 formats.`);
      setActiveTab('questions');
      fetchStats();
    } catch (err) {
      toast.error('Failed generating question bank.');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(
    (q: QuestionItem) => selectedDifficulty === 'all' || q.difficulty === selectedDifficulty
  );

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-sky-100 rounded-3xl p-6 shadow-xl shadow-sky-500/5 font-['Sora'] space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sky-100">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-linear-to-tr from-sky-600 to-indigo-600 text-white shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              AI Knowledge Engine & Question Bank Authoring
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Course Target: <span className="font-bold text-sky-600">{courseTitle}</span> (ID: {courseId})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAnalyzeKnowledge}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Analyze Lesson Knowledge</span>
          </button>

          <button
            onClick={handleGenerateQuestionBank}
            disabled={loading}
            className="btn-blue-primary px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Generate Question Bank (AI)</span>
          </button>
        </div>
      </div>

      {/* Inputs Bar */}
      <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lesson Title
            </label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full bg-white border border-sky-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lesson Identifier ID
            </label>
            <input
              type="text"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full bg-white border border-sky-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Lesson Technical Content Snippet for AI Processing
          </label>
          <textarea
            rows={2}
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            className="w-full bg-white border border-sky-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-hidden"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'knowledge'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Extracted Knowledge ({knowledge ? 'Indexed' : '0'})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Generated Question Bank ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-sky-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Question Bank Analytics</span>
        </button>
      </div>

      {/* TAB 1: EXTRACTED KNOWLEDGE */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {knowledge ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Technical Topics & Subtopics */}
              <div className="p-4 bg-white border border-sky-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-xs">
                  <Layers className="w-4 h-4" />
                  <span>Main Topics & Subtopics</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {knowledge.topics.map((t: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-sky-100 text-sky-800 font-bold text-[11px] rounded-lg">
                      {t}
                    </span>
                  ))}
                  {knowledge.subTopics.map((st: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium text-[11px] rounded-lg">
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              {/* Linux Terminal Commands */}
              <div className="p-4 bg-white border border-sky-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                  <Terminal className="w-4 h-4" />
                  <span>Linux Terminal Commands Identified</span>
                </div>
                <div className="space-y-2">
                  {knowledge.linuxCommands.map((cmd: LinuxCommandDoc, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] space-y-1">
                      <div className="font-bold text-sky-400">$ {cmd.command}</div>
                      <div className="text-[10px] text-slate-400">{cmd.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Definitions */}
              <div className="p-4 bg-white border border-sky-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Definitions & Key Terms</span>
                </div>
                {knowledge.definitions.map((def: DefinitionDoc, idx: number) => (
                  <div key={idx} className="text-xs">
                    <span className="font-bold text-slate-900">{def.term}: </span>
                    <span className="text-slate-600">{def.definition}</span>
                  </div>
                ))}
              </div>

              {/* Practical Lab Tasks */}
              <div className="p-4 bg-white border border-sky-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                  <Code2 className="w-4 h-4" />
                  <span>Practical Workstation Tasks</span>
                </div>
                {knowledge.practicalTasks.map((task: PracticalTaskDoc, idx: number) => (
                  <div key={idx} className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-amber-900">{task.taskTitle}</div>
                    <div className="text-[11px] text-amber-800">{task.instructions}</div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-center py-12 bg-sky-50/40 border border-dashed border-sky-200 rounded-2xl">
              <Brain className="w-10 h-10 text-sky-400 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-bold text-slate-700">No Knowledge Extraction Run Yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                Click "Analyze Lesson Knowledge" above to automatically extract topics, Linux commands, and learning objectives.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'questions' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Difficulty Filter */}
          <div className="flex items-center justify-between gap-4 bg-slate-50 p-2 rounded-xl text-xs font-bold">
            <span className="text-slate-700 pl-2">Filter Difficulty Level:</span>
            <div className="flex items-center gap-1">
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question List */}
          {filteredQuestions.length > 0 ? (
            <div className="space-y-3">
              {filteredQuestions.map((q: QuestionItem, idx: number) => (
                <div key={q.id || idx} className="p-4 bg-white border border-sky-100 rounded-2xl space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-extrabold text-[10px] uppercase">
                        {q.type.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          q.difficulty === 'hard'
                            ? 'bg-rose-100 text-rose-700'
                            : q.difficulty === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500">
                      Marks: {q.marks} &bull; Time: {q.timeLimitSeconds}s
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900">{q.question}</p>

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {q.options.map((opt: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border ${
                            opt === q.correctAnswer
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt} {opt === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>Topic: <strong className="text-slate-800">{q.topic}</strong></span>
                    <span className="font-mono text-[10px] text-slate-400">ID: {q.uniqueHash.substring(0, 12)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-sky-50/40 border border-dashed border-sky-200 rounded-2xl">
              <HelpCircle className="w-10 h-10 text-sky-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Questions Generated Yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                Click "Generate Question Bank (AI)" above to create multi-format questions across Easy, Medium, and Hard tiers.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-center">
                <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">Total Questions</div>
                <div className="text-3xl font-extrabold text-sky-600 mt-1">{stats.totalQuestions}</div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Difficulty Tiers</div>
                <div className="text-xs font-bold text-emerald-900 mt-2 space-y-1">
                  <div>Easy: {stats.questionsPerDifficulty.easy}</div>
                  <div>Medium: {stats.questionsPerDifficulty.medium}</div>
                  <div>Hard: {stats.questionsPerDifficulty.hard}</div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center">
                <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Formats Covered</div>
                <div className="text-3xl font-extrabold text-indigo-600 mt-1">
                  {Object.keys(stats.questionsPerType).length || 8}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-xs font-medium text-slate-500">Loading Question Analytics...</div>
          )}
        </div>
      )}

    </div>
  );
};
