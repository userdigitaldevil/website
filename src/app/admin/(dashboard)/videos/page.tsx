'use client';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Video = { id: number; title: string | null; youtube_url: string | null; filename: string | null; category: string };

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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

  async function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = videos.map(v => v.id);
    const oldIndex = ids.indexOf(Number(active.id));
    const newIndex = ids.indexOf(Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(videos, oldIndex, newIndex);
    setVideos(reordered);

    const res = await fetch('/api/videos/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map(v => v.id) }),
    });
    if (!res.ok) { setMsg({ type: 'error', text: 'Reorder failed.' }); load(); }
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
        <p className="admin-reorder-hint">Drag the ⠿ handle to reorder videos.</p>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th>Title</th>
              <th>Category</th>
              <th>URL</th>
              <th></th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={videos.map(v => v.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {videos.map(v => (
                  <SortableVideoRow key={v.id} video={v} onDelete={deleteVideo} />
                ))}
                {videos.length === 0 && <tr><td colSpan={5} style={{ color: '#444', fontStyle: 'italic' }}>No videos yet.</td></tr>}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </>
  );
}

function SortableVideoRow({ video, onDelete }: { video: Video; onDelete: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: video.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: isDragging ? '#141414' : undefined,
    position: 'relative',
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td>
        <button
          type="button"
          className="admin-drag-handle inline"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      </td>
      <td>{video.title || '—'}</td>
      <td style={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em' }}>{video.category}</td>
      <td style={{ fontSize: '0.7rem', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {video.youtube_url || video.filename || '—'}
      </td>
      <td>
        <button className="admin-btn danger small" onClick={() => onDelete(video.id)}>Delete</button>
      </td>
    </tr>
  );
}
