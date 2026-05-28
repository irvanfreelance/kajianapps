import { getKajianBySlug } from '@/lib/services/kajian';
import { notFound } from 'next/navigation';
import KajianInfaqView from './KajianInfaqView';

export default async function KajianInfaqPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kajian = await getKajianBySlug(slug).catch(() => null);
  if (!kajian) notFound();
  return <KajianInfaqView kajian={kajian} />;
}
