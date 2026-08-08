import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Bookmark,
  FileText,
  Download,
  ExternalLink,
  Save,
  Award,
  Layers,
  Zap,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ResourceItem {
  title: string;
  url: string;
}

interface DownloadItem {
  title: string;
  url: string;
  filename?: string;
  size?: string;
}

interface RightSidebarProps {
  lessonId: string | number;
  lessonTitle?: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  resources?: ResourceItem[];
  downloads?: DownloadItem[];
  onToggleComplete: () => void;
  onNextLesson: () => void;
  onToggleBookmark: () => void;
  completedCount: number;
  totalLessons: number;
  isNightMode?: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  lessonId,
  isCompleted,
  isBookmarked,
  resources = [],
  downloads = [],
  onToggleComplete,
  onNextLesson,
  onToggleBookmark,
  completedCount,
  totalLessons,
  isNightMode = false,
}) => {
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);

  useEffect(() => {
    const saved = localStorage.getItem(`shaivika_note_${lessonId}`);
    setNoteText(saved || '');
  }, [lessonId]);

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
  }, [lessonId, isCompleted]);

  const handleSaveNote = () => {
    setIsSavingNote(true);
    localStorage.setItem(`shaivika_note_${lessonId}`, noteText);
    setTimeout(() => {
      setIsSavingNote(false);
      toast.success('Note saved for this lesson!');
    }, 400);
  };

  const handleClaimXP = () => {
    if (isCompleted) {
      toast.info('XP already claimed for this lesson!');
      return;
    }
    if (timeLeft > 0) return;
    onToggleComplete();
    toast.success('🎉 +50 XP Claimed!');
  };

  const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-5 sticky top-28 self-start font-sans">
      {/* Lesson Control Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl backdrop-blur-xl space-y-4 ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/60'
            : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/5'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 text-xs font-semibold ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`}>
            <Award className="w-4 h-4" />
            <span>Lesson Control</span>
          </div>
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : isNightMode
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-sky-50/60 border-sky-100 text-slate-500 hover:text-slate-900'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        <button
          onClick={handleClaimXP}
          disabled={isCompleted || timeLeft > 0}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
              : timeLeft > 0
              ? 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed opacity-80'
              : 'bg-linear-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 animate-pulse border border-amber-300/60 active:scale-95'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✓ XP Claimed (+50 XP)</span>
            </>
          ) : timeLeft > 0 ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Claim XP in {timeLeft}s</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ Claim +50 XP</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            if (completedCount >= totalLessons) {
              toast.success("🏆 Course Completed! Congrats! Access your certificate via the header.");
              return;
            }
            if (!isCompleted) {
              toast.warning('🔒 XP Reward Pending! Please click "⚡ Claim +50 XP" to claim your XP before continuing to the next lesson!');
              return;
            }
            onNextLesson();
          }}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
            completedCount >= totalLessons
              ? 'bg-linear-to-r from-amber-500 to-yellow-455 border-amber-300 text-slate-950 hover:brightness-105 shadow-md shadow-amber-500/10'
              : isNightMode
              ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              : 'bg-sky-50 hover:bg-sky-100/80 border-sky-100 text-sky-800'
          }`}
        >
          {completedCount >= totalLessons ? (
            <>
              <Award className="w-4 h-4 fill-slate-950 animate-pulse" />
              <span>Completed 🎉 Congrats!</span>
            </>
          ) : (
            <>
              <span>Continue to Next Lesson</span>
              <ChevronRight className={`w-4 h-4 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
            </>
          )}
        </button>
      </div>

      {/* Course Progress Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl backdrop-blur-xl space-y-3 ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/60'
            : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/5'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold flex items-center gap-2 ${isNightMode ? 'text-slate-300' : 'text-slate-500'}`}>
            <Layers className={`w-4 h-4 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} /> Course Progress
          </span>
          <span className={`font-mono font-bold ${isNightMode ? 'text-cyan-300' : 'text-sky-600'}`}>{progressPercent}%</span>
        </div>
        <div className={`w-full h-2.5 rounded-full overflow-hidden border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-sky-100 border-sky-200/50'}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isNightMode
                ? 'bg-linear-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                : 'bg-linear-to-r from-sky-500 via-sky-400 to-blue-600 shadow-[0_0_8px_rgba(14,165,233,0.4)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={`text-[11px] font-mono text-right ${isNightMode ? 'text-slate-400' : 'text-slate-400'}`}>
          {completedCount} of {totalLessons} lessons finished
        </div>
      </div>

      {/* Notes Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl backdrop-blur-xl space-y-3 ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/60'
            : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/5'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold flex items-center gap-2 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
            <FileText className={`w-4 h-4 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} /> Personal Lesson Notes
          </span>
          {noteText && (
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              Saved
            </span>
          )}
        </div>

        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Take notes for this lesson here..."
          rows={4}
          className={`w-full p-3 rounded-2xl text-xs focus:outline-none resize-none font-sans leading-relaxed border ${
            isNightMode
              ? 'bg-slate-950 border-slate-800 text-slate-100 focus:ring-1 focus:ring-cyan-400/60 placeholder:opacity-60'
              : 'bg-slate-50 border-sky-100 text-slate-800 focus:ring-1 focus:ring-sky-500/60 placeholder:opacity-60'
          }`}
        />

        <button
          onClick={handleSaveNote}
          disabled={isSavingNote}
          className={`w-full py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isNightMode
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-300'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-100 text-slate-700'
          }`}
        >
          <Save className={`w-3.5 h-3.5 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
          <span>Save Note</span>
        </button>
      </div>

      {/* Downloads Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl backdrop-blur-xl space-y-3 ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/60'
            : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/5'
        }`}
      >
        <h4 className={`text-xs font-bold flex items-center gap-2 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
          <Download className={`w-4 h-4 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} /> Lesson Downloads
        </h4>

        {downloads.length > 0 ? (
          <div className="space-y-2">
            {downloads.map((dl, idx) => (
              <a
                key={idx}
                href={dl.url}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all ${
                  isNightMode
                    ? 'bg-slate-950 border-slate-800 text-cyan-300 hover:bg-slate-850 hover:border-slate-700'
                    : 'bg-sky-50/60 border-sky-100 text-sky-700 hover:bg-sky-100/60'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  toast.success(`Started download of: ${dl.filename || 'file'}`);
                }}
              >
                <div className="truncate">
                  <div>{dl.title}</div>
                  {dl.size && <span className="text-[10px] text-slate-500 font-mono font-normal">{dl.size}</span>}
                </div>
                <Download className={`w-3.5 h-3.5 shrink-0 ml-2 text-slate-400`} />
              </a>
            ))}
          </div>
        ) : (
          <div className={`p-3 rounded-xl border text-center text-[11px] ${isNightMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-sky-100 text-slate-400'}`}>
            No downloadable materials for this unit.
          </div>
        )}
      </div>

      {/* Resources Card */}
      <div
        className={`p-5 rounded-3xl border shadow-xl backdrop-blur-xl space-y-3 ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/60'
            : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/5'
        }`}
      >
        <h4 className={`text-xs font-bold flex items-center gap-2 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
          <ExternalLink className={`w-4 h-4 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} /> Core Reference Links
        </h4>

        {resources.length > 0 ? (
          <div className="space-y-2">
            {resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all ${
                  isNightMode
                    ? 'bg-slate-950 border-slate-800 text-cyan-300 hover:bg-slate-850 hover:border-slate-700'
                    : 'bg-sky-50/60 border-sky-100 text-sky-700 hover:bg-sky-100/60'
                }`}
              >
                <span className="truncate">{res.title}</span>
                <ExternalLink className={`w-3.5 h-3.5 shrink-0 ml-2 text-slate-400`} />
              </a>
            ))}
          </div>
        ) : (
          <div className={`p-3 rounded-xl border text-center text-[11px] ${isNightMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-sky-100 text-slate-400'}`}>
            Cheatsheet & reference guides included in main content.
          </div>
        )}
      </div>
    </aside>
  );
};
