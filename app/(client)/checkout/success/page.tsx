"use client";
import { CheckCircle2, ChevronLeft, Ticket, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Suspense } from "react";

function SuccessView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  return (
    <div style={{ background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <CheckCircle2 size={56} color="#15803D" />
      </div>
      
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0F172A" }}>Berhasil!</h1>
      <p style={{ fontSize: 16, color: "#64748B", marginTop: 12, lineHeight: 1.6 }}>
        {type === "kajian" 
          ? "Pendaftaran kajian Anda telah berhasil kami terima." 
          : "Pesanan Anda telah berhasil dibuat dan sedang diproses."}
      </p>

      <div style={{ background: "#F8FAFC", borderRadius: 24, padding: 24, width: "100%", maxWidth: 340, marginTop: 40, border: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          {type === "kajian" ? <Ticket color="#0891B2" /> : <Package color="#0891B2" />}
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
            {type === "kajian" ? "ID Pendaftaran" : "Kode Pesanan"}
          </p>
        </div>
        <p style={{ fontSize: 24, fontWeight: 700, color: "#0891B2" }}>{code || "ORD-XXXXX"}</p>
        <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 12 }}>Konfirmasi lengkap telah dikirim melalui WhatsApp ke nomor Anda.</p>
      </div>

      <div style={{ marginTop: 48, width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <button 
          onClick={() => router.push("/tiket")} 
          style={{ width: "100%", padding: "18px", borderRadius: 16, background: "#0891B2", color: "#fff", fontSize: 16, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 10px 25px rgba(8,145,178,0.2)" }}
        >
          Lihat Tiket Saya
        </button>
        <Link 
          href="/" 
          style={{ width: "100%", padding: "18px", borderRadius: 16, background: "transparent", color: "#64748B", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", textDecoration: "none" }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Memuat...</div>}>
      <SuccessView />
    </Suspense>
  );
}
