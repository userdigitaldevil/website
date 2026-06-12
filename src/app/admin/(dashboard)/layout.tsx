import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <span className="admin-header-title">Admin Panel</span>
        <nav className="admin-nav">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/photos">Photos</Link>
          <Link href="/admin/videos">Videos</Link>
          <Link href="/admin/projects">Projects</Link>
          <Link href="/admin/content">Content</Link>
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/" target="_blank">View Site ↗</Link>
          <form action="/api/auth/logout" method="POST" style={{ display: 'inline' }}>
            <button type="submit" style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'inherit' }}>
              Logout
            </button>
          </form>
        </nav>
      </header>
      <div className="admin-body">{children}</div>
    </div>
  );
}
