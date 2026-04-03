import type { Metadata } from 'next';
import './globals.css';
import { LayoutShell } from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: 'Security Command Center',
  description: 'Enterprise-grade threat monitoring and AI-powered security analytics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
