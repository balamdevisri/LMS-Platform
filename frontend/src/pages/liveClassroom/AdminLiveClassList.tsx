import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Video,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Play,
  Square,
  XCircle,
  Trash2,
  Edit,
  ExternalLink,
  SlidersHorizontal,
  Radio,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { liveClassService, type LiveClass } from '@/services/liveClassService';
import { toast } from 'sonner';

export const AdminLiveClassList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile, user } = useAuth();

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Confirmation Modal State
  const [actionModal, setActionModal] = useState<{
    type: 'start' | 'end' | 'cancel' | 'delete';
    targetClass: LiveClass;
  } | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);

  const role = userProfile?.role || 'student';
  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor';
  const currentUserId = userProfile?.uid || user?.uid || '';
  const currentUserName = userProfile?.name || user?.displayName || '';

  const activeTab = searchParams.get('tab') || 'all';

  const loadClasses = () => {
    setLoading(true);
    try {
      const all = liveClassService.getLiveClassesSync();
      // If instructor, strictly isolate to assigned classes
      if (isInstructor) {
        const filtered = all.filter(
          (c) =>
            c.instructorId === currentUserId ||
            c.createdBy === currentUserId ||
            (c.instructorName && c.instructorName.toLowerCase().includes(currentUserName.toLowerCase()))
        );
        setClasses(filtered);
      } else {
        setClasses(all);
      }
    } catch (e) {
      toast.error('Failed to load live classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    const unsub = liveClassService.subscribeLiveClasses((updated) => {
      if (isInstructor) {
        setClasses(
          updated.filter(
            (c) =>
              c.instructorId === currentUserId ||
              c.createdBy === currentUserId ||
              (c.instructorName && c.instructorName.toLowerCase().includes(currentUserName.toLowerCase()))
          )
        );
      } else {
        setClasses(updated);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [isInstructor, currentUserId, currentUserName]);

  // Statistics Metrics
  const metrics = useMemo(() => {
    const total = classes.length;
    const scheduled = classes.filter((c) => (c.status || '').toUpperCase() === 'SCHEDULED' || (c.status || '').toLowerCase() === 'scheduled').length;
    const liveNow = classes.filter((c) => (c.status || '').toUpperCase() === 'LIVE' || (c.status || '').toLowerCase() === 'live').length;
    const completed = classes.filter(
      (c) =>
        (c.status || '').toUpperCase() === 'ENDED' ||
        (c.status || '').toUpperCase() === 'COMPLETED' ||
        (c.status || '').toLowerCase() === 'ended' ||
        (c.status || '').toLowerCase() === 'completed'
    ).length;
    const cancelled = classes.filter((c) => (c.status || '').toUpperCase() === 'CANCELLED' || (c.status || '').toLowerCase() === 'cancelled').length;
    const totalAttendance = classes.reduce((sum, c) => sum + (c.attendeesCount || 0), 0);

    return { total, scheduled, liveNow, completed, cancelled, totalAttendance };
  }, [classes]);

  // Filtered & Searched classes
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const status = (c.status || 'SCHEDULED').toUpperCase();

      // Tab Filter
      if (activeTab === 'scheduled' && status !== 'SCHEDULED') return false;
      if (activeTab === 'live' && status !== 'LIVE') return false;
      if (activeTab === 'completed' && status !== 'ENDED' && status !== 'COMPLETED') return false;
      if (activeTab === 'cancelled' && status !== 'CANCELLED') return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (c.title || '').toLowerCase().includes(q);
        const matchCourse = (c.courseName || c.courseId || '').toLowerCase().includes(q);
        const matchInstructor = (c.instructorName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCourse && !matchInstructor) return false;
      }

      return true;
    });
  }, [classes, activeTab, searchQuery]);

  // Action Confirmation Handlers
  const handleConfirmAction = async () => {
    if (!actionModal) return;
    const { type, targetClass } = actionModal;
    const targetId = targetClass.id || targetClass.classId;
    setActionSubmitting(true);

    try {
      if (type === 'start') {
        await liveClassService.startClass(targetId);
        toast.success(`🔴 "${targetClass.title}" is now LIVE!`);
      } else if (type === 'end') {
        await liveClassService.endClass(targetId);
        toast.info(`🏁 "${targetClass.title}" has been ended.`);
      } else if (type === 'cancel') {
        await liveClassService.cancelClass(targetId);
        toast.warning(`⚠️ "${targetClass.title}" has been cancelled.`);
      } else if (type === 'delete') {
        await liveClassService.deleteLiveClass(targetId);
        toast.success(`🗑️ "${targetClass.title}" was deleted.`);
      }
      loadClasses();
      setActionModal(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete action.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'SCHEDULED').toUpperCase();
    if (s === 'LIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-extrabold tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          LIVE NOW
        </span>
      );
    }
    if (s === 'SCHEDULED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Clock className="w-3 h-3" />
          SCHEDULED
        </span>
      );
    }
    if (s === 'ENDED' || s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="w-3 h-3" />
          COMPLETED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-500 text-xs font-bold">
        <XCircle className="w-3 h-3" />
        CANCELLED
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-['Sora'] animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-blue-600" />
              {isAdmin ? 'ADMIN LIVE MANAGEMENT' : 'INSTRUCTOR LIVE STUDIO'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              OBS &rarr; YouTube Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            Live Classes Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Schedule lectures, monitor live broadcasts, manage attendance, launch quizzes, and open the live control center.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => navigate('/admin/live-classes/create')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Live Class</span>
          </button>
        </div>
      </div>

      {/* Statistics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Classes</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">{metrics.total}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block mb-1">🔴 Live Now</span>
          <span className="text-2xl font-extrabold text-rose-600">{metrics.liveNow}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Scheduled</span>
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{metrics.scheduled}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">Completed</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.completed}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cancelled</span>
          <span className="text-2xl font-extrabold text-slate-600 dark:text-zinc-400">{metrics.cancelled}</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">Total Attendance</span>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{metrics.totalAttendance}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { key: 'all', label: 'All Classes', count: metrics.total },
            { key: 'scheduled', label: 'Scheduled', count: metrics.scheduled },
            { key: 'live', label: 'Live Now', count: metrics.liveNow },
            { key: 'completed', label: 'Completed', count: metrics.completed },
            { key: 'cancelled', label: 'Cancelled', count: metrics.cancelled },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSearchParams({ tab: tab.key })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search class, course, instructor..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Card View"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Class List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse">Loading live classes...</div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">No Live Classes Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            {searchQuery ? `No sessions match "${searchQuery}".` : 'No live classroom sessions in this category yet.'}
          </p>
          <button
            onClick={() => navigate('/admin/live-classes/create')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Live Class</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((c) => {
            const classId = c.id || c.classId;
            const status = (c.status || 'SCHEDULED').toUpperCase();
            const isLive = status === 'LIVE';
            const isScheduled = status === 'SCHEDULED';
            const isEnded = status === 'ENDED' || status === 'COMPLETED';
            const isCancelled = status === 'CANCELLED';

            return (
              <div
                key={classId}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Course & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-[11px] font-semibold truncate max-w-[180px]">
                      <BookOpen className="w-3 h-3 text-sky-500 shrink-0" />
                      <span className="truncate">{c.courseName || c.courseId}</span>
                    </span>
                    {getStatusBadge(c.status)}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1.5">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {c.description || 'Live interactive session covering core syllabus concepts and Q&A.'}
                  </p>

                  {/* Meta Chips */}
                  <div className="space-y-1.5 py-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium truncate">{c.instructorName || 'Lead Faculty'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.scheduledAt || c.startTime ? new Date(c.scheduledAt || c.startTime).toLocaleDateString() : 'Scheduled'}</span>
                      <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.duration || 60} mins</span>
                    </div>
                    {c.youtubeVideoId && (
                      <div className="flex items-center gap-1.5 text-[11px] text-red-500 font-mono">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>YT ID: {c.youtubeVideoId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/live-classes/${classId}/control`)}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live Control Center</span>
                    </button>
                    <button
                      onClick={() => navigate(`/student/live-class/${classId}`)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 text-xs transition-colors"
                      title="View Student Live Page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/live-classes/${classId}/edit`)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 text-xs transition-colors"
                      title="Edit Live Class"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* State Transition Actions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {isScheduled && (
                      <button
                        onClick={() => setActionModal({ type: 'start', targetClass: c })}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>Start Class</span>
                      </button>
                    )}
                    {isLive && (
                      <button
                        onClick={() => setActionModal({ type: 'end', targetClass: c })}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Square className="w-3 h-3" />
                        <span>End Class</span>
                      </button>
                    )}
                    {!isEnded && !isCancelled && (
                      <button
                        onClick={() => setActionModal({ type: 'cancel', targetClass: c })}
                        className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Cancel Class"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setActionModal({ type: 'delete', targetClass: c })}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs transition-colors ml-auto"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Scheduled Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredClasses.map((c) => {
                  const classId = c.id || c.classId;
                  return (
                    <tr key={classId} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-zinc-100">{c.title}</div>
                        {c.youtubeVideoId && <span className="text-[10px] text-red-500 font-mono">YT: {c.youtubeVideoId}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-medium">
                        {c.courseName || c.courseId}
                      </td>
                      <td className="py-3.5 px-4">{c.instructorName || 'Lead Faculty'}</td>
                      <td className="py-3.5 px-4">
                        {c.scheduledAt || c.startTime ? new Date(c.scheduledAt || c.startTime).toLocaleString() : '-'}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/live-classes/${classId}/control`)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 transition-colors"
                          >
                            Control
                          </button>
                          <button
                            onClick={() => navigate(`/admin/live-classes/${classId}/edit`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  actionModal.type === 'start'
                    ? 'bg-rose-100 text-rose-600'
                    : actionModal.type === 'end'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-zinc-100 capitalize">
                  {actionModal.type} Live Class
                </h3>
                <p className="text-xs text-slate-500">{actionModal.targetClass.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              {actionModal.type === 'start'
                ? 'Are you sure you want to start this live stream? The session will become visible as LIVE to all enrolled students.'
                : actionModal.type === 'end'
                ? 'Are you sure you want to end this live class? Students will see the session ended state and attendance will be closed.'
                : actionModal.type === 'cancel'
                ? 'Are you sure you want to cancel this scheduled live class?'
                : 'Are you sure you want to permanently delete this live class? This action cannot be undone.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                disabled={actionSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionSubmitting}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all ${
                  actionModal.type === 'delete' || actionModal.type === 'cancel'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionSubmitting ? 'Processing...' : `Confirm ${actionModal.type.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveClassList;
