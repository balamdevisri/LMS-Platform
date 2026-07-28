import React, { useState } from 'react';
import { Award, Download, Copy, Printer, Share2, X, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';
import type { Certificate } from '../../services/achievementService';

interface CertificatePreviewModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  certificate,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const verificationUrl = `https://verify.kaizenq.edu/credentials/${certificate.verificationId}`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(certificate.verificationId);
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
      toast.success('Shareable credential URL generated and copied to clipboard!');
      navigator.clipboard.writeText(verificationUrl).catch(() => {});
    }, 1200);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate - ${certificate.courseTitle}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Sora:wght@400;600;800&display=swap');
              body {
                margin: 0;
                padding: 20px;
                background-color: #f8fafc;
                font-family: 'Sora', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 90vh;
              }
              .cert-container {
                width: 842px;
                height: 595px;
                background: white;
                border: 24px solid #0f172a;
                box-sizing: border-box;
                padding: 40px;
                position: relative;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
              }
              .cert-inner {
                border: 2px solid #fbbf24;
                height: 100%;
                width: 100%;
                box-sizing: border-box;
                padding: 30px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .branding {
                font-size: 16px;
                font-weight: 800;
                letter-spacing: 0.1em;
                color: #0f172a;
                text-transform: uppercase;
              }
              .cert-title {
                font-family: 'Playfair Display', serif;
                font-size: 32px;
                font-weight: 700;
                color: #b45309;
                margin: 10px 0 0 0;
              }
              .cert-subtitle {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #64748b;
                margin: 5px 0 0 0;
              }
              .recipient-label {
                font-size: 11px;
                color: #64748b;
                font-style: italic;
                margin-top: 15px;
              }
              .recipient-name {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 700;
                color: #0f172a;
                border-bottom: 2px solid #e2e8f0;
                display: inline-block;
                padding-bottom: 5px;
                min-width: 300px;
                margin: 10px auto;
              }
              .cert-text {
                font-size: 12px;
                color: #475569;
                line-height: 1.6;
                max-width: 500px;
                margin: 10px auto 0 auto;
                font-weight: 500;
              }
              .course-name {
                font-weight: 700;
                color: #0f172a;
              }
              .footer-signatures {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 30px;
              }
              .sig-block {
                width: 180px;
                text-align: center;
              }
              .sig-line {
                border-top: 1px solid #cbd5e1;
                margin-top: 8px;
                padding-top: 5px;
                font-size: 9px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .sig-name {
                font-size: 11px;
                font-weight: 700;
                color: #1e293b;
              }
              .cert-seal {
                width: 70px;
                height: 70px;
                background: radial-gradient(circle, #fcd34d 0%, #fbbf24 100%);
                border: 4px double #d97706;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                font-weight: 800;
                color: #78350f;
                text-transform: uppercase;
                box-shadow: 0 4px 10px rgba(217, 119, 6, 0.15);
              }
              .cert-meta {
                position: absolute;
                bottom: 15px;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
                padding: 0 50px;
                font-size: 8px;
                font-weight: 750;
                color: #94a3b8;
                font-family: monospace;
              }
              @media print {
                body {
                  background: white;
                  padding: 0;
                }
                .cert-container {
                  box-shadow: none;
                  border-color: #0f172a !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="cert-container">
              <div class="cert-inner">
                <div>
                  <div class="branding">Kaizen Q Academy</div>
                  <div class="cert-title">Certificate of Completion</div>
                  <div class="cert-subtitle">Verified Professional Academic Credential</div>
                </div>

                <div>
                  <div class="recipient-label">This credential is proudly presented to</div>
                  <div class="recipient-name">${certificate.studentName}</div>
                  <div class="cert-text">
                    for successfully mastering all lectures, quizzes, homework assignments, and programming tasks in the course track
                    <div class="course-name" style="margin-top: 5px; font-size: 14px;">${certificate.courseTitle}</div>
                  </div>
                </div>

                <div class="footer-signatures">
                  <div class="sig-block">
                    <div class="sig-name">${certificate.instructorName}</div>
                    <div class="sig-line">Lead Instructor</div>
                  </div>
                  
                  <div class="cert-seal">
                    <div style="text-align: center; line-height: 1.1;">Official<br/>Seal</div>
                  </div>

                  <div class="sig-block">
                    <div class="sig-name">Kaizen Q Academic Board</div>
                    <div class="sig-line">Registrar Division</div>
                  </div>
                </div>
              </div>

              <div class="cert-meta">
                <span>DATE: ${certificate.completionDate}</span>
                <span>VERIFICATION URL: ${verificationUrl}</span>
                <span>CERTIFICATE ID: ${certificate.verificationId}</span>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 relative max-h-[95vh] flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <span>Verified digital credential preview</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Landscape frame */}
        <div className="flex-1 flex items-center justify-center overflow-x-auto p-4 bg-slate-950 border border-slate-850 rounded-2xl">
          <div className="w-[800px] h-[550px] bg-white border-[20px] border-slate-900 p-8 relative text-center text-slate-900 flex flex-col justify-between shrink-0 shadow-inner select-text">
            
            {/* Concentric Amber Border */}
            <div className="absolute inset-2 border-2 border-amber-500 rounded pointer-events-none" />

            {/* Header */}
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 font-mono">Kaizen Q Academy</span>
              <h2 className="font-serif text-3xl font-extrabold text-amber-800 tracking-wide mt-1">Certificate of Completion</h2>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Enterprise Learning Credential</span>
            </div>

            {/* Recipient Details */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 italic block">This is proudly presented to</span>
              <span className="font-serif text-3xl font-extrabold text-slate-950 border-b-2 border-slate-200 pb-1 px-8 inline-block min-w-[280px]">
                {certificate.studentName}
              </span>
              <p className="text-[11px] text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
                for successfully mastering all lectures, quizzes, homework assignments, and programming tasks in the course track
              </p>
              <span className="text-sm font-extrabold text-slate-900 block uppercase tracking-wide">
                {certificate.courseTitle}
              </span>
            </div>

            {/* Footer blocks */}
            <div className="flex items-end justify-between px-6 text-[10px] font-bold text-slate-500">
              <div className="text-center w-1/3">
                <span className="text-slate-850 block text-[11px] font-semibold">{certificate.instructorName}</span>
                <span className="border-t border-slate-200 pt-1 block uppercase tracking-wider text-[8px]">Lead Instructor</span>
              </div>
              
              <div className="w-16 h-16 rounded-full border-4 border-double border-amber-500 bg-linear-to-tr from-amber-300 to-amber-500 flex items-center justify-center text-[8px] font-extrabold text-amber-900 uppercase tracking-wider shrink-0 shadow-md">
                Official
              </div>
              
              <div className="text-center w-1/3">
                <span className="text-slate-850 block text-[11px] font-semibold">Kaizen Q Board</span>
                <span className="border-t border-slate-200 pt-1 block uppercase tracking-wider text-[8px]">Registrar Division</span>
              </div>
            </div>

            {/* Meta tags */}
            <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 border-t border-slate-100 pt-2 px-4">
              <span>DATE: {certificate.completionDate}</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> Secure ID: {certificate.verificationId}</span>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-850 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-400">ID: <span className="font-mono text-white">{certificate.verificationId}</span></span>
            <button
              onClick={handleCopyId}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              title="Copy ID to share"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy verification hash'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {sharing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>Share Card</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4 Landscape</span>
            </button>

            <button
              onClick={() => toast.info('PDF download started... (Placeholder)')}
              className="py-2.5 px-4 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl flex items-center gap-2 border border-slate-800 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
