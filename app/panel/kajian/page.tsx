import KajianView from '@/components/admin/KajianView';

async function getKajian() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/kajian/list`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function KajianPage() {
  const kajian = await getKajian();
  return <KajianView initialData={kajian} />;
}
