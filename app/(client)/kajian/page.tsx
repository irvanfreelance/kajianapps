import KajianListView from '@/components/client/KajianListView';
import { getBaseUrl } from '@/lib/url';

async function getKajian() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/kajian/list?limit=3`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

export default async function KajianListPage() {
  const kajian = await getKajian();
  return <KajianListView initialKajian={kajian} />;
}
