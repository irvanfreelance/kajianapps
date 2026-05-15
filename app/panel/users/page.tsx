import { UserView } from '@/components/admin/Views';
import { getAllUsers } from '@/lib/services/admin';

export default async function UsersPage() {
  const users = await getAllUsers();
  return <UserView initialData={users} />;
}
