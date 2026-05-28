import { getSeriesList } from '@/lib/services/kajian';
import SeriesListView from '@/components/admin/SeriesListView';

export default async function SeriesPage() {
  const series = await getSeriesList().catch(() => []);
  return <SeriesListView initialData={series} />;
}
