import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, Calendar, Plus, Trash2, Play, Users, BarChart3, X, Sparkles, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface LiveClassData {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  moduleName: string;
  instructorId: string;
  instructorName: string;
  status: 'scheduled' | 'running' | 'completed';
  scheduledTime: string;
  chatEnabled: boolean;
  quizEnabled: boolean;
  pollEnabled: boolean;
  locked: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const LiveClassroomDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<LiveClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'scheduled' | 'completed'>('all');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('Advanced Linux Kernel Engineering');
  const [moduleName, setModuleName] = useState('Module 1: Kernel Core Architecture');
  const [scheduledTime, setScheduledTime] = useState('');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/live-classroom`);
      const payload = await res.json();
      if (payload.success && Array.isArray(payload.data)) {
        setClasses(payload.data);
      } else {
        throw new Error('Fallback to local simulation');
      }
    } catch (err) {
      // Simulate state locally if backend is offline
      const mockClasses: LiveClassData[] = [
        {
          id: 'class_linux_kernel_1',
          title: 'Linux Kernel Monolithic Architecture & Memory Management',
          courseId: 'course_linux_kernel',
          courseName: 'Advanced Linux Kernel Engineering',
          moduleName: 'Module 1: Kernel Core Architecture',
          instructorId: 'inst_kaizen',
          instructorName: 'Prof. Manoj Acharya',
          status: 'running',
          scheduledTime: new Date().toISOString(),
          chatEnabled: true,
          quizEnabled: true,
          pollEnabled: true,
          locked: false,
        },
        {
          id: 'class_linux_sys_2',
          title: 'Advanced System Calls & Concurrency Primitives',
          courseId: 'course_linux_systems',
          courseName: 'Linux Systems & Kernel Administration',
          moduleName: 'Module 2: Multithreading & POSIX',
          instructorId: 'inst_kaizen',
          instructorName: 'Prof. Manoj Acharya',
          status: 'scheduled',
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          chatEnabled: true,
          quizEnabled: true,
          pollEnabled: true,
          locked: false,
        },
        {
          id: 'class_linux_perf_3',
          title: 'EBPF Performance Diagnostics & System Tracing',
          courseId: 'course_linux_perf',
          courseName: 'Linux Performance & eBPF Engineering',
          moduleName: 'Module 4: Runtime Analysis',
          instructorId: 'inst_kaizen',
          instructorName: 'Prof. Manoj Acharya',
          status: 'completed',
          scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          chatEnabled: true,
          quizEnabled: true,
          pollEnabled: true,
          locked: true,
        }
      ];
      setClasses(mockClasses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledTime) {
      toast.error('Please enter a class title and schedule time.');
      return;
    }

    const payload: Omit<LiveClassData, 'id'> = {
      title,
      courseId: courseName.toLowerCase().replace(/\s+/g, '_'),
      courseName,
      moduleName,
      instructorId: userProfile?.uid || 'inst_kaizen',
      instructorName: userProfile?.fullName || 'KaizenQ Mentor',
      status: 'scheduled' as const,
      scheduledTime: new Date(scheduledTime).toISOString(),
      chatEnabled: true,
      quizEnabled: true,
      pollEnabled: true,
      locked: false,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/live-classroom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Live Classroom session scheduled!');
        setIsCreateOpen(false);
        setTitle('');
        setScheduledTime('');
        fetchClasses();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      // Local fallback sync
      const simulatedNew = { ...payload, id: `class_${Date.now()}` };
      setClasses([simulatedNew, ...classes]);
      toast.success('Scheduled Live Classroom session (Local fallback mode)!');
      setIsCreateOpen(false);
      setTitle('');
      setScheduledTime('');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'running' | 'completed') => {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classroom/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...(newStatus === 'running' ? { startTime: new Date() } : { endTime: new Date() }) })
      });
      const data = await res.json();
      if (data.success) {
        toast.info(`Class status updated to ${newStatus.toUpperCase()}`);
        fetchClasses();
      }
    } catch (err) {
      setClasses(classes.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.info(`Class status updated (Local mode)`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/live-classroom/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Class session deleted.');
        fetchClasses();
      }
    } catch (err) {
      setClasses(classes.filter(c => c.id !== id));
      toast.success('Class session deleted (Local mode).');
    }
  };

  const filteredClasses = classes.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const isInstructor = userProfile?.role === 'instructor' || userProfile?.role === 'admin';

  return (
    <div className="space-y-8 text-slate-100 dark:text-zinc-100 font-['Sora'] max-w-7xl mx-auto pb-12">
      
      {/* Top Glassmorphic Header */}
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-sky-500/20 p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 animate-pulse text-sky-400" />
              <span>Real-Time Live Classroom</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Insights Enabled</span>
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Virtual Learning Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium max-w-xl leading-relaxed">
            Join real-time classrooms, publish interactive code-output quizzes, cast live audience polls, and inspect detailed automated attendance reports.
          </p>
        </div>

        {isInstructor && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full md:w-auto px-6 py-3.5 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Live Class</span>
          </button>
        )}
      </div>

      {/* Tabs and Filtering toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-sky-500/10">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {(['all', 'running', 'scheduled', 'completed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`py-2 px-4 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                filter === t
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {t === 'all' ? 'All Classes' : `${t} classes`}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-bold bg-slate-800/20 py-1.5 px-3 rounded-lg border border-sky-500/5">
          Roster Count: {filteredClasses.length} sessions
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400 mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold mt-4">Connecting to Live database...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/20 border border-sky-500/5 rounded-3xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300">No active classes found.</p>
          <p className="text-xs text-slate-500 mt-1">Check scheduled lists or schedule a new class.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((c) => {
            const classTime = new Date(c.scheduledTime);
            const isRunning = c.status === 'running';
            const isCompleted = c.status === 'completed';

            return (
              <div 
                key={c.id}
                className="bg-slate-900/70 border border-sky-500/10 hover:border-sky-500/30 rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all shadow-xl hover:-translate-y-1"
              >
                <div className="space-y-3">
                  {/* Status Badges */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isRunning 
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 animate-pulse'
                        : isCompleted
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        : 'bg-amber-500/15 border border-amber-500/20 text-amber-400'
                    }`}>
                      {c.status}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {classTime.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Class Info */}
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-white hover:text-sky-300 transition-colors line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-sky-400 font-bold text-[11px] mt-1.5">{c.courseName}</p>
                    <p className="text-slate-400 text-[11px] font-medium mt-0.5">{c.moduleName}</p>
                  </div>

                  {/* Instructor details */}
                  <div className="flex items-center gap-2 pt-2 border-t border-sky-500/5 text-slate-400 text-xs">
                    <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-black text-[10px] flex items-center justify-center border border-sky-400">
                      {c.instructorName.charAt(0)}
                    </div>
                    <span className="font-bold">{c.instructorName}</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-sky-500/5">
                  {isRunning ? (
                    <button
                      onClick={() => navigate(`/live-classroom/${c.id}`)}
                      className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/10 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isInstructor ? 'Resume Class' : 'Join Classroom'}</span>
                    </button>
                  ) : isCompleted ? (
                    <>
                      <button
                        onClick={() => navigate(`/live-classroom/${c.id}`)}
                        className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Attendance</span>
                      </button>
                      <button
                        onClick={() => navigate(`/live-classroom/mentor-analytics?classId=${c.id}`)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 rounded-xl border border-slate-700 cursor-pointer"
                        title="AI Reports & Metrics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {isInstructor ? (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'running')}
                          className="flex-1 py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/10"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Session</span>
                        </button>
                      ) : (
                        <div className="flex-1 text-center py-2 text-slate-500 text-[11px] font-bold">
                          Starting at {classTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </>
                  )}

                  {isInstructor && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2.5 bg-slate-800/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-xl cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/20 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-sky-500/10 pb-3">
              <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-sky-400" /> Schedule Live Session
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold text-slate-300">
              <div>
                <label className="block mb-1.5 text-slate-400 font-bold">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EBFP Performance Diagnostic Tools"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800/80 border border-sky-500/15 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-slate-400 font-bold">Course Track</label>
                <select
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-sky-500/15 rounded-xl p-3 text-white focus:outline-none cursor-pointer"
                >
                  <option value="Advanced Linux Kernel Engineering">Advanced Linux Kernel Engineering</option>
                  <option value="Linux Systems & Kernel Administration">Linux Systems & Kernel Administration</option>
                  <option value="Linux Performance & eBPF Engineering">Linux Performance & eBPF Engineering</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-slate-400 font-bold">Module Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 3: Virtual Memory Architecture"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-sky-500/15 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-slate-400 font-bold">Scheduled Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-800/80 border border-sky-500/15 rounded-xl p-3 text-white focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-500/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-sky-500/15 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl shadow-lg cursor-pointer"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default LiveClassroomDashboard;
