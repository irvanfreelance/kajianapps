"use client";
import {
  Search, LogIn, ChevronRight, User, Calendar, LogOut
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(d).replace("Minggu", "Ahad");
  } catch { return dateStr; }
};

const GOLD = "#8D6E53"; // Camel brown/gold
const GOLD_LIGHT = "#A4896D";
const DARK = "#2C1E15"; // Deep chocolate brown
const DARK2 = "#ffffff"; // Main body background
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const PEACH_BG = "#FAF1E6";
const MUTED_BROWN = "#7A6A5C";

export default function HomeView({ kajian, products }: { kajian: any[], products: any[] }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = status === 'authenticated' && session?.user?.role === 'USER';

  // Only show free/infak kajian in "Kajian Terdekat"
  const upcoming = kajian.filter(k => k.type === 'free').slice(0, 3);

  return (
    <div style={{ paddingBottom: 20, background: DARK2, minHeight: "100vh" }}>
      {/* Login/Profile card */}
      <div style={{ padding: "16px 20px 10px" }}>
        {!isLoggedIn ? (
          <div style={{ background: CARD_BG, borderRadius: 20, padding: "18px 20px", border: `1px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(141,110,83,0.03)" }}>
            <div>
              <p style={{ color: DARK, fontSize: 15, fontWeight: 700, margin: 0 }}>Belum Masuk?</p>
              <p style={{ color: MUTED_BROWN, fontSize: 12, marginTop: 4, margin: 0 }}>Login untuk daftar kajian dan belanja</p>
            </div>
            <button onClick={() => router.push('/login')} style={{ padding: "8px 18px", background: GOLD, color: "#fff", borderRadius: 12, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 10px rgba(141,110,83,0.15)" }}>
              Masuk
            </button>
          </div>
        ) : (
          <div style={{ background: CARD_BG, borderRadius: 20, padding: "18px 20px", border: `1px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(141,110,83,0.03)" }}>
            <div>
              <p style={{ color: DARK, fontSize: 15, fontWeight: 700, margin: 0 }}>{session?.user?.name}</p>
              <p style={{ color: MUTED_BROWN, fontSize: 12, marginTop: 4, margin: 0 }}>{session?.user?.email}</p>
            </div>
            <Link href="/profil" style={{ padding: "8px 18px", background: GOLD, color: "#fff", borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-block", boxShadow: "0 4px 10px rgba(141,110,83,0.15)" }}>
              Profil
            </Link>
          </div>
        )}
      </div>

      {/* Upcoming Kajian — only FREE */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, color: DARK, fontWeight: 700, margin: 0 }}>Kajian Terdekat</h2>
          <Link href="/kajian" style={{ fontSize: 13, color: GOLD, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", textDecoration: 'none' }}>
            Lihat Semua <ChevronRight size={16} />
          </Link>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }}>
          {upcoming.length === 0 && (
            <p style={{ color: MUTED_BROWN, fontSize: 13, padding: "20px 0" }}>Belum ada kajian gratis terdekat</p>
          )}
          {upcoming.map((k) => (
            <Link key={k.id} href={`/kajian/${k.slug}`} style={{ minWidth: 260, background: CARD_BG, borderRadius: 20, boxShadow: `0 4px 20px rgba(141,110,83,0.04)`, border: `1px solid ${BORDER_COLOR}`, cursor: "pointer", overflow: "hidden", textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: 140, position: "relative", background: "#f5ece2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <Image src={k.image} fill style={{ objectFit: "cover", filter: "blur(20px)", opacity: 0.15 }} alt="" />
                <Image src={k.image} fill style={{ objectFit: "contain", zIndex: 1 }} alt={k.title} />
                <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: GOLD, color: "#fff", zIndex: 2, boxShadow: `0 4px 10px rgba(141,110,83,0.2)` }}>
                  Infaq
                </span>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 8, lineHeight: 1.3, margin: 0 }}>{k.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: PEACH_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={11} color={GOLD} />
                  </div>
                  <p style={{ fontSize: 12, color: MUTED_BROWN, fontWeight: 500, margin: 0 }}>{k.ustadz}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: PEACH_BG, padding: "7px 10px", borderRadius: 10 }}>
                  <Calendar size={13} color={GOLD} />
                  <span style={{ fontSize: 11, color: DARK, fontWeight: 500 }}>{formatDate(k.date)} • {k.time_display || k.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div style={{ padding: "24px 20px 0" }}>
        <h2 style={{ fontSize: 18, color: DARK, marginBottom: 16, fontWeight: 700, margin: 0 }}>Produk Pilihan</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
          {products.slice(0, 4).map((p: any) => (
            <Link key={p.id} href={`/toko/${p.slug}`} style={{ background: CARD_BG, borderRadius: 18, overflow: "hidden", boxShadow: `0 4px 15px rgba(141,110,83,0.03)`, border: `1px solid ${BORDER_COLOR}`, cursor: "pointer", textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: 130, background: "#f5ece2", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                <Image src={p.image} alt={p.name} fill style={{ objectFit: "contain" }} />
              </div>
              <div style={{ padding: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: DARK, lineHeight: 1.4, height: 34, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>{p.name}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: GOLD, marginTop: 6, margin: 0 }}>{fmt(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const headerStyles = {
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    background: "#EADEC9", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer"
  } as React.CSSProperties,
};
