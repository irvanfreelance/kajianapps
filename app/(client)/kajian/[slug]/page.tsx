import KajianDetailView from '@/components/client/KajianDetailView';
import { notFound } from 'next/navigation';

async function getKajian(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/kajian/get?slug=${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function KajianDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kajian = await getKajian(slug);
  if (!kajian) notFound();
  return <KajianDetailView kajian={kajian} />;
}
