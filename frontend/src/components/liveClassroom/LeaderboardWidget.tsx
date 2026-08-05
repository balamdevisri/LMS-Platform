import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Trophy, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  studentName: string;
  timeTaken: string;
  isCorrect: boolean;
  xpEarned: number;
}

interface LeaderboardWidgetProps {
  socket: Socket | null;
  classId: string;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({ socket }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for leaderboard updates
    socket.on('leaderboard_update', (data: LeaderboardItem[]) => {
      setLeaderboard(data);
    });

    return () => {
      socket.off('leaderboard_update');
    };
  }, [socket]);

  return (
    <div className="bg-slate-900/60 border border-sky-500/15 p-6 rounded-2xl font-['Sora'] space-y-4">
      <div className="flex items-center gap-2 border-b border-sky-500/10 pb-3">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h3 className="font-heading font-black text-sm text-white">Live Speed Leaderboard</h3>
      </div>

      {leaderboard.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs font-bold">
          No quiz responses logged yet. Leaderboard will update dynamically.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
          {leaderboard.map((item) => {
            const rankEmoji = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '';

            return (
              <div
                key={item.rank}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  item.rank === 1
                    ? 'bg-amber-500/10 border-amber-500/30 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                    item.rank === 1
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    {rankEmoji || item.rank}
                  </span>

                  <div>
                    <h4 className="text-xs font-black text-white">{item.studentName}</h4>
                    <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Response speed: {item.timeTaken}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="shrink-0">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </span>

                  <div className="bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg text-right">
                    <span className="text-[9px] text-sky-400 font-bold block leading-none">XP Earned</span>
                    <span className="text-xs font-black text-sky-300 font-mono">+{item.xpEarned}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default LeaderboardWidget;
