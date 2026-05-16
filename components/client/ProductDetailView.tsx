"use client";
import { 
  ChevronLeft, Share2, Heart, Star, ShoppingCart, 
  Minus, Plus, ShieldCheck, Truck, MessageCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function ProductDetailView({ product, relatedProducts = [] }: { product: any, relatedProducts?: any[] }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fallbackRelated, setFallbackRelated] = useState<any[]>([]);

  useEffect(() => {
    if (relatedProducts.length === 0) {
      fetch('/api/products/list?limit=5')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFallbackRelated(data.filter(p => p.id !== product.id).slice(0, 4));
          }
        })
        .catch(err => console.error("Fallback products fetch error:", err));
    }
  }, [relatedProducts.length, product.id]);

  const displayRelated = relatedProducts.length > 0 ? relatedProducts : fallbackRelated;

  const handleCheckout = () => {
    router.push(`/checkout?type=product&id=${product.id}&qty=${qty}`);
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", paddingBottom: 100 }}>
      {/* Hero Image Area */}
      <div style={{ position: "relative", height: 400, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        
        {/* Top Buttons */}
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", zIndex: 10 }}>
          <button onClick={() => router.back()} style={styles.backBtnText}>
            <ChevronLeft size={20} /> <span>Kembali</span>
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={styles.iconBtn}><Share2 size={20} color="#0F172A"/></button>
            <button style={styles.iconBtn}><Heart size={20} color="#0F172A"/></button>
          </div>
        </div>
      </div>

      <div style={{ padding: 20, background: "#fff", borderRadius: "32px 32px 0 0", marginTop: -32, position: "relative", zIndex: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0891B2", background: "#CFFAFE", padding: "4px 12px", borderRadius: 20 }}>{product.category}</span>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginTop: 12, lineHeight: 1.3 }}>{product.name}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#FEFCE8", padding: "4px 8px", borderRadius: 8 }}>
            <Star size={14} color="#EAB308" fill="#EAB308" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#854D0E" }}>{product.rating || "5.0"}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#0891B2" }}>{fmt(product.price)}</p>
          {product.old_price && <p style={{ fontSize: 14, color: "#94A3B8", textDecoration: "line-through" }}>{fmt(product.old_price)}</p>}
        </div>

        <div style={{ height: 1, background: "#F1F5F9", margin: "24px 0" }} />

        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>Deskripsi Produk</h3>
        <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.8 }}>
          {product.description || "Produk berkualitas persembahan dari Majelis Ilmu. Dibuat dengan bahan premium untuk kenyamanan Anda beribadah dan beraktivitas sehari-hari. Stok terbatas!"}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
           <div style={styles.infoCard}>
              <Truck size={20} color="#0891B2" />
              <div>
                 <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>Pengiriman</p>
                 <p style={{ fontSize: 11, color: "#64748B" }}>Seluruh Indonesia</p>
              </div>
           </div>
           <div style={styles.infoCard}>
              <ShieldCheck size={20} color="#0891B2" />
              <div>
                 <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>Garansi</p>
                 <p style={{ fontSize: 11, color: "#64748B" }}>7 Hari Retur</p>
              </div>
           </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Jumlah Pesanan</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", background: "#F1F5F9", borderRadius: 14, padding: "4px" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}><Minus size={18}/></button>
              <span style={{ width: 40, textAlign: "center", fontWeight: 700, fontSize: 16 }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={styles.qtyBtn}><Plus size={18}/></button>
            </div>
            <p style={{ fontSize: 13, color: "#64748B" }}>Stok: <span style={{ fontWeight: 600, color: "#0F172A" }}>{product.stock || 10}</span></p>
          </div>
        </div>

        {/* Related Products Grid */}
        {displayRelated.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Produk Terkait</h2>
              <Link href="/toko" style={{ fontSize: 13, fontWeight: 600, color: "#0891B2", textDecoration: "none" }}>Lihat Semua</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {displayRelated.map((p) => (
                <Link key={p.id} href={`/toko/${p.slug}`} style={{ textDecoration: "none", background: "#fff", borderRadius: 20, padding: 12, border: "1px solid #F1F5F9" }}>
                  <img src={p.image} style={{ width: "100%", height: 120, borderRadius: 12, objectFit: "contain", marginBottom: 12 }} alt={p.name} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#0891B2", textTransform: "uppercase" }}>{p.category}</p>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: "4px 0", height: 40, overflow: "hidden", lineHeight: 1.4 }}>{p.name}</h3>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0891B2", marginTop: 8 }}>{fmt(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", padding: "16px 20px 24px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 12, zIndex: 100 }}>
        <button style={{ width: 56, height: 56, borderRadius: 16, border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
           <MessageCircle size={24} color="#0891B2" />
        </button>
        <button 
           onClick={handleCheckout}
           style={{ flex: 1, height: 56, borderRadius: 16, border: "none", background: "#0891B2", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 20px rgba(8,145,178,0.2)" }}
        >
           Beli Sekarang
        </button>
      </div>
    </div>
  );
}

const styles: any = {
  iconBtn: { width: 40, height: 40, borderRadius: 12, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" },
  backBtnText: { 
    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, 
    background: "#fff", border: "1.5px solid #F1F5F9", color: "#0F172A", fontSize: 13, fontWeight: 700,
    cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  },
  infoCard: { background: "#F8FAFC", borderRadius: 16, padding: 12, display: "flex", gap: 10, alignItems: "center", border: "1px solid #F1F5F9" },
  qtyBtn: { width: 36, height: 36, borderRadius: 10, background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
};
