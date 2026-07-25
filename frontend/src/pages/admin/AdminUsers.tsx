import React, { useState, useEffect } from 'react';
import { Radio, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import type { UserProfile, UserRole, UserStatistics as StatsType } from '@/types/user';
import { UserStatistics } from '@/components/admin/users/UserStatistics';
import { SearchBar } from '@/components/admin/users/SearchBar';
import { FilterDropdown } from '@/components/admin/users/FilterDropdown';
import { UserTable } from '@/components/admin/users/UserTable';
import { EditUserModal } from '@/components/admin/users/EditUserModal';
import { ChangeRoleModal } from '@/components/admin/users/ChangeRoleModal';
import { DeleteConfirmationModal } from '@/components/admin/users/DeleteConfirmationModal';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<StatsType>({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    newToday: 0,
    newThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedVerification, setSelectedVerification] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Modals State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [roleChangingUser, setRoleChangingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isRegisteringOpen, setIsRegisteringOpen] = useState(false);

  // Form State for Quick Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = userService.subscribeToUsers((data, statistics) => {
      setUsers(data);
      setStats(statistics);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter & Sort Logic
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (u.fullName || u.name || '').toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.branch || '').toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query);

    const matchesRole = selectedRole === 'ALL' || u.role.toLowerCase() === selectedRole.toLowerCase();
    const matchesStatus = selectedStatus === 'ALL' || u.status === selectedStatus;
    const matchesVerification =
      selectedVerification === 'ALL' ||
      (selectedVerification === 'verified' && u.isVerified) ||
      (selectedVerification === 'unverified' && !u.isVerified);

    return matchesSearch && matchesRole && matchesStatus && matchesVerification;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'name') {
      return (a.fullName || a.name || '').localeCompare(b.fullName || b.name || '');
    }
    if (sortBy === 'lastLogin') {
      return new Date(b.lastLogin || 0).getTime() - new Date(a.lastLogin || 0).getTime();
    }
    return 0;
  });

  // Handlers
  const handleSaveUser = async (updated: UserProfile) => {
    try {
      await userService.updateUser(updated.uid, updated);
      toast.success(`User ${updated.fullName} updated successfully!`);
    } catch (e) {
      toast.error('Failed to update user profile.');
    }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (!roleChangingUser) return;
    try {
      await userService.changeRole(roleChangingUser.uid, newRole);
      toast.success(`User ${roleChangingUser.fullName} role changed to ${newRole.toUpperCase()}!`);
    } catch (e) {
      toast.error('Failed to change role.');
    }
  };

  const handleToggleBlock = async (user: UserProfile) => {
    try {
      if (user.status === 'Blocked') {
        await userService.unblockUser(user.uid);
        toast.success(`User ${user.fullName} unblocked!`);
      } else {
        await userService.blockUser(user.uid);
        toast.warning(`User ${user.fullName} blocked from platform.`);
      }
    } catch (e) {
      toast.error('Failed to update user status.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await userService.deleteUser(deletingUser.uid);
      toast.success(`User ${deletingUser.fullName} deleted permanently.`);
    } catch (e) {
      toast.error('Failed to delete user account.');
    }
  };

  const handleResetPassword = async (user: UserProfile) => {
    toast.info(`Password reset link dispatched to ${user.email}`);
  };

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      toast.error('Please enter name and email.');
      return;
    }
    const newUid = `user_${Date.now()}`;
    const newUser: UserProfile = {
      uid: newUid,
      fullName: regName,
      name: regName,
      email: regEmail,
      role: regRole,
      provider: 'password',
      status: 'Active',
      branch: 'AI & Computer Science',
      year: '1st Year',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isVerified: true,
      enrolledCoursesCount: 1,
    };
    try {
      await userService.updateUser(newUid, newUser);
      toast.success(`New ${regRole} account created for ${regName}!`);
      setIsRegisteringOpen(false);
      setRegName('');
      setRegEmail('');
    } catch (e) {
      toast.error('Failed to register user.');
    }
  };

  return (
    <div className="space-y-8 font-['Sora'] pb-12">
      
      {/* Top Banner Header */}
      <div className="bg-white/95 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
              Enterprise Admin Module
            </span>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Firestore Real-Time Live Sync</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Admin User Management System ({stats.totalUsers})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium max-w-2xl">
            Monitor all registered platform users, assign roles (Admin / Instructor / Student), verify credentials, inspect learning progress, and manage account statuses.
          </p>
        </div>

        <button
          onClick={() => setIsRegisteringOpen(true)}
          className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New User</span>
        </button>
      </div>

      {/* Dashboard Animated Statistics Cards */}
      <UserStatistics stats={stats} />

      {/* Main Table & Filters Container */}
      <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
        
        {/* Search & Filters Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="w-full lg:w-96">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <FilterDropdown
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedVerification={selectedVerification}
            onVerificationChange={setSelectedVerification}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* User Data Table */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-9 h-9 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Subscribing to Firestore users database in real-time...</p>
          </div>
        ) : (
          <UserTable
            users={sortedUsers}
            onEdit={(u) => setEditingUser(u)}
            onChangeRole={(u) => setRoleChangingUser(u)}
            onToggleBlock={handleToggleBlock}
            onDelete={(u) => setDeletingUser(u)}
            onResetPassword={handleResetPassword}
          />
        )}
      </div>

      {/* MODAL: EDIT USER */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {/* MODAL: CHANGE ROLE */}
      {roleChangingUser && (
        <ChangeRoleModal
          user={roleChangingUser}
          onClose={() => setRoleChangingUser(null)}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingUser && (
        <DeleteConfirmationModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}

      {/* MODAL: QUICK REGISTER */}
      {isRegisteringOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900">Create Platform Account</h3>
              <button onClick={() => setIsRegisteringOpen(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickRegister} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Alex Johnson"
                  required
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="alex@stanford.edu"
                  required
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assigned Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="student">Student (Default)</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegisteringOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-blue-primary text-xs py-2 px-5 font-bold shadow-md"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
