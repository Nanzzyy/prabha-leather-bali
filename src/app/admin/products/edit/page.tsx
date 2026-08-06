'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import Icon from '@/components/Icon';

function EditInner() {
  const params = useSearchParams();
  const id = params.get('id') || '';
  if (!id) return <div className="admin-empty"><Icon>error</Icon><p>Missing product id.</p></div>;
  return <ProductForm key={id} productId={id} />;
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="admin-loading"><Icon>progress_activity</Icon><span>Loading…</span></div>}>
      <EditInner />
    </Suspense>
  );
}
