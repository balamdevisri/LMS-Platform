import React, { useState, useEffect, useRef } from 'react';

interface LazyViewportProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}

export const LazyViewport: React.FC<LazyViewportProps> = ({ children, placeholder }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: '150px' } // Pre-fetch slightly before they scroll into full view
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  return <div ref={ref} className="w-full">{isIntersecting ? children : placeholder}</div>;
};
