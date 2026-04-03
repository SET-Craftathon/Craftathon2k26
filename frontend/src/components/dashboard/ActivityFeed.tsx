'use client';
import { motion } from 'framer-motion';
import { ACTIVITY_EVENTS } from '@/lib/mockData';
import clsx from 'clsx';
import { CheckCircle2, XCircle, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';

const ACTION_MAP = {
  approved: { icon: CheckCircle2, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  rejected: { icon: XCircle, color: 'text-gray-400 dark:text-gray-500 dark:text-gray-400 bg-gray-400/10 border-gray-400/20' },
  escalated: { icon: AlertTriangle, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  resolved: { icon: UserCheck, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  flagged: { icon: ShieldAlert, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } }
};

export default function ActivityFeed() {
  return (
    <div className="card h-[400px] flex flex-col overflow-hidden">
      <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-05)' }}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Activity Feed</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4 pr-2">
        <motion.div 
          className="relative pl-3 space-y-6"
          variants={containerVars}
          initial="hidden"
          animate="show"
        >
          {/* Timeline line */}
          <div className="absolute left-3.5 top-2 bottom-0 w-px bg-black/10 dark:bg-white/10" />

          {ACTIVITY_EVENTS.map(event => {
            const config = ACTION_MAP[event.action];
            const Icon = config.icon;

            return (
              <motion.div key={event.id} variants={itemVars} className="relative flex gap-4">
                {/* Dot */}
                <div className={clsx('relative z-10 w-2.5 h-2.5 mt-1.5 rounded-full ring-4 ring-[#0B0F1A]', config.color.split(' ')[0], config.color.split(' ')[1])} />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-0.5">
                    <p className="text-xs text-gray-300 dark:text-gray-700 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white">{event.actor}</span>
                      {' '}
                      <span className="text-gray-400 dark:text-gray-500">{event.action}</span>
                      {' '}
                      <span className="font-medium text-gray-300 dark:text-gray-700 dark:text-gray-300">{event.reportId}</span>
                    </p>
                    <span suppressHydrationWarning className="tabular text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {event.note && (
                    <div className="mt-1.5 px-3 py-2 rounded-lg bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/5 text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">
                      {event.note}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
