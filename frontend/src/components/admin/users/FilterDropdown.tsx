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
      <div className="flex items-center gap-1.5 bg-slate-50 border border-sky-200 rounded-xl px-3 py-1.5 text-xs">
        <Filter className="w-3.5 h-3.5 text-sky-600" />
        <span className="font-bold text-slate-500">Role:</span>
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Roles</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5 bg-slate-50 border border-sky-200 rounded-xl px-3 py-1.5 text-xs">
        <span className="font-bold text-slate-500">Status:</span>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
          <option value="Pending">Pending Verification</option>
        </select>
      </div>

      {/* Verification Filter */}
      <div className="flex items-center gap-1.5 bg-slate-50 border border-sky-200 rounded-xl px-3 py-1.5 text-xs">
        <span className="font-bold text-slate-500">Verified:</span>
        <select
          value={selectedVerification}
          onChange={(e) => onVerificationChange(e.target.value)}
          className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Accounts</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>
      </div>

      {/* Sort By */}
      <div className="flex items-center gap-1.5 bg-slate-50 border border-sky-200 rounded-xl px-3 py-1.5 text-xs">
        <ArrowUpDown className="w-3.5 h-3.5 text-sky-600" />
        <span className="font-bold text-slate-500">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name (A-Z)</option>
          <option value="lastLogin">Last Login</option>
        </select>
      </div>
    </div>
  );
};
