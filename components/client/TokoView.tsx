"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GOLD = "#8D6E53";
const DARK = "#ffffff";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export function TokoView({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter();
  const [cat, setCat] = useState("Semua");
  const [categories, setCategories] = useState<string[]>(["Semua"]);

  useEffect(() => {
    fetch('/api/product-categories/list')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const names = json.data.map((c: any) => c.name);
          setCategories(["Semua", ...names]);
        }
      })
      .catch(err => console.error("Failed to load product categories:", err));
  }, []);

  const filtered = cat === "Semua" ? initialProducts : initialProducts.filter(p => p.category === cat);

  return (
    <div style={{ paddingBottom: 20, background: DARK, minHeight: "100vh" }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontSize: 26, color: TEXT_DARK, fontWeight: 800, margin: 0 }}>BADAR Store</h1>
        <p style={{ fontSize: 14, color: TEXT_MUTED, marginTop: 6, margin: 0 }}>Produk eksklusif penunjang dakwah</p>
      </div>

      <div style={{ display: "flex", gap: 10, padding: "20px", overflowX: "auto" }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: "8px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap",
            background: cat === c ? GOLD : CARD_BG,
            color: cat === c ? "#fff" : TEXT_MUTED,
            border: cat === c ? `1px solid ${GOLD}` : `1px solid ${BORDER_COLOR}`,
            transition: "all 0.2s"
          }}>{c}</button>
        ))}
      </div>

      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "40px 20px", textAlign: "center", color: TEXT_MUTED, fontSize: 14 }}>
            Belum ada produk saat ini
          </div>
        )}
        {filtered.map(p => (
          <Link key={p.id} href={`/toko/${p.slug}`} style={{ background: CARD_BG, borderRadius: 20, overflow: "hidden", border: `1px solid ${BORDER_COLOR}`, cursor: "pointer", textDecoration: "none", color: "inherit", boxShadow: "0 4px 15px rgba(141,110,83,0.03)" }}>
            <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
              <Image 
                src={p.image} 
                alt={p.name} 
                width={500}
                height={500}
                sizes="100vw"
                style={{ width: "100%", height: "auto", display: "block" }} 
              />
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ fontSize: 11, color: GOLD, marginBottom: 4, fontWeight: 600, margin: 0 }}>{p.category}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK, lineHeight: 1.4, height: 36, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginTop: 4, margin: 0 }}>{p.name}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: GOLD, marginTop: 8, margin: 0 }}>{fmt(p.price)}</p>
              <button
                onClick={e => { e.preventDefault(); router.push(`/checkout?type=product&id=${p.id}&qty=1`); }}
                style={{ width: "100%", marginTop: 12, padding: "9px 0", borderRadius: 10, background: "rgba(141,110,83,0.08)", border: `1px solid rgba(141,110,83,0.25)`, color: GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
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
