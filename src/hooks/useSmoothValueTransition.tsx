import { useState, useEffect, useRef } from 'react';

interface UseSmoothValueTransitionOptions {
  duration?: number;
  flash?: boolean;
}

export function useSmoothValueTransition<T>(
  value: T,
  options: UseSmoothValueTransitionOptions = {}
) {
  const { duration = 300, flash = true } = options;
  const [displayValue, setDisplayValue] = useState(value);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldFlash, setShouldFlash] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (value !== previousValueRef.current) {
      setIsTransitioning(true);
      
      if (flash) {
        setShouldFlash(true);
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Smooth transition to new value
      timeoutRef.current = setTimeout(() => {
        setDisplayValue(value);
        setIsTransitioning(false);
        setShouldFlash(false);
        previousValueRef.current = value;
      }, duration / 2);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, duration, flash]);

  return {
    displayValue,
    isTransitioning,
    shouldFlash,
    transitionClasses: `${isTransitioning ? 'smooth-fade' : ''} ${shouldFlash ? 'value-flash' : ''}`
  };
}