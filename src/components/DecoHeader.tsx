'use client';
import { usePathname } from 'next/navigation';

const MAP: { match: string; title: string }[] = [
  { match: '/digital', title: 'Photography' },
  { match: '/iphone', title: 'Photography' },
  { match: '/videos', title: 'Videos' },
  { match: '/projects', title: 'Projects' },
  { match: '/bio', title: 'Bio & Resume' },
  { match: '/contact', title: 'Contact' },
];

export default function DecoHeader() {
  const path = usePathname();
  const entry = MAP.find(m => path.startsWith(m.match));
  if (!entry) return null;

  return (
    <div className="deco-header">
      <span className="deco-line" />
      <span className="deco-diamond">◆</span>
      <h1 className="deco-header-title">{entry.title}</h1>
      <span className="deco-diamond">◆</span>
      <span className="deco-line" />
    </div>
  );
}
