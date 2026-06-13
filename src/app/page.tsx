import { getCachedContent } from '@/lib/content';
import SplashAudio from '@/components/SplashAudio';
import SplashVideo from '@/components/SplashVideo';
import LiveClock from '@/components/LiveClock';
import ZoomImage from '@/components/ZoomImage';
import Link from 'next/link';

function mediaSrc(val: string, folder: string) {
  if (!val) return '';
  if (val.startsWith('/') || val.startsWith('http')) return val;
  return `/api/uploads/${folder}/${val}`;
}

export default async function SplashPage() {
  const content = await getCachedContent();
  const get = (k: string) => content[k] ?? '';

  const name         = get('site_name') || 'SETHAGUILA';
  const splashVideo  = mediaSrc(get('splash_video'), 'splash');
  const splashImage  = mediaSrc(get('splash_image'), 'content');
  const splashMusic  = mediaSrc(get('splash_music'), 'music');
  const splashText    = get('splash_text');
  const splashTextMid = get('splash_text_mid');
  const splashTextSub = get('splash_text_sub');
  const splashImageBottom = mediaSrc(get('splash_image_bottom'), 'content');
  const enterDest     = get('enter_destination') || '/digital';
  const showScroll    = splashText || splashTextMid || splashTextSub || splashImageBottom;

  return (
    <main className="splash-page">
      <section className="splash-hero">
        <div className="splash-panel">
          <div className="splash-panel-top">
            <span className="splash-name">{name}</span>
            <span className="splash-clock"><LiveClock /> — PORTFOLIO</span>
          </div>
          <div className="splash-panel-bottom">
            <span className="splash-enter-label">[ Enter site ]</span>
            <Link href={enterDest} className="splash-enter">ENTER</Link>
          </div>
        </div>
        <div className="splash-media">
          {splashVideo ? (
            <SplashVideo src={splashVideo} />
          ) : splashImage ? (
            <img src={splashImage} alt="" />
          ) : (
            <div className="splash-media-empty" />
          )}
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
          {splashImageBottom && (
            <ZoomImage src={splashImageBottom} className="splash-scroll-photo" />
          )}
        </section>
      )}

      {splashMusic && <SplashAudio src={splashMusic} />}
    </main>
  );
}
