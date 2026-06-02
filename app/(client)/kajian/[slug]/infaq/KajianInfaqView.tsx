"use client";
import { useState } from "react";
import { ChevronLeft, CheckCircle2, Heart, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const GOLD = "#8D6E53";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const PEACH_BG = "#FAF1E6";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

const NOMINALS = [10000, 25000, 50000, 100000, 250000, 0];

export default function KajianInfaqView({ kajian }: { kajian: any }) {
  const router = useRouter();
  const [infaqAmount, setInfaqAmount] = useState<number>(25000);
  const [customInput, setCustomInput] = useState<string>("");
  const [isCustomActive, setIsCustomActive] = useState(false);

  const displayAmount = isCustomActive ? (parseInt(customInput) || 0) : infaqAmount;

  const handleSelectNominal = (n: number) => {
    setInfaqAmount(n);
    setIsCustomActive(false);
    setCustomInput("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInput(e.target.value);
    setIsCustomActive(true);
  };

  const handleNext = () => {
    const amount = displayAmount;
    router.push(`/checkout?type=kajian&id=${kajian.id}&amount=${amount}`);
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", position: "relative", color: TEXT_DARK }}>
      {/* Header */}
      <div style={{
        padding: "20px 20px 16px",
        display: "flex", alignItems: "center", gap: 14,
        borderBottom: `1px solid ${BORDER_COLOR}`,
        position: "sticky", top: 0, background: "#ffffff", zIndex: 10
      }}>
        <button onClick={() => router.back()} style={{ background: "rgba(141,110,83,0.06)", border: `1px solid rgba(141,110,83,0.15)`, borderRadius: 10, cursor: "pointer", padding: 8, display: "flex" }}>
          <ChevronLeft size={22} color={GOLD} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/64.png" alt="Badar Logo" width={80} height={32} style={{ objectFit: "contain" }} />
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: TEXT_DARK, margin: 0 }}>Infak Terbaik</h1>
            <p style={{ fontSize: 11, color: TEXT_MUTED, margin: "2px 0 0" }}>Pilih nominal kebaikanmu</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px 160px" }}>
        {/* Kajian Info Card */}
        <div style={{
          background: `linear-gradient(135deg, rgba(141,110,83,0.06), rgba(141,110,83,0.02))`,
          borderRadius: 24, padding: 20,
          border: `1px solid ${BORDER_COLOR}`,
          marginBottom: 32, display: "flex", gap: 16, alignItems: "center"
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(141,110,83,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Heart size={24} color={GOLD} fill={GOLD} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: GOLD, fontWeight: 600, margin: 0 }}>Pendaftaran Kajian</p>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_DARK, marginTop: 2, lineHeight: 1.3, margin: 0 }}>{kajian.title}</h2>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Sparkles size={18} color={GOLD} />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>Pilih Nominal Infak</h3>
          </div>
          <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>
            Infaq seluas rasa syukurmu
          </p>
        </div>

        {/* Nominal Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {NOMINALS.map(n => {
            const isSelected = !isCustomActive && infaqAmount === n;
            return (
              <button
                key={n}
                onClick={() => handleSelectNominal(n)}
                style={{
                  padding: "16px 12px", borderRadius: 16,
                  border: isSelected ? `2px solid ${GOLD}` : `1.5px solid ${BORDER_COLOR}`,
                  background: isSelected ? "rgba(141,110,83,0.08)" : CARD_BG,
                  color: isSelected ? GOLD : TEXT_MUTED,
                  fontWeight: 700, fontSize: n === 0 ? 13 : 15, cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isSelected ? `0 4px 16px rgba(141,110,83,0.05)` : "none"
                }}
              >
                {n === 0 ? "Daftar dengan doa (Rp 0)" : fmt(n)}
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div style={{ position: "relative", marginBottom: 28 }}>
          <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 15, fontWeight: 700, color: isCustomActive ? GOLD : "rgba(141,110,83,0.3)" }}>Rp</span>
          <input
            type="number"
            placeholder="Nominal lainnya..."
            value={customInput}
            onChange={handleCustomChange}
            onFocus={() => setIsCustomActive(true)}
            style={{
              width: "100%", padding: "17px 18px 17px 50px", borderRadius: 16,
              border: isCustomActive ? `2px solid ${GOLD}` : `1.5px solid ${BORDER_COLOR}`,
              fontSize: 15, fontWeight: 700, outline: "none",
              color: TEXT_DARK, background: CARD_BG,
              transition: "all 0.2s"
            }}
          />
        </div>

        {/* Info note */}
        <div style={{ background: PEACH_BG, borderRadius: 16, padding: 14, display: "flex", gap: 10, border: `1px solid rgba(141,110,83,0.15)` }}>
          <Heart size={18} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: TEXT_DARK, lineHeight: 1.65, margin: 0 }}>
            Infak akan digunakan sepenuhnya untuk kegiatan dakwah dan operasional majelis. Jazaakumullahu khayran.
          </p>
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: CARD_BG,
        padding: "16px 20px 28px",
        borderTop: `1px solid ${BORDER_COLOR}`, zIndex: 100,
        boxShadow: "0 -4px 30px rgba(141,110,83,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: TEXT_MUTED }}>Total Infak</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: GOLD }}>{fmt(displayAmount)}</span>
        </div>
        <button
          onClick={handleNext}
          style={{
            width: "100%", height: 54, borderRadius: 16, border: "none",
            background: GOLD, color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: `0 10px 30px rgba(141,110,83,0.18)`
          }}
        >
          {displayAmount === 0 ? "Daftar dengan doa" : "Lanjut ke Pembayaran"}
          <CheckCircle2 size={20} />
        </button>
      </div>
    </div>
  );
}
