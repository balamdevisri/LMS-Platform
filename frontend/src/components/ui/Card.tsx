import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 ${hoverEffect ? 'hover:scale-[1.01] cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
