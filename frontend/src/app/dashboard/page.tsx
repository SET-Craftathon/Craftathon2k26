'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import WeeklyGraph from '@/components/dashboard/WeeklyGraph';
import ContentTypePie from '@/components/dashboard/ContentTypePie';
import ThreadsView from '@/components/dashboard/ThreadsView';
import { ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';
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

export default function DashboardPage() {
  const { token, activeTab } = useAppStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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

    if (token) {
      if (activeTab === 'dashboard') {
        fetchDashboardData();
      } else {
        setLoading(false); // ThreadsView does its own loading
      }
    }
  }, [token, activeTab]);

  if (activeTab === 'threads') {
    return <ThreadsView />;
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hello Banner - Airbnb Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[48px] bg-white border border-gray-100 p-12 md:p-16 shadow-2xl shadow-gray-200/50"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#FF385C] rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-40 right-20 w-40 h-40 bg-[#008489] rounded-full blur-[80px]" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <h4 className="text-[#FF385C] font-black uppercase tracking-[0.3em] text-xs italic">Command Center Overview</h4>
          <h1 className="text-5xl md:text-6xl font-black text-[#222222] tracking-tighter leading-tight">
            Welcome back<br />
          </h1>
          <p className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed">
            Your intelligence network is active. We've detected <span className="text-[#222222] font-black underline underline-offset-4 decoration-[#FF385C] decoration-4">{data?.stats.pending || 0} alerts</span> that require your immediate attention.
          </p>
        </div>
      </motion.div>

      {/* KPI Row - Huge rounded corners, Airbnb style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'Total Scanned', val: data?.stats.total || 0, icon: Activity, bg: 'bg-[#F7F7F7]', text: 'text-[#222222]' },
          { label: 'Pending Review', val: data?.stats.pending || 0, icon: ShieldAlert, bg: 'bg-[#FFF1F2]', text: 'text-[#FF385C]' },
          { label: 'Resolved Now', val: data?.stats.resolved || 0, icon: CheckCircle2, bg: 'bg-[#F0FDF4]', text: 'text-[#00A699]' }
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all flex flex-col gap-6"
          >
            <div className={clsx("w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner", kpi.bg, kpi.text)}>
              <kpi.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{kpi.label}</p>
              <h3 className="text-4xl font-black text-[#222222] tracking-tighter">{kpi.val}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-12">
        <div className="bg-white border border-gray-100 p-10 rounded-[48px] shadow-sm">
           <div className="flex items-center justify-between mb-10">
             <h4 className="text-2xl font-black text-[#222222] tracking-tighter">Threat Velocity</h4>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-pulse" /> Live Tracking
             </div>
           </div>
           {data && <WeeklyGraph data={data.chartData.weeklyReports} />}
        </div>
        <div className="bg-white border border-gray-100 p-10 rounded-[48px] shadow-sm">
           <div className="flex items-center justify-between mb-10">
             <h4 className="text-2xl font-black text-[#222222] tracking-tighter">Category Flux</h4>
             <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-3 py-1.5 bg-gray-50 rounded-full italic">Global Intelligence</span>
           </div>
           {data && <ContentTypePie data={data.chartData.categories} />}
        </div>
      </div>
    </div>
  );
}
