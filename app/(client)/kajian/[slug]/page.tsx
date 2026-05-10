import KajianDetailView from '@/components/client/KajianDetailView';
import { notFound } from 'next/navigation';
import { getKajianBySlug } from '@/lib/services/kajian';

export default async function KajianDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kajian = await getKajianBySlug(slug).catch(() => null);
  if (!kajian) notFound();
  return <KajianDetailView kajian={kajian} />;
}
