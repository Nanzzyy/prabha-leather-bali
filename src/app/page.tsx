import { getProductRepository } from '@/lib/repositories';
import CatalogGrid from '@/components/CatalogGrid';
import CartWidget from '@/components/CartWidget';
import ProductModalClientWrapper from './ProductModalClientWrapper'; // we will create this

export default async function Home() {
  const repository = getProductRepository();
  const products = await repository.getAllProducts();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b py-6 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-black text-center">Prabha Leather Bali</h1>
          <p className="text-center text-gray-500 mt-2">Katalog Produk Premium</p>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <ProductModalClientWrapper products={products} />
      </section>

      <CartWidget />
    </main>
  );
}
