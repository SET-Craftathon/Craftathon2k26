'use client';
import Link from 'next/link';
import { Shield, ShieldAlert, Landmark, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function LandingHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-50 shadow-sm shrink-0 relative">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 bg-blue-900 rounded-lg shrink-0">
            <ShieldAlert size={26} className="text-blue-300" />
            <Landmark size={12} className="text-white absolute mt-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wide text-lg leading-tight text-gray-900">GovPortal</span>
            <span className="text-[10px] text-blue-600 font-bold tracking-widest uppercase">Public Sector</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {/* No visible login — single government admin accesses /login directly */}
          <div className="hidden md:block w-0" />
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-sm px-4 py-3 space-y-1 z-40">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === link.href ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
