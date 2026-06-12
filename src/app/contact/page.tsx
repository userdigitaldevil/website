import { getCachedContent } from '@/lib/content';
import Timecode from '@/components/Timecode';
import Nav from '@/components/Nav';

export default async function ContactPage() {
  const content = await getCachedContent();
  const get = (k: string) => content[k] ?? '';

  const name = get('site_name');
  const contactText = get('contact_text');
  const contactImage = get('contact_image');

  function imgSrc(val: string) {
    if (!val) return '';
    if (val.startsWith('/') || val.startsWith('http')) return val;
    return `/api/uploads/content/${val}`;
  }

  return (
    <>
      <header className="page-header">
        <Timecode siteName={name} />
        <Nav />
      </header>
      <div className="contact-content">
        <div className="contact-body">
          {contactText && <p className="bio-text">{contactText}</p>}
        </div>
        {contactImage && (
          <img src={imgSrc(contactImage)} alt="" className="contact-image" />
        )}
      </div>
    </>
  );
}
