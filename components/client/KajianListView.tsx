"use client";
import { useState, useEffect, useRef } from "react";
import { User, Calendar, Clock, ChevronRight, Loader2, Layers } from "lucide-react";
import Link from "next/link";
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
const CATEGORIES_KAJIAN = ["Semua", "Fiqh", "Tahsin", "Sirah", "Bahasa", "Hadits", "Tarbiyah"];

export default function KajianListView({ initialKajian }: { initialKajian: any[] }) {
  const [cat, setCat] = useState("Semua");
  const [kajian, setKajian] = useState(initialKajian);
  const [offset, setOffset] = useState(initialKajian.length);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef(null);

  const fetchMoreKajian = async (currentOffset: number, currentCat: string) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/kajian/list?limit=3&offset=${currentOffset}&category=${currentCat}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.success ? data.data : []);
      if (list && list.length > 0) {
        setKajian(prev => [...prev, ...list]);
        setOffset(prev => prev + list.length);
        if (list.length < 3) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more kajian:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setKajian(initialKajian.filter(k => cat === 'Semua' || k.category === cat));
    setOffset(initialKajian.filter(k => cat === 'Semua' || k.category === cat).length);
    setHasMore(true);
  }, [cat, initialKajian]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMoreKajian(offset, cat);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [offset, hasMore, isLoading, cat]);

  return (
    <div style={{ paddingBottom: 50, background: DARK, minHeight: "100vh" }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontSize: 26, color: TEXT_DARK, fontWeight: 800, margin: 0 }}>Jadwal Kajian</h1>
        <p style={{ fontSize: 14, color: TEXT_MUTED, marginTop: 6, margin: 0 }}>Pilih kajian dan daftar sekarang</p>
      </div>

      <div style={{ display: "flex", gap: 10, padding: "20px", overflowX: "auto" }}>
        {CATEGORIES_KAJIAN.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              padding: "8px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap" as const,
              background: cat === c ? GOLD : CARD_BG,
              color: cat === c ? "#fff" : TEXT_MUTED,
              border: cat === c ? `1px solid ${GOLD}` : `1px solid ${BORDER_COLOR}`,
              transition: "all 0.2s"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        {kajian.map((k, i) => (
          <Link
            key={`${k.id}-${i}`}
            href={`/kajian/${k.slug}`}
            style={{
              background: CARD_BG, borderRadius: 20, padding: 16, marginBottom: 14,
              boxShadow: "0 4px 20px rgba(141,110,83,0.03)", border: `1px solid ${BORDER_COLOR}`,
              cursor: "pointer", display: "flex", gap: 14, alignItems: "center",
              textDecoration: 'none', color: 'inherit', animation: "fadeUp 0.3s ease"
            }}
          >
            <div style={{ width: 80, height: 80, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#f5ece2", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Image src={k.image} alt={k.title} width={80} height={80} style={{ objectFit: "contain" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: k.type === 'free' ? GOLD : "#fff", background: k.type === 'free' ? PEACH_BG : GOLD, padding: "3px 8px", borderRadius: 10, letterSpacing: 0.5 }}>
                  {k.type === 'free' ? 'INFAQ' : fmt(k.price)}
                </span>
                {k.series_type === 'series' && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#8B5CF6", background: "rgba(139,92,246,0.08)", padding: "3px 8px", borderRadius: 10, display: "flex", alignItems: "center", gap: 3 }}>
                    <Layers size={10} /> Eps.{k.episode_number}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT_DARK, marginTop: 4, lineHeight: 1.3, margin: 0 }}>{k.title}</h3>
              <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4, margin: 0 }}>{k.ustadz}</p>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={11} color={GOLD} />
                  <span style={{ fontSize: 11, color: TEXT_MUTED }}>{formatDate(k.date)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} color={GOLD} />
                  <span style={{ fontSize: 11, color: TEXT_MUTED }}>{k.time}</span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} color="rgba(141,110,83,0.4)" />
          </Link>
        ))}
      </div>

      <div ref={observerTarget} style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        {isLoading && <Loader2 size={24} color={GOLD} className="animate-spin" />}
        {!hasMore && kajian.length > 0 && <p style={{ fontSize: 12, color: TEXT_MUTED }}>Semua kajian telah dimuat</p>}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
