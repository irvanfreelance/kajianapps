"use client";
import { 
  ChevronLeft, Calendar, Clock, MapPin, User, 
  Share2, Heart, Info, BookOpen, Video, Play
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

export default function KajianDetailView({ kajian }: { kajian: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [infaqAmount, setInfaqAmount] = useState<number | "">(0);
  const NOMINALS = [10000, 25000, 50000, 100000];

  const handleRegister = async () => {
    // If it's paid kajian OR free with infaq > 0
    if (kajian.type === "paid" || (infaqAmount && Number(infaqAmount) > 0)) {
      const amount = kajian.type === "paid" ? kajian.price : infaqAmount;
      router.push(`/checkout?type=kajian&id=${kajian.id}&amount=${amount}`);
      return;
    }

    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/kajian/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kajianId: kajian.id,
          paidAmount: 0,
          status: 'PAID' // Free registration is immediately paid
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/checkout/success?type=kajian&code=${data.id}`);
    } catch (err: any) {
      alert("Gagal mendaftar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh" }}>
      {/* Hero Image */}
      <div style={{ position: "relative", height: 350, overflow: "hidden", background: "#000" }}>
        {/* Blurred background for contain fit */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${kajian.image})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(40px)", opacity: 0.5 }} />
        <img src={kajian.image} style={{ width: "100%", height: "100%", objectFit: "contain", position: "relative", zIndex: 1 }} alt={kajian.title} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))", zIndex: 2 }} />
        
        <div style={{ position: "relative", zIndex: 10, padding: 20, display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => router.back()} style={styles.backBtn}><ChevronLeft size={24} color="#fff"/></button>
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
          <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{formatDate(kajian.date)}</p>
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

             {kajian.url_zoom && (
               <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <Video size={20} color="#4F46E5" />
                  </div>
                  <div>
                     <p style={{ fontSize: 12, color: "#64748B" }}>Zoom Meeting</p>
                     <a href={kajian.url_zoom} target="_blank" style={{ fontSize: 14, fontWeight: 600, color: "#4F46E5", textDecoration: "none" }}>Link Zoom</a>
                  </div>
               </div>
             )}

             {kajian.url_youtube && (
               <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <Play size={20} color="#EF4444" />
                  </div>
                  <div>
                     <p style={{ fontSize: 12, color: "#64748B" }}>Live Youtube</p>
                     <a href={kajian.url_youtube} target="_blank" style={{ fontSize: 14, fontWeight: 600, color: "#EF4444", textDecoration: "none" }}>Tonton Live</a>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div style={{ background: "#FFFBEB", borderRadius: 20, padding: 16, marginTop: 20, display: "flex", gap: 12 }}>
           <Info size={20} color="#B45309" style={{ flexShrink: 0 }} />
           <p style={{ fontSize: 13, color: "#B45309", lineHeight: 1.6 }}>Harap datang 15 menit sebelum kajian dimulai. Pastikan berpakaian sopan dan menjaga adab di majelis.</p>
        </div>

        {kajian.type === "free" && (
          <div style={{ marginTop: 24, background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #F1F5F9" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Infaq Sukarela</h2>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Dukung kegiatan dakwah kami dengan infaq terbaik Anda (Opsional)</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {NOMINALS.map(n => (
                <button 
                  key={n} 
                  onClick={() => setInfaqAmount(n)}
                  style={{ 
                    padding: "12px", borderRadius: 12, border: infaqAmount === n ? "2px solid #0891B2" : "1px solid #E2E8F0",
                    background: infaqAmount === n ? "#ECFEFF" : "#fff",
                    color: infaqAmount === n ? "#0891B2" : "#475569",
                    fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {fmt(n)}
                </button>
              ))}
            </div>

            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 700, color: "#64748B" }}>Rp</span>
              <input 
                type="number" 
                placeholder="Nominal lainnya..."
                value={infaqAmount || ""}
                onChange={(e) => setInfaqAmount(parseInt(e.target.value) || "")}
                style={{ width: "100%", padding: "14px 14px 14px 40px", borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 14, fontWeight: 700, outline: "none", color: "#0F172A" }}
              />
              {infaqAmount !== 0 && (
                <button 
                  onClick={() => setInfaqAmount(0)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  Reset
                </button>
              )}
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
           onClick={handleRegister}
           disabled={loading}
           style={{ background: loading ? "#94A3B8" : "#0891B2", color: "#fff", padding: "14px 28px", borderRadius: 16, border: "none", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 10px 20px rgba(8,145,178,0.2)" }}
        >
           {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  backBtn: { width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)" },
};
