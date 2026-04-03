'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, ShieldAlert, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { REPORTS } from '@/lib/mockData';
import { useAudioCues } from '@/hooks/useAudioCues';
import clsx from 'clsx';

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, openDrawer } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { tick } = useAudioCues();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        tick();
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [setCommandPaletteOpen, tick]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  const filtered = REPORTS.filter(
    r =>
      r.id.toLowerCase().includes(query.toLowerCase()) ||
      r.type.toLowerCase().includes(query.toLowerCase()) ||
      r.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const SEVERITY_COLOR: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 z-[100] bg-black/10 dark:bg-black/40 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--bg-scene-2)',
              border: '1px solid var(--border-08)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.12)',
            }}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-06)' }}>
              <Search size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <input
                suppressHydrationWarning
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search reports, threats, IDs..."
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-600 outline-none cursor-none"
              />
              <button onClick={() => setCommandPaletteOpen(false)} className="text-gray-400 dark:text-gray-600 hover:text-gray-400 dark:text-gray-500 dark:text-gray-400 cursor-none">
                <X size={14} />
              </button>
            </div>

            {/* Results */}
            <div className="py-2 max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-600">No reports found</div>
              ) : (
                filtered.map(report => (
                  <button
                    key={report.id}
                    onClick={() => { openDrawer(report); setCommandPaletteOpen(false); tick(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors group cursor-none"
                  >
                    <ShieldAlert size={14} className={clsx('shrink-0', SEVERITY_COLOR[report.severity])} />
                    <div className="flex-1 text-left">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{report.type}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{report.id} · {report.category}</p>
                    </div>
                    <span className={clsx('text-xs font-medium capitalize', SEVERITY_COLOR[report.severity])}>
                      {report.severity}
                    </span>
                    <ArrowRight size={13} className="text-gray-300 dark:text-gray-700 group-hover:text-gray-400 dark:text-gray-500 dark:text-gray-400 transition-colors" />
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-600" style={{ borderColor: 'var(--border-06)' }}>
              <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
