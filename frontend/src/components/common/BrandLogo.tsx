import React from 'react';
import { Link } from 'react-router-dom';
import { KaizenQLogo } from '../brand/KaizenQLogo';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical' | 'icon';
  theme?: 'light' | 'dark' | 'glass';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  theme,
  showSubtitle = false,
  className = '',
}) => {
  return (
    <Link to="/" className={`inline-flex items-center group ${className}`}>
      <KaizenQLogo
        size={size}
        layout={layout}
        theme={theme}
        showTagline={showSubtitle}
        className="transition-transform duration-300 group-hover:scale-102"
      />
    </Link>
  );
};
