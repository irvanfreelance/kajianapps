import KajianParticipantsView from '@/components/admin/KajianParticipantsView';
import { getKajianParticipants, getKajianById } from '@/lib/services/kajian';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [kajian, participants] = await Promise.all([
    getKajianById(id),
    getKajianParticipants(id)
  ]);

  if (!kajian) {
    notFound();
  }

  return <KajianParticipantsView kajian={kajian} initialData={participants} />;
}
