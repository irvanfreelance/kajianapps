"use client";
import { CheckCircle2, Ticket, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const GOLD = "#D4AF37";
const DARK = "#0D0D14";

function SuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  return (
    <div style={{ background: DARK, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", color: "#fff" }}>
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, border: `2px solid ${GOLD}`, boxShadow: `0 0 30px rgba(212,175,55,0.2)` }}>
        <CheckCircle2 size={56} color={GOLD} />
      </div>
      
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>Berhasil!</h1>
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 12, lineHeight: 1.6, maxWidth: 360 }}>
        {type === "kajian" 
          ? "Pendaftaran kajian Anda telah berhasil kami terima." 
          : "Pesanan Anda telah berhasil dibuat dan sedang diproses."}
      </p>

      <div style={{ background: "#18181F", borderRadius: 24, padding: 24, width: "100%", maxWidth: 340, marginTop: 40, border: `1px solid rgba(212,175,55,0.15)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, justifyContent: "center" }}>
          {type === "kajian" ? <Ticket color={GOLD} /> : <Package color={GOLD} />}
          <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
            {type === "kajian" ? "ID Pendaftaran" : "Kode Pesanan"}
          </p>
        </div>
        <p style={{ fontSize: 24, fontWeight: 800, color: GOLD, letterSpacing: 1 }}>{code || "ORD-XXXXX"}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>Konfirmasi lengkap telah dikirim melalui WhatsApp ke nomor Anda.</p>
      </div>

      <div style={{ marginTop: 48, width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <button 
          onClick={() => router.push("/tiket")} 
          style={{ width: "100%", padding: "18px", borderRadius: 16, background: GOLD, color: "#0A0A0F", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 10px 25px rgba(212,175,55,0.25)` }}
        >
          Lihat Tiket Saya
        </button>
        <Link 
          href="/" 
          style={{ width: "100%", padding: "18px", borderRadius: 16, background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", textDecoration: "none" }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DARK, color: "#fff" }}>Memuat...</div>}>
      <SuccessView />
    </Suspense>
  );
}
