"use client";
import { 
  SunMedium, Search, LogIn, ChevronRight, User, Calendar, LogOut
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
};

export default function HomeView({ kajian, products }: { kajian: any[], products: any[] }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = status === 'authenticated' && session?.user?.role === 'USER';
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
            <h1 style={{ color: "#fff", fontSize: 24, marginTop: 4, fontWeight: 700 }}>
              {isLoggedIn ? (session?.user?.name?.split(' ')[0] || 'Jamaah') : 'Jamaah'}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={styles.iconBtn}><Search size={20} color="#fff"/></button>
            {isLoggedIn ? (
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ ...styles.iconBtn, background: "#fff" }}
              >
                <LogOut size={20} color="#0891B2" />
              </button>
            ) : (
              <button 
                onClick={() => router.push('/login')}
                style={{ ...styles.iconBtn, background: "#fff" }}
              >
                <LogIn size={20} color="#0891B2" />
              </button>
            )}
          </div>
        </div>
        
        {/* Login Prompt or User Info */}
        {!isLoggedIn ? (
          <div style={{ marginTop: 24, background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 16, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Belum Masuk?</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }}>Login untuk daftar kajian & belanja</p>
            </div>
            <button 
              onClick={() => router.push('/login')}
              style={{ padding: "8px 16px", background: "#fff", color: "#0891B2", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              Masuk
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 24, background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 16, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{session?.user?.name}</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }}>{session?.user?.email}</p>
            </div>
            <Link href="/profil" style={{ padding: "8px 16px", background: "#fff", color: "#0891B2", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", textDecoration: "none", cursor: "pointer" }}>
              Profil
            </Link>
          </div>
        )}
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
          {upcoming.map((k) => (
            <Link key={k.id} href={`/kajian/${k.slug}`} style={{ minWidth: 260, background: "#fff", borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #F1F5F9", cursor: "pointer", overflow: "hidden", textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: 140, position: "relative", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {/* Blurred Background for aesthetic when image is contain */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${k.image})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(20px)", opacity: 0.3 }} />
                <img src={k.image} style={{ width: "100%", height: "100%", objectFit: "contain", position: "relative", zIndex: 1 }} alt={k.title} />
                <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 20, background: k.type === "free" ? "rgba(220,252,231,0.95)" : "rgba(255,247,237,0.95)", color: k.type === "free" ? "#166534" : "#C2410C", backdropFilter: "blur(8px)", zIndex: 2, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                  {k.type === "free" ? "Infaq" : fmt(k.price)}
                </span>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8, lineHeight: 1.3 }}>{k.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={12} color="#64748B" />
                  </div>
                  <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{k.ustadz}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", padding: "8px 12px", borderRadius: 12 }}>
                  <Calendar size={14} color="#0891B2" />
                  <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{formatDate(k.date)} • {k.time_display || k.time}</span>
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
          {products.slice(0, 4).map((p: any) => (
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
  iconBtn: { width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" } as React.CSSProperties,
};
