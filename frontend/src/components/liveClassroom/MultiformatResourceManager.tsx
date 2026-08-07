import React, { useState, useEffect } from 'react';
import { liveClassService, type LiveResource } from '@/services/liveClassService';
import { FileText, Plus, Trash2, ExternalLink, Code, Video, FileArchive, Image as ImageIcon, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface ResourceProps {
  classId: string;
  currentUser: {
    role: string;
  };
}

export const MultiformatResourceManager: React.FC<ResourceProps> = ({ classId, currentUser }) => {
  const [resources, setResources] = useState<LiveResource[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pdf' | 'ppt' | 'zip' | 'image' | 'github' | 'youtube'>('pdf');
  const [url, setUrl] = useState('');
  const [fileSize, setFileSize] = useState('2.5 MB');

  const isInstructor = currentUser.role === 'instructor' || currentUser.role === 'admin';

  useEffect(() => {
    if (!classId) return;
    const unsubscribe = liveClassService.subscribeResources(classId, (data) => {
      setResources(data);
    });
    return () => unsubscribe();
  }, [classId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error('Please enter resource title and valid URL.');
      return;
    }

    await liveClassService.addResource(classId, {
      title: title.trim(),
      type,
      url: url.trim(),
      fileSize
    });

    toast.success('Resource published to live classroom!');
    setTitle('');
    setUrl('');
    setIsAddOpen(false);
  };

  const handleDelete = async (rId: string) => {
    await liveClassService.deleteResource(classId, rId);
    toast.info('Resource removed.');
  };

  const getIcon = (t: string) => {
    switch (t) {
      case 'github': return <Code className="w-4 h-4 text-purple-400" />;
      case 'youtube': return <Video className="w-4 h-4 text-rose-500" />;
      case 'zip': return <FileArchive className="w-4 h-4 text-amber-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'ppt': return <FileCode className="w-4 h-4 text-orange-400" />;
      default: return <FileText className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-['Sora'] text-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-400" />
          <h3 className="font-heading font-black text-sm text-white">Course Assets & Multiformat Resources</h3>
        </div>

        {isInstructor && (
          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        )}
      </div>

      {/* Add Form Drawer */}
      {isAddOpen && isInstructor && (
        <form onSubmit={handleAdd} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Asset Title (e.g. Kernel Memory PDF / Github Repo)"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={type}
              onChange={(e: any) => setType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
            >
              <option value="pdf">PDF Document</option>
              <option value="ppt">PPT Presentation</option>
              <option value="zip">ZIP Code Archive</option>
              <option value="image">Diagram / Image</option>
              <option value="github">GitHub Repository</option>
              <option value="youtube">YouTube Video</option>
            </select>

            <input
              type="text"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="Size (e.g. 4.2 MB)"
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
            />
          </div>

          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/... or https://..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500 font-mono"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-sky-500 text-white font-bold text-xs shadow-md"
            >
              Publish Resource
            </button>
          </div>
        </form>
      )}

      {/* Resources List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
        {resources.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 text-xs">
            <FileText className="w-8 h-8 opacity-40 mb-2" />
            <p>No multiformat resources attached yet.</p>
          </div>
        ) : (
          resources.map((r) => (
            <div key={r.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {getIcon(r.type)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate">{r.title}</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">{r.type} • {r.fileSize || 'Link'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 font-bold flex items-center gap-1 cursor-pointer"
                  title="Open Resource"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {isInstructor && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
