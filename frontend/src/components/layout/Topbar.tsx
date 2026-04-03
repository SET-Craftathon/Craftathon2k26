'use client';
import { Bell, Search, Sun, Moon, Volume2, VolumeX, Command } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAudioCues } from '@/hooks/useAudioCues';

export default function Topbar() {
  const { theme, toggleTheme, setCommandPaletteOpen, audioEnabled, toggleAudio } = useAppStore();
  const { tick } = useAudioCues();

  return (
    <header
      className="flex items-center justify-between px-6 h-14 border-b shrink-0"
      style={{
        background: 'var(--bg-surface-trans-more)',
        borderColor: 'var(--border-05)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Search / Command Palette trigger */}
      <button
        onClick={() => { setCommandPaletteOpen(true); tick(); }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:text-gray-700 dark:text-gray-300 hover:border-indigo-500/30 transition-all cursor-none group"
        style={{ borderColor: 'var(--border-08)', background: 'oklch(100% 0 0 / 0.02)' }}
      >
        <Search size={14} className="group-hover:text-indigo-400 transition-colors" />
        <span className="hidden sm:inline">Search threats...</span>
        <span className="hidden sm:flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: 'var(--border-1)' }}>
          <Command size={9} /><span>K</span>
        </span>
      </button>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Audio toggle */}
        <button
          onClick={() => { toggleAudio(); tick(); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:text-gray-700 dark:text-gray-300 transition-all cursor-none"
          title={audioEnabled ? 'Mute audio cues' : 'Enable audio cues'}
        >
          {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => { toggleTheme(); tick(); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:text-gray-700 dark:text-gray-300 transition-all cursor-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:text-gray-700 dark:text-gray-300 transition-all cursor-none">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'oklch(100% 0 0 / 0.08)' }} />

        {/* Avatar */}
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-black/5 dark:bg-white/5 transition-all cursor-none">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-semibold text-gray-900 dark:text-white">
            AM
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-tight">Arjun Mehta</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">Senior Analyst</p>
          </div>
        </button>
      </div>
    </header>
  );
}
