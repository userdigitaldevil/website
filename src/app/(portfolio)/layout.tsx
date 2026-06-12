import { getCachedContent } from '@/lib/content';
import Timecode from '@/components/Timecode';
import Nav from '@/components/Nav';

export default async function PortfolioLayout({ children }: { children: React.ReactNode }) {
  const content = await getCachedContent();
  const name = content['site_name'] ?? 'YOUR NAME';

  return (
    <>
      <header className="page-header">
        <Timecode siteName={name} />
        <Nav />
      </header>
      {children}
    </>
  );
}
