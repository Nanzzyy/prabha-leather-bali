'use client';

import { useCallback, useEffect, useState } from 'react';

type Kind = 'ok' | 'err';
export function useToast() {
  const [toast, setToast] = useState<{ msg: string; kind: Kind } | null>(null);
  const ok = useCallback((msg: string) => setToast({ msg, kind: 'ok' }), []);
  const err = useCallback((msg: string) => setToast({ msg, kind: 'err' }), []);
  const clear = useCallback(() => setToast(null), []);
  return { toast, ok, err, clear };
}

export function Toast({ toast, onDone }: { toast: { msg: string; kind: Kind } | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [toast, onDone]);
  if (!toast) return null;
  return <div className={`admin-toast admin-toast--${toast.kind}`} role={toast.kind === 'err' ? 'alert' : 'status'}><span className="admin-toast__icon"><span className="material-symbols-outlined">{toast.kind === 'err' ? 'error' : 'check_circle'}</span></span><span>{toast.msg}</span><button type="button" className="admin-toast__close" onClick={onDone} aria-label="Dismiss message"><span className="material-symbols-outlined">close</span></button></div>;
}
