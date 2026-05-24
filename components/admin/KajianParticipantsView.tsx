"use client";
import { useState } from "react";
import { Search, FileDown, ArrowLeft, Users, QrCode, CheckCircle2, Clock, UserCheck, RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { styles, fmt, Pagination, formatDate } from "./shared";
import { exportToExcel } from "@/lib/excel";
import Link from "next/link";
import QRCode from "react-qr-code";

export default function KajianParticipantsView({ kajian, initialData }: { kajian: any, initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hadirFilter, setHadirFilter] = useState<"all" | "hadir" | "belum">("all");
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);
  const [showQrPanel, setShowQrPanel] = useState(false);
  const pageSize = 15;

  // Build self-checkin URL dynamically
  const selfCheckinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/hadir/${kajian.id}`
    : `/hadir/${kajian.id}`;

  const filtered = data.filter(p => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search);
    const matchHadir =
      hadirFilter === "all" ||
      (hadirFilter === "hadir" && p.is_hadir) ||
      (hadirFilter === "belum" && !p.is_hadir);
    return matchSearch && matchHadir;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hadirCount = data.filter(p => p.is_hadir).length;

  const handleToggleHadir = async (p: any) => {
    if (!p.ticket_code) {
      alert("Ticket code tidak ditemukan untuk jamaah ini.");
      return;
    }
    setLoadingTicket(p.ticket_code);
    try {
      const res = await fetch("/api/kajian/attendance/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: p.ticket_code, kajianId: kajian.id }),
      });
      const json = await res.json();
      if (json.success) {
        setData(prev =>
          prev.map(item =>
            item.ticket_code === p.ticket_code
              ? { ...item, is_hadir: json.is_hadir, checked_in_at: json.checked_in_at }
              : item
          )
        );
      } else {
        alert("Gagal: " + json.error);
      }
    } catch {
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoadingTicket(null);
    }
  };

  const handlePrintQr = () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/hadir/${kajian.id}`
      : `/hadir/${kajian.id}`;

    const qrSvgEl = document.getElementById("kajian-qr-print-svg")?.querySelector("svg");
    const qrSvg = qrSvgEl ? new XMLSerializer().serializeToString(qrSvgEl) : "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>QR Check-in: ${kajian.title}</title>
      <style>
        body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff; text-align: center; padding: 20px; box-sizing: border-box; }
        h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
        p { font-size: 14px; color: #64748B; margin-bottom: 20px; }
        .qr-wrap { padding: 20px; border: 2px solid #E2E8F0; border-radius: 16px; display: inline-block; margin: 0 auto 20px; }
        .url { font-size: 11px; color: #94A3B8; word-break: break-all; max-width: 300px; }
        .badge { margin: 12px auto; display: inline-block; background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      <h1>${kajian.title}</h1>
      <p>${kajian.ustadz} &bull; Self Check-in Kehadiran</p>
      <div class="qr-wrap">${qrSvg || `<p style="color:red">QR tidak tersedia, buka panel terlebih dahulu</p>`}</div>
      <div class="badge">✅ Scan untuk Check-in</div>
      <p class="url">Atau buka: ${url}</p>
      <script>window.onload = function(){ window.print(); }<\/script>
      </body></html>
    `);
    win.document.close();
  };

  const handleExport = () => {
    const exportData = filtered.map((p, i) => ({
      'No': i + 1,
      'Kode Tiket': p.ticket_code || "-",
      'Nama': p.name,
      'WhatsApp': p.phone,
      'Email': p.email,
      'Tanggal Daftar': new Date(p.date).toLocaleString('id-ID'),
      'Status': p.status,
      'Nominal': p.paid_amount,
      'Hadir': p.is_hadir ? 'YA' : 'TIDAK',
      'Jam Check-in': p.checked_in_at ? new Date(p.checked_in_at).toLocaleString('id-ID') : '-',
    }));
    exportToExcel(exportData, `Peserta_${kajian.title.replace(/\s+/g, '_')}`);
  };

  const formatCheckinTime = (isoStr: string | null) => {
    if (!isoStr) return "-";
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch { return "-"; }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Header */}
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
        {/* Stats */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          {[
            { label: "Total Peserta", value: data.length, color: "#0891B2" },
            { label: "Hadir", value: hadirCount, color: "#16A34A" },
            { label: "Belum Hadir", value: data.length - hadirCount, color: "#D97706" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Self Check-in QR Panel */}
      <div style={{ marginBottom: 20, border: "1.5px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
        <button
          onClick={() => setShowQrPanel(v => !v)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", background: showQrPanel ? "#F0FDFA" : "#F8FAFC",
            border: "none", cursor: "pointer", borderBottom: showQrPanel ? "1.5px solid #CCFBF1" : "none"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: showQrPanel ? "#CCFBF1" : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCode size={16} color={showQrPanel ? "#0F766E" : "#64748B"} />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: showQrPanel ? "#0F766E" : "#0F172A" }}>QR Self Check-in (untuk Cetak)</p>
              <p style={{ fontSize: 11, color: "#64748B" }}>Peserta scan QR ini lalu masukkan kode tiket masing-masing</p>
            </div>
          </div>
          {showQrPanel ? <ChevronUp size={18} color="#64748B" /> : <ChevronDown size={18} color="#64748B" />}
        </button>

        {showQrPanel && (
          <div style={{ padding: "24px 20px", background: "#fff", display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
            <div id="kajian-qr-print-svg" style={{ flexShrink: 0 }}>
              <QRCode value={selfCheckinUrl} size={160} bgColor="#ffffff" fgColor="#0F172A" level="M" />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Cara Kerja Self Check-in
              </p>
              <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                {["Cetak QR ini dan tempel di lokasi kajian", "Peserta scan QR dengan kamera HP", `Peserta masukkan Kode Tiket dari menu "Tiket Saya"`, "Sistem otomatis mencatat kehadiran"].map((t, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{t}</li>
                ))}
              </ol>
              <div style={{ marginTop: 14, padding: "10px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <p style={{ fontSize: 10, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>URL Self Check-in</p>
                <p style={{ fontSize: 11, color: "#0891B2", fontFamily: "monospace", wordBreak: "break-all" }}>{selfCheckinUrl}</p>
              </div>
              <button
                onClick={handlePrintQr}
                style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #0F172A, #1E293B)", color: "#fff", fontSize: 13, fontWeight: 700 }}
              >
                <Printer size={15} /> Cetak QR Kajian
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters + Buttons */}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flex: 1 }}>
          <div style={{ position: "relative", maxWidth: 320, flex: 1 }}>
            <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Cari nama atau nomor WhatsApp..."
              style={{ ...styles.searchInput, width: "100%", paddingLeft: 40 }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select
            value={hadirFilter}
            onChange={(e) => { setHadirFilter(e.target.value as any); setCurrentPage(1); }}
            style={{ ...styles.searchInput, width: "auto", minWidth: 160, padding: "8px 16px 8px 12px" }}
          >
            <option value="all">Semua Kehadiran</option>
            <option value="hadir">✅ Sudah Hadir</option>
            <option value="belum">⏳ Belum Hadir</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href={`/panel/kajian/${kajian.id}/scan`}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10,
              background: "linear-gradient(135deg, #0F172A, #1E293B)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)"
            }}
          >
            <QrCode size={16} /> Scan Kehadiran
          </Link>
          <button onClick={handleExport} style={styles.secondaryBtn}>
            <FileDown size={18} /> Export Excel
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 40, textAlign: "center" }}>No.</th>
                <th style={styles.th}>Nama Peserta</th>
                <th style={styles.th}>Kode Tiket</th>
                <th style={styles.th}>WhatsApp</th>
                <th style={styles.th}>Email</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Status Hadir</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Jam Check-in</th>
                <th style={styles.th}>Tanggal Daftar</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((p, idx) => {
                const isLoading = loadingTicket === p.ticket_code;
                return (
                  <tr key={idx} style={styles.tr}>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                        {(currentPage - 1) * pageSize + idx + 1}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: p.is_hadir ? "#DCFCE7" : "#F1F5F9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700,
                          color: p.is_hadir ? "#166534" : "#475569", flexShrink: 0
                        }}>
                          {p.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{p.name}</span>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0891B2", fontFamily: "monospace", background: "#ECFEFF", padding: "4px 8px", borderRadius: 6, border: "1px solid #A5F3FC" }}>
                        {p.ticket_code || "-"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <a
                        href={`https://wa.me/${p.phone?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#0891B2", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
                      >
                        {p.phone}
                      </a>
                    </td>

                    <td style={styles.td}>
                      <span style={{ fontSize: 13, color: "#475569" }}>{p.email || "-"}</span>
                    </td>

                    {/* Status Hadir */}
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {p.is_hadir ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#DCFCE7", color: "#166534", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20 }}>
                          <CheckCircle2 size={12} /> HADIR
                        </div>
                      ) : (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20 }}>
                          <Clock size={12} /> BELUM
                        </div>
                      )}
                    </td>

                    {/* Jam Check-in */}
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {p.checked_in_at ? (
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>
                            {formatCheckinTime(p.checked_in_at)}
                          </p>
                          <p style={{ fontSize: 11, color: "#64748B" }}>
                            {new Date(p.checked_in_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "#CBD5E1" }}>-</span>
                      )}
                    </td>

                    <td style={styles.td}>
                      <p style={{ fontSize: 13, color: "#475569" }}>
                        {new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p style={{ fontSize: 11, color: "#94A3B8" }}>
                        {new Date(p.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    {/* Tombol Aksi */}
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <button
                        onClick={() => handleToggleHadir(p)}
                        disabled={isLoading}
                        title={p.is_hadir ? "Batalkan kehadiran" : "Tandai hadir manual"}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "7px 14px", borderRadius: 10, border: "none",
                          fontSize: 12, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer",
                          opacity: isLoading ? 0.6 : 1,
                          transition: "all 0.15s ease",
                          background: p.is_hadir
                            ? "linear-gradient(135deg, #FEF3C7, #FDE68A)"
                            : "linear-gradient(135deg, #DCFCE7, #BBF7D0)",
                          color: p.is_hadir ? "#92400E" : "#166534",
                          boxShadow: p.is_hadir
                            ? "0 2px 8px rgba(217, 119, 6, 0.2)"
                            : "0 2px 8px rgba(22, 163, 74, 0.2)",
                        }}
                      >
                        {isLoading ? (
                          <div style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        ) : p.is_hadir ? (
                          <><RotateCcw size={13} /> Batalkan</>
                        ) : (
                          <><UserCheck size={13} /> Hadir</>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
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

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} setPage={setCurrentPage} />}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
