import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Report, SeverityLevel } from '@/lib/mockData';

interface AppState {
  // Layout
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Auth
  token: string | null;
  admin: { id: string; username: string; name: string } | null;
  isAuthenticated: boolean;
  login: (token: string, admin: { id: string; username: string; name: string }) => void;
  logout: () => void;

  // Tabs
  activeTab: 'dashboard' | 'threads' | 'chat';
  setActiveTab: (tab: 'dashboard' | 'threads' | 'chat') => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Drawer
  drawerOpen: boolean;
  drawerReport: Report | null;
  openDrawer: (report: Report) => void;
  closeDrawer: () => void;

  // Table filters
  tableSearch: string;
  tableFilter: SeverityLevel | 'all';
  setTableSearch: (q: string) => void;
  setTableFilter: (f: SeverityLevel | 'all') => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;

  // Chart<>Table sync
  hoveredTimestamp: string | null;
  setHoveredTimestamp: (t: string | null) => void;

  // Audio
  audioEnabled: boolean;
  toggleAudio: () => void;
  // Hydration
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

// Cookie Utilities
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      token: getCookie('token'),
      admin: null,
      isAuthenticated: !!getCookie('token'),
      login: (token, admin) => {
        setCookie('token', token);
        set({ token, admin, isAuthenticated: true });
      },
      logout: () => {
        deleteCookie('token');
        set({ token: null, admin: null, isAuthenticated: false, activeTab: 'dashboard' });
      },

      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      drawerOpen: false,
      drawerReport: null,
      openDrawer: (report) => set({ drawerOpen: true, drawerReport: report }),
      closeDrawer: () => set({ drawerOpen: false, drawerReport: null }),

      tableSearch: '',
      tableFilter: 'all',
      setTableSearch: (q) => set({ tableSearch: q }),
      setTableFilter: (f) => set({ tableFilter: f }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),

      hoveredTimestamp: null,
      setHoveredTimestamp: (t) => set({ hoveredTimestamp: t }),

      audioEnabled: false,
      toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'scc-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        audioEnabled: state.audioEnabled,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
        token: state.token, // Preserve token on refresh
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

