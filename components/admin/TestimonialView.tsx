"use client";

import { useState, useEffect } from "react";
import { Search, FileDown, Trash2, Star, Image as ImageIcon, Video, AlertCircle } from "lucide-react";
import { styles, formatDate, Pagination } from "./shared";
import { exportToExcel } from "@/lib/excel";

export function TestimonialView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/testimonials");
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
      } else {
        setError(json.error || "Gagal memuat testimoni");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleDelete = async (orderId: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus testimoni ini? Tindakan ini akan menghapus ulasan dan media secara permanen dari pesanan.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/testimonials?orderId=${orderId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (res.ok && json.success) {
        alert("Testimoni berhasil dihapus");
        fetchTestimonials();
      } else {
        alert(json.error || "Gagal menghapus testimoni");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat menghapus testimoni");
    }
  };

  const filtered = data.filter(t => 
    (t.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.orderCode || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.testimonial || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const exportData = filtered.map((t, idx) => ({
      "No": idx + 1,
      "Kode Pesanan": t.orderCode,
      "Pelanggan": t.customerName,
      "Email": t.customerEmail,
      "No. WhatsApp": t.customerPhone || "-",
      "Tanggal Pesanan": formatDate(t.date),
      "Rating": `${t.rating}/5`,
      "Ulasan": t.testimonial || "-",
      "Foto Lampiran": t.testimonialImages || "-",
      "Video Lampiran": t.testimonialVideo || "-"
    }));
    exportToExcel(exportData, "Rekap_Testimoni_Pelanggan");
  };

  if (loading && data.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <p style={{ fontSize: 14, color: "#64748B", fontWeight: 600 }}>Memuat data testimoni...</p>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, padding: 16, color: "#991B1B" }}>
        <AlertCircle size={20} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{error}</span>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Cari nama, order code, atau ulasan..." 
            style={{ ...styles.searchInput, width: "100%" }} 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <button onClick={handleExport} style={styles.excelBtn}>
          <FileDown size={18} /> Export Excel
        </button>
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 40, textAlign: "center" }}>No.</th>
                <th style={styles.th}>Kode Pesanan</th>
                <th style={styles.th}>Pelanggan</th>
                <th style={styles.th}>Tanggal</th>
                <th style={styles.th}>Rating</th>
                <th style={styles.th}>Ulasan</th>
                <th style={styles.th}>Foto</th>
                <th style={styles.th}>Video</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((t, idx) => (
                  <tr key={t.id} style={styles.tr}>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                        {(currentPage - 1) * pageSize + idx + 1}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0891B2" }}>
                        #{t.orderCode}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{t.customerName}</span>
                        <span style={{ fontSize: 11, color: "#64748B" }}>{t.customerEmail}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: 13, color: "#64748B" }}>{formatDate(t.date)}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={14} color="#EAB308" fill="#EAB308" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#854D0E" }}>{t.rating}/5</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ fontSize: 13, color: "#334155", fontStyle: "italic" }}>
                        "{t.testimonial || "Tidak ada komentar"}"
                      </span>
                    </td>
                    <td style={styles.td}>
                      {t.testimonialImages ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          {t.testimonialImages.split(",").map((imgUrl: string, i: number) => (
                            <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                              <img src={imgUrl} alt="attachment" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", border: "1px solid #E2E8F0" }} />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>-</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {t.testimonialVideo ? (
                        <a href={t.testimonialVideo} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 12, color: "#0891B2", fontWeight: 600 }}>
                          <Video size={14} /> Lihat Video
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>-</span>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        <button 
                          onClick={() => handleDelete(t.id)} 
                          style={styles.actionBtnDel}
                          title="Hapus Ulasan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ ...styles.td, textAlign: "center", padding: "40px 0" }}>
                    <span style={{ fontSize: 13, color: "#94A3B8" }}>Belum ada data ulasan.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setPage={setCurrentPage} />}
      </div>
    </div>
  );
}
