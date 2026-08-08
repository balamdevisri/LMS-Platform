import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Plus,
  Play,
  StopCircle,
  Users,
  X,
  FileSpreadsheet,
  VolumeX,
  Volume2,
  FileText,
  Upload,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { liveClassService, type LiveClass, type AttendanceRecord } from '@/services/liveClassService';

export const LiveClassroomDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');

  // Modal States
  const [uploadNotesModal, setUploadNotesModal] = useState<LiveClass | null>(null);
  const [uploadRecordingModal, setUploadRecordingModal] = useState<LiveClass | null>(null);
  const [attendanceClass, setAttendanceClass] = useState<LiveClass | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Form Inputs
  const [notesUrl, setNotesUrl] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = liveClassService.subscribeLiveClasses((data) => {
      // Filter classes assigned to instructor or show all if admin
      if (userProfile?.role === 'instructor') {
        const assigned = data.filter(
          (c) => c.instructorId === userProfile.uid || c.instructorName.includes(userProfile.name || '')
        );
        setClasses(assigned.length > 0 ? assigned : data);
      } else {
        setClasses(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  // Today's Date Filter Helper
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const filteredClasses = useMemo(() => {
    const now = new Date();

    if (filter === 'today') {
      return classes.filter((c) => isToday(c.startTime) || c.status === 'Live');
    }
    if (filter === 'upcoming') {
      return classes.filter((c) => new Date(c.startTime) > now && c.status !== 'Completed');
    }
    if (filter === 'completed') {
      return classes.filter((c) => c.status === 'Completed');
    }
    return classes;
  }, [classes, filter]);

  // Counts
  const todayCount = useMemo(() => classes.filter((c) => isToday(c.startTime) || c.status === 'Live').length, [classes]);
  const upcomingCount = useMemo(() => classes.filter((c) => new Date(c.startTime) > new Date() && c.status !== 'Completed').length, [classes]);
  const completedCount = useMemo(() => classes.filter((c) => c.status === 'Completed').length, [classes]);

  const handleStartClass = async (id: string) => {
    await liveClassService.startLiveClass(id);
    toast.success('🔴 Class set to LIVE! Real-time notifications dispatched to enrolled students.');
  };

  const handleEndClass = async (id: string) => {
    await liveClassService.endLiveClass(id);
    toast.info('Session ended and status updated to Completed.');
  };

  const handleSaveNotes = async () => {
    if (!uploadNotesModal || !notesUrl.trim()) return;
    await liveClassService.updateLiveClass(uploadNotesModal.id, { notesUrl: notesUrl.trim() });
    toast.success(`Lecture notes URL updated for "${uploadNotesModal.title}"!`);
    setUploadNotesModal(null);
    setNotesUrl('');
  };

  const handleSaveRecording = async () => {
    if (!uploadRecordingModal || !recordingUrl.trim()) return;
    await liveClassService.updateLiveClass(uploadRecordingModal.id, { recordingUrl: recordingUrl.trim() });
    toast.success(`Class recording URL attached for "${uploadRecordingModal.title}"!`);
    setUploadRecordingModal(null);
    setRecordingUrl('');
  };

  const handleToggleMuteChat = async (c: LiveClass) => {
    const newMuted = !c.isChatMuted;
    await liveClassService.updateLiveClass(c.id, { isChatMuted: newMuted });
    toast.info(newMuted ? `Chat muted for session "${c.title}"` : `Chat unmuted for session "${c.title}"`);
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>INSTRUCTOR LIVE CLASSROOM STUDIO</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>REAL-TIME LIVE DATA</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Instructor Live Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Launch live sessions, manage real-time interactive quizzes & polls, mute chat, and upload lecture recordings.
          </p>
        </div>

        {userProfile?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin/live-classroom')}
            className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center gap-2 font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Admin Live Control Panel</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'today'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'
            }`}
          >
            Today's Classes ({todayCount})
          </button>

          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'
            }`}
          >
            Upcoming Classes ({upcomingCount})
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'
            }`}
          >
            Completed Classes ({completedCount})
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'
            }`}
          >
            All Assigned ({classes.length})
          </button>
        </div>
      </div>

      {/* Class List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-bold text-xs animate-pulse">
          Loading assigned live classroom sessions...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-dashed border-sky-200 shadow-xs">
          <Video className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-heading font-extrabold text-base text-slate-700">No Live Sessions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No live classes found matching your current filter section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((c) => {
            const isLiveNow = c.status === 'Live';

            return (
              <div
                key={c.id}
                className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl ${
                  isLiveNow ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-sky-200/80 hover:border-blue-400'
                }`}
              >
                {/* Banner */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={c.banner || c.thumbnail || 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80'}
                    alt={c.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-cyan-300 font-mono text-[10px] font-bold border border-slate-700">
                      {c.meetingProvider.toUpperCase()}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        c.status === 'Live'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : c.status === 'Scheduled'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {c.status === 'Live' ? '🔴 LIVE NOW' : c.status}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">{c.courseName}</p>
                    <h3 className="font-heading font-extrabold text-sm text-white truncate">{c.title}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{c.description}</p>
                    <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 text-xs text-slate-700 space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Date: {new Date(c.startTime).toLocaleDateString()}</span>
                        <span className="font-mono">{new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resource Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                    {c.notesUrl && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">📄 Notes Attached</span>}
                    {c.recordingUrl && <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">🎥 Recording Available</span>}
                    {c.isChatMuted && <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">🔇 Chat Muted</span>}
                  </div>

                  {/* Instructor Controls Toolbar */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      {isLiveNow ? (
                        <button
                          onClick={() => handleEndClass(c.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <StopCircle className="w-4 h-4" />
                          <span>End Session</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartClass(c.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Live</span>
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/live-classroom/room/${c.id}`)}
                        className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Launch Room</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1 pt-1">
                      <button
                        onClick={() => setUploadNotesModal(c)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 border border-slate-200 text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer"
                        title="Upload Notes"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Notes</span>
                      </button>

                      <button
                        onClick={() => setUploadRecordingModal(c)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 border border-slate-200 text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer"
                        title="Attach Recording"
                      >
                        <Upload className="w-3.5 h-3.5 text-purple-600" />
                        <span>Recording</span>
                      </button>

                      <button
                        onClick={() => handleToggleMuteChat(c)}
                        className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer ${
                          c.isChatMuted
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-700'
                        }`}
                        title={c.isChatMuted ? 'Unmute Chat' : 'Mute Chat'}
                      >
                        {c.isChatMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{c.isChatMuted ? 'Unmute' : 'Mute Chat'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenAttendance(c)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200 text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer"
                        title="Attendance Log"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Roster</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD NOTES MODAL */}
      {uploadNotesModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] border border-sky-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-900">Attach Lecture Notes / PDF</h3>
              <button onClick={() => setUploadNotesModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 font-medium">Attaching lecture notes for <strong>{uploadNotesModal.title}</strong>.</p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes Document URL (PDF / Drive / Link)</label>
                <input
                  type="url"
                  value={notesUrl}
                  onChange={(e) => setNotesUrl(e.target.value)}
                  placeholder="https://kaizenq.lms/notes/lecture-notes.pdf"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setUploadNotesModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">Cancel</button>
              <button onClick={handleSaveNotes} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">Attach Notes</button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD RECORDING MODAL */}
      {uploadRecordingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] border border-sky-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-slate-900">Upload Session Recording URL</h3>
              <button onClick={() => setUploadRecordingModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 font-medium">Attaching video stream recording for <strong>{uploadRecordingModal.title}</strong>.</p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recording Video URL (MP4 / Stream / Jitsi)</label>
                <input
                  type="url"
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  placeholder="https://meet.jit.si/recordings/session-video.mp4"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setUploadRecordingModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">Cancel</button>
              <button onClick={handleSaveRecording} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md">Save Recording</button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE DRAWER */}
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
