import React, { useState } from 'react';
import { BarChart2, CheckCircle2 } from 'lucide-react';
import type { ActivePollItem } from '@/hooks/useLiveClassSocket';

export interface LivePollProps {
  activePoll: ActivePollItem | null;
  onVote: (pollId: string, optionId: string) => Promise<void> | void;
  className?: string;
}

export const LivePoll: React.FC<LivePollProps> = ({
  activePoll,
  onVote,
  className = '',
}) => {
  const [votingOptionId, setVotingOptionId] = useState<string | null>(null);

  const handleSelectVote = async (optionId: string) => {
    if (!activePoll || activePoll.status === 'ENDED' || activePoll.userVotedOptionId) return;
    setVotingOptionId(optionId);
    try {
      await onVote(activePoll.id, optionId);
    } finally {
      setVotingOptionId(null);
    }
  };

  if (!activePoll) {
    return (
      <div className={`py-12 text-center text-slate-500 text-xs space-y-2 ${className}`}>
        <BarChart2 className="w-8 h-8 text-slate-700 mx-auto" />
        <p>No active live poll running right now.</p>
        <span className="text-[11px] text-slate-600">The instructor will initiate polls to collect student votes.</span>
      </div>
    );
  }

  const total = activePoll.totalVotes || 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
            {activePoll.status === 'ACTIVE' ? '🔴 Live Poll Active' : '✓ Poll Closed'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {total} Total Votes
          </span>
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
          {activePoll.question}
        </h4>

        {/* Poll Options Bar Graphs */}
        <div className="space-y-2.5">
          {activePoll.options.map((opt) => {
            const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
            const isVoted = activePoll.userVotedOptionId === opt.id || votingOptionId === opt.id;

            return (
              <div key={opt.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleSelectVote(opt.id)}
                  disabled={activePoll.status === 'ENDED' || !!activePoll.userVotedOptionId}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isVoted
                      ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400/40'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate pr-2">{opt.text}</span>
                  <span className="font-mono text-[11px] text-slate-300 shrink-0 font-bold">
                    {pct}% ({opt.votes})
                  </span>
                </button>

                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {activePoll.userVotedOptionId && (
          <div className="text-[11px] text-emerald-400 text-center font-semibold pt-1 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Your vote was submitted server-side!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePoll;
