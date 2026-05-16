import ProductDetailView from '@/components/client/ProductDetailView';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProductsList } from '@/lib/services/products';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  // Get related products (same category, excluding current)
  const related = await getProductsList(product.category, 5).catch(() => []);
  const filteredRelated = related.filter((p: any) => p.id !== product.id).slice(0, 4);

  return <ProductDetailView product={product} relatedProducts={filteredRelated} />;
}
