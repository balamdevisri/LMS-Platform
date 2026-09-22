import React from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  Pencil,
  Hand,
  Users,
  MessageSquare,
  HelpCircle,
  FileText,
  Upload,
  BarChart3,
  PhoneOff,
} from 'lucide-react';

interface ClassroomControlsProps {
  isMicOn: boolean;
  isCamOn: boolean;
  isScreenSharing: boolean;
  isWhiteboardOpen: boolean;
  isHandRaised: boolean;
  isInstructor: boolean;
  activeSidebarTab: string | null;
  unreadChatCount?: number;
  unreadQuestionCount?: number;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreenShare: () => void;
  onToggleWhiteboard: () => void;
  onToggleHandRaise: () => void;
  onToggleSidebarTab: (tab: string) => void;
  onLeaveOrEndClass: () => void;
}

export const ClassroomControls: React.FC<ClassroomControlsProps> = ({
  isMicOn,
  isCamOn,
  isScreenSharing,
  isWhiteboardOpen,
  isHandRaised,
  isInstructor,
  activeSidebarTab,
  unreadChatCount = 0,
  unreadQuestionCount = 0,
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
  onToggleWhiteboard,
  onToggleHandRaise,
  onToggleSidebarTab,
  onLeaveOrEndClass,
}) => {
  return (
    <div className="w-full bg-white/90 dark:bg-[#0c1122]/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 p-2.5 sm:p-3.5 flex items-center justify-between gap-3 font-sans shrink-0 shadow-xl relative select-none transition-colors duration-200">
      {/* Left Branding / Role indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-slate-900 dark:text-white font-medium">KaizenQ</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-white/10 text-indigo-700 dark:text-cyan-300 border border-slate-300/60 dark:border-white/10 font-bold ml-1">
            {isInstructor ? 'Instructor' : 'Student'}
          </span>
        </div>
      </div>

      {/* Center Media Control Toolbar */}
      <div className="flex items-center gap-2 mx-auto sm:mx-0">
        {/* Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-lg backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
            isMicOn
              ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-700 dark:text-rose-400'
          }`}
          title={isMicOn ? 'Turn off Microphone' : 'Turn on Microphone'}
          aria-label={isMicOn ? 'Turn off Microphone' : 'Turn on Microphone'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCam}
          className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-lg backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
            isCamOn
              ? 'bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
              : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-700 dark:text-rose-400'
          }`}
          title={isCamOn ? 'Turn off Camera' : 'Turn on Camera'}
          aria-label={isCamOn ? 'Turn off Camera' : 'Turn on Camera'}
        >
          {isCamOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share (Instructor / Staff Only) */}
        {isInstructor && (
          <button
            onClick={onToggleScreenShare}
            className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-lg backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
              isScreenSharing
                ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-amber-500/20'
                : 'bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
            aria-label={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
          >
            <Monitor className="w-5 h-5" />
          </button>
        )}

        {/* Interactive Whiteboard */}
        <button
          onClick={onToggleWhiteboard}
          className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-lg backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
            isWhiteboardOpen
              ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold shadow-cyan-500/20'
              : 'bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
          title={isWhiteboardOpen ? 'Close Interactive Whiteboard' : 'Open Whiteboard'}
          aria-label={isWhiteboardOpen ? 'Close Interactive Whiteboard' : 'Open Whiteboard'}
        >
          <Pencil className="w-5 h-5" />
        </button>

        {/* Student Raise Hand Toggle */}
        {!isInstructor && (
          <button
            onClick={onToggleHandRaise}
            className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-lg backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
              isHandRaised
                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-amber-500/30 animate-bounce font-bold'
                : 'bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            aria-label={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          >
            <Hand className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right Drawer Toggles & End/Leave */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onToggleSidebarTab('roster')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer relative backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
            activeSidebarTab === 'roster'
              ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-700 dark:text-cyan-300 shadow-md'
              : 'bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border-slate-200/80 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Participants Roster"
          aria-label="Participants Roster"
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleSidebarTab('chat')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer relative backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
            activeSidebarTab === 'chat'
              ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-700 dark:text-cyan-300 shadow-md'
              : 'bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border-slate-200/80 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Live Chat"
          aria-label="Live Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
              {unreadChatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onToggleSidebarTab('questions')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer relative backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
            activeSidebarTab === 'questions'
              ? 'bg-purple-500/25 border-purple-400/60 text-purple-700 dark:text-purple-300 shadow-md'
              : 'bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border-slate-200/80 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Questions & Q&A"
          aria-label="Questions & Q&A"
        >
          <HelpCircle className="w-4 h-4" />
          {unreadQuestionCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-bold flex items-center justify-center shadow-md">
              {unreadQuestionCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onToggleSidebarTab('notes')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
            activeSidebarTab === 'notes'
              ? 'bg-blue-500/25 border-blue-400/60 text-blue-700 dark:text-blue-300 shadow-md'
              : 'bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border-slate-200/80 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Classroom Notes"
          aria-label="Classroom Notes"
        >
          <FileText className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleSidebarTab('resources')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
            activeSidebarTab === 'resources'
              ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-700 dark:text-emerald-300 shadow-md'
              : 'bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border-slate-200/80 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Classroom Resources"
          aria-label="Classroom Resources"
        >
          <Upload className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleSidebarTab('polls')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 ${
            activeSidebarTab === 'polls'
              ? 'bg-amber-500/25 border-amber-400/60 text-amber-700 dark:text-amber-300 shadow-md'
              : 'bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border-slate-200/80 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title="Quizzes & Polls"
          aria-label="Quizzes & Polls"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {/* Leave or End Class */}
        <button
          onClick={onLeaveOrEndClass}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-xl transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-rose-500/50 ${
            isInstructor
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 border border-rose-500'
              : 'bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white border border-rose-200 dark:border-rose-800/50'
          }`}
          title={isInstructor ? 'End Class for Everyone' : 'Leave Classroom'}
          aria-label={isInstructor ? 'End Class for Everyone' : 'Leave Classroom'}
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">{isInstructor ? 'End Class' : 'Leave'}</span>
        </button>
      </div>
    </div>
  );
};
