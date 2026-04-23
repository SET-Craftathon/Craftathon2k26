'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import WeeklyGraph from '@/components/dashboard/WeeklyGraph';
import ContentTypePie from '@/components/dashboard/ContentTypePie';
import ThreadsView from '@/components/dashboard/ThreadsView';
import RagChat from '@/components/dashboard/RagChat';
import ReportModal, { ReportData } from '@/components/dashboard/ReportModal';
import { ShieldAlert, Activity, CheckCircle2, Plus, ChevronRight, FileText } from 'lucide-react';
import clsx from 'clsx';

interface DashboardData {
  stats: {
    total: number;
    pending: number;
    resolved: number;
  };
  chartData: {
    weeklyReports: { name: string; value: number }[];
    categories: { name: string; value: number }[];
  };
}

const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    Reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  const badgeStyle = styles[status] || styles.Pending;

  return (
    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${badgeStyle}`}>
      {status}
    </span>
  );
};

const StatCard = ({ title, value, context }: { title: string, value: string | number, context: string }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
    <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
    <dd className="mt-2 text-3xl font-semibold text-gray-900">{value}</dd>
    <div className="mt-4 flex items-center text-sm text-gray-500">
      <span>{context}</span>
    </div>
  </div>
);

export default function DashboardPage() {
  const { token, activeTab, setActiveTab } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();
        
        if (json.status === 'success') {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentReports = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.status === 'success') {
          setRecentReports(json.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to fetch recent reports:', err);
      }
    };

    if (token) {
      if (activeTab === 'dashboard') {
        fetchDashboardData();
        fetchRecentReports();
      } else {
        setLoading(false);
      }
    }
  }, [token, activeTab]);

  if (activeTab === 'threads') {
    return <ThreadsView />;
  }

  if (activeTab === 'chat') {
    return <RagChat />;
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getSeverityBadge = (severity: string, status: string) => {
    if (status === 'RESOLVED') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (severity === 'HIGHEST' || severity === 'HIGH') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (severity === 'MEDIUM') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusLabel = (severity: string, status: string) => {
    if (status === 'RESOLVED') return 'Resolved';
    if (status === 'REVIEWED') return 'Reviewed';
    if (status === 'DISMISSED') return 'Dismissed';
    if (severity === 'HIGHEST' || severity === 'HIGH') return 'High Priority';
    return 'Pending Review';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-gray-800 pb-12">
      
      {/* Welcome Section */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">System Overview</h2>
          <p className="mt-1 text-sm text-gray-500">Monitor overall public incident reporting metrics and platform activity.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {/* Action buttons can go here */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Incident Reports" value={data?.stats.total || 0} context="Across all departments" />
        <StatCard title="Pending Review" value={data?.stats.pending || 0} context="Awaiting assignment and triage" />
        <StatCard title="Successfully Resolved" value={data?.stats.resolved || 0} context="Cases closed gracefully" />
      </div>

      {/* Data Table Section — REAL REPORTS */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-400" />
            Recent Priority Incidents
          </h3>
          <button onClick={() => setActiveTab('threads')} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 text-xs w-full sm:w-auto">
            View All Reports
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Report ID</th>
                <th scope="col" className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Filed</th>
                <th scope="col" className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type / Description</th>
                <th scope="col" className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentReports.length > 0 ? recentReports.map((report) => (
                <tr key={report.reportId} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedReport(report)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                    {report.reportId.slice(0, 12).toUpperCase()}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{report.contentType}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{report.description || 'No description'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityBadge(report.severity, report.status)}`}>
                      {getStatusLabel(report.severity, report.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className="text-blue-600 hover:text-blue-900 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      Details <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">No reports found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-500 text-center">Showing the {recentReports.length} most recent reports. Click any row for full details.</p>
        </div>
      </div>

      {/* Main Charts - High-Density Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
        
        {/* Threat Velocity -> Incident Timeline */}
        <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm relative overflow-hidden group">
           <div className="flex items-center justify-between mb-8">
             <div>
                <h4 className="text-xl font-bold text-gray-900 tracking-tight">Reporting Trends</h4>
                <p className="text-sm text-gray-500 mt-1">Weekly incident reporting volume</p>
             </div>
           </div>
           <div className="relative z-10 w-full overflow-hidden [&_.recharts-text]:fill-gray-600 [&_.recharts-cartesian-grid-horizontal_line]:stroke-gray-100 [&_.recharts-cartesian-grid-vertical_line]:stroke-gray-100">
              {data && <WeeklyGraph data={data.chartData.weeklyReports} />}
           </div>
        </div>

        {/* Category flux -> Incident Categories */}
        <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm relative overflow-hidden group">
           <div className="flex items-center justify-between mb-8">
             <div>
                <h4 className="text-xl font-bold text-gray-900 tracking-tight">Category Distribution</h4>
                <p className="text-sm text-gray-500 mt-1">Breakdown by incident type classification</p>
             </div>
           </div>
           <div className="relative z-10 w-full overflow-hidden [&_.recharts-text]:fill-gray-700">
              {data && <ContentTypePie data={data.chartData.categories} />}
           </div>
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={(id: string, status: string) => {
            setRecentReports(prev => prev.map(r => r.reportId === id ? { ...r, status } as ReportData : r));
            setSelectedReport(prev => prev?.reportId === id ? { ...prev, status } as ReportData : prev);
          }}
        />
      )}
    </div>
  );
}
