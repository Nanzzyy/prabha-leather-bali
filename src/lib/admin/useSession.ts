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

    // Storage can contain an expired or corrupt refresh token. Resolve the
    // guard on both success and failure so the UI never spins forever.
    void adminSupabase.auth.getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setLoading(false);
      });
    const { data: sub } = adminSupabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return;
      setSession(next);
      setLoading(false);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return { session, loading };
}
