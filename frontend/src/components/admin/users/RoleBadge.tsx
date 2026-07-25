import React from 'react';
import { ShieldCheck, GraduationCap, User } from 'lucide-react';
import type { UserRole } from '@/types/user';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm' }) => {
  const normalized = (role || 'student').toLowerCase() as UserRole;

  if (normalized === 'admin') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full border border-purple-300 bg-purple-50 text-purple-700 ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        }`}
      >
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-purple-600' : 'w-3.5 h-3.5 text-purple-600'} />
        <span>ADMIN</span>
      </span>
    );
  }

  if (normalized === 'instructor') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full border border-sky-300 bg-sky-50 text-sky-700 ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        }`}
      >
        <GraduationCap className={size === 'sm' ? 'w-3 h-3 text-sky-600' : 'w-3.5 h-3.5 text-sky-600'} />
        <span>INSTRUCTOR</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
    >
      <User className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
      <span>STUDENT</span>
    </span>
  );
};
