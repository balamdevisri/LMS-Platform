import React from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Static container: renders immediately without scroll-into-view animation delays */
export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};
