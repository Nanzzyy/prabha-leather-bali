import type { LegalPolicy } from '@/lib/legal/policies';

export default function LegalPage({ policy }: { policy: LegalPolicy }) {
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
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
          </section>
        ))}

        <section className="legal-page__contact">
          <span className="eyebrow">Praba Leather Bali</span>
          <h2>{policy.contactHeading}</h2>
          <p>{policy.contactBody}</p>
          <a href="mailto:hello@prabaleather.com">hello@prabaleather.com</a>
        </section>
      </article>
    </main>
  );
}
