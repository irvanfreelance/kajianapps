import ProductDetailView from '@/components/client/ProductDetailView';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/services/products';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();
  return <ProductDetailView product={product} />;
}
