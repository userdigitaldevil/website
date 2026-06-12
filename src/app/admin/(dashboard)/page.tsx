import { getDb } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const db = getDb();
  const photoCount = (db.prepare('SELECT COUNT(*) as c FROM photos').get() as any).c;
  const videoCount = (db.prepare('SELECT COUNT(*) as c FROM videos').get() as any).c;
  const siteName = (db.prepare('SELECT value FROM content WHERE key=?').get('site_name') as any)?.value ?? '';

  return (
    <>
      <p className="admin-section-title">Dashboard</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Photos', count: photoCount, href: '/admin/photos' },
          { label: 'Videos', count: videoCount, href: '/admin/videos' },
          { label: 'Site Name', count: siteName, href: '/admin/content' },
        ].map(card => (
          <Link href={card.href} key={card.label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 2, padding: '1.25rem 1.5rem', textDecoration: 'none', color: '#fff' }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '0.5rem' }}>{card.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{card.count}</p>
          </Link>
        ))}
      </div>

      <p className="admin-section-title">Quick Links</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/admin/photos" className="admin-btn secondary">Upload Photos</Link>
        <Link href="/admin/videos" className="admin-btn secondary">Add Videos</Link>
        <Link href="/admin/content" className="admin-btn secondary">Edit Content</Link>
      </div>
    </>
  );
}
