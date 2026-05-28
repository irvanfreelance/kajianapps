"use client";
import { ChevronLeft, Share2, Heart, Star, Minus, Plus, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const GOLD = "#D4AF37";
const DARK = "#0D0D14";
const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function ProductDetailView({ product, relatedProducts = [] }: { product: any, relatedProducts?: any[] }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [fallbackRelated, setFallbackRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(5.0);

  useEffect(() => {
    if (relatedProducts.length === 0) {
      fetch("/api/products/list?limit=5")
        .then(r => r.json()).then(d => { if (Array.isArray(d)) setFallbackRelated(d.filter(p => p.id !== product.id).slice(0, 4)); })
        .catch(() => {});
    }
    fetch(`/api/products/reviews?id=${product.id}`)
      .then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.data)) {
          setReviews(d.data);
          if (d.data.length > 0) setAvgRating(Number((d.data.reduce((a: number, c: any) => a + (c.rating||5), 0) / d.data.length).toFixed(1)));
        }
      }).catch(() => {});
  }, [product.id, relatedProducts.length]);

  const displayRelated = relatedProducts.length > 0 ? relatedProducts : fallbackRelated;

  return (
    <div style={{ background: DARK, minHeight: "100vh", paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 380, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
          <Image src={product.image} alt="" fill style={{ objectFit: "cover", filter: "blur(30px)" }} />
        </div>
        <Image src={product.image} alt={product.name} width={430} height={380} style={{ objectFit: "contain", position: "relative", zIndex: 1 }} />
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", zIndex: 10 }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, background: "rgba(0,0,0,0.5)", border: `1px solid rgba(212,175,55,0.2)`, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}>
            <ChevronLeft size={20} /> Kembali
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.5)", border: `1px solid rgba(212,175,55,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Share2 size={18} color={GOLD} /></button>
            <button style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.5)", border: `1px solid rgba(212,175,55,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Heart size={18} color={GOLD} /></button>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div style={{ background: "#18181F", borderRadius: "32px 32px 0 0", marginTop: -28, position: "relative", zIndex: 5, padding: 20, minHeight: "60vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, background: "rgba(212,175,55,0.12)", padding: "4px 12px", borderRadius: 20 }}>{product.category}</span>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 12, lineHeight: 1.3 }}>{product.name}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(234,179,8,0.1)", padding: "6px 10px", borderRadius: 10, flexShrink: 0, marginLeft: 12 }}>
            <Star size={14} color="#EAB308" fill="#EAB308" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#EAB308" }}>{reviews.length > 0 ? avgRating : "5.0"}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <p style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>{fmt(product.price)}</p>
          {product.old_price && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>{fmt(product.old_price)}</p>}
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />

        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Deskripsi Produk</h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
          {product.description || "Produk berkualitas persembahan BADAR. Dibuat dengan bahan premium untuk kenyamanan ibadah dan aktivitas sehari-hari."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
          {[
            { Icon: Truck, title: "Pengiriman", sub: "Seluruh Indonesia" },
            { Icon: ShieldCheck, title: "Garansi", sub: "7 Hari Retur" },
          ].map(({ Icon, title, sub }) => (
            <div key={title} style={{ background: "rgba(212,175,55,0.06)", borderRadius: 14, padding: 14, display: "flex", gap: 10, alignItems: "center", border: `1px solid rgba(212,175,55,0.1)` }}>
              <Icon size={20} color={GOLD} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{title}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Jumlah Pesanan</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 4, border: `1px solid rgba(212,175,55,0.1)` }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(212,175,55,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Minus size={18} color={GOLD} /></button>
              <span style={{ width: 40, textAlign: "center", fontWeight: 700, fontSize: 16, color: "#fff" }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(212,175,55,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Plus size={18} color={GOLD} /></button>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Stok: <span style={{ fontWeight: 600, color: "#fff" }}>{product.stock || 10}</span></p>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: 36, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Testimoni & Ulasan</h2>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{reviews.length} Ulasan</span>
          </div>
          {reviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {reviews.map((rev, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{rev.user_name || "Pelanggan"}</p>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} color="#EAB308" fill={s <= (rev.rating||5) ? "#EAB308" : "none"} />)}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{rev.testimonial || "Tidak ada komentar."}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>{new Date(rev.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Belum ada ulasan untuk produk ini.</p>
            </div>
          )}
        </div>

        {/* Related */}
        {displayRelated.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Produk Terkait</h2>
              <Link href="/toko" style={{ fontSize: 13, fontWeight: 600, color: GOLD, textDecoration: "none" }}>Lihat Semua</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {displayRelated.map(p => (
                <Link key={p.id} href={`/toko/${p.slug}`} style={{ textDecoration: "none", background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 12, border: `1px solid rgba(212,175,55,0.08)` }}>
                  <div style={{ width: "100%", height: 120, position: "relative", marginBottom: 10 }}>
                    <Image src={p.image} fill style={{ objectFit: "contain", borderRadius: 10 }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>{p.category}</p>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: "4px 0", lineHeight: 1.4, height: 38, overflow: "hidden" }}>{p.name}</h3>
                  <p style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{fmt(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#141420", padding: "14px 20px 28px", borderTop: `1px solid rgba(212,175,55,0.15)`, display: "flex", gap: 12, zIndex: 100 }}>
        <button style={{ width: 56, height: 56, borderRadius: 16, border: `1px solid rgba(212,175,55,0.2)`, background: "rgba(212,175,55,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <MessageCircle size={24} color={GOLD} />
        </button>
        <button onClick={() => router.push(`/checkout?type=product&id=${product.id}&qty=${qty}`)} style={{ flex: 1, height: 56, borderRadius: 16, border: "none", background: GOLD, color: "#0A0A0F", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: `0 10px 25px rgba(212,175,55,0.25)` }}>
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
