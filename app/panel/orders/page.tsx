import { OrderView } from '@/components/admin/Views';

async function getOrders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders/list`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrderView initialData={orders} />;
}
