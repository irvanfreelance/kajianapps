import KajianDetailView from '@/components/client/KajianDetailView';
import { notFound } from 'next/navigation';
import { getBaseUrl } from '@/lib/url';

async function getKajian(slug: string) {
  try {
    const res = await fetch(`${getBaseUrl()}/api/kajian/get?slug=${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch { return null; }
}

export default async function KajianDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kajian = await getKajian(slug);
  if (!kajian) notFound();
  return <KajianDetailView kajian={kajian} />;
}
