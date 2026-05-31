"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, ChevronRight, Clock, MapPin, Ticket, Video, Play, Download, CheckCircle, AlertCircle, Clock3, Package, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GOLD = "#8D6E53";
const DARK = "#ffffff";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const PEACH_BG = "#FAF1E6";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PENDING: { bg: "rgba(234,179,8,0.15)", color: "#D4A308", label: "Menunggu" },
    PAID:    { bg: "rgba(34,197,94,0.15)",  color: "#16A34A", label: "Lunas" },
    PACKED:  { bg: "rgba(59,130,246,0.15)", color: "#2563EB", label: "Dikemas" },
    SHIPPED: { bg: "rgba(14,165,233,0.15)", color: "#0284C7", label: "Dikirim" },
    COMPLETED: { bg: "rgba(148,163,184,0.1)", color: "#475569", label: "Selesai" },
    FAILED:  { bg: "rgba(239,68,68,0.15)",  color: "#DC2626", label: "Gagal" },
  };
  const cfg = map[s] || map.PENDING;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase" }}>
      {cfg.label}
    </div>
  );
}

export function TiketView() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"approved" | "checkout">("approved");
  const [limitApproved, setLimitApproved] = useState(5);
  const [limitPending, setLimitPending] = useState(5);

  useEffect(() => {
    fetch("/api/user/registrations")
      .then(r => r.json())
      .then(d => { if (d.success) setRegistrations(d.data); else setError(d.error || "Gagal memuat"); })
      .catch(() => setError("Gagal menghubungi server"))
      .finally(() => setLoading(false));
  }, []);

  const approvedRegs = registrations.filter(r => r.is_approved || r.status === "PAID");
  const pendingRegs  = registrations.filter(r => !r.is_approved && r.status !== "PAID");
  const activeRegs   = activeTab === "approved" ? approvedRegs : pendingRegs;
  const slicedRegs   = activeRegs.slice(0, activeTab === "approved" ? limitApproved : limitPending);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (activeTab === "approved") setLimitApproved(p => Math.min(p + 5, approvedRegs.length));
        else setLimitPending(p => Math.min(p + 5, pendingRegs.length));
      }
    }, { threshold: 0.1 });
    if (node) observer.current.observe(node);
  }, [loading, activeTab, approvedRegs.length, pendingRegs.length]);

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <div style={{ paddingBottom: 20, background: DARK, minHeight: "100vh" }}>
      <div style={{ padding: "24px 20px 20px" }}>
        <h1 style={{ fontSize: 26, color: TEXT_DARK, fontWeight: 800, margin: 0 }}>Tiket Saya</h1>
        <p style={{ fontSize: 14, color: TEXT_MUTED, marginTop: 6, margin: 0 }}>Daftar kajian yang Anda ikuti</p>
      </div>

      {!loading && !error && registrations.length > 0 && (
        <div style={{ display: "flex", margin: "0 20px 20px", background: CARD_BG, borderRadius: 16, padding: 4, border: `1px solid ${BORDER_COLOR}` }}>
          {(["approved", "checkout"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
              background: activeTab === tab ? "rgba(141,110,83,0.08)" : "transparent",
              color: activeTab === tab ? GOLD : TEXT_MUTED,
              fontWeight: activeTab === tab ? 700 : 500, fontSize: 13, cursor: "pointer"
            }}>
              {tab === "approved" ? `Tiket Aktif (${approvedRegs.length})` : `Belum Bayar (${pendingRegs.length})`}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "0 20px" }}>
        {loading ? (
          [1,2,3].map(i => <div key={i} style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}`, borderRadius: 20, padding: 16, height: 90, marginBottom: 12, opacity: 0.5 }} />)
        ) : error ? (
          <div style={{ textAlign: "center", padding: 40, color: "#DC2626" }}>{error}</div>
        ) : activeRegs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {slicedRegs.map(reg => (
              <div key={reg.id} onClick={() => router.push(`/tiket/${reg.id}`)} style={{ background: CARD_BG, borderRadius: 20, padding: 16, border: `1px solid ${BORDER_COLOR}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: "0 4px 15px rgba(141,110,83,0.02)" }}>
                <div style={{ width: 60, height: 60, position: "relative", flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "#f5ece2" }}>
                  <Image src={reg.image || "/placeholder.png"} fill style={{ objectFit: "cover" }} alt="" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{reg.title}</p>
                  <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4, margin: 0 }}>{reg.ustadz}</p>
                  <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6, display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                    <Calendar size={12} color={GOLD} /> {fmtDate(reg.date)}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <StatusBadge status={reg.price === 0 ? "PAID" : reg.status} />
                  <ChevronRight size={16} color="rgba(141,110,83,0.3)" />
                </div>
              </div>
            ))}
            {activeRegs.length > slicedRegs.length && (
              <div ref={lastElRef} style={{ padding: "16px 0", display: "flex", justifyContent: "center" }}>
                <div style={{ width: 20, height: 20, border: `2px solid rgba(141,110,83,0.3)`, borderTopColor: GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(141,110,83,0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: `1px solid rgba(141,110,83,0.15)` }}>
              <Ticket size={32} color={GOLD} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: TEXT_DARK, margin: 0 }}>{activeTab === "approved" ? "Belum Ada Tiket Aktif" : "Tidak Ada Tagihan"}</p>
            <p style={{ fontSize: 14, color: TEXT_MUTED, textAlign: "center", marginTop: 8, maxWidth: 240, margin: 0 }}>
              {activeTab === "approved" ? "Daftar kajian terlebih dahulu." : "Semua pendaftaran Anda telah lunas!"}
            </p>
            <Link href="/" style={{ marginTop: 24, padding: "12px 28px", borderRadius: 14, background: GOLD, color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14, boxShadow: "0 4px 12px rgba(141,110,83,0.2)" }}>Cari Kajian</Link>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
