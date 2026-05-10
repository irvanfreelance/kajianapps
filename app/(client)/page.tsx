import HomeView from '@/components/client/HomeView';
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

export default async function HomePage() {
  const kajian = await getKajian();
  const products = await getProducts();
  return <HomeView kajian={kajian} products={products} />;
}
