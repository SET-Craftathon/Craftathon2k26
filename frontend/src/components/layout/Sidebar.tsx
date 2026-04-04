'use client';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, LayoutDashboard, FileText, Landmark,
  Settings, ChevronLeft, ChevronRight, Zap, LogOut
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
  { id: 'threads', icon: FileText, label: 'My Reports' },
  { id: 'chat', icon: Zap, label: 'AI Assistant' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activeTab, setActiveTab } = useAppStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 80 : 320 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative flex flex-col shrink-0 h-screen overflow-hidden z-20 border-r border-gray-200 bg-blue-950 text-white shadow-xl"
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-blue-900/50 px-4 bg-blue-950/80">
        <div className="relative flex items-center justify-center">
          <ShieldAlert size={32} className="text-blue-400 shrink-0" />
          <Landmark size={14} className="text-white absolute mt-0.5" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-3 flex flex-col overflow-hidden whitespace-nowrap"
            >
              <span className="font-bold tracking-wide text-lg leading-tight text-white">GovPortal</span>
              <span className="text-[10px] text-blue-300 font-medium tracking-widest uppercase">Admin Secure</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as 'dashboard' | 'threads' | 'chat')}
              className={clsx(
                'w-full flex items-center px-3 py-3 rounded-lg transition-colors group relative',
                active 
                  ? 'bg-blue-900/60 text-white font-semibold' 
                  : 'text-blue-200 hover:bg-blue-900/40 hover:text-white'
              )}
            >
              <Icon size={20} className={clsx('shrink-0 transition-colors', active ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300')} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium ml-3">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

    </motion.aside>
  );
}
