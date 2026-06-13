'use client';
import { usePathname } from 'next/navigation';

export default function DecoFrame() {
  const path = usePathname();
  if (path.startsWith('/admin')) return null;
  return <div className="deco-frame" aria-hidden />;
}
