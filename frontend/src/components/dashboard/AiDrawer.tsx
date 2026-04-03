'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, Server, User, Globe, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import clsx from 'clsx';
import { useAudioCues } from '@/hooks/useAudioCues';

const SEVERITY_COLORS = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  low: 'text-green-400 bg-green-400/10 border-green-400/20',
};

const SEVERITY_BAR = {
  critical: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  high: 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]',
  medium: 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]',
  low: 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]',
};

export default function AiDrawer() {
  const { drawerOpen, closeDrawer, drawerReport: r } = useAppStore();
  const { thud } = useAudioCues();
  const thudPlayed = useRef(false);

  // Play thud on critical report open
  useEffect(() => {
    if (drawerOpen && r?.severity === 'critical' && !thudPlayed.current) {
      thud();
      thudPlayed.current = true;
      
      // Haptic for touch devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([15, 30, 15]);
    } else if (!drawerOpen) {
      thudPlayed.current = false;
    }
  }, [drawerOpen, r, thud]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeDrawer]);

  return (
    <AnimatePresence>
      {drawerOpen && r && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-40 bg-black/10 dark:bg-black/40 backdrop-blur-md"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md border-l shadow-2xl flex flex-col cursor-auto overflow-y-auto"
            style={{
              background: 'var(--bg-scene-2)',
              borderColor: 'var(--border-1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: 'var(--border-05)' }}>
              <div>
                <motion.div layout className="flex items-center gap-2 mb-1">
                  {/* Framer layoutId matches table row ID text */}
                  <motion.span
                    layoutId={`report-id-${r.id}`}
                    layout="position"
                    className="tabular text-sm font-semibold text-indigo-300"
                  >
                    {r.id}
                  </motion.span>
                  <span className={clsx('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border', SEVERITY_COLORS[r.severity])}>
                    {r.severity}
                  </span>
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{r.type}</h2>
              </div>
              <button 
                onClick={closeDrawer} 
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors cursor-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content wrapper */}
            <div className="flex-1 p-6 space-y-8">
              
              {/* AI Severity Score */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-sm font-semibold text-gray-300 dark:text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-gray-400 dark:text-gray-500" />
                    AI Confidence Score
                  </h3>
                  <span className="tabular text-lg font-bold text-gray-900 dark:text-white">{r.confidence}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-1)' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${r.confidence}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className={clsx('h-full', SEVERITY_BAR[r.severity])}
                  />
                </div>
              </div>

              {/* Tags & Source */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-white/[0.02]">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">Source / IP</p>
                  <p className="tabular font-medium text-gray-800 dark:text-gray-200">{r.source}</p>
                </div>
                <div className="p-4 rounded-xl border border-black/5 dark:border-white/5 bg-white/[0.02]">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">Category</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{r.category}</p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-medium uppercase tracking-wider">Classification Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {r.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2.5 py-1 text-xs text-gray-300 dark:text-gray-700 dark:text-gray-300 rounded border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Reasoning */}
              <div>
                <h3 className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-medium uppercase tracking-wider">Analysis Reasoning</h3>
                <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-500/5 leading-relaxed text-sm text-gray-300 dark:text-gray-700 dark:text-gray-300">
                  {r.reasoning}
                </div>
              </div>

              {/* Affected Systems */}
              <div>
                <h3 className="text-xs text-gray-400 dark:text-gray-500 mb-3 font-medium uppercase tracking-wider">Affected Systems</h3>
                <div className="space-y-2">
                  {r.affectedSystems.map(sys => (
                    <div key={sys} className="flex items-center gap-3 p-3 rounded-lg border border-black/5 dark:border-white/5 bg-white/[0.02]">
                      <Server size={14} className="text-indigo-400" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{sys}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
