import KajianListView from '@/components/client/KajianListView';

async function getKajian() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/kajian/list?limit=3`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function KajianListPage() {
  const kajian = await getKajian();
  return <KajianListView initialKajian={kajian} />;
}
