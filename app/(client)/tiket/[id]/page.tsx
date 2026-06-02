"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, ChevronLeft, Clock, MapPin, Video, Play, Download, PlayCircle, Layers, Ticket, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "react-qr-code";

const GOLD = "#8D6E53";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PENDING: { bg: "rgba(234,179,8,0.15)", color: "#D4A308", label: "Menunggu" },
    PAID:    { bg: "rgba(34,197,94,0.15)",  color: "#16A34A", label: "Lunas" },
    FAILED:  { bg: "rgba(239,68,68,0.15)",  color: "#DC2626", label: "Gagal" },
  };
  const cfg = map[s] || map.PENDING;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, textTransform: "uppercase" }}>
      {cfg.label}
    </div>
  );
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [activeEpisodeId, setActiveEpisodeId] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/user/registrations/detail?id=${id}`)
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setData(d.data);
          setActiveEpisodeId(d.data.registration.kajian_id);
        } else {
          setError(d.error || "Gagal memuat detail tiket");
        }
      })
      .catch(() => setError("Gagal menghubungi server"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadQR = () => {
    if (!qrRef.current || !data?.registration?.ticket_code) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `tiket-${data.registration.ticket_code}.png`;
      a.click();
    };
    img.src = url;
  };

  const handleCopyCode = () => {
    if (!data?.registration?.ticket_code) return;
    navigator.clipboard?.writeText(data.registration.ticket_code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#ffffff", color: TEXT_DARK }}>
        <div style={{ width: 24, height: 24, border: `2px solid rgba(141,110,83,0.3)`, borderTopColor: GOLD, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#ffffff", padding: 20 }}>
        <div style={{ textAlign: "center", color: "#DC2626", fontSize: 16, marginBottom: 16 }}>{error || "Tiket tidak ditemukan"}</div>
        <button onClick={() => router.back()} style={{ padding: "10px 24px", borderRadius: 12, background: GOLD, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>Kembali</button>
      </div>
    );
  }

  const { registration, episodes } = data;
  const isSeries = registration.series_type === "series";

  const activeEpisode = isSeries
    ? (episodes.find((ep: any) => ep.id === activeEpisodeId) || registration)
    : registration;

  const fmtDate = (d: string) => {
    if (!d) return "-";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace("Minggu", "Ahad");
    } catch {
      return d;
    }
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", paddingBottom: 60, color: TEXT_DARK }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 20px 10px", borderBottom: `1px solid ${BORDER_COLOR}` }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: GOLD, padding: 0 }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/64.png" alt="Badar Logo" width={80} height={32} style={{ objectFit: "contain" }} />
          <h1 style={{ fontSize: 16, fontWeight: 800, color: TEXT_DARK, margin: 0 }}>Detail Tiket</h1>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {isSeries ? (
          /* SERIES PARENT HEADER CARD */
          <div style={{ background: CARD_BG, borderRadius: 24, padding: 20, border: `1px solid ${BORDER_COLOR}`, boxShadow: "0 8px 30px rgba(141,110,83,0.03)", marginBottom: 24, display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ width: 100, height: 130, position: "relative", borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#f5ece2", border: `1px solid ${BORDER_COLOR}` }}>
              <Image src={registration.series_image || registration.image || "/placeholder.png"} fill style={{ objectFit: "cover" }} alt="" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: TEXT_DARK, textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.3, margin: 0 }}>
                {registration.series_title || registration.title}
              </h2>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: 13, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                  <Calendar size={13} color={GOLD} /> {fmtDate(registration.kajian_date || registration.date)}
                </p>
                <p style={{ fontSize: 13, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                  <MapPin size={13} color={GOLD} /> {registration.ustadz}
                </p>
                <p style={{ fontSize: 13, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                  <Layers size={13} color={GOLD} /> {episodes.length} Episode
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* SINGLE KAJIAN CARD */
          <div style={{ background: CARD_BG, borderRadius: 24, padding: 20, border: `1px solid ${BORDER_COLOR}`, boxShadow: "0 8px 30px rgba(141,110,83,0.03)", marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 80, height: 80, position: "relative", borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#f5ece2" }}>
              <Image src={registration.image || "/placeholder.png"} fill style={{ objectFit: "cover" }} alt="" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: GOLD, padding: "2px 8px", borderRadius: 8, letterSpacing: 0.5, display: "inline-block", marginBottom: 6 }}>KAJIAN SINGLE</span>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: TEXT_DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{registration.title}</h2>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2, margin: 0 }}>{registration.ustadz}</p>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6, display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                <Calendar size={12} color={GOLD} /> {fmtDate(registration.kajian_date || registration.date)}
              </p>
            </div>
          </div>
        )}

        {/* SERIES EPISODES SELECTOR (IF SERIES) */}
        {isSeries && episodes.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderLeft: `4px solid ${GOLD}`, paddingLeft: 10, marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: TEXT_DARK, margin: 0 }}>Episode</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {episodes.map((ep: any) => {
                const isActive = ep.id === activeEpisodeId;
                return (
                  <div
                    key={ep.id}
                    onClick={() => setActiveEpisodeId(ep.id)}
                    style={{
                      background: isActive ? "rgba(141,110,83,0.05)" : CARD_BG,
                      borderRadius: 16,
                      padding: 14,
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      cursor: "pointer",
                      border: isActive ? `1.5px solid ${GOLD}` : `1px solid ${BORDER_COLOR}`,
                      transition: "all 0.2s ease",
                      boxShadow: isActive ? `0 4px 15px rgba(141,110,83,0.05)` : "none"
                    }}
                  >
                    <div style={{ width: 44, height: 44, position: "relative", borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f5ece2" }}>
                      <Image src={ep.image || registration.image || "/placeholder.png"} fill style={{ objectFit: "cover" }} alt="" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: isActive ? GOLD : TEXT_DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                        {ep.title}
                      </p>
                      <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 3, margin: 0 }}>
                        Eps. {ep.episode_number} • {fmtDate(ep.date)}
                      </p>
                    </div>
                    <PlayCircle size={20} color={isActive ? GOLD : "rgba(141,110,83,0.3)"} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTIVE TICKET DETAILS DISPLAY */}
        <div style={{ background: CARD_BG, borderRadius: 24, padding: 22, border: `1px solid ${BORDER_COLOR}`, boxShadow: "0 6px 20px rgba(141,110,83,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: TEXT_DARK, margin: 0 }}>
                {activeEpisode.title}
              </h4>
              <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 2, margin: 0 }}>{activeEpisode.ustadz}</p>
            </div>
            <StatusBadge status={registration.price === 0 ? "PAID" : registration.status} />
          </div>

          <div style={{ height: 1, background: "rgba(141,110,83,0.08)", margin: "16px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Calendar size={16} color={GOLD} />
              <p style={{ fontSize: 13, color: TEXT_DARK, margin: 0 }}>{fmtDate(activeEpisode.kajian_date || activeEpisode.date)}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Clock size={16} color={GOLD} />
              <p style={{ fontSize: 13, color: TEXT_DARK, margin: 0 }}>{activeEpisode.time_display || "19:30 WIB"}</p>
            </div>
            {activeEpisode.kajian_mode !== "online" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MapPin size={16} color={GOLD} />
                <p style={{ fontSize: 13, color: TEXT_DARK, margin: 0 }}>{activeEpisode.location || "Masjid At-Taqwa, Depok"}</p>
              </div>
            )}
          </div>

          {registration.status === "PENDING" && registration.price > 0 ? (
            /* UNPAID TICKET BILL */
            <div style={{ marginTop: 24 }}>
              <Link href={`/status/REG-${registration.id}`} style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 14, background: GOLD, color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14, boxShadow: `0 4px 15px rgba(141,110,83,0.15)` }}>
                Bayar Sekarang
              </Link>
            </div>
          ) : (
            /* APPROVED / ACTIVE STREAMING LINKS & QR TICKET */
            <div style={{ marginTop: 20 }}>
              {(registration.is_approved || registration.price === 0) && (activeEpisode.url_zoom || activeEpisode.url_youtube) && (
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {activeEpisode.url_zoom && (
                    <a href={activeEpisode.url_zoom} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "rgba(141,110,83,0.06)", color: GOLD, fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: `1px solid rgba(141,110,83,0.15)` }}>
                      <Video size={16} /> Zoom
                    </a>
                  )}
                  {activeEpisode.url_youtube && (
                    <a href={activeEpisode.url_youtube} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "rgba(141,110,83,0.06)", color: GOLD, fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: `1px solid rgba(141,110,83,0.15)` }}>
                      <Play size={16} /> YouTube
                    </a>
                  )}
                </div>
              )}

              {registration.ticket_code && (
                <div style={{ borderTop: `1.5px dashed ${BORDER_COLOR}`, paddingTop: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, textAlign: "center", marginBottom: 12, letterSpacing: 1.5, margin: 0 }}>E-TICKET QR CODE</p>
                  
                  <div ref={qrRef} style={{ background: "#fff", borderRadius: 16, padding: 14, display: "inline-block", boxShadow: "0 6px 20px rgba(141,110,83,0.05)", border: `1px solid ${BORDER_COLOR}` }}>
                    <QRCode value={registration.ticket_code} size={150} bgColor="#ffffff" fgColor="#2C1E15" level="M" />
                  </div>

                  <div style={{ width: "100%", background: "rgba(141,110,83,0.04)", border: `1.5px dashed rgba(141,110,83,0.25)`, borderRadius: 14, padding: "12px 14px", textAlign: "center", marginTop: 16 }}>
                    <p style={{ fontSize: 10, color: GOLD, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, margin: 0 }}>Kode Tiket</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: TEXT_DARK, fontFamily: "monospace", letterSpacing: 3, margin: 0 }}>{registration.ticket_code}</p>
                    <button onClick={handleCopyCode} style={{ marginTop: 6, fontSize: 11, color: GOLD, background: "none", border: "none", cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {copySuccess ? <Check size={12} /> : "📋"} {copySuccess ? "Tersalin!" : "Salin kode"}
                    </button>
                  </div>

                  <button onClick={handleDownloadQR} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", background: "rgba(141,110,83,0.08)", color: GOLD, border: `1px solid rgba(141,110,83,0.2)`, borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 14 }}>
                    <Download size={14} /> Unduh QR Tiket
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
