'use client';
import { memo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { REPORTS, type Report } from '@/lib/mockData';
import { useAudioCues } from '@/hooks/useAudioCues';
import clsx from 'clsx';

const SEVERITY_COLORS = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  low: 'text-green-400 bg-green-400/10 border-green-400/20',
};

const TR_STYLE = 'border-b transition-colors cursor-none';

interface TableRowProps {
  report: Report;
  isHovered: boolean;
  onClick: () => void;
}

// React.memo to prevent re-renders when hoveredTimestamp changes globally 
// (unless this specific row matches the newly hovered timestamp)
const TableRow = memo(function TableRow({ report, isHovered, onClick }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={clsx(TR_STYLE, isHovered ? 'bg-indigo-500/10' : 'hover:bg-white/[0.03]')}
      style={{ borderColor: 'var(--border-05)' }}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <ShieldAlert size={14} className={SEVERITY_COLORS[report.severity].split(' ')[0]} />
          {/* Framer Motion layoutId ties this cell to the Drawer header */}
          <motion.span
            layoutId={`report-id-${report.id}`}
            layout="position"
            className="tabular text-xs font-semibold text-gray-800 dark:text-gray-200"
          >
            {report.id}
          </motion.span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{report.type}</td>
      <td className="px-4 py-3">
        <span className={clsx('px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border', SEVERITY_COLORS[report.severity])}>
          {report.severity}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 uppercase tracking-widest">{report.status}</span>
      </td>
      <td className="px-4 py-3 text-right tabular text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400">
        <span suppressHydrationWarning>
          {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </td>
    </tr>
  );
}, (prev, next) => 
  prev.report.id === next.report.id && 
  prev.isHovered === next.isHovered
);

export default function ReportsTable() {
  const { tableSearch, setTableSearch, hoveredTimestamp, openDrawer } = useAppStore();
  const { tick } = useAudioCues();
  
  const filtered = REPORTS.filter(r => 
    r.id.toLowerCase().includes(tableSearch.toLowerCase()) || 
    r.type.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div 
      className="card flex flex-col overflow-hidden h-[400px]"
      data-cursor="table"
    >
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-05)' }}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Latest Reports</h3>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            suppressHydrationWarning
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search reports..."
            className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-black/5 dark:bg-black/20 text-gray-300 dark:text-gray-700 dark:text-gray-300 border focus:border-indigo-500/50 outline-none transition-colors cursor-none"
            style={{ borderColor: 'var(--border-1)' }}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="sticky top-0 bg-[#0B0F1A] backdrop-blur-md z-10 text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Threat Type</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report) => (
              <TableRow 
                key={report.id}
                report={report}
                // isHovered triggers if the row's timestamp day matches the active chart point date (mockData mapping)
                isHovered={hoveredTimestamp !== null && new Date(report.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) === hoveredTimestamp}
                onClick={() => { openDrawer(report); tick(); }}
              />
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
            No reports match your search.
          </div>
        )}
      </div>
    </div>
  );
}
