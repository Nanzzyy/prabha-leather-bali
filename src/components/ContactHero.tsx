'use client';

import { useSiteContent } from '@/lib/content/SiteContentContext';

export default function ContactHero() {
  const { content } = useSiteContent();
  const hero = content.contact.hero;
  return <section className="contact-hero"><span className="eyebrow">{hero.eyebrow}</span><h1>{hero.h1a}<br /><em>{hero.h1b}</em></h1><p>{hero.body}</p></section>;
}
