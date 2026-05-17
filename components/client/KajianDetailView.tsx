"use client";
import { 
  ChevronLeft, Calendar, Clock, MapPin, User, 
  Share2, Heart, Info, ArrowRight, X
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

export default function KajianDetailView({ kajian, relatedKajian = [] }: { kajian: any, relatedKajian?: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fallbackRelated, setFallbackRelated] = useState<any[]>([]);

  // If no related kajian found by category, fetch some latest ones
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

  const handleRegisterFree = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/kajian/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kajianId: kajian.id,
          paidAmount: 0
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/checkout/success?type=kajian&code=${data.id}`);
    } catch (err: any) {
      alert("Gagal mendaftar: " + err.message);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleRegisterAction = () => {
    if (kajian.type === "paid") {
      router.push(`/checkout?type=kajian&id=${kajian.id}&amount=${kajian.price}`);
    } else {
      setShowModal(true);
    }
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", paddingBottom: 100 }}>
      {/* Hero Image */}
      <div style={{ position: "relative", height: 350, overflow: "hidden", background: "#000" }}>
        {/* Blurred background for contain fit */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${kajian.image})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(40px)", opacity: 0.5 }} />
        <img src={kajian.image} style={{ width: "100%", height: "100%", objectFit: "contain", position: "relative", zIndex: 1 }} alt={kajian.title} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))", zIndex: 2 }} />
        
        {/* Top Buttons - ENSURE VISIBILITY with higher z-index and explicit positioning */}
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.back()} style={styles.backBtnText}>
            <ChevronLeft size={20} /> <span>Kembali</span>
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={styles.backBtn}><Share2 size={20} color="#fff"/></button>
            <button style={styles.backBtn}><Heart size={20} color="#fff"/></button>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 30, left: 20, right: 20, zIndex: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0891B2", background: "#CFFAFE", padding: "4px 12px", borderRadius: 20, textTransform: "uppercase" }}>{kajian.category}</span>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, marginTop: 12, lineHeight: 1.2 }}>{kajian.title}</h1>
        </div>
      </div>

      {/* Info Bar */}
      <div style={{ background: "#fff", padding: "20px", display: "flex", justifyContent: "space-around", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ textAlign: "center" }}>
          <Calendar size={20} color="#0891B2" style={{ margin: "0 auto 6px" }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{formatDate(kajian.date || kajian.date_display)}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Clock size={20} color="#0891B2" style={{ margin: "0 auto 6px" }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{kajian.time_display || kajian.time}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <User size={20} color="#0891B2" style={{ margin: "0 auto 6px" }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{kajian.ustadz}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #F1F5F9" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Deskripsi Kajian</h2>
          <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.8 }}>
            {kajian.description || "Assalamu'alaikum Warahmatullahi Wabarakatuh. Mari hadiri kajian rutin yang akan membahas topik mendalam bersama ustadz pilihan. Terbuka untuk umum, ikhwan dan akhwat."}
          </p>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
             <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#ECFEFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <MapPin size={20} color="#0891B2" />
                </div>
                <div>
                   <p style={{ fontSize: 12, color: "#64748B" }}>Lokasi</p>
                   <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{kajian.location || "Masjid Al-Latif, Bandung"}</p>
                </div>
             </div>
          </div>
        </div>

        <div style={{ background: "#FFFBEB", borderRadius: 20, padding: 16, marginTop: 20, display: "flex", gap: 12 }}>
           <Info size={20} color="#B45309" style={{ flexShrink: 0 }} />
           <p style={{ fontSize: 13, color: "#B45309", lineHeight: 1.6 }}>Harap datang 15 menit sebelum kajian dimulai. Pastikan berpakaian sopan dan menjaga adab di majelis.</p>
        </div>

        {/* Related Kajian Grid */}
        {displayRelated.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Kajian Terkait</h2>
              <Link href="/kajian" style={{ fontSize: 13, fontWeight: 600, color: "#0891B2", textDecoration: "none" }}>Lihat Semua</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              {displayRelated.map((k) => (
                <Link key={k.id} href={`/kajian/${k.slug}`} style={{ textDecoration: "none", background: "#fff", borderRadius: 20, padding: 12, display: "flex", gap: 16, border: "1px solid #F1F5F9" }}>
                  <img src={k.image} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} alt={k.title} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#0891B2", textTransform: "uppercase" }}>{k.category}</p>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: "4px 0", lineHeight: 1.4 }}>{k.title}</h3>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{k.ustadz}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Action */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", padding: "16px 20px 24px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100 }}>
        <div>
          <p style={{ fontSize: 12, color: "#64748B" }}>Biaya Pendaftaran</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#0891B2" }}>{kajian.type === "free" ? "GRATIS" : fmt(kajian.price)}</p>
        </div>
        <button 
           onClick={handleRegisterAction}
           disabled={loading}
           style={{ background: loading ? "#94A3B8" : "#0891B2", color: "#fff", padding: "14px 28px", borderRadius: 16, border: "none", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 10px 20px rgba(8,145,178,0.2)" }}
        >
           {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Konfirmasi Pendaftaran</h3>
              <button onClick={() => setShowModal(false)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} color="#94A3B8" /></button>
            </div>
            <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, marginBottom: 24 }}>
              Anda akan mendaftar ke kajian <strong>{kajian.title}</strong>. Pendaftaran ini gratis. Anda juga dapat memberikan infaq sukarela untuk mendukung dakwah kami.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button 
                onClick={handleRegisterFree}
                disabled={loading}
                style={{ ...styles.modalBtn, background: "#F1F5F9", color: "#0F172A" }}
              >
                {loading ? "Memproses..." : "Daftar Saja (Gratis)"}
              </button>
              <button 
                onClick={() => router.push(`/kajian/${kajian.slug}/infaq`)}
                style={{ ...styles.modalBtn, background: "#0891B2", color: "#fff" }}
              >
                Daftar & Berikan Infaq <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: any = {
  backBtn: { width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)" },
  backBtnText: { 
    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, 
    background: "rgba(0,0,0,0.3)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
    cursor: "pointer", backdropFilter: "blur(8px)" 
  },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" },
  modalContent: { background: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 380, animation: "slideUp 0.3s ease-out" },
  modalBtn: { width: "100%", padding: "16px", borderRadius: 16, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
};
