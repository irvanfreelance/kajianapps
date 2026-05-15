import KajianRegistrationsView from '@/components/admin/KajianRegistrationsView';
import { getAllRegistrations } from '@/lib/services/kajian';

export default async function KajianRegistrationsPage() {
  const registrations = await getAllRegistrations().catch(() => []);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>Pendaftaran Kajian</h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Monitor seluruh jamaah yang mendaftar kajian</p>
      </div>
      <KajianRegistrationsView initialData={registrations} />
    </div>
  );
}
