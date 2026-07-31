import React from 'react';
import { KaizenQSymbol } from './KaizenQSymbol';

interface KaizenQLogoProps {
  layout?: 'horizontal' | 'vertical' | 'icon';
  theme?: 'light' | 'dark' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const KaizenQLogo: React.FC<KaizenQLogoProps> = ({
  layout = 'horizontal',
  theme = 'light',
  size = 'md',
  className = '',
}) => {
  const symbolSizes = {
    sm: 36,
    md: 52,
    lg: 72,
    xl: 104,
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };

  const iconSize = symbolSizes[size];
  const textColorClass = theme === 'dark' ? 'text-white' : 'text-[#0B1220]';

  if (layout === 'icon') {
    return <KaizenQSymbol size={iconSize} theme={theme} className={className} />;
  }

  if (layout === 'vertical') {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center text-center gap-3 select-none ${className}`}
      >
        <KaizenQSymbol size={iconSize * 1.3} theme={theme} />
        <div className="flex flex-col items-center">
          <div className={`font-['Sora'] font-extrabold tracking-tight ${textSizes[size]} ${textColorClass}`}>
            Kaizen{' '}
            <span className="bg-linear-to-r from-[#2563EB] to-[#22D3EE] bg-clip-text text-transparent">
              Q
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div
      className={`inline-flex items-center gap-3 md:gap-4 select-none ${className}`}
    >
      <KaizenQSymbol size={iconSize} theme={theme} />
      <div className="flex flex-col justify-center">
        <div className={`font-['Sora'] font-extrabold leading-none tracking-tight ${textSizes[size]} ${textColorClass}`}>
          Kaizen{' '}
          <span className="bg-linear-to-r from-[#2563EB] to-[#22D3EE] bg-clip-text text-transparent">
            Q
          </span>
        </div>
      </div>
    </div>
  );
};
