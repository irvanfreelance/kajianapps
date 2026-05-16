"use client";
import { useState, useEffect, use } from "react";
import { 
  ChevronLeft, Info, Heart, ArrowRight, CheckCircle2 
} from "lucide-react";
import { useRouter } from "next/navigation";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function KajianInfaqPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [kajian, setKajian] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [infaqAmount, setInfaqAmount] = useState<number | "">(50000);
  const NOMINALS = [10000, 25000, 50000, 100000, 250000, 500000];

  useEffect(() => {
    const fetchKajian = async () => {
      try {
        const res = await fetch(`/api/kajian/get?slug=${slug}`);
        const data = await res.json();
        if (data.success) {
          setKajian(data.data);
        } else {
          router.push("/kajian");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKajian();
  }, [slug, router]);

  const handleNext = () => {
    if (!infaqAmount || Number(infaqAmount) <= 0) {
      alert("Silakan masukkan nominal infaq");
      return;
    }
    router.push(`/checkout?type=kajian&id=${kajian.id}&amount=${infaqAmount}`);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTop: "3px solid #0891B2", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, color: "#64748B" }}>Memuat halaman...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ChevronLeft size={24} color="#0F172A" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0 }}>Infaq Dakwah</h1>
        </div>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ padding: "24px 24px 140px" }}>
        {/* Item Summary */}
        <div style={{ background: "#ECFEFF", borderRadius: 24, padding: 20, border: "1px solid #CFFAFE", marginBottom: 32, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Heart size={24} color="#0891B2" fill="#0891B2" />
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#0891B2", fontWeight: 600 }}>Pendaftaran Kajian</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{kajian.title}</h2>
          </div>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Pilih Nominal Infaq</h3>
        <p style={{ fontSize: 14, color: "#64748B", marginBottom: 24, lineHeight: 1.5 }}>
          Dukungan Anda sangat berarti bagi kelangsungan dakwah dan operasional majelis kami.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {NOMINALS.map(n => (
            <button 
              key={n} 
              onClick={() => setInfaqAmount(n)}
              style={{ 
                padding: "16px", borderRadius: 16, border: infaqAmount === n ? "2px solid #0891B2" : "1.5px solid #E2E8F0",
                background: infaqAmount === n ? "#ECFEFF" : "#fff",
                color: infaqAmount === n ? "#0891B2" : "#475569",
                fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s",
                boxShadow: infaqAmount === n ? "0 4px 12px rgba(8,145,178,0.1)" : "none"
              }}
            >
              {fmt(n)}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", marginBottom: 32 }}>
          <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 16, fontWeight: 700, color: "#64748B" }}>Rp</span>
          <input 
            type="number" 
            placeholder="Nominal lainnya..."
            value={infaqAmount || ""}
            onChange={(e) => setInfaqAmount(parseInt(e.target.value) || "")}
            style={{ 
              width: "100%", padding: "18px 18px 18px 48px", borderRadius: 18, 
              border: "1.5px solid #E2E8F0", fontSize: 16, fontWeight: 700, outline: "none", 
              color: "#0F172A", background: "#F8FAFC" 
            }}
          />
        </div>

        <div style={{ background: "#FFFBEB", borderRadius: 20, padding: 16, display: "flex", gap: 12 }}>
          <Info size={20} color="#B45309" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "#B45309", lineHeight: 1.6 }}>
            Infaq akan digunakan sepenuhnya untuk kegiatan dakwah dan pengembangan aplikasi kajian ini. Jazaakumullahu khayran.
          </p>
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", padding: "16px 24px 28px", borderTop: "1px solid #F1F5F9", zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: "#64748B" }}>Total Infaq</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#0891B2" }}>{fmt(Number(infaqAmount) || 0)}</span>
        </div>
        <button
          onClick={handleNext}
          disabled={!infaqAmount || Number(infaqAmount) <= 0}
          style={{ 
            width: "100%", height: 56, borderRadius: 18, border: "none", 
            background: !infaqAmount ? "#CBD5E1" : "#0891B2", color: "#fff", 
            fontSize: 16, fontWeight: 700, cursor: !infaqAmount ? "not-allowed" : "pointer", 
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 10px 20px rgba(8,145,178,0.2)"
          }}
        >
          Lanjut ke Pembayaran <CheckCircle2 size={20} />
        </button>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
