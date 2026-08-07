import React, { useState, useEffect } from 'react';
import { liveClassService, type LiveNote } from '@/services/liveClassService';
import { FileText, Save, Download, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface NotesEditorProps {
  classId: string;
  currentUser: {
    name: string;
    role: string;
  };
}

export const LiveNotesEditor: React.FC<NotesEditorProps> = ({ classId, currentUser }) => {
  const [noteData, setNoteData] = useState<LiveNote | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('Lecture Whiteboard Notes & Key Code Concepts');
  const [isSaving, setIsSaving] = useState(false);

  const isInstructor = currentUser.role === 'instructor' || currentUser.role === 'admin';

  useEffect(() => {
    if (!classId) return;
    const unsubscribe = liveClassService.subscribeLiveNotes(classId, (note) => {
      if (note) {
        setNoteData(note);
        setNoteContent(note.content);
        setNoteTitle(note.title);
      }
    });
    return () => unsubscribe();
  }, [classId]);

  const handleSave = async () => {
    if (!classId) return;
    setIsSaving(true);
    await liveClassService.updateLiveNotes(classId, noteTitle, noteContent, currentUser.name);
    setIsSaving(false);
    toast.success('Realtime live notes updated & synced!');
  };

  const handleDownload = () => {
    const text = `# ${noteTitle}\nAuthor: ${noteData?.authorName || currentUser.name}\nDate: ${new Date().toLocaleString()}\n\n${noteContent}`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloaded live classroom lecture notes!');
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-['Sora'] text-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h3 className="font-heading font-black text-sm text-white">Realtime Live Classroom Notes</h3>
        </div>

        <button
          onClick={handleDownload}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export .MD</span>
        </button>
      </div>

      {/* Title Bar */}
      {isInstructor ? (
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-sky-400 focus:outline-hidden focus:border-sky-500"
          placeholder="Note title..."
        />
      ) : (
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <h4 className="font-bold text-sky-400 truncate">{noteTitle}</h4>
          <span className="text-[10px] text-slate-400 font-mono">By {noteData?.authorName || 'Instructor'}</span>
        </div>
      )}

      {/* Main Textarea / Display */}
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col min-h-[220px]">
        {isInstructor ? (
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Type live lecture notes, code snippets, equations, or key takeaways here..."
            className="w-full flex-1 bg-transparent text-xs text-slate-200 focus:outline-hidden font-mono leading-relaxed resize-none"
          />
        ) : (
          <div className="w-full flex-1 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {noteContent || 'The instructor has not added notes to this session yet.'}
          </div>
        )}
      </div>

      {/* Instructor Save Bar */}
      {isInstructor && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>Last synced: {noteData?.updatedAt ? new Date(noteData.updatedAt).toLocaleTimeString() : 'Just now'}</span>
          </span>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Syncing...' : 'Sync Live Notes'}</span>
          </button>
        </div>
      )}

    </div>
  );
};
