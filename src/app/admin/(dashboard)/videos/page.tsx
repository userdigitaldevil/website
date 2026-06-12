'use client';
import { useState, useEffect } from 'react';

type Video = { id: number; title: string | null; youtube_url: string | null; filename: string | null; category: string };

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch('/api/videos');
    if (res.ok) setVideos(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fd.get('title'),
        youtube_url: fd.get('youtube_url'),
        category: fd.get('category'),
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg({ type: 'success', text: 'Video added!' });
      load();
      (e.target as HTMLFormElement).reset();
    } else {
      setMsg({ type: 'error', text: 'Failed to add video.' });
    }
  }

  async function deleteVideo(id: number) {
    if (!confirm('Delete this video?')) return;
    const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    if (res.ok) { setMsg({ type: 'success', text: 'Deleted.' }); load(); }
    else setMsg({ type: 'error', text: 'Delete failed.' });
  }

  return (
    <>
      <p className="admin-section-title">Add Video</p>
      {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}

      <form className="admin-form" onSubmit={handleAdd}>
        <div className="admin-field">
          <label>Title (optional)</label>
          <input name="title" type="text" placeholder="My Video Title" />
        </div>
        <div className="admin-field">
          <label>YouTube URL</label>
          <input name="youtube_url" type="url" placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <input type="hidden" name="category" value="videos" />
        <button className="admin-btn" type="submit" disabled={saving}>
          {saving ? 'Adding…' : 'Add Video'}
        </button>
      </form>

      <div className="mt-2">
        <p className="admin-section-title">All Videos ({videos.length})</p>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>URL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {videos.map(v => (
              <tr key={v.id}>
                <td>{v.title || '—'}</td>
                <td style={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em' }}>{v.category}</td>
                <td style={{ fontSize: '0.7rem', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.youtube_url || v.filename || '—'}
                </td>
                <td>
                  <button className="admin-btn danger small" onClick={() => deleteVideo(v.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {videos.length === 0 && <tr><td colSpan={4} style={{ color: '#444', fontStyle: 'italic' }}>No videos yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
