import { OrderView } from '@/components/admin/Views';
import { getBaseUrl } from '@/lib/url';

async function getOrders() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/orders/list`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrderView initialData={orders} />;
}
