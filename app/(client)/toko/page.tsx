import { TokoView } from '@/components/client/Views';
import { getBaseUrl } from '@/lib/url';

async function getProducts() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products/list`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

export default async function TokoPage() {
  const products = await getProducts();
  return <TokoView initialProducts={products} />;
}
