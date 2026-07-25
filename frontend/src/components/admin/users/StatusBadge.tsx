import React from 'react';
import { CheckCircle2, Ban, Clock } from 'lucide-react';
import type { UserStatus } from '@/types/user';

interface StatusBadgeProps {
  status: UserStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  if (status === 'Blocked') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full border border-rose-300 bg-rose-50 text-rose-700 ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        }`}
      >
        <Ban className={size === 'sm' ? 'w-3 h-3 text-rose-600' : 'w-3.5 h-3.5 text-rose-600'} />
        <span>BLOCKED</span>
      </span>
    );
  }

  if (status === 'Pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full border border-amber-300 bg-amber-50 text-amber-800 ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        }`}
      >
        <Clock className={size === 'sm' ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
        <span>PENDING VERIFICATION</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
    >
      <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
      <span>ACTIVE</span>
    </span>
  );
};
