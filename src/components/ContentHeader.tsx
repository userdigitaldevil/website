'use client';
import { usePathname } from 'next/navigation';

const MAP: { match: string; title: string; index: string }[] = [
  { match: '/digital', title: 'Photography', index: '01 / 05' },
  { match: '/iphone', title: 'Photography', index: '01 / 05' },
  { match: '/videos', title: 'Videos', index: '02 / 05' },
  { match: '/projects', title: 'Projects', index: '03 / 05' },
  { match: '/bio', title: 'Bio + Resume', index: '04 / 05' },
  { match: '/contact', title: 'Contact', index: '05 / 05' },
];

export default function ContentHeader() {
  const path = usePathname();
  const entry = MAP.find(m => path.startsWith(m.match));
  if (!entry) return null;

  return (
    <div className="content-header">
      <span className="content-header-title">{entry.title}</span>
      <span className="content-header-index">{entry.index}</span>
    </div>
  );
}
