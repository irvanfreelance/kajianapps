import { ProductView } from '@/components/admin/Views';

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/list`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductView initialData={products} />;
}
