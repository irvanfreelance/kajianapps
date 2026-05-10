import ProductDetailView from '@/components/client/ProductDetailView';
import { notFound } from 'next/navigation';
import { getBaseUrl } from '@/lib/url';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/products/get?slug=${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch { return null; }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <ProductDetailView product={product} />;
}
