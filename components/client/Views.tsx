"use client";
import { useState, useEffect } from "react";
import { 
  ShoppingBag, ChevronRight, User, Package, 
  LogOut, Ticket, LucideIcon, Calendar, 
  MapPin, Clock, CheckCircle, AlertCircle, Clock3
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const CATEGORIES_SHOP = ["Semua", "Fashion", "Merchandise", "Parfum", "Ibadah", "Buku"];

export function TokoView({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter();
  const [cat, setCat] = useState("Semua");

  const handleCheckout = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/checkout?type=product&id=${p.id}&qty=1`);
  };

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
        {filtered.map((p) => (
          <Link key={p.id} href={`/toko/${p.slug}`} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #F1F5F9", cursor: "pointer", textDecoration: 'none', color: 'inherit' }}>
            <div style={{ height: 160, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
               <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{p.category}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.4, height: 36, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#0891B2", marginTop: 8 }}>{fmt(p.price)}</p>
              <button 
                onClick={(e) => handleCheckout(p, e)}
                style={{ width: "100%", marginTop: 12, padding: "8px 0", borderRadius: 10, background: "#ECFEFF", border: "none", color: "#0891B2", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
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

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  const map: Record<string, { bg: string, color: string, label: string, Icon: any }> = {
    PAID: { bg: "#DCFCE7", color: "#166534", label: "Lunas", Icon: CheckCircle },
    PENDING: { bg: "#FEF3C7", color: "#92400E", label: "Menunggu", Icon: Clock3 },
    FAILED: { bg: "#FEE2E2", color: "#991B1B", label: "Gagal", Icon: AlertCircle },
  };
  const cfg = map[s] || map.PENDING;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase" }}>
      <cfg.Icon size={10} />
      {cfg.label}
    </div>
  );
}

export function TiketView() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch("/api/user/registrations")
      .then(res => res.json())
      .then(data => {
        if (data.success) setRegistrations(data.data);
        else setError(data.error || 'Gagal memuat data');
      })
      .catch(() => setError('Gagal menghubungi server'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: "24px 20px 20px" }}>
        <h1 style={{ fontSize: 26, color: "#0F172A", fontWeight: 700 }}>Tiket Saya</h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Daftar kajian yang Anda ikuti</p>
      </div>
      <div style={{ padding: "0 20px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1,2].map(i => (
              <div key={i} style={{ background: "#F8FAFC", borderRadius: 24, padding: 20, height: 160, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 40, color: "#EF4444" }}>{error}</div>
        ) : registrations.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {registrations.map((reg) => (
              <div key={reg.id} style={{ background: "#fff", borderRadius: 24, padding: 20, border: "1px solid #F1F5F9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", gap: 16 }}>
                   <img src={reg.image || '/placeholder.png'} style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", background: "#F1F5F9", flexShrink: 0 }} />
                   <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reg.title}</p>
                      <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{reg.ustadz}</p>
                      <div style={{ marginTop: 8 }}>
                        <StatusBadge status={reg.price === 0 ? 'PAID' : reg.status} />
                      </div>
                   </div>
                </div>
                <div style={{ height: 1, background: "#F1F5F9", margin: "16px 0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={14} color="#64748B" />
                      <p style={{ fontSize: 13, color: "#475569" }}>{reg.date_display}</p>
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={14} color="#64748B" />
                      <p style={{ fontSize: 13, color: "#475569" }}>{reg.time_display}</p>
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MapPin size={14} color="#64748B" />
                      <p style={{ fontSize: 13, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reg.location}</p>
                   </div>
                </div>
                {reg.status === 'PENDING' && reg.price > 0 ? (
                  <Link 
                    href={`/status/REG-${reg.id}`}
                    style={{ display: "block", width: "100%", marginTop: 20, padding: "12px 0", borderRadius: 12, background: "#0891B2", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "center", textDecoration: "none" }}
                  >
                    Bayar Sekarang
                  </Link>
                ) : (
                  <Link 
                    href={`/kajian/${reg.slug}`}
                    style={{ display: "block", width: "100%", marginTop: 20, padding: "12px 0", borderRadius: 12, background: "#F1F5F9", color: "#475569", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "center", textDecoration: "none" }}
                  >
                    Lihat Detail Kajian
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
             <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Ticket size={32} color="#94A3B8" />
             </div>
             <p style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>Belum Ada Tiket</p>
             <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginTop: 8, maxWidth: 240 }}>Anda belum terdaftar di kajian manapun. Yuk pilih kajian sekarang!</p>
             <Link href="/" style={{ marginTop: 24, padding: "12px 24px", borderRadius: 14, background: "#0891B2", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", textDecoration: 'none' }}>Cari Kajian</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProfilView() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ kajian: 0, orders: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/registrations").then(res => res.json()),
      fetch("/api/user/orders").then(res => res.json())
    ]).then(([regData, orderData]) => {
      setStats({
        kajian: regData.success ? regData.data.length : 0,
        orders: orderData.success ? orderData.data.length : 0
      });
      if (orderData.success) setOrders(orderData.data);
    });
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const userName = session?.user?.name || 'Jamaah Majelis';
  const userEmail = session?.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div style={{ paddingBottom: 20 }}>
       <div style={{ background: "linear-gradient(160deg, #155E75, #06B6D4)", padding: "40px 20px 60px", borderRadius: "0 0 40px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#fff", padding: 4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
             <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, #CFFAFE, #0891B2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
               {session?.user?.image ? (
                 <img src={session.user.image} alt={userName} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
               ) : (
                 <span style={{ fontSize: 36, fontWeight: 700, color: "#fff" }}>{userInitial}</span>
               )}
             </div>
          </div>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginTop: 16 }}>{userName}</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 }}>{userEmail}</p>
       </div>

       <div style={{ padding: "0 20px", marginTop: -30 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #F1F5F9" }}>
             <div style={{ display: "flex", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center" }}>
                   <p style={{ fontSize: 22, fontWeight: 700, color: "#0891B2" }}>{stats.kajian}</p>
                   <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Kajian Diikuti</p>
                </div>
                <div style={{ width: 1, height: 40, background: "#E2E8F0", alignSelf: "center" }}></div>
                <div style={{ textAlign: "center" }}>
                   <p style={{ fontSize: 22, fontWeight: 700, color: "#0891B2" }}>{stats.orders}</p>
                   <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Pesanan</p>
                </div>
             </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
             <MenuButton icon={Package} label="Riwayat Pesanan" onClick={() => setShowOrders(!showOrders)} />
             
             {showOrders && (
               <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4, padding: "0 4px" }}>
                 {orders.length > 0 ? orders.map(order => (
                   <div key={order.id} style={{ background: "#F8FAFC", borderRadius: 20, padding: 16, border: "1px solid #F1F5F9" }}>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                       <div>
                         <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{order.orderCode}</p>
                         <p style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{order.date}</p>
                       </div>
                       <StatusBadge status={order.status} />
                     </div>
                     <div style={{ height: 1, background: "#E2E8F0", margin: "12px 0" }} />
                     <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                       {order.items?.map((item: any, i: number) => (
                         <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                           <span style={{ color: "#475569" }}>{item.name} x{item.qty}</span>
                           <span style={{ fontWeight: 600, color: "#0F172A" }}>{fmt(item.price * item.qty)}</span>
                         </div>
                       ))}
                     </div>
                     <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px dashed #E2E8F0" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Total</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#0891B2" }}>{fmt(order.total)}</span>
                     </div>
                     {order.status?.toUpperCase() === 'PENDING' && (
                       <Link 
                         href={`/status/${order.orderCode}`}
                         style={{ display: "block", textAlign: "center", marginTop: 12, padding: "10px", borderRadius: 10, background: "#0891B2", color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                       >
                         Lihat Instruksi Bayar
                       </Link>
                     )}
                   </div>
                 )) : (
                   <p style={{ textAlign: "center", padding: 20, color: "#94A3B8", fontSize: 13 }}>Belum ada riwayat pesanan.</p>
                 )}
               </div>
             )}

             <MenuButton icon={User} label="Edit Profil" onClick={() => router.push('/profil/edit')} />
             <MenuButton icon={LogOut} label="Keluar" color="#EF4444" onClick={handleLogout} />
          </div>
       </div>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick, color = "#0F172A" }: { icon: LucideIcon, label: string, onClick?: () => void, color?: string }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "16px 20px", background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", cursor: "pointer", transition: "all 0.2s" }}>
       <Icon size={20} color={color === "#0F172A" ? "#0891B2" : color} />
       <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 600, color }}>{label}</span>
       <ChevronRight size={18} color="#94A3B8" />
    </button>
  );
}

const styles = {
  chip: { padding: "8px 20px", borderRadius: 20, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" } as React.CSSProperties,
};
