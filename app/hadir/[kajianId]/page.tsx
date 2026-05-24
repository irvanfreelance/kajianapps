import SelfCheckinView from '@/components/client/SelfCheckinView';
import { getKajianById } from '@/lib/services/kajian';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ kajianId: string }> }): Promise<Metadata> {
  const { kajianId } = await params;
  const kajian = await getKajianById(kajianId);
  return {
    title: kajian ? `Check-in: ${kajian.title}` : 'Self Check-in Kajian',
    description: 'Halaman self check-in kehadiran kajian',
  };
}

export default async function HadirPage({ params }: { params: Promise<{ kajianId: string }> }) {
  const { kajianId } = await params;
  const kajian = await getKajianById(kajianId);

  if (!kajian) {
    notFound();
  }

  return <SelfCheckinView kajian={kajian} />;
}
