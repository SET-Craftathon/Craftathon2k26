'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isAuthenticated, logout, hasHydrated } = useAppStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const verifyAuth = async () => {
      // Wait for hydration before checking auth
      if (!hasHydrated) return;

      // For any route this wraps, protect it
      if (!isAuthenticated || !token) {
        if (isAuthenticated) {
          logout(); // Clear stale authenticated state if token is gone
        }
        setIsVerifying(false);
        router.replace('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/admin/verify', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          logout();
          router.replace('/login');
        } else {
          // Token is valid
          setIsVerifying(false);
        }
      } catch (err) {
        console.error('Auth verification failed', err);
        logout();
        router.replace('/login');
      }
    };

    verifyAuth();
  }, [mounted, isAuthenticated, token, router, logout, hasHydrated]);

  if (!mounted || isVerifying) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
