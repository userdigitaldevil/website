'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LiveClock from '@/components/LiveClock';

const links = [
  { label: 'Photography', href: '/digital', index: '01' },
  { label: 'Videos', href: '/videos', index: '02' },
  { label: 'Projects', href: '/projects', index: '03' },
  { label: 'Bio + Resume', href: '/bio', index: '04' },
  { label: 'Contact', href: '/contact', index: '05' },
];

const photoRoutes = ['/digital', '/iphone'];

export default function Sidebar({ siteName }: { siteName: string }) {
  const path = usePathname();
  const onPhoto = photoRoutes.some(r => path.startsWith(r));

  const isActive = (href: string) => {
    if (href === '/digital') return onPhoto;
    return path.startsWith(href);
  };

  return (
    <aside className="sidebar">
      <Link href="/" className="side-name">{siteName}</Link>

      <nav className="side-nav">
        {links.map(l => (
          <div className="side-item" key={l.href}>
            <Link href={l.href} className={`side-link${isActive(l.href) ? ' active' : ''}`}>
              <span className="side-link-index">{l.index}</span>
              <span>{l.label}</span>
            </Link>
            {l.href === '/digital' && onPhoto && (
              <div className="side-sub">
                <Link href="/digital" className={`side-sublink${path.startsWith('/digital') ? ' active' : ''}`}>Digital</Link>
                <Link href="/iphone" className={`side-sublink${path.startsWith('/iphone') ? ' active' : ''}`}>iPhone</Link>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="side-foot">
        <span className="side-foot-clock"><LiveClock /></span>
        <span>© {new Date().getFullYear()} {siteName}</span>
      </div>
    </aside>
  );
}
