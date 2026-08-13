'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { useSession } from '@/lib/admin/useSession';
import { signOut } from '@/lib/admin/queries';
import { Confirm } from '@/components/admin/Confirm';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/', label: 'Dashboard', icon: 'space_dashboard' },
    ]
  },
  {
    label: 'Catalog management',
    items: [
      { href: '/admin/products/', label: 'Products', icon: 'inventory_2' },
      { href: '/admin/categories/', label: 'Categories', icon: 'category' },
      { href: '/admin/collection/', label: 'Collections', icon: 'account_tree' },
    ]
  },
  {
    label: 'Content & visuals',
    items: [
      { href: '/admin/looks/', label: 'Curated Looks', icon: 'collections' },
      { href: '/admin/heroes/', label: 'Homepage Heroes', icon: 'photo_library' },
      { href: '/admin/content/', label: 'Site Content', icon: 'edit_document' },
      { href: '/admin/icons/', label: 'Icon library', icon: 'apps' },
    ]
  },
  {
    label: 'Store settings',
    items: [
      { href: '/admin/stores/', label: 'Store locations', icon: 'storefront' },
    ]
  }
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
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

  if (isLogin) {
    return (
      <div className="admin-shell">
        {children}
      </div>
    );
  }

  if (loading || !session) {
    return (
      <div className="admin-shell" style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--muted)' }}>
          <span className="admin-loading" style={{ minHeight: 'auto', display: 'inline-grid' }}>
            <Icon>progress_activity</Icon>
          </span>
          <span className="text-sm font-medium tracking-wide">Loading dashboard…</span>
        </div>
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
      <div className="admin-topbar">
        <div className="flex items-center gap-6">
          <Link href="/admin/" className="admin-topbar__brand group">
            <strong>Praba</strong>
            <span>CMS</span>
          </Link>
          <div className="admin-topbar__context hidden md:flex">
            <span>Workspace</span>
            <strong>Storefront Manager</strong>
          </div>
        </div>

        <div className="admin-topbar__spacer" />

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
            <Icon>person</Icon>
            <span className="max-w-[200px] truncate">{session.user.email}</span>
          </div>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="admin-user-button hidden md:flex"
          >
            <Icon>logout</Icon>
            <span>Logout</span>
          </button>

          <button
            type="button"
            className="admin-topbar__menu-btn md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon>{menuOpen ? 'close' : 'menu'}</Icon>
          </button>
        </div>
      </div>

      <div className="admin-workspace">
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-nav-backdrop md:hidden"
              style={{ display: menuOpen ? 'block' : 'none' }}
              onClick={() => setMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}
          aria-label="Admin navigation"
        >
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
            {NAV_GROUPS.map((group, gIndex) => (
              <div key={group.label} className={gIndex === 0 ? '' : 'mt-8'}>
                {group.label !== 'Overview' && (
                  <h3 className="admin-sidebar__group-label" style={{ padding: '0 0.75rem 0.25rem' }}>
                    {group.label}
                  </h3>
                )}
                <nav className="admin-sidebar__nav">
                  {group.items.map(item => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`admin-sidebar__link ${active ? 'is-active' : ''}`}
                      >
                        <Icon>{item.icon}</Icon>
                        <span>{item.label}</span>
                        {active && <Icon>chevron_right</Icon>}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="admin-sidebar__footer">
            <Icon>tips_and_updates</Icon>
            <p>Keep the storefront content simple, visual, and up to date.</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <Confirm
        open={logoutOpen}
        title="Sign out of CMS?"
        body="You can sign in again any time to continue managing the storefront."
        confirmLabel="Sign out"
        busy={false}
        onConfirm={logout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}
