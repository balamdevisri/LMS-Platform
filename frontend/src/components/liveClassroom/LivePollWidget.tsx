import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { BarChart3, Plus, Trash2, CheckCircle, Vote, Percent } from 'lucide-react';
import { toast } from 'sonner';

interface PollOption {
  optionIndex: number;
  optionText: string;
  votesCount: number;
}

interface LivePollWidgetProps {
  socket: Socket | null;
  classId: string;
  currentUser: { uid: string; name: string; role: 'instructor' | 'mentor' | 'student' };
}

export const LivePollWidget: React.FC<LivePollWidgetProps> = ({ socket, classId, currentUser }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [activePoll, setActivePoll] = useState<{ id: string; question: string; options: string[] } | null>(null);
  
  // Vote counts returned by socket
  const [votes, setVotes] = useState<PollOption[]>([]);
  const [votedOption, setVotedOption] = useState<number | null>(null);

  const isInstructor = currentUser.role === 'instructor' || (currentUser.role as string) === 'admin';

  useEffect(() => {
    if (!socket) return;

    // Listen for new poll publication
    socket.on('poll_published', (poll: { id: string; question: string; options: string[] }) => {
      setActivePoll(poll);
      setVotedOption(null);
      
      // Initialize zero votes
      setVotes(poll.options.map((opt, idx) => ({
        optionIndex: idx,
        optionText: opt,
        votesCount: 0
      })));
      toast.success('New poll published by instructor!');
    });

    // Listen for vote updates
    socket.on('poll_update', (data: PollOption[]) => {
      setVotes(data);
    });

    return () => {
      socket.off('poll_published');
      socket.off('poll_update');
    };
  }, [socket]);

  const handleAddOption = () => {
    if (options.length >= 5) return;
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handlePublish = () => {
    if (!question.trim() || options.some(opt => !opt.trim()) || !socket) {
      toast.error('Please fill in all options.');
      return;
    }
    socket.emit('publish_poll', { classId, question: question.trim(), options: options.map(o => o.trim()) });
    setQuestion('');
    setOptions(['', '']);
    toast.success('Poll published successfully!');
  };

  const handleVote = (optionIndex: number) => {
    if (votedOption !== null || !activePoll || !socket) return;
    setVotedOption(optionIndex);
    socket.emit('submit_vote', {
      classId,
      pollId: activePoll.id,
      optionIndex,
      userId: currentUser.uid
    });
    toast.success(`Vote submitted for: ${activePoll.options[optionIndex]}`);
  };

  const totalVotes = votes.reduce((sum, item) => sum + item.votesCount, 0);
  const maxVotes = Math.max(...votes.map(v => v.votesCount), 0);

  return (
    <div className="bg-slate-900/60 border border-sky-500/15 p-6 rounded-2xl font-['Sora'] space-y-6">
      <div className="flex items-center gap-2 border-b border-sky-500/10 pb-3">
        <BarChart3 className="w-5 h-5 text-sky-400" />
        <h3 className="font-heading font-black text-sm text-white">Live Audience Polls</h3>
      </div>

      {isInstructor && (
        <div className="space-y-4 bg-slate-900/40 p-4 rounded-xl border border-sky-500/5 text-xs text-slate-300">
          <p className="font-bold text-sky-400 uppercase tracking-wider text-[10px]">Create Live Poll</p>
          
          <div>
            <label className="block mb-1 font-bold text-slate-400">Poll Question</label>
            <input
              type="text"
              placeholder="e.g. Which garbage collector design is best for high memory throughput?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700/60 rounded-xl p-2.5 text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2.5">
            <label className="block font-bold text-slate-400">Choices / Options (Max 5)</label>
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-black flex items-center justify-center border border-slate-700">
                  {index + 1}
                </span>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700/60 rounded-xl p-2 text-white focus:outline-none"
                />
                {options.length > 2 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveOption(index)} 
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={options.length >= 5}
              onClick={handleAddOption}
              className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Choice
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl shadow-lg shadow-sky-500/10 cursor-pointer"
            >
              Publish Poll
            </button>
          </div>
        </div>
      )}

      {activePoll ? (
        <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-sky-500/10">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
              Active Live Poll
            </span>
            <h4 className="font-heading font-extrabold text-sm text-white mt-2 leading-relaxed">
              {activePoll.question}
            </h4>
          </div>

          <div className="space-y-3">
            {votes.map((v) => {
              const votePct = totalVotes > 0 ? Math.round((v.votesCount / totalVotes) * 100) : 0;
              const hasVoted = votedOption !== null;
              const isSelected = votedOption === v.optionIndex;
              const isWinner = totalVotes > 0 && v.votesCount === maxVotes;

              return (
                <div key={v.optionIndex} className="space-y-1">
                  <button
                    disabled={hasVoted && !isInstructor}
                    onClick={() => handleVote(v.optionIndex)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all relative overflow-hidden flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 text-white'
                        : isWinner && hasVoted
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/30 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="flex items-center gap-2 z-10">
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />
                      ) : (
                        <Vote className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span>{v.optionText}</span>
                    </span>

                    {hasVoted && (
                      <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-400 z-10">
                        <span>{v.votesCount} votes</span>
                        <span>({votePct}%)</span>
                      </span>
                    )}

                    {hasVoted && (
                      <div 
                        className={`absolute left-0 top-0 bottom-0 opacity-15 transition-all duration-700 ${
                          isWinner ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${votePct}%` }}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {totalVotes > 0 && (
            <div className="pt-2 border-t border-sky-500/5 text-[10px] text-slate-400 flex items-center justify-between font-bold">
              <span>Total Submissions: {totalVotes} votes</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Percent className="w-3.5 h-3.5" /> High Accuracy Voting
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center text-slate-500 text-xs font-bold border border-dashed border-slate-800 rounded-xl">
          No live polls currently running.
        </div>
      )}
    </div>
  );
};
export default LivePollWidget;
