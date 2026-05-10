"use client";
import { useState, useEffect, useRef } from "react";
import { User, Calendar, Clock, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

const fmt = (n) => "Rp " + (n || 0).toLocaleString("id-ID");
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
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setKajian(prev => [...prev, ...json.data]);
        setOffset(prev => prev + json.data.length);
        if (json.data.length < 3) setHasMore(false);
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
    // Reset when category changes
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

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [offset, hasMore, isLoading, cat]);

  return (
    <div style={{ paddingBottom: 50 }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontSize: 26, color: "#0F172A", fontWeight: 700 }}>Jadwal Kajian</h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Pilih kajian dan daftar sekarang</p>
      </div>
      
      <div style={{ display: "flex", gap: 10, padding: "20px", overflowX: "auto" }}>
        {CATEGORIES_KAJIAN.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{ ...styles.chip, background: cat === c ? "#0891B2" : "#fff", color: cat === c ? "#fff" : "#475569", border: cat === c ? "1px solid #0891B2" : "1px solid #CBD5E1" }}>{c}</button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        {kajian.map((k, i) => (
          <Link key={`${k.id}-${i}`} href={`/kajian/${k.slug}`} style={{ background: "#fff", borderRadius: 20, padding: 16, marginBottom: 16, boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #F1F5F9", cursor: "pointer", display: "flex", gap: 16, alignItems: "center", textDecoration: 'none', color: 'inherit', animation: "fadeUp 0.3s ease" }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, overflow: "hidden", flexShrink: 0 }}>
              <img src={k.image} alt={k.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#0891B2", textTransform: "uppercase", letterSpacing: 1 }}>{k.category}</span>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginTop: 4, lineHeight: 1.3 }}>{k.title}</h3>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{k.ustadz}</p>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                   <Calendar size={12} color="#94A3B8" />
                   <span style={{ fontSize: 11, color: "#64748B" }}>{k.date}</span>
                 </div>
                 <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                   <Clock size={12} color="#94A3B8" />
                   <span style={{ fontSize: 11, color: "#64748B" }}>{k.time}</span>
                 </div>
              </div>
            </div>
            <ChevronRight size={20} color="#CBD5E1" />
          </Link>
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={observerTarget} style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        {isLoading && <Loader2 size={24} color="#0891B2" className="animate-spin" />}
        {!hasMore && kajian.length > 0 && <p style={{ fontSize: 12, color: "#94A3B8" }}>Semua kajian telah dimuat</p>}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  chip: { padding: "8px 20px", borderRadius: 20, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const },
};
