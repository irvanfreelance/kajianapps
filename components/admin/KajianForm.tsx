"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, Loader2, Save, Layers, FileText } from "lucide-react";
import { styles } from "./shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';

export default function KajianForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(initialData ? {
    ...initialData,
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : "",
    time: initialData.time || initialData.time_display || "",
    series_type: initialData.series_type || 'single',
    kajian_mode: initialData.kajian_mode || 'offline',
    isTerdekat: initialData.is_terdekat || initialData.isTerdekat || false,
  } : {
    type: 'free',
    spot: 100,
    price: 0,
    image: "",
    series_type: 'single',
    kajian_mode: 'offline',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.image || "");
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch series list for dropdown
    fetch('/api/kajian/series/list')
      .then(r => r.json())
      .then(d => { if (d.success) setSeriesList(d.data || []); })
      .catch(() => {});

    // Fetch dynamic categories
    fetch('/api/kajian-categories/list')
      .then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data || []); })
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;
      if (selectedFile) {
        const response = await fetch(
          `/api/admin/upload?filename=${encodeURIComponent(selectedFile.name)}`,
          { method: 'POST', body: selectedFile }
        );
        const newBlob = await response.json();
        if (newBlob.url) imageUrl = newBlob.url;
        else throw new Error("Gagal upload gambar");
      }

      const isUpdate = !!formData.id;
      const endpoint = isUpdate ? '/api/kajian/update' : '/api/kajian/create';
      const payload = {
        ...formData,
        image: imageUrl,
        series_type: formData.series_type || 'single',
        series_id: formData.series_type === 'series' ? (formData.series_id || null) : null,
        episode_number: formData.series_type === 'series' ? (formData.episode_number || null) : null,
      };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        router.push('/panel/kajian');
        router.refresh();
      } else {
        toast.error("Gagal menyimpan data: " + json.error);
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSeries = formData.series_type === 'series';

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/panel/kajian" style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13, textDecoration: "none", marginBottom: 12, fontWeight: 500 }}>
          <ArrowLeft size={14} /> Kembali ke Kelola Kajian
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>
          {formData.id ? "Edit Kajian" : "Tambah Kajian Baru"}
        </h1>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={{ padding: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* IMAGE */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={styles.label}>Gambar Cover Kajian</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%", height: 200, borderRadius: 12,
                  border: "2px dashed #E2E8F0", background: "#F8FAFC",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", overflow: "hidden",
                  position: "relative", transition: "all 0.2s"
                }}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="Preview" />
                    <div className="image-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Ganti Gambar</p>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <Upload size={24} color="#3B82F6" />
                    </div>
                    <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>Klik untuk upload gambar</p>
                    <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Format JPG, PNG atau WEBP (Maks. 5MB)</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
            </div>

            {/* SERIES TYPE */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={styles.label}>Jenis Kajian</label>
              <div style={{ display: "flex", gap: 12 }}>
                {[{ val: 'single', label: 'Single', icon: <FileText size={16} />, desc: 'Satu sesi kajian' },
                  { val: 'series', label: 'Berseries', icon: <Layers size={16} />, desc: 'Bagian dari seri episode' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setFormData({ ...formData, series_type: opt.val })}
                    style={{
                      flex: 1, padding: "14px 16px", borderRadius: 12,
                      border: formData.series_type === opt.val ? "2px solid #3B82F6" : "1.5px solid #E2E8F0",
                      background: formData.series_type === opt.val ? "#EFF6FF" : "#F8FAFC",
                      color: formData.series_type === opt.val ? "#1D4ED8" : "#64748B",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                      transition: "all 0.2s", fontWeight: 600, fontSize: 14
                    }}
                  >
                    {opt.icon}
                    <div style={{ textAlign: "left" }}>
                      <div>{opt.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SERIES FIELDS (if series) */}
            {isSeries && (
              <>
                <div>
                  <label style={styles.label}>Pilih Series</label>
                  <select
                    value={formData.series_id || ""}
                    onChange={e => setFormData({ ...formData, series_id: e.target.value ? Number(e.target.value) : null })}
                    style={styles.inputForm}
                  >
                    <option value="">-- Pilih Series --</option>
                    {seriesList.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  <Link href="/panel/kajian/series/create" target="_blank" style={{ fontSize: 12, color: "#3B82F6", marginTop: 6, display: "inline-block", textDecoration: "none" }}>
                    + Buat Series Baru
                  </Link>
                </div>
                <div>
                  <label style={styles.label}>Nomor Episode</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.episode_number || ""}
                    onChange={e => setFormData({ ...formData, episode_number: parseInt(e.target.value) || null })}
                    style={styles.inputForm}
                    placeholder="Contoh: 1, 2, 3..."
                  />
                </div>
              </>
            )}

            {/* TITLE */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={styles.label}>{isSeries ? "Judul Episode" : "Judul Kajian"}</label>
              <input
                required
                value={formData.title || ""}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                style={styles.inputForm}
                type="text"
                placeholder={isSeries ? "Misal: Tafsir Surat Al-Ikhlas (Episode 2)" : "Masukkan judul kajian..."}
              />
            </div>

            <div>
              <label style={styles.label}>Nama Ustadz</label>
              <input required value={formData.ustadz || ""} onChange={e => setFormData({ ...formData, ustadz: e.target.value })} style={styles.inputForm} type="text" />
            </div>

            <div>
              <label style={styles.label}>Kategori</label>
              <select 
                required 
                value={formData.category || ""} 
                onChange={e => setFormData({ ...formData, category: e.target.value })} 
                style={styles.inputForm}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Tanggal</label>
              <input required value={formData.date || ""} onChange={e => setFormData({ ...formData, date: e.target.value })} style={styles.inputForm} type="date" />
            </div>

            <div>
              <label style={styles.label}>Waktu</label>
              <input required value={formData.time_display || formData.time || ""} onChange={e => setFormData({ ...formData, time: e.target.value, time_display: e.target.value })} style={styles.inputForm} type="text" placeholder="Misal: 09:00 WIB" />
            </div>

            <div>
              <label style={styles.label}>Tipe</label>
              <select value={formData.type || "free"} onChange={e => setFormData({ ...formData, type: e.target.value })} style={styles.inputForm}>
                <option value="free">Gratis / Infaq</option>
                <option value="paid">Berbayar</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Harga (Rp)</label>
              <input disabled={formData.type === 'free'} value={formData.price || 0} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} style={styles.inputForm} type="number" />
            </div>

            <div>
              <label style={styles.label}>Kuota Jamaah</label>
              <input required value={formData.spot || 100} onChange={e => setFormData({ ...formData, spot: parseInt(e.target.value) || 0 })} style={styles.inputForm} type="number" />
            </div>

            <div>
              <label style={styles.label}>Metode Kajian</label>
              <select value={formData.kajian_mode || "offline"} onChange={e => setFormData({ ...formData, kajian_mode: e.target.value })} style={styles.inputForm}>
                <option value="offline">Offline (Tatap Muka)</option>
                <option value="online">Online (Streaming / Zoom)</option>
                <option value="hybrid">Hybrid (Offline & Online)</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>Kajian Terdekat (Featured)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44, padding: "0 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12 }}>
                <input 
                  type="checkbox" 
                  checked={formData.isTerdekat || false} 
                  onChange={e => setFormData({ ...formData, isTerdekat: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: "#3B82F6", cursor: "pointer" }}
                />
                <span style={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>Tandai sebagai Kajian Terdekat</span>
              </div>
            </div>

            <div>
              <label style={styles.label}>Lokasi / Tempat</label>
              <input value={formData.location || ""} onChange={e => setFormData({ ...formData, location: e.target.value })} style={styles.inputForm} type="text" />
            </div>

            <div>
              <label style={styles.label}>URL Zoom {isSeries && <span style={{ fontSize: 11, color: "#0891B2" }}>(episode ini)</span>}</label>
              <input value={formData.url_zoom || ""} onChange={e => setFormData({ ...formData, url_zoom: e.target.value })} style={styles.inputForm} type="text" placeholder="https://zoom.us/j/..." />
            </div>

            <div>
              <label style={styles.label}>URL Youtube {isSeries && <span style={{ fontSize: 11, color: "#DC2626" }}>(episode ini)</span>}</label>
              <input value={formData.url_youtube || ""} onChange={e => setFormData({ ...formData, url_youtube: e.target.value })} style={styles.inputForm} type="text" placeholder="https://youtube.com/live/..." />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={styles.label}>Deskripsi Kajian</label>
              <textarea rows={4} value={formData.description || ""} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...styles.inputForm, resize: "vertical" }} placeholder="Masukkan detail kajian..." />
            </div>
          </div>

          <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid #F1F5F9", paddingTop: 24 }}>
            <Link href="/panel/kajian" style={styles.secondaryBtn}>Batal</Link>
            <button type="submit" disabled={isSubmitting} style={{ ...styles.primaryBtn, width: "auto", minWidth: 140, justifyContent: "center" }}>
              {isSubmitting ? (<><Loader2 size={18} className="animate-spin" /> Sedang Menyimpan...</>) : (<><Save size={18} /> Simpan Kajian</>)}
            </button>
          </div>
        </form>
      </div>
      <style>{`.image-overlay:hover { opacity: 1 !important; }`}</style>
    </div>
  );
}
