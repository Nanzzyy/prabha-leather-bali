'use client';

import type { LegalPolicy } from '@/lib/legal/policies';
import { useSiteContent } from '@/lib/content/SiteContentContext';

function withContactData(value: string, email: string, phone: string) {
  return value
    .replaceAll('{{contactEmail}}', email || 'the contact email listed in the footer')
    .replaceAll('{{contactPhone}}', phone || 'the phone number listed in the footer');
}

export default function LegalPage({ policy }: { policy: LegalPolicy }) {
  const { content } = useSiteContent();
  const email = content.global.footer.email.trim();
  const phone = content.global.footer.phone.trim();
  const phoneHref = content.global.footer.phoneHref.trim() || phone;

  return (
    <main className="legal-page">
      <header className="legal-page__hero">
        <span className="eyebrow">{policy.eyebrow}</span>
        <h1>{policy.title}</h1>
        <p>{policy.intro}</p>
      </header>

      <article className="legal-page__article">
        <div className="legal-page__meta"><span>{policy.updatedLabel}</span><strong>{policy.updated}</strong></div>
        <div className="legal-page__notice"><span className="material-symbols-outlined" aria-hidden>info</span><p>{policy.notice}</p></div>

        {policy.sections.map((section) => (
          <section className="legal-page__section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{withContactData(paragraph, email, phone)}</p>)}
            {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{withContactData(bullet, email, phone)}</li>)}</ul>}
          </section>
        ))}

        <section className="legal-page__contact">
          <span className="eyebrow">Praba Leather Bali</span>
          <h2>{policy.contactHeading}</h2>
          <p>{withContactData(policy.contactBody, email, phone)}</p>
          {email && <a href={`mailto:${email}`}>{email}</a>}
          {phone && <a href={`tel:${phoneHref}`}>{phone}</a>}
        </section>
      </article>
    </main>
  );
}
