import React from 'react';
import { LottieLight } from 'lottie-react';
import hourglassAnimation from '@/assets/animations/hourglass-loading.json';

export interface LottieLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  size = 'md',
  message,
  className = '',
  fullScreen = false,
}) => {
  const sizeClasses: Record<string, string> = {
    xs: 'w-16 h-16',
    sm: 'w-24 h-24',
    md: 'w-36 h-36 sm:w-44 sm:h-44',
    lg: 'w-48 h-48 sm:w-60 sm:h-60',
    xl: 'w-64 h-64 sm:w-72 sm:h-72',
    fullscreen: 'w-56 h-56 sm:w-72 sm:h-72',
  };

  const isFullScreen = fullScreen || size === 'fullscreen';
  const selectedSizeClass = sizeClasses[isFullScreen ? 'fullscreen' : size] || sizeClasses.md;

  const content = (
    <div className={`flex flex-col items-center justify-center select-none bg-transparent ${className}`}>
      <div className={`relative ${selectedSizeClass} flex items-center justify-center overflow-hidden pointer-events-none bg-transparent`}>
        <LottieLight
          animationData={hourglassAnimation}
          loop={true}
          autoplay={true}
          className="w-full h-full bg-transparent"
          style={{ background: 'transparent' }}
        />
      </div>
      {message && (
        <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide animate-pulse text-center max-w-sm px-4">
          {message}
        </p>
      )}
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none p-4">
        <div className="pointer-events-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LottieLoader;
