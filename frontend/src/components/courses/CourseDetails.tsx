import React from 'react';
import type { ICourse } from '../../../../shared/types/course';
import { CheckCircle2, BookOpen, Layers, Award, Sparkles, PlayCircle } from 'lucide-react';

interface CourseDetailsProps {
  course: ICourse;
  onStartModule?: () => void;
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({ course, onStartModule }) => {
  return (
    <div className="space-y-10 font-['Sora'] text-slate-900">
      <section className="space-y-4 rounded-3xl bg-white border border-sky-100 p-6 sm:p-8 shadow-md shadow-sky-100/50">
        <h2 className="font-heading font-extrabold text-xl text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-600" /> Track Overview
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
          {course.description}
        </p>
      </section>

      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <section className="space-y-4 rounded-3xl bg-sky-50 border border-sky-200 p-6 sm:p-8 shadow-xs">
          <h2 className="font-heading font-extrabold text-xl text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" /> Key Learning Outcomes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {course.learningOutcomes.map((outcome, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-sky-100 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-800 font-medium leading-normal">{outcome}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-3 rounded-3xl bg-white border border-sky-100 p-6 shadow-md shadow-sky-100/50">
          <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> Core Skills Gained
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {course.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-3xl bg-white border border-sky-100 p-6 shadow-md shadow-sky-100/50">
          <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" /> Prerequisites
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {course.prerequisites.length > 0 ? (
              course.prerequisites.map((req, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                  <span>{req}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No special prerequisites required.</li>
            )}
          </ul>
        </section>
      </div>

      {course.syllabus && course.syllabus.length > 0 && (
        <section className="space-y-4 rounded-3xl bg-white border border-sky-100 p-6 sm:p-8 shadow-md shadow-sky-100/50">
          <h2 className="font-heading font-extrabold text-xl text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" /> Curriculum & Modules ({course.syllabus.length} Modules)
          </h2>

          <div className="space-y-3 pt-2">
            {course.syllabus.map((mod, idx) => (
              <div
                key={mod.id || idx}
                className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-sky-300 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                    Module 0{idx + 1}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-slate-900">{mod.title}</h4>
                  {mod.description && <p className="text-xs text-slate-600 font-normal">{mod.description}</p>}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-sky-100 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right text-xs text-slate-500">
                    {mod.duration && <span className="block font-medium">{mod.duration}</span>}
                    {mod.lessonsCount && <span className="text-[11px] text-slate-400">{mod.lessonsCount} lessons</span>}
                  </div>

                  {onStartModule && (
                    <button
                      onClick={onStartModule}
                      className="py-2 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Start
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
