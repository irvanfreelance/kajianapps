import KajianScanView from '@/components/admin/KajianScanView';
import { getKajianById } from '@/lib/services/kajian';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kajian = await getKajianById(id);

  if (!kajian) {
    notFound();
  }

  return <KajianScanView kajian={kajian} />;
}
