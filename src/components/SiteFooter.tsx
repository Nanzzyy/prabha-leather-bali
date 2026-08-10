'use client';

import Icon from './Icon';
import LocaleLink from './LocaleLink';
import { useSiteContent } from '@/lib/content/SiteContentContext';

export default function SiteFooter() {
  const { content } = useSiteContent();
  const footer = content.global.footer;
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand-col">
          <LocaleLink href="/" className="site-footer__brand">{footer.brand}</LocaleLink>
          <p>{footer.tagline}</p>
          <div className="site-footer__socials">
            <a href={footer.instagram} target="_blank" rel="noopener noreferrer" aria-label="Praba on Instagram"><Icon>photo_camera</Icon></a>
            <a href={`https://wa.me/${footer.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="Message Praba on WhatsApp"><Icon>chat</Icon></a>
            <a href={`mailto:${footer.email}`} aria-label="Email Praba"><Icon>mail</Icon></a>
          </div>
        </div>

        <nav className="site-footer__col" aria-label={footer.explore}>
          <span>{footer.explore}</span>
          <LocaleLink href="/catalog/">{content.global.nav.catalog}</LocaleLink>
          <LocaleLink href="/collection/">{content.global.nav.collection}</LocaleLink>
          <LocaleLink href="/about/">{footer.ourStory}</LocaleLink>
        </nav>

        <nav className="site-footer__col" aria-label={footer.service}>
          <span>{footer.service}</span>
          <LocaleLink href="/contact/">{footer.contact}</LocaleLink>
          <LocaleLink href="/contact/">{footer.shipping}</LocaleLink>
          <LocaleLink href="/about/">{footer.careGuide}</LocaleLink>
        </nav>

        <div className="site-footer__col">
          <span>{footer.visit}</span>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(footer.mapQuery)}`} target="_blank" rel="noopener noreferrer">{footer.locations}</a>
          <a href={`tel:${footer.phoneHref}`}>{footer.phone}</a>
          <a href={`mailto:${footer.email}`}>{footer.email}</a>
        </div>
      </div>

      <div className="site-footer__bar">
        <div className="site-footer__legal">
          <span className="site-footer__legal-main">© {new Date().getFullYear()} Praba Leather Bali. {footer.rights}</span>
          <span className="site-footer__legal-sub">{footer.handcrafted}</span>
        </div>
        <nav className="site-footer__policies" aria-label="Legal">
          <LocaleLink href={footer.privacyHref}>{footer.privacy}</LocaleLink>
          <LocaleLink href={footer.termsHref}>{footer.terms}</LocaleLink>
          <LocaleLink href={footer.cookiesHref}>{footer.cookies}</LocaleLink>
        </nav>
      </div>
    </footer>
  );
}
