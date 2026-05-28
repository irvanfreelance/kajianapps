import KajianDetailView from '@/components/client/KajianDetailView';
import { notFound } from 'next/navigation';
import { getKajianBySlug, getKajianList } from '@/lib/services/kajian';

// Pre-render the 20 most recent kajian slugs at build time
export async function generateStaticParams() {
  try {
    const kajians = await getKajianList(20);
    return kajians
      .filter((k: any) => k.slug)
      .map((k: any) => ({ slug: k.slug }));
  } catch {
    return [];
  }
}

export const revalidate = 300; // ISR: re-generate every 5 minutes

export default async function KajianDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kajian = await getKajianBySlug(slug).catch(() => null);
  if (!kajian) notFound();

  // Get related kajian (same category, excluding current)
  const related = await getKajianList(4, 0, kajian.category).catch(() => []);
  const filteredRelated = related.filter((k: any) => k.id !== kajian.id).slice(0, 3);

  return <KajianDetailView kajian={kajian} relatedKajian={filteredRelated} />;
}
