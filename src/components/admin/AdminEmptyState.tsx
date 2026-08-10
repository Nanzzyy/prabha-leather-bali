import Link from 'next/link';
import Icon from '@/components/Icon';
import type { ReactNode } from 'react';

interface AdminEmptyStateProps {
  icon: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export default function AdminEmptyState({
  icon,
  title,
  description,
  action,
  actionHref,
  actionLabel,
  className = '',
}: AdminEmptyStateProps) {
  return (
    <div className={`admin-empty ${className}`.trim()}>
      <Icon>{icon}</Icon>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action ?? (actionHref && actionLabel ? <Link href={actionHref} className="admin-btn admin-btn--outline">{actionLabel}</Link> : null)}
    </div>
  );
}
