import React, { useState, useEffect, useRef } from 'react';
import { soundService } from '@/services/soundService';

interface ProgressiveRevealContainerProps {
  children: React.ReactNode[];
  contentKey: string;
}

export const ProgressiveRevealContainer: React.FC<ProgressiveRevealContainerProps> = ({
  children,
  contentKey,
}) => {
  const [revealedCount, setRevealedCount] = useState(1);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Reset when content changes
  useEffect(() => {
    if (prefersReducedMotion.current) {
      setRevealedCount(children.length);
      return;
    }
    setRevealedCount(1);
  }, [contentKey, children.length]);

  // Sequential reveal interval
  useEffect(() => {
    if (prefersReducedMotion.current) return;
    if (revealedCount >= children.length) return;

    const timer = setTimeout(() => {
      const nextCount = revealedCount + 1;
      setRevealedCount(nextCount);

      // Play soft sound cues on key reveals
      const nextElement = children[revealedCount];
      if (nextElement && React.isValidElement(nextElement)) {
        const className = String((nextElement.props as any)?.className || '').toLowerCase();
        const key = String(nextElement.key || '').toLowerCase();

        const isExample = className.includes('example') || key.includes('example');
        const isPractice = 
          className.includes('question') || 
          className.includes('sandbox') || 
          className.includes('quiz') ||
          key.includes('question') || 
          key.includes('sandbox') ||
          key.includes('quiz') ||
          key.includes('flowchart');

        if (isPractice) {
          soundService.play('success');
        } else if (isExample) {
          soundService.play('unlock');
        } else {
          soundService.play('select');
        }
      } else {
        soundService.play('select');
      }
    }, 180); // Stagger timing (180ms delay per block)

    return () => clearTimeout(timer);
  }, [revealedCount, children, children.length]);

  const visibleChildren = prefersReducedMotion.current 
    ? children 
    : children.slice(0, revealedCount);

  return (
    <div className="space-y-4">
      {visibleChildren.map((child, idx) => {
        if (!React.isValidElement(child)) return child;

        const isLastRevealed = !prefersReducedMotion.current && idx === revealedCount - 1;
        const revealClass = isLastRevealed 
          ? 'animate-in fade-in slide-in-from-bottom-2 zoom-in-98 duration-300' 
          : '';

        return (
          <div 
            key={child.key || idx} 
            className={`transition-all duration-300 ${revealClass}`}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
