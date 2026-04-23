'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, CheckCircle2, ShieldAlert, Clock, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Topbar() {
  const { tableSearch, setTableSearch, activeTab, setActiveTab, logout } = useAppStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTableSearch(value);
    if (activeTab !== 'threads' && value.length > 0) {
      setActiveTab('threads');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'New Incident Submitted', desc: 'Infrastructure issue reported at District 4', time: '2 mins ago', type: 'alert', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 2, title: 'Report #891 Resolved', desc: 'Public Safety issue has been marked resolved', time: '1 hour ago', type: 'success', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, title: 'System Update', desc: 'Federal intelligence database synced successfully', time: '3 hours ago', type: 'info', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 4, title: 'High Priority Alert', desc: 'Multiple noise complaints logged in Zone 7B', time: '4 hours ago', type: 'alert', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 5, title: 'Report #889 Updated', desc: 'Sanitation team assigned for review', time: '5 hours ago', type: 'info', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 6, title: 'Dossier CID Synced', desc: 'On-chain proof completed for 12 records', time: 'Yesterday', type: 'success', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 7, title: 'Weekly Digest Ready', desc: 'Export PDF for week 42 is now available', time: 'Yesterday', type: 'info', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-50 shadow-sm shrink-0 relative">
      <div className="flex items-center flex-1 max-w-lg">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search records..."
            value={tableSearch}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6 ml-4">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications" 
            className="relative p-2 text-gray-400 hover:text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col z-[100]"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                   <h4 className="text-sm font-bold text-gray-800">Recent Notifications</h4>
                   <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{notifications.length} New</span>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[340px] custom-scrollbar scroll-smooth">
                  {notifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 group">
                        <div className={`w-10 h-10 ${notif.bg} ${notif.color} rounded-full flex items-center justify-center shrink-0`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 mb-0.5 group-hover:text-blue-700 transition-colors">{notif.title}</p>
                          <p className="text-xs text-gray-500 leading-snug truncate">{notif.desc}</p>
                          <div className="flex items-center gap-1.5 mt-2 opacity-70">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                   <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors py-1">
                     View All Activity Center
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

        <button 
          onClick={async () => {
             try {
               await fetch('http://localhost:5000/api/admin/logout', { method: 'POST', credentials: 'include' });
             } catch (e) {
               console.error('Logout failed:', e);
             }
             logout();
             window.location.href = '/login';
          }}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-900 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5 sm:mr-1.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
