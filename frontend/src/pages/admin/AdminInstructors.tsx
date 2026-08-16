import React, { useState, useEffect, useCallback } from 'react';
import { Search, GraduationCap, Mail, Plus, CheckCircle2, X, Loader2, Edit, Trash2, ShieldAlert, Radio, FileText, Calendar, AlertTriangle, Eye, Phone, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { instructorService, type InstructorUser } from '@/services/instructorService';

export const AdminInstructors: React.FC = () => {
  const { userProfile } = useAuth();
  const [instructors, setInstructors] = useState<InstructorUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  // Modals & Action States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorUser | null>(null);
  const [deletingInstructorId, setDeletingInstructorId] = useState<string | null>(null);
  const [viewingInstructor, setViewingInstructor] = useState<InstructorUser | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Adding New Instructor
  const [newInstructorName, setNewInstructorName] = useState('');
  const [newInstructorEmail, setNewInstructorEmail] = useState('');
  const [newInstructorSpecialty, setNewInstructorSpecialty] = useState('Linux & System Architecture');

  // Real-Time Subscriptions
  useEffect(() => {
    setLoading(true);
    const unsubscribeInst = instructorService.subscribeToInstructors((data) => {
      setInstructors(data);
      setLoading(false);
    });
    return () => {
      unsubscribeInst();
    };
  }, []);

  // Manual refresh — forces fresh getDocs + REST API call
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // Try one-shot getDocs first (uses live Firebase SDK auth)
      const firestoreData = await instructorService.fetchFromFirestoreDirectly();
      if (firestoreData.length > 0) {
        setInstructors(firestoreData);
        setLoading(false);
        return;
      }
      // Fallback to backend REST
      const restData = await instructorService.fetchFirestoreInstructorsDirectly();
      setInstructors(restData);
    } catch (e) {
      console.warn('Refresh error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debug: Log instructor data whenever it changes
  useEffect(() => {
    if (instructors.length > 0) {
      const pendingItems = instructors.filter(i => {
        const st = (i.status || '').toLowerCase();
        return !i.approved && st !== 'approved' && st !== 'active' && st !== 'rejected';
      });
      console.log(`[ADMIN DASHBOARD AUDIT] Total instructors received: ${instructors.length}`);
      console.log(`[ADMIN DASHBOARD AUDIT] Pending instructors: ${pendingItems.length}`);
      console.log(`[ADMIN DASHBOARD AUDIT] Instructor statuses:`, instructors.map(i => ({
        id: i.id,
        name: i.name,
        status: i.status,
        approved: i.approved,
      })));
    } else {
      console.log('[ADMIN DASHBOARD AUDIT] instructors array is empty — check Firestore query and auth token.');
    }
  }, [instructors]);


  const filteredInstructors = showAll
    ? instructors.filter((inst) => {
        const name = (inst.name || '').toLowerCase();
        const email = (inst.email || '').toLowerCase();
        const specialty = (inst.specialty || '').toLowerCase();
        const query = (searchQuery || '').toLowerCase();

        const matchesSearch =
          name.includes(query) ||
          email.includes(query) ||
          specialty.includes(query);
        return matchesSearch;
      })
    : instructors.filter((inst) => {
        const name = (inst.name || '').toLowerCase();
        const email = (inst.email || '').toLowerCase();
        const specialty = (inst.specialty || '').toLowerCase();
        const query = (searchQuery || '').toLowerCase();

        const matchesSearch =
          name.includes(query) ||
          email.includes(query) ||
          specialty.includes(query);
        
        // Normalize status match
        const normalizedStatus = (inst.status || 'pending').toLowerCase();
        const isApproved = inst.approved === true || normalizedStatus === 'approved' || normalizedStatus === 'verified' || normalizedStatus === 'active';
        const isRejected = normalizedStatus === 'rejected';
        const targetStatus = filterStatus;
        
        let matchesStatus = false;
        if (targetStatus === 'approved') {
          matchesStatus = isApproved;
        } else if (targetStatus === 'pending') {
          matchesStatus = !isApproved && !isRejected;
        } else {
          matchesStatus = isRejected;
        }

        return matchesSearch && matchesStatus;
      });

  const pendingCount = instructors.filter(i => {
    const st = (i.status || '').toLowerCase();
    return !i.approved && st !== 'approved' && st !== 'verified' && st !== 'active' && st !== 'rejected';
  }).length;
  const approvedCount = instructors.filter(i => {
    const st = (i.status || '').toLowerCase();
    return i.approved === true || ['approved', 'verified', 'active'].includes(st);
  }).length;
  const rejectedCount = instructors.filter(i => (i.status || '').toLowerCase() === 'rejected').length;

  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstructorName || !newInstructorEmail) {
      toast.error('Please enter name and email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await instructorService.addInstructor(newInstructorName, newInstructorEmail, newInstructorSpecialty);
      toast.success(`Instructor account approved & onboarded for ${newInstructorName}!`);
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

  const handleApprove = async (id: string) => {
    const adminUid = userProfile?.uid || 'admin_action';
    try {
      await instructorService.approveInstructor(id, adminUid);
      toast.success('Instructor approved successfully!');
    } catch (e) {
      toast.error('Failed to approve instructor.');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;

    const adminUid = userProfile?.uid || 'admin_action';
    setIsSubmitting(true);
    try {
      await instructorService.rejectInstructor(rejectingId, adminUid, rejectionReason || 'Criteria mismatch');
      toast.success('Instructor application rejected.');
      setRejectingId(null);
      setRejectionReason('');
    } catch (e) {
      toast.error('Failed to reject instructor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white/95 dark:bg-slate-900 backdrop-blur-2xl border border-sky-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
              <span>Instructor Portal Approvals</span>
            </div>

            {/* Live Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>REAL-TIME LIVE DB SYNC</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Instructor Approval Dashboard ({instructors.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage pending instructor registrations, review applications, and toggle portal authorization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sky-700 dark:text-cyan-400 text-xs font-bold hover:bg-sky-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
            title="Force refresh from Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Approved Instructor</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/90 dark:bg-slate-900 border border-sky-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search instructors by name, email..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden transition-all font-medium"
            />
          </div>

          {/* Workflow Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => { setFilterStatus('pending'); setShowAll(false); }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                !showAll && filterStatus === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-sky-100 dark:border-slate-800'
              }`}
            >
              <span>Pending Requests</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${!showAll && filterStatus === 'pending' ? 'bg-white text-amber-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>{pendingCount}</span>
            </button>

            <button
              onClick={() => { setFilterStatus('approved'); setShowAll(false); }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                !showAll && filterStatus === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-sky-100 dark:border-slate-800'
              }`}
            >
              <span>Approved Instructors</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${!showAll && filterStatus === 'approved' ? 'bg-white text-emerald-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>{approvedCount}</span>
            </button>

            <button
              onClick={() => { setFilterStatus('rejected'); setShowAll(false); }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                !showAll && filterStatus === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-sky-100 dark:border-slate-800'
              }`}
            >
              <span>Rejected Instructors</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${!showAll && filterStatus === 'rejected' ? 'bg-white text-rose-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>{rejectedCount}</span>
            </button>

            <button
              onClick={() => setShowAll(!showAll)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                showAll
                  ? 'bg-slate-800 dark:bg-cyan-950 text-white dark:text-cyan-300 border border-transparent dark:border-cyan-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-sky-100 dark:border-slate-800'
              }`}
            >
              <span>Show All</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${showAll ? 'bg-white text-slate-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>{instructors.length}</span>
            </button>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Connecting to live instructor approvals database...</p>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs font-medium space-y-3 border border-dashed border-sky-200 rounded-2xl bg-slate-50/20">
            <GraduationCap className="w-12 h-12 text-sky-200 mx-auto" />
            <p className="text-slate-800 font-bold text-sm">
              {instructors.length === 0
                ? 'No instructors found in Firestore.'
                : `No instructors in "${showAll ? 'all' : filterStatus}" view.`
              }
            </p>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">
              {instructors.length === 0
                ? 'Instructors who register with role="instructor" will appear here in real time.'
                : `Total ${instructors.length} instructor(s) found — try switching tabs or click "Show All" to see them.`
              }
            </p>
            {instructors.length > 0 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-2 inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-slate-800 transition-all"
              >
                <span>Show All {instructors.length} Instructors</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredInstructors.map((inst) => {
              const appliedFormatted = inst.appliedDate 
                ? new Date(inst.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : inst.joined || 'Recently';

              return (
                <div
                  key={inst.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-sky-200/70 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden shadow-xs relative"
                >
                  {/* Status Top Strip */}
                  <div className={`h-1.5 w-full ${
                    inst.status === 'approved' || inst.status === 'Verified' ? 'bg-emerald-500' :
                    inst.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />

                  <div className="p-6 space-y-4 flex-1">
                    {/* Header info */}
                    <div className="flex items-start gap-4">
                      {inst.avatar ? (
                        <img
                          src={inst.avatar}
                          alt={inst.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-sky-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-cyan-400 font-bold text-lg flex items-center justify-center shrink-0 border border-sky-200 dark:border-slate-700">
                          {inst.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{inst.name}</h3>
                        <p className="text-[10px] text-sky-700 dark:text-cyan-400 font-bold uppercase tracking-wider mt-0.5">{inst.specialty}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{inst.email}</span>
                        </p>
                        {inst.phone && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{inst.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Meta/Skills section */}
                    <div className="pt-3 border-t border-sky-50 dark:border-slate-800 space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">Expertise Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {(inst.skills || ['Linux', 'Systems', 'DevOps']).slice(0, 3).map((s, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {s}
                            </span>
                          ))}
                          {(inst.skills || []).length > 3 && (
                            <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                              +{inst.skills!.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-sky-100/50 dark:border-slate-800">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mb-0.5">EXPERIENCE</span>
                          <span className="truncate block">{inst.experience || 'Not Specified'}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-sky-100/50 dark:border-slate-800">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mb-0.5">APPLIED DATE</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-sky-500" /> {appliedFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="bg-slate-50/80 dark:bg-slate-950/80 px-6 py-4 border-t border-sky-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingInstructor(inst)}
                      className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-bold text-sky-700 dark:text-cyan-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {filterStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(inst.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setRejectingId(inst.id)}
                            className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {filterStatus === 'approved' && (
                        <>
                          <button
                            onClick={() => setRejectingId(inst.id)}
                            className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-[11px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Revoke / Reject</span>
                          </button>
                        </>
                      )}

                      {filterStatus === 'rejected' && (
                        <>
                          <button
                            onClick={() => handleApprove(inst.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Re-Approve</span>
                          </button>
                        </>
                      )}

                      {/* Edit / Trash Actions */}
                      <button
                        onClick={() => setEditingInstructor(inst)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 text-sky-700 dark:text-cyan-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingInstructorId(inst.id)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: VIEW DETAILS */}
      {viewingInstructor && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-sky-200 dark:border-slate-800 animate-in zoom-in-95 text-slate-900 dark:text-white font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600 dark:text-cyan-400" /> Instructor Registration Profile
              </h3>
              <button onClick={() => setViewingInstructor(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {viewingInstructor.avatar ? (
                  <img src={viewingInstructor.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover border border-sky-200 dark:border-slate-700" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-700 dark:text-cyan-400 font-bold text-2xl flex items-center justify-center shrink-0">
                    {viewingInstructor.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">{viewingInstructor.name}</h4>
                  <p className="text-xs text-sky-700 dark:text-cyan-400 font-bold uppercase tracking-wider">{viewingInstructor.specialty}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{viewingInstructor.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-sky-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1">APPLICATION STATUS</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                    viewingInstructor.status === 'approved' || viewingInstructor.status === 'Verified' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                    viewingInstructor.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                    'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}>
                    {viewingInstructor.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-1">APPLIED DATE</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{viewingInstructor.appliedDate ? new Date(viewingInstructor.appliedDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              {viewingInstructor.status === 'rejected' && (
                <div className="bg-rose-50/50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/60 text-xs space-y-1.5">
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 font-extrabold flex items-center gap-1 uppercase"><AlertTriangle className="w-3.5 h-3.5" /> Rejection Audit Log</span>
                  {viewingInstructor.rejectionReason && (
                    <p className="text-rose-800 dark:text-rose-300 font-bold"><strong>Reason:</strong> &ldquo;{viewingInstructor.rejectionReason}&rdquo;</p>
                  )}
                  <p className="text-slate-600 dark:text-slate-400 font-medium"><strong>Rejected At:</strong> {viewingInstructor.rejectedAt ? new Date(viewingInstructor.rejectedAt).toLocaleString() : 'N/A'}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingInstructor(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENTER REJECTION REASON */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 border border-rose-200 dark:border-rose-900/60 font-['Sora'] text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-lg text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Reject Instructor Application
              </h3>
              <button onClick={() => setRejectingId(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason for Rejection</label>
                <textarea
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Portfolio does not meet minimum technical criteria or experience background not verified."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all font-medium h-24 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="py-2 px-4 rounded-xl border border-sky-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-5 rounded-xl disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Sending Notice...' : 'Reject Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD INSTRUCTOR */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 dark:border-slate-800 animate-in zoom-in-95 text-slate-900 dark:text-white font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-600 dark:text-cyan-400" /> Onboard Approved Instructor
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInstructor} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Instructor Full Name</label>
                <input
                  type="text"
                  required
                  value={newInstructorName}
                  onChange={(e) => setNewInstructorName(e.target.value)}
                  placeholder="Prof. Alan Turing"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newInstructorEmail}
                  onChange={(e) => setNewInstructorEmail(e.target.value)}
                  placeholder="alan@university.edu"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Specialty / Course Track</label>
                <input
                  type="text"
                  required
                  value={newInstructorSpecialty}
                  onChange={(e) => setNewInstructorSpecialty(e.target.value)}
                  placeholder="Linux Systems & Kernel Architecture"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-sky-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
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
                      <span>Onboarding...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Add & Approve</span>
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 dark:border-slate-800 animate-in zoom-in-95 text-slate-900 dark:text-white font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-600 dark:text-cyan-400" /> Edit Instructor Details
              </h3>
              <button onClick={() => setEditingInstructor(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.name}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingInstructor.email}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Specialty & Domain</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.specialty}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, specialty: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Verification Status</label>
                <select
                  value={editingInstructor.status}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, status: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden transition-all font-medium"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingInstructor(null)}
                  className="py-2.5 px-4 rounded-xl border border-sky-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 dark:border-rose-900/60 text-center font-['Sora'] text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Delete Instructor Account?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Are you sure you want to delete this instructor? This action will remove their account in real-time.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingInstructorId(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
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
