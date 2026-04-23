'use client';
import Link from 'next/link';
import { Shield, ExternalLink } from 'lucide-react';

const govLinks = [
  { label: 'CERT-In', href: 'https://www.cert-in.org.in' },
  { label: 'MeitY', href: 'https://www.meity.gov.in' },
  { label: 'Cybercrime Portal', href: 'https://cybercrime.gov.in' },
  { label: 'Digital India', href: 'https://www.digitalindia.gov.in' },
  { label: 'NIC', href: 'https://www.nic.in' },
];

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-800 rounded-lg flex items-center justify-center text-white">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-gray-900">GovPortal</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Public incident reporting and threat intelligence system.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Submit Report</Link></li>
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Government Links */}
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Government Links</h3>
            <div className="grid grid-cols-2 gap-2">
              {govLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} GovPortal · Government of India · All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">RTI</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
