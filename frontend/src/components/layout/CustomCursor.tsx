'use client';
import { useRef, useEffect } from 'react';
import { useMouseParallax } from '@/hooks/useMouseParallax';

type CursorVariant = 'default' | 'chart' | 'table' | 'pointer';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useMouseParallax(dotRef, ringRef);

  // Cursor shape detection via data attributes on hovered elements
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    const handleEnter = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const variant = el.closest('[data-cursor]')?.getAttribute('data-cursor') as CursorVariant | null;
      if (variant === 'chart') {
        ring.setAttribute('data-shape', 'chart');
      } else if (variant === 'table') {
        ring.setAttribute('data-shape', 'table');
      } else if (el.closest('button, a, [role="button"]')) {
        ring.setAttribute('data-shape', 'pointer');
      } else {
        ring.removeAttribute('data-shape');
      }
    };

    window.addEventListener('mouseover', handleEnter, { passive: true });
    return () => window.removeEventListener('mouseover', handleEnter);
  }, []);

  return (
    <>
      {/* Instant dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] w-2.5 h-2.5 rounded-full bg-indigo-400 pointer-events-none mix-blend-screen"
        style={{ willChange: 'transform' }}
      />
      {/* Lagged ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] w-8 h-8 rounded-full border border-indigo-500/40 pointer-events-none"
        style={{
          willChange: 'transform',
          transition: 'width 0.2s, height 0.2s, border-color 0.2s',
        }}
        // CSS data attribute shape transitions
      />
      <style>{`
        [data-shape="chart"] {
          width: 40px !important; height: 40px !important;
          border-color: rgba(34,211,238,0.6) !important;
          border-width: 2px !important;
          background: rgba(34,211,238,0.04);
        }
        [data-shape="chart"]::after {
          content: '';
          position: absolute;
          inset: 30%;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2322d3ee' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") center/contain no-repeat;
        }
        [data-shape="table"] {
          width: 28px !important; height: 28px !important;
          border-color: rgba(99,102,241,0.7) !important;
        }
        [data-shape="pointer"] {
          width: 36px !important; height: 36px !important;
          border-color: rgba(255,255,255,0.3) !important;
          background: rgba(255,255,255,0.04) !important;
        }
      `}</style>
    </>
  );
}
