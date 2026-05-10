import { TokoView } from '@/components/client/Views';
import { getProductsList } from '@/lib/services/products';

export default async function TokoPage() {
  const products = await getProductsList().catch(() => []);
  return <TokoView initialProducts={products} />;
}
