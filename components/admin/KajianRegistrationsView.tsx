"use client";
import { useState } from "react";
import { Search, FileDown, Ticket, CheckCircle, Clock } from "lucide-react";
import { styles, fmt, Pagination, formatDate } from "./shared";
import { exportToExcel } from "@/lib/excel";

export default function KajianRegistrationsView({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [activeProofUrl, setActiveProofUrl] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const pageSize = 10;

  const filtered = data.filter(r => {
    const matchesSearch = 
      r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.kajian_title?.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toString().includes(search);

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'PAID' && r.status === 'PAID') ||
      (statusFilter === 'PENDING' && r.status !== 'PAID');

    const methodLabel = r.payment_method || 'Gratis';
    const matchesMethod = 
      methodFilter === 'all' || 
      methodLabel === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const exportData = filtered.map((r, i) => ({
      'No': i + 1,
      'ID Reg': `REG-${r.id}`,
      'Nama Jamaah': r.user_name,
      'WhatsApp': r.user_phone,
      'Judul Kajian': r.kajian_title,
      'Metode Bayar': r.payment_method || 'Gratis',
      'Tanggal Kajian': r.kajian_date,
      'Nominal': r.amount,
      'Status': r.status,
      'Approved': r.is_approved ? 'YES' : 'NO',
      'Tanggal Daftar': new Date(r.date).toLocaleString('id-ID')
    }));
    exportToExcel(exportData, 'Data_Pendaftaran_Kajian');
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Setujui pendaftaran ini dan tandai sebagai PAID?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/kajian/registrations/${id}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        setData(prev => prev.map(r => r.id === id ? { ...r, status: 'PAID', is_approved: true } : r));
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    } finally {
      setLoadingId(null);
    }
  };

  // Extract unique payment methods dynamically
  const uniqueMethods = Array.from(new Set(data.map(r => r.payment_method || 'Gratis')));

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Advanced Multi Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flex: 1, maxWidth: "100%" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
            <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Cari nama, judul, ID..." 
              style={{...styles.searchInput, width: "100%"}} 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
            style={{ ...styles.searchInput, width: "auto", minWidth: 140, padding: "8px 16px 8px 12px" }}
          >
            <option value="all">Semua Status</option>
            <option value="PAID">Lunas (PAID)</option>
            <option value="PENDING">Menunggu (PENDING)</option>
          </select>

          <select 
            value={methodFilter} 
            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }} 
            style={{ ...styles.searchInput, width: "auto", minWidth: 160, padding: "8px 16px 8px 12px" }}
          >
            <option value="all">Semua Metode</option>
            {uniqueMethods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <button onClick={handleExport} style={styles.secondaryBtn}>
          <FileDown size={18} /> Export Excel
        </button>
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: 40, textAlign: "center"}}>No.</th>
                <th style={styles.th}>ID Reg</th>
                <th style={styles.th}>Jamaah</th>
                <th style={styles.th}>Kajian</th>
                <th style={styles.th}>Metode Bayar</th>
                <th style={styles.th}>Nominal</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Approval</th>
                <th style={{...styles.th, textAlign: "center"}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((r, idx) => (
                <tr key={r.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: "center"}}>
                    <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                      {(currentPage - 1) * pageSize + idx + 1}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 700, color: "#0891B2", fontSize: 13 }}>REG-{r.id}</span>
                  </td>
                  <td style={styles.td}>
                    <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{r.user_name}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{r.user_phone}</p>
                  </td>
                  <td style={styles.td}>
                    <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 13 }}>{r.kajian_title}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{r.ustadz} • {formatDate(r.kajian_date)}</p>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 600, color: "#475569", fontSize: 13 }}>
                      {r.payment_method || 'Gratis'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: 600, color: "#0F172A" }}>{fmt(r.amount)}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ 
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, 
                      background: r.status === 'PAID' ? "#DCFCE7" : "#FEF3C7", 
                      color: r.status === 'PAID' ? "#166534" : "#92400E" 
                    }}>
                      {r.status || 'PENDING'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {r.is_approved ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#166534", fontSize: 12, fontWeight: 700 }}>
                        <CheckCircle size={14} /> Approved
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#92400E", fontSize: 12, fontWeight: 700 }}>
                        <Clock size={14} /> Waiting
                      </div>
                    )}
                  </td>
                  <td style={{...styles.td, textAlign: "center"}}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {r.payment_proof && (
                        <button 
                          onClick={() => setActiveProofUrl(r.payment_proof)}
                          style={{ 
                            padding: "6px 12px", borderRadius: 8, border: "1px solid #0891B2", 
                            background: "#ECFEFF", color: "#0891B2", fontSize: 12, 
                            fontWeight: 700, cursor: "pointer"
                          }}
                        >
                          Lihat Bukti
                        </button>
                      )}
                      {!r.is_approved && (
                        <button 
                          onClick={() => handleApprove(r.id)}
                          disabled={loadingId === r.id}
                          style={{ 
                            padding: "6px 12px", borderRadius: 8, border: "none", 
                            background: "#0891B2", color: "#fff", fontSize: 12, 
                            fontWeight: 700, cursor: "pointer", opacity: loadingId === r.id ? 0.7 : 1
                          }}
                        >
                          {loadingId === r.id ? "..." : "Approve"}
                        </button>
                      )}
                      {r.is_approved && !r.payment_proof && (
                        <span style={{ fontSize: 12, color: "#94A3B8" }}>-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 60, height: 60, background: "#F8FAFC", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Ticket size={32} color="#CBD5E1" />
            </div>
            <p style={{ color: "#64748B", fontSize: 14 }}>Data pendaftaran tidak ditemukan.</p>
          </div>
        )}

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setPage={setCurrentPage} />}
      </div>

      {/* Reusable Bukti Transfer Modal */}
      {activeProofUrl && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: 24,
            maxWidth: 500, width: "90%", maxHeight: "90vh",
            display: "flex", flexDirection: "column", gap: 16,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Bukti Transfer</h3>
              <button 
                onClick={() => setActiveProofUrl(null)}
                style={{
                  background: "#F1F5F9", border: "none", borderRadius: "50%",
                  width: 32, height: 32, display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", fontSize: 14,
                  fontWeight: 700, color: "#64748B"
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center", background: "#F8FAFC", borderRadius: 16, padding: 12 }}>
              <img 
                src={activeProofUrl} 
                alt="Bukti Transfer" 
                style={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain", borderRadius: 12 }} 
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <a 
                href={activeProofUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12, background: "#F1F5F9",
                  color: "#475569", fontSize: 14, fontWeight: 700, textAlign: "center",
                  textDecoration: "none"
                }}
              >
                Buka Tab Baru ↗
              </a>
              <button 
                onClick={() => setActiveProofUrl(null)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 12, background: "#0891B2",
                  color: "#fff", border: "none", fontSize: 14, fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
