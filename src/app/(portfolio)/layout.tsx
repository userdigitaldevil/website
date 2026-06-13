import { getCachedContent } from '@/lib/content';
import Sidebar from '@/components/Sidebar';
import ContentHeader from '@/components/ContentHeader';

export default async function PortfolioLayout({ children }: { children: React.ReactNode }) {
  const content = await getCachedContent();
  const name = content['site_name'] || 'SETHAGUILA';

  return (
    <div className="site-layout">
      <Sidebar siteName={name} />
      <main className="content">
        <ContentHeader />
        {children}
      </main>
    </div>
  );
}
