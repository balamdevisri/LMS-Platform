import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

interface FilterDropdownProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedVerification: string;
  onVerificationChange: (ver: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  selectedVerification,
  onVerificationChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 font-['Sora']">
      {/* Role Filter */}
      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
        <Filter className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
        <span className="font-bold text-slate-500 dark:text-slate-400">Role:</span>
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL" className="dark:bg-slate-900">All Roles</option>
          <option value="student" className="dark:bg-slate-900">Student</option>
          <option value="instructor" className="dark:bg-slate-900">Instructor</option>
          <option value="admin" className="dark:bg-slate-900">Admin</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
        <span className="font-bold text-slate-500 dark:text-slate-400">Status:</span>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL" className="dark:bg-slate-900">All Statuses</option>
          <option value="Active" className="dark:bg-slate-900">Active</option>
          <option value="Blocked" className="dark:bg-slate-900">Blocked</option>
          <option value="Pending" className="dark:bg-slate-900">Pending Verification</option>
        </select>
      </div>

      {/* Verification Filter */}
      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
        <span className="font-bold text-slate-500 dark:text-slate-400">Verified:</span>
        <select
          value={selectedVerification}
          onChange={(e) => onVerificationChange(e.target.value)}
          className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL" className="dark:bg-slate-900">All Accounts</option>
          <option value="verified" className="dark:bg-slate-900">Verified Only</option>
          <option value="unverified" className="dark:bg-slate-900">Unverified Only</option>
        </select>
      </div>

      {/* Sort By */}
      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
        <ArrowUpDown className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
        <span className="font-bold text-slate-500 dark:text-slate-400">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="newest" className="dark:bg-slate-900">Newest First</option>
          <option value="oldest" className="dark:bg-slate-900">Oldest First</option>
          <option value="name" className="dark:bg-slate-900">Name (A-Z)</option>
          <option value="lastLogin" className="dark:bg-slate-900">Last Login</option>
        </select>
      </div>
    </div>
  );
};
