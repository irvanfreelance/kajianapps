"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, ChevronRight, Clock, MapPin, Ticket, Video, Play, Download, CheckCircle, AlertCircle, Clock3, Package, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GOLD = "#D4AF37";
const DARK = "#0D0D14";

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PENDING: { bg: "rgba(234,179,8,0.15)", color: "#EAB308", label: "Menunggu" },
    PAID:    { bg: "rgba(34,197,94,0.15)",  color: "#22C55E", label: "Lunas" },
    PACKED:  { bg: "rgba(59,130,246,0.15)", color: "#60A5FA", label: "Dikemas" },
    SHIPPED: { bg: "rgba(14,165,233,0.15)", color: "#38BDF8", label: "Dikirim" },
    COMPLETED: { bg: "rgba(148,163,184,0.1)", color: "#94A3B8", label: "Selesai" },
    FAILED:  { bg: "rgba(239,68,68,0.15)",  color: "#F87171", label: "Gagal" },
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
        <h1 style={{ fontSize: 26, color: "#fff", fontWeight: 800 }}>Tiket Saya</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Daftar kajian yang Anda ikuti</p>
      </div>

      {!loading && !error && registrations.length > 0 && (
        <div style={{ display: "flex", margin: "0 20px 20px", background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 4, border: `1px solid rgba(212,175,55,0.1)` }}>
          {(["approved", "checkout"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
              background: activeTab === tab ? "rgba(212,175,55,0.15)" : "transparent",
              color: activeTab === tab ? GOLD : "rgba(255,255,255,0.4)",
              fontWeight: activeTab === tab ? 700 : 500, fontSize: 13, cursor: "pointer"
            }}>
              {tab === "approved" ? `Tiket Aktif (${approvedRegs.length})` : `Belum Bayar (${pendingRegs.length})`}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "0 20px" }}>
        {loading ? (
          [1,2,3].map(i => <div key={i} style={{ background: "#18181F", borderRadius: 20, padding: 16, height: 90, marginBottom: 12, opacity: 0.5 }} />)
        ) : error ? (
          <div style={{ textAlign: "center", padding: 40, color: "#F87171" }}>{error}</div>
        ) : activeRegs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {slicedRegs.map(reg => (
              <div key={reg.id} onClick={() => router.push(`/tiket/${reg.id}`)} style={{ background: "#18181F", borderRadius: 20, padding: 16, border: `1px solid rgba(212,175,55,0.1)`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                <div style={{ width: 60, height: 60, position: "relative", flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "#111" }}>
                  <Image src={reg.image || "/placeholder.png"} fill style={{ objectFit: "cover" }} alt="" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reg.title}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{reg.ustadz}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} color={GOLD} /> {fmtDate(reg.date)}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <StatusBadge status={reg.price === 0 ? "PAID" : reg.status} />
                  <ChevronRight size={16} color="rgba(212,175,55,0.4)" />
                </div>
              </div>
            ))}
            {activeRegs.length > slicedRegs.length && (
              <div ref={lastElRef} style={{ padding: "16px 0", display: "flex", justifyContent: "center" }}>
                <div style={{ width: 20, height: 20, border: `2px solid rgba(212,175,55,0.3)`, borderTopColor: GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(212,175,55,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: `1px solid rgba(212,175,55,0.15)` }}>
              <Ticket size={32} color={GOLD} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{activeTab === "approved" ? "Belum Ada Tiket Aktif" : "Tidak Ada Tagihan"}</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 8, maxWidth: 240 }}>
              {activeTab === "approved" ? "Daftar kajian terlebih dahulu." : "Semua pendaftaran Anda telah lunas!"}
            </p>
            <Link href="/" style={{ marginTop: 24, padding: "12px 28px", borderRadius: 14, background: GOLD, color: "#0A0A0F", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Cari Kajian</Link>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
