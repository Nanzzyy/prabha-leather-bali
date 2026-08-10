import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getCatalogProductBySlug, getCatalogProducts } from '@/lib/repositories';
import { getPageMetadata } from '@/lib/seo/metadata';

export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getCatalogProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  return getPageMetadata(lang, 'product', `/catalog/${slug}/`);
}

export default async function ProductPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();
  const allProducts = await getCatalogProducts();
  const related = allProducts.filter((item) => item.id !== product.id);
  return <main className="product-page"><ProductDetailClient product={product} related={related} /></main>;
}
