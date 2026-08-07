import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Award, Calendar, User, BookOpen, Download, Loader2, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface VerifiedCertificate {
  certificateId: string;
  verificationId?: string;
  studentName: string;
  studentEmail?: string;
  courseName?: string;
  courseTitle?: string;
  instructorName?: string;
  issueDate?: string;
  completionDate?: string;
  status?: string;
  pdfUrl?: string;
}

export const VerifyCertificate: React.FC = () => {
  const { verificationId: routeParamId } = useParams<{ verificationId: string }>();
  const [searchParams] = useSearchParams();
  const certId = routeParamId || searchParams.get('id') || searchParams.get('certificateId') || '';

  const [loading, setLoading] = useState<boolean>(true);
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!certId) {
      setLoading(false);
      setError('No Verification ID provided.');
      return;
    }

    const fetchVerification = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/certificates/verify/${encodeURIComponent(certId)}`);
        const data = await response.json();
        if (response.ok && data.success && data.data) {
          setCertificate(data.data);
        } else {
          setError(data.error || 'Certificate Not Found');
        }
      } catch (err: any) {
        setError('Certificate Not Found');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [certId]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Top Header Logo */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-wide">SHAIVIKA LMS</h1>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Credential Verification</p>
            </div>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </a>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm font-medium text-slate-400">Verifying credential in SHAIVIKA registry...</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h2>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              The requested Verification ID <span className="font-mono text-amber-400 font-bold">{certId || 'N/A'}</span> could not be verified in the official SHAIVIKA LMS credential registry.
            </p>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 text-xs text-slate-400 max-w-md text-left">
              <p className="font-semibold text-slate-300 mb-1">Possible Reasons:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The verification URL or certificate ID is incorrect.</li>
                <li>The certificate has not yet been issued or registered.</li>
                <li>The credential may have been revoked or invalidated.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Verified Certificate Details */}
        {!loading && certificate && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Authenticity Verified</span>
                <h3 className="text-base font-bold text-white">Valid Official Credential</h3>
              </div>
            </div>

            {/* Credential Details Grid */}
            <div className="space-y-4 bg-slate-900/60 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Recipient Student</span>
                  <p className="text-base font-bold text-white">{certificate.studentName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-800 pt-3">
                <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Completed Course</span>
                  <p className="text-base font-bold text-white">{certificate.courseTitle || certificate.courseName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-800 pt-3">
                <Award className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Instructor / Board</span>
                  <p className="text-sm font-semibold text-slate-200">{certificate.instructorName || 'SHAIVIKA LMS Academic Board'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">Issue Date</span>
                    <p className="text-sm font-bold text-slate-200">{certificate.issueDate || certificate.completionDate}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Verification ID</span>
                  <p className="text-xs font-mono font-bold text-blue-400 truncate">{certificate.certificateId || certificate.verificationId}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`${API_BASE_URL}/certificates/download?certificateId=${certificate.certificateId}&studentId=${certificate.studentEmail || 'student'}&studentName=${encodeURIComponent(certificate.studentName)}&courseTitle=${encodeURIComponent(certificate.courseTitle || certificate.courseName || 'Course')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                <Download className="w-4 h-4" /> Download Official PDF
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-700/80 mt-8 pt-4 text-center text-xs text-slate-500">
          Powered by <strong className="text-slate-400">SHAIVIKA LMS</strong> &bull; Secure Credential Verification Engine
        </div>

      </div>
    </div>
  );
};

export default VerifyCertificate;
