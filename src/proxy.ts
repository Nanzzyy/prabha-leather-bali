import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase-config';

function redirectWithCookies(request: NextRequest, source: NextResponse, pathname: string) {
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  target.search = '';
  const response = NextResponse.redirect(target);
  for (const cookie of source.cookies.getAll()) response.cookies.set(cookie);
  return response;
}

export async function proxy(request: NextRequest) {
  if (/^\/(?:en|id)\/promo\/?$/.test(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const isLogin = request.nextUrl.pathname.startsWith('/admin/login');
  const { data: claimsData } = await supabase.auth.getClaims();
  let isAdmin = false;

  if (claimsData?.claims?.sub) {
    const { data, error } = await supabase.rpc('is_admin');
    isAdmin = !error && data === true;
  }

  if (!isLogin && !isAdmin) return redirectWithCookies(request, response, '/admin/login/');
  if (isLogin && isAdmin) return redirectWithCookies(request, response, '/admin/');
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/:lang/promo', '/:lang/promo/:path*'],
};
