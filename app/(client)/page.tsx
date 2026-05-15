import { Suspense } from 'react';
import HomeView from '@/components/client/HomeView';
import { getKajianList } from '@/lib/services/kajian';
import { getProductsList } from '@/lib/services/products';

export default async function HomePage() {
  const [kajian, products] = await Promise.all([
    getKajianList().catch(() => []),
    getProductsList().catch(() => []),
  ]);
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <HomeView kajian={kajian} products={products} />
    </Suspense>
  );
}
