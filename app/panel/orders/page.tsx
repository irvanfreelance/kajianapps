import { OrderView } from '@/components/admin/Views';
import { getOrdersList } from '@/lib/services/orders';

export default async function OrdersPage() {
  const orders = await getOrdersList().catch(() => []);
  return <OrderView initialData={orders} />;
}
