import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  BookOpen,
  ShieldCheck,
  BarChart3,
  PlusCircle,
  GraduationCap,
  UserCheck,
  ChevronRight,
  UserPlus,
  Award,
  CheckCircle2,
  X,
  Plus,
  Sliders,
  ArrowRight,
  Edit,
  Trash2,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { studentService, type StudentUser } from '@/services/studentService';
import { instructorService, type InstructorUser } from '@/services/instructorService';

export const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();

  // Quick Modal States
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Edit / Delete States
  const [editingInstructor, setEditingInstructor] = useState<InstructorUser | null>(null);
  const [deletingInstructorId, setDeletingInstructorId] = useState<string | null>(null);

  const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Form States for Add Instructor
  const [instName, setInstName] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instSpecialty, setInstSpecialty] = useState('Linux & System Architecture');

  // Form States for Add Student
  const [studName, setStudName] = useState('');
  const [studEmail, setStudEmail] = useState('');
  const [studTrack, setStudTrack] = useState('Linux Systems & Administration Mastery');

  // Real-Time Datasets
  const [studentsList, setStudentsList] = useState<StudentUser[]>([]);
  const [instructorsList, setInstructorsList] = useState<InstructorUser[]>([]);

  useEffect(() => {
    const unsubStudents = studentService.subscribeToStudents((data) => {
      setStudentsList(data);
    });
    const unsubInstructors = instructorService.subscribeToInstructors((data) => {
      setInstructorsList(data);
    });
    return () => {
      unsubStudents();
      unsubInstructors();
    };
  }, []);

  const metrics = [
    { label: 'Total Registered Students', value: `${studentsList.length} Active`, icon: Users, change: 'Live Real-Time Sync', link: '/admin/students' },
    { label: 'Active Course Tracks', value: '1 Course Active', icon: BookOpen, change: 'Linux & System Admin', link: '/admin/courses' },
    { label: 'Verified Instructors', value: `${instructorsList.length} Faculty`, icon: GraduationCap, change: 'Live Real-Time Sync', link: '/admin/instructors' },
    { label: 'System Health', value: '99.98%', icon: ShieldCheck, change: 'All AI services online', link: '/admin/dashboard' },
  ];

  // Handlers - Instructor
  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName || !instEmail) {
      toast.error('Please fill in instructor name and email.');
      return;
    }
    try {
      await instructorService.addInstructor(instName, instEmail, instSpecialty);
      setIsInstructorModalOpen(false);
      setInstName('');
      setInstEmail('');
      toast.success(`Instructor ${instName} added in real time!`);
    } catch (e) {
      toast.error('Failed to add instructor.');
    }
  };

  const handleUpdateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;
    try {
      await instructorService.updateInstructor(editingInstructor);
      setEditingInstructor(null);
      toast.success('Instructor profile updated in real time!');
    } catch (e) {
      toast.error('Failed to update instructor.');
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    try {
      await instructorService.deleteInstructor(id);
      setDeletingInstructorId(null);
      toast.success('Instructor account deleted in real time!');
    } catch (e) {
      toast.error('Failed to delete instructor.');
    }
  };

  // Handlers - Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studName || !studEmail) {
      toast.error('Please fill in student name and email.');
      return;
    }
    try {
      await studentService.addStudent(studName, studEmail);
      setIsStudentModalOpen(false);
      setStudName('');
      setStudEmail('');
      toast.success(`Student ${studName} registered in real time!`);
    } catch (err) {
      toast.error('Failed to register student.');
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await studentService.updateStudent(editingStudent);
      setEditingStudent(null);
      toast.success('Student profile updated in real time!');
    } catch (err) {
      toast.error('Failed to update student profile.');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await studentService.deleteStudent(id);
      setDeletingStudentId(null);
      toast.success('Student account deleted in real time!');
    } catch (err) {
      toast.error('Failed to delete student.');
    }
  };

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              <span>ADMINISTRATOR CONTROL PANEL</span>
            </div>
            
            {/* Live Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>REAL-TIME LIVE DATA</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Welcome back, {userProfile?.name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage real-time student accounts, faculty members, course tracks, and platform permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/courses"
            className="btn-blue-primary text-xs py-2.5 px-4 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Courses</span>
          </Link>
          <Link
            to="/admin/instructors"
            className="bg-white hover:bg-sky-50 text-slate-800 font-bold text-xs border border-sky-200 py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4 text-sky-600" />
            <span>Instructors ({instructorsList.length})</span>
          </Link>
          <Link
            to="/admin/students"
            className="bg-white hover:bg-sky-50 text-slate-800 font-bold text-xs border border-sky-200 py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Students ({studentsList.length})</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Link
              key={idx}
              to={metric.link}
              className="p-5 rounded-2xl bg-white/90 border border-sky-200/80 backdrop-blur-xl space-y-2 hover:border-sky-400 hover:shadow-md transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">{metric.label}</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="font-heading font-extrabold text-2xl text-slate-900">{metric.value}</div>
              <div className="flex items-center justify-between text-[11px] text-sky-700 font-medium">
                <span>{metric.change}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* DEDICATED MANAGEMENT OPTIONS HUB */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-600" />
            <h2 className="font-heading font-extrabold text-xl text-slate-900">
              Admin Operations & Live Management Controls
            </h2>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-Time DB Sync Active
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 1. REAL-TIME INSTRUCTOR MANAGEMENT PANEL */}
          <div className="bg-white/95 border border-sky-200/80 rounded-3xl p-6 space-y-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">Real-Time Instructor Management</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Live registered faculty members from Firebase</p>
                </div>
              </div>

              <Link
                to="/admin/instructors"
                className="text-xs text-sky-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                Full Console <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Action Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsInstructorModalOpen(true)}
                className="p-3.5 rounded-2xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200/80 text-left transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-white text-sky-600 flex items-center justify-center border border-sky-200 mb-2 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Add New Instructor</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Onboard new faculty member</div>
              </button>

              <Link
                to="/admin/instructors"
                className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-sky-50/80 border border-slate-200/80 hover:border-sky-200 text-left transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-white text-sky-600 flex items-center justify-center border border-slate-200 mb-2 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Verify & Approve</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{instructorsList.length} Active Faculty</div>
              </Link>
            </div>

            {/* Faculty List Preview with Edit & Delete */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Real-Time Faculty Roster ({instructorsList.length})</span>
                <span className="text-[10px] text-emerald-600 font-bold">● Live Sync</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {instructorsList.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-medium">
                    No faculty members found in database.
                  </div>
                ) : (
                  instructorsList.map((inst) => (
                    <div key={inst.id} className="p-3 rounded-2xl bg-slate-50 border border-sky-100 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{inst.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            inst.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inst.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{inst.specialty}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingInstructor(inst)}
                          className="p-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer"
                          title="Edit Instructor"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingInstructorId(inst.id)}
                          className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                          title="Delete Instructor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 2. REAL-TIME STUDENT MANAGEMENT PANEL */}
          <div className="bg-white/95 border border-sky-200/80 rounded-3xl p-6 space-y-5 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">Real-Time Student Management</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Live registered students from Firebase</p>
                </div>
              </div>

              <Link
                to="/admin/students"
                className="text-xs text-sky-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                Full Console <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Action Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="p-3.5 rounded-2xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200/80 text-left transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-white text-sky-600 flex items-center justify-center border border-sky-200 mb-2 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Register Real-Time Student</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Add new student account</div>
              </button>

              <Link
                to="/admin/students"
                className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-sky-50/80 border border-slate-200/80 hover:border-sky-200 text-left transition-all group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-white text-sky-600 flex items-center justify-center border border-slate-200 mb-2 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Award className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900">Live Directory</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{studentsList.length} Active Accounts</div>
              </Link>
            </div>

            {/* Student List Preview with Edit & Delete */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Real-Time Student Roster ({studentsList.length})</span>
                <span className="text-[10px] text-emerald-600 font-bold">● Live Sync</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {studentsList.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs font-medium">
                    No registered students found in database.
                  </div>
                ) : (
                  studentsList.map((st) => (
                    <div key={st.id} className="p-3 rounded-2xl bg-slate-50 border border-sky-100 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{st.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({st.joined})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{st.email}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
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
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AI System Health & Parameters */}
      <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            <span>AI Tutor Engine Metrics</span>
          </h3>
          <span className="text-xs bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full font-bold border border-sky-200">
            Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-medium">
          <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
            <span className="text-slate-600">Model Version</span>
            <span className="font-mono text-sky-700 font-bold">Kaizen Q v3.0</span>
          </div>
          <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
            <span className="text-slate-600">Average Latency</span>
            <span className="font-mono text-emerald-600 font-bold">142ms</span>
          </div>
          <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
            <span className="text-slate-600">Automated Precision</span>
            <span className="font-mono text-sky-700 font-bold">99.8%</span>
          </div>
        </div>
      </div>

      {/* MODAL: QUICK ADD INSTRUCTOR */}
      {isInstructorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-600" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900">Add New Instructor</h3>
              </div>
              <button
                onClick={() => setIsInstructorModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInstructor} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  placeholder="e.g. Dr. Alan Turing"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={instEmail}
                  onChange={(e) => setInstEmail(e.target.value)}
                  placeholder="alan@university.edu"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Specialty & Domain</label>
                <input
                  type="text"
                  value={instSpecialty}
                  onChange={(e) => setInstSpecialty(e.target.value)}
                  placeholder="Linux Systems & Architecture"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInstructorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer"
                >
                  Create Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INSTRUCTOR */}
      {editingInstructor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-600" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900">Edit Instructor Details</h3>
              </div>
              <button
                onClick={() => setEditingInstructor(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Instructor Name</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.name}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, name: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingInstructor.email}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, email: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Specialty & Domain</label>
                <input
                  type="text"
                  value={editingInstructor.specialty}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, specialty: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Status</label>
                <select
                  value={editingInstructor.status}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInstructor(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
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

      {/* MODAL: DELETE INSTRUCTOR CONFIRMATION */}
      {deletingInstructorId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 text-center font-['Sora']">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">Delete Instructor?</h3>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to delete this instructor from the platform?
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
                Delete Instructor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QUICK REGISTER STUDENT */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900">Register Real-Time Student</h3>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={studName}
                  onChange={(e) => setStudName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={studEmail}
                  onChange={(e) => setStudEmail(e.target.value)}
                  placeholder="alex.j@stanford.edu"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Initial Track Enrollment</label>
                <select
                  value={studTrack}
                  onChange={(e) => setStudTrack(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                >
                  <option value="Linux Systems & Administration Mastery">Linux Systems & Administration Mastery</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-600" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900">Edit Real-Time Student Details</h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Status</label>
                <select
                  value={editingStudent.status}
                  onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
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

      {/* MODAL: DELETE STUDENT CONFIRMATION */}
      {deletingStudentId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 text-center font-['Sora']">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">Delete Student Account?</h3>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to delete this student account in real time?
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
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
