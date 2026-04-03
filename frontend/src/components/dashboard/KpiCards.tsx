'use client';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import {
  ShieldAlert, Zap, CheckCircle, Timer,
  TrendingUp, TrendingDown
} from 'lucide-react';
import type { KPI_DATA } from '@/lib/mockData';
import clsx from 'clsx';

const ICON_MAP: Record<string, React.ElementType> = {
  'shield-alert': ShieldAlert,
  'zap': Zap,
  'check-circle': CheckCircle,
  'timer': Timer,
};

type KpiItem = typeof KPI_DATA[number];

function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  const Icon = ICON_MAP[item.icon] ?? ShieldAlert;
  const isPositive = item.change > 0;
  const isGood = (item.icon === 'check-circle' || item.icon === 'timer') ? isPositive : !isPositive;

  const sparkData = item.sparkline.map((v, i) => ({ v, i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="card relative overflow-hidden p-5 group"
      style={{
        background: 'var(--bg-surface)',
        boxShadow: `
          inset 0 1px 0 oklch(100% 0 0 / 0.07),
          inset 0 0 0 1px oklch(100% 0 0 / 0.04),
          0 4px 24px rgba(0,0,0,0.5),
          0 0 40px rgba(99,102,241,0.06)
        `,
      }}
    >
      {/* Sparkline background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#6366f1"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subtle conic glow on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-xl"
        style={{
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 60%, rgba(99,102,241,0.08) 100%)',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 dark:text-gray-400 tracking-wide uppercase">{item.label}</p>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
            <Icon size={15} className="text-indigo-400" />
          </div>
        </div>

        <p className="tabular text-3xl font-bold text-gray-900 dark:text-white leading-none mb-2">{item.value}</p>

        <div className="flex items-center gap-1.5">
          {isGood ? (
            <TrendingDown size={12} className="text-green-400" />
          ) : (
            <TrendingUp size={12} className={isPositive ? 'text-green-400' : 'text-red-400'} />
          )}
          <span className={clsx('tabular text-xs font-semibold', isGood ? 'text-green-400' : isPositive ? 'text-red-400' : 'text-green-400')}>
            {item.change > 0 ? '+' : ''}{item.change}%
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-600">{item.caption}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function KpiCards({ data }: { data: typeof KPI_DATA }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, i) => (
        <KpiCard key={item.label} item={item} index={i} />
      ))}
    </div>
  );
}
