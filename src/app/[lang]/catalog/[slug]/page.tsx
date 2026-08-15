import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getCatalogProductBySlug, getCatalogProducts } from '@/lib/repositories';
import { getPageMetadata } from '@/lib/seo/metadata';

// Static Hostinger exports can only emit paths known at build time.
export const dynamicParams = false;

export async function generateStaticParams() {
  const products = await getCatalogProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const metadata = await getPageMetadata(lang, 'product', `/catalog/${slug}/`);
  const product = await getCatalogProductBySlug(slug);
  if (!product) return metadata;

  const title = product.metaTitle?.trim() || product.name;
  const description = product.metaDescription?.trim() || product.description || metadata.description;
  return {
    ...metadata,
    title,
    description,
    openGraph: { ...metadata.openGraph, title, description },
    twitter: { ...metadata.twitter, title, description },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();
  const allProducts = await getCatalogProducts();
  const related = allProducts.filter((item) => item.id !== product.id);
  return <main className="product-page"><ProductDetailClient product={product} related={related} /></main>;
}
