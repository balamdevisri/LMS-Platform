import React from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, ShieldCheck, User, Activity, CheckCircle, UserPlus, Calendar } from 'lucide-react';
import type { UserStatistics as StatsType } from '@/types/user';

interface UserStatisticsProps {
  stats: StatsType;
}

export const UserStatistics: React.FC<UserStatisticsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Platform Users',
      value: stats.totalUsers,
      subtext: 'Registered Accounts',
      icon: Users,
      gradient: 'from-blue-600 to-sky-500',
      shadow: 'shadow-blue-500/20',
      border: 'border-blue-200',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      subtext: 'Enrolled Learners',
      icon: User,
      gradient: 'from-sky-600 to-indigo-600',
      shadow: 'shadow-sky-500/20',
      border: 'border-sky-200',
    },
    {
      title: 'Total Instructors',
      value: stats.totalInstructors,
      subtext: 'Faculty Mentors',
      icon: GraduationCap,
      gradient: 'from-indigo-600 to-purple-600',
      shadow: 'shadow-indigo-500/20',
      border: 'border-indigo-200',
    },
    {
      title: 'System Admins',
      value: stats.totalAdmins,
      subtext: 'Full Access Managers',
      icon: ShieldCheck,
      gradient: 'from-purple-600 to-fuchsia-600',
      shadow: 'shadow-purple-500/20',
      border: 'border-purple-200',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      subtext: 'Unblocked & Operational',
      icon: Activity,
      gradient: 'from-emerald-600 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      border: 'border-emerald-200',
    },
    {
      title: 'Verified Users',
      value: stats.verifiedUsers,
      subtext: 'Email/OAuth Authenticated',
      icon: CheckCircle,
      gradient: 'from-teal-600 to-cyan-500',
      shadow: 'shadow-teal-500/20',
      border: 'border-teal-200',
    },
    {
      title: 'Registered Today',
      value: stats.newToday,
      subtext: 'Joined in Last 24 Hours',
      icon: UserPlus,
      gradient: 'from-cyan-600 to-sky-600',
      shadow: 'shadow-cyan-500/20',
      border: 'border-cyan-200',
    },
    {
      title: 'Registered This Week',
      value: stats.newThisWeek,
      subtext: 'Joined in Last 7 Days',
      icon: Calendar,
      gradient: 'from-blue-700 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      border: 'border-blue-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-['Sora']">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`bg-white/95 backdrop-blur-xl rounded-3xl p-5 border ${c.border} shadow-lg ${c.shadow} hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {c.title}
                </p>
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-1">
                  {c.value}
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                  {c.subtext}
                </p>
              </div>

              <div
                className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${c.gradient} text-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300 shrink-0`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
