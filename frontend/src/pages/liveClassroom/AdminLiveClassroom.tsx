import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Copy,
  Users,
  X,
  Radio,
  FileSpreadsheet,
  Layers,
  ExternalLink,
  Search,
  Play,
  StopCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { liveClassService, type LiveClass, type AttendanceRecord } from '@/services/liveClassService';
import { instructorService } from '@/services/instructorService';

export const AdminLiveClassroom: React.FC = () => {
  const { userProfile } = useAuth();
  const { courses } = useCourses();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled' | 'Draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('ALL');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [attendanceClass, setAttendanceClass] = useState<LiveClass | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Instructors list for assignment
  const [instructorsList, setInstructorsList] = useState<any[]>([]);

  // Form State for Create / Edit
  const [formCourseId, setFormCourseId] = useState('');
  const [formModuleId, setFormModuleId] = useState('');
  const [formLessonId, setFormLessonId] = useState('');
  const [formInstructorId, setFormInstructorId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formEndTime, setFormEndTime] = useState('11:30');
  const [formProvider, setFormProvider] = useState<'jitsi' | 'google_meet' | 'zoom' | 'teams'>('jitsi');
  const [formMeetingUrl, setFormMeetingUrl] = useState('');
  const [formMaxParticipants, setFormMaxParticipants] = useState(100);
  const [formBanner, setFormBanner] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formTags, setFormTags] = useState('Linux, DevOps, Systems');
  const [formDifficulty, setFormDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [formStatus, setFormStatus] = useState<'Draft' | 'Scheduled' | 'Live' | 'Completed' | 'Cancelled'>('Scheduled');

  // Feature Toggles
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(true);
  const [isQuizEnabled, setIsQuizEnabled] = useState(true);
  const [isPollEnabled, setIsPollEnabled] = useState(true);
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [isAttendanceEnabled, setIsAttendanceEnabled] = useState(true);
  const [certificateEligible, setCertificateEligible] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = liveClassService.subscribeLiveClasses((data) => {
      setClasses(data);
      setLoading(false);
    });

    const unsubInstructors = instructorService.subscribeToInstructors((insts) => {
      setInstructorsList(insts);
    });

    return () => {
      unsubscribe();
      unsubInstructors();
    };
  }, []);

  // Compute selected course's modules and lessons
  const selectedCourse = useMemo(() => {
    return courses.find((c) => String(c.id) === String(formCourseId));
  }, [courses, formCourseId]);

  const availableModules = useMemo(() => {
    return selectedCourse?.modules || [];
  }, [selectedCourse]);

  const selectedModule = useMemo(() => {
    return availableModules.find((m) => String(m.id) === String(formModuleId));
  }, [availableModules, formModuleId]);

  const availableLessons = useMemo(() => {
    return selectedModule?.topics || [];
  }, [selectedModule]);

  // Filtered dataset
  const filteredClasses = useMemo(() => {
    let result = [...classes];

    if (activeTab !== 'all') {
      result = result.filter((c) => c.status === activeTab);
    }

    if (instructorFilter !== 'ALL') {
      result = result.filter((c) => c.instructorId === instructorFilter || c.instructorName.includes(instructorFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.courseName.toLowerCase().includes(q) ||
          c.instructorName.toLowerCase().includes(q) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [classes, activeTab, instructorFilter, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: classes.length,
      Live: classes.filter((c) => c.status === 'Live').length,
      Scheduled: classes.filter((c) => c.status === 'Scheduled').length,
      Completed: classes.filter((c) => c.status === 'Completed').length,
      Cancelled: classes.filter((c) => c.status === 'Cancelled').length,
      Draft: classes.filter((c) => c.status === 'Draft').length,
    };
  }, [classes]);

  const openCreateModal = () => {
    setEditingClass(null);
    setFormCourseId(courses[0]?.id ? String(courses[0].id) : 'course_linux_kernel');
    setFormModuleId('');
    setFormLessonId('');
    setFormInstructorId(instructorsList[0]?.id || 'inst_kaizen');
    setFormTitle('');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('10:00');
    setFormEndTime('11:30');
    setFormProvider('jitsi');
    setFormMeetingUrl('');
    setFormMaxParticipants(100);
    setFormBanner('https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=80');
    setFormThumbnail('https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&q=80');
    setFormTags('Linux, Kernel, Systems');
    setFormDifficulty('Intermediate');
    setFormStatus('Scheduled');
    setIsRecordingEnabled(true);
    setIsQuizEnabled(true);
    setIsPollEnabled(true);
    setIsChatEnabled(true);
    setIsAttendanceEnabled(true);
    setCertificateEligible(true);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (c: LiveClass) => {
    setEditingClass(c);
    setFormCourseId(c.courseId);
    setFormModuleId(c.moduleId);
    setFormLessonId(c.lessonId);
    setFormInstructorId(c.instructorId);
    setFormTitle(c.title);
    setFormDescription(c.description);

    const startObj = new Date(c.startTime);
    const endObj = new Date(c.endTime);
    setFormDate(startObj.toISOString().split('T')[0]);
    setFormStartTime(startObj.toTimeString().substring(0, 5));
    setFormEndTime(endObj.toTimeString().substring(0, 5));

    setFormProvider(c.meetingProvider);
    setFormMeetingUrl(c.meetingUrl);
    setFormMaxParticipants(c.maxParticipants || 100);
    setFormBanner(c.banner || '');
    setFormThumbnail(c.thumbnail || '');
    setFormTags((c.tags || []).join(', '));
    setFormDifficulty(c.difficulty || 'Intermediate');
    setFormStatus(c.status);

    setIsRecordingEnabled(c.isRecordingEnabled);
    setIsQuizEnabled(c.isQuizEnabled);
    setIsPollEnabled(c.isPollEnabled);
    setIsChatEnabled(c.isChatEnabled);
    setIsAttendanceEnabled(c.isAttendanceEnabled);
    setCertificateEligible(c.certificateEligible);
    setIsCreateModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please enter live class title.');
      return;
    }

    try {
      const selectedInst = instructorsList.find((i) => i.id === formInstructorId || i.name === formInstructorId);
      const instructorName = selectedInst?.name || userProfile?.name || 'Prof. Manoj Acharya';

      const courseNameStr = selectedCourse?.title || 'Enterprise Engineering Track';
      const moduleNameStr = selectedModule?.title || 'Core System Architecture';
      const lessonNameStr = availableLessons.find((l) => String(l.id) === String(formLessonId))?.title || 'Live Interactive Masterclass';

      const startISO = new Date(`${formDate}T${formStartTime}:00`).toISOString();
      const endISO = new Date(`${formDate}T${formEndTime}:00`).toISOString();
      const startMs = new Date(startISO).getTime();
      const endMs = new Date(endISO).getTime();
      const durationMins = Math.max(30, Math.round((endMs - startMs) / 60000));

      const generatedUrl = formMeetingUrl || `https://meet.jit.si/KaizenQ_LiveClass_${Date.now()}`;

      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        courseId: formCourseId,
        courseName: courseNameStr,
        moduleId: formModuleId,
        moduleTitle: moduleNameStr,
        lessonId: formLessonId,
        lessonTitle: lessonNameStr,
        instructorId: formInstructorId || 'inst_sys',
        instructorName,
        meetingProvider: formProvider,
        meetingUrl: generatedUrl,
        banner: formBanner,
        thumbnail: formThumbnail,
        startTime: startISO,
        endTime: endISO,
        duration: durationMins,
        status: formStatus,
        isRecordingEnabled,
        isQuizEnabled,
        isPollEnabled,
        isChatEnabled,
        isAttendanceEnabled,
        certificateEligible,
        maxParticipants: formMaxParticipants,
        tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
        difficulty: formDifficulty,
        createdBy: userProfile?.name || 'Admin',
      };

      if (editingClass) {
        await liveClassService.updateLiveClass(editingClass.id, payload);
        toast.success(`Live session "${formTitle}" updated!`);
      } else {
        await liveClassService.createLiveClass(payload);
        toast.success(`🎉 Live Class "${formTitle}" published & dispatches real-time alerts!`);
      }

      setIsCreateModalOpen(false);
    } catch (err) {
      toast.error('Failed to save live classroom session.');
    }
  };

  const handleDeleteClass = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await liveClassService.deleteLiveClass(id);
      toast.info(`Deleted live class "${title}".`);
    }
  };

  const handleDuplicateClass = async (id: string) => {
    try {
      const cloned = await liveClassService.duplicateLiveClass(id);
      toast.success(`Duplicated session as draft: "${cloned.title}"!`);
    } catch (e) {
      toast.error('Failed to duplicate live class.');
    }
  };

  const handleStartClass = async (id: string) => {
    await liveClassService.startLiveClass(id);
    toast.success('🔴 Class status set to LIVE! Real-time notifications dispatched.');
  };

  const handleEndClass = async (id: string) => {
    await liveClassService.endLiveClass(id);
    toast.info('Session ended and status updated to Completed.');
  };

  const handleOpenAttendance = (c: LiveClass) => {
    setAttendanceClass(c);
    const records = liveClassService.getAttendanceRecords(c.id);
    setAttendanceRecords(records);
  };

  const handleExportAttendance = (c: LiveClass) => {
    const success = liveClassService.exportAttendanceCSV(c.id, c.title);
    if (success) {
      toast.success(`Exported attendance log for "${c.title}"!`);
    } else {
      toast.info('No attendance records logged for this session yet.');
    }
  };

  return (
    <div className="space-y-6 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-sky-600" />
              <span>ENTERPRISE LIVE CLASSROOM ENGINE</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>REAL-TIME SNAPSHOT SYNC</span>
            </div>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Live Classes Control Center ({filteredClasses.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Schedule live sessions, assign instructors, trigger real-time quizzes & polls, and download attendance reports.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={openCreateModal}
            className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center gap-2 font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Live Class</span>
          </button>
        </div>
      </div>

      {/* Top Filter Tabs & Search Bar */}
      <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            {(['all', 'Scheduled', 'Live', 'Completed', 'Cancelled', 'Draft'] as const).map((tab) => {
              const labelMap: Record<string, string> = {
                all: `All Classes (${tabCounts.all})`,
                Live: `🔴 Live Now (${tabCounts.Live})`,
                Scheduled: `Upcoming (${tabCounts.Scheduled})`,
                Completed: `Completed (${tabCounts.Completed})`,
                Cancelled: `Cancelled (${tabCounts.Cancelled})`,
                Draft: `Drafts (${tabCounts.Draft})`,
              };
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? tab === 'Live'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                        : 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'
                  }`}
                >
                  {labelMap[tab]}
                </button>
              );
            })}
          </div>

          {/* Search & Instructor Filter */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live classes, topics, instructors..."
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="bg-slate-50 border border-sky-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Instructors</option>
              {instructorsList.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Live Class Grid Display */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 animate-pulse text-xs font-bold">
          Syncing Firestore live classroom telemetry...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-dashed border-sky-200 shadow-xs">
          <Video className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-heading font-extrabold text-base text-slate-700">No Live Classes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No live classroom sessions match your selected filter tab or search query.
          </p>
          <button onClick={openCreateModal} className="btn-blue-primary text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Create First Session</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((c) => {
            const isLiveNow = c.status === 'Live';
            const isCompleted = c.status === 'Completed';

            return (
              <div
                key={c.id}
                className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl ${
                  isLiveNow
                    ? 'border-rose-300 ring-2 ring-rose-500/20'
                    : isCompleted
                    ? 'border-slate-200 opacity-90'
                    : 'border-sky-200/80 hover:border-sky-400'
                }`}
              >
                {/* Class Thumbnail Banner */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={c.banner || c.thumbnail || 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80'}
                    alt={c.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-cyan-300 font-mono text-[10px] font-bold border border-slate-700">
                      {c.meetingProvider.toUpperCase()}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                        c.status === 'Live'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : c.status === 'Scheduled'
                          ? 'bg-sky-600 text-white'
                          : c.status === 'Completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {c.status === 'Live' ? '🔴 LIVE NOW' : c.status}
                    </span>
                  </div>

                  {/* Instructor Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center border border-white shadow-xs">
                      {c.instructorName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{c.instructorName}</p>
                      <p className="text-[9px] text-sky-200 truncate">{c.courseName}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-heading font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {c.description}
                    </p>
                  </div>

                  {/* Time & Schedule Info */}
                  <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-3 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        <span>{new Date(c.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>{new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({c.duration}m)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1 border-t border-sky-200/50">
                      <span>Max Participants: <strong>{c.maxParticipants}</strong></span>
                      <span className="font-bold text-emerald-700">{c.difficulty}</span>
                    </div>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                    {c.isRecordingEnabled && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">🎥 Rec</span>}
                    {c.isQuizEnabled && <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">⚡ Quiz</span>}
                    {c.isPollEnabled && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">📊 Poll</span>}
                    {c.isChatEnabled && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">💬 Chat</span>}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {isLiveNow ? (
                        <button
                          onClick={() => handleEndClass(c.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                          <span>End Class</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartClass(c.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Live</span>
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/live-classroom/room/${c.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAttendance(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                        title="View Attendance & Reports"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => handleDuplicateClass(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Duplicate Session"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                        title="Edit Session"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(c.id, c.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT LIVE CLASS MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl font-['Sora'] border border-sky-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    {editingClass ? 'Edit Live Classroom Session' : 'Create & Publish Live Session'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Configure meeting provider, instructor assignment & features</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-5 text-xs font-medium">
              
              {/* Linked Curriculum Selection */}
              <div className="p-4 bg-sky-50/50 border border-sky-200/80 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Linked Course Curriculum & Instructor</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Target Course Track</label>
                    <select
                      value={formCourseId}
                      onChange={(e) => setFormCourseId(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Assigned Lead Instructor</label>
                    <select
                      value={formInstructorId}
                      onChange={(e) => setFormInstructorId(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                    >
                      {instructorsList.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.specialty || 'Instructor'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Module</label>
                    <select
                      value={formModuleId}
                      onChange={(e) => setFormModuleId(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                    >
                      <option value="">Select Module...</option>
                      {availableModules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Lesson Topic</label>
                    <select
                      value={formLessonId}
                      onChange={(e) => setFormLessonId(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                    >
                      <option value="">Select Lesson...</option>
                      {availableLessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Session Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Linux Kernel Monolithic Architecture & Memory Layout"
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Description & Learning Objectives</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide overview of topics to be covered during live interactive stream..."
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Timing & Provider Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Session Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Provider & Meeting URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Meeting Provider</label>
                  <select
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value as any)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                  >
                    <option value="jitsi">Jitsi Meet (Interactive Embedded Default)</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom Education</option>
                    <option value="teams">Microsoft Teams</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Meeting Room URL</label>
                  <input
                    type="url"
                    value={formMeetingUrl}
                    onChange={(e) => setFormMeetingUrl(e.target.value)}
                    placeholder="Leave empty to auto-generate Jitsi room URL"
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Participants & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={formMaxParticipants}
                    onChange={(e) => setFormMaxParticipants(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Difficulty Level</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Publication Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs focus:outline-hidden font-bold"
                  >
                    <option value="Scheduled">Scheduled (Published)</option>
                    <option value="Live">🔴 Live Now</option>
                    <option value="Draft">Draft</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Interactive Classroom Features</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input type="checkbox" checked={isRecordingEnabled} onChange={(e) => setIsRecordingEnabled(e.target.checked)} className="rounded text-sky-600" />
                    <span>🎥 Recording</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input type="checkbox" checked={isQuizEnabled} onChange={(e) => setIsQuizEnabled(e.target.checked)} className="rounded text-sky-600" />
                    <span>⚡ Live Quiz</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input type="checkbox" checked={isPollEnabled} onChange={(e) => setIsPollEnabled(e.target.checked)} className="rounded text-sky-600" />
                    <span>📊 Live Polls</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input type="checkbox" checked={isChatEnabled} onChange={(e) => setIsChatEnabled(e.target.checked)} className="rounded text-sky-600" />
                    <span>💬 Realtime Chat</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input type="checkbox" checked={isAttendanceEnabled} onChange={(e) => setIsAttendanceEnabled(e.target.checked)} className="rounded text-sky-600" />
                    <span>📋 Auto Attendance</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input type="checkbox" checked={certificateEligible} onChange={(e) => setCertificateEligible(e.target.checked)} className="rounded text-sky-600" />
                    <span>🎓 Certificate Eligible</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-blue-primary text-xs py-2.5 px-6 font-bold cursor-pointer shadow-lg shadow-sky-500/20">
                  {editingClass ? 'Update Live Class' : 'Publish Live Class'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ATTENDANCE ROSTER DRAWER */}
      {attendanceClass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white max-w-xl w-full h-full p-6 shadow-2xl overflow-y-auto space-y-5 font-['Sora'] border-l border-sky-100 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">Attendance Log Roster</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-xs">{attendanceClass.title}</p>
                </div>
              </div>
              <button onClick={() => setAttendanceClass(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{attendanceRecords.length} Student Records Logged</span>
              <button
                onClick={() => handleExportAttendance(attendanceClass)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {attendanceRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-1">
                <Users className="w-8 h-8 mx-auto text-slate-300" />
                <p>No active attendance logged for this session yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {attendanceRecords.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-medium">
                    <div>
                      <p className="font-bold text-slate-900">{r.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.studentEmail}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">{r.status}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{r.durationMinutes} mins active</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
