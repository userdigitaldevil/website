'use client';
import { useState, useEffect } from 'react';

type Photo = { id: number; filename: string; category: string; year: number; original_name: string | null };

export default function AdminPhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('digital');
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterCat, setFilterCat] = useState('all');

  async function load() {
    const res = await fetch('/api/photos');
    if (res.ok) setPhotos(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    fd.set('category', category);
    fd.set('year', String(year));
    const res = await fetch('/api/photos', { method: 'POST', body: fd });
    setUploading(false);
    if (res.ok) {
      setMsg({ type: 'success', text: 'Photos uploaded!' });
      load();
      (e.target as HTMLFormElement).reset();
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg({ type: 'error', text: j.error || 'Upload failed' });
    }
  }

  async function deletePhoto(id: number) {
    if (!confirm('Delete this photo?')) return;
    const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
    if (res.ok) { setMsg({ type: 'success', text: 'Deleted.' }); load(); }
    else setMsg({ type: 'error', text: 'Delete failed.' });
  }

  async function updatePhoto(id: number, field: string, value: string | number) {
    const res = await fetch(`/api/photos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) load();
    else setMsg({ type: 'error', text: 'Update failed.' });
  }

  const visible = filterCat === 'all' ? photos : photos.filter(p => p.category === filterCat);

  return (
    <>
      <p className="admin-section-title">Upload Photos</p>
      {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}

      <form className="admin-form" onSubmit={handleUpload}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="admin-field">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="digital">Digital</option>
              <option value="iphone">iPhone</option>
            </select>
          </div>
          <div className="admin-field">
            <label>Year</label>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} min={2000} max={2099} />
          </div>
        </div>
        <div className="admin-field">
          <label>Photos (multiple allowed)</label>
          <input type="file" name="files" accept="image/*" multiple required />
        </div>
        <button className="admin-btn" type="submit" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      <div className="mt-2">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="admin-section-title" style={{ margin: 0 }}>All Photos ({visible.length})</p>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            style={{ background: '#111', border: '1px solid #252525', color: '#fff', padding: '0.3rem 0.6rem', fontSize: '0.7rem', fontFamily: 'inherit', borderRadius: 2 }}
          >
            <option value="all">All</option>
            <option value="digital">Digital</option>
            <option value="iphone">iPhone</option>
          </select>
        </div>

        <div className="admin-grid">
          {visible.map(p => (
            <div className="admin-photo-card" key={p.id}>
              <img src={`/uploads/photos/${p.filename}`} alt={p.original_name || ''} />
              <div className="admin-photo-card-info">
                <p className="admin-photo-card-meta">{p.original_name || p.filename}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <select
                    value={p.category}
                    onChange={e => updatePhoto(p.id, 'category', e.target.value)}
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc', padding: '0.3rem', fontSize: '0.65rem', fontFamily: 'inherit', borderRadius: 2 }}
                  >
                    <option value="digital">Digital</option>
                    <option value="iphone">iPhone</option>
                  </select>
                  <input
                    type="number"
                    value={p.year}
                    onChange={e => updatePhoto(p.id, 'year', Number(e.target.value))}
                    min={2000} max={2099}
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc', padding: '0.3rem', fontSize: '0.65rem', fontFamily: 'inherit', borderRadius: 2, width: '100%' }}
                  />
                </div>
                <div className="admin-photo-card-actions">
                  <button className="admin-btn danger small" onClick={() => deletePhoto(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
