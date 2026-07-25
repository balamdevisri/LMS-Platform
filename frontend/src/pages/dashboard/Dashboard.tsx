import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  FileCheck,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  X,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

  // Certificate Modal State
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

  // Sample Quiz Questions
  const quizQuestions = [
    {
      question: 'Which Hook is best suited for synchronous DOM measurements before browser paint?',
      options: ['useEffect', 'useLayoutEffect', 'useCallback', 'useRef'],
      correct: 1,
    },
    {
      question: 'What is the primary benefit of React Server Components (RSC)?',
      options: ['Client bundle size reduction', 'Faster CSS execution', 'Replaces Redux', 'Eliminates HTML'],
      correct: 0,
    },
  ];

  const handleOpenCertificateModal = (cTitle: string, cInstructor: string) => {
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    setCertUniqueId(`KQ-CERT-${randomHex}`);

    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCertCompletionDate(formatted);
    setCertCourseTitle(cTitle);
    setCertCourseInstructor(cInstructor);
    setCertificateModalOpen(true);
  };

  const handlePrintCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Kaizen Q Certificate - ${certCourseTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap" rel="stylesheet">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #fafafa;
                font-family: 'Sora', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .cert-container {
                width: 800px;
                height: 560px;
                background: white;
                border: 20px solid #f59e0b; /* Amber gold border */
                padding: 40px;
                box-sizing: border-box;
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
                }
                .cert-container {
                  box-shadow: none;
                  border-color: #f59e0b !important;
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
                  <div class="branding">Kaizen Q</div>
                  <div class="cert-title">Certificate of Completion</div>
                  <div class="cert-subtitle">Enterprise Learning Management System</div>
                </div>

                <div>
                  <div class="recipient-label">This credential is proudly presented to</div>
                  <div class="recipient-name">${certStudentName}</div>
                  <div class="cert-text">
                    for successfully mastering all lectures, coding challenges, quizzes, and project evaluations in the course track
                    <div class="course-name" style="margin-top: 5px; font-size: 14px;">${certCourseTitle}</div>
                  </div>
                </div>

                <div class="footer-signatures">
                  <div class="sig-block">
                    <div class="sig-name">${certCourseInstructor}</div>
                    <div class="sig-line">Lead Instructor</div>
                  </div>
                  
                  <div class="cert-seal">
                    <div>Official Seal</div>
                  </div>

                  <div class="sig-block">
                    <div class="sig-name">Kaizen Q Academic Board</div>
                    <div class="sig-line">Registrar Division</div>
                  </div>
                </div>
              </div>

              <div class="cert-meta">
                <span>DATE: ${certCompletionDate}</span>
                <span>CERTIFICATE ID: ${certUniqueId}</span>
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
    <div className="space-y-8 text-slate-900">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize font-semibold text-blue-600">{currentTab}</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Welcome back, {userProfile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Scholar'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            You have 2 pending AI assignments and 1 quiz ready for evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuizModalOpen(true)}
            className="btn-blue-primary text-xs py-2.5 px-4 shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Take AI Skills Quiz</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'assignments', label: 'Assignments & Quizzes' },
          { id: 'calendar', label: 'Calendar & Schedule' },
          { id: 'certificates', label: 'Certificates' },
          { id: 'analytics', label: 'Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${currentTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* ------------------- 1. OVERVIEW TAB ------------------- */}
      {currentTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">

          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card-light p-5 space-y-2 border-l-4 border-l-blue-600 bg-white">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Enrolled Courses</span>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-heading font-extrabold text-3xl text-slate-900 block">4 Active</span>
              <p className="text-[11px] text-blue-600 font-medium">2 modules completed this month</p>
            </div>

            <div className="glass-card-light p-5 space-y-2 border-l-4 border-l-indigo-600 bg-white">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Learning Time</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="font-heading font-extrabold text-3xl text-slate-900 block">148.5 hrs</span>
              <p className="text-[11px] text-indigo-600 font-medium">+14.2% higher than class avg</p>
            </div>

            <div className="glass-card-light p-5 space-y-2 border-l-4 border-l-amber-500 bg-white">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Quiz Score Avg</span>
                <FileCheck className="w-4 h-4 text-amber-500" />
              </div>
              <span className="font-heading font-extrabold text-3xl text-slate-900 block">94.8%</span>
              <p className="text-[11px] text-amber-600 font-medium">Grade A+ (Top 3 in cohort)</p>
            </div>

            <div className="glass-card-light p-5 space-y-2 border-l-4 border-l-cyan-500 bg-white">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Certificates</span>
                <Award className="w-4 h-4 text-cyan-500" />
              </div>
              <span className="font-heading font-extrabold text-3xl text-slate-900 block">3 Verified</span>
              <button
                onClick={() => setSearchParams({ tab: 'certificates' })}
                className="text-[11px] text-blue-600 hover:underline font-semibold block"
              >
                View digital credentials →
              </button>
            </div>
          </div>

          {/* SVG Charts & Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Weekly Learning Activity SVG Chart */}
            <div className="lg:col-span-8 glass-card-light p-6 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">Study Hours & AI Engagement</h3>
                  <p className="text-xs text-slate-500">Weekly activity curve across active modules</p>
                </div>
                <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-200">
                  Last 7 Days
                </span>
              </div>

              {/* Chart Graphic */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <svg className="w-full h-44 text-blue-600" viewBox="0 0 500 120" fill="none">
                  <path
                    d="M 0 100 Q 60 20, 120 70 T 240 30 T 360 80 T 500 15"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M 0 100 Q 60 20, 120 70 T 240 30 T 360 80 T 500 15 V 120 H 0 Z"
                    fill="url(#chartBlueAreaLight)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="chartBlueAreaLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#F8FAFC" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="lg:col-span-4 glass-card-light p-6 space-y-4 bg-white">
              <h3 className="font-heading font-bold text-lg text-slate-900">Upcoming Schedule</h3>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    OCT 24
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">GraphQL API Architecture</h4>
                    <p className="text-[11px] text-slate-500">Fullstack Dev • 11:59 PM</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                    OCT 26
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">Live AI Workshop: RAG Embeddings</h4>
                    <p className="text-[11px] text-slate-500">Mentor: Dr. Sarah Jenkins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Currently Enrolled Courses Progress */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-xl text-slate-900">Continue Learning</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card-light p-6 flex flex-col justify-between space-y-4 bg-white">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Development
                  </span>
                  <h4 className="font-heading font-bold text-base text-slate-900">
                    Fullstack Next.js & React Enterprise Architecture
                  </h4>
                  <p className="text-xs text-slate-500">Current Lesson: 14. Server Actions & Mutating State</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Course Completion</span>
                    <span className="text-blue-600">85%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-linear-to-r from-blue-500 to-indigo-600 w-[85%]" />
                  </div>
                </div>

                <Link to="/dashboard/courses" className="btn-blue-primary text-xs py-2.5 justify-center">
                  <PlayCircle className="w-4 h-4" />
                  <span>Resume Lesson</span>
                </Link>
              </div>

              <div className="glass-card-light p-6 flex flex-col justify-between space-y-4 bg-white">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    AI & Data
                  </span>
                  <h4 className="font-heading font-bold text-base text-slate-900">
                    AI & Large Language Model Application Design
                  </h4>
                  <p className="text-xs text-slate-500">Current Lesson: 08. Fine-tuning RAG Embeddings</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Course Completion</span>
                    <span className="text-blue-600">60%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-linear-to-r from-blue-500 to-indigo-600 w-[60%]" />
                  </div>
                </div>

                <Link to="/dashboard/courses" className="btn-blue-primary text-xs py-2.5 justify-center">
                  <PlayCircle className="w-4 h-4" />
                  <span>Resume Lesson</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ------------------- 2. ASSIGNMENTS TAB ------------------- */}
      {(currentTab === 'assignments' || quizModalOpen) && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-card-light p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">Assignments & Assessment Board</h3>
                <p className="text-xs text-slate-500">Manage pending homework submissions and quiz evaluations</p>
              </div>
              <button
                onClick={() => setQuizModalOpen(true)}
                className="btn-blue-primary text-xs py-2 px-3.5"
              >
                Launch AI Practice Quiz
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Assignment Name</th>
                    <th className="py-3 px-4">Course Track</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">GraphQL API Architecture</td>
                    <td className="py-3.5 px-4 text-slate-500">Fullstack Web Dev</td>
                    <td className="py-3.5 px-4 text-slate-500">Oct 24, 2026</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-bold text-[11px] border border-amber-200">
                        Pending
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">—</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">RAG Vector Search Optimization</td>
                    <td className="py-3.5 px-4 text-slate-500">AI Application Design</td>
                    <td className="py-3.5 px-4 text-slate-500">Oct 18, 2026</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[11px] border border-emerald-200">
                        Submitted
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">98 / 100 (A+)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ------------------- 3. CALENDAR TAB ------------------- */}
      {currentTab === 'calendar' && (
        <div className="glass-card-light p-6 space-y-6 animate-in fade-in duration-300 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-slate-900">Academic Schedule & Live Workshops</h3>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">October 2026</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 py-2 border-b border-slate-200">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const hasLecture = day === 24 || day === 26;
              return (
                <div
                  key={day}
                  className={`h-20 p-2 rounded-xl border border-slate-200 flex flex-col justify-between text-xs ${day === 20 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-50 text-slate-800'
                    }`}
                >
                  <span className="font-semibold">{day}</span>
                  {hasLecture && (
                    <span className="text-[10px] bg-amber-500 text-white p-1 rounded-md line-clamp-1">
                      Live Workshop
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ------------------- 4. CERTIFICATES TAB ------------------- */}
      {(currentTab === 'certificates' || certificateModalOpen) && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-card-light bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-8 rounded-3xl space-y-4 border border-blue-400/30">
            <div className="flex items-center gap-3">
              <Award className="w-10 h-10 text-cyan-300" />
              <div>
                <h3 className="font-heading font-bold text-2xl text-white">Verified Engineering Credentials</h3>
                <p className="text-xs text-blue-100">ISO/IEC 27001 Authenticated Digital Certificates</p>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-3">
                <span className="text-xs text-cyan-300 font-mono">ID: KAIZENQ-2026-88941</span>
                <h4 className="font-heading font-bold text-lg text-white">Fullstack Systems & AI Architecture</h4>
                <p className="text-xs text-blue-100">Issued to Jane Devson • Issued on Oct 10, 2026</p>
                <button
                  onClick={() => setCertificateModalOpen(true)}
                  className="bg-white text-blue-600 font-heading font-bold text-xs py-2 px-4 rounded-full hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>View Certificate PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ------------------- 5. ANALYTICS TAB ------------------- */}
      {currentTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="glass-card-light p-6 space-y-4 bg-white">
            <h3 className="font-heading font-bold text-lg text-slate-900">Skill Mastery Index</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>React & Next.js Architecture</span>
                  <span className="text-blue-600">96%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-blue-600 rounded-full w-[96%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>RAG & Vector Databases</span>
                  <span className="text-blue-600">82%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-indigo-600 rounded-full w-[82%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card-light p-6 space-y-4 bg-white">
            <h3 className="font-heading font-bold text-lg text-slate-900">Engagement & Attendance Log</h3>
            <p className="text-xs text-slate-500">100% Attendance recorded across 14 virtual sessions</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">Perfect Attendance Badge Awarded</span>
            </div>
          </div>
        </div>
      )}


      {/* ----------------- QUIZ RUNNER MODAL ----------------- */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 border border-slate-200 animate-in zoom-in-95 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" /> Interactive AI Quiz
              </h3>
              <button onClick={() => setQuizModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {quizScore === null ? (
              <div className="space-y-6">
                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswerSelect(qIdx, oIdx)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all ${selectedAnswers[qIdx] === oIdx
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={submitQuiz}
                  className="btn-blue-primary w-full py-3 justify-center text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Submit Assessment Answers
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 font-heading font-extrabold text-2xl mx-auto flex items-center justify-center border border-blue-200">
                  {quizScore}%
                </div>
                <h4 className="font-heading font-bold text-xl text-slate-900">AI Evaluation Complete!</h4>
                <p className="text-xs text-slate-500">Your score has been saved to your learner profile analytics.</p>
                <button
                  onClick={() => {
                    setQuizScore(null);
                    setQuizModalOpen(false);
                  }}
                  className="btn-blue-primary px-6 py-2.5 text-xs font-bold"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ----------------- CERTIFICATE MODAL ----------------- */}
      {certificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 border border-slate-200 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/20">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-xs font-mono text-blue-600 uppercase tracking-widest block font-bold">
              Official ISO Authenticated Credential
            </span>

            <h3 className="font-heading font-extrabold text-2xl text-slate-900">
              Certificate of Completion
            </h3>

            <p className="text-xs sm:text-sm text-slate-600">
              This certifies that <strong className="text-slate-900 font-semibold">Jane Devson</strong> has successfully mastered <strong className="text-slate-900 font-semibold">Fullstack Systems & AI Architecture</strong> on KaizenQ.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  toast.success('Downloading high-resolution PDF certificate...');
                  setCertificateModalOpen(false);
                }}
                className="btn-blue-primary text-xs py-2.5 px-5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="btn-glass-light text-xs py-2.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
