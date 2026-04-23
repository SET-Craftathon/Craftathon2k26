'use client';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import CommandPalette from './CommandPalette';

import CustomCursor from './CustomCursor';
import { useAppStore } from '@/store/useAppStore';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore();
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/about' || pathname === '/contact';
  const isLoginPage = pathname === '/login';
  const showAdminUI = !isPublicPage && !isLoginPage;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      {showAdminUI && <CommandPalette />}

      <div className={clsx(
        'flex h-screen overflow-hidden transition-colors duration-500 font-sans',
        'bg-gray-50'
      )}>
        {showAdminUI && <Sidebar />}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          {showAdminUI && <Topbar />}
          {isPublicPage && <LandingHeader />}
          <main className={clsx(
            'flex-1 overflow-y-auto overflow-x-hidden w-full relative',
            showAdminUI ? 'p-4 sm:p-6 lg:p-8' : ''
          )}>
            <div className={clsx(showAdminUI && "mx-auto w-full max-w-7xl")}>
              {children}
            </div>
            {isPublicPage && <LandingFooter />}
          </main>
        </div>
      </div>
    </>
  );
}
