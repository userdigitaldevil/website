import { getCachedContent } from '@/lib/content';
import ZoomImage from '@/components/ZoomImage';

export default async function ContactPage() {
  const content = await getCachedContent();
  const get = (k: string) => content[k] ?? '';

  const contactText = get('contact_text');
  const contactImage = get('contact_image');
  const contactImage2 = get('contact_image_2');

  function imgSrc(val: string) {
    if (!val) return '';
    if (val.startsWith('/') || val.startsWith('http')) return val;
    return `/api/uploads/content/${val}`;
  }

  return (
    <div className="contact-content">
      <div className="contact-body">
        {contactText && <p className="bio-text">{contactText}</p>}
      </div>
      {(contactImage || contactImage2) && (
        <div className="contact-images">
          {contactImage && <ZoomImage src={imgSrc(contactImage)} className="contact-image" />}
          {contactImage2 && <ZoomImage src={imgSrc(contactImage2)} className="contact-image" />}
        </div>
      )}
    </div>
  );
}
