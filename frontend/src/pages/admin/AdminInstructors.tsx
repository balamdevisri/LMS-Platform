import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Mail, Plus, CheckCircle2, Star, X, BookOpen, Loader2, Edit, Trash2, ShieldAlert, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { instructorService, type InstructorUser } from '@/services/instructorService';

export const AdminInstructors: React.FC = () => {
  const [instructors, setInstructors] = useState<InstructorUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Verified' | 'Pending'>('All');
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorUser | null>(null);
  const [deletingInstructorId, setDeletingInstructorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Adding New Instructor
  const [newInstructorName, setNewInstructorName] = useState('');
  const [newInstructorEmail, setNewInstructorEmail] = useState('');
  const [newInstructorSpecialty, setNewInstructorSpecialty] = useState('Linux & System Architecture');

  // Real-Time Subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = instructorService.subscribeToInstructors((data) => {
      setInstructors(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || inst.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstructorName || !newInstructorEmail) {
      toast.error('Please enter name and email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await instructorService.addInstructor(newInstructorName, newInstructorEmail, newInstructorSpecialty);
      toast.success(`Instructor account approved for ${newInstructorName}!`);
      setAddModalOpen(false);
      setNewInstructorName('');
      setNewInstructorEmail('');
    } catch (e) {
      toast.error('Failed to add instructor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;

    try {
      await instructorService.updateInstructor(editingInstructor);
      toast.success(`Instructor ${editingInstructor.name} updated in real time!`);
      setEditingInstructor(null);
    } catch (e) {
      toast.error('Failed to update instructor.');
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    const target = instructors.find((i) => i.id === id);
    try {
      await instructorService.deleteInstructor(id);
      toast.success(`Instructor ${target?.name || 'account'} deleted!`);
    } catch (e) {
      toast.error('Failed to delete instructor.');
    } finally {
      setDeletingInstructorId(null);
    }
  };

  const toggleStatus = async (inst: InstructorUser) => {
    const updated: InstructorUser = {
      ...inst,
      status: inst.status === 'Verified' ? 'Pending' : 'Verified',
    };
    try {
      await instructorService.updateInstructor(updated);
      toast.info(`Instructor status set to ${updated.status}`);
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-sky-500" />
              <span>Faculty & Instructor Management</span>
            </div>

            {/* Live Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>REAL-TIME LIVE DB SYNC</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Real-Time Instructor Directory ({instructors.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Approve real-time faculty credentials, edit info, delete accounts, and manage teaching tracks.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add / Approve Instructor</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active real-time instructors..."
              className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(['All', 'Verified', 'Pending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-sky-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Instructor Cards Grid */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Connecting to real-time instructor database...</p>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium space-y-3">
            <p className="text-slate-800 font-bold text-sm">No faculty members found in database.</p>
            <p className="text-slate-500 text-xs">Click below to onboard and approve real-time faculty members.</p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="btn-blue-primary text-xs py-2 px-4 font-bold inline-flex items-center gap-2 mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Approve First Instructor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredInstructors.map((inst) => (
              <div
                key={inst.id}
                className="p-5 rounded-2xl bg-slate-50/80 border border-sky-200/80 hover:border-sky-300 transition-all space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {inst.avatar ? (
                      <img
                        src={inst.avatar}
                        alt={inst.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-300 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-bold text-base flex items-center justify-center shrink-0 border-2 border-sky-300">
                        {inst.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-heading font-bold text-sm text-slate-900">{inst.name}</h3>
                      <p className="text-[11px] text-sky-700 font-semibold">{inst.specialty}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{inst.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleStatus(inst)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        inst.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {inst.status}
                    </button>

                    {/* EDIT BUTTON */}
                    <button
                      onClick={() => setEditingInstructor(inst)}
                      className="p-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer"
                      title="Edit Instructor Profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => setDeletingInstructorId(inst.id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                      title="Delete Instructor Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sky-100 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-500 font-medium block">Courses</span>
                    <span className="font-bold text-slate-900 flex items-center justify-center gap-1">
                      <BookOpen className="w-3 h-3 text-sky-600" />
                      {inst.assignedCourses}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-500 font-medium block">Students</span>
                    <span className="font-bold text-slate-900">{inst.studentsCount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-slate-500 font-medium block">Rating</span>
                    <span className="font-bold text-amber-600 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-current text-amber-400" />
                      {inst.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD INSTRUCTOR */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-600" /> Approve Real-Time Instructor
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInstructor} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Instructor Full Name</label>
                <input
                  type="text"
                  required
                  value={newInstructorName}
                  onChange={(e) => setNewInstructorName(e.target.value)}
                  placeholder="Prof. Alan Turing"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newInstructorEmail}
                  onChange={(e) => setNewInstructorEmail(e.target.value)}
                  placeholder="alan@university.edu"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Specialty / Course Track</label>
                <input
                  type="text"
                  required
                  value={newInstructorSpecialty}
                  onChange={(e) => setNewInstructorSpecialty(e.target.value)}
                  placeholder="Linux Systems & Kernel Architecture"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-sky-200 text-xs font-bold text-slate-600 hover:bg-sky-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Instructor</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INSTRUCTOR */}
      {editingInstructor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-600" /> Edit Real-Time Instructor Details
              </h3>
              <button onClick={() => setEditingInstructor(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.name}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, name: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingInstructor.email}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, email: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Specialty & Domain</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.specialty}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, specialty: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Verification Status</label>
                <select
                  value={editingInstructor.status}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, status: e.target.value as 'Verified' | 'Pending' })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingInstructor(null)}
                  className="py-2.5 px-4 rounded-xl border border-sky-200 text-xs font-bold text-slate-600 hover:bg-sky-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingInstructorId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 text-center font-['Sora']">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">Delete Instructor Account?</h3>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to delete this instructor? This action will remove their account in real-time.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingInstructorId(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteInstructor(deletingInstructorId)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInstructors;
