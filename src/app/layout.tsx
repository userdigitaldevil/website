import type { Metadata, Viewport } from 'next';
import './globals.css';
import SiteFooter from '@/components/SiteFooter';
import CustomCursor from '@/components/CustomCursor';

export const metadata: Metadata = {
  title: 'Portfolio',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteFooter />
        <CustomCursor />
      </body>
    </html>
  );
}
