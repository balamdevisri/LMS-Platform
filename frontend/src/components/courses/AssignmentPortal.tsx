import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowLeft,
  Download,
  FileCode,
  FileCheck,
  History,
  Calendar,
  Clock,
  Award,
  FileArchive,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import type {
  AssignmentSubmission,
  SubmittedFile,
  RubricScores
} from '@/services/assignmentService';

interface AssignmentPortalProps {
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  dueDate?: string; // ISO date string e.g. '2026-07-25T23:59:59Z'
  maxMarks?: number;
  passingMarks?: number;
  instructions?: string;
  description?: string;
  allowedTypes?: string[]; // e.g. ['.pdf', '.zip', '.sh', '.js', '.docx']
  maxFileSizeMB?: number;
  estTime?: string;
  onClose?: () => void;
}

export const AssignmentPortal: React.FC<AssignmentPortalProps> = ({
  assignmentId,
  assignmentTitle,
  courseId,
  dueDate = '2026-07-25T23:59:59Z', // default in the past for testing late submission
  maxMarks = 100,
  passingMarks = 70,
  instructions = 'Develop a ring-layered block map diagram outlining the concentric divisions of a typical Linux system (Hardware, Kernel, Shell, User space). Explain in detail how application processes communicate with system hardware via system call vectors. Test your command pathways using the live terminal lab.',
  description = 'Concentric Linux Layers Architecture and Shell Interaction Mechanics',
  allowedTypes = ['.pdf', '.docx', '.pptx', '.zip', '.sh', '.js', '.png', '.jpg'],
  maxFileSizeMB = 50,
  estTime = '45 mins',
  onClose
}) => {
  const { userProfile, user } = useAuth();
  const currentUserId = userProfile?.uid || user?.uid || 'default_student';
  const currentUserRole = userProfile?.role || 'student';
  const currentUserName = userProfile?.name || user?.displayName || 'Active Student';
  const currentUserEmail = userProfile?.email || user?.email || 'student@shaivika.edu';
  const currentUserPhoto = userProfile?.photoURL || user?.photoURL || '';

  const isInstructor = currentUserRole === 'instructor' || currentUserRole === 'admin';

  // --- STUDENT VIEW STATES ---
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<SubmittedFile[]>([]);
  const [commentText, setCommentText] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // --- INSTRUCTOR VIEW STATES ---
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [allSubmissions, setAllSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedFilePreview, setSelectedFilePreview] = useState<SubmittedFile | null>(null);

  // Grading states
  const [gradeMarks, setGradeMarks] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [resubmissionRequired, setResubmissionRequired] = useState<boolean>(false);
  
  // Rubric Scores
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({
    codeQuality: 16,
    documentation: 16,
    uiUx: 15,
    functionality: 18,
    testing: 15
  });

  // Load submissions
  useEffect(() => {
    loadSubmissionsData();
  }, [assignmentId, currentUserId]);

  const loadSubmissionsData = () => {
    if (isInstructor) {
      const subs = assignmentService.getAllSubmissions().filter(s => s.assignmentId === assignmentId);
      setAllSubmissions(subs);
      if (subs.length > 0 && !selectedSubmissionId) {
        setSelectedSubmissionId(subs[0].id);
      }
    } else {
      const sub = assignmentService.getStudentSubmission(assignmentId, currentUserId);
      setSubmission(sub);
      if (sub) {
        setUploadedFiles(sub.files);
        setCommentText(sub.comments);
      }
    }
  };

  // Sync selected submission for instructor preview
  const currentSelectedSubmission = allSubmissions.find(s => s.id === selectedSubmissionId);

  useEffect(() => {
    if (currentSelectedSubmission) {
      if (currentSelectedSubmission.files.length > 0) {
        setSelectedFilePreview(currentSelectedSubmission.files[0]);
      } else {
        setSelectedFilePreview(null);
      }
      setGradeMarks(currentSelectedSubmission.marksObtained || 80);
      setGradeFeedback(currentSelectedSubmission.feedback || '');
      setResubmissionRequired(currentSelectedSubmission.status === 'Resubmission Required');
      if (currentSelectedSubmission.rubricScores) {
        setRubricScores({
          codeQuality: currentSelectedSubmission.rubricScores.codeQuality.score,
          documentation: currentSelectedSubmission.rubricScores.documentation.score,
          uiUx: currentSelectedSubmission.rubricScores.uiUx.score,
          functionality: currentSelectedSubmission.rubricScores.functionality.score,
          testing: currentSelectedSubmission.rubricScores.testing.score
        });
      } else {
        setRubricScores({
          codeQuality: 16,
          documentation: 16,
          uiUx: 15,
          functionality: 18,
          testing: 15
        });
      }
    }
  }, [selectedSubmissionId, allSubmissions]);

  // Update total marks from rubric dynamically
  useEffect(() => {
    const total = Object.values(rubricScores).reduce((sum, v) => sum + v, 0);
    setGradeMarks(total);
  }, [rubricScores]);

  // --- FILE VALIDATION & PROGRESS SIMULATION ---
  const validateFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(ext)) {
      toast.error(`Invalid file type "${ext}". Allowed types: ${allowedTypes.join(', ')}`);
      return false;
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds limit of ${maxFileSizeMB}MB.`);
      return false;
    }
    return true;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      uploadFiles(files);
    }
  };

  const uploadFiles = (files: File[]) => {
    files.forEach(file => {
      if (!validateFile(file)) return;
      
      // Prevent duplicates
      if (uploadedFiles.some(f => f.name === file.name)) {
        toast.info(`File "${file.name}" is already uploaded.`);
        return;
      }

      // Simulate upload progress bar
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({ ...prev, [file.name]: Math.min(progress, 100) }));
        
        if (progress >= 100) {
          clearInterval(interval);
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            size: file.size,
            type: file.type
          }]);
          toast.success(`Uploaded "${file.name}" successfully.`);
        }
      }, 100);
    });
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadProgress(prev => {
      const copy = { ...prev };
      delete copy[fileName];
      return copy;
    });
    toast.info(`Removed "${fileName}".`);
  };

  // --- ACTIONS ---
  const handleSaveDraft = () => {
    const draft = assignmentService.saveDraft(
      assignmentId,
      assignmentTitle,
      courseId,
      {
        uid: currentUserId,
        fullName: currentUserName,
        email: currentUserEmail,
        photoURL: currentUserPhoto
      },
      uploadedFiles,
      commentText
    );
    setSubmission(draft);
    toast.success('Draft submission saved successfully!');
  };

  const handleSubmit = () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one file before submitting.');
      return;
    }
    const submitted = assignmentService.submitAssignment(
      assignmentId,
      assignmentTitle,
      courseId,
      {
        uid: currentUserId,
        fullName: currentUserName,
        email: currentUserEmail,
        photoURL: currentUserPhoto
      },
      uploadedFiles,
      commentText,
      dueDate
    );
    setSubmission(submitted);
    toast.success('🎉 Assignment submitted successfully for grading!');
  };

  const handleGradePublish = () => {
    if (!selectedSubmissionId || !currentSelectedSubmission) return;

    const scores: RubricScores = {
      codeQuality: { score: rubricScores.codeQuality, maxScore: 20 },
      documentation: { score: rubricScores.documentation, maxScore: 20 },
      uiUx: { score: rubricScores.uiUx, maxScore: 20 },
      functionality: { score: rubricScores.functionality, maxScore: 20 },
      testing: { score: rubricScores.testing, maxScore: 20 }
    };

    const status = resubmissionRequired ? 'Resubmission Required' : 'Graded';

    assignmentService.gradeSubmission(
      selectedSubmissionId,
      {
        marks: gradeMarks,
        feedback: gradeFeedback,
        rubricScores: scores,
        status
      },
      currentUserName
    );

    toast.success(
      status === 'Graded'
        ? `Published grade ${gradeMarks}/100 successfully.`
        : 'Assignment returned for student resubmission.'
    );

    loadSubmissionsData();
  };

  // --- FILTERED INSTRUCTOR LIST ---
  const filteredSubmissions = allSubmissions.filter(sub => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Submitted') return matchesSearch && sub.status === 'Submitted';
    if (statusFilter === 'Under Review') return matchesSearch && sub.status === 'Under Review';
    if (statusFilter === 'Graded') return matchesSearch && sub.status === 'Graded';
    if (statusFilter === 'Late') return matchesSearch && sub.isLate;
    if (statusFilter === 'Resubmission Required') return matchesSearch && sub.status === 'Resubmission Required';
    
    return matchesSearch;
  });

  // Calculate stats for badges
  const totalSubmissionCount = allSubmissions.length;
  const gradedCount = allSubmissions.filter(s => s.status === 'Graded').length;
  const pendingGradingCount = allSubmissions.filter(s => s.status === 'Submitted').length;

  // Lateness check
  const isCurrentlyLate = new Date() > new Date(dueDate);

  // Formatting utils
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (isoStr?: string): string => {
    if (!isoStr) return 'N/A';
    const date = new Date(isoStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-3xl overflow-hidden shadow-2xl space-y-0 w-full animate-in fade-in duration-300">
      {/* ------------------- HEADER TOOLBAR ------------------- */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
              {assignmentTitle}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Course Assignment Portal • {isInstructor ? 'Instructor Console' : 'Student Submission Workspace'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInstructor ? (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {gradedCount} / {totalSubmissionCount} Graded
              </span>
              {pendingGradingCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                  {pendingGradingCount} Pending
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`px-3 py-1 rounded-full border ${
                submission?.status === 'Graded'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : submission?.status === 'Submitted'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : submission?.status === 'Resubmission Required'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : submission?.status === 'Draft Saved'
                  ? 'bg-slate-50 text-slate-600 border-slate-200'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                {submission?.status || 'Not Started'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ------------------- MAIN PORTAL PANEL ------------------- */}
      {isInstructor ? (
        /* ======================== INSTRUCTOR GRADING WORKSPACE ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-160">
          
          {/* Submissions Sidebar (3 Cols) */}
          <aside className="lg:col-span-4 bg-white border-r border-slate-200 flex flex-col justify-between">
            <div>
              {/* Search & Filters */}
              <div className="p-4 border-b border-slate-100 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-hidden text-slate-800 font-medium"
                  />
                </div>
                
                {/* Status Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Submitted', 'Graded', 'Late', 'Resubmission Required'].map(filt => (
                    <button
                      key={filt}
                      onClick={() => setStatusFilter(filt)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        statusFilter === filt
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submissions List */}
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-120">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic text-xs">
                    No submissions found matching criteria.
                  </div>
                ) : (
                  filteredSubmissions.map(sub => {
                    const isSelected = sub.id === selectedSubmissionId;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubmissionId(sub.id)}
                        className={`p-4 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected ? 'bg-sky-50/70 border-l-4 border-sky-600' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {sub.studentAvatar ? (
                            <img
                              src={sub.studentAvatar}
                              alt={sub.studentName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-bold text-xs uppercase">
                              {sub.studentName.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-xs text-slate-800">{sub.studentName}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatDate(sub.submittedAt)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            sub.status === 'Graded'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sub.status === 'Submitted'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {sub.status}
                          </span>
                          
                          {sub.isLate && (
                            <span className="bg-rose-50 text-rose-700 text-[8px] font-extrabold uppercase px-1 py-0.5 rounded border border-rose-100 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                              <span>Late</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-[10px] text-slate-400 font-mono text-center">
              Verified Grading Console • Live Sync
            </div>
          </aside>

          {/* Grading Split Layout: Preview & Grade panel (9 Cols) */}
          <main className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 bg-slate-50 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {currentSelectedSubmission ? (
              <>
                {/* Left Panel: Previewer (7 Cols) */}
                <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="font-heading font-extrabold text-sm text-slate-900">
                          Submission Preview
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Click files below to preview content
                        </p>
                      </div>
                      
                      {currentSelectedSubmission.isLate && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                          <span>LATE SUBMISSION</span>
                        </div>
                      )}
                    </div>

                    {/* Files List Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Submitted Files</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentSelectedSubmission.files.map(file => {
                          const isSelected = selectedFilePreview?.name === file.name;
                          return (
                            <div
                              key={file.name}
                              onClick={() => setSelectedFilePreview(file)}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-white border-sky-600 shadow-xs'
                                  : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                {file.name.endsWith('.zip') ? (
                                  <FileArchive className="w-5 h-5 text-indigo-500 shrink-0" />
                                ) : file.name.endsWith('.sh') || file.name.endsWith('.js') ? (
                                  <FileCode className="w-5 h-5 text-emerald-500 shrink-0" />
                                ) : (
                                  <FileText className="w-5 h-5 text-sky-500 shrink-0" />
                                )}
                                <div className="overflow-hidden">
                                  <p className="font-bold text-xs text-slate-800 truncate">{file.name}</p>
                                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">{formatBytes(file.size)}</p>
                                </div>
                              </div>
                              <button
                                title="Download File"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success(`Downloading file "${file.name}"...`);
                                }}
                                className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive File Preview Canvas */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">File Previewer Canvas</label>
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-60 max-h-80 overflow-auto font-mono text-xs text-slate-300 leading-relaxed shadow-inner relative">
                        {selectedFilePreview ? (
                          <>
                            <div className="border-b border-slate-800 pb-2 mb-3 text-[10px] text-slate-500 flex items-center justify-between">
                              <span>PREVIEW: {selectedFilePreview.name}</span>
                              <span className="text-emerald-400">Validated Secure Check</span>
                            </div>
                            {selectedFilePreview.name.endsWith('.pdf') ? (
                              <div className="text-center py-8 space-y-3 font-sans text-slate-400">
                                <FileText className="w-12 h-12 text-slate-500 mx-auto" />
                                <div>
                                  <h5 className="font-bold text-slate-200">Linux concentric layers Ring Map Report</h5>
                                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">Concentric layered ring structure mapping out Hardware vectors, system calls, shell translation layers, and User utilities.</p>
                                </div>
                                <button className="px-3 py-1 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-700 cursor-pointer">
                                  Open Report PDF Reader
                                </button>
                              </div>
                            ) : selectedFilePreview.name.endsWith('.zip') ? (
                              <div className="space-y-2 text-[11px]">
                                <div className="text-slate-500 mb-1">Archive Contents Listing:</div>
                                <div className="text-indigo-400">📦 concentric_layers_report.zip</div>
                                <div className="pl-4 text-slate-300">├── 📄 ring_model_diagram.png (920 KB)</div>
                                <div className="pl-4 text-slate-300">├── 📄 system_calls_audit.txt (12 KB)</div>
                                <div className="pl-4 text-slate-300">└── 📄 run_diagnostic.sh (4 KB)</div>
                              </div>
                            ) : selectedFilePreview.name.endsWith('.sh') ? (
                              <pre className="text-[11px] leading-relaxed text-emerald-400">
{`#!/bin/bash
# concentric_layers_diagnostic.sh
# Validates system interface mapping configurations

echo "--- Linux Layer Diagnostics Started ---"
echo "Checking User Utilities layer..."
which bash grep sed awk || echo "Warning: missing tools"

echo "Checking Kernel interface connection..."
uname -a && uptime

echo "Executing system call vector validations..."
strace -c ls -l /etc > /dev/null

echo "Diagnostics complete."`}
                              </pre>
                            ) : (
                              <div className="text-slate-400 italic text-[11px]">
                                Mock content preview: Simulated visualization ready. File format parsing successfully verified for "{selectedFilePreview.name}".
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12 text-slate-500 font-sans italic text-xs">
                            Select a submitted file above to parse local preview
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Student Submission Comments */}
                    {currentSelectedSubmission.comments && (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-3xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Student Submission Note</span>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                          "{currentSelectedSubmission.comments}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Grading Pane (5 Cols) */}
                <div className="md:col-span-5 p-6 bg-white border-t md:border-t-0 md:border-l border-slate-200 space-y-6">
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
                      Evaluator Grading Sheet
                    </h3>
                  </div>

                  {/* Rubric Breakdown */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Optional Rubric Criteria (Max 20 each)</label>
                    <div className="space-y-3">
                      {[
                        { key: 'codeQuality', label: 'Code Quality & Design' },
                        { key: 'documentation', label: 'Documentation & Notes' },
                        { key: 'uiUx', label: 'UI/UX Ring Model Mapping' },
                        { key: 'functionality', label: 'Functionality & Correctness' },
                        { key: 'testing', label: 'Testing & Verification' }
                      ].map(rub => (
                        <div key={rub.key} className="space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span>{rub.label}</span>
                            <span className="font-mono text-slate-900">{rubricScores[rub.key]} / 20</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={rubricScores[rub.key]}
                            onChange={(e) => setRubricScores(prev => ({
                              ...prev,
                              [rub.key]: parseInt(e.target.value) || 0
                            }))}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marks Obtained Input */}
                  <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Total Score Calculation</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        gradeMarks >= passingMarks
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {gradeMarks >= passingMarks ? 'Passing' : 'Below Passing'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading font-extrabold text-2xl text-slate-950">{gradeMarks}</span>
                      <span className="text-xs text-slate-400 font-bold">/ 100 Marks</span>
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Written Feedback Comments</label>
                    <textarea
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      placeholder="Type written suggestions for the student..."
                      rows={3}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                    />
                  </div>

                  {/* Return for Resubmission */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-slate-800">Resubmission Required</label>
                      <p className="text-[10px] text-slate-400 font-medium">Return assignment to student for updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={resubmissionRequired}
                      onChange={(e) => setResubmissionRequired(e.target.checked)}
                      className="w-4 h-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </div>

                  {/* Publish grades */}
                  <button
                    onClick={handleGradePublish}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs transition-all shadow-lg hover:shadow-slate-800/10 cursor-pointer"
                  >
                    {resubmissionRequired ? 'Return for Resubmission' : 'Publish Grade & Comments'}
                  </button>
                </div>
              </>
            ) : (
              <div className="md:col-span-12 p-12 text-center text-slate-400 italic text-xs">
                Select a submission from the sidebar list to grade
              </div>
            )}
          </main>
        </div>
      ) : (
        /* ======================== STUDENT WORKSPACE ======================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-140 bg-white">
          
          {/* Left Column: Assignment Details & Instructions (5 Cols) */}
          <section className="lg:col-span-5 p-6 sm:p-8 bg-slate-50 border-r border-slate-200 space-y-6">
            <div className="space-y-1.5 border-b border-slate-200 pb-4">
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                Assignment Details
              </h2>
              {description && (
                <p className="text-xs text-slate-700 font-bold">
                  {description}
                </p>
              )}
              {estTime && (
                <p className="text-[11px] text-slate-400 font-medium">
                  Estimated Completion: {estTime}
                </p>
              )}
            </div>

            {/* Params block */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Due Date Deadline</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {formatDate(dueDate)}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Passing Threshold</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  {passingMarks} / {maxMarks} Marks ({Math.round((passingMarks/maxMarks)*100)}%)
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Allowed File Formats</span>
                <span className="font-bold text-slate-800 font-mono text-[10px] truncate block">
                  {allowedTypes.join(', ')}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Max File Size Limit</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {maxFileSizeMB} MB per file
                </span>
              </div>
            </div>

            {/* Prompt Instructions */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Prompt Instructions</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {instructions}
              </p>
            </div>

            {/* Timeline history */}
            {submission && submission.history.length > 0 && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Submission Timeline Logs</span>
                </h4>
                <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-4">
                  {submission.history.map((ev, i) => (
                    <div key={i} className="relative text-xs">
                      <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-slate-300 border border-white" />
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{ev.status}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{formatDate(ev.timestamp)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">By {ev.user}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Upload Canvas & Submission Status (7 Cols) */}
          <main className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            
            {/* Lateness Alert */}
            {isCurrentlyLate && !submission?.submittedAt && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs font-semibold animate-pulse">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p>Attention: Assignment is past due deadline ({formatDate(dueDate)})</p>
                  <p className="text-[10px] text-rose-600 mt-0.5 font-medium">Your submission will be flagged as Late.</p>
                </div>
              </div>
            )}

            {/* Submission workspace */}
            {submission?.status === 'Graded' ? (
              /* GRADED REVIEW VIEW */
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
                  <div className="flex items-center gap-3 border-b border-emerald-200 pb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h3 className="font-heading font-extrabold text-base text-emerald-900 leading-tight">
                        Assignment Evaluated & Graded
                      </h3>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        Published by Instructor on {formatDate(submission.gradedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Marks Secured</span>
                      <span className="font-heading font-extrabold text-lg text-slate-900">{submission.marksObtained} / 100</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Percentage Grade</span>
                      <span className="font-heading font-extrabold text-lg text-slate-900">{submission.marksObtained}%</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Status</span>
                      <span className={`font-heading font-extrabold text-sm uppercase block mt-0.5 ${
                        (submission.marksObtained || 0) >= submission.passingMarks
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}>
                        {(submission.marksObtained || 0) >= submission.passingMarks ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>

                  {submission.feedback && (
                    <div className="p-4 rounded-xl bg-white border border-emerald-100 text-xs text-slate-700 space-y-1.5 leading-relaxed font-medium">
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">Instructor Comments</span>
                      <p className="italic">"{submission.feedback}"</p>
                    </div>
                  )}
                </div>

                {/* Rubric Details */}
                {submission.rubricScores && (
                  <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 uppercase">
                      <FileCheck className="w-4 h-4 text-emerald-500" />
                      <span>Detailed Rubric Evaluation Breakdown</span>
                    </h4>
                    <div className="space-y-2.5 divide-y divide-slate-100">
                      {[
                        { key: 'codeQuality', label: 'Code Quality & Design' },
                        { key: 'documentation', label: 'Documentation & Notes' },
                        { key: 'uiUx', label: 'UI/UX concentric Ring Model' },
                        { key: 'functionality', label: 'Functionality & Correctness' },
                        { key: 'testing', label: 'Testing & Verification' }
                      ].map(rub => {
                        const scoreObj = (submission.rubricScores as any)[rub.key];
                        return (
                          <div key={rub.key} className="flex items-center justify-between text-xs py-2">
                            <span className="font-bold text-slate-700">{rub.label}</span>
                            <span className="font-mono text-slate-950 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                              {scoreObj?.score} / {scoreObj?.maxScore}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* SUBMISSION WORKSPACE (DRAFT/RESUBMIT/NOT STARTED) */
              <div className="space-y-6">
                
                {/* Status message */}
                {submission?.status === 'Resubmission Required' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-start gap-3 text-xs leading-relaxed font-medium">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Resubmission Requested by Evaluator</p>
                      <p className="mt-0.5 text-amber-700">"{submission.feedback}"</p>
                    </div>
                  </div>
                )}

                {/* Upload drag drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                    dragOver
                      ? 'border-sky-500 bg-sky-50/50'
                      : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 shadow-3xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Drag & drop files here, or click to browse</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      Formats: {allowedTypes.join(', ')} • Max size: {maxFileSizeMB}MB
                    </p>
                  </div>
                </div>

                {/* Upload Progress Listings */}
                {Object.keys(uploadProgress).some(name => uploadProgress[name] < 100) && (
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Uploading Files</label>
                    <div className="space-y-2">
                      {Object.keys(uploadProgress).map(name => {
                        const prog = uploadProgress[name];
                        if (prog >= 100) return null;
                        return (
                          <div key={name} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                              <span className="truncate max-w-xs">{name}</span>
                              <span className="font-mono text-slate-500">{prog}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                              <div className="bg-sky-600 h-1 transition-all duration-100" style={{ width: `${prog}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Uploaded Files items */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Uploaded Files ({uploadedFiles.length})</label>
                    <div className="space-y-2">
                      {uploadedFiles.map(file => (
                        <div
                          key={file.name}
                          className="p-3.5 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 shadow-3xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {file.name.endsWith('.zip') ? (
                              <FileArchive className="w-5 h-5 text-indigo-500 shrink-0" />
                            ) : file.name.endsWith('.sh') || file.name.endsWith('.js') ? (
                              <FileCode className="w-5 h-5 text-emerald-500 shrink-0" />
                            ) : (
                              <FileText className="w-5 h-5 text-sky-500 shrink-0" />
                            )}
                            <div className="overflow-hidden">
                              <p className="font-bold text-xs text-slate-800 truncate">{file.name}</p>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{formatBytes(file.size)}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeFile(file.name)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission comment text */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Submission Comments (Optional)</label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Provide any comments or instructions for the instructor..."
                    rows={3}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium text-slate-800"
                  />
                </div>

                {/* Actions container */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-150 pt-4">
                  <button
                    onClick={handleSaveDraft}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-slate-800/10 cursor-pointer"
                  >
                    Submit Assignment
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
