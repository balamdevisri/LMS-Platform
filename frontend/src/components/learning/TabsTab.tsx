import React from 'react';
import {
  BookOpen,
  FileText,
  HelpCircle,
  Megaphone,
  MessageSquare,
  Bookmark,
  Award,
  BarChart2,
  FolderArchive,
  CheckSquare,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface TabsTabProps {
  activeTab: string;
  onSelectTab: (tabKey: string) => void;
}

export const TabsTab: React.FC<TabsTabProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { key: 'overview', label: 'Course Overview', icon: BookOpen, badge: 'Main' },
    { key: 'notes', label: 'My Personal Notes', icon: FileText },
    { key: 'resources', label: 'Learning Resources', icon: FolderArchive },
    { key: 'downloads', label: 'Code & Downloads', icon: Download },
    { key: 'assignments', label: 'Hands-on Labs', icon: CheckSquare, badge: 'Lab' },
    { key: 'quiz', label: 'Assessment Quizzes', icon: HelpCircle },
    { key: 'announcements', label: 'Announcements', icon: Megaphone },
    { key: 'discussions', label: 'Student Discussions', icon: MessageSquare },
    { key: 'bookmarks', label: 'Bookmarked Lessons', icon: Bookmark },
    { key: 'certificate', label: 'Earn Certificate', icon: Award },
    { key: 'progress', label: 'Detailed Analytics', icon: BarChart2 },
  ];

  return (
    <div className="space-y-2 py-2 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50">
      <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Course Navigation
      </div>

      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.key;

        return (
          <button
            key={item.key}
            onClick={() => {
              onSelectTab(item.key);
              toast.info(`Navigated to ${item.label}`);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 text-xs font-semibold cursor-pointer ${
              isActive
                ? 'bg-linear-to-r from-cyan-950/80 via-slate-900 to-sky-950/80 border border-cyan-500/50 text-white shadow-md'
                : 'hover:bg-slate-900 text-slate-300 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
