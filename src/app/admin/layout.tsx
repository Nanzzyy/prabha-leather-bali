'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { useSession } from '@/lib/admin/useSession';
import { signOut } from '@/lib/admin/queries';
import { Confirm } from '@/components/admin/Confirm';
import { motion, AnimatePresence } from 'framer-motion';

// We import admin.css ONLY if there are lingering legacy components in other pages 
// that we haven't rewritten yet (like Product Form).
import './admin.css';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/', label: 'Dashboard', icon: 'space_dashboard' },
    ]
  },
  {
    label: 'Catalog Management',
    items: [
      { href: '/admin/products/', label: 'Products', icon: 'inventory_2' },
      { href: '/admin/categories/', label: 'Categories', icon: 'category' },
    ]
  },
  {
    label: 'Content & Visuals',
    items: [
      { href: '/admin/looks/', label: 'Curated Looks', icon: 'collections' },
      { href: '/admin/heroes/', label: 'Homepage Heroes', icon: 'photo_library' },
      { href: '/admin/content/', label: 'Site Content', icon: 'edit_document' },
    ]
  },
  {
    label: 'Settings',
    items: [
      { href: '/admin/collection/', label: 'Collections', icon: 'account_tree' },
      { href: '/admin/stores/', label: 'Stores Location', icon: 'storefront' },
    ]
  }
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

  if (isLogin) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
        {children}
      </div>
    );
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500">
        <span className="animate-spin mr-3 text-stone-400">
          <Icon>progress_activity</Icon>
        </span>
        <span className="text-sm font-medium tracking-wide">Loading dashboard…</span>
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
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-stone-200 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/admin/" className="flex items-baseline gap-2 group">
            <strong className="text-xl font-semibold tracking-tight text-stone-900 group-hover:text-stone-600 transition-colors">Praba</strong>
            <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">CMS</span>
          </Link>
          <div className="hidden md:flex flex-col pl-6 border-l border-stone-200">
            <span className="text-[0.65rem] uppercase tracking-widest text-stone-400 font-bold">Workspace</span>
            <strong className="text-sm font-medium text-stone-800">Storefront Manager</strong>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-sm text-stone-600">
            <Icon>person</Icon>
            <span className="max-w-[200px] truncate">{session.user.email}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setLogoutOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <Icon>logout</Icon>
            <span>Logout</span>
          </button>
          
          <button 
            type="button" 
            className="md:hidden p-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            aria-label="Toggle menu" 
            aria-expanded={menuOpen} 
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon>{menuOpen ? 'close' : 'menu'}</Icon>
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-stone-900/40 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside 
          className={`fixed md:sticky top-[73px] z-40 h-[calc(100vh-73px)] w-[260px] bg-white border-r border-stone-200 flex flex-col transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          aria-label="Admin navigation"
        >
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
            {NAV_GROUPS.map((group, gIndex) => (
              <div key={group.label} className={gIndex === 0 ? '' : 'mt-8'}>
                {group.label !== 'Overview' && (
                  <h3 className="px-3 mb-3 text-[0.68rem] font-bold tracking-wider text-stone-400 uppercase">
                    {group.label}
                  </h3>
                )}
                <nav className="flex flex-col gap-1">
                  {group.items.map(item => {
                    const active = isActive(item.href);
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setMenuOpen(false)}
                        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active 
                            ? 'bg-stone-900 text-white shadow-md shadow-stone-900/10' 
                            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <Icon>{item.icon}</Icon>
                        <span className="relative z-10">{item.label}</span>
                        {active && (
                          <motion.div layoutId="active-nav-indicator" className="absolute right-3">
                            <Icon>chevron_right</Icon>
                          </motion.div>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
          
          <div className="p-5 border-t border-stone-100 bg-stone-50/50">
            <div className="flex items-start gap-3 text-xs leading-relaxed text-stone-500">
              <Icon className="text-amber-600 text-base shrink-0">tips_and_updates</Icon>
              <p>Keep the storefront content simple, visual, and up to date.</p>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 pb-16">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
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
