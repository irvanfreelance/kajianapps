import ProductDetailView from '@/components/client/ProductDetailView';
import { notFound } from 'next/navigation';

async function getProduct(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/get?slug=${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <ProductDetailView product={product} />;
}
