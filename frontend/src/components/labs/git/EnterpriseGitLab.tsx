import React from 'react';
import { WindowsPowerShellTerminal } from './WindowsPowerShellTerminal';

interface EnterpriseGitLabProps {
  studentId?: string;
  studentName?: string;
  onClaimXP?: (xp: number, title: string) => void;
  isNightMode?: boolean;
}

export const EnterpriseGitLab: React.FC<EnterpriseGitLabProps> = () => {
  return (
    <div className="w-full h-175 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0c1017] animate-in fade-in duration-300">
      <WindowsPowerShellTerminal />
    </div>
  );
};
