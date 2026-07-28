import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Search, CheckCircle2, X, Users, Star, Loader2, Sparkles, Clock, List } from 'lucide-react';
import { toast } from 'sonner';
import { useCourses } from '@/contexts/CourseContext';

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
  
  // Choose standard category based on title keyword
  let category = 'Development';
  if (/linux|bash|unix|kernel|os|system/i.test(cleanTitle)) {
    category = 'Linux & Systems';
  } else if (/ai|data|model|ml|python|intelligence|deep/i.test(cleanTitle)) {
    category = 'AI & Data';
  } else if (/docker|kubernetes|k8s|devops|aws|cloud|ci|cd/i.test(cleanTitle)) {
    category = 'DevOps';
  }

  // Pre-seed some default syllabus designs or generate a dynamic one
  const outcomes = [
    `Understand fundamental and advanced core paradigms of ${cleanTitle}.`,
    `Implement real-world projects demonstrating key setup concepts.`,
    `Optimize performance using professional debugging practices.`,
    `Validate safety protocols and branch controls inside deployment pipelines.`
  ];

  // Dynamic modules generator based on input title!
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

export const AdminCourses: React.FC = () => {
  const { courses, addCourse, toggleCourseStatus } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Course Form State
  const [createTab, setCreateTab] = useState<'manual' | 'ai'>('manual');
  const [newTitle, setNewTitle] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newCategory, setNewCategory] = useState('Linux & Systems');

  // AI Course Generator States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedSyllabus, setGeneratedSyllabus] = useState<GeneratedSyllabus | null>(null);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newInstructor) {
      toast.error('Please fill in title and instructor name.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (createTab === 'ai' && generatedSyllabus) {
        await addCourse({
          title: generatedSyllabus.title,
          instructor: newInstructor,
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
      } else {
        await addCourse({
          title: newTitle,
          instructor: newInstructor,
          category: newCategory,
          status: 'Published',
          students: '0',
          rating: 5.0,
          reviews: 0,
          tracks: '0 Modules',
          thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
          description: 'Custom manual setup course track.',
          modules: []
        });
        toast.success(`Course "${newTitle}" published manually!`);
      }
      setIsSubmitting(false);
      setModalOpen(false);
      setNewTitle('');
      setNewInstructor('');
      setGeneratedSyllabus(null);
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error('Failed to publish course.');
    }
  };

  const handleAiGenerate = () => {
    if (!newTitle) {
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
          const syllabus = generateAiSyllabus(newTitle);
          setGeneratedSyllabus(syllabus);
          setIsGenerating(false);
          toast.success('AI Syllabus generated successfully!');
        }, 600);
      }, 600);
    }, 600);
  };

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>Curriculum Management</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Admin Course Track Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Create, edit, and publish enterprise technical courses and AI assessment rubrics.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateTab('manual');
            setGeneratedSyllabus(null);
            setModalOpen(true);
          }}
          className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course Track</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
        
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by title, instructor, or topic..."
              className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              to={`/admin/courses/${course.id}`}
              className="p-5 rounded-2xl bg-slate-50/80 border border-sky-200/80 hover:border-sky-300 hover:shadow-md transition-all space-y-3 shadow-xs flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-md border border-sky-200">
                    {course.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCourseStatus(course.id);
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                      course.status === 'Published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {course.status}
                  </button>
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Instructor: {course.instructor}</p>
              </div>

              <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  {course.students}
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                  {course.rating}
                </span>
                <span className="font-mono text-[11px] text-slate-500">{course.tracks}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Add/AI Course Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora'] max-h-[90vh] overflow-y-auto pr-2">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" /> Create New Course
              </h3>
              <button 
                onClick={() => {
                  setModalOpen(false);
                  setGeneratedSyllabus(null);
                }} 
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-slate-100 pb-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setCreateTab('manual');
                  setGeneratedSyllabus(null);
                }}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  createTab === 'manual'
                    ? 'border-sky-500 text-sky-700 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-750'
                }`}
              >
                Manual Setup
              </button>
              <button
                type="button"
                onClick={() => setCreateTab('ai')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1 ${
                  createTab === 'ai'
                    ? 'border-sky-500 text-sky-700 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-750'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>AI Course Generator</span>
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              
              {/* Course Title Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={createTab === 'ai' ? "e.g. Docker & Kubernetes Container Security" : "e.g. Advanced Bash & Linux Kernel Security"}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-bold"
                />
              </div>

              {/* Instructor Name Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Instructor Name</label>
                <input
                  type="text"
                  required
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  placeholder="e.g. Bhanu Prakash Achari"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              {/* Conditional manual fields */}
              {createTab === 'manual' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium cursor-pointer"
                  >
                    <option value="Linux & Systems">Linux & Systems</option>
                    <option value="Development">Development</option>
                    <option value="AI & Data">AI & Data</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
              )}

              {/* AI generator Action Button & Results Panel */}
              {createTab === 'ai' && (
                <div className="space-y-4 pt-1">
                  {!generatedSyllabus && !isGenerating && (
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-sky-500 hover:from-amber-600 hover:to-sky-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                      <span>Generate Professional Syllabus</span>
                    </button>
                  )}

                  {/* AI Generating Loader */}
                  {isGenerating && (
                    <div className="p-6 rounded-2xl bg-sky-50/50 border border-sky-100 flex flex-col items-center justify-center text-center space-y-3">
                      <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 animate-pulse block">Kaizen Q AI Engine</span>
                        <span className="text-[10px] text-slate-500 font-medium block">{generationStep}</span>
                      </div>
                    </div>
                  )}

                  {/* Generated Syllabus Review Block */}
                  {generatedSyllabus && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-200 space-y-4 animate-in zoom-in-95">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">AI Syllabus Preview</span>
                        <span className="text-[9px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-sky-500" />
                          <span>{generatedSyllabus.durationEstimate} Est</span>
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Target Outcomes</span>
                        <ul className="list-disc pl-4 text-[10px] text-slate-600 font-medium space-y-1 leading-normal">
                          {generatedSyllabus.learningOutcomes.map((out, idx) => (
                            <li key={idx}>{out}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Generated Modules</span>
                        <div className="space-y-2">
                          {generatedSyllabus.modules.map((m, idx) => (
                            <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 space-y-1.5 shadow-3xs">
                              <div className="flex items-center justify-between">
                                <h5 className="text-[11px] font-extrabold text-slate-900">{m.title}</h5>
                                <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100 font-mono">{m.duration}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{m.description}</p>
                              
                              <div className="border-t border-slate-50 pt-1.5 flex flex-wrap gap-2 text-[9px] font-bold font-mono text-slate-450">
                                {m.topics.map((t, tIdx) => (
                                  <span key={tIdx} className="bg-slate-50 border px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <List className="w-2.5 h-2.5 text-slate-400" />
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
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setGeneratedSyllabus(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-sky-200 text-xs font-bold text-slate-600 hover:bg-sky-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (createTab === 'ai' && !generatedSyllabus)}
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{createTab === 'ai' ? 'Publish AI Syllabus' : 'Publish Course'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCourses;
