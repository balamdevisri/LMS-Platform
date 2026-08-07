import React, { useState } from 'react';
import { Award, Copy, Printer, Share2, X, Check, ShieldCheck, Clock, BookOpen, Calendar, Download } from 'lucide-react';
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
  const [scale, setScale] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        if (parent) {
          const parentWidth = parent.clientWidth;
          const parentHeight = parent.clientHeight;
          const scaleW = (parentWidth - 16) / 950;
          const scaleH = (parentHeight - 16) / 670;
          const newScale = Math.max(Math.min(scaleW, scaleH, 1), 0.3);
          setScale(newScale);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Dynamic student info fallback from auth context
  const dynamicStudentName = certificate.studentName || userProfile?.name || user?.displayName || userProfile?.githubUsername || 'Student User';
  const dynamicStudentId = certificate.studentId || (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-992104');
  
  // Dynamic course title lookup map based on courseId
  const courseTitleMap: Record<string, string> = {
    'course_linux_101': 'Linux Systems & Administration Mastery',
    'linux-101': 'Linux Systems & Administration Mastery',
    'linux-systems-administration-mastery': 'Linux Systems & Administration Mastery',
    'linux': 'Linux Systems & Administration Mastery',
    'git-github-mastery': 'Git & GitHub Mastery',
    'git': 'Git & GitHub Mastery',
    'database-management-system': 'Database Management System (DBMS): Beginner to Advanced',
    'dbms': 'Database Management System (DBMS): Beginner to Advanced',
    'dbms-101': 'Database Management System (DBMS): Beginner to Advanced',
    'sql': 'Database Management System (DBMS): Beginner to Advanced',
  };

  const dynamicCourseTitle = certificate.courseTitle || 
    courseTitleMap[certificate.courseId] || 
    courseTitleMap[certificate.courseId?.toLowerCase()] || 
    'Mastering Enterprise Technology & Systems Architecture';

  const dynamicDuration = certificate.courseDuration || '24 Hours';
  const dynamicModules = certificate.modulesCount || 8;
  const dynamicDate = certificate.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const safeVerificationId = certificate.verificationId || '';
  const verificationUrl = safeVerificationId
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/verify/${safeVerificationId}?studentId=${dynamicStudentId}`
    : '';
  
  // Live QR Code Generator URL encoding verification URL & student ID
  const qrCodeImageUrl = verificationUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}&color=0b1a30&bgcolor=ffffff`
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
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Certificate - ${dynamicCourseTitle} - ${dynamicStudentName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Sora:wght@400;600;700;800&display=swap');
              @page {
                size: A4 landscape;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background-color: #f1f5f9;
                font-family: 'Sora', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .cert-canvas {
                width: 1050px;
                height: 742px;
                background: #ffffff;
                position: relative;
                box-sizing: border-box;
                overflow: hidden;
                box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 40px 50px;
              }

              /* Corner Sweeps & Framing */
              .top-left-sweep {
                position: absolute;
                top: 0;
                left: 0;
                width: 240px;
                height: 240px;
                background: linear-gradient(135deg, #002277 0%, #0044cc 60%, #0b55ed 100%);
                clip-path: polygon(0 0, 100% 0, 0 100%);
                z-index: 1;
              }
              .top-left-gold-trim {
                position: absolute;
                top: 0;
                left: 0;
                width: 250px;
                height: 250px;
                background: linear-gradient(135deg, #d4af37 0%, #f9e076 50%, #b8860b 100%);
                clip-path: polygon(0 0, 100% 0, 0 100%);
                z-index: 0;
              }

              .bottom-right-sweep {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 260px;
                height: 260px;
                background: linear-gradient(315deg, #002277 0%, #0044cc 60%, #0b55ed 100%);
                clip-path: polygon(100% 100%, 0 100%, 100% 0);
                z-index: 1;
              }
              .bottom-right-gold-trim {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 270px;
                height: 270px;
                background: linear-gradient(315deg, #d4af37 0%, #f9e076 50%, #b8860b 100%);
                clip-path: polygon(100% 100%, 0 100%, 100% 0);
                z-index: 0;
              }

              .inner-gold-border {
                position: absolute;
                inset: 16px;
                border: 2px solid #d4af37;
                pointer-events: none;
                z-index: 2;
              }
              .inner-thin-border {
                position: absolute;
                inset: 22px;
                border: 1px solid #e2e8f0;
                pointer-events: none;
                z-index: 2;
              }

              /* Content Layout */
              .cert-content {
                position: relative;
                z-index: 10;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                text-align: center;
              }

              .top-brand-seal {
                position: absolute;
                top: -10px;
                left: 10px;
                z-index: 12;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .gold-seal-badge {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: radial-gradient(circle, #ffe58f 0%, #d4af37 60%, #996515 100%);
                border: 4px double #ffffff;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #0b1a30;
                text-align: center;
                font-family: 'Cinzel', serif;
                font-size: 8px;
                font-weight: 900;
                line-height: 1.1;
              }
              .seal-ribbon {
                width: 44px;
                height: 50px;
                background: #002277;
                margin-top: -15px;
                clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
                border-top: 2px solid #d4af37;
              }

              .header-logo {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-top: 10px;
              }
              .logo-icon {
                width: 38px;
                height: 38px;
                border-radius: 12px;
                background: linear-gradient(135deg, #0052cc 0%, #002b80 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: 900;
                border: 2px solid #d4af37;
              }
              .brand-title {
                font-family: 'Cinzel', serif;
                font-size: 22px;
                font-weight: 900;
                color: #0b1a30;
                letter-spacing: 0.05em;
              }
              .brand-tagline {
                font-size: 9px;
                font-weight: 800;
                letter-spacing: 0.2em;
                color: #0044cc;
                text-transform: uppercase;
              }

              .cert-heading {
                font-family: 'Cinzel', serif;
                font-size: 42px;
                font-weight: 900;
                color: #0b1a30;
                letter-spacing: 0.12em;
                margin-top: 15px;
                line-height: 1;
              }
              .cert-subheading {
                font-family: 'Cinzel', serif;
                font-size: 14px;
                font-weight: 800;
                color: #b8860b;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                margin-top: 6px;
              }

              .cert-divider {
                width: 220px;
                height: 2px;
                background: linear-gradient(90deg, transparent 0%, #d4af37 50%, transparent 100%);
                margin: 8px auto;
              }

              .certify-label {
                font-size: 13px;
                color: #475569;
                font-weight: 500;
                margin-top: 10px;
              }
              .student-name {
                font-family: 'Playfair Display', serif;
                font-size: 40px;
                font-weight: 800;
                color: #0b1a30;
                margin: 8px 0;
                letter-spacing: 0.02em;
              }

              .course-text {
                font-size: 13px;
                color: #475569;
                font-weight: 500;
              }
              .course-title {
                font-family: 'Cinzel', serif;
                font-size: 20px;
                font-weight: 900;
                color: #0033aa;
                margin: 6px 0;
                letter-spacing: 0.03em;
              }

              .description-paragraph {
                font-size: 11px;
                color: #64748b;
                max-width: 680px;
                margin: 6px auto;
                line-height: 1.5;
                font-weight: 500;
              }

              /* 4 Metric Pillars Grid */
              .pillars-grid {
                display: flex;
                justify-content: center;
                gap: 24px;
                margin: 18px 0;
              }
              .pillar-card {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0 12px;
                border-right: 1px solid #e2e8f0;
              }
              .pillar-card:last-child {
                border-right: none;
              }
              .pillar-icon {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #ebf3ff;
                border: 1.5px solid #0044cc;
                color: #0044cc;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                margin-bottom: 4px;
              }
              .pillar-label {
                font-size: 8px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: #0033aa;
              }
              .pillar-val {
                font-size: 11px;
                font-weight: 800;
                color: #0b1a30;
                margin-top: 2px;
              }

              /* QR Code Verification Box */
              .qr-box {
                position: absolute;
                right: 45px;
                top: 230px;
                width: 140px;
                padding: 12px;
                border: 1.5px dashed #d4af37;
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.95);
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                text-align: center;
                z-index: 15;
              }
              .qr-img {
                width: 90px;
                height: 90px;
                margin: 6px auto;
                display: block;
                border-radius: 8px;
              }
              .qr-label {
                font-size: 8px;
                font-weight: 900;
                color: #0033aa;
                letter-spacing: 0.1em;
                text-transform: uppercase;
              }
              .qr-sub {
                font-size: 7px;
                color: #64748b;
                font-weight: 600;
                word-break: break-all;
                margin-top: 2px;
              }

              /* Footer Signatures */
              .signatures-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding: 0 30px;
                margin-top: 10px;
              }
              .sig-box {
                width: 180px;
                text-align: center;
              }
              .sig-title {
                font-size: 9px;
                font-weight: 800;
                color: #0b1a30;
                text-transform: uppercase;
                letter-spacing: 0.08em;
              }
              .sig-subtitle {
                font-size: 8px;
                font-weight: 700;
                color: #64748b;
                margin-top: 2px;
              }
              .center-company {
                text-align: center;
              }
              .company-name {
                font-family: 'Cinzel', serif;
                font-size: 16px;
                font-weight: 900;
                color: #0033aa;
                letter-spacing: 0.08em;
              }
              .company-tag {
                font-size: 7px;
                font-weight: 800;
                letter-spacing: 0.2em;
                color: #b8860b;
                margin-top: 2px;
              }

              @media print {
                body {
                  background: white;
                }
                .cert-canvas {
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="cert-canvas">
              <div class="top-left-gold-trim"></div>
              <div class="top-left-sweep"></div>
              <div class="bottom-right-gold-trim"></div>
              <div class="bottom-right-sweep"></div>
              <div class="inner-gold-border"></div>
              <div class="inner-thin-border"></div>

              <div class="cert-content">
                <!-- Gold Medal Seal -->
                <div class="top-brand-seal">
                  <div class="gold-seal-badge">
                    ★ KAIZEN Q ★<br/>AI-POWERED<br/>LMS
                  </div>
                  <div class="seal-ribbon"></div>
                </div>

                <!-- Header Branding -->
                <div>
                  <div class="header-logo">
                    <div class="logo-icon">Q</div>
                    <div>
                      <div class="brand-title">Kaizen Q</div>
                      <div class="brand-tagline">AI-POWERED LMS</div>
                    </div>
                  </div>

                  <div class="cert-heading">CERTIFICATE</div>
                  <div class="cert-subheading">OF COMPLETION</div>
                  <div class="cert-divider"></div>
                </div>

                <!-- Recipient & Course Text -->
                <div>
                  <div class="certify-label">This is to certify that</div>
                  <div class="student-name">${dynamicStudentName}</div>
                  <div class="cert-divider"></div>
                  
                  <div class="course-text">has successfully completed the course</div>
                  <div class="course-title">${dynamicCourseTitle}</div>
                  <div class="course-text">offered by Kaizen Q – AI-Powered LMS.</div>
                  <div class="description-paragraph">
                    The student has demonstrated outstanding dedication, completed all modules, passed all assessments, and has acquired strong knowledge and skills in the subject.
                  </div>
                </div>

                <!-- QR Code Verification Floating Box -->
                <div class="qr-box">
                  <div class="qr-label">🛡️ SCAN TO VERIFY</div>
                  <img src="${qrCodeImageUrl}" alt="Verification QR Code" class="qr-img" />
                  <div class="qr-sub">ID: ${certificate.verificationId}</div>
                  <div class="qr-sub">Student ID: ${dynamicStudentId}</div>
                </div>

                <!-- 4 Metric Pillars -->
                <div class="pillars-grid">
                  <div class="pillar-card">
                    <div class="pillar-icon">⏱</div>
                    <div class="pillar-label">COURSE DURATION</div>
                    <div class="pillar-val">${dynamicDuration}</div>
                  </div>
                  <div class="pillar-card">
                    <div class="pillar-icon">📖</div>
                    <div class="pillar-label">MODULES COMPLETED</div>
                    <div class="pillar-val">${dynamicModules} / ${dynamicModules} Modules</div>
                  </div>
                  <div class="pillar-card">
                    <div class="pillar-icon">🏅</div>
                    <div class="pillar-label">ACHIEVEMENT</div>
                    <div class="pillar-val">100% Score • Mastery</div>
                  </div>
                  <div class="pillar-card">
                    <div class="pillar-icon">📅</div>
                    <div class="pillar-label">COMPLETED ON</div>
                    <div class="pillar-val">${dynamicDate}</div>
                  </div>
                </div>

                <!-- Footer Signatures & Company Brand -->
                <div class="signatures-row">
                  <div class="sig-box">
                    <div class="sig-title">Certified By</div>
                    <div class="sig-subtitle">Shaivika Groups</div>
                  </div>

                  <div class="center-company">
                    <div class="company-name">SHAIVIKA GROUPS</div>
                    <div class="company-tag">LEARN • GROW • SUCCEED</div>
                  </div>

                  <div class="sig-box">
                    <div class="sig-title">Founder & CEO</div>
                    <div class="sig-subtitle">Shaivika Groups</div>
                  </div>
                </div>

              </div>
            </div>

            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
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

        {/* Certificate Preview Frame (Landscape Canvas matching exact image design) */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4 bg-slate-950 border border-slate-800/80 rounded-2xl shadow-inner min-h-[300px] relative">
          <div
            ref={containerRef}
            className="bg-white relative text-slate-900 flex flex-col justify-between shrink-0 shadow-2xl rounded-sm overflow-hidden select-text p-10 font-['Sora'] transition-transform duration-200"
            style={{
              width: '950px',
              height: '670px',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            
            {/* Top-Left & Bottom-Right Corner Sweeps */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-linear-to-br from-[#d4af37] via-[#f9e076] to-[#b8860b] clip-path-polygon-[0_0,100%_0,0_100%] z-0" />
            <div className="absolute top-0 left-0 w-44 h-44 bg-linear-to-br from-[#002277] via-[#0044cc] to-[#0b55ed] clip-path-polygon-[0_0,100%_0,0_100%] z-1" />

            <div className="absolute bottom-0 right-0 w-52 h-52 bg-linear-to-tl from-[#d4af37] via-[#f9e076] to-[#b8860b] clip-path-polygon-[100%_100%,0_100%,100%_0] z-0" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-linear-to-tl from-[#002277] via-[#0044cc] to-[#0b55ed] clip-path-polygon-[100%_100%,0_100%,100%_0] z-1" />

            {/* Double Gold Framing Border */}
            <div className="absolute inset-4 border-2 border-[#d4af37] pointer-events-none z-2" />
            <div className="absolute inset-6 border border-slate-200 pointer-events-none z-2" />

            {/* Gold Medal 3D Ribbon Seal (Top-Left) */}
            <div className="absolute top-1 left-4 z-20 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-radial from-[#ffe58f] via-[#d4af37] to-[#996515] border-4 border-double border-white shadow-xl flex items-center justify-center text-center text-[#0b1a30] font-['Cinzel'] font-black text-[9px] leading-tight">
                ★ KAIZEN Q ★<br />AI-POWERED<br />LMS
              </div>
              <div className="w-11 h-12 bg-[#002277] -mt-3 border-t-2 border-[#d4af37] clip-path-polygon-[0_0,100%_0,100%_100%,50%_80%,0_100%]" />
            </div>

            {/* Main Certificate Content Wrapper */}
            <div className="relative z-10 h-full flex flex-col justify-between text-center pt-2 pb-2">
              
              {/* Header Branding */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#0052cc] to-[#002b80] border-2 border-[#d4af37] text-white flex items-center justify-center font-black text-lg shadow-sm">
                    Q
                  </div>
                  <div className="text-left">
                    <span className="font-['Cinzel'] text-xl font-black text-[#0b1a30] tracking-wide block leading-none">Kaizen Q</span>
                    <span className="text-[9px] font-extrabold tracking-widest text-[#0044cc] uppercase block pt-0.5">AI-POWERED LMS</span>
                  </div>
                </div>

                <h1 className="font-['Cinzel'] text-4xl font-black text-[#0b1a30] tracking-widest pt-2">
                  CERTIFICATE
                </h1>
                <span className="font-['Cinzel'] text-xs font-black text-[#b8860b] tracking-[0.3em] uppercase block">
                  OF COMPLETION
                </span>
                <div className="w-48 h-0.5 bg-linear-to-r from-transparent via-[#d4af37] to-transparent mx-auto my-2" />
              </div>

              {/* Recipient Details & Course Info */}
              <div className="space-y-2">
                <p className="text-xs text-slate-600 font-medium">This is to certify that</p>
                <div className="font-['Playfair_Display'] text-3xl sm:text-4xl font-black text-[#0b1a30] border-b-2 border-slate-200 pb-1 px-8 inline-block">
                  {dynamicStudentName}
                </div>
                <div className="w-48 h-0.5 bg-linear-to-r from-transparent via-[#d4af37] to-transparent mx-auto my-1" />

                <p className="text-xs text-slate-600 font-medium">has successfully completed the course</p>
                <h2 className="font-['Cinzel'] text-lg font-black text-[#0033aa] tracking-wide max-w-2xl mx-auto">
                  {dynamicCourseTitle}
                </h2>
                <p className="text-xs font-bold text-slate-700">offered by Kaizen Q – AI-Powered LMS.</p>
                <p className="text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
                  The student has demonstrated outstanding dedication, completed all modules, passed all assessments, and has acquired strong knowledge and skills in the subject.
                </p>
              </div>

              {/* Scannable Live QR Code Box (Middle Right) */}
              <div className="absolute right-6 top-48 w-36 p-3 border-2 border-dashed border-[#d4af37] rounded-2xl bg-white/95 shadow-lg text-center z-20 space-y-1">
                <div className="flex items-center justify-center gap-1 text-[9px] font-black text-[#0033aa] uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0044cc]" />
                  <span>Scan To Verify</span>
                </div>
                <img
                  src={qrCodeImageUrl}
                  alt="Dynamic Verification QR Code"
                  className="w-24 h-24 mx-auto rounded-lg border border-slate-200 shadow-xs"
                />
                <div className="text-[8px] text-slate-600 font-extrabold truncate">ID: {certificate.verificationId}</div>
                <div className="text-[7px] text-slate-500 font-mono truncate">Student: {dynamicStudentId}</div>
              </div>

              {/* 4 Pillar Metric Badges */}
              <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100">
                <div className="flex flex-col items-center pr-6 border-r border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-sky-50 border border-sky-600 text-sky-700 flex items-center justify-center mb-1">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] font-black uppercase text-[#0033aa] tracking-wider">COURSE DURATION</span>
                  <span className="text-xs font-black text-[#0b1a30]">{dynamicDuration}</span>
                </div>

                <div className="flex flex-col items-center pr-6 border-r border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-600 text-indigo-700 flex items-center justify-center mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] font-black uppercase text-[#0033aa] tracking-wider">MODULES COMPLETED</span>
                  <span className="text-xs font-black text-[#0b1a30]">{dynamicModules} / {dynamicModules} Modules</span>
                </div>

                <div className="flex flex-col items-center pr-6 border-r border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-600 text-amber-700 flex items-center justify-center mb-1">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] font-black uppercase text-[#0033aa] tracking-wider">ACHIEVEMENT</span>
                  <span className="text-xs font-black text-[#0b1a30]">100% Score • Mastery</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-600 text-emerald-700 flex items-center justify-center mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[8px] font-black uppercase text-[#0033aa] tracking-wider">COMPLETED ON</span>
                  <span className="text-xs font-black text-[#0b1a30]">{dynamicDate}</span>
                </div>
              </div>

              {/* Footer Signatures */}
              <div className="flex items-end justify-between px-8 pt-4">
                <div className="text-center w-40">
                  <span className="text-xs font-black text-[#0b1a30] block uppercase tracking-wider">Certified By</span>
                  <span className="text-[9px] font-bold text-slate-500 border-t border-slate-300 pt-1 block uppercase">Shaivika Groups</span>
                </div>

                <div className="text-center">
                  <span className="font-['Cinzel'] font-black text-sm text-[#0033aa] tracking-widest block">SHAIVIKA GROUPS</span>
                  <span className="text-[8px] font-black text-[#b8860b] tracking-[0.2em] uppercase block pt-0.5">LEARN • GROW • SUCCEED</span>
                </div>

                <div className="text-center w-40">
                  <span className="text-xs font-black text-[#0b1a30] block uppercase tracking-wider">Founder & CEO</span>
                  <span className="text-[9px] font-bold text-slate-500 border-t border-slate-300 pt-1 block uppercase">Shaivika Groups</span>
                </div>
              </div>

            </div>
          </div>
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
            {certificate.googleDriveLink && (
              <a
                href={certificate.googleDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF (Google Drive)</span>
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
