import React, { useState, useEffect } from 'react';
import { Copy, ArrowLeft, Lightbulb, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { soundService } from '@/services/soundService';
import type { Challenge } from '@/services/challengeEngine';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChallengeArenaProps {
  challenge: Challenge;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNextLesson: () => void;
  hasNextLesson: boolean;
  onBackToMap: () => void;
  lessonContent: string;
  courseId: string;
}

export const ChallengeArena: React.FC<ChallengeArenaProps> = ({
  challenge,
  isCompleted,
  onToggleComplete,
  onNextLesson,
  hasNextLesson,
  onBackToMap,
  lessonContent,
  courseId,
}) => {
  const [studentInput, setStudentInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [orderedSelection, setOrderedSelection] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showHint, setShowHint] = useState(false);

  // Initialize and reset states when the challenge changes
  useEffect(() => {
    setStudentInput(challenge.placeholder || '');
    setSelectedOption('');
    setOrderedSelection([]);
    setShowFeedback(isCompleted ? 'correct' : 'idle');
    setShowHint(false);

    if (challenge.type === 'ordering' && challenge.options) {
      // Shuffle options for the ordering challenge
      setShuffledOptions([...challenge.options].sort(() => Math.random() - 0.5));
    }
  }, [challenge, isCompleted]);

  const handleOptionClick = (opt: string) => {
    if (isCompleted || showFeedback === 'correct') return;
    setSelectedOption(opt);
    soundService.play('select');
  };

  const handleOrderChipClick = (opt: string) => {
    if (isCompleted || showFeedback === 'correct') return;
    if (orderedSelection.includes(opt)) {
      setOrderedSelection(prev => prev.filter(x => x !== opt));
    } else {
      setOrderedSelection(prev => [...prev, opt]);
    }
    soundService.play('select');
  };

  const handleResetOrder = () => {
    if (isCompleted || showFeedback === 'correct') return;
    setOrderedSelection([]);
    soundService.play('select');
  };

  const handleCheckAnswer = () => {
    let isCorrect = false;

    if (challenge.type === 'multiple-choice') {
      isCorrect = selectedOption.trim().toLowerCase() === String(challenge.correctAnswer).trim().toLowerCase();
    } else if (challenge.type === 'ordering') {
      const correctArr = challenge.correctAnswer as string[];
      isCorrect = 
        orderedSelection.length === correctArr.length &&
        orderedSelection.every((val, index) => val.toLowerCase() === correctArr[index].toLowerCase());
    } else {
      // code or command check: trim whitespace and compare case-insensitively
      const cleanInput = studentInput.trim().replace(/\s+/g, ' ').toLowerCase();
      const cleanAnswer = String(challenge.correctAnswer).trim().replace(/\s+/g, ' ').toLowerCase();
      isCorrect = cleanInput === cleanAnswer;
    }

    if (isCorrect) {
      setShowFeedback('correct');
      soundService.play('success');
      const diff = challenge.difficulty || 'Easy';
      const xp = diff.toLowerCase() === 'easy' ? 10 : diff.toLowerCase() === 'medium' ? 20 : 30;
      toast.success(`✓ Challenge complete! +${xp} XP awarded.`);
    } else {
      setShowFeedback('incorrect');
      soundService.play('error');
      toast.error('✕ Not yet correct. Try again!');
    }
  };

  const copyExampleCode = () => {
    navigator.clipboard.writeText(challenge.exampleCode);
    toast.success('Example code copied to clipboard');
    soundService.play('select');
  };

  return (
    <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 font-mono text-slate-200 animate-in fade-in duration-300">
      
      {/* Back to Mission Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <button
          onClick={onBackToMap}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500 hover:text-cyan-400 text-slate-400 text-xs font-black rounded-xl cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>◀ MISSION MAP</span>
        </button>
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-md border border-slate-900">
          🎯 PRACTICE ONLY
        </span>
      </div>

      {/* Challenge Title HUD */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
        <span className="text-[9px] font-black uppercase text-cyan-400 tracking-widest font-mono bg-cyan-950/40 border border-cyan-900/50 px-2 py-0.5 rounded">
          MISSION {challenge.missionNum} • CHALLENGE {challenge.challengeNum}
        </span>
        <h2 className="text-xl font-black text-white mt-3 font-sans tracking-tight">
          {challenge.title}
        </h2>
      </div>

      {/* Arena Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[68%_minmax(0,1fr)] gap-8 items-start">
        
        {/* Left Column: Learn & See Example */}
        <div className="space-y-6">
          {/* Learn Section */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 border-b border-slate-900 pb-2 flex items-center gap-1.5">
              <span>📖 LEARN</span>
            </h3>
            <div className="text-slate-355 text-xs leading-relaxed font-sans font-medium">
              <MarkdownRenderer
                content={lessonContent}
                isNightMode={true}
                courseId={courseId}
              />
            </div>
          </div>

          {/* Example Section */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>🎯 SEE EXAMPLE</span>
              </h3>
              <button
                onClick={copyExampleCode}
                className="text-[9px] text-slate-500 hover:text-white flex items-center gap-1 border border-slate-900 px-2 py-0.5 rounded cursor-pointer active:scale-95 transition-all"
                title="Copy code to clipboard"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 text-xs text-cyan-400 overflow-x-auto leading-relaxed shadow-inner">
              <code>{challenge.exampleCode}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Try, Check & Feedback */}
        <div className="space-y-6 lg:sticky lg:top-36">
          <div className="bg-slate-950/60 border border-slate-900 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 border-b border-slate-900 pb-2 flex items-center gap-1.5">
              <span>💻 TRY IT OUT</span>
            </h3>
            <div className="text-xs text-slate-300 font-sans font-medium mb-2 leading-relaxed">
              {challenge.challengeTask}
            </div>

            {/* Interaction Input Interface Area */}
            <div className="mt-4">
              
              {/* Case 1: Multiple Choice */}
              {challenge.type === 'multiple-choice' && challenge.options && (
                <div className="space-y-2.5">
                  {challenge.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={isCompleted || showFeedback === 'correct'}
                        className={`w-full p-3.5 text-left rounded-xl border text-xs font-sans transition-all active:scale-99 cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-cyan-950/20 border-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                            : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-cyan-400 bg-cyan-500/20' : 'border-slate-700'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                        </div>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Case 2: Code Challenge Editor */}
              {challenge.type === 'code' && (
                <div className="border border-slate-900 rounded-2xl overflow-hidden shadow-inner bg-slate-950">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-900 text-[10px] text-slate-500 flex justify-between select-none">
                    <span>challenge_editor.py</span>
                    <span>Tab spacing: 4</span>
                  </div>
                  <textarea
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    disabled={isCompleted || showFeedback === 'correct'}
                    rows={4}
                    className="w-full bg-transparent p-4 outline-hidden text-cyan-300 text-xs font-mono border-0 focus:ring-0 resize-none leading-relaxed placeholder:text-slate-800"
                    placeholder={challenge.placeholder}
                  />
                </div>
              )}

              {/* Case 3: Command Challenge Line */}
              {challenge.type === 'command' && (
                <div className="bg-[#020617] border border-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-inner">
                  <div className="bg-slate-950 border-b border-slate-900 px-4 py-2 text-[10px] text-slate-500 select-none">
                    <span>cli_terminal_session.sh</span>
                  </div>
                  <div className="p-3.5 flex items-center gap-2">
                    <span className="text-cyan-400 font-bold text-xs shrink-0 select-none">
                      $
                    </span>
                    <input
                      type="text"
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      disabled={isCompleted || showFeedback === 'correct'}
                      placeholder="Type command here..."
                      className="flex-1 bg-transparent border-0 outline-hidden focus:ring-0 text-cyan-300 text-xs font-mono placeholder:text-slate-850 p-0"
                    />
                  </div>
                </div>
              )}

              {/* Case 4: Ordering Sequence Challenge */}
              {challenge.type === 'ordering' && challenge.options && (
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Click steps below to arrange in chronological sequence:
                  </div>

                  {/* Order Selector Chips List */}
                  <div className="flex flex-wrap gap-2">
                    {shuffledOptions.map((opt, idx) => {
                      const isSelected = orderedSelection.includes(opt);
                      const displayNum = orderedSelection.indexOf(opt) + 1;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleOrderChipClick(opt)}
                          disabled={isCompleted || showFeedback === 'correct'}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95 cursor-pointer select-none flex items-center gap-2 ${
                            isSelected
                              ? 'bg-cyan-950/30 border-cyan-400 text-cyan-400'
                              : 'bg-slate-900/60 border-slate-900 text-slate-450 hover:border-slate-800'
                          }`}
                        >
                          {isSelected && (
                            <span className="bg-cyan-500 text-slate-950 px-1 py-0.25 text-[9px] rounded font-black">
                              {displayNum}
                            </span>
                          )}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Ordered Output List View */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 min-h-[50px] flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {orderedSelection.length > 0 ? (
                        orderedSelection.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-white">
                            {idx > 0 && <span className="text-slate-600">➔</span>}
                            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-black text-cyan-400">
                              {val}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-650 font-bold uppercase tracking-wider">
                          Click blocks above to construct path sequence...
                        </span>
                      )}
                    </div>

                    {orderedSelection.length > 0 && !(isCompleted || showFeedback === 'correct') && (
                      <button
                        onClick={handleResetOrder}
                        className="text-[9px] text-rose-400 hover:text-rose-350 hover:border-rose-800 border border-slate-900 px-2 py-0.5 rounded transition-all cursor-pointer font-black"
                      >
                        RESET
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Check Challenge Submissions action */}
            {!(isCompleted || showFeedback === 'correct') && (
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCheckAnswer}
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                >
                  [ CHECK CHALLENGE ]
                </button>
                <button
                  onClick={() => {
                    setShowHint(true);
                    soundService.play('select');
                  }}
                  className="px-4 py-3 bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 text-xs rounded-xl cursor-pointer hover:text-slate-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Hint</span>
                </button>
              </div>
            )}

            {/* Hint Box panel */}
            {showHint && !(isCompleted || showFeedback === 'correct') && (
              <div className="bg-amber-950/20 border border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 text-amber-350 animate-in slide-in-from-top-2 duration-200 font-sans">
                <Lightbulb className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest font-mono">
                    💡 Hint Protocol:
                  </div>
                  <div className="text-xs font-medium leading-relaxed">
                    {challenge.hint}
                  </div>
                </div>
              </div>
            )}

            {/* Correct Feedback Screen */}
            {(isCompleted || showFeedback === 'correct') && (
              <div className="bg-emerald-950/20 border border-emerald-500/50 rounded-2xl p-5 text-center animate-in zoom-in-95 duration-200 space-y-4">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-widest">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  <span>✓ CHALLENGE COMPLETE</span>
                </div>
                
                <div className="py-2 animate-bounce">
                  <span className="text-2xl font-black text-amber-400 font-mono tracking-wide">
                    +{challenge.difficulty?.toLowerCase() === 'easy' ? 10 : challenge.difficulty?.toLowerCase() === 'medium' ? 20 : challenge.difficulty?.toLowerCase() === 'hard' ? 30 : 10} XP
                  </span>
                </div>

                <div className="text-white text-xs font-sans font-medium">
                  Excellent work. Challenge protocol successfully mastered.
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button
                    onClick={() => {
                      if (!isCompleted) {
                        onToggleComplete();
                        soundService.play('success');
                        toast.success('🎉 +50 XP Claimed! Lesson marked as completed!');
                      }
                    }}
                    disabled={isCompleted}
                    className={`py-2.5 px-5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer w-full sm:w-auto ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-955 font-black shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>✓ XP Claimed (+50 XP)</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-slate-955 fill-current" />
                        <span>⚡ Claim +50 XP</span>
                      </>
                    )}
                  </button>

                  {hasNextLesson && (
                    <button
                      onClick={onNextLesson}
                      className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.35)] active:scale-95 transition-all cursor-pointer font-bold"
                    >
                      <span>Next Challenge ➔</span>
                    </button>
                  )}
                </div>

                {!hasNextLesson && (
                  <div className="text-xs font-black text-amber-400 font-mono py-2">
                    🎉 CONGRATULATIONS! ALL SYLLABUS CHALLENGES SECURED!
                  </div>
                )}
              </div>
            )}

            {/* Incorrect Feedback Screen */}
            {showFeedback === 'incorrect' && !isCompleted && (
              <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-4 flex items-start gap-3 text-rose-350 animate-in slide-in-from-top-2 duration-200 font-sans">
                <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest font-mono">
                    ✕ NOT YET CORRECT
                  </div>
                  <div className="text-xs font-medium">
                    Parameters do not match target check specifications. Review hint and try again.
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
