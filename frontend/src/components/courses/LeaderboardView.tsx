import React, { useState, useEffect } from 'react';
import { Award, Trophy, Award as BadgeIcon, Users, Calendar, Clock, BookOpen } from 'lucide-react';
import { LeaderboardService } from '../../services/achievementService';
import type { LeaderboardEntry } from '../../services/achievementService';

export const LeaderboardView: React.FC = () => {
  const leaderboardService = new LeaderboardService();
  const [filter, setFilter] = useState<'global' | 'course' | 'weekly' | 'monthly'>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(leaderboardService.getLeaderboard(filter));
  }, [filter]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span title="1st Place (Gold)"><Trophy className="w-5 h-5 text-amber-500 fill-amber-400" /></span>;
    if (rank === 2) return <span title="2nd Place (Silver)"><Trophy className="w-5 h-5 text-slate-400 fill-slate-300" /></span>;
    if (rank === 3) return <span title="3rd Place (Bronze)"><Trophy className="w-5 h-5 text-amber-750 fill-amber-700" /></span>;
    return <span className="font-mono text-slate-400 text-[10px] w-5 text-center font-bold">#{rank}</span>;
  };

  return (
    <div className="space-y-6 font-['Sora'] text-slate-800 animate-in fade-in duration-300">
      
      {/* Leaderboard Header & Options */}
      <div className="bg-white border border-sky-100 p-5 rounded-3xl shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <span>Cohort Leaderboard Rankings</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Compare experience points (XP) and badges with peers.</p>
        </div>

        {/* Filter Swaps */}
        <div className="flex bg-slate-50 border border-slate-250/70 rounded-xl p-0.5 text-[11px] font-bold self-start sm:self-auto shrink-0 select-none">
          {[
            { id: 'global', label: 'Global', icon: <Users className="w-3 h-3" /> },
            { id: 'course', label: 'Course', icon: <BookOpen className="w-3 h-3" /> },
            { id: 'weekly', label: 'Weekly', icon: <Clock className="w-3 h-3" /> },
            { id: 'monthly', label: 'Monthly', icon: <Calendar className="w-3 h-3" /> }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id as any)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                filter === opt.id ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Ranks Table */}
      <div className="bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest select-none">
                <th className="py-4.5 px-6 w-20 text-center">Rank</th>
                <th className="py-4.5 px-4">Student Scholar</th>
                <th className="py-4.5 px-4 text-center">Badges</th>
                <th className="py-4.5 px-4 text-center">Certifications</th>
                <th className="py-4.5 px-6 text-right w-36">Experience XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {entries.map((entry) => (
                <tr
                  key={entry.rank}
                  className={`transition-all duration-300 ${
                    entry.isCurrentUser 
                      ? 'bg-sky-50/40 border-l-4 border-l-blue-500 font-bold' 
                      : 'hover:bg-slate-50/40'
                  }`}
                >
                  {/* Rank Column */}
                  <td className="py-4 px-6 text-center shrink-0">
                    <div className="flex items-center justify-center h-6">
                      {getRankBadge(entry.rank)}
                    </div>
                  </td>

                  {/* Name & Avatar */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {/* Styled avatar letter */}
                      <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 select-none ${
                        entry.isCurrentUser 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : entry.rank === 1
                          ? 'bg-amber-100 border border-amber-300 text-amber-800'
                          : 'bg-slate-100 border border-slate-200 text-slate-600'
                      }`}>
                        {entry.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-slate-900">{entry.name}</span>
                        {entry.isCurrentUser && (
                          <span className="inline-block text-[8px] font-extrabold text-blue-600 bg-blue-50 px-1 rounded-sm border border-blue-200 mt-0.5 uppercase tracking-wide">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Badges count */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg font-mono text-[10px] text-slate-500">
                      <BadgeIcon className="w-3 h-3 text-indigo-500" />
                      <span>{entry.badgesCount}</span>
                    </span>
                  </td>

                  {/* Courses count */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg font-mono text-[10px] text-slate-500">
                      <Award className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{entry.coursesCompleted}</span>
                    </span>
                  </td>

                  {/* XP Points */}
                  <td className="py-4 px-6 text-right">
                    <span className={`font-mono font-bold ${
                      entry.isCurrentUser ? 'text-blue-600' : 'text-slate-800'
                    }`}>
                      {entry.xp.toLocaleString()} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
