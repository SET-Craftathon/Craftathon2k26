'use client';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, LayoutDashboard, Bell, Activity, FileText,
  Settings, ChevronLeft, ChevronRight, Zap, Eye
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'threats', icon: ShieldAlert, label: 'Threats' },
  { id: 'reports', icon: FileText, label: 'Reports' },
  { id: 'activity', icon: Activity, label: 'Activity' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
  { id: 'monitor', icon: Eye, label: 'Monitor' },
];

interface MagneticIconProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed: boolean;
}

function MagneticIcon({ icon: Icon, label, active, collapsed }: MagneticIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!el) return;
        if (dist < 40) {
          const factor = (40 - dist) / 40;
          el.style.transform = `translate(${dx * 0.3 * factor}px, ${dy * 0.3 * factor}px)`;
        } else {
          el.style.transform = 'translate(0,0)';
        }
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(rafRef.current);
      if (el) el.style.transform = 'translate(0,0)';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      el?.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      title={label}
      style={{ transition: 'transform 0.15s ease' }}
      className={clsx(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-none group',
        'transition-colors duration-150',
        active
          ? 'bg-indigo-500/15 text-indigo-300'
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:bg-white/5'
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-full"
        />
      )}
      <Icon size={18} className="shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col shrink-0 h-screen overflow-hidden border-r"
      style={{
        background: 'var(--bg-surface-trans)',
        borderColor: 'var(--border-05)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-5 border-b" style={{ borderColor: 'var(--border-05)' }}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
          <Zap size={15} className="text-gray-900 dark:text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight whitespace-nowrap">Security CC</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight whitespace-nowrap">Command Center</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-hidden">
        {NAV_ITEMS.map((item, i) => (
          <MagneticIcon
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={i === 0}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-4 border-t pt-3" style={{ borderColor: 'var(--border-05)' }}>
        <MagneticIcon icon={Settings} label="Settings" collapsed={sidebarCollapsed} />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center border bg-[#0B0F1A] z-10 hover:bg-indigo-500/20 transition-colors cursor-none"
        style={{ borderColor: 'var(--border-1)' }}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? <ChevronRight size={12} className="text-gray-400 dark:text-gray-500 dark:text-gray-400" /> : <ChevronLeft size={12} className="text-gray-400 dark:text-gray-500 dark:text-gray-400" />}
      </button>
    </motion.aside>
  );
}
