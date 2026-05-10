"use client";
import { DollarSign, Package, BookOpen, ShoppingBag, Calendar, Users } from "lucide-react";

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

const getStatusStyle = (status) => {
  switch(status) {
    case "pending": return { bg: "#FFFBEB", color: "#B45309", label: "Menunggu Pembayaran" };
    case "packed": return { bg: "#F0FDF4", color: "#15803D", label: "Sedang Dikemas" };
    case "shipped": return { bg: "#ECFEFF", color: "#0891B2", label: "Dalam Pengiriman" };
    case "completed": return { bg: "#F8FAFC", color: "#475569", label: "Pesanan Selesai" };
    default: return { bg: "#F1F5F9", color: "#64748B", label: status };
  }
};

const OrderStatusBadge = ({ status }) => {
  const { bg, color, label } = getStatusStyle(status);
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: bg, color: color, display: "inline-block", marginTop: 4 }}>
      {label}
    </span>
  );
}

const StatCard = ({ title, value, icon: Icon, color, bg, trend }) => (
  <div style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
    <div>
      <p style={{ fontSize: 14, color: "#64748B", marginBottom: 8, fontWeight: 500 }}>{title}</p>
      <h3 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>{value}</h3>
      <p style={{ fontSize: 12, color: color, marginTop: 8, fontWeight: 600 }}>{trend}</p>
    </div>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={24} color={color} />
    </div>
  </div>
);

export default function DashboardView({ kajian, products, orders }: { kajian: any[], products: any[], orders: any[] }) {
  const totalRevenue = orders.filter(o => o.status === 'completed' || o.status === 'shipped').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 30 }}>
        <StatCard title="Total Pendapatan" value={fmt(totalRevenue)} icon={DollarSign} color="#0891B2" bg="#ECFEFF" trend="+12% bulan ini" />
        <StatCard title="Pesanan Pending" value={pendingOrders} icon={Package} color="#D97706" bg="#FEF3C7" trend="Perlu diproses" />
        <StatCard title="Total Kajian Aktif" value={kajian.length} icon={BookOpen} color="#059669" bg="#D1FAE5" trend="Bulan ini" />
        <StatCard title="Total Produk" value={products.length} icon={ShoppingBag} color="#7C3AED" bg="#EDE9FE" trend="Katalog aktif" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>Pesanan Terbaru</h3>
            <span style={{ fontSize: 13, color: "#0891B2", cursor: "pointer", fontWeight: 600 }}>Lihat Semua</span>
          </div>
          <div>
            {orders.slice(0,4).map((o, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i !== 3 ? "1px solid #F1F5F9" : "none" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{o.id}</p>
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{o.customer || 'Customer'} • {o.items || 1} Item</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0891B2" }}>{fmt(o.total)}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>Jadwal Kajian Terdekat</h3>
            <span style={{ fontSize: 13, color: "#0891B2", cursor: "pointer", fontWeight: 600 }}>Kelola</span>
          </div>
          <div>
            {kajian.slice(0,3).map((k, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i !== 2 ? "1px solid #F1F5F9" : "none", alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                  <img src={k.image} alt={k.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{k.title}</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12}/> {k.date?.split(',')[0]}</span>
                    <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}><Users size={12}/> {k.filled}/{k.spot}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.02)", border: "1px solid #E2E8F0" },
};
