import KajianForm from "@/components/admin/KajianForm";
import { getKajianById } from "@/lib/services/kajian";
import { notFound } from "next/navigation";

export default async function EditKajianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kajian = await getKajianById(id);
  
  if (!kajian) {
    notFound();
  }

  return <KajianForm initialData={kajian} />;
}
