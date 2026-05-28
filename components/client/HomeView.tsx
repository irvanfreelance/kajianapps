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

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F5E08A";
const DARK = "#0A0A0F";
const DARK2 = "#141420";

export default function HomeView({ kajian, products }: { kajian: any[], products: any[] }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = status === 'authenticated' && session?.user?.role === 'USER';

  // Only show free/infak kajian in "Kajian Terdekat"
  const upcoming = kajian.filter(k => k.type === 'free').slice(0, 3);

  return (
    <div style={{ paddingBottom: 20, background: "#0D0D14", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${DARK2}, #1C1A0F)`,
        padding: "20px 20px 36px",
        borderRadius: "0 0 36px 36px",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 10px 40px rgba(212,175,55,0.12)`
      }}>
        {/* Decorative gold circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, rgba(212,175,55,0.15), transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, rgba(212,175,55,0.08), transparent 70%)` }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          {/* Logo + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 64, height: 64, display: "flex", alignItems: "center",
              justifyContent: "center", position: "relative",
              filter: "drop-shadow(0 4px 12px rgba(212,175,55,0.3))"
            }}>
              <Image src="/badar.png" alt="Logo" width={64} height={64} style={{ objectFit: "contain" }} />
            </div>
            <div>
              <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: 0.5 }}>
                {isLoggedIn ? (session?.user?.name?.split(' ')[0] || 'Jamaah') : 'Jamaah'}
              </h1>
              <p style={{ color: `rgba(212,175,55,0.8)`, fontSize: 12, margin: "2px 0 0", fontWeight: 500 }}>
                Selamat Datang
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={headerStyles.iconBtn}><Search size={20} color={GOLD} /></button>
            {isLoggedIn ? (
              <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ ...headerStyles.iconBtn, background: GOLD }}>
                <LogOut size={20} color={DARK} />
              </button>
            ) : (
              <button onClick={() => router.push('/login')} style={{ ...headerStyles.iconBtn, background: GOLD }}>
                <LogIn size={20} color={DARK} />
              </button>
            )}
          </div>
        </div>

        {/* Login/Profile card */}
        {!isLoggedIn ? (
          <div style={{ marginTop: 24, background: "rgba(212,175,55,0.08)", borderRadius: 18, padding: 16, backdropFilter: "blur(8px)", border: `1px solid rgba(212,175,55,0.2)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Belum Masuk?</p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>Login untuk daftar kajian & belanja</p>
            </div>
            <button onClick={() => router.push('/login')} style={{ padding: "8px 18px", background: GOLD, color: DARK, borderRadius: 12, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
              Masuk
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 24, background: "rgba(212,175,55,0.08)", borderRadius: 18, padding: 16, backdropFilter: "blur(8px)", border: `1px solid rgba(212,175,55,0.2)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{session?.user?.name}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{session?.user?.email}</p>
            </div>
            <Link href="/profil" style={{ padding: "8px 18px", background: GOLD, color: DARK, borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Profil
            </Link>
          </div>
        )}
      </div>

      {/* Upcoming Kajian — only FREE */}
      <div style={{ padding: "28px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, color: "#fff", fontWeight: 700 }}>Kajian Terdekat</h2>
          <Link href="/kajian" style={{ fontSize: 13, color: GOLD, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", textDecoration: 'none' }}>
            Lihat Semua <ChevronRight size={16} />
          </Link>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }}>
          {upcoming.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, padding: "20px 0" }}>Belum ada kajian gratis terdekat</p>
          )}
          {upcoming.map((k) => (
            <Link key={k.id} href={`/kajian/${k.slug}`} style={{ minWidth: 260, background: "#18181F", borderRadius: 20, boxShadow: `0 4px 20px rgba(0,0,0,0.3)`, border: `1px solid rgba(212,175,55,0.15)`, cursor: "pointer", overflow: "hidden", textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: 140, position: "relative", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <Image src={k.image} fill style={{ objectFit: "cover", filter: "blur(20px)", opacity: 0.25 }} alt="" />
                <Image src={k.image} width={260} height={140} style={{ objectFit: "contain", position: "relative", zIndex: 1 }} alt={k.title} />
                <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, background: GOLD, color: DARK, backdropFilter: "blur(8px)", zIndex: 2, boxShadow: `0 4px 10px rgba(212,175,55,0.3)` }}>
                  Infaq
                </span>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>{k.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(212,175,55,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={11} color={GOLD} />
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{k.ustadz}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(212,175,55,0.08)", padding: "7px 10px", borderRadius: 10, border: `1px solid rgba(212,175,55,0.1)` }}>
                  <Calendar size={13} color={GOLD} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{formatDate(k.date)} • {k.time_display || k.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div style={{ padding: "28px 20px 0" }}>
        <h2 style={{ fontSize: 18, color: "#fff", marginBottom: 16, fontWeight: 700 }}>Produk Pilihan</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {products.slice(0, 4).map((p: any) => (
            <Link key={p.id} href={`/toko/${p.slug}`} style={{ background: "#18181F", borderRadius: 18, overflow: "hidden", boxShadow: `0 4px 15px rgba(0,0,0,0.2)`, border: `1px solid rgba(212,175,55,0.1)`, cursor: "pointer", textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: 130, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                <Image src={p.image} alt={p.name} width={180} height={130} style={{ objectFit: "cover" }} />
              </div>
              <div style={{ padding: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.4, height: 34, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: GOLD, marginTop: 6 }}>{fmt(p.price)}</p>
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
    background: "rgba(212,175,55,0.12)", border: `1px solid rgba(212,175,55,0.2)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", backdropFilter: "blur(4px)"
  } as React.CSSProperties,
};
