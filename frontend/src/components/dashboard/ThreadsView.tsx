'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Filter, Search, Clock, CheckCircle2, ShieldAlert, Eye, MoreVertical, Hash, Activity, FileText, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import ReportModal, { ReportData } from './ReportModal';
import clsx from 'clsx';

const Badge = ({ severity, status }: { severity?: string, status?: string }) => {
  if (status === 'RESOLVED') {
    return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">Resolved</span>;
  }
  
  if (severity === 'HIGHEST' || severity === 'HIGH') {
    return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-rose-100 text-rose-800 border-rose-200">High Priority</span>;
  }
  
  return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border bg-amber-100 text-amber-800 border-amber-200">Pending Review</span>;
};

export default function ThreadsView() {
  const { token, tableSearch } = useAppStore();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard/reports', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.status === 'success') {
          setReports(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchReports();
  }, [token]);

  const severityLevels = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST'];

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSeverity = filterSeverity === 'ALL' || r.severity === filterSeverity;
      const matchesSearch = !tableSearch || 
        r.reportId.toLowerCase().includes(tableSearch.toLowerCase()) ||
        r.contentType.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(tableSearch.toLowerCase()));
      return matchesSeverity && matchesSearch;
    });
  }, [reports, filterSeverity, tableSearch]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl border border-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-gray-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Active Reports</h2>
          <p className="mt-1 text-sm text-gray-500">Comprehensive log of all citizen-submitted incident reports.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
             <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700 tracking-wider">Live Sync</span>
             </div>
          </div>
          <div className="relative">
            <select 
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
            >
              {severityLevels.map(level => (
                <option key={level} value={level}>{level === 'ALL' ? 'Filter by Priority' : `${level} Priority`}</option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Data Density Grid */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <span className="text-sm font-semibold text-gray-600">Showing {filteredReports.length} results</span>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={report.reportId}
              className="group bg-white hover:bg-gray-50 p-4 sm:p-6 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center gap-4 sm:gap-6"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={clsx(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border",
                  report.status === 'RESOLVED' 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : report.severity === 'HIGHEST' || report.severity === 'HIGH'
                    ? "bg-rose-50 border-rose-100 text-rose-600"
                    : "bg-amber-50 border-amber-100 text-amber-600"
                )}>
                  {report.status === 'RESOLVED' ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-sm font-semibold text-blue-900">
                        {report.reportId.slice(0, 15).toUpperCase()}...
                      </span>
                      <Badge severity={report.severity} status={report.status} />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 truncate mb-1">
                      {report.contentType}
                    </h3>
                    <p className="text-sm text-gray-500 truncate max-w-2xl">
                      {report.description || "No description provided."}
                    </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 md:pl-6 md:border-l border-gray-100">
                  <div className="flex flex-col items-start md:items-end">
                      <span className="text-xs text-gray-400 font-medium tracking-wide uppercase mb-1">Date Logged</span>
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <Clock size={14} className="mr-1.5 text-gray-400" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                  </div>
                  
                  <div className="text-blue-600 hover:text-blue-800 flex items-center opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm pr-2">
                    Review <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="py-24 text-center">
             <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
             <p className="text-gray-500 text-sm">No active reports match your current filters.</p>
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
          onUpdateStatus={(id: string, status: string) => {
            setReports(prev => prev.map(r => r.reportId === id ? { ...r, status } as ReportData : r));
            setSelectedReport(prev => prev?.reportId === id ? { ...prev, status } as ReportData : prev);
          }}
        />
      )}
    </div>
  );
}
