import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Mail, Plus, CheckCircle2, X, Loader2, Edit, Trash2, ShieldAlert, Radio, Eye, Database } from 'lucide-react';
import { toast } from 'sonner';
import { studentService, type StudentUser } from '@/services/studentService';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [inspectStudent, setInspectStudent] = useState<StudentUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Adding Student
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // Subscribe to Real-Time Students Updates from Firestore & DB
  useEffect(() => {
    setLoading(true);
    const unsubscribe = studentService.subscribeToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredStudents = students.filter(
    (st) =>
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) {
      toast.error('Please enter student name and email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await studentService.addStudent(newStudentName, newStudentEmail);
      toast.success(`Real-time student account created for ${newStudentName}!`);
      setModalOpen(false);
      setNewStudentName('');
      setNewStudentEmail('');
    } catch (e) {
      toast.error('Failed to register student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      await studentService.updateStudent(editingStudent);
      toast.success(`Student ${editingStudent.name} updated in real-time!`);
      setEditingStudent(null);
    } catch (e) {
      toast.error('Failed to update student profile.');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const target = students.find((st) => st.id === id);
    try {
      await studentService.deleteStudent(id);
      toast.success(`Student ${target?.name || 'account'} deleted!`);
    } catch (e) {
      toast.error('Failed to delete student.');
    } finally {
      setDeletingStudentId(null);
    }
  };

  const toggleStudentStatus = async (st: StudentUser) => {
    const updated: StudentUser = {
      ...st,
      status: st.status === 'Active' ? 'Suspended' : 'Active',
    };
    try {
      await studentService.updateStudent(updated);
      toast.info(`Student status set to ${updated.status}`);
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
              <UserCheck className="w-3.5 h-3.5 text-sky-500" />
              <span>Student Account Management</span>
            </div>
            
            {/* Live Real-time Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>REAL-TIME LIVE DB SYNC</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Real-Time Student User Directory ({students.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitor real-time registered students, active Firebase accounts, edit credentials, and manage platform permissions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
        
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active real-time students..."
              className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
            />
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Showing {filteredStudents.length} of {students.length} Live Students</span>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto pt-2">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Connecting to real-time student database...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-medium">
              No students found matching "{searchQuery}".
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sky-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Enrolled Tracks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      {st.photoURL ? (
                        <img src={st.photoURL} alt={st.name} className="w-8 h-8 rounded-full object-cover border border-sky-300" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-xs border border-sky-200">
                          {st.name.charAt(0)}
                        </div>
                      )}
                      <span>{st.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-500" />
                        <span>{st.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-mono font-bold uppercase border border-sky-200">
                        {st.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-bold font-mono">{st.courses} Track(s)</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleStudentStatus(st)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          st.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {st.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px]">{st.joined}</td>
                    
                    {/* ACTIONS COLUMN */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectStudent(st)}
                          className="p-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer"
                          title="Inspect Firebase Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingStudent(st)}
                          className="p-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer"
                          title="Edit Student Profile"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingStudentId(st.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                          title="Delete Student Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: ADD STUDENT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" /> Register Real-Time Student Account
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Jane Devson"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="jane@university.edu"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Register Student</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-600" /> Edit Real-Time Student Profile
              </h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4 font-medium text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Enrolled Courses Count</label>
                <input
                  type="number"
                  min="0"
                  value={editingStudent.courses}
                  onChange={(e) => setEditingStudent({ ...editingStudent, courses: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Account Status</label>
                <select
                  value={editingStudent.status}
                  onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as 'Active' | 'Suspended' })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
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
      {deletingStudentId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 text-center font-['Sora']">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">Delete Student Account?</h3>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to delete this student account? This action will remove student enrollment records in real time.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingStudentId(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(deletingStudentId)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT FIREBASE RECORD DETAILS */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-600" /> Firebase Student Record Details
              </h3>
              <button onClick={() => setInspectStudent(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div className="flex items-center gap-3 p-3 bg-sky-50/80 rounded-2xl border border-sky-100">
                {inspectStudent.photoURL ? (
                  <img src={inspectStudent.photoURL} alt={inspectStudent.name} className="w-12 h-12 rounded-full object-cover border-2 border-sky-400" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-sky-600 text-white font-extrabold text-base flex items-center justify-center border-2 border-sky-400">
                    {inspectStudent.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900">{inspectStudent.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{inspectStudent.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                    {inspectStudent.status} Student Account
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
                <span className="text-slate-500">Firestore Document ID</span>
                <span className="font-mono text-sky-700 font-bold text-[11px] truncate max-w-50">{inspectStudent.id}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
                <span className="text-slate-500">Account Role</span>
                <span className="font-mono text-slate-900 font-bold uppercase">{inspectStudent.role}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
                <span className="text-slate-500">Enrolled Tracks</span>
                <span className="font-bold text-sky-600">{inspectStudent.courses} Active Course Track(s)</span>
              </div>

              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
                <span className="text-slate-500">Registration Date</span>
                <span className="font-medium text-slate-800">{inspectStudent.joined}</span>
              </div>

              {inspectStudent.lastLogin && (
                <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
                  <span className="text-slate-500">Last Login Activity</span>
                  <span className="font-medium text-slate-800">{new Date(inspectStudent.lastLogin).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectStudent(null)}
                className="btn-blue-primary text-xs py-2 px-5 font-bold cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminStudents;
