"use client";
import { useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Layers, Eye } from "lucide-react";
import { styles, Toast } from "./shared";
import Link from "next/link";

export default function SeriesListView({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus series ini? Semua episode akan kehilangan referensi series-nya.")) return;
    try {
      const res = await fetch('/api/kajian/series/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setData(data.filter(s => s.id !== id));
        showToast("Series berhasil dihapus");
      }
    } catch { alert("Gagal menghapus series"); }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Link href="/panel/kajian" style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13, textDecoration: "none", marginBottom: 8, fontWeight: 500 }}>
            <ArrowLeft size={14} /> Kembali ke Kajian
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 10 }}>
            <Layers size={22} color="#7C3AED" /> Kelola Kajian Series
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{data.length} series tersedia</p>
        </div>
        <Link href="/panel/kajian/series/create" style={{ ...styles.primaryBtn, textDecoration: 'none' }}>
          <Plus size={18} /> Buat Series Baru
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {data.map(s => (
          <div key={s.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            {s.image && (
              <div style={{ height: 140, overflow: "hidden", background: "#F8FAFC" }}>
                <img src={s.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
            )}
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "#EDE9FE", color: "#7C3AED" }}>
                  {s.episode_count || 0} Episode
                </span>
                <span style={{ fontSize: 11, color: "#64748B" }}>{s.category}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>{s.ustadz}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/panel/kajian/series/${s.id}`} style={{ ...styles.actionBtnView, textDecoration: "none", flex: 1, justifyContent: "center", display: "flex", alignItems: "center", gap: 4 }}>
                  <Eye size={14} /> Lihat Episode
                </Link>
                <button onClick={() => handleDelete(s.id)} style={styles.actionBtnDel}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#94A3B8" }}>
            <Layers size={48} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: 15, fontWeight: 600 }}>Belum ada kajian series</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Klik "Buat Series Baru" untuk memulai</p>
          </div>
        )}
      </div>
    </div>
  );
}
