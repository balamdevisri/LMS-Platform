import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCourseSchema } from '../../../../shared/validators/course.validator';
import type { CreateCourseInput } from '../../../../shared/validators/course.validator';
import { generateSlug } from '../../../../shared/types/firestoreCourse';
import { courseService } from '../../services/courseService';
import { useCourses } from '@/contexts/CourseContext';
import { CourseHeader } from '../../components/courses/CourseHeader';
import { CloudinaryUploadZone } from '../../components/admin/CloudinaryUploadZone';
import { aiAutofillService } from '@/services/aiAutofillService';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  List,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminCourseCreate: React.FC = () => {
  const navigate = useNavigate();
  const { refreshCourses } = useCourses();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Autofill State
  const [isAutofilling, setIsAutofilling] = useState(false);

  // Cloudinary Thumbnail State
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailPublicId, setThumbnailPublicId] = useState<string>('');

  const [skillsInput, setSkillsInput] = useState<string[]>(['Version Control', 'CLI', 'CI/CD']);
  const [newSkill, setNewSkill] = useState('');
  const [outcomesInput, setOutcomesInput] = useState<string[]>([
    'Understand fundamental architecture and mechanics.',
    'Build production-ready projects following industry best practices.',
  ]);
  const [newOutcome, setNewOutcome] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(CreateCourseSchema) as any,
    defaultValues: {
      category: 'Linux & Systems',
      level: 'all_levels',
      language: 'English',
      price: 0,
      instructor: {
        id: 'inst_admin',
        name: 'KaizenQ Engineering Team',
        role: 'Senior Systems Instructor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      skills: ['Linux CLI', 'Bash', 'System Administration'],
      prerequisites: ['Basic computer literacy'],
      learningOutcomes: ['Understand core system architecture', 'Execute production workflows'],
      status: 'published',
      visibility: 'public',
      featured: true,
      duration: '20 Hours',
    },
  });

  const watchTitle = watch('title');

  // Trigger AI Autofill for Course Fields
  const handleAiAutofill = async () => {
    const titleVal = getValues('title');
    if (!titleVal || titleVal.trim().length < 3) {
      toast.error('Please enter at least 3 characters in the Course Title first.');
      return;
    }

    setIsAutofilling(true);
    try {
      const result = await aiAutofillService.autofillCourse({
        title: titleVal.trim(),
        category: getValues('category'),
        level: getValues('level')
      });

      if (result.shortDescription) setValue('shortDescription', result.shortDescription);
      if (result.fullDescription) setValue('description', result.fullDescription);
      if (result.category) setValue('category', result.category as any);
      if (result.level) setValue('level', result.level as any);
      if (result.durationHours) setValue('duration', `${result.durationHours} Hours`);
      if (result.learningOutcomes && result.learningOutcomes.length > 0) {
        setOutcomesInput(result.learningOutcomes);
        setValue('learningOutcomes', result.learningOutcomes as any);
      }
      if (result.tags && result.tags.length > 0) {
        setSkillsInput(result.tags);
        setValue('skills', result.tags as any);
      }

      toast.success('✨ Course fields autofilled! You can review and adjust any field before saving.');
    } catch (err: any) {
      toast.error(err.message || 'Autofill failed — please try again or write manually.');
    } finally {
      setIsAutofilling(false);
    }
  };

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

  const onSubmitManual = async (data: FieldValues) => {
    if (!data.title || String(data.title).trim().length < 3) {
      toast.error('Course title is required.');
      return;
    }

    if (!data.description || String(data.description).trim().length < 10) {
      toast.error('Course description is required (at least 10 characters).');
      return;
    }

    if (!thumbnailPreview && (!data.thumbnail || String(data.thumbnail).trim() === '')) {
      toast.error('Course thumbnail is required. Please upload an image.');
      return;
    }

    if (outcomesInput.length < 2) {
      toast.error('Please provide at least 2 learning outcomes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = data.slug || generateSlug(data.title);
      const payload: any = {
        ...data,
        slug,
        thumbnail: thumbnailPreview || data.thumbnail,
        thumbnailUrl: thumbnailPreview || data.thumbnail,
        thumbnailPublicId: thumbnailPublicId || undefined,
        skills: skillsInput,
        learningOutcomes: outcomesInput,
      };
      const created = await courseService.createCourse(payload);

      await refreshCourses();
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
        description="Build technical curriculum manually or instantly auto-fill fields using our AI assistant."
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

      <form onSubmit={handleSubmit(onSubmitManual as any)} className="space-y-8">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Basic Course Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Course Title *</label>
                
                {/* AI Autofill Button */}
                <button
                  type="button"
                  onClick={handleAiAutofill}
                  disabled={isAutofilling || !watchTitle || watchTitle.trim().length < 3}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Generate description, outcomes, level, and tags with AI"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAutofilling ? 'animate-spin text-amber-300' : 'text-amber-300'}`} />
                  <span>{isAutofilling ? 'Autofilling...' : '✨ Autofill with AI'}</span>
                </button>
              </div>

              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Advanced Docker & Kubernetes Cloud Engineering"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-hidden font-medium"
              />
              {errors.title && <span className="text-rose-400 text-[11px]">{errors.title.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category *</label>
              <select
                {...register('category')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="Linux & Systems">Linux & Systems</option>
                <option value="AI & Data">AI & Data</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Development Tools">Development Tools</option>
                <option value="Web Development">Web Development</option>
                <option value="Programming">Programming</option>
                <option value="Database">Database</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Difficulty Level *</label>
              <select
                {...register('level')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="all_levels">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Estimated Duration *</label>
              <input
                type="text"
                {...register('duration')}
                placeholder="e.g. 24 Hours"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-hidden font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Price (₹ INR)</label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-hidden font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Short Description (Card Summary) *</label>
              <input
                type="text"
                {...register('shortDescription')}
                placeholder="Concise 1-2 sentence overview shown on course cards..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-hidden font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Full Description *</label>
              <textarea
                rows={5}
                {...register('description')}
                placeholder="Detailed curriculum overview, target audience, and syllabus outline..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-hidden font-medium"
              />
            </div>
          </div>
        </div>

        {/* Cloudinary Thumbnail Upload Zone */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" /> Media & Visual Branding
            </h2>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" /> Cloudinary CDN
            </span>
          </div>

          <CloudinaryUploadZone
            currentImageUrl={thumbnailPreview}
            currentPublicId={thumbnailPublicId}
            onUploadSuccess={(res) => {
              setThumbnailPreview(res.secureUrl);
              setThumbnailPublicId(res.publicId);
              setValue('thumbnail', res.secureUrl, { shouldValidate: true });
            }}
            onImageRemove={() => {
              setThumbnailPreview('');
              setThumbnailPublicId('');
              setValue('thumbnail', '');
            }}
          />
        </div>

        {/* Skills & Tags */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <List className="w-5 h-5 text-indigo-400" /> Skills & Tags
          </h2>

          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. Docker, Kubernetes, Microservices"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skillsInput.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-2"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(idx)} className="cursor-pointer text-rose-400 hover:text-rose-300">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <List className="w-5 h-5 text-indigo-400" /> Measurable Learning Outcomes
          </h2>

          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                placeholder="e.g. Master multi-stage container builds in Docker"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={addOutcome}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {outcomesInput.map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs"
                >
                  <span className="text-slate-200">✓ {outcome}</span>
                  <button
                    type="button"
                    onClick={() => removeOutcome(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-4">
          <Link
            to="/admin/courses"
            className="py-3 px-6 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Persisting to Firestore...</span>
              </>
            ) : (
              <span>Create & Persist Course</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseCreate;
