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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Photo = { id: number; filename: string; category: string; year: number; original_name: string | null };

const groupKey = (p: Photo) => `${p.category}__${p.year}`;

export default function AdminPhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('digital');
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterCat, setFilterCat] = useState('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

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

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} photo${selected.size > 1 ? 's' : ''}?`)) return;
    setDeleting(true);
    const res = await fetch('/api/photos/bulk-delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected] }),
    });
    setDeleting(false);
    if (res.ok) {
      setMsg({ type: 'success', text: `Deleted ${selected.size} photo${selected.size > 1 ? 's' : ''}.` });
      setSelected(new Set());
      load();
    } else {
      setMsg({ type: 'error', text: 'Bulk delete failed.' });
    }
  }

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === visible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map(p => p.id)));
    }
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

  async function reorderGroup(key: string, reordered: Photo[]) {
    setPhotos(prev => {
      const next = prev.slice();
      const slots: number[] = [];
      prev.forEach((p, i) => { if (groupKey(p) === key) slots.push(i); });
      slots.forEach((flatIdx, k) => { next[flatIdx] = reordered[k]; });
      return next;
    });
    const res = await fetch('/api/photos/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map(p => p.id) }),
    });
    if (!res.ok) { setMsg({ type: 'error', text: 'Reorder failed.' }); load(); }
  }

  const visible = filterCat === 'all' ? photos : photos.filter(p => p.category === filterCat);

  const groups: { key: string; category: string; year: number; items: Photo[] }[] = [];
  const index = new Map<string, number>();
  for (const p of visible) {
    const key = groupKey(p);
    if (!index.has(key)) {
      index.set(key, groups.length);
      groups.push({ key, category: p.category, year: p.year, items: [] });
    }
    groups[index.get(key)!].items.push(p);
  }

  const allSelected = visible.length > 0 && selected.size === visible.length;

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p className="admin-section-title" style={{ margin: 0 }}>All Photos ({visible.length})</p>
            {visible.length > 0 && (
              <button type="button" className="admin-btn secondary small" onClick={toggleSelectAll}>
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
            {selected.size > 0 && (
              <button type="button" className="admin-btn danger small" onClick={bulkDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : `Delete ${selected.size} selected`}
              </button>
            )}
          </div>
          <select
            value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setSelected(new Set()); }}
            style={{ background: '#111', border: '1px solid #252525', color: '#fff', padding: '0.3rem 0.6rem', fontSize: '0.7rem', fontFamily: 'inherit', borderRadius: 2 }}
          >
            <option value="all">All</option>
            <option value="digital">Digital</option>
            <option value="iphone">iPhone</option>
          </select>
        </div>

        <p className="admin-reorder-hint">Drag ⠿ to reorder · click image to select for bulk delete.</p>

        {groups.map(group => (
          <PhotoGroup
            key={group.key}
            group={group}
            selected={selected}
            onToggleSelect={toggleSelect}
            onReorder={reorderGroup}
            onUpdate={updatePhoto}
            onDelete={deletePhoto}
          />
        ))}
      </div>
    </>
  );
}

function PhotoGroup({
  group, selected, onToggleSelect, onReorder, onUpdate, onDelete,
}: {
  group: { key: string; category: string; year: number; items: Photo[] };
  selected: Set<number>;
  onToggleSelect: (id: number) => void;
  onReorder: (key: string, reordered: Photo[]) => void;
  onUpdate: (id: number, field: string, value: string | number) => void;
  onDelete: (id: number) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ids = group.items.map(p => p.id);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(Number(active.id));
    const newIndex = ids.indexOf(Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(group.key, arrayMove(group.items, oldIndex, newIndex));
  }

  return (
    <div className="admin-photo-group">
      <p className="admin-group-label">{group.category} · {group.year}</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="admin-grid">
            {group.items.map(p => (
              <SortablePhotoCard
                key={p.id}
                photo={p}
                selected={selected.has(p.id)}
                onToggleSelect={onToggleSelect}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortablePhotoCard({
  photo, selected, onToggleSelect, onUpdate, onDelete,
}: {
  photo: Photo;
  selected: boolean;
  onToggleSelect: (id: number) => void;
  onUpdate: (id: number, field: string, value: string | number) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={`admin-photo-card${selected ? ' admin-photo-selected' : ''}`}>
      <button type="button" className="admin-drag-handle" aria-label="Drag to reorder" {...attributes} {...listeners}>⠿</button>
      <button type="button" className="admin-select-check" aria-label="Select" onClick={() => onToggleSelect(photo.id)}>
        {selected ? '✓' : ''}
      </button>
      <img src={`/api/uploads/photos/${photo.filename}`} alt={photo.original_name || ''} draggable={false} onClick={() => onToggleSelect(photo.id)} style={{ cursor: 'pointer' }} />
      <div className="admin-photo-card-info">
        <p className="admin-photo-card-meta">{photo.original_name || photo.filename}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          <select value={photo.category} onChange={e => onUpdate(photo.id, 'category', e.target.value)}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc', padding: '0.3rem', fontSize: '0.65rem', fontFamily: 'inherit', borderRadius: 2 }}>
            <option value="digital">Digital</option>
            <option value="iphone">iPhone</option>
          </select>
          <input type="number" value={photo.year} onChange={e => onUpdate(photo.id, 'year', Number(e.target.value))}
            min={2000} max={2099}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#ccc', padding: '0.3rem', fontSize: '0.65rem', fontFamily: 'inherit', borderRadius: 2, width: '100%' }} />
        </div>
        <div className="admin-photo-card-actions">
          <button className="admin-btn danger small" onClick={() => onDelete(photo.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}
