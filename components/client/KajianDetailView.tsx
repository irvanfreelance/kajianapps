"use client";
import {
  ChevronLeft, Calendar, Clock, MapPin, User,
  Share2, Heart, Info, ArrowRight, Layers, Play, PlayCircle, Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const GOLD = "#8D6E53";
const DARK = "#ffffff";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const PEACH_BG = "#FAF1E6";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(d).replace("Minggu", "Ahad");
  } catch { return dateStr; }
};

export default function KajianDetailView({ kajian, relatedKajian = [] }: { kajian: any, relatedKajian?: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fallbackRelated, setFallbackRelated] = useState<any[]>([]);

  const isSeries = kajian.series_type === 'series';
  const episodes: any[] = kajian.series_episodes || [];

  useEffect(() => {
    if (relatedKajian.length === 0) {
      fetch('/api/kajian/list?limit=4')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFallbackRelated(data.filter(k => k.id !== kajian.id).slice(0, 3));
          }
        })
        .catch(err => console.error("Fallback related fetch error:", err));
    }
  }, [relatedKajian.length, kajian.id]);

  const displayRelated = relatedKajian.length > 0 ? relatedKajian : fallbackRelated;

  // For FREE kajian: go directly to infaq page (no modal)
  const handleRegisterAction = () => {
    if (kajian.type === "paid") {
      router.push(`/checkout?type=kajian&id=${kajian.id}&amount=${kajian.price}`);
    } else {
      router.push(`/kajian/${kajian.slug}/infaq`);
    }
  };

  return (
    <div style={{ background: DARK, minHeight: "100vh", paddingBottom: 100 }}>
      {/* Hero Image */}
      <div style={{ position: "relative", height: 350, overflow: "hidden", background: "#f5ece2" }}>
        <Image src={kajian.image} fill style={{ objectFit: "cover", filter: "blur(40px)", opacity: 0.15 }} alt="" />
        <Image src={kajian.image} width={430} height={350} style={{ objectFit: "contain", position: "relative", zIndex: 1, width: "100%", height: "100%" }} alt={kajian.title} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,0.1), #ffffff)", zIndex: 2 }} />

        <div style={{ position: "absolute", top: 20, left: 20, right: 20, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.back()} style={detailStyles.backBtnText}>
            <ChevronLeft size={20} /> <span>Kembali</span>
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={detailStyles.backBtn}><Share2 size={18} color={GOLD} /></button>
            <button style={detailStyles.backBtn}><Heart size={18} color={GOLD} /></button>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, zIndex: 10 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: GOLD, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase" as const }}>
              {kajian.category}
            </span>
            {isSeries && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", background: "rgba(139,92,246,0.08)", padding: "4px 12px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                <Layers size={11} /> Series • Eps. {kajian.episode_number}
              </span>
            )}
          </div>
          <h1 style={{ color: TEXT_DARK, fontSize: 24, fontWeight: 800, marginTop: 10, lineHeight: 1.25, margin: 0 }}>{kajian.title}</h1>
          {isSeries && kajian.series_title && (
            <p style={{ color: GOLD, fontSize: 12, marginTop: 6, fontWeight: 600, margin: 0 }}>📚 {kajian.series_title}</p>
          )}
        </div>
      </div>

      {/* Info Bar */}
      <div style={{ background: CARD_BG, padding: "18px 20px", display: "flex", justifyContent: "space-around", borderBottom: `1px solid ${BORDER_COLOR}` }}>
        <div style={{ textAlign: "center" }}>
          <Calendar size={18} color={GOLD} style={{ margin: "0 auto 6px" }} />
          <p style={{ fontSize: 11, fontWeight: 600, color: TEXT_DARK, margin: 0 }}>{formatDate(kajian.date || kajian.date_display)}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Clock size={18} color={GOLD} style={{ margin: "0 auto 6px" }} />
          <p style={{ fontSize: 11, fontWeight: 600, color: TEXT_DARK, margin: 0 }}>{kajian.time_display || kajian.time}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <User size={18} color={GOLD} style={{ margin: "0 auto 6px" }} />
          <p style={{ fontSize: 11, fontWeight: 600, color: TEXT_DARK, margin: 0 }}>{kajian.ustadz}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        {/* Description */}
        <div style={{ background: CARD_BG, borderRadius: 24, padding: 24, boxShadow: "0 4px 20px rgba(141,110,83,0.02)", border: `1px solid ${BORDER_COLOR}` }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_DARK, marginBottom: 14, margin: 0 }}>Deskripsi Kajian</h2>
          <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.8, marginTop: 8, margin: 0 }}>
            {kajian.description || "Kajian rutin yang membahas topik mendalam bersama ustadz pilihan. Terbuka untuk umum, ikhwan dan akhwat."}
          </p>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(141,110,83,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin size={18} color={GOLD} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0 }}>Lokasi</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK, marginTop: 2, margin: 0 }}>{kajian.location || "Masjid Al-Latif, Bandung"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div style={{ background: PEACH_BG, borderRadius: 18, padding: 14, marginTop: 16, display: "flex", gap: 12, border: `1px solid rgba(141,110,83,0.15)` }}>
          <Info size={18} color={GOLD} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: TEXT_DARK, lineHeight: 1.6, margin: 0 }}>Harap datang 15 menit sebelum kajian dimulai. Pastikan berpakaian sopan dan menjaga adab di majelis.</p>
        </div>

        {/* ── Series Episode List ── */}
        {isSeries && episodes.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_DARK, display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                <Layers size={18} color={GOLD} /> Semua Episode
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {episodes.map((ep: any) => {
                const isCurrent = ep.id === kajian.id;
                return (
                  <Link
                    key={ep.id}
                    href={`/kajian/${ep.slug}`}
                    style={{
                      background: isCurrent ? "rgba(141,110,83,0.06)" : CARD_BG,
                      borderRadius: 16, padding: 14, display: "flex", gap: 12, alignItems: "center",
                      textDecoration: "none", border: isCurrent ? `1.5px solid rgba(141,110,83,0.4)` : `1px solid ${BORDER_COLOR}`,
                      boxShadow: "0 2px 8px rgba(141,110,83,0.02)"
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: isCurrent ? GOLD : "rgba(141,110,83,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isCurrent ? <Play size={16} color="#fff" fill="#fff" /> : <span style={{ fontSize: 14, fontWeight: 800, color: TEXT_MUTED }}>{ep.episode_number}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? GOLD : TEXT_DARK, lineHeight: 1.3, margin: 0 }}>{ep.title}</p>
                      <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4, margin: 0 }}>
                        {formatDate(ep.date)} • {ep.time_display}
                      </p>
                    </div>
                    {!isCurrent && <ChevronLeft size={16} color="rgba(141,110,83,0.2)" style={{ transform: "rotate(180deg)" }} />}
                    {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, background: PEACH_BG, padding: "3px 8px", borderRadius: 8 }}>Kamu Di Sini</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Kajian */}
        {displayRelated.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>Kajian Terkait</h2>
              <Link href="/kajian" style={{ fontSize: 13, fontWeight: 600, color: GOLD, textDecoration: "none" }}>Lihat Semua</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {displayRelated.map((k) => (
                <Link key={k.id} href={`/kajian/${k.slug}`} style={{ textDecoration: "none", background: CARD_BG, borderRadius: 18, padding: 12, display: "flex", gap: 14, border: `1px solid ${BORDER_COLOR}`, boxShadow: "0 2px 8px rgba(141,110,83,0.02)" }}>
                  <div style={{ width: 72, height: 72, position: "relative", flexShrink: 0, borderRadius: 12, overflow: "hidden" }}>
                    <Image src={k.image} fill style={{ objectFit: "cover" }} alt={k.title} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase" as const, margin: 0 }}>{k.category}</p>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, margin: "4px 0", lineHeight: 1.4 }}>{k.title}</h3>
                    <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0 }}>{k.ustadz}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom CTA */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: CARD_BG, padding: "14px 20px 24px", borderTop: `1px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100, boxShadow: "0 -4px 30px rgba(141,110,83,0.04)" }}>
        <div>
          <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0 }}>Biaya Pendaftaran</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: GOLD, margin: 0 }}>
            {kajian.type === "free" ? "Infak Terbaik" : fmt(kajian.price)}
          </p>
        </div>
        <button
          onClick={handleRegisterAction}
          disabled={loading}
          style={{
            background: loading ? "rgba(141,110,83,0.4)" : GOLD,
            color: "#fff", padding: "13px 26px", borderRadius: 16,
            border: "none", fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: `0 6px 20px rgba(141,110,83,0.18)`
          }}
        >
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>
      </div>
    </div>
  );
}

const detailStyles: any = {
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    background: "rgba(255,255,255,0.75)", border: `1px solid ${BORDER_COLOR}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", backdropFilter: "blur(8px)"
  },
  backBtnText: {
    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12,
    background: "rgba(255,255,255,0.75)", border: `1px solid ${BORDER_COLOR}`,
    color: TEXT_DARK, fontSize: 13, fontWeight: 600,
    cursor: "pointer", backdropFilter: "blur(8px)"
  },
};
