'use client';
import { motion } from 'framer-motion';
import KpiCards from '@/components/dashboard/KpiCards';
import ChartsSection from '@/components/dashboard/ChartsSection';
import ReportsTable from '@/components/dashboard/ReportsTable';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import AiDrawer from '@/components/dashboard/AiDrawer';
import { KPI_DATA } from '@/lib/mockData';

export default function DashboardPage() {
  return (
    <div className="relative w-full max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Security Command Center</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1">Global infrastructure monitoring and AI threat analysis.</p>
        </div>
      </motion.div>

      {/* KPI Row */}
      <KpiCards data={KPI_DATA} />

      {/* Charts */}
      <ChartsSection />

      {/* Table & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportsTable />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Slide-in panel */}
      <AiDrawer />
    </div>
  );
}
