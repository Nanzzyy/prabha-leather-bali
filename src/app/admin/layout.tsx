'use client';

import './admin.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { useSession } from '@/lib/admin/useSession';
import { signOut } from '@/lib/admin/queries';
import { Confirm } from '@/components/admin/Confirm';

const NAV = [
  { href: '/admin/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/content/', label: 'Content', icon: 'edit_note' },
  { href: '/admin/products/', label: 'Products', icon: 'inventory_2' },
  { href: '/admin/categories/', label: 'Categories', icon: 'category' },
  { href: '/admin/collection/', label: 'Collection setup', icon: 'account_tree' },
  { href: '/admin/heroes/', label: 'Heroes', icon: 'photo_library' },
  { href: '/admin/looks/', label: 'Looks', icon: 'collections' },
  { href: '/admin/stores/', label: 'Stores', icon: 'storefront' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isLogin = pathname.startsWith('/admin/login');

  useEffect(() => {
    if (loading || isLogin) return;
    if (!session) router.replace('/admin/login/');
  }, [loading, isLogin, session, router]);

  if (isLogin) return <div className="admin-shell">{children}</div>;

  if (loading || !session) {
    return (
      <div className="admin-shell">
        <div className="admin-loading"><Icon>progress_activity</Icon><span>Loading dashboard…</span></div>
      </div>
    );
  }

  const logout = async () => {
    await signOut();
    setLogoutOpen(false);
    router.replace('/admin/login/');
  };

  const isActive = (href: string) => href === '/admin/' ? pathname === '/admin' || pathname === '/admin/' : pathname.startsWith(href);

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link href="/admin/" className="admin-topbar__brand"><strong>Praba</strong><span>CMS</span></Link>
        <div className="admin-topbar__context"><span>Workspace</span><strong>Storefront manager</strong></div>
        <button type="button" className="admin-topbar__menu-btn" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}><Icon>menu</Icon></button>
        <div className="admin-topbar__spacer" />
        <div className="admin-topbar__user">
          <Icon>person</Icon>
          <span>{session.user.email}</span>
          <button type="button" className="admin-user-button" onClick={() => setLogoutOpen(true)}><Icon>logout</Icon><span>Logout</span></button>
        </div>
      </header>
      <div className="admin-workspace">
        {menuOpen && <button type="button" className="admin-nav-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
        <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Admin navigation">
          <div className="admin-sidebar__heading">Manage</div>
          <nav className="admin-sidebar__nav">
            {NAV.map((item, index) => (
              <div key={item.href} className={index === 2 || index === 5 ? 'admin-sidebar__group' : ''}>
                {index === 2 && <span className="admin-sidebar__group-label">Catalog</span>}
                {index === 5 && <span className="admin-sidebar__group-label">Homepage</span>}
                <Link href={item.href} className={`admin-sidebar__link ${isActive(item.href) ? 'is-active' : ''}`} onClick={() => setMenuOpen(false)}>
                  <Icon>{item.icon}</Icon><span>{item.label}</span>{isActive(item.href) && <Icon>chevron_right</Icon>}
                </Link>
              </div>
            ))}
          </nav>
          <div className="admin-sidebar__footer"><Icon>tips_and_updates</Icon><span>Keep content simple, visual, and up to date.</span></div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
      <Confirm open={logoutOpen} title="Sign out of CMS?" body="You can sign in again any time to continue managing the storefront." confirmLabel="Sign out" busy={false} onConfirm={logout} onCancel={() => setLogoutOpen(false)} />
    </div>
  );
}
