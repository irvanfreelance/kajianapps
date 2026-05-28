"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Search, Plus, Edit, Trash2, Users, FileDown, Layers } from "lucide-react";
import { styles, fmt, Pagination, Toast, formatDate } from "./shared";
import { exportToExcel } from "@/lib/excel";
import Link from "next/link";

export default function KajianView({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;
  
  const filtered = data.filter(k => 
    k.title?.toLowerCase().includes(search.toLowerCase()) ||
    k.ustadz?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    const exportData = filtered.map((k, i) => ({
      'No': i + 1,
      'Judul Kajian': k.title,
      'Pemateri/Ustadz': k.ustadz,
      'Tanggal': formatDate(k.date),
      'Waktu': k.time_display || k.time,
      'Tipe': k.type === 'free' ? 'Infaq' : 'Berbayar',
      'Harga': k.price,
      'Kuota': k.spot,
      'Pendaftar': k.filled || 0,
      'Terdaftar (Approved)': k.attendance_count || 0,
      'Hadir (Scan QR)': k.hadir_count || 0,
      'Rasio Hadir (%)': (k.attendance_count || 0) > 0
        ? Math.round(((k.hadir_count || 0) / (k.attendance_count || 1)) * 100)
        : 0,
      'Lokasi': k.location,
      'Deskripsi': k.desc
    }));
    exportToExcel(exportData, 'Data_Kajian');
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

  const handleDownloadTemplate = () => {
    const templateData = [{
      'Judul Kajian': 'Kajian Fiqih Muamalah',
      'Pemateri/Ustadz': 'Ustadz Dr. Erwandi Tarmizi',
      'Kategori': 'Fiqih',
      'Tanggal': '2026-06-01',
      'Waktu': '09:00 - 11:30',
      'Tipe': 'paid',
      'Harga': 50000,
      'Kuota': 100,
      'URL Zoom': '',
      'URL Youtube': ''
    }];
    exportToExcel(templateData, 'Template_Import_Kajian');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const payload = data.map((row: any) => ({
          title: row['Judul Kajian'],
          ustadz: row['Pemateri/Ustadz'],
          category: row['Kategori'],
          date: row['Tanggal'],
          time: row['Waktu'],
          type: row['Tipe'] === 'Infaq' || row['Tipe'] === 'free' ? 'free' : 'paid',
          price: Number(row['Harga']) || 0,
          spot: Number(row['Kuota']) || 0,
          url_zoom: row['URL Zoom'] || null,
          url_youtube: row['URL Youtube'] || null,
          image: " " // Kosongkan gambar sesuai request
        }));

        const res = await fetch('/api/kajian/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.success) {
          showToast(`Berhasil mengimpor ${json.count} kajian. Silakan refresh halaman.`);
          setTimeout(() => window.location.reload(), 2000);
        } else {
          alert("Gagal mengimpor data: " + json.error);
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat membaca file Excel.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Cari judul kajian..." 
            style={{...styles.searchInput, width: "100%"}} 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleDownloadTemplate} style={{...styles.secondaryBtn, display: 'flex', alignItems: 'center', gap: 6}}>
            Unduh Template
          </button>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            ref={fileInputRef} 
            onChange={handleImport} 
            style={{ display: 'none' }} 
          />
          <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} style={{...styles.secondaryBtn, display: 'flex', alignItems: 'center', gap: 6, opacity: isImporting ? 0.7 : 1}}>
            {isImporting ? 'Mengimpor...' : 'Import Excel'}
          </button>
          <button onClick={handleExport} style={styles.excelBtn}>
            <FileDown size={18} /> Export Excel
          </button>
          <Link href="/panel/kajian/series" style={{...styles.secondaryBtn, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6}}>
            <Layers size={18} /> Kelola Series
          </Link>
          <Link href="/panel/kajian/create" style={{...styles.primaryBtn, textDecoration: 'none'}}>
            <Plus size={18} /> Tambah Kajian
          </Link>
        </div>
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
                <th style={{...styles.th, minWidth: 160}}>Rasio Hadir</th>
                <th style={styles.th}>Zoom</th>
                <th style={styles.th}>YouTube</th>
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
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          {k.series_type === 'series' && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: "#EDE9FE", color: "#7C3AED", display: "flex", alignItems: "center", gap: 3 }}>
                              <Layers size={10} /> Eps. {k.episode_number || '?'}
                            </span>
                          )}
                          <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{k.title}</p>
                        </div>
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

                  {/* Rasio Hadir */}
                  {(() => {
                    const terdaftar = Number(k.attendance_count || 0);
                    const hadir = Number(k.hadir_count || 0);
                    const pct = terdaftar > 0 ? Math.round((hadir / terdaftar) * 100) : 0;
                    const barColor = pct >= 80 ? '#16A34A' : pct >= 50 ? '#D97706' : pct > 0 ? '#DC2626' : '#94A3B8';
                    return (
                      <td style={styles.td}>
                        {terdaftar > 0 ? (
                          <div style={{ minWidth: 130 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                              <span style={{ fontSize: 11, color: "#64748B" }}>{hadir}/{terdaftar} hadir</span>
                              <span style={{ fontSize: 12, fontWeight: 800, color: barColor }}>{pct}%</span>
                            </div>
                            <div style={{ height: 7, background: "#F1F5F9", borderRadius: 4 }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 4, transition: "width 0.4s ease" }} />
                            </div>
                            <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 3 }}>
                              {terdaftar} terdaftar
                            </p>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#CBD5E1" }}>Belum ada peserta</span>
                        )}
                      </td>
                    );
                  })()}

                  <td style={styles.td}>
                    {k.url_zoom ? <a href={k.url_zoom} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>Buka Zoom</a> : <span style={{ fontSize: 12, color: "#94a3b8" }}>-</span>}
                  </td>
                  <td style={styles.td}>
                    {k.url_youtube ? <a href={k.url_youtube} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#DC2626", textDecoration: "none", fontWeight: 500 }}>Buka YouTube</a> : <span style={{ fontSize: 12, color: "#94a3b8" }}>-</span>}
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
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} setPage={setCurrentPage} />}
      </div>
    </div>
  );
}
