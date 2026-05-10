"use client";
import { 
  SunMedium, Search, Bell, LogIn, ChevronRight, User, Calendar, Moon
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function HomeView({ kajian, products }: { kajian: any[], products: any[] }) {
  const [user, setUser] = useState<any>(null); // Simulation
  const [myKajian, setMyKajian] = useState<any[]>([]);
  const upcoming = kajian.slice(0, 3);

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(160deg, #155E75, #06B6D4)", padding: "20px 20px 32px", borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden", boxShadow: "0 10px 30px rgba(6,182,212,0.2)" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <SunMedium size={16} color="rgba(255,255,255,0.8)" />
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500 }}>Assalamu'alaikum</p>
            </div>
            <h1 style={{ color: "#fff", fontSize: 24, marginTop: 4, fontWeight: 700 }}>{user?.name || "Jamaah"}</h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={styles.iconBtn}><Search size={20} color="#fff"/></button>
            <button style={{ ...styles.iconBtn, background: "#fff", color: "#0891B2" }}>
              <LogIn size={20} />
            </button>
          </div>
        </div>
        
        {/* Quick Login Prompt */}
        <div style={{ marginTop: 24, background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 16, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div>
             <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Belum Masuk?</p>
             <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }}>Login untuk daftar kajian & belanja</p>
           </div>
           <button style={{ padding: "8px 16px", background: "#fff", color: "#0891B2", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none" }}>Masuk</button>
        </div>
      </div>

      {/* Upcoming Kajian */}
      <div style={{ padding: "28px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, color: "#0F172A", fontWeight: 600 }}>Kajian Terdekat</h2>
          <Link href="/kajian" style={{ fontSize: 13, color: "#0891B2", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", textDecoration: 'none' }}>
            Lihat Semua <ChevronRight size={16}/>
          </Link>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }}>
          {upcoming.map((k, i) => (
            <Link key={k.id} href={`/kajian/${k.slug}`} style={{ minWidth: 260, background: "#fff", borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #F1F5F9", cursor: "pointer", overflow: "hidden", textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: 130, backgroundImage: `url(${k.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
                <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: k.type === "free" ? "rgba(240,253,244,0.9)" : "rgba(255,247,237,0.9)", color: k.type === "free" ? "#15803D" : "#C2410C", backdropFilter: "blur(4px)" }}>
                  {k.type === "free" ? "Infaq" : fmt(k.price)}
                </span>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>{k.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <User size={14} color="#64748B" />
                  <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{k.ustadz}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={14} color="#0891B2" />
                  <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{k.date} • {k.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div style={{ padding: "24px 20px 0" }}>
        <h2 style={{ fontSize: 18, color: "#0F172A", marginBottom: 16, fontWeight: 600 }}>Produk Pilihan</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {products.slice(0, 4).map((p: any, i: number) => (
            <Link key={p.id} href={`/toko/${p.slug}`} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #F1F5F9", cursor: "pointer", textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: 140, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                 <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", lineHeight: 1.4, height: 34, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#0891B2", marginTop: 8 }}>{fmt(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  iconBtn: { width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" },
};
