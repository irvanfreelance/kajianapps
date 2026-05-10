import KajianView from '@/components/admin/KajianView';
import { getBaseUrl } from '@/lib/url';

async function getKajian() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/kajian/list`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

export default async function KajianPage() {
  const kajian = await getKajian();
  return <KajianView initialData={kajian} />;
}
