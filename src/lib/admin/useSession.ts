'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { adminSupabase } from '@/lib/supabase-admin';

// 'loading' while we resolve the initial session so the auth guard doesn't
// briefly bounce a logged-in admin to /admin/login/ on first paint.
export function useSession(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(adminSupabase));

  useEffect(() => {
    let mounted = true;
    if (!adminSupabase) return () => { mounted = false; };

    // Storage can contain an expired or corrupt refresh token. Also cap the
    // initial network read: a stalled Auth request must never leave the whole
    // dashboard behind its loading screen indefinitely.
    let initialResolved = false;
    const finishInitialSession = (next: Session | null) => {
      if (!mounted || initialResolved) return;
      initialResolved = true;
      window.clearTimeout(sessionTimeout);
      setSession(next);
      setLoading(false);
    };
    const sessionTimeout = window.setTimeout(() => finishInitialSession(null), 8000);

    void adminSupabase.auth.getSession()
      .then(({ data }) => finishInitialSession(data.session))
      .catch(() => finishInitialSession(null));
    const { data: sub } = adminSupabase.auth.onAuthStateChange((_event, next) => {
      finishInitialSession(next);
    });
    return () => { mounted = false; window.clearTimeout(sessionTimeout); sub.subscription.unsubscribe(); };
  }, []);

  return { session, loading };
}
