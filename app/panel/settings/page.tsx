import AdminSettingsView from '@/components/admin/AdminSettingsView';
import { getAllSettings, getAllAdmins } from '@/lib/services/admin';

export default async function SettingsPage() {
  const [settings, admins] = await Promise.all([
    getAllSettings(),
    getAllAdmins()
  ]);

  return <AdminSettingsView settings={settings} admins={admins} />;
}
