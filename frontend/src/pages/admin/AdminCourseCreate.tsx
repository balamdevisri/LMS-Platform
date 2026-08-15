import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCourseSchema } from '../../../../shared/validators/course.validator';
import type { CreateCourseInput } from '../../../../shared/validators/course.validator';
import { courseService } from '../../services/courseService';
import { useCourses } from '@/contexts/CourseContext';
import { CourseHeader } from '../../components/courses/CourseHeader';
import { CourseThumbnail } from '../../components/courses/CourseThumbnail';
import { CheckCircle2, ArrowLeft, Loader2, Plus, Trash2, Sparkles, BookOpen, Clock, List } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedModule {
  title: string;
  description: string;
  duration: string;
  topics: {
    title: string;
    description: string;
    estimatedDuration: string;
    learningUnits: {
      title: string;
      description: string;
      duration: string;
      type: 'Video' | 'Reading' | 'Quiz' | 'Assignment';
    }[];
  }[];
}

interface GeneratedSyllabus {
  title: string;
  category: string;
  learningOutcomes: string[];
  durationEstimate: string;
  modules: GeneratedModule[];
}

const generateAiSyllabus = (title: string): GeneratedSyllabus => {
  const cleanTitle = title.trim();
  
  let category = 'Development';
  if (/linux|bash|unix|kernel|os|system/i.test(cleanTitle)) {
    category = 'Linux & Systems';
  } else if (/ai|data|model|ml|python|intelligence|deep/i.test(cleanTitle)) {
    category = 'AI & Data';
  } else if (/docker|kubernetes|k8s|devops|aws|cloud|ci|cd/i.test(cleanTitle)) {
    category = 'DevOps';
  }

  const outcomes = [
    `Understand fundamental and advanced core paradigms of ${cleanTitle}.`,
    `Implement real-world projects demonstrating key setup concepts.`,
    `Optimize performance using professional debugging practices.`,
    `Validate safety protocols and branch controls inside deployment pipelines.`
  ];

  const modules: GeneratedModule[] = [
    {
      title: `Module 1: Foundations of ${cleanTitle}`,
      description: `Introduction to the base configurations, command lines, and conceptual boundaries of ${cleanTitle}.`,
      duration: '4 hours',
      topics: [
        {
          title: `Topic 1.1: Core Concepts & Architectural Overview`,
          description: `Analyze structural patterns, dependencies, and lifecycle events.`,
          estimatedDuration: '60 mins',
          learningUnits: [
            { title: 'Introductory Overview Concept Video', description: 'Brief introductory lecture.', duration: '15 mins', type: 'Video' },
            { title: 'Setup Guide & Local Installation Guide', description: 'Reading lesson on configuration setups.', duration: '15 mins', type: 'Reading' },
            { title: 'Foundational Knowledge Review', description: 'Interactive multiple choice quiz.', duration: '15 mins', type: 'Quiz' },
            { title: 'Local Sandbox Setup Assignment', description: 'Hands-on project validation sandbox.', duration: '15 mins', type: 'Assignment' }
          ]
        }
      ]
    },
    {
      title: `Module 2: Advanced Implementations & Workflows`,
      description: `Deep dive into complex use cases, optimizations, and industrial workflow configurations.`,
      duration: '6 hours',
      topics: [
        {
          title: `Topic 2.1: Production Security Protocols`,
          description: `Verify encryption, credential scopes, and security postures.`,
          estimatedDuration: '90 mins',
          learningUnits: [
            { title: 'Mastering Advanced Architectures', description: 'Video session detailing professional components.', duration: '20 mins', type: 'Video' },
            { title: 'Industry Best Practices Deep Dive', description: 'Reading covering production guidelines.', duration: '20 mins', type: 'Reading' },
            { title: 'Scenario Analysis evaluation', description: 'Test evaluating edge cases and parameters.', duration: '20 mins', type: 'Quiz' },
            { title: 'Production Hardening Lab', description: 'Submit build configs and logs for evaluation.', duration: '30 mins', type: 'Assignment' }
          ]
        }
      ]
    }
  ];

  return {
    title: cleanTitle,
    category,
    learningOutcomes: outcomes,
    durationEstimate: '10 hours',
    modules
  };
};

export const AdminCourseCreate: React.FC = () => {
  const navigate = useNavigate();
  const { refreshCourses, addCourse } = useCourses();
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual configuration form states
  const [skillsInput, setSkillsInput] = useState<string[]>(['Linux CLI', 'System Administration']);
  const [newSkill, setNewSkill] = useState('');
  const [prereqInput] = useState<string[]>(['Basic command line awareness']);
  const [outcomesInput, setOutcomesInput] = useState<string[]>(['Master Linux permissions and systemd services']);
  const [newOutcome, setNewOutcome] = useState('');

  // AI syllabus generator states
  const [aiTitle, setAiTitle] = useState('');
  const [aiInstructor, setAiInstructor] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedSyllabus, setGeneratedSyllabus] = useState<GeneratedSyllabus | null>(null);

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
        name: 'KaizenQ Instructor',
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

  const onSubmitManual = async (data: FieldValues) => {
    setIsSubmitting(true);
    try {
      const created = await courseService.createCourse({
        ...(data as CreateCourseInput),
        skills: skillsInput,
        prerequisites: prereqInput,
        learningOutcomes: outcomesInput,
      });

      await refreshCourses();
      toast.success(`Course "${created.title}" created successfully!`);
      navigate('/admin/courses');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiGenerate = () => {
    if (!aiTitle.trim()) {
      toast.error('Please specify a Course Title first.');
      return;
    }
    setIsGenerating(true);
    setGenerationStep('Analyzing keywords and topics...');
    
    setTimeout(() => {
      setGenerationStep('Structuring learning modules & topics...');
      setTimeout(() => {
        setGenerationStep('Formulating assessments, quizzes & labs...');
        setTimeout(() => {
          const syllabus = generateAiSyllabus(aiTitle);
          setGeneratedSyllabus(syllabus);
          setIsGenerating(false);
          toast.success('AI Syllabus generated successfully!');
        }, 600);
      }, 600);
    }, 600);
  };

  const handlePublishAiSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedSyllabus || !aiInstructor.trim()) {
      toast.error('Instructor name is required to publish.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (addCourse) {
        await addCourse({
          title: generatedSyllabus.title,
          instructor: aiInstructor,
          category: generatedSyllabus.category,
          status: 'Published',
          duration: generatedSyllabus.durationEstimate,
          students: '0',
          rating: 5.0,
          reviews: 0,
          tracks: `${generatedSyllabus.modules.length} Modules`,
          thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
          description: `This course was fully generated by Kaizen Q AI. Learning outcomes: ${generatedSyllabus.learningOutcomes.join(' ')}`,
          modules: generatedSyllabus.modules.map((m, mIdx) => ({
            id: `gen-module-${mIdx}-${Date.now()}`,
            title: m.title,
            description: m.description,
            duration: m.duration,
            topics: m.topics.map((t, tIdx) => ({
              id: `gen-topic-${mIdx}-${tIdx}-${Date.now()}`,
              title: t.title,
              description: t.description,
              estimatedDuration: t.estimatedDuration,
              learningUnits: t.learningUnits.map((u, uIdx) => ({
                id: `gen-unit-${mIdx}-${tIdx}-${uIdx}-${Date.now()}`,
                title: u.title,
                description: u.description,
                duration: u.duration,
                type: u.type,
              }))
            }))
          }))
        });

        toast.success(`AI Syllabus for "${generatedSyllabus.title}" published successfully!`);
        navigate('/admin/courses');
      } else {
        throw new Error('Course context integration error');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish AI syllabus.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-['Sora'] text-slate-100 max-w-5xl mx-auto pb-16">
      <CourseHeader
        title="Create New Technical Track"
        description="Build technical curriculum manually or instantly auto-generate it using our advanced AI syllabus generator."
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

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 pb-3 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`pb-2 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'manual'
              ? 'border-indigo-500 text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Manual Configuration
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`pb-2 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ai'
              ? 'border-indigo-500 text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>AI Course Generator</span>
        </button>
      </div>

      {activeTab === 'manual' ? (
        <form onSubmit={handleSubmit(onSubmitManual as any)} className="space-y-8">
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
                <label className="text-xs font-bold text-slate-300">Price (₹ INR, 0 for Free) *</label>
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
      ) : (
        <form onSubmit={handlePublishAiSyllabus} className="space-y-6">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Sparkles className="w-5 h-5 text-amber-500" /> AI Syllabus Generator Setup
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Course Focus / Title</label>
                <input
                  type="text"
                  required
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  placeholder="e.g. Docker & Kubernetes Container Security"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Instructor Name</label>
                <input
                  type="text"
                  required
                  value={aiInstructor}
                  onChange={(e) => setAiInstructor(e.target.value)}
                  placeholder="e.g. Bhanu Prakash Achari"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none font-medium"
                />
              </div>

              {!generatedSyllabus && !isGenerating && (
                <div className="md:col-span-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/10"
                  >
                    <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>Generate Professional Syllabus Track</span>
                  </button>
                </div>
              )}
            </div>

            {/* Generating Loading State */}
            {isGenerating && (
              <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200 animate-pulse block">Kaizen Q AI Engine</span>
                  <span className="text-[10px] text-slate-500 font-medium block">{generationStep}</span>
                </div>
              </div>
            )}

            {/* Generated Syllabus Preview */}
            {generatedSyllabus && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-5 animate-in zoom-in-95 text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">AI Syllabus Preview</span>
                  <span className="text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{generatedSyllabus.durationEstimate} Est</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Target Outcomes</span>
                  <ul className="list-disc pl-4 text-[10px] text-slate-400 font-medium space-y-1 leading-normal">
                    {generatedSyllabus.learningOutcomes.map((out, idx) => (
                      <li key={idx}>{out}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Generated Modules</span>
                  <div className="space-y-3">
                    {generatedSyllabus.modules.map((m, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-2 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white">{m.title}</h5>
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/40 font-mono">{m.duration}</span>
                        </div>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-medium">{m.description}</p>
                        
                        <div className="border-t border-slate-800/80 pt-2 flex flex-wrap gap-2 text-[9px] font-bold font-mono text-slate-500">
                          {m.topics.map((t, tIdx) => (
                            <span key={tIdx} className="bg-slate-950 border border-slate-800/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <List className="w-2.5 h-2.5 text-slate-500" />
                              {t.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {generatedSyllabus && (
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setGeneratedSyllabus(null);
                  setAiTitle('');
                }}
                className="py-3 px-5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:bg-slate-800"
              >
                Reset AI Setup
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing AI Syllabus...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Publish AI Syllabus</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default AdminCourseCreate;
