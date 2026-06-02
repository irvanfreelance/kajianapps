"use client";
import { useState, useEffect } from "react";
import { 
  DollarSign, Package, BookOpen, ShoppingBag, 
  Calendar, Users, RefreshCw, Layers, Ticket, TrendingUp
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, BarChart, Bar, 
  PieChart, Pie, Cell 
} from "recharts";
import { fmt, getStatusStyle, OrderStatusBadge, styles, formatDate } from "./shared";

// Color Palette for Pie Charts and Visuals
const CHART_COLORS = ["#0891B2", "#0D9488", "#4F46E5", "#D97706", "#DB2777", "#2563EB", "#7C3AED", "#16A34A"];
const GENDER_COLORS = ["#0284C7", "#EC4899", "#64748B"];
const getGenderColor = (name: string) => {
  if (name.includes("Ikhwan") || name.includes("Pria")) return "#0284C7";
  if (name.includes("Akhwat") || name.includes("Wanita")) return "#EC4899";
  return "#64748B";
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
  trend: string;
  subtext?: string;
}

const StatCard = ({ title, value, icon: Icon, color, bg, trend, subtext }: StatCardProps) => (
  <div style={{ 
    background: "#fff", 
    padding: 24, 
    borderRadius: 16, 
    border: "1px solid #E2E8F0", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-start",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-4px)";
    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
  }}
  >
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 13, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</p>
      <h3 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.2 }}>{value}</h3>
      {subtext && <p style={{ fontSize: 12, color: "#475569", marginTop: 4, fontWeight: 500 }}>{subtext}</p>}
      <p style={{ fontSize: 12, color: color, marginTop: 8, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        <span>{trend}</span>
      </p>
    </div>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12 }}>
      <Icon size={24} color={color} />
    </div>
  </div>
);

const CardSkeleton = () => (
  <div style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #E2E8F0", height: 145, animation: "pulse 1.5s infinite" }}>
    <div style={{ background: "#E2E8F0", height: 16, width: "60%", borderRadius: 4, marginBottom: 12 }}></div>
    <div style={{ background: "#E2E8F0", height: 32, width: "80%", borderRadius: 6, marginBottom: 12 }}></div>
    <div style={{ background: "#E2E8F0", height: 14, width: "40%", borderRadius: 4 }}></div>
  </div>
);

const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #E2E8F0", height, display: "flex", flexDirection: "column", gap: 16, animation: "pulse 1.5s infinite" }}>
    <div style={{ background: "#E2E8F0", height: 20, width: "30%", borderRadius: 4 }}></div>
    <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 8, display: "flex", alignItems: "flex-end", padding: 12, gap: 12 }}>
      <div style={{ background: "#E2E8F0", height: "40%", flex: 1, borderRadius: 4 }}></div>
      <div style={{ background: "#E2E8F0", height: "70%", flex: 1, borderRadius: 4 }}></div>
      <div style={{ background: "#E2E8F0", height: "55%", flex: 1, borderRadius: 4 }}></div>
      <div style={{ background: "#E2E8F0", height: "85%", flex: 1, borderRadius: 4 }}></div>
      <div style={{ background: "#E2E8F0", height: "30%", flex: 1, borderRadius: 4 }}></div>
    </div>
  </div>
);

export default function DashboardView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.error || "Gagal memuat data dashboard.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  if (error) {
    return (
      <div style={{ padding: 24, background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, textAlign: "center" }}>
        <p style={{ color: "#DC2626", fontWeight: 600 }}>Error: {error}</p>
        <button onClick={fetchStats} style={{ ...styles.primaryBtn, margin: "12px auto 0", background: "#DC2626" }}>
          <RefreshCw size={16} /> Coba Lagi
        </button>
      </div>
    );
  }

  const sc = data?.scorecard;
  const charts = data?.charts;
  const recentOrders = data?.recentOrders || [];
  const recentKajian = data?.recentKajian || [];

  return (
    <div style={{ animation: "fadeIn 0.4s ease", display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top Welcome Panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0 }}>Dashboard Ringkasan</h1>
          <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Pantau data penjualan toko, pendaftaran kajian, dan demografi jamaah secara langsung.</p>
        </div>
        <button 
          onClick={fetchStats} 
          disabled={loading}
          style={{ ...styles.primaryBtn, display: "flex", alignItems: "center", gap: 8, background: "#0F172A" }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} style={{ transition: "transform 0.5s ease" }} />
          {loading ? "Memuat..." : "Segarkan Data"}
        </button>
      </div>

      {/* 1. Scorecards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard 
              title="Total Pendapatan" 
              value={fmt(sc.totalRevenue)} 
              icon={DollarSign} 
              color="#0891B2" 
              bg="#ECFEFF" 
              trend="Akumulasi penjualan & tiket" 
              subtext={`Toko: ${fmt(sc.shopRevenue)} • Kajian: ${fmt(sc.kajianRevenue)}`}
            />
            <StatCard 
              title="Pesanan Pending" 
              value={`${sc.pendingOrders} Pesanan`} 
              icon={Package} 
              color="#D97706" 
              bg="#FEF3C7" 
              trend="Perlu diproses segera" 
            />
            <StatCard 
              title="Registrasi Kajian Berbayar" 
              value={`${sc.totalRegistrationsPaid} Tiket`} 
              icon={Ticket} 
              color="#2563EB" 
              bg="#EFF6FF" 
              trend="Tiket kajian berbayar lunas" 
            />
            <StatCard 
              title="Registrasi Kajian Gratis" 
              value={`${sc.totalRegistrationsFree} Tiket`} 
              icon={Layers} 
              color="#0D9488" 
              bg="#F0FDF4" 
              trend="Jamaah terdaftar kajian gratis" 
            />
            <StatCard 
              title="Kajian Aktif" 
              value={`${sc.activeKajian} Sesi`} 
              icon={BookOpen} 
              color="#059669" 
              bg="#D1FAE5" 
              trend="Katalog kajian diaktifkan" 
            />
            <StatCard 
              title="Produk Katalog" 
              value={`${sc.totalProducts} Item`} 
              icon={ShoppingBag} 
              color="#7C3AED" 
              bg="#EDE9FE" 
              trend="Produk terdaftar di toko" 
            />
            <StatCard 
              title="Total Jamaah" 
              value={`${sc.totalUsers} Akun`} 
              icon={Users} 
              color="#DB2777" 
              bg="#FCE7F3" 
              trend="Jamaah terdaftar di aplikasi" 
            />
          </>
        )}
      </div>

      {/* 2. Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        
        {/* Line Chart: Daily Revenue Trend */}
        {loading ? (
          <ChartSkeleton height={350} />
        ) : (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={18} color="#0891B2" /> Tren Pendapatan Harian (30 Hari Terakhir)
                </h3>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Menampilkan dinamika transaksi harian dari Kajian dan Toko Produk.</p>
              </div>
            </div>
            <div style={{ width: "100%", height: 300 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.revenueTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `Rp ${v >= 1000000 ? (v/1000000).toFixed(1) + 'jt' : v >= 1000 ? (v/1000) + 'rb' : v}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [fmt(value), '']}
                      contentStyle={{ background: "#0F172A", border: "none", borderRadius: 8, color: "#fff" }}
                      labelStyle={{ fontWeight: "bold", marginBottom: 4 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
                    <Line type="monotone" name="Toko Produk" dataKey="shop" stroke="#0891B2" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Pendaftaran Kajian" dataKey="kajian" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Total Pendapatan" dataKey="total" stroke="#6366F1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {/* Bar Chart: Kajian Popularity */}
          {loading ? (
            <ChartSkeleton height={320} />
          ) : (
            <div style={styles.card}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>Keterisian Kuota Kajian Terpopuler</h3>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 4, marginBottom: 20 }}>Membandingkan kuota (target spot) dengan jumlah peserta terdaftar.</p>
              </div>
              <div style={{ width: "100%", height: 240 }}>
                {mounted && charts.kajianPopularity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.kajianPopularity}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "#0F172A", border: "none", borderRadius: 8, color: "#fff" }} />
                      <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                      <Bar name="Kuota Maksimal" dataKey="kuota" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar name="Peserta Terisi" dataKey="terisi" fill="#0D9488" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: 14 }}>
                    Belum ada data kajian.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pie Charts Section (Nested Demographics & Payments) */}
          {loading ? (
            <ChartSkeleton height={320} />
          ) : (
            <div style={{ ...styles.card, display: "flex", flexDirection: "column" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>Analisis Pembayaran & Jamaah</h3>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 4, marginBottom: 20 }}>Proporsi metode pembayaran yang digunakan dan gender jamaah.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1, alignItems: "center" }}>
                
                {/* Pie 1: Payment Methods */}
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10 }}>Metode Bayar</p>
                  <div style={{ height: 130, width: "100%", position: "relative" }}>
                    {mounted && charts.paymentMethods.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={charts.paymentMethods}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={50}
                            paddingAngle={3}
                            dataKey="count"
                          >
                            {charts.paymentMethods.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any, name: any) => [`${value} transaksi`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 12 }}>Tidak ada data</div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8, maxHeight: 40, overflowY: "auto" }}>
                    {charts.paymentMethods.slice(0, 3).map((item: any, i: number) => (
                      <span key={i} style={{ fontSize: 9, color: "#64748B", display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                        {item.name}
                      </span>
                    ))}
                    {charts.paymentMethods.length > 3 && <span style={{ fontSize: 9, color: "#94A3B8" }}>+{charts.paymentMethods.length - 3} lainnya</span>}
                  </div>
                </div>

                {/* Pie 2: Gender Demographics */}
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10 }}>Gender Jamaah</p>
                  <div style={{ height: 130, width: "100%" }}>
                    {mounted && charts.demographics.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={charts.demographics}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={50}
                            paddingAngle={3}
                            dataKey="count"
                          >
                            {charts.demographics.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={getGenderColor(entry.name)} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any, name: any) => [`${value} jamaah`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 12 }}>Tidak ada data</div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>
                    {charts.demographics.map((item: any, i: number) => (
                      <span key={i} style={{ fontSize: 9, color: "#64748B", display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: getGenderColor(item.name) }}></span>
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. Bottom Grid: Recent Activity & Calendar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        
        {/* Recent Orders Card */}
        {loading ? (
          <ChartSkeleton height={280} />
        ) : (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>Pesanan Terbaru</h3>
              <a href="/panel/orders" style={{ fontSize: 13, color: "#0891B2", textDecoration: "none", fontWeight: 700 }}>Lihat Semua</a>
            </div>
            <div>
              {recentOrders.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#64748B", fontSize: 14 }}>
                  Belum ada transaksi pembelian produk.
                </div>
              ) : (
                recentOrders.map((o: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i !== recentOrders.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{o.orderCode || o.id}</p>
                      <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                        {o.customer || 'Customer'} • {Array.isArray(o.items) ? o.items.reduce((sum: number, item: any) => sum + item.qty, 0) : 1} Item
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0891B2" }}>{fmt(o.total || 0)}</p>
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Upcoming / Recent Kajian */}
        {loading ? (
          <ChartSkeleton height={280} />
        ) : (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>Jadwal Kajian Terakhir</h3>
              <a href="/panel/kajian" style={{ fontSize: 13, color: "#0891B2", textDecoration: "none", fontWeight: 700 }}>Kelola</a>
            </div>
            <div>
              {recentKajian.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#64748B", fontSize: 14 }}>
                  Belum ada sesi kajian terdaftar.
                </div>
              ) : (
                recentKajian.map((k: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i !== recentKajian.length - 1 ? "1px solid #F1F5F9" : "none", alignItems: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid #E2E8F0" }}>
                      <img src={k.image || "/placeholder-kajian.jpg"} alt={k.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.title}</p>
                      <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12}/> {formatDate(k.date)}</span>
                        <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}><Users size={12}/> {k.filled}/{k.spot} terisi</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
