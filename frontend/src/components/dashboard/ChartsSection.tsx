'use client';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { CHART_DATA, PIE_DATA } from '@/lib/mockData';

const CARD_STYLE = {
  background: 'var(--bg-surface)',
  boxShadow: `
    inset 0 1px 0 oklch(100% 0 0 / 0.07),
    inset 0 0 0 1px oklch(100% 0 0 / 0.04),
    0 4px 24px rgba(0,0,0,0.5)
  `,
};

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold text-green-400"
      style={{ borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.04)' }}
    >
      <span
        className="live-dot w-1.5 h-1.5 rounded-full bg-green-400"
        role="status"
        aria-live="polite"
        aria-label="Live data feed active"
      />
      LIVE
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{color: string; name: string; value: number}>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border p-3 text-xs shadow-xl"
      style={{ background: 'oklch(16% 0.01 260)', borderColor: 'var(--border-08)' }}
    >
      <p className="text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 capitalize">{p.name}:</span>
          <span className="tabular font-semibold text-gray-900 dark:text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ThreatLineChart() {
  const setHovered = useAppStore(s => s.setHoveredTimestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-xl p-5 col-span-2"
      style={CARD_STYLE}
      data-cursor="chart"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Threat Volume</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">14-day rolling window</p>
        </div>
        <LiveBadge />
      </div>
      <div className="h-64 px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart
            data={CHART_DATA}
            onMouseMove={(s) => {
              if (s.activeLabel !== undefined) setHovered(String(s.activeLabel));
            }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="critGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(100% 0 0 / 0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--chart-text)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--chart-text)' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'oklch(100% 0 0 / 0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line type="monotone" dataKey="total" stroke="url(#totalGrad)" strokeWidth={2} dot={false} name="total" />
          <Line type="monotone" dataKey="critical" stroke="url(#critGrad)" strokeWidth={1.5} dot={false} name="critical" strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function SeverityBarChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl p-5"
      style={CARD_STYLE}
      data-cursor="chart"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Severity Distribution</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500">By day</p>
      </div>
      <ResponsiveContainer width="100%" height={200} minWidth={1} minHeight={1}>
        <BarChart data={CHART_DATA.slice(-7)} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(100% 0 0 / 0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--chart-text)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--chart-text)' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(100% 0 0 / 0.03)' }} />
          <Bar dataKey="critical" stackId="a" fill="oklch(62% 0.25 25)" radius={[0, 0, 0, 0]} name="critical" />
          <Bar dataKey="high" stackId="a" fill="oklch(70% 0.20 45)" name="high" />
          <Bar dataKey="medium" stackId="a" fill="oklch(78% 0.18 85)" name="medium" />
          <Bar dataKey="low" stackId="a" fill="oklch(68% 0.18 145)" radius={[4, 4, 0, 0]} name="low" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function CategoryPieChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-xl p-5"
      style={CARD_STYLE}
      data-cursor="chart"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Category Breakdown</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500">Attack types</p>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={130} height={130} minWidth={1} minHeight={1}>
          <PieChart>
            <Pie
              data={PIE_DATA}
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={58}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {PIE_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1.5 flex-1">
          {PIE_DATA.map(entry => (
            <div key={entry.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
                <span className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">{entry.name}</span>
              </div>
              <span className="tabular text-xs font-semibold text-gray-300 dark:text-gray-700 dark:text-gray-300">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-2">
        <ThreatLineChart />
      </div>
      <SeverityBarChart />
      <CategoryPieChart />
    </div>
  );
}
