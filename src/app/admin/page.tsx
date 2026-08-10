'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Icon from '@/components/Icon';
import { AdminProduct, AdminCategory, listProducts, listCategories } from '@/lib/admin/queries';

export default function AdminDashboard() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    Promise.all([listProducts(), listCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load dashboard.'));
  }, [retryKey]);

  const retry = () => { setProducts(null); setError(null); setRetryKey((key) => key + 1); };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white border border-rose-100 rounded-2xl shadow-sm">
        <Icon className="text-4xl text-rose-500 mb-4">error</Icon>
        <h2 className="text-xl font-semibold text-stone-900 mb-2">Dashboard unavailable</h2>
        <p className="text-stone-600 mb-6 max-w-md">{error}</p>
        <button 
          type="button" 
          onClick={retry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
        >
          <Icon>refresh</Icon> Try again
        </button>
      </div>
    );
  }

  if (!products) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-stone-500">
        <span className="animate-spin mb-4 text-stone-400">
          <Icon className="text-3xl">progress_activity</Icon>
        </span>
        <span className="text-sm font-medium tracking-wide">Preparing your workspace…</span>
      </div>
    );
  }

  const featured = products.filter((p) => p.is_featured).length;
  const outOfStock = products.reduce((n, p) => n + p.variants.filter((v) => v.stock_status === 'out_of_stock').length, 0);
  const recent = products.slice(0, 5);
  const catName = (slug: string | null) => categories.find((c) => c.slug === slug)?.name ?? 'Uncategorized';

  // All elements animate in simultaneously — no stagger delay in a CMS.
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.15 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-8 pb-10">
      
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="block mb-2 text-xs font-bold tracking-widest uppercase text-amber-700/80">Good to see you</span>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Dashboard</h1>
          <p className="mt-2 text-stone-600">One calm place to keep your catalog and storefront in shape.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/en/" className="inline-flex items-center gap-2 px-4 py-2.5 border border-stone-300 bg-white text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors">
            <Icon>open_in_new</Icon> View storefront
          </Link>
          <Link href="/admin/products/new/" className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm">
            <Icon>add</Icon> New product
          </Link>
        </div>
      </motion.div>

      {/* Welcome Hero */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white p-8 md:p-10 shadow-xl shadow-stone-900/5">
        <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col lg:flex-row gap-10 justify-between items-center">
          <div className="max-w-xl">
            <span className="block mb-3 text-xs font-bold tracking-widest uppercase text-amber-400">Your next best step</span>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight">Make the storefront feel alive.</h2>
            <p className="text-stone-300 text-sm md:text-base leading-relaxed">Add a new piece, refresh a homepage image, or curate a new look for visitors to discover.</p>
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
            <ActionCard href="/admin/looks/" icon="collections" title="Curate a look" subtitle="Pair products with visual stories." />
            <ActionCard href="/admin/heroes/" icon="photo_library" title="Refresh homepage" subtitle="Update the first impression." />
            <ActionCard href="/admin/content/" icon="edit_note" title="Edit website content" subtitle="Update page copy, links, and images." />
          </div>
        </div>
      </motion.section>

      {/* Stats Row */}
      <motion.section variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Catalog summary">
        <StatCard icon="inventory_2" label="Products" value={products.length} sub="pieces in catalog" />
        <StatCard icon="category" label="Categories" value={categories.length} sub="ways to browse" />
        <StatCard icon="star" label="Featured" value={featured} sub="on the homepage" />
        <StatCard 
          icon={outOfStock ? 'warning' : 'check_circle'} 
          label="Stock alerts" 
          value={outOfStock} 
          sub={outOfStock ? 'variants need attention' : 'everything looks good'} 
          attention={outOfStock > 0} 
        />
      </motion.section>

      {/* Dashboard Main Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Products */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <span className="block mb-1 text-[0.65rem] font-bold tracking-widest uppercase text-stone-500">Catalog</span>
              <h2 className="text-lg font-semibold text-stone-900">Recent products</h2>
            </div>
            <Link href="/admin/products/" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors group">
              View all <Icon className="text-sm transition-transform group-hover:translate-x-0.5">arrow_forward</Icon>
            </Link>
          </div>
          
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-stone-500">
                <Icon className="text-4xl text-stone-300 mb-4">inventory_2</Icon>
                <p className="mb-4 text-stone-600">Your catalog is empty.</p>
                <Link href="/admin/products/new/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 underline hover:text-stone-600">
                  Create your first product <Icon className="text-[1rem]">arrow_forward</Icon>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-stone-50/50 border-b border-stone-200 text-[0.7rem] uppercase tracking-wider font-semibold text-stone-500">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {recent.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200/50">
                              {p.images[0] ? (
                                <Image src={p.images[0].image_url} alt="" fill sizes="44px" className="object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                                  <Icon>image</Icon>
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-stone-900">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-600">{catName(p.category_slug)}</td>
                        <td className="px-6 py-4 font-medium text-stone-900">${p.base_price_usd.toFixed(0)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {p.is_featured && <span className="inline-flex px-2 py-0.5 rounded-full bg-stone-900 text-white text-[0.65rem] font-bold uppercase tracking-wide">Featured</span>}
                            {p.variants.some((v) => v.stock_status === 'out_of_stock') && <span className="inline-flex px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[0.65rem] font-bold uppercase tracking-wide">Stock issue</span>}
                            {!p.is_featured && !p.variants.some((v) => v.stock_status === 'out_of_stock') && <span className="inline-flex px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[0.65rem] font-bold uppercase tracking-wide">Ready</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/products/edit/?id=${p.id}`} className="inline-flex p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors" aria-label={`Edit ${p.title}`}>
                            <Icon>edit</Icon>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Checklist Sidebar */}
        <aside className="flex flex-col gap-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <span className="block mb-1 text-[0.65rem] font-bold tracking-widest uppercase text-stone-500">At a glance</span>
              <h2 className="text-lg font-semibold text-stone-900">Content checklist</h2>
            </div>
            <Icon className="text-stone-300">task_alt</Icon>
          </div>
          
          <div className="bg-white border border-stone-200 rounded-2xl p-2 shadow-sm">
            <ChecklistItem icon="inventory_2" label="Products" value={products.length} href="/admin/products/" done={products.length > 0} />
            <ChecklistItem icon="category" label="Categories" value={categories.length} href="/admin/categories/" done={categories.length > 0} />
            <ChecklistItem icon="star" label="Featured pieces" value={featured} href="/admin/products/" done={featured > 0} />
            <ChecklistItem icon="photo_library" label="Homepage visuals" value="Manage" href="/admin/heroes/" done />
            <ChecklistItem icon="edit_note" label="Website content" value="Manage" href="/admin/content/" done />
          </div>
          
          <div className="flex items-start gap-2.5 px-3 py-4 mt-2 text-[0.7rem] text-stone-500 bg-stone-100/50 rounded-xl border border-stone-200/50 leading-relaxed">
            <Icon className="text-stone-400 text-base shrink-0">info</Icon>
            <p>You can update every homepage section from the Homepage group in the sidebar.</p>
          </div>
        </aside>

      </motion.div>
    </motion.div>
  );
}

function ActionCard({ href, icon, title, subtitle }: { href: string; icon: string; title: string; subtitle: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 p-4 rounded-xl border border-stone-700/50 bg-stone-800/40 hover:bg-white/10 hover:border-amber-700/50 transition-all duration-200 group">
      <Icon className="text-amber-500">{icon}</Icon>
      <div className="flex flex-col flex-1 min-w-0">
        <strong className="text-sm font-medium text-white group-hover:text-amber-50 transition-colors">{title}</strong>
        <span className="text-xs text-stone-400 truncate">{subtitle}</span>
      </div>
      <Icon className="text-stone-500 group-hover:text-amber-500 transition-colors group-hover:translate-x-1">arrow_forward</Icon>
    </Link>
  );
}

function StatCard({ icon, label, value, sub, attention }: { icon: string; label: string; value: number; sub: string; attention?: boolean }) {
  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl border ${attention ? 'bg-rose-50 border-rose-200' : 'bg-white border-stone-200'} shadow-sm`}>
      <div className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-xl ${attention ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-600'}`}>
        <Icon>{icon}</Icon>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[0.65rem] font-bold tracking-widest uppercase text-stone-500">{label}</span>
        <strong className={`text-2xl font-semibold mt-1 mb-0.5 ${attention ? 'text-rose-700' : 'text-stone-900'}`}>{value}</strong>
        <span className={`text-[0.7rem] ${attention ? 'text-rose-600' : 'text-stone-500'}`}>{sub}</span>
      </div>
    </div>
  );
}

function ChecklistItem({ icon, label, value, href, done }: { icon: string; label: string; value: number | string; href: string; done: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group">
      <div className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-full ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'}`}>
        <Icon className="text-[1.1rem]">{done ? 'check' : icon}</Icon>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <strong className="text-sm font-medium text-stone-900 group-hover:underline">{label}</strong>
        <span className="text-xs text-stone-500">{value} {typeof value === 'number' ? 'added' : ''}</span>
      </div>
      <Icon className="text-stone-300 group-hover:text-stone-600 transition-colors">chevron_right</Icon>
    </Link>
  );
}
