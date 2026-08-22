import React, { useState, useEffect } from 'react';
import { Copy, ArrowLeft, Lightbulb, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { soundService } from '@/services/soundService';
import type { Challenge } from '@/services/challengeEngine';
import { MarkdownRenderer } from './MarkdownRenderer';

function parseContent(content: string) {
  if (!content) return { objectives: '', concept: '', flowchart: '' };

  const lines = content.split('\n');
  const objectivesLines: string[] = [];
  const flowchartLines: string[] = [];
  const conceptLines: string[] = [];

  let inObjectives = false;
  // A box drawing or arrow character or lines containing explicit "diagram" keyword
  const flowchartChars = /[│┌└─↓├┤┬┴┼┐┘╔╗╚╝═║╠╣╦╩╬▲▼◄►┌┐└┘├┤┬┴┼─]/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if it's a flowchart line first
    const hasFlowchartChar = flowchartChars.test(line);
    const isExplicitDiagram = trimmed.toLowerCase().startsWith('diagram');

    if (hasFlowchartChar || isExplicitDiagram) {
      flowchartLines.push(line);
      continue;
    }

    // Detect Objectives block start
    const isObjectivesStart = /learning\s+objective/i.test(trimmed);
    if (isObjectivesStart) {
      inObjectives = true;
      objectivesLines.push(line);
      continue;
    }

    if (inObjectives) {
      // Objectives end when we see a new section heading, e.g. "1.1 Introduction" or "#### 1.2"
      const isNewHeading = trimmed.startsWith('#') || /^\d+\.\d+\s+/.test(trimmed) || /^\d+\.\d+\s*:/.test(trimmed);
      if (isNewHeading) {
        inObjectives = false;
        conceptLines.push(line);
      } else {
        objectivesLines.push(line);
      }
    } else {
      conceptLines.push(line);
    }
  }

  return {
    objectives: objectivesLines.join('\n').trim(),
    concept: conceptLines.join('\n').trim(),
    flowchart: flowchartLines.join('\n').trim()
  };
}

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

  const [showXPClaimedFeedback, setShowXPClaimedFeedback] = useState(false);
  const isInitialCompletedRef = React.useRef(isCompleted);

  // Gamified progression state
  const [revealedStageCount, setRevealedStageCount] = useState(0);
  const [showExampleExplanation, setShowExampleExplanation] = useState(false);

  // Parse lesson content
  const { objectives, concept, flowchart } = React.useMemo(() => parseContent(lessonContent), [lessonContent]);

  // Construct stages list dynamically
  const stages = React.useMemo(() => {
    return [
      ...(objectives ? [{ id: 'objectives', name: '🎯 LEARNING OBJECTIVES' }] : []),
      ...(concept ? [{ id: 'concept', name: '💡 CONCEPT / EXPLANATION' }] : []),
      ...(challenge.exampleCode ? [{ id: 'example', name: '💻 EXAMPLE / CODE' }] : []),
      ...(flowchart ? [{ id: 'flowchart', name: '🔀 FLOWCHART / DIAGRAM' }] : []),
      { id: 'practice', name: '🧪 PRACTICE' }
    ];
  }, [objectives, concept, challenge.exampleCode, flowchart]);

  const totalContentStages = stages.length;
  const isPracticeUnlocked = revealedStageCount === totalContentStages;

  // Initialize and reset states when the challenge changes
  useEffect(() => {
    setStudentInput(challenge.placeholder || '');
    setSelectedOption('');
    setOrderedSelection([]);
    setShowFeedback(isCompleted ? 'correct' : 'idle');
    setShowHint(false);
    isInitialCompletedRef.current = isCompleted;
    setShowXPClaimedFeedback(false);

    // Reset progression states
    setShowExampleExplanation(false);
    setRevealedStageCount(0);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRevealedStageCount(totalContentStages);
    } else {
      const timer = setTimeout(() => {
        setRevealedStageCount(1);
      }, 350);
      return () => clearTimeout(timer);
    }

    if (challenge.type === 'ordering' && challenge.options) {
      // Shuffle options for the ordering challenge
      setShuffledOptions([...challenge.options].sort(() => Math.random() - 0.5));
    }
  }, [challenge]);

  useEffect(() => {
    if (isCompleted && !isInitialCompletedRef.current) {
      setShowXPClaimedFeedback(true);
      const timer = setTimeout(() => {
        setShowXPClaimedFeedback(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    isInitialCompletedRef.current = isCompleted;
  }, [isCompleted]);

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
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-primary hover:text-primary text-slate-400 text-xs font-black rounded-xl cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>◀ MISSION MAP</span>
        </button>
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-md border border-slate-900">
          🎯 PRACTICE ACTIVE
        </span>
      </div>

      {/* Challenge Title HUD */}
      <div className="bg-slate-900/50 border border-slate-805 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-radial-gradient(circle at center right, rgba(249,115,22,0.06), transparent) pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-primary tracking-widest font-mono bg-primary/10 border border-primary/20 px-2.5 py-1 rounded">
              🎯 MISSION {challenge.missionNum} • LEVEL {challenge.missionNum}
            </span>
            <h2 
              className="text-xl sm:text-2xl font-black text-primary mt-1 font-sans tracking-tight uppercase"
              style={{ textShadow: '0 0 8px var(--kq-glow)' }}
            >
              {challenge.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px]">
            <span className="px-2.5 py-1 font-black bg-slate-955 border border-slate-850 rounded-lg text-amber-500">
              ⚡ +50 XP
            </span>
            <span className="px-2.5 py-1 font-black bg-slate-955 border border-slate-850 rounded-lg text-slate-400">
              ⏱ {(challenge as any).duration || '15 mins'}
            </span>
            <span className="px-2.5 py-1 font-black bg-primary/20 border border-primary/40 rounded-lg text-primary uppercase tracking-wider">
              🏆 CONTENT {revealedStageCount} / {totalContentStages}
            </span>
            <span className="px-2.5 py-1 font-black bg-primary text-slate-955 rounded-lg animate-pulse uppercase tracking-wider">
              ⚡ CURRENT
            </span>
          </div>
        </div>
      </div>

      {/* Arena Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[68%_minmax(0,1fr)] gap-8 items-start">
        
        {/* Left Column: Learn & See Example (Gamified Content Progression) */}
        <div className="space-y-6">
          {/* Mission Start Banner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-primary font-black">
                  MISSION SEQUENCE STARTED
                </h4>
                <p className="text-xs font-sans font-bold text-white uppercase tracking-wide">
                  {challenge.title}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-mono font-black text-primary animate-pulse uppercase tracking-wider">
              ACTIVE MISSION
            </span>
          </div>

          {/* Render content stages sequentially */}
          {stages.map((stage, idx) => {
            const isRevealed = idx < revealedStageCount;
            if (!isRevealed) return null;

            const isNew = idx === revealedStageCount - 1;
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const animClass = isNew && !prefersReducedMotion
              ? 'animate-in fade-in slide-in-from-bottom-3.5 duration-500 shadow-[0_0_15px_var(--kq-glow)] border-l-4 border-l-primary/60'
              : 'border-l-4 border-l-slate-800';

            if (stage.id === 'objectives') {
              return (
                <div 
                  key="objectives" 
                  className={`bg-slate-955/20 border border-slate-850 rounded-3xl p-5 space-y-3 transition-all ${animClass}`}
                >
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-slate-850/60 pb-2 flex items-center gap-1.5 font-mono">
                    <span>🎯 LEARNING OBJECTIVES</span>
                  </h3>
                  <div className="text-slate-350 text-xs leading-relaxed font-sans font-medium">
                    <MarkdownRenderer
                      content={objectives}
                      isNightMode={true}
                      courseId={courseId}
                    />
                  </div>
                </div>
              );
            }

            if (stage.id === 'concept') {
              return (
                <div 
                  key="concept" 
                  className={`bg-slate-955/20 border border-slate-850 rounded-3xl p-5 space-y-3 transition-all ${animClass}`}
                >
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-slate-850/60 pb-2 flex items-center gap-1.5 font-mono">
                    <span>💡 CONCEPT / EXPLANATION</span>
                  </h3>
                  <div className="text-slate-350 text-xs leading-relaxed font-sans font-medium">
                    <MarkdownRenderer
                      content={concept}
                      isNightMode={true}
                      courseId={courseId}
                    />
                  </div>
                </div>
              );
            }

            if (stage.id === 'example') {
              return (
                <div 
                  key="example" 
                  className={`bg-slate-955/20 border border-slate-850 rounded-3xl p-5 space-y-3 transition-all ${animClass}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-850/60 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1.5 font-mono">
                      <span>💻 EXAMPLE / CODE</span>
                    </h3>
                    <button
                      onClick={copyExampleCode}
                      className="text-[9px] text-slate-500 hover:text-white flex items-center gap-1 border border-slate-850 px-2 py-0.5 rounded cursor-pointer active:scale-95 transition-all font-mono"
                      title="Copy code to clipboard"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-xs text-primary/90 overflow-x-auto leading-relaxed shadow-inner font-mono">
                    <code>{challenge.exampleCode}</code>
                  </pre>

                  {/* Reveal Explanation Section */}
                  <div className="mt-3 pt-3 border-t border-slate-850/60 space-y-2">
                    {!showExampleExplanation ? (
                      <button
                        onClick={() => {
                          setShowExampleExplanation(true);
                          soundService.play('success');
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-mono text-[10px] font-black rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <span>💡 REVEAL EXPLANATION</span>
                      </button>
                    ) : (
                      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 text-xs text-slate-400 font-sans leading-relaxed transition-all">
                        <span className="font-mono text-[10px] font-black text-amber-500 block mb-1 uppercase tracking-wider">
                          EXPLANATION:
                        </span>
                        {challenge.hint || "Review the syntax structure, functions, and key methods used in the code block example to understand how to apply it in the practice console."}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (stage.id === 'flowchart') {
              return (
                <div 
                  key="flowchart" 
                  className={`bg-slate-955/20 border border-slate-850 rounded-3xl p-5 space-y-3 transition-all ${animClass}`}
                >
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-slate-850/60 pb-2 flex items-center gap-1.5 font-mono">
                    <span>🔀 FLOWCHART / DIAGRAM</span>
                  </h3>
                  <div className="text-slate-350 text-xs leading-relaxed font-sans font-medium">
                    <MarkdownRenderer
                      content={flowchart}
                      isNightMode={true}
                      courseId={courseId}
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* Next Button and Content Complete Banner */}
          {revealedStageCount < totalContentStages ? (
            <div className="flex justify-start">
              <button
                onClick={() => {
                  if (revealedStageCount < totalContentStages) {
                    const nextCount = revealedStageCount + 1;
                    setRevealedStageCount(nextCount);
                    if (nextCount === totalContentStages) {
                      soundService.play('success');
                    } else {
                      soundService.play('unlock');
                    }
                  }
                }}
                className="px-5 py-2.5 bg-primary text-slate-955 font-black rounded-xl hover:shadow-[0_0_15px_var(--kq-glow)] cursor-pointer transition-all active:scale-95 text-xs uppercase flex items-center gap-1.5 font-mono"
              >
                <span>Next Stage</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-3xl p-4 flex items-center justify-between shadow-md animate-in fade-in zoom-in-98 duration-400">
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-400 text-lg">✓</span>
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-black">
                    LEARNING CONTENT SEQUENCE COMPLETE
                  </h4>
                  <p className="text-[11px] font-sans font-bold text-slate-300">
                    Solve the Practice Challenge on the right to complete this node!
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-mono font-black bg-emerald-950 border border-emerald-900 rounded-full text-emerald-400 uppercase tracking-wider animate-pulse">
                COMPLETE
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Try, Check & Feedback */}
        <div 
          className={`space-y-6 lg:sticky lg:top-36 transition-all duration-300 relative ${
            !isPracticeUnlocked 
              ? 'opacity-40 pointer-events-none filter blur-[1px] select-none' 
              : 'opacity-100 pointer-events-auto filter-none select-auto'
          }`}
        >
          {!isPracticeUnlocked && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/20 rounded-3xl p-4 text-center">
              <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-[10px] text-amber-500 font-mono font-black uppercase tracking-widest rounded-xl shadow-lg animate-pulse">
                🔒 Complete Learn Path to Unlock Practice
              </span>
            </div>
          )}
          <div className="bg-slate-955/20 border border-slate-850 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-secondary border-b border-slate-850/60 pb-2 flex items-center gap-1.5 font-mono">
              <span>💻 TRY IT OUT</span>
            </h3>
            <div className="text-xs text-slate-300 font-sans font-medium mb-2 leading-relaxed">
              {challenge.challengeTask}
            </div>

            {/* Interaction Input Interface Area */}
            <div className="mt-4">
              
              {/* Case 1: Multiple Choice */}
              {challenge.type === 'multiple-choice' && challenge.options && (
                <div className="space-y-2.5 font-sans">
                  {challenge.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={isCompleted || showFeedback === 'correct'}
                        className={`w-full p-3.5 text-left rounded-xl border text-xs transition-all active:scale-99 cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-white font-bold shadow-[0_0_12px_var(--kq-glow)]'
                            : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-primary bg-primary/20' : 'border-slate-700'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
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
                    className="w-full bg-transparent p-4 outline-hidden text-primary text-xs font-mono border-0 focus:ring-0 resize-none leading-relaxed placeholder:text-slate-800"
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
                    <span className="text-primary font-bold text-xs shrink-0 select-none">
                      $
                    </span>
                    <input
                      type="text"
                      value={studentInput}
                      onChange={(e) => setStudentInput(e.target.value)}
                      disabled={isCompleted || showFeedback === 'correct'}
                      placeholder="Type command here..."
                      className="flex-1 bg-transparent border-0 outline-hidden focus:ring-0 text-primary text-xs font-mono placeholder:text-slate-855 p-0"
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
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-slate-900/60 border-slate-900 text-slate-450 hover:border-slate-800'
                          }`}
                        >
                          {isSelected && (
                            <span className="bg-primary text-slate-950 px-1 py-0.25 text-[9px] rounded font-black">
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
                            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-black text-primary">
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
                  className="flex-1 py-3 bg-primary hover:brightness-110 text-slate-955 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_var(--kq-glow)]"
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
                <style>{`
                  @keyframes xpFloat {
                    0% {
                      opacity: 0;
                      transform: translate(-50%, 10px);
                    }
                    15% {
                      opacity: 1;
                      transform: translate(-50%, -10px);
                    }
                    85% {
                      opacity: 1;
                      transform: translate(-50%, -10px);
                    }
                    100% {
                      opacity: 0;
                      transform: translate(-50%, -25px);
                    }
                  }
                  .animate-xp-float {
                    animation: xpFloat 2s ease-out forwards;
                  }
                  @keyframes checkPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(16,185,129,0.7)); }
                    100% { transform: scale(1); }
                  }
                  .animate-check-pulse {
                    animation: checkPulse 0.5s ease-out;
                  }
                  @media (prefers-reduced-motion: reduce) {
                    .animate-xp-float {
                      animation: none;
                      opacity: 1;
                      transform: translate(-50%, -10px);
                    }
                    .animate-check-pulse {
                      animation: none;
                    }
                  }
                `}</style>
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-widest">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20 animate-check-pulse" />
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
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center relative">
                  <button
                    onClick={() => {
                      if (!isCompleted) {
                        onToggleComplete();
                        toast.success('🎉 +50 XP Claimed! Lesson marked as completed!');
                      }
                    }}
                    disabled={isCompleted}
                    className={`py-2.5 px-5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer w-full sm:w-auto relative ${
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

                  {showXPClaimedFeedback && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-amber-500 text-slate-955 text-[10px] font-black py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider select-none pointer-events-none animate-xp-float z-50">
                      <Zap className="w-3 h-3 fill-slate-950" />
                      <span>⚡ +50 XP CLAIMED</span>
                    </div>
                  )}

                  {hasNextLesson && (
                    <button
                      onClick={onNextLesson}
                      className="px-6 py-2.5 bg-primary hover:brightness-110 text-slate-955 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_15px_var(--kq-glow)] active:scale-95 transition-all cursor-pointer font-bold"
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
