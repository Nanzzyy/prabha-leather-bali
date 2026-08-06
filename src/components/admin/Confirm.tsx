'use client';

import Icon from '@/components/Icon';

interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Confirm({ open, title, body, confirmLabel = 'Delete', busy, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="admin-confirm-layer" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="admin-confirm-backdrop" onClick={onCancel} aria-label="Cancel" />
      <div className="admin-confirm">
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="admin-confirm__actions">
          <button type="button" className="admin-btn admin-btn--outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="admin-btn admin-btn--danger" onClick={onConfirm} disabled={busy}><Icon>delete</Icon> {busy ? 'Deleting…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
