import React from 'react';
import { Map, Star, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '../../services/courseService';

interface RoadmapNode {
  id: string;
  title: string;
  desc: string;
  prereq: string;
  unlockedRole: string;
  color: string;
}

export const CareerRoadmap: React.FC = () => {
  const { user, userProfile } = useAuth();
  const activeUserId = user?.uid || 'default_student';
  const xp = userProfile?.xp || 0;

  // Track progress nodes
  const completedCourses = userProfile?.completedCoursesCount || 0;

  const nodes: RoadmapNode[] = [
    {
      id: 'git',
      title: 'Git & GitHub Mastery',
      desc: 'Master collaborative coding workflows, branching models, and actions pipeline automation.',
      prereq: 'No prerequisites required',
      unlockedRole: 'Version Control Auditor',
      color: 'indigo',
    },
    {
      id: 'linux',
      title: 'Linux Systems Administration',
      desc: 'Deep-dive into Kernel architectures, shell scripts, cron scheduling, and visudo permissions.',
      prereq: 'Git & GitHub Mastery recommended',
      unlockedRole: 'Linux Systems Administrator',
      color: 'emerald',
    },
    {
      id: 'dbms',
      title: 'RDBMS Database Engineering',
      desc: 'Learn advanced SQL joins, indexing optimizations, ACID compliance, and connection pools.',
      prereq: 'Linux fundamentals recommended',
      unlockedRole: 'Database Reliability Engineer',
      color: 'cyan',
    },
    {
      id: 'devops',
      title: 'Cloud DevOps & Orchestration',
      desc: 'Implement Infrastructure-as-Code (IaC), deploy Docker containers, and structure Kubernetes pods.',
      prereq: 'Git + Linux completion required',
      unlockedRole: 'Junior Cloud DevOps Engineer',
      color: 'violet',
    },
  ];

  // Determine locked states dynamically
  const isNodeComplete = (nodeId: string) => {
    let courseId = '';
    if (nodeId === 'git') courseId = 'git-github-mastery';
    else if (nodeId === 'linux') courseId = 'course_linux_101';
    else if (nodeId === 'dbms') courseId = 'database-management-system';
    else return false;

    // 1. Check dynamic checkpoint
    const checkpoint = courseService.getCourseCheckpoint(courseId, activeUserId);
    if (checkpoint && checkpoint.progressPercent >= 100) return true;

    // 2. Check shaivika_completed array
    try {
      const savedCompletedStr = localStorage.getItem(`shaivika_completed_${courseId}`);
      if (savedCompletedStr) {
        const completedIds: any[] = JSON.parse(savedCompletedStr);
        const totalLessons = courseId === 'git-github-mastery' ? 31 : courseId === 'course_linux_101' ? 17 : 29;
        if (completedIds && completedIds.length >= totalLessons) return true;
      }
    } catch (e) {}

    // 3. Check legacy enrollment progress
    try {
      const stored = localStorage.getItem('shaivika_user_enrollments');
      if (stored) {
        const enrollments = JSON.parse(stored);
        const recs = enrollments[activeUserId] || [];
        const rec = recs.find((r: any) => r.courseId === courseId);
        if (rec && rec.progress >= 100) return true;
      }
    } catch (e) {}

    // Legacy backup checks (completedCourses count or XP)
    if (nodeId === 'git') return completedCourses >= 1 || xp > 150;
    if (nodeId === 'linux') return completedCourses >= 2 || xp > 350;
    if (nodeId === 'dbms') return completedCourses >= 3 || xp > 500;

    return false;
  };

  const getActiveRole = () => {
    const gitDone = isNodeComplete('git');
    const linuxDone = isNodeComplete('linux');
    const dbmsDone = isNodeComplete('dbms');

    if (gitDone && linuxDone && dbmsDone) return 'Associate Systems Architect (Tier 3)';
    if (gitDone && linuxDone) return 'Infrastructure Engineer (Tier 2)';
    if (gitDone) return 'Software Support Specialist (Tier 1)';
    return 'Aspiring Tech Graduate';
  };

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-zinc-100 animate-in fade-in duration-300">
      {/* Roadmap Header */}
      <div className="p-6 rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-500" />
            <span>Interactive Career & Syllabus Roadmap</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Track your skill nodes, unlock career roles, and review recommended learning pathways.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 px-4.5 py-2.5 rounded-2xl">
          <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <span className="text-[9px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block">Unlocked Career Rank</span>
            <span className="text-xs font-extrabold text-indigo-850 dark:text-indigo-300 block">{getActiveRole()}</span>
          </div>
        </div>
      </div>

      {/* Visual Roadmap Nodes */}
      <div className="relative border-l-2 border-indigo-150 dark:border-zinc-800 ml-6 pl-8 space-y-12 py-2">
        {nodes.map((node, index) => {
          const completed = isNodeComplete(node.id);
          const isNextActive = index === 0 ? !completed : isNodeComplete(nodes[index - 1].id) && !completed;

          return (
            <div key={node.id} className="relative group">
              {/* Circle indicator node */}
              <div
                className={`absolute -left-[43px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all duration-300 ${
                  completed
                    ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950/40'
                    : isNextActive
                    ? 'bg-indigo-650 text-white border-indigo-750 ring-4 ring-indigo-100 dark:ring-indigo-950/40 animate-pulse'
                    : 'bg-white dark:bg-zinc-900 text-slate-400 dark:text-zinc-550 border-slate-200 dark:border-zinc-800'
                }`}
              >
                {completed ? '✓' : index + 1}
              </div>

              {/* Node Card */}
              <div
                className={`p-6 rounded-3xl border transition-all duration-300 ${
                  completed
                    ? 'bg-white dark:bg-zinc-900 border-sky-100 dark:border-zinc-800/80 shadow-xs'
                    : isNextActive
                    ? 'bg-gradient-to-br from-white to-indigo-50/10 dark:from-zinc-900 dark:to-indigo-950/5 border-indigo-150 dark:border-indigo-900 shadow-xs'
                    : 'bg-white/40 dark:bg-zinc-950/40 border-slate-100 dark:border-zinc-900/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                        {node.title}
                      </h3>
                      {completed && (
                        <span className="text-[8px] font-black text-emerald-700 bg-emerald-55 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-emerald-200">
                          Complete
                        </span>
                      )}
                      {isNextActive && (
                        <span className="text-[8px] font-black text-indigo-700 bg-indigo-55 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-indigo-200">
                          Up Next
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-2xl">
                      {node.desc}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-bold text-slate-450 dark:text-zinc-550 block">Requisite</span>
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-zinc-300 block">{node.prereq}</span>
                  </div>
                </div>

                {/* Node Unlocked rewards */}
                <div className="mt-5 pt-4 border-t border-dashed border-slate-100 dark:border-zinc-800 flex flex-wrap gap-4 items-center text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Unlocked Career Profile:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{node.unlockedRole}</span>
                  </span>
                  {completed && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 py-0.5 px-2 rounded-lg">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Syllabus Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
