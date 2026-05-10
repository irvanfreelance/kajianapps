import HomeView from '@/components/client/HomeView';
import { getKajianList } from '@/lib/services/kajian';
import { getProductsList } from '@/lib/services/products';

export default async function HomePage() {
  const [kajian, products] = await Promise.all([
    getKajianList().catch(() => []),
    getProductsList().catch(() => []),
  ]);
  return <HomeView kajian={kajian} products={products} />;
}
