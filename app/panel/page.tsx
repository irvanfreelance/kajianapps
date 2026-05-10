import DashboardView from '@/components/admin/DashboardView';
import { getBaseUrl } from '@/lib/url';

async function getKajian() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/kajian/list`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

async function getProducts() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products/list`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

async function getOrders() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/orders/list`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

export default async function DashboardPage() {
  const kajian = await getKajian();
  const products = await getProducts();
  const orders = await getOrders();
  return <DashboardView kajian={kajian} products={products} orders={orders} />;
}
