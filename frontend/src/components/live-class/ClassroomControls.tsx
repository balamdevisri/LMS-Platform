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
    <div className="w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-3 sm:p-4 flex items-center justify-between gap-3 font-sans shrink-0">
      {/* Left Branding / Role indicator */}
      <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-300">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-white">KaizenQ Classroom</span>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
          {isInstructor ? 'Instructor Mode' : 'Student Mode'}
        </span>
      </div>

      {/* Center Media Control Toolbar */}
      <div className="flex items-center gap-2 mx-auto sm:mx-0">
        <button
          onClick={onToggleMic}
          className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-md ${
            isMicOn
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
          }`}
          title={isMicOn ? 'Turn off Microphone' : 'Turn on Microphone'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={onToggleCam}
          className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-md ${
            isCamOn
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
          }`}
          title={isCamOn ? 'Turn off Camera' : 'Turn on Camera'}
        >
          {isCamOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {isInstructor && (
          <button
            onClick={onToggleScreenShare}
            className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-md ${
              isScreenSharing
                ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
          >
            <Monitor className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={onToggleWhiteboard}
          className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-md ${
            isWhiteboardOpen
              ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title={isWhiteboardOpen ? 'Close Interactive Whiteboard' : 'Open Whiteboard'}
        >
          <Pencil className="w-5 h-5" />
        </button>

        {!isInstructor && (
          <button
            onClick={onToggleHandRaise}
            className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-md ${
              isHandRaised
                ? 'bg-amber-500 border-amber-400 text-slate-950 animate-bounce'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          >
            <Hand className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right Drawer Toggles & End/Leave */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onToggleSidebarTab('roster')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
            activeSidebarTab === 'roster'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400'
          }`}
          title="Participants Roster"
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleSidebarTab('chat')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
            activeSidebarTab === 'chat'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400'
          }`}
          title="Live Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {unreadChatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onToggleSidebarTab('questions')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
            activeSidebarTab === 'questions'
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400'
          }`}
          title="Questions & Q&A"
        >
          <HelpCircle className="w-4 h-4" />
          {unreadQuestionCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-bold flex items-center justify-center">
              {unreadQuestionCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onToggleSidebarTab('notes')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            activeSidebarTab === 'notes'
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400'
          }`}
          title="Classroom Notes"
        >
          <FileText className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleSidebarTab('resources')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            activeSidebarTab === 'resources'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400'
          }`}
          title="Classroom Resources"
        >
          <Upload className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleSidebarTab('polls')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            activeSidebarTab === 'polls'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400'
          }`}
          title="Quizzes & Polls"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {/* Leave or End Class */}
        <button
          onClick={onLeaveOrEndClass}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer ${
            isInstructor
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
              : 'bg-slate-800 hover:bg-rose-900/60 border border-slate-700 text-slate-200'
          }`}
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">{isInstructor ? 'End Class' : 'Leave'}</span>
        </button>
      </div>
    </div>
  );
};
