import KajianListView from '@/components/client/KajianListView';
import { getKajianList } from '@/lib/services/kajian';

export default async function KajianListPage() {
  const kajian = await getKajianList(3).catch(() => []);
  return <KajianListView initialKajian={kajian} />;
}
