'use client';

import Link from 'next/link';
import { type AnchorHTMLAttributes, type ReactNode } from 'react';
import { localizePath, useLang } from '@/lib/i18n/LangContext';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'aria-label' | 'aria-current'> & {
  href: string;
  children: ReactNode;
  ariaLabel?: string;
  ariaCurrent?: 'page';
};

export default function LocaleLink({ href, children, ariaLabel, ariaCurrent, ...rest }: Props) {
  const { lang } = useLang();
  return (
    <Link href={localizePath(lang, href)} aria-label={ariaLabel} aria-current={ariaCurrent} {...rest}>
      {children}
    </Link>
  );
}
