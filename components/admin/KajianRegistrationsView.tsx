"use client";
import { useState } from "react";
import { Search, FileDown, Ticket } from "lucide-react";
import { styles, fmt, Pagination, formatDate } from "./shared";
import { exportToExcel } from "@/lib/excel";

export default function KajianRegistrationsView({ initialData }: { initialData: any[] }) {
  const [data] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const filtered = data.filter(r => 
    r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.kajian_title?.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toString().includes(search)
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const exportData = filtered.map((r, i) => ({
      'No': i + 1,
      'ID Reg': `REG-${r.id}`,
      'Nama Jamaah': r.user_name,
      'WhatsApp': r.user_phone,
      'Judul Kajian': r.kajian_title,
      'Tanggal Kajian': r.kajian_date,
      'Nominal': r.amount,
      'Status': r.status,
      'Tanggal Daftar': new Date(r.date).toLocaleString('id-ID')
    }));
    exportToExcel(exportData, 'Data_Pendaftaran_Kajian');
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 350 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Cari nama, judul kajian, atau ID..." 
            style={{...styles.searchInput, width: "100%"}} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                <th style={styles.th}>Nominal</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Tanggal Daftar</th>
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
                    <p style={{ fontSize: 12, color: "#475569" }}>
                      {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>
                      {new Date(r.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
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
    </div>
  );
}
