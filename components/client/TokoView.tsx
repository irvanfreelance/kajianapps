"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GOLD = "#D4AF37";
const DARK = "#0D0D14";
const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const CATS = ["Semua", "Fashion", "Merchandise", "Parfum", "Ibadah", "Buku"];

export function TokoView({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter();
  const [cat, setCat] = useState("Semua");
  const filtered = cat === "Semua" ? initialProducts : initialProducts.filter(p => p.category === cat);

  return (
    <div style={{ paddingBottom: 20, background: DARK, minHeight: "100vh" }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontSize: 26, color: "#fff", fontWeight: 800 }}>Toko BADAR</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Produk eksklusif penunjang dakwah</p>
      </div>

      <div style={{ display: "flex", gap: 10, padding: "20px", overflowX: "auto" }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: "8px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap",
            background: cat === c ? GOLD : "rgba(255,255,255,0.06)",
            color: cat === c ? "#0A0A0F" : "rgba(255,255,255,0.55)",
            border: cat === c ? `1px solid ${GOLD}` : "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.2s"
          }}>{c}</button>
        ))}
      </div>

      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {filtered.map(p => (
          <Link key={p.id} href={`/toko/${p.slug}`} style={{ background: "#18181F", borderRadius: 20, overflow: "hidden", border: `1px solid rgba(212,175,55,0.1)`, cursor: "pointer", textDecoration: "none", color: "inherit" }}>
            <div style={{ height: 160, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Image src={p.image} alt={p.name} width={180} height={160} style={{ objectFit: "cover" }} />
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", marginBottom: 4, fontWeight: 600 }}>{p.category}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.4, height: 36, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: GOLD, marginTop: 8 }}>{fmt(p.price)}</p>
              <button
                onClick={e => { e.preventDefault(); router.push(`/checkout?type=product&id=${p.id}&qty=1`); }}
                style={{ width: "100%", marginTop: 10, padding: "9px 0", borderRadius: 10, background: "rgba(212,175,55,0.12)", border: `1px solid rgba(212,175,55,0.25)`, color: GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                Beli Sekarang
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
