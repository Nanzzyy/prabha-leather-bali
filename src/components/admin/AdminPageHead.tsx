import Link from 'next/link';
import Icon from '@/components/Icon';
import type { ReactNode } from 'react';

export interface AdminBreadcrumb {
  label: string;
  href?: string;
}

interface AdminPageHeadProps {
  eyebrow?: string;
  breadcrumbs?: AdminBreadcrumb[];
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function AdminPageHead({
  eyebrow,
  breadcrumbs,
  title,
  description,
  actions,
  className = '',
}: AdminPageHeadProps) {
  return (
    <div className={`admin-pagehead ${className}`.trim()}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="admin-breadcrumb" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span className="admin-breadcrumb__item" key={`${crumb.label}-${index}`}>
                {index > 0 && <Icon>chevron_right</Icon>}
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
              </span>
            ))}
          </div>
        )}
        {eyebrow && <span className="admin-pagehead__eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-pagehead__actions">{actions}</div>}
    </div>
  );
}
