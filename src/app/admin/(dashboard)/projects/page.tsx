'use client';
import { useState, useEffect, useRef } from 'react';

type Project = {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  year: string;
  sort_order: number;
};

const blank = (): Omit<Project, 'id' | 'sort_order'> => ({
  title: '',
  description: '',
  cover_image: '',
  year: String(new Date().getFullYear()),
});

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const data = await fetch('/api/projects').then(r => r.json());
    setProjects(data);
  }

  useEffect(() => { load(); }, []);

  function setField(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function uploadCover(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('files', file);
    fd.append('category', 'digital');
    fd.append('year', form.year || String(new Date().getFullYear()));
    const res = await fetch('/api/photos', { method: 'POST', body: fd });
    setUploading(false);
    if (!res.ok) { setMsg({ type: 'error', text: 'Upload failed.' }); return; }
    const all = await fetch('/api/photos').then(r => r.json()) as Array<{ id: number; filename: string }>;
    const latest = all.sort((a, b) => b.id - a.id)[0]?.filename;
    if (latest) setField('cover_image', latest);
  }

  async function save() {
    setMsg(null);
    const body = { ...form, year: form.year ? Number(form.year) : null };
    let res: Response;
    if (editId !== null) {
      res = await fetch(`/api/projects/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    if (!res.ok) { setMsg({ type: 'error', text: 'Save failed.' }); return; }
    setMsg({ type: 'success', text: editId !== null ? 'Project updated!' : 'Project added!' });
    setForm(blank());
    setEditId(null);
    load();
  }

  function startEdit(p: Project) {
    setEditId(p.id);
    setForm({ title: p.title, description: p.description, cover_image: p.cover_image, year: p.year ? String(p.year) : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(blank());
    setMsg(null);
  }

  async function del(id: number) {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    load();
  }

  const coverSrc = form.cover_image
    ? (form.cover_image.startsWith('/') || form.cover_image.startsWith('http')
      ? form.cover_image
      : `/api/uploads/photos/${form.cover_image}`)
    : null;

  return (
    <>
      <p className="admin-section-title">{editId !== null ? 'Edit Project' : 'Add Project'}</p>
      {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}

      <div className="admin-form" style={{ maxWidth: 620 }}>
        <div className="admin-field">
          <label>Title</label>
          <input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Project title" />
        </div>
        <div className="admin-field">
          <label>Year</label>
          <input value={form.year} onChange={e => setField('year', e.target.value)} placeholder="2024" style={{ maxWidth: 120 }} />
        </div>
        <div className="admin-field">
          <label>Description (optional)</label>
          <textarea rows={3} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Short project description…" />
        </div>
        <div className="admin-field">
          <label>Cover Image</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input value={form.cover_image} onChange={e => setField('cover_image', e.target.value)} placeholder="filename.jpg or https://..." style={{ flex: 1 }} />
            <button type="button" className="admin-btn secondary small" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? '…' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
          </div>
          {coverSrc && (
            <img src={coverSrc} alt="cover preview" style={{ marginTop: '0.5rem', maxHeight: 100, objectFit: 'cover', borderRadius: 2, opacity: 0.8 }} />
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="admin-btn" onClick={save}>{editId !== null ? 'Update Project' : 'Add Project'}</button>
          {editId !== null && (
            <button className="admin-btn secondary" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </div>

      <p className="admin-section-title mt-2">All Projects ({projects.length})</p>

      {projects.length === 0 && (
        <p style={{ color: '#444', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>No projects yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 700 }}>
        {projects.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 2, padding: '0.75rem 1rem' }}>
            {p.cover_image && (
              <img
                src={p.cover_image.startsWith('/') || p.cover_image.startsWith('http') ? p.cover_image : `/api/uploads/photos/${p.cover_image}`}
                alt=""
                style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.1rem' }}>{p.title}</p>
              {p.year && <p style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '0.05em' }}>{p.year}</p>}
              {p.description && <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              <button className="admin-btn secondary small" onClick={() => startEdit(p)}>Edit</button>
              <button className="admin-btn danger small" onClick={() => del(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
