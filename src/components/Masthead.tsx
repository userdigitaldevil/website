'use client';
import Link from 'next/link';
import { Fragment } from 'react';
import { usePathname } from 'next/navigation';

const links = [
  { label: 'Photography', href: '/digital' },
  { label: 'Videos', href: '/videos' },
  { label: 'Projects', href: '/projects' },
  { label: 'Bio', href: '/bio' },
  { label: 'Contact', href: '/contact' },
];

const photoRoutes = ['/digital', '/iphone'];

export default function Masthead({ siteName }: { siteName: string }) {
  const path = usePathname();
  const onPhoto = photoRoutes.some(r => path.startsWith(r));
  const isActive = (href: string) => (href === '/digital' ? onPhoto : path.startsWith(href));

  return (
    <header className="masthead">
      <Link href="/" className="masthead-name">{siteName}</Link>

      <div className="deco-rule">
        <span className="deco-line" />
        <span className="deco-diamond">◆</span>
        <span className="deco-line" />
      </div>

      <nav className="masthead-nav">
        {links.map((l, i) => (
          <Fragment key={l.href}>
            {i > 0 && <span className="mast-sep" aria-hidden>◆</span>}
            <Link href={l.href} className={`mast-link${isActive(l.href) ? ' active' : ''}`}>{l.label}</Link>
          </Fragment>
        ))}
      </nav>

      {onPhoto && (
        <nav className="masthead-subnav">
          <Link href="/digital" className={`mast-sublink${path.startsWith('/digital') ? ' active' : ''}`}>Digital</Link>
          <span className="mast-sep small" aria-hidden>·</span>
          <Link href="/iphone" className={`mast-sublink${path.startsWith('/iphone') ? ' active' : ''}`}>iPhone</Link>
        </nav>
      )}
    </header>
  );
}
