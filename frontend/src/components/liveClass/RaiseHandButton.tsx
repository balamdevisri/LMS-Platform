import React from 'react';
import { Hand } from 'lucide-react';

export interface RaiseHandButtonProps {
  hasRaisedHand: boolean;
  onToggleRaiseHand: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

export const RaiseHandButton: React.FC<RaiseHandButtonProps> = ({
  hasRaisedHand,
  onToggleRaiseHand,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onToggleRaiseHand}
      disabled={disabled}
      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
        hasRaisedHand
          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-400/40 shadow-amber-500/20 animate-pulse'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
      } ${className}`}
      title={hasRaisedHand ? 'Click to lower your hand' : 'Click to raise your hand in class'}
    >
      <Hand className={`w-3.5 h-3.5 ${hasRaisedHand ? 'text-slate-950 fill-current' : 'text-amber-400'}`} />
      <span>{hasRaisedHand ? 'Hand Raised ✋' : 'Raise Hand'}</span>
    </button>
  );
};

export default RaiseHandButton;
