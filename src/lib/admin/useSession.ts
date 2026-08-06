'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { adminSupabase } from '@/lib/supabase-admin';

// 'loading' while we resolve the initial session so the auth guard doesn't
// briefly bounce a logged-in admin to /admin/login/ on first paint.
export function useSession(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminSupabase) { setLoading(false); return; }
    adminSupabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = adminSupabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}
