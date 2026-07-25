import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCourseSchema } from '../../../../shared/validators/course.validator';
import type { CreateCourseInput } from '../../../../shared/validators/course.validator';
import { courseService } from '../../services/courseService';
import { CourseHeader } from '../../components/courses/CourseHeader';
import { CourseThumbnail } from '../../components/courses/CourseThumbnail';
import { CheckCircle2, ArrowLeft, Loader2, Plus, Trash2, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export const AdminCourseCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [skillsInput, setSkillsInput] = useState<string[]>(['Linux CLI', 'System Administration']);
  const [newSkill, setNewSkill] = useState('');
  const [prereqInput] = useState<string[]>(['Basic command line awareness']);
  const [outcomesInput, setOutcomesInput] = useState<string[]>(['Master Linux permissions and systemd services']);
  const [newOutcome, setNewOutcome] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(CreateCourseSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&auto=format&fit=crop&q=80',
      category: 'Linux & Systems',
      level: 'all_levels',
      duration: '24 hrs',
      language: 'English',
      price: 0,
      status: 'draft',
      visibility: 'public',
      featured: false,
      instructor: {
        name: 'Bhanu Prakash Achari',
        role: 'Senior Technical Instructor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      skills: skillsInput,
      prerequisites: prereqInput,
      learningOutcomes: outcomesInput,
    },
  });

  const watchThumbnail = watch('thumbnail');
  const watchTitle = watch('title');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...skillsInput, newSkill.trim()];
    setSkillsInput(updated);
    setValue('skills', updated as any);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    const updated = skillsInput.filter((_, i) => i !== index);
    setSkillsInput(updated);
    setValue('skills', updated as any);
  };

  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    const updated = [...outcomesInput, newOutcome.trim()];
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated as any);
    setNewOutcome('');
  };

  const removeOutcome = (index: number) => {
    const updated = outcomesInput.filter((_, i) => i !== index);
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated as any);
  };

  const onSubmit = async (data: FieldValues) => {
    setIsSubmitting(true);
    try {
      const created = await courseService.createCourse({
        ...(data as CreateCourseInput),
        skills: skillsInput,
        prerequisites: prereqInput,
        learningOutcomes: outcomesInput,
      });

      toast.success(`Course "${created.title}" created successfully!`);
      navigate('/admin/courses');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-['Sora'] text-slate-100 max-w-5xl mx-auto pb-16">
      <CourseHeader
        title="Create New Technical Track"
        description="Fill in complete curriculum details, pricing, learning outcomes, and media to publish a course."
        badgeText="Course Builder"
        breadcrumbs={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Courses', path: '/admin/courses' },
          { label: 'New Course' },
        ]}
        action={
          <Link
            to="/admin/courses"
            className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Basic Course Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Course Title *</label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Advanced Bash & Linux Kernel Security"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
              {errors.title && <span className="text-rose-400 text-[11px]">{errors.title.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category *</label>
              <select
                {...register('category')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="Linux & Systems">Linux & Systems</option>
                <option value="AI & Data">AI & Data</option>
                <option value="DevOps">DevOps</option>
                <option value="Development">Development</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Difficulty Level *</label>
              <select
                {...register('level')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="all_levels">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Duration (e.g. "32 hrs") *</label>
              <input
                type="text"
                {...register('duration')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Price ($ USD, 0 for Free) *</label>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Short Description (Catalog Preview) *</label>
              <textarea
                rows={2}
                {...register('shortDescription')}
                placeholder="Concise 1-2 sentence overview shown on course cards..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
              {errors.shortDescription && (
                <span className="text-rose-400 text-[11px]">{errors.shortDescription.message}</span>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Full Description *</label>
              <textarea
                rows={5}
                {...register('description')}
                placeholder="Detailed curriculum overview, target audience, and syllabus outline..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
              {errors.description && <span className="text-rose-400 text-[11px]">{errors.description.message}</span>}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Sparkles className="w-5 h-5 text-purple-400" /> Media & Visual Branding
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300">Thumbnail Image URL *</label>
              <input
                type="text"
                {...register('thumbnail')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
              <div className="w-48">
                <CourseThumbnail src={watchThumbnail} alt={watchTitle || 'Thumbnail Preview'} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300">Banner Background URL (Optional)</label>
              <input
                type="text"
                {...register('banner')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <h2 className="font-heading font-extrabold text-lg text-white border-b border-slate-800 pb-4">
            Skills & Outcomes
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Skills Taught *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. Systemd Services"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {skillsInput.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-2"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(idx)} className="hover:text-rose-400 cursor-pointer">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold text-slate-300">Learning Outcomes *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                placeholder="e.g. Build end-to-end automation scripts"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addOutcome}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 pt-2">
              {outcomesInput.map((outcome, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                  <span>{outcome}</span>
                  <button type="button" onClick={() => removeOutcome(idx)} className="text-slate-400 hover:text-rose-400 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Initial Status</label>
              <select
                {...register('status')}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-medium cursor-pointer"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Live)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/courses"
              className="py-3 px-5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-6 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Course...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Publish Course</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseCreate;
