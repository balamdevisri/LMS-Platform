import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateCourseSchema } from '../../../../shared/validators/course.validator';
import type { UpdateCourseInput } from '../../../../shared/validators/course.validator';
import { courseService } from '../../services/courseService';
import { CourseHeader } from '../../components/courses/CourseHeader';
import { CourseThumbnail } from '../../components/courses/CourseThumbnail';
import { LoadingSkeleton } from '../../components/courses/LoadingSkeleton';
import { CheckCircle2, ArrowLeft, Loader2, Plus, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export const AdminCourseEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [skillsInput, setSkillsInput] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [outcomesInput, setOutcomesInput] = useState<string[]>([]);
  const [newOutcome, setNewOutcome] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateCourseInput>({
    resolver: zodResolver(UpdateCourseSchema) as any,
  });

  const watchThumbnail = watch('thumbnail');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const course = await courseService.getCourseBySlugOrId(id);
        if (course) {
          reset(course);
          setSkillsInput(course.skills || []);
          setOutcomesInput(course.learningOutcomes || []);
        } else {
          toast.error('Course not found.');
          navigate('/admin/courses');
        }
      } catch (err) {
        toast.error('Error fetching course data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, reset, navigate]);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...skillsInput, newSkill.trim()];
    setSkillsInput(updated);
    setValue('skills', updated);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    const updated = skillsInput.filter((_, i) => i !== index);
    setSkillsInput(updated);
    setValue('skills', updated);
  };

  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    const updated = [...outcomesInput, newOutcome.trim()];
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated);
    setNewOutcome('');
  };

  const removeOutcome = (index: number) => {
    const updated = outcomesInput.filter((_, i) => i !== index);
    setOutcomesInput(updated);
    setValue('learningOutcomes', updated);
  };

  const onSubmit = async (data: FieldValues) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await courseService.updateCourse(id, {
        ...(data as UpdateCourseInput),
        skills: skillsInput,
        learningOutcomes: outcomesInput,
      });

      toast.success('Course updated successfully!');
      navigate('/admin/courses');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton variant="detail" />;
  }

  return (
    <div className="space-y-8 font-['Sora'] text-slate-100 max-w-5xl mx-auto pb-16">
      <CourseHeader
        title="Edit Course Track"
        description="Update curriculum content, pricing, skills, outcomes, and publishing parameters."
        badgeText="Admin Editor"
        breadcrumbs={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'Courses', path: '/admin/courses' },
          { label: 'Edit Course' },
        ]}
        action={
          <Link
            to="/admin/courses"
            className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel & Return
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Course Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Course Title</label>
              <input
                type="text"
                {...register('title')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
              {errors.title && <span className="text-rose-400 text-[11px]">{errors.title.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category</label>
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
              <label className="text-xs font-bold text-slate-300">Difficulty Level</label>
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
              <label className="text-xs font-bold text-slate-300">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Status</label>
              <select
                {...register('status')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium cursor-pointer"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Short Description</label>
              <textarea
                rows={2}
                {...register('shortDescription')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Full Description</label>
              <textarea
                rows={5}
                {...register('description')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
          <label className="text-xs font-bold text-slate-300">Thumbnail Image URL</label>
          <input
            type="text"
            {...register('thumbnail')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
          />
          {watchThumbnail && (
            <div className="w-48">
              <CourseThumbnail src={watchThumbnail} alt="Thumbnail Preview" />
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Skills Taught</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
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
                  <button type="button" onClick={() => removeSkill(idx)} className="cursor-pointer">
                    <Trash2 className="w-3 h-3 text-rose-400" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold text-slate-300">Learning Outcomes</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                placeholder="Add outcome..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={addOutcome}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
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

        <div className="flex justify-end gap-3">
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
                <span>Updating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseEdit;
