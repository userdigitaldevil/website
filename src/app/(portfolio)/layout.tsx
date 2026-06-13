import { getCachedContent } from '@/lib/content';
import Masthead from '@/components/Masthead';
import DecoHeader from '@/components/DecoHeader';

export default async function PortfolioLayout({ children }: { children: React.ReactNode }) {
  const content = await getCachedContent();
  const name = content['site_name'] || 'SETHAGUILA';

  return (
    <div className="deco-page">
      <Masthead siteName={name} />
      <DecoHeader />
      <main className="deco-main">{children}</main>
    </div>
  );
}
