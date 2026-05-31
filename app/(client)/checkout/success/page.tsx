"use client";
import { CheckCircle2, Ticket, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const GOLD = "#8D6E53";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";

function SuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", color: TEXT_DARK }}>
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(141,110,83,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: `2px solid ${GOLD}`, boxShadow: `0 8px 30px rgba(141,110,83,0.1)` }}>
        <CheckCircle2 size={56} color={GOLD} />
      </div>
      
      <h1 style={{ fontSize: 28, fontWeight: 800, color: TEXT_DARK }}>Berhasil!</h1>
      <p style={{ fontSize: 16, color: TEXT_MUTED, marginTop: 12, lineHeight: 1.6, maxWidth: 360 }}>
        {type === "kajian" 
          ? "Pendaftaran kajian Anda telah berhasil kami terima." 
          : "Pesanan Anda telah berhasil dibuat dan sedang diproses."}
      </p>

      <div style={{ background: CARD_BG, borderRadius: 24, padding: 24, width: "100%", maxWidth: 340, marginTop: 40, border: `1px solid ${BORDER_COLOR}`, boxShadow: "0 4px 20px rgba(141,110,83,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, justifyContent: "center" }}>
          {type === "kajian" ? <Ticket color={GOLD} /> : <Package color={GOLD} />}
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_MUTED }}>
            {type === "kajian" ? "ID Pendaftaran" : "Kode Pesanan"}
          </p>
        </div>
        <p style={{ fontSize: 24, fontWeight: 800, color: GOLD, letterSpacing: 1 }}>{code || "ORD-XXXXX"}</p>
        <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 12 }}>Konfirmasi lengkap telah dikirim melalui WhatsApp ke nomor Anda.</p>
      </div>

      <div style={{ marginTop: 48, width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <button 
          onClick={() => router.push("/tiket")} 
          style={{ width: "100%", padding: "18px", borderRadius: 16, background: GOLD, color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 10px 25px rgba(141,110,83,0.15)` }}
        >
          Lihat Tiket Saya
        </button>
        <Link 
          href="/" 
          style={{ width: "100%", padding: "18px", borderRadius: 16, background: "transparent", color: GOLD, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", textDecoration: "none" }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#ffffff", color: TEXT_DARK }}>Memuat...</div>}>
      <SuccessView />
    </Suspense>
  );
}
