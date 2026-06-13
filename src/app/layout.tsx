import type { Metadata, Viewport } from 'next';
import './globals.css';
import SiteFooter from '@/components/SiteFooter';
import CustomCursor from '@/components/CustomCursor';
import PageLoader from '@/components/PageLoader';
import AnalyticsBeacon from '@/components/AnalyticsBeacon';
import DecoFrame from '@/components/DecoFrame';
import { getCachedContent } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getCachedContent();
  const favicon = content['favicon'];
  const iconUrl = favicon
    ? (favicon.startsWith('/') || favicon.startsWith('http') ? favicon : `/api/uploads/content/${favicon}`)
    : '/favicon.ico';
  const siteName = content['site_name'] || 'SETHAGUILA';
  return {
    title: {
      default: siteName,
      template: `${siteName} - %s`,
    },
    icons: { icon: iconUrl },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageLoader />
        <AnalyticsBeacon />
        <DecoFrame />
        {children}
        <SiteFooter />
        <CustomCursor />
      </body>
    </html>
  );
}
