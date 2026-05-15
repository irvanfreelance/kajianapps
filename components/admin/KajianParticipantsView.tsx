"use client";
import { useState } from "react";
import { Search, FileDown, ArrowLeft, Users, UserCheck } from "lucide-react";
import { styles, fmt, Pagination, formatDate } from "./shared";
import { exportToExcel } from "@/lib/excel";
import Link from "next/link";

export default function KajianParticipantsView({ kajian, initialData }: { kajian: any, initialData: any[] }) {
  const [data] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 15;

  const filtered = data.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const exportData = filtered.map((p, i) => ({
      'No': i + 1,
      'Nama': p.name,
      'WhatsApp': p.phone,
      'Email': p.email,
      'Tanggal Daftar': new Date(p.date).toLocaleString('id-ID'),
      'Status': p.status,
      'Nominal': p.paid_amount
    }));
    exportToExcel(exportData, `Peserta_${kajian.title.replace(/\s+/g, '_')}`);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Link 
            href="/panel/kajian" 
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13, textDecoration: "none", marginBottom: 12, fontWeight: 500 }}
          >
            <ArrowLeft size={14} /> Kembali ke Kelola Kajian
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>Daftar Peserta</h1>
          <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
            Kajian: <strong style={{ color: "#0F172A" }}>{kajian.title}</strong> • {formatDate(kajian.date || kajian.date_display)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Total Peserta</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#0891B2" }}>{data.length}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 350 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Cari nama atau nomor WhatsApp..." 
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
                <th style={styles.th}>Nama Peserta</th>
                <th style={styles.th}>WhatsApp</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((p, idx) => (
                <tr key={idx} style={styles.tr}>
                  <td style={{...styles.td, textAlign: "center"}}>
                    <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                      {(currentPage - 1) * pageSize + idx + 1}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#475569" }}>
                        {p.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <a 
                      href={`https://wa.me/${p.phone?.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      style={{ color: "#0891B2", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
                    >
                      {p.phone}
                    </a>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 13, color: "#475569" }}>{p.email || "-"}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ 
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, 
                      background: "#DCFCE7", color: "#166534" 
                    }}>
                      PAID
                    </span>
                  </td>
                  <td style={styles.td}>
                    <p style={{ fontSize: 13, color: "#475569" }}>
                      {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>
                      {new Date(p.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
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
              <Users size={32} color="#CBD5E1" />
            </div>
            <p style={{ color: "#64748B", fontSize: 14 }}>Peserta tidak ditemukan.</p>
          </div>
        )}

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setPage={setCurrentPage} />}
      </div>
    </div>
  );
}
