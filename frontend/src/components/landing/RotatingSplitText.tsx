import React from 'react';

export interface RotatingSplitTextProps {
  words?: string[];
  interval?: number;
  className?: string;
  showUnderline?: boolean;
}

/**
 * <RotatingSplitText />
 * Clean, high-impact static headline: "Learn. Build. Evolve."
 * Eliminates continuous letter rotation and particle burst CPU overhead.
 */
export const RotatingSplitText: React.FC<RotatingSplitTextProps> = ({
  className = '',
  showUnderline = true,
}) => {
  return (
    <div className={`relative flex flex-col items-center lg:items-start ${className}`}>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0f172a] dark:text-[#ffffff] leading-[1.15]">
        <span>Learn. Build. </span>
        <span className="bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
          Evolve.
        </span>
      </h1>

      {showUnderline && (
        <div
          className="h-[3px] w-24 sm:w-32 mt-3 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #2563EB 0%, #6366F1 60%, transparent 100%)',
          }}
        />
      )}
    </div>
  );
};
