"use client";
import { useState, useRef } from "react";
import { ArrowLeft, Upload, Loader2, Save } from "lucide-react";
import { styles } from "./shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';

export default function SeriesForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(initialData || { title: "", ustadz: "", category: "", description: "", image: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;
      if (selectedFile) {
        const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(selectedFile.name)}`, { method: 'POST', body: selectedFile });
        const blob = await res.json();
        if (blob.url) imageUrl = blob.url;
        else throw new Error("Gagal upload gambar");
      }
      const res = await fetch('/api/kajian/series/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image: imageUrl })
      });
      const json = await res.json();
      if (json.success) { router.push('/panel/kajian/series'); router.refresh(); }
      else toast.error("Gagal: " + json.error);
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/panel/kajian/series" style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13, textDecoration: "none", marginBottom: 12, fontWeight: 500 }}>
          <ArrowLeft size={14} /> Kembali ke Kelola Series
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>Buat Series Baru</h1>
        <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Series adalah kumpulan episode kajian yang saling berkaitan</p>
      </div>
      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={{ padding: 4, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Image */}
          <div>
            <label style={styles.label}>Gambar Cover Series</label>
            <div onClick={() => fileInputRef.current?.click()} style={{ width: "100%", height: 180, borderRadius: 12, border: "2px dashed #E2E8F0", background: "#F8FAFC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative" }}>
              {previewUrl ? (
                <img src={previewUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Preview" />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Upload size={28} color="#3B82F6" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Upload gambar cover</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
          </div>

          <div>
            <label style={styles.label}>Judul Series</label>
            <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={styles.inputForm} placeholder="Misal: Seri Tafsir Juz Amma" />
          </div>
          <div>
            <label style={styles.label}>Ustadz / Pemateri</label>
            <input required value={formData.ustadz} onChange={e => setFormData({ ...formData, ustadz: e.target.value })} style={styles.inputForm} placeholder="Nama ustadz" />
          </div>
          <div>
            <label style={styles.label}>Kategori</label>
            <input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={styles.inputForm} placeholder="Misal: Tahsin, Fiqh, Hadits..." />
          </div>
          <div>
            <label style={styles.label}>Deskripsi Series</label>
            <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...styles.inputForm, resize: "vertical" }} placeholder="Jelaskan tema dan tujuan series ini..." />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid #F1F5F9", paddingTop: 20 }}>
            <Link href="/panel/kajian/series" style={styles.secondaryBtn}>Batal</Link>
            <button type="submit" disabled={isSubmitting} style={{ ...styles.primaryBtn, width: "auto", minWidth: 140, justifyContent: "center" }}>
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Simpan Series</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
