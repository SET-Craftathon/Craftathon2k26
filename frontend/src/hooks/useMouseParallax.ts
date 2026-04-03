'use client';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Tracks mouse position and updates:
 * 1. CSS vars --mouse-x / --mouse-y on <html> for the parallax glow background
 * 2. Passes position to the custom cursor element via ref (no React state — rAF only)
 * 3. Passes position to magnetic sidebar icon elements
 */
export function useMouseParallax(
  cursorRef: React.RefObject<HTMLDivElement | null>,
  cursorRingRef: React.RefObject<HTMLDivElement | null>
) {
  const rafId = useRef<number>(0);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  const animate = useCallback(() => {
    // Smooth lerp for cursor ring
    currentX.current += (targetX.current - currentX.current) * 0.35;
    currentY.current += (targetY.current - currentY.current) * 0.35;

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${targetX.current - 5}px, ${targetY.current - 5}px, 0)`;
    }
    if (cursorRingRef.current) {
      cursorRingRef.current.style.transform = `translate3d(${currentX.current - 16}px, ${currentY.current - 16}px, 0)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, [cursorRef, cursorRingRef]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;

      // Background parallax — throttled to CSS var update
      const html = document.documentElement;
      html.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
      html.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate]);
}
