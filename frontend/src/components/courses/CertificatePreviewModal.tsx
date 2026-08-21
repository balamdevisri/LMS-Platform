import React, { useState } from 'react';
import { Award, Copy, Printer, Share2, X, Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Certificate } from '../../services/achievementService';
import { useAuth } from '@/contexts/AuthContext';

interface CertificatePreviewModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  certificate,
  onClose
}) => {
  const { user, userProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Dynamic student info fallback from auth context
  const dynamicStudentName = 
    certificate.studentName || 
    userProfile?.name || 
    user?.displayName || 
    'Student Learner';

  const dynamicStudentId = 
    certificate.studentId || 
    (user?.uid ? 'STU-' + user.uid.substring(0, 6).toUpperCase() : 'STU-9901');

  // Dynamic course title fallback from course mapping or certificate
  const courseTitleMap: Record<string, string> = {
    'course_linux_101': 'Linux Systems & Administration Mastery',
    'course_git_101': 'Git & GitHub Pro',
    'course_kubernetes_101': 'Kubernetes Engine Production Mastery',
    'course_react_101': 'Modern React Architecture',
    'course_c_101': 'Complete C Programming Masterclass',
    'course_python_101': 'Python 3 Programming Specialization',
    'course_java_101': 'Java SE 21 Enterprise Developer'
  };

  const dynamicCourseTitle = 
    certificate.courseTitle || 
    (certificate as any).courseName || 
    courseTitleMap[certificate.courseId?.toLowerCase()] || 
    'Mastering Enterprise Technology & Systems Architecture';

  const dynamicDate = certificate.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const safeVerificationId = certificate.verificationId || '';
  const verificationUrl = safeVerificationId
    ? `/api/certificates/verify/${safeVerificationId}?studentId=${dynamicStudentId}`
    : '';

  const downloadUrl = safeVerificationId
    ? `/api/certificates/download?certificateId=${safeVerificationId}&studentId=${dynamicStudentId}&studentName=${encodeURIComponent(dynamicStudentName)}&courseTitle=${encodeURIComponent(dynamicCourseTitle)}&completionDate=${encodeURIComponent(dynamicDate)}&courseId=${certificate.courseId}`
    : '';

  const previewUrl = safeVerificationId
    ? `/api/certificates/preview?certificateId=${safeVerificationId}&studentId=${dynamicStudentId}&studentName=${encodeURIComponent(dynamicStudentName)}&courseTitle=${encodeURIComponent(dynamicCourseTitle)}&completionDate=${encodeURIComponent(dynamicDate)}&courseId=${certificate.courseId}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`
    : '';

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(safeVerificationId || 'N/A');
      setCopied(true);
      toast.success('Certificate Verification ID copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error('Failed to copy ID.');
    }
  };

  const handleShare = () => {
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      toast.success('Shareable credential link generated & copied to clipboard!');
      navigator.clipboard.writeText(verificationUrl).catch(() => {});
    }, 1000);
  };

  const handlePrint = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-5 sm:p-8 max-w-5xl w-full shadow-2xl space-y-6 relative max-h-[95vh] flex flex-col justify-between font-['Sora']">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base sm:text-lg text-white">
                Official Enterprise Credential
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Verified Certificate of Completion for <span className="text-cyan-300 font-bold">{dynamicStudentName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Preview Frame (Display PDF directly) */}
        <div className="flex-1 flex items-center justify-center overflow-hidden bg-slate-950 border border-slate-800/80 rounded-2xl shadow-inner min-h-[450px] relative w-full h-full p-2">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full min-h-[500px] rounded-xl border-none"
              title="Certificate PDF Preview"
            />
          ) : (
            <div className="text-slate-400 text-sm">Loading certificate preview...</div>
          )}
        </div>

        {/* Modal Controls Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-400">Student ID: <span className="font-mono text-cyan-300">{dynamicStudentId}</span></span>
            <span className="text-slate-600">•</span>
            <span className="font-bold text-slate-400">Hash: <span className="font-mono text-white">{certificate.verificationId}</span></span>
            <button
              onClick={handleCopyId}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-800"
              title="Copy Certificate ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Hash'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(certificate.googleDriveLink || downloadUrl) && (
              <a
                href={certificate.googleDriveLink || downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            )}

            <button
              onClick={handleShare}
              disabled={sharing}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {sharing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 text-cyan-400" />
              )}
              <span>Share Credentials</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-5 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-sky-500/20"
            >
              <Printer className="w-4 h-4 fill-current" />
              <span>Print A4 Certificate / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
