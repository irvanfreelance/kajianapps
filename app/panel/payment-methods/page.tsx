import { PaymentMethodView } from "@/components/admin/PaymentMethodView";

async function getPaymentMethods() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/payment-methods/get`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function PaymentMethodsPage() {
  const methods = await getPaymentMethods();
  return <PaymentMethodView initialData={methods} />;
}
