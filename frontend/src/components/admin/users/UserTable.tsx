import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Shield, Ban, CheckCircle2, Trash2, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import { ProviderBadge } from './ProviderBadge';

interface UserTableProps {
  users: UserProfile[];
  onEdit: (user: UserProfile) => void;
  onChangeRole: (user: UserProfile) => void;
  onToggleBlock: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
  onResetPassword: (user: UserProfile) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onChangeRole,
  onToggleBlock,
  onDelete,
  onResetPassword,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = users.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4 font-['Sora']">
      <div className="overflow-x-auto rounded-2xl border border-sky-200/80 bg-white/90 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-sky-100 bg-sky-50/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Provider</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Branch & Year</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4">Last Login</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                  No users found matching your search and filter criteria.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-sky-50/60 transition-colors">
                  {/* User Profile Pic & Name */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-full object-cover border-2 border-sky-300 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-linear-to-tr from-sky-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center border border-sky-300 shadow-xs shrink-0">
                          {u.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <Link
                          to={`/admin/users/${u.uid}`}
                          className="hover:text-sky-600 font-bold text-slate-900 block leading-tight truncate max-w-40"
                        >
                          {u.fullName || u.name}
                        </Link>
                        {u.isVerified && (
                          <span className="text-[9px] font-bold text-emerald-600 block">✓ Verified Account</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium font-mono text-[11px]">
                    {u.email}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <RoleBadge role={u.role} />
                  </td>

                  {/* Provider */}
                  <td className="py-3.5 px-4">
                    <ProviderBadge provider={u.provider} />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={u.status} />
                  </td>

                  {/* Branch & Year */}
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">
                    <div className="text-slate-900 font-bold">{u.branch || 'AI & Computer Science'}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{u.year || '4th Year'}</div>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px]">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </td>

                  {/* Last Login */}
                  <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px]">
                    {u.lastLogin
                      ? new Date(u.lastLogin).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Active Now'}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/users/${u.uid}`}
                        className="p-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer"
                        title="View Full User Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => onEdit(u)}
                        className="p-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer"
                        title="Edit User Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onChangeRole(u)}
                        className="p-1.5 rounded-lg bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all cursor-pointer"
                        title="Change Account Role"
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleBlock(u)}
                        className={`p-1.5 rounded-lg bg-white border transition-all cursor-pointer ${
                          u.status === 'Blocked'
                            ? 'hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'hover:bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                        title={u.status === 'Blocked' ? 'Unblock User' : 'Block User'}
                      >
                        {u.status === 'Blocked' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => onResetPassword(u)}
                        className="p-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer"
                        title="Trigger Password Reset Email"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDelete(u)}
                        className="p-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500 font-medium">
          Showing {users.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, users.length)} of {users.length} Users
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
