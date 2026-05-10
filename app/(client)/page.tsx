import HomeView from '@/components/client/HomeView';

async function getKajian() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/kajian/list`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/list`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function HomePage() {
  const kajian = await getKajian();
  const products = await getProducts();

  return <HomeView kajian={kajian} products={products} />;
}
