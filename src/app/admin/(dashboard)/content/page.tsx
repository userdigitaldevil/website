'use client';
import { useState, useEffect, useRef } from 'react';

export default function AdminContent() {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingSplashImg, setUploadingSplashImg] = useState(false);
  const [uploadingSplashVid, setUploadingSplashVid] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [uploadingBioPhoto, setUploadingBioPhoto] = useState(false);
  const [uploadingContactImg, setUploadingContactImg] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const splashImgRef   = useRef<HTMLInputElement>(null);
  const splashVidRef   = useRef<HTMLInputElement>(null);
  const musicRef       = useRef<HTMLInputElement>(null);
  const bioPhotoRef    = useRef<HTMLInputElement>(null);
  const contactImgRef  = useRef<HTMLInputElement>(null);
  const faviconRef     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then((data: Record<string, string>) => setFields(data));
  }, []);

  function set(key: string, val: string) {
    setFields(prev => ({ ...prev, [key]: val }));
  }

  async function uploadMedia(file: File, folder: 'splash' | 'music' | 'content', key: string, setLoading: (v: boolean) => void) {
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    setLoading(false);
    if (!res.ok) { setMsg({ type: 'error', text: 'Upload failed.' }); return; }
    const { filename } = await res.json();
    if (filename) set(key, filename);
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields }),
    });
    setSaving(false);
    setMsg(res.ok ? { type: 'success', text: 'Content saved!' } : { type: 'error', text: 'Save failed.' });
  }

  const splashVidSrc = fields.splash_video
    ? (fields.splash_video.startsWith('/') || fields.splash_video.startsWith('http') ? fields.splash_video : `/api/uploads/splash/${fields.splash_video}`)
    : null;

  return (
    <>
      <p className="admin-section-title">Site Content</p>
      {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}

      <div className="admin-two-col">
        <div>
          <p className="admin-section-title">General</p>
          <div className="admin-form">
            <div className="admin-field">
              <label>Site Name (shown in timecode)</label>
              <input value={fields.site_name || ''} onChange={e => set('site_name', e.target.value)} />
            </div>

            <div className="admin-field">
              <label>ENTER button destination (landing page)</label>
              <select value={fields.enter_destination || '/digital'} onChange={e => set('enter_destination', e.target.value)}>
                <option value="/bio">Bio + Resume</option>
                <option value="/contact">Contact</option>
                <option value="/digital">Photography — Digital</option>
                <option value="/iphone">Photography — iPhone</option>
                <option value="/videos">Videos</option>
                <option value="/projects">Projects</option>
              </select>
            </div>

            {/* Favicon */}
            <div className="admin-field">
              <label>Favicon (.ico, .png, .svg)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input value={fields.favicon || ''} onChange={e => set('favicon', e.target.value)} placeholder="filename.ico or https://..." style={{ flex: 1 }} />
                <button type="button" className="admin-btn secondary small" onClick={() => faviconRef.current?.click()} disabled={uploadingFavicon}>
                  {uploadingFavicon ? '…' : 'Upload'}
                </button>
                <input ref={faviconRef} type="file" accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(f, 'content', 'favicon', setUploadingFavicon); }} />
              </div>
              {fields.favicon && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={fields.favicon.startsWith('/') || fields.favicon.startsWith('http') ? fields.favicon : `/api/uploads/content/${fields.favicon}`}
                    alt="favicon preview"
                    style={{ width: 32, height: 32, objectFit: 'contain', background: '#1a1a1a', borderRadius: 4, padding: 4 }}
                  />
                  <span style={{ fontSize: '0.65rem', color: '#555' }}>Save to apply site-wide</span>
                  <button type="button" className="admin-btn danger small" onClick={() => set('favicon', '')}>Remove</button>
                </div>
              )}
            </div>

            {/* Splash Image */}
            <div className="admin-field">
              <label>Splash Image (used if no video)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input value={fields.splash_image || ''} onChange={e => set('splash_image', e.target.value)} placeholder="filename.jpg or https://..." style={{ flex: 1 }} />
                <button type="button" className="admin-btn secondary small" onClick={() => splashImgRef.current?.click()} disabled={uploadingSplashImg}>
                  {uploadingSplashImg ? '…' : 'Upload'}
                </button>
                <input ref={splashImgRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(f, 'content', 'splash_image', setUploadingSplashImg); }} />
              </div>
              {fields.splash_image && (
                <img src={fields.splash_image.startsWith('/') || fields.splash_image.startsWith('http') ? fields.splash_image : `/api/uploads/content/${fields.splash_image}`}
                  alt="" style={{ marginTop: '0.5rem', maxHeight: 70, objectFit: 'cover', borderRadius: 2, opacity: 0.8 }} />
              )}
            </div>

            {/* Splash Video */}
            <div className="admin-field">
              <label>Splash Video (autoplays, overrides image)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input value={fields.splash_video || ''} onChange={e => set('splash_video', e.target.value)} placeholder="filename.mp4 or https://..." style={{ flex: 1 }} />
                <button type="button" className="admin-btn secondary small" onClick={() => splashVidRef.current?.click()} disabled={uploadingSplashVid}>
                  {uploadingSplashVid ? '…' : 'Upload'}
                </button>
                <input ref={splashVidRef} type="file" accept="video/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(f, 'splash', 'splash_video', setUploadingSplashVid); }} />
              </div>
              {splashVidSrc && (
                <video src={splashVidSrc} muted playsInline
                  style={{ marginTop: '0.5rem', maxHeight: 70, objectFit: 'cover', borderRadius: 2, opacity: 0.8, display: 'block' }} />
              )}
              {fields.splash_video && (
                <button type="button" className="admin-btn danger small" style={{ marginTop: '0.4rem' }}
                  onClick={() => set('splash_video', '')}>Remove Video</button>
              )}
            </div>

            {/* Splash scroll text */}
            <div className="admin-field">
              <label>Landing Page — Large Text (centered, shown while scrolling)</label>
              <textarea rows={3} value={fields.splash_text || ''} onChange={e => set('splash_text', e.target.value)} placeholder="e.g. sethaguila.com or a personal statement..." />
            </div>
            <div className="admin-field">
              <label>Landing Page — Mid Text (right-aligned, above footer text)</label>
              <textarea rows={3} value={fields.splash_text_mid || ''} onChange={e => set('splash_text_mid', e.target.value)} placeholder="e.g. a tagline or location..." />
            </div>
            <div className="admin-field">
              <label>Landing Page — Footer Text (right-aligned, smallest, very bottom)</label>
              <textarea rows={3} value={fields.splash_text_sub || ''} onChange={e => set('splash_text_sub', e.target.value)} placeholder="e.g. copyright, credits, or a closing note..." />
            </div>

            {/* Splash Music */}
            <div className="admin-field">
              <label>Background Music (autoplays on landing page)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input value={fields.splash_music || ''} onChange={e => set('splash_music', e.target.value)} placeholder="filename.mp3 or https://..." style={{ flex: 1 }} />
                <button type="button" className="admin-btn secondary small" onClick={() => musicRef.current?.click()} disabled={uploadingMusic}>
                  {uploadingMusic ? '…' : 'Upload'}
                </button>
                <input ref={musicRef} type="file" accept="audio/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(f, 'music', 'splash_music', setUploadingMusic); }} />
              </div>
              {fields.splash_music && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <audio controls src={
                    fields.splash_music.startsWith('/') || fields.splash_music.startsWith('http')
                      ? fields.splash_music : `/api/uploads/music/${fields.splash_music}`
                  } style={{ height: 32, flex: 1 }} />
                  <button type="button" className="admin-btn danger small"
                    onClick={() => set('splash_music', '')}>Remove</button>
                </div>
              )}
            </div>
          </div>

          <p className="admin-section-title mt-2">Bio</p>
          <div className="admin-form">
            <div className="admin-field">
              <label>Bio Photo</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input value={fields.bio_photo || ''} onChange={e => set('bio_photo', e.target.value)} placeholder="photo.jpg or https://..." style={{ flex: 1 }} />
                <button type="button" className="admin-btn secondary small" onClick={() => bioPhotoRef.current?.click()} disabled={uploadingBioPhoto}>
                  {uploadingBioPhoto ? '…' : 'Upload'}
                </button>
                <input ref={bioPhotoRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(f, 'content', 'bio_photo', setUploadingBioPhoto); }} />
              </div>
              {fields.bio_photo && (
                <img src={fields.bio_photo.startsWith('/') || fields.bio_photo.startsWith('http') ? fields.bio_photo : `/api/uploads/content/${fields.bio_photo}`}
                  alt="" style={{ marginTop: '0.5rem', maxHeight: 70, objectFit: 'cover', borderRadius: 2, opacity: 0.8 }} />
              )}
            </div>
            <div className="admin-field">
              <label>Bio Text</label>
              <textarea rows={8} value={fields.bio_text || ''} onChange={e => set('bio_text', e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <p className="admin-section-title">Contact</p>
          <div className="admin-form">
            <div className="admin-field">
              <label>Contact Text (free text, displayed on contact page)</label>
              <textarea rows={8} value={fields.contact_text || ''} onChange={e => set('contact_text', e.target.value)} placeholder="e.g. email, social handles, location..." />
            </div>
            <div className="admin-field">
              <label>Contact Image (shown bottom-right on contact page)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input value={fields.contact_image || ''} onChange={e => set('contact_image', e.target.value)} placeholder="filename.jpg or https://..." style={{ flex: 1 }} />
                <button type="button" className="admin-btn secondary small" onClick={() => contactImgRef.current?.click()} disabled={uploadingContactImg}>
                  {uploadingContactImg ? '…' : 'Upload'}
                </button>
                <input ref={contactImgRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(f, 'content', 'contact_image', setUploadingContactImg); }} />
              </div>
              {fields.contact_image && (
                <img src={fields.contact_image.startsWith('/') || fields.contact_image.startsWith('http') ? fields.contact_image : `/api/uploads/content/${fields.contact_image}`}
                  alt="" style={{ marginTop: '0.5rem', maxHeight: 80, objectFit: 'contain', borderRadius: 2, opacity: 0.8 }} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <button className="admin-btn" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </>
  );
}
