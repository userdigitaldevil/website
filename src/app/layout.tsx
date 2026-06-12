import type { Metadata, Viewport } from 'next';
import './globals.css';
import SiteFooter from '@/components/SiteFooter';
import CustomCursor from '@/components/CustomCursor';
import PageLoader from '@/components/PageLoader';

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
        <PageLoader />
        {children}
        <SiteFooter />
        <CustomCursor />
      </body>
    </html>
  );
}
