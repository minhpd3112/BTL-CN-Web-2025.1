import { useEffect, useRef, useState } from 'react';

// Hook for scroll-triggered animations
export function useScrollAnimation(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
}

// Animated container component for scroll animations
export function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0,
  animation = 'fade-up'
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right';
}) {
  const { ref, isVisible } = useScrollAnimation();

  const animationStyles: Record<string, string> = {
    'fade-up': isVisible 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-8',
    'fade-in': isVisible 
      ? 'opacity-100' 
      : 'opacity-0',
    'slide-left': isVisible 
      ? 'opacity-100 translate-x-0' 
      : 'opacity-0 -translate-x-8',
    'slide-right': isVisible 
      ? 'opacity-100 translate-x-0' 
      : 'opacity-0 translate-x-8'
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${animationStyles[animation]} ${className}`}
      style={{ 
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
