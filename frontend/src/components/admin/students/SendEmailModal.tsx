import React, { useState } from 'react';
import { X, Send, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { StudentUser } from '@/services/studentService';

interface SendEmailModalProps {
  student: StudentUser | null;
  onClose: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({ student, onClose }) => {
  if (!student) return null;

  const [subject, setSubject] = useState(`KaizenQ Academic Notice: Welcome ${student.name}`);
  const [message, setMessage] = useState(
    `Hello ${student.name},\n\nWe noticed your active progress on KaizenQ AI Platform in ${student.currentCourse || 'Linux Systems Mastery'}.\n\nKeep up the great work!\nBest regards,\nKaizenQ Administration Team`
  );
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Please enter both subject and message content.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Platform email sent successfully to ${student.email}!`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-sky-200 max-w-lg w-full p-6 shadow-2xl space-y-4 font-['Sora'] text-slate-900 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-900">Send Student Notification</h3>
              <p className="text-[11px] text-slate-500 font-medium">To: {student.name} ({student.email})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4 text-xs font-medium">
          
          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Message Content</label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send Email</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
