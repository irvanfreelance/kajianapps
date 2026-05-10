import KajianView from '@/components/admin/KajianView';
import { getKajianList } from '@/lib/services/kajian';

export default async function KajianPage() {
  const kajian = await getKajianList().catch(() => []);
  return <KajianView initialData={kajian} />;
}
