import { getDb } from '@/lib/db';
import Timecode from '@/components/Timecode';
import SplashAudio from '@/components/SplashAudio';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function mediaSrc(val: string, folder: string) {
  if (!val) return '';
  if (val.startsWith('/') || val.startsWith('http')) return val;
  return `/uploads/${folder}/${val}`;
}

export default function SplashPage() {
  const db = getDb();
  const get = (key: string) => (db.prepare('SELECT value FROM content WHERE key=?').get(key) as any)?.value ?? '';

  const name         = get('site_name') || 'YOUR NAME';
  const splashVideo  = mediaSrc(get('splash_video'), 'splash');
  const splashImage  = mediaSrc(get('splash_image'), 'content');
  const splashMusic  = mediaSrc(get('splash_music'), 'music');
  const splashText    = get('splash_text');
  const splashTextMid = get('splash_text_mid');
  const splashTextSub = get('splash_text_sub');
  const showScroll    = splashText || splashTextMid || splashTextSub;

  return (
    <main className="splash-page">
      <section className="splash-hero">
        <div className="splash-image-area">
          <div className="splash-image-inner">
            {splashVideo ? (
              <video autoPlay muted loop playsInline src={splashVideo} />
            ) : splashImage ? (
              <img src={splashImage} alt="" />
            ) : null}
          </div>
        </div>

        <div className="splash-right">
          <Timecode siteName={name} variant="inline" />
          <Link href="/digital" className="splash-enter">ENTER</Link>
        </div>
      </section>

      {showScroll && (
        <section className="splash-scroll">
          {splashText && (
            <p className="splash-scroll-main">{splashText}</p>
          )}
          {(splashTextMid || splashTextSub) && (
            <div className="splash-scroll-footer">
              {splashTextMid && <p className="splash-scroll-mid">{splashTextMid}</p>}
              {splashTextSub && <p className="splash-scroll-sub">{splashTextSub}</p>}
            </div>
          )}
        </section>
      )}

      {splashMusic && <SplashAudio src={splashMusic} />}
    </main>
  );
}
