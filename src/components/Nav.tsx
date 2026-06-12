'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SubNav = { label: string; href: string }[];

const mainRows = [
  [
    { label: 'MENU', href: '/' },
    { label: 'BIO+RESUME', href: '/bio' },
    { label: 'CONTACT', href: '/contact' },
  ],
  [
    { label: 'PHOTOGRAPHY', href: '/digital' },
    { label: 'VIDEOS', href: '/videos' },
    { label: 'PROJECTS', href: '/projects' },
  ],
];

const photoSubNav: SubNav = [
  { label: 'DIGITAL', href: '/digital' },
  { label: 'IPHONE', href: '/iphone' },
];

const photoRoutes = ['/digital', '/iphone'];

export default function Nav() {
  const path = usePathname();
  const showSubNav = photoRoutes.some(r => path.startsWith(r));

  function isActive(href: string) {
    if (href === '/') return false;
    if (href === '/photography') return photoRoutes.some(r => path.startsWith(r));
    if (href === '/digital') return photoRoutes.some(r => path.startsWith(r));
    return path.startsWith(href);
  }

  return (
    <nav className="main-nav">
      {mainRows.map((row, ri) => (
        <div className="nav-row" key={ri}>
          {row.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${isActive(item.href) ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      {showSubNav && (
        <div className="sub-nav">
          {photoSubNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sub-link${path.startsWith(item.href) ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
