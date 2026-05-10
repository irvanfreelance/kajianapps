"use client";
import { useState } from "react";
import { ShoppingBag, ChevronRight, User, Package, LogOut, Ticket } from "lucide-react";
import Link from "next/link";

const fmt = (n) => "Rp " + (n || 0).toLocaleString("id-ID");
const CATEGORIES_SHOP = ["Semua", "Fashion", "Merchandise", "Parfum", "Ibadah", "Buku"];

export function TokoView({ initialProducts }: { initialProducts: any[] }) {
  const [cat, setCat] = useState("Semua");
  const filtered = cat === "Semua" ? initialProducts : initialProducts.filter((p) => p.category === cat);

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontSize: 26, color: "#0F172A", fontWeight: 700 }}>Toko Majelis</h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Produk eksklusif penunjang dakwah</p>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "20px", overflowX: "auto" }}>
        {CATEGORIES_SHOP.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{ ...styles.chip, background: cat === c ? "#0891B2" : "#fff", color: cat === c ? "#fff" : "#475569", border: cat === c ? "1px solid #0891B2" : "1px solid #CBD5E1" }}>{c}</button>
        ))}
      </div>
      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {filtered.map((p, i) => (
          <Link key={p.id} href={`/toko/${p.slug}`} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #F1F5F9", cursor: "pointer", textDecoration: 'none', color: 'inherit' }}>
            <div style={{ height: 160, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
               <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{p.category}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.4, height: 36, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#0891B2", marginTop: 8 }}>{fmt(p.price)}</p>
              <button style={{ width: "100%", marginTop: 12, padding: "8px 0", borderRadius: 10, background: "#ECFEFF", border: "none", color: "#0891B2", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Beli Sekarang</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TiketView() {
  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: "24px 20px 20px" }}>
        <h1 style={{ fontSize: 26, color: "#0F172A", fontWeight: 700 }}>Tiket Saya</h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Daftar kajian yang Anda ikuti</p>
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
         <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Ticket size={32} color="#94A3B8" />
         </div>
         <p style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>Belum Ada Tiket</p>
         <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginTop: 8, maxWidth: 240 }}>Anda belum terdaftar di kajian manapun. Yuk pilih kajian sekarang!</p>
         <button style={{ marginTop: 24, padding: "12px 24px", borderRadius: 14, background: "#0891B2", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Cari Kajian</button>
      </div>
    </div>
  );
}

export function ProfilView() {
  return (
    <div style={{ paddingBottom: 20 }}>
       <div style={{ background: "linear-gradient(160deg, #155E75, #06B6D4)", padding: "40px 20px 60px", borderRadius: "0 0 40px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#fff", padding: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
             <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#CFFAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={40} color="#0891B2" />
             </div>
          </div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginTop: 16 }}>Jamaah Majelis</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 }}>jamaah@majelis.id</p>
       </div>

       <div style={{ padding: "0 20px", marginTop: -30 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #F1F5F9" }}>
             <div style={{ display: "flex", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center" }}>
                   <p style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>0</p>
                   <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Kajian</p>
                </div>
                <div style={{ width: 1, height: 30, background: "#E2E8F0", marginTop: 10 }}></div>
                <div style={{ textAlign: "center" }}>
                   <p style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>0</p>
                   <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Pesanan</p>
                </div>
             </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
             <MenuBtn icon={Package} label="Riwayat Pesanan" />
             <MenuBtn icon={Ticket} label="Tiket & E-Voucher" />
             <MenuBtn icon={User} label="Edit Profil" />
             <MenuBtn icon={LogOut} label="Keluar" color="#EF4444" />
          </div>
       </div>
    </div>
  );
}

const MenuBtn = ({ icon: Icon, label, color = "#0F172A" }) => (
  <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", cursor: "pointer" }}>
    <Icon size={20} color={color} />
    <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 600, color }}>{label}</span>
    <ChevronRight size={18} color="#CBD5E1" />
  </button>
);

const styles = {
  chip: { padding: "8px 20px", borderRadius: 20, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const },
};
