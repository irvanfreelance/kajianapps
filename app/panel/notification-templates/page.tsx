import { NotificationTemplateView } from "@/components/admin/NotificationTemplateView";

async function getNotificationTemplates() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/notification-templates/get`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function NotificationTemplatesPage() {
  const templates = await getNotificationTemplates();
  return <NotificationTemplateView initialData={templates} />;
}
