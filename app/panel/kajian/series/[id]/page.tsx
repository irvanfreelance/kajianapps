import { getSeriesById } from '@/lib/services/kajian';
import { notFound } from 'next/navigation';
import SeriesDetailView from '@/components/admin/SeriesDetailView';

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await getSeriesById(id).catch(() => null);
  if (!series) notFound();
  return <SeriesDetailView series={series} />;
}
