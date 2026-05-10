import DashboardView from '@/components/admin/DashboardView';
import { getKajianList } from '@/lib/services/kajian';
import { getProductsList } from '@/lib/services/products';
import { getOrdersList } from '@/lib/services/orders';

export default async function DashboardPage() {
  const [kajian, products, orders] = await Promise.all([
    getKajianList().catch(() => []),
    getProductsList().catch(() => []),
    getOrdersList().catch(() => []),
  ]);
  return <DashboardView kajian={kajian} products={products} orders={orders} />;
}
