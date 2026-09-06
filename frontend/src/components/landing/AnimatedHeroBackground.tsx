import React from 'react';

export const AnimatedHeroBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* Subtle Background Grid Depth Texture in Dark Mode / Light Mode */}
      <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25] [background-image:radial-gradient(#94a3b8_1px,transparent_1px)] dark:[background-image:radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      {/* Static Ambient Blob 1 — Top Left (Blue / Indigo) */}
      <div
        className="absolute -top-12 -left-12 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-30 dark:opacity-80 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 60%, transparent 80%)',
        }}
      />

      {/* Static Ambient Blob 2 — Top Right (Cyan / Sky Blue) */}
      <div
        className="absolute -top-10 -right-10 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-25 dark:opacity-75 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(circle, rgba(6, 182, 212, 0.16) 0%, rgba(59, 130, 246, 0.10) 60%, transparent 80%)',
        }}
      />

      {/* Static Ambient Blob 3 — Bottom Left (Purple / Indigo) */}
      <div
        className="hidden md:block absolute -bottom-16 -left-10 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20 dark:opacity-70 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, rgba(99, 102, 241, 0.08) 60%, transparent 80%)',
        }}
      />

      {/* Static Ambient Blob 4 — Bottom Right / Edge (Pink / Orange Ambient) */}
      <div
        className="hidden md:block absolute -bottom-12 -right-12 w-80 h-80 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20 dark:opacity-65 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(249, 115, 22, 0.08) 60%, transparent 80%)',
        }}
      />

      {/* Center Subtle Atmosphere Highlight */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-2xl h-72 rounded-full blur-3xl opacity-15 dark:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 70%)',
        }}
      />
    </div>
  );
};
