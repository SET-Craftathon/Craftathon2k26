'use client';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import CustomCursor from './CustomCursor';
import { useAppStore } from '@/store/useAppStore';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <CustomCursor />
      <CommandPalette />
      <div className="flex h-screen overflow-hidden bg-scene">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
