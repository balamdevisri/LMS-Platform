import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import {
  BarChart3,
  Plus,
  Trash2,
  CheckCircle2,
  Vote,
  Percent,
  StopCircle,
  Eye,
  PlusCircle,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface PollOption {
  optionIndex: number;
  optionText: string;
  votesCount: number;
}

interface LivePollWidgetProps {
  socket: Socket | null;
  classId: string;
  currentUser: { uid: string; name: string; role: 'instructor' | 'mentor' | 'student' | 'admin' };
}

export const LivePollWidget: React.FC<LivePollWidgetProps> = ({ socket, classId, currentUser }) => {
  const isInstructor = currentUser.role === 'instructor' || (currentUser.role as string) === 'admin' || currentUser.role === 'mentor';

  const [activeTab, setActiveTab] = useState<'create' | 'poll'>('create');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [activePoll, setActivePoll] = useState<{ id: string; question: string; options: string[] } | null>(null);

  // Vote counts
  const [votes, setVotes] = useState<PollOption[]>([]);
  const [votedOption, setVotedOption] = useState<number | null>(null);
  const [revealedCorrectIndex, setRevealedCorrectIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) return;

    // 1. Fetch currently active poll on mount or socket connection
    socket.emit('poll:get_active', { classId, liveClassId: classId });

    const handleActivePoll = (res: any) => {
      if (res?.success && res.poll) {
        const poll = res.poll;
        const opts = Array.isArray(poll.options)
          ? poll.options.map((o: any) => (typeof o === 'string' ? o : o.text || ''))
          : [];
        setActivePoll({
          id: poll.id,
          question: poll.question,
          options: opts,
        });
        setActiveTab('poll');
        if (poll.hasVoted) {
          setVotedOption(0);
        }
        if (Array.isArray(poll.options)) {
          setVotes(
            poll.options.map((o: any, idx: number) => ({
              optionIndex: o.optionIndex !== undefined ? o.optionIndex : idx,
              optionText: typeof o === 'string' ? o : o.text,
              votesCount: o.votes || 0,
            }))
          );
        }
      }
    };
    socket.on('poll:active', handleActivePoll);

    // 2. Listen for new poll publication
    const handlePollPublished = (poll: { id: string; question: string; options: any[] }) => {
      if (!poll) return;
      const opts = Array.isArray(poll.options)
        ? poll.options.map((o) => (typeof o === 'string' ? o : o.text || ''))
        : [];
      setActivePoll({
        id: poll.id,
        question: poll.question,
        options: opts,
      });
      setActiveTab('poll');
      setVotedOption(null);
      setRevealedCorrectIndex(null);
      setVotes(
        opts.map((opt, idx) => ({
          optionIndex: idx,
          optionText: opt,
          votesCount: 0,
        }))
      );
      toast.success('New poll published by instructor!');
    };

    socket.on('poll_published', handlePollPublished);
    socket.on('poll:start', handlePollPublished);

    // 3. Listen for vote updates
    const handlePollUpdate = (data: any) => {
      if (Array.isArray(data)) {
        setVotes(data);
      } else if (data?.options && Array.isArray(data.options)) {
        setVotes(
          data.options.map((o: any, idx: number) => ({
            optionIndex: o.optionIndex !== undefined ? o.optionIndex : idx,
            optionText: typeof o === 'string' ? o : o.text,
            votesCount: o.votes || 0,
          }))
        );
      }
    };
    socket.on('poll_update', handlePollUpdate);
    socket.on('poll:update', handlePollUpdate);

    // 4. Listen for poll reveal
    socket.on('poll:revealed', (data: { correctOptionIndex?: number }) => {
      if (data?.correctOptionIndex !== undefined) {
        setRevealedCorrectIndex(data.correctOptionIndex);
        toast.info('Instructor revealed the correct poll response!');
      }
    });

    // 5. Listen for poll ended
    const handlePollEnd = () => {
      toast.info('The active poll has ended.');
    };
    socket.on('poll:end', handlePollEnd);

    return () => {
      socket.off('poll:active', handleActivePoll);
      socket.off('poll_published', handlePollPublished);
      socket.off('poll:start', handlePollPublished);
      socket.off('poll_update', handlePollUpdate);
      socket.off('poll:update', handlePollUpdate);
      socket.off('poll:revealed');
      socket.off('poll:end', handlePollEnd);
    };
  }, [socket, classId]);

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
    if (!question.trim() || options.some((opt) => !opt.trim()) || !socket) {
      toast.error('Please enter a question and provide all choice texts.');
      return;
    }
    const cleanOpts = options.map((o) => o.trim());
    socket.emit('poll:create', {
      classId,
      liveClassId: classId,
      question: question.trim(),
      options: cleanOpts,
      durationSeconds: 60,
    });
    socket.emit('publish_poll', { classId, question: question.trim(), options: cleanOpts });

    setQuestion('');
    setOptions(['', '']);
    setActiveTab('poll');
    toast.success('Live poll published successfully!');
  };

  const handleVote = (optionIndex: number) => {
    if (votedOption !== null || !activePoll || !socket) return;
    setVotedOption(optionIndex);
    socket.emit('poll:vote', {
      classId,
      liveClassId: classId,
      pollId: activePoll.id,
      optionId: `opt_${optionIndex}`,
      optionIndex,
      userId: currentUser.uid,
    });
    socket.emit('submit_vote', {
      classId,
      liveClassId: classId,
      pollId: activePoll.id,
      optionIndex,
      userId: currentUser.uid,
    });
    toast.success(`Vote recorded for: ${activePoll.options[optionIndex]}`);
  };

  const handleEndPoll = () => {
    if (!socket || !activePoll) return;
    socket.emit('poll:end', {
      classId,
      liveClassId: classId,
      pollId: activePoll.id,
    });
  };

  const totalVotes = votes.reduce((sum, item) => sum + item.votesCount, 0);
  const maxVotes = Math.max(...votes.map((v) => v.votesCount), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs font-sans text-slate-800 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 leading-tight">Live Audience Polls</h3>
            <p className="text-[11px] text-slate-500">Real-time instant opinion & consensus gathering</p>
          </div>
        </div>

        {isInstructor && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create
            </button>
            <button
              onClick={() => setActiveTab('poll')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'poll'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Poll ({totalVotes})
            </button>
          </div>
        )}
      </div>

      {/* INSTRUCTOR CREATE TAB */}
      {isInstructor && activeTab === 'create' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Poll Question</label>
            <input
              type="text"
              placeholder="e.g., Which approach is better for real-time video distribution?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Options (Up to 5)</label>
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={options.length >= 5}
              onClick={handleAddOption}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Choice</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
            >
              Publish Poll
            </button>
          </div>
        </div>
      ) : activePoll ? (
        /* ACTIVE POLL VIEW */
        <div className="space-y-4">
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
              Active Poll
            </span>
            <h4 className="font-bold text-sm text-slate-900 leading-snug pt-1">
              {activePoll.question}
            </h4>
          </div>

          <div className="space-y-2.5">
            {votes.map((v) => {
              const votePct = totalVotes > 0 ? Math.round((v.votesCount / totalVotes) * 100) : 0;
              const hasVoted = votedOption !== null;
              const isSelected = votedOption === v.optionIndex;
              const isCorrect = revealedCorrectIndex === v.optionIndex;

              return (
                <div key={v.optionIndex} className="space-y-1">
                  <button
                    disabled={hasVoted && !isInstructor}
                    onClick={() => handleVote(v.optionIndex)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all relative overflow-hidden flex items-center justify-between cursor-pointer disabled:cursor-default ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900'
                        : isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 text-indigo-900 ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {/* Background Progress Bar */}
                    {hasVoted && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 opacity-15 transition-all duration-700 ${
                          isCorrect
                            ? 'bg-emerald-600'
                            : isSelected
                            ? 'bg-indigo-600'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${votePct}%` }}
                      />
                    )}

                    <span className="flex items-center gap-2.5 z-10">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <Vote className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>{v.optionText}</span>
                    </span>

                    {hasVoted && (
                      <span className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-600 z-10">
                        <span>{v.votesCount} votes</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {votePct}%
                        </span>
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{totalVotes} total responses</span>
            </span>

            {isInstructor && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEndPoll}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] border border-rose-200 cursor-pointer flex items-center gap-1"
                >
                  <StopCircle className="w-3 h-3" />
                  <span>End Poll</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 space-y-2">
          <BarChart3 className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-medium">No live poll currently active.</p>
          <p className="text-[11px] text-slate-400">Audience polls launched by the instructor will appear here instantly.</p>
        </div>
      )}
    </div>
  );
};

export default LivePollWidget;
