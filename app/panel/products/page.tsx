import { ProductView } from '@/components/admin/Views';
import { getProductsList } from '@/lib/services/products';

export default async function ProductsPage() {
  const products = await getProductsList().catch(() => []);
  return <ProductView initialData={products} />;
}
