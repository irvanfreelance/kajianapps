"use client";
import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users } from "lucide-react";
import { styles, fmt, Pagination, Toast, formatDate } from "./shared";
import Link from "next/link";

export default function KajianView({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const pageSize = 10;
  
  const totalPages = Math.ceil(data.length / pageSize);
  const currentData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: number | string) => {
    if(window.confirm("Hapus kajian ini?")) {
      try {
        const res = await fetch('/api/kajian/delete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          setData(data.filter(k => k.id !== id));
          showToast("Kajian berhasil dihapus");
        }
      } catch (err) {
        alert("Gagal menghapus kajian");
      }
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Cari judul kajian..." style={{...styles.searchInput, width: "100%"}} />
        </div>
        <Link href="/panel/kajian/create" style={{...styles.primaryBtn, textDecoration: 'none'}}>
          <Plus size={18} /> Tambah Kajian
        </Link>
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: 40, textAlign: "center"}}>No.</th>
                <th style={styles.th}>Info Kajian</th>
                <th style={styles.th}>Jadwal</th>
                <th style={styles.th}>Tipe & Harga</th>
                <th style={styles.th}>Kuota</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((k, idx) => (
                <tr key={k.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: "center"}}><span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</span></td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={k.image} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} alt="" />
                      <div>
                        <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{k.title}</p>
                        <p style={{ fontSize: 12, color: "#64748B" }}>{k.ustadz}</p>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <p style={{ fontSize: 13, color: "#0F172A" }}>{formatDate(k.date)}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{k.time_display || k.time}</p>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 12, background: k.type === "free" ? "#F0FDF4" : "#FFF7ED", color: k.type === "free" ? "#15803D" : "#C2410C" }}>
                      {k.type === "free" ? "Infaq" : fmt(k.price)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 4, minWidth: 60 }}>
                        <div style={{ height: "100%", background: "#0891B2", borderRadius: 4, width: `${((k.filled || 0)/(k.spot || 1))*100}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#64748B" }}>{k.filled || 0}/{k.spot || 0}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link href={`/panel/kajian/${k.id}/participants`} style={{...styles.actionBtnView, textDecoration: "none"}} title="Lihat Peserta">
                        <Users size={16}/>
                      </Link>
                      <Link href={`/panel/kajian/${k.id}/edit`} style={{...styles.actionBtnEdit, textDecoration: "none"}} title="Edit Kajian">
                        <Edit size={16}/>
                      </Link>
                      <button onClick={() => handleDelete(k.id)} style={styles.actionBtnDel}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setPage={setCurrentPage} />}
      </div>
    </div>
  );
}
