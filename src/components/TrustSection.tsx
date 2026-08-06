'use client';

import { useSiteContent } from '@/lib/content/SiteContentContext';

export default function TrustSection() {
  const { content } = useSiteContent();
  const pillars = content.home.trust;
  return (
    <section className="trust-section" id="about">
      {pillars.map((pillar) => <article key={pillar.number}><span className="trust-section__number">{pillar.number}</span><h2>{pillar.title}</h2><p>{pillar.body}</p></article>)}
    </section>
  );
}
