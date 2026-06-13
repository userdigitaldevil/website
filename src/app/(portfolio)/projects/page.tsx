import { getDb, type Project } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Projects' };

export default function ProjectsPage() {
  const projects = getDb().prepare('SELECT * FROM projects ORDER BY sort_order ASC, id DESC').all() as Project[];

  return (
    <div className="gallery-wrap">
      {projects.length === 0 && (
        <p style={{ color: '#333', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          No projects yet.
        </p>
      )}
      <div className="projects-grid">
        {projects.map(p => (
          <div className="project-card" key={p.id}>
            <div className="project-cover">
              {p.cover_image ? (
                <img
                  src={p.cover_image.startsWith('/') || p.cover_image.startsWith('http')
                    ? p.cover_image
                    : `/api/uploads/photos/${p.cover_image}`}
                  alt={p.title}
                />
              ) : (
                <div className="project-cover-placeholder" />
              )}
            </div>
            <div className="project-info">
              <span className="project-title">{p.title}</span>
              {p.year && <span className="project-year">{p.year}</span>}
            </div>
            {p.description && <p className="project-desc">{p.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
