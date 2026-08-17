import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Video,
  Save,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { instructorService, type InstructorUser } from '@/services/instructorService';
import { liveClassService, type LiveClass } from '@/services/liveClassService';
import { extractYouTubeVideoId, YouTubePlayer } from '@/components/liveClass/YouTubePlayer';
import { toast } from 'sonner';

interface CourseOption {
  id: string;
  title: string;
}

interface InstructorOption {
  id: string;
  name: string;
  email?: string;
  specialization?: string;
}

export const AdminCreateLiveClass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  const { courses: lmsCourses } = useCourses();
  const isEditing = Boolean(id);

  // Form State
  const [courseId, setCourseId] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [instructorId, setInstructorId] = useState<string>('');
  const [instructorName, setInstructorName] = useState<string>('');
  const [youtubeInput, setYoutubeInput] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState<string>('10:00');
  const [duration, setDuration] = useState<number>(90);
  const [status, setStatus] = useState<string>('SCHEDULED');
  const [tags, setTags] = useState<string>('React, Hooks, Live Coding');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const [loading, setLoading] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [instructorsList, setInstructorsList] = useState<InstructorUser[]>([]);

  // Subscribe to dynamic instructors
  useEffect(() => {
    const unsub = instructorService.subscribeToInstructors((insts) => {
      setInstructorsList(insts);
    });
    return () => unsub();
  }, []);

  // Compute dynamic, deduplicated course options from LMS catalog
  const courseOptions: CourseOption[] = useMemo(() => {
    if (lmsCourses && lmsCourses.length > 0) {
      return lmsCourses.map((c) => ({
        id: String(c.id),
        title: c.title,
      }));
    }
    return [
      { id: 'react-101', title: 'React Fundamentals Masterclass' },
      { id: 'linux-101', title: 'Linux Fundamentals & Shell Scripting' },
      { id: 'backend-node-201', title: 'Node.js & Scalable Backend Architecture' },
      { id: 'ai-python-301', title: 'AI Engineering & Deep Learning with PyTorch' },
      { id: 'cybersecurity-401', title: 'Enterprise Cybersecurity & Threat Intelligence' },
    ];
  }, [lmsCourses]);

  // Compute dynamic, deduplicated instructors (no mock duplicates, only active/approved/real instructors)
  const instructorOptions: InstructorOption[] = useMemo(() => {
    const map = new Map<string, InstructorOption>();
    const seenEmails = new Set<string>();
    const seenNames = new Set<string>();

    const MOCK_EMAILS = [
      'sarah.j@stanford.edu',
      'm.vance@ai.research.org',
      'elena.r@framer.com',
    ];

    instructorsList.forEach((inst) => {
      if (!inst) return;
      const email = (inst.email || '').toLowerCase().trim();
      const name = (inst.name || '').trim();
      const st = (inst.status || '').toLowerCase();

      // Skip rejected or mock entries
      if (st === 'rejected' || MOCK_EMAILS.includes(email)) return;

      const normalizedName = name.toLowerCase();
      if (email && seenEmails.has(email)) return;
      if (normalizedName && seenNames.has(normalizedName)) return;

      const idVal = String(inst.id || email || name);
      if (!map.has(idVal)) {
        if (email) seenEmails.add(email);
        if (normalizedName) seenNames.add(normalizedName);
        map.set(idVal, {
          id: idVal,
          name: name || 'Faculty Instructor',
          email: inst.email,
          specialization: inst.specialty || 'Instructor',
        });
      }
    });

    // If current logged-in user is an instructor or admin, make sure they are available in the list
    if (userProfile && (userProfile.role === 'instructor' || userProfile.role === 'admin')) {
      const myEmail = (userProfile.email || user?.email || '').toLowerCase().trim();
      const myName = (userProfile.name || user?.displayName || '').trim();
      const myId = String(userProfile.uid || user?.uid || 'current_user');
      const normalizedMyName = myName.toLowerCase();

      if (!seenEmails.has(myEmail) && !seenNames.has(normalizedMyName) && myName) {
        map.set(myId, {
          id: myId,
          name: myName,
          email: myEmail,
          specialization: userProfile.role === 'instructor' ? 'Assigned Instructor' : 'Administrator / Lead',
        });
      }
    }

    return Array.from(map.values());
  }, [instructorsList, userProfile, user]);

  // Set default course when course options load
  useEffect(() => {
    if (!courseId && courseOptions.length > 0) {
      setCourseId(courseOptions[0].id);
      setCourseName(courseOptions[0].title);
    }
  }, [courseOptions, courseId]);

  // Initialize instructor default dynamically
  useEffect(() => {
    if (userProfile?.role === 'instructor') {
      const myId = String(userProfile?.uid || user?.uid || 'inst_kaizen');
      const myName = userProfile?.name || user?.displayName || 'Faculty Instructor';
      setInstructorId(myId);
      setInstructorName(myName);
    } else if (!instructorId && instructorOptions.length > 0) {
      setInstructorId(instructorOptions[0].id);
      setInstructorName(instructorOptions[0].name);
    }
  }, [userProfile, user, instructorOptions, instructorId]);

  // Load existing class if editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      const existing = liveClassService.getLiveClassesSync().find((c) => c.id === id || c.classId === id);
      if (existing) {
        setCourseId(existing.courseId || 'react-101');
        setCourseName(existing.courseName || 'React Fundamentals');
        setTitle(existing.title || '');
        setDescription(existing.description || '');
        setInstructorId(existing.instructorId || '');
        setInstructorName(existing.instructorName || '');
        setYoutubeInput(existing.youtubeVideoId || '');
        setDuration(existing.duration || 90);
        setStatus((existing.status || 'SCHEDULED').toUpperCase());
        setDifficulty((existing.difficulty as any) || 'Intermediate');
        if (existing.tags && Array.isArray(existing.tags)) {
          setTags(existing.tags.join(', '));
        }

        const rawDate = existing.scheduledAt || existing.startTime;
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            setScheduledDate(d.toISOString().split('T')[0]);
            setScheduledTime(
              `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
            );
          } catch (e) {}
        }
      } else {
        toast.error('Live class not found.');
        navigate('/admin/live-classes');
      }
      setLoading(false);
    }
  }, [isEditing, id, navigate]);

  // Auto-parse YouTube Video ID
  useEffect(() => {
    const extracted = extractYouTubeVideoId(youtubeInput);
    setPreviewVideoId(extracted);
  }, [youtubeInput]);

  const handleCourseChange = (selectedCourseId: string) => {
    setCourseId(selectedCourseId);
    const found = courseOptions.find((c) => c.id === selectedCourseId);
    if (found) setCourseName(found.title);
  };

  const handleInstructorChange = (selectedInstId: string) => {
    setInstructorId(selectedInstId);
    const found = instructorOptions.find((i) => i.id === selectedInstId);
    if (found) setInstructorName(found.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error('Please enter a class title.');
      return;
    }
    if (!courseId) {
      toast.error('Please select a course.');
      return;
    }
    if (!instructorId) {
      toast.error('Please assign an instructor.');
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please set scheduled date and time.');
      return;
    }
    if (duration <= 0) {
      toast.error('Duration must be greater than 0 minutes.');
      return;
    }

    const videoId = extractYouTubeVideoId(youtubeInput) || youtubeInput.trim();

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    const payload: Partial<LiveClass> = {
      courseId,
      courseName,
      title: title.trim(),
      description: description.trim(),
      instructorId,
      instructorName,
      youtubeVideoId: videoId,
      scheduledAt: scheduledDateTime,
      startTime: scheduledDateTime,
      duration: Number(duration),
      status: status as any,
      difficulty,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      meetingProvider: 'youtube' as any,
      meetingUrl: videoId ? `https://youtube.com/watch?v=${videoId}` : '',
      updatedAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      if (isEditing && id) {
        await liveClassService.updateLiveClass(id, payload);
        toast.success('Live class updated successfully!');
      } else {
        const newId = `class_live_${Date.now()}`;
        await liveClassService.createLiveClass({
          ...payload,
          id: newId,
          classId: newId,
          createdAt: new Date().toISOString(),
          createdBy: userProfile?.uid || user?.uid || 'admin',
        } as any);
        toast.success('Live class created successfully!');
      }
      navigate('/admin/live-classes');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save live class.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm font-['Sora']">Loading session details...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-['Sora'] animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/live-classes')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Classes</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>OBS Studio &rarr; YouTube Unlisted Live</span>
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
              {isEditing ? 'Edit Live Classroom Session' : 'Create New Live Class'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Configure session metadata, assign instructor, specify schedule, and link the YouTube Live Stream ID.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
            {/* Course Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Course Program <span className="text-rose-500">*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {courseOptions.length === 0 ? (
                  <option value="">No courses available</option>
                ) : (
                  courseOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Instructor Assignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Assigned Instructor <span className="text-rose-500">*</span>
              </label>
              <select
                value={instructorId}
                onChange={(e) => handleInstructorChange(e.target.value)}
                disabled={userProfile?.role === 'instructor'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {instructorOptions.length === 0 ? (
                  <option value="">No registered instructors available</option>
                ) : (
                  instructorOptions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} {inst.specialization ? `(${inst.specialization})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Class Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Live Class Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React Components & Hooks — Live Masterclass 01"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Session Description & Agenda
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Key concepts to be discussed, prerequisites, interactive code examples..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* YouTube Live Video ID / URL */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  YouTube Live Video ID or URL
                </label>
                <span className="text-[11px] text-slate-400">
                  OBS Studio stream key is kept private; only enter the YouTube Live Video ID here.
                </span>
              </div>
              <input
                type="text"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                placeholder="e.g. bMknfKXIFA8 or https://www.youtube.com/watch?v=bMknfKXIFA8 or https://youtube.com/live/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {previewVideoId ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Detected YouTube Video ID: <code className="font-mono">{previewVideoId}</code></span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  You can publish the schedule now and paste the YouTube Video ID once the broadcast is scheduled in YouTube Studio.
                </p>
              )}
            </div>

            {/* Schedule Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Scheduled Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Duration (mins) */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Estimated Duration (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Initial Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Class Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
                <option value="LIVE">LIVE (Currently Streaming)</option>
                <option value="ENDED">ENDED (Completed)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                Topic Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="React, State, Redux"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* YouTube Preview Embed if ID present */}
          {previewVideoId && (
            <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Live Stream Player Preview
                </span>
              </div>
              <div className="max-w-md">
                <YouTubePlayer youtubeVideoId={previewVideoId} title={title || 'Class Preview'} isLive={status === 'LIVE'} />
              </div>
            </div>
          )}

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => navigate('/admin/live-classes')}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Live Class'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateLiveClass;
