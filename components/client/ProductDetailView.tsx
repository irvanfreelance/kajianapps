"use client";
import { ChevronLeft, Share2, Heart, Star, Minus, Plus, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const GOLD = "#8D6E53";
const DARK = "#ffffff";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const PEACH_BG = "#FAF1E6";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";

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
        .catch(() => { });
    }
    fetch(`/api/products/reviews?id=${product.id}`)
      .then(r => r.json()).then(d => {
        if (d.success && Array.isArray(d.data)) {
          setReviews(d.data);
          if (d.data.length > 0) setAvgRating(Number((d.data.reduce((a: number, c: any) => a + (c.rating || 5), 0) / d.data.length).toFixed(1)));
        }
      }).catch(() => { });
  }, [product.id, relatedProducts.length]);

  const displayRelated = relatedProducts.length > 0 ? relatedProducts : fallbackRelated;

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Beli ${product.name} di BADAR Store`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link produk berhasil disalin ke clipboard!");
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  return (
    <div style={{ background: DARK, minHeight: "100vh", paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{ position: "relative", width: "100%", background: "#f5ece2", display: "block", paddingBottom: 28 }}>
        <Image 
          src={product.image} 
          alt={product.name} 
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto", display: "block" }} 
          priority
        />
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
          <button onClick={handleShare} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.75)", border: `1px solid ${BORDER_COLOR}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Bagikan"><Share2 size={18} color={GOLD} /></button>
        </div>
      </div>

      {/* Content Card */}
      <div style={{ background: CARD_BG, borderRadius: "32px 32px 0 0", marginTop: -28, position: "relative", zIndex: 5, padding: 20, minHeight: "60vh", borderTop: `1px solid ${BORDER_COLOR}`, boxShadow: "0 -8px 30px rgba(141,110,83,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, background: PEACH_BG, padding: "4px 12px", borderRadius: 20 }}>{product.category}</span>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT_DARK, marginTop: 12, lineHeight: 1.3, margin: 0 }}>{product.name}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#FEF3C7", padding: "6px 10px", borderRadius: 10, flexShrink: 0, marginLeft: 12 }}>
            <Star size={14} color="#D97706" fill="#D97706" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#D97706" }}>{reviews.length > 0 ? avgRating : "5.0"}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <p style={{ fontSize: 26, fontWeight: 800, color: GOLD, margin: 0 }}>{fmt(product.price)}</p>
          {product.old_price && <p style={{ fontSize: 14, color: "#9E9083", textDecoration: "line-through", margin: 0 }}>{fmt(product.old_price)}</p>}
        </div>

        <div style={{ height: 1, background: "rgba(141,110,83,0.08)", margin: "20px 0" }} />

        <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT_DARK, marginBottom: 10, margin: 0 }}>Deskripsi Produk</h3>
        <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.8, marginTop: 6, margin: 0 }}>
          {product.description || "Produk berkualitas persembahan BADAR. Dibuat dengan bahan premium untuk kenyamanan ibadah dan aktivitas sehari-hari."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
          {[
            { Icon: Truck, title: "Pengiriman", sub: "Seluruh Indonesia" },
            { Icon: ShieldCheck, title: "Garansi", sub: "7 Hari Retur" },
          ].map(({ Icon, title, sub }) => (
            <div key={title} style={{ background: "rgba(141,110,83,0.03)", borderRadius: 14, padding: 14, display: "flex", gap: 10, alignItems: "center", border: `1px solid ${BORDER_COLOR}` }}>
              <Icon size={20} color={GOLD} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: TEXT_DARK, margin: 0 }}>{title}</p>
                <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4, margin: 0 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT_DARK, marginBottom: 14, margin: 0 }}>Jumlah Pesanan</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(141,110,83,0.03)", borderRadius: 14, padding: 4, border: `1px solid ${BORDER_COLOR}` }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(141,110,83,0.06)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Minus size={18} color={GOLD} /></button>
              <span style={{ width: 40, textAlign: "center", fontWeight: 700, fontSize: 16, color: TEXT_DARK }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(141,110,83,0.06)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Plus size={18} color={GOLD} /></button>
            </div>
            <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>Stok: <span style={{ fontWeight: 600, color: TEXT_DARK }}>{product.stock || 10}</span></p>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: 36, borderTop: "1px solid rgba(141,110,83,0.08)", paddingTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>Testimoni & Ulasan</h2>
            <span style={{ fontSize: 13, color: TEXT_MUTED }}>{reviews.length} Ulasan</span>
          </div>
          {reviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {reviews.map((rev, idx) => (
                <div key={idx} style={{ background: "rgba(141,110,83,0.03)", borderRadius: 18, padding: 16, border: `1px solid ${BORDER_COLOR}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>{rev.user_name || "Pelanggan"}</p>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} color="#D97706" fill={s <= (rev.rating || 5) ? "#D97706" : "none"} />)}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, marginTop: 4, margin: 0 }}>{rev.testimonial || "Tidak ada komentar."}</p>
                  <p style={{ fontSize: 11, color: "#9E9083", marginTop: 8, margin: 0 }}>{new Date(rev.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px 20px", background: "rgba(141,110,83,0.03)", borderRadius: 18, border: `1px solid ${BORDER_COLOR}` }}>
              <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>Belum ada ulasan untuk produk ini.</p>
            </div>
          )}
        </div>

        {/* Related */}
        {displayRelated.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>Produk Terkait</h2>
              <Link href="/toko" style={{ fontSize: 13, fontWeight: 600, color: GOLD, textDecoration: "none" }}>Lihat Semua</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {displayRelated.map(p => (
                <Link key={p.id} href={`/toko/${p.slug}`} style={{ textDecoration: "none", background: "rgba(141,110,83,0.03)", borderRadius: 18, padding: 12, border: `1px solid ${BORDER_COLOR}` }}>
                  <div style={{ width: "100%", height: 120, position: "relative", marginBottom: 10 }}>
                    <Image src={p.image} fill style={{ objectFit: "contain", borderRadius: 10 }} alt={p.name} />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", margin: 0 }}>{p.category}</p>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, margin: "4px 0", lineHeight: 1.4, height: 38, overflow: "hidden" }}>{p.name}</h3>
                  <p style={{ fontSize: 14, fontWeight: 700, color: GOLD, margin: 0 }}>{fmt(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: CARD_BG, padding: "14px 20px 28px", borderTop: `1px solid ${BORDER_COLOR}`, display: "flex", gap: 12, zIndex: 100, boxShadow: "0 -4px 30px rgba(141,110,83,0.04)" }}>
        <button style={{ width: 56, height: 56, borderRadius: 16, border: `1px solid rgba(141,110,83,0.2)`, background: "rgba(141,110,83,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <MessageCircle size={24} color={GOLD} />
        </button>
        <button onClick={() => router.push(`/checkout?type=product&id=${product.id}&qty=${qty}`)} style={{ flex: 1, height: 56, borderRadius: 16, border: "none", background: GOLD, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 20px rgba(141,110,83,0.18)` }}>
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
