import KajianDetailView from '@/components/client/KajianDetailView';
import { notFound } from 'next/navigation';
import { getKajianBySlug, getKajianList } from '@/lib/services/kajian';

export default async function KajianDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kajian = await getKajianBySlug(slug).catch(() => null);
  if (!kajian) notFound();

  // Get related kajian (same category, excluding current)
  const related = await getKajianList(4, 0, kajian.category).catch(() => []);
  const filteredRelated = related.filter((k: any) => k.id !== kajian.id).slice(0, 3);

  return <KajianDetailView kajian={kajian} relatedKajian={filteredRelated} />;
}
