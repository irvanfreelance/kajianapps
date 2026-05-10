import { useState, useEffect } from "react";
import { 
  LayoutDashboard, BookOpen, ShoppingBag, ShoppingCart, 
  Users, Settings, LogOut, Plus, Search, Bell, 
  MoreVertical, Edit, Trash2, CheckCircle2, X, 
  Calendar, MapPin, DollarSign, Package, TrendingUp, Menu, User,
  MessageCircle, Wallet
} from "lucide-react";

const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap');
`;

// ── Initial Mock Data (Sesuai dengan App Utama) ──
const INITIAL_KAJIAN = [
  { id: 1, title: "Fiqh Muamalah", ustadz: "Ust. Ahmad Zainuddin", date: "Jum'at, 2 Mei 2026", time: "19:30 WIB", type: "free", price: 0, spot: 120, filled: 87, image: "https://images.pexels.com/photos/8164575/pexels-photo-8164575.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Fiqh" },
  { id: 2, title: "Tahsin Al-Quran Lv.2", ustadz: "Ust. Muhammad Ridwan", date: "Sabtu, 3 Mei 2026", time: "08:00 WIB", type: "paid", price: 150000, spot: 30, filled: 28, image: "https://images.pexels.com/photos/8164568/pexels-photo-8164568.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Tahsin" },
  { id: 3, title: "Sirah Nabawiyah", ustadz: "Ust. Khalid Basalamah", date: "Ahad, 4 Mei 2026", time: "09:00 WIB", type: "free", price: 0, spot: 200, filled: 156, image: "https://images.pexels.com/photos/8164563/pexels-photo-8164563.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Sirah" },
];

const INITIAL_PRODUCTS = [
  { id: 101, name: "Gamis Premium Al-Haramain", price: 389000, stock: 45, image: "https://images.pexels.com/photos/935985/pexels-photo-935985.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Fashion", sold: 234 },
  { id: 102, name: "Hijab Voal Luxury Edition", price: 129000, stock: 120, image: "https://images.pexels.com/photos/4992410/pexels-photo-4992410.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Fashion", sold: 567 },
  { id: 103, name: "Tumbler Dakwah 'Istiqomah'", price: 89000, stock: 30, image: "https://images.pexels.com/photos/1342529/pexels-photo-1342529.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Merchandise", sold: 189 },
];

const INITIAL_ORDERS = [
  { id: "ORD-98273", customer: "Abdullah Fulan", date: "1 Mei 2026", total: 389000, status: "shipped", items: 1 },
  { id: "ORD-12837", customer: "Siti Aisyah", date: "28 April 2026", total: 130000, status: "completed", items: 2 },
  { id: "ORD-55421", customer: "Ahmad Zain", date: "3 Mei 2026", total: 159000, status: "pending", items: 1 },
  { id: "ORD-77623", customer: "Budi Santoso", date: "3 Mei 2026", total: 450000, status: "packed", items: 3 },
];

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

// Helper untuk Badge Status
const getStatusStyle = (status) => {
  switch(status) {
    case "pending": return { bg: "#FFFBEB", color: "#B45309", label: "Menunggu Pembayaran" };
    case "packed": return { bg: "#F0FDF4", color: "#15803D", label: "Sedang Dikemas" };
    case "shipped": return { bg: "#ECFEFF", color: "#0891B2", label: "Dalam Pengiriman" };
    case "completed": return { bg: "#F8FAFC", color: "#475569", label: "Pesanan Selesai" };
    default: return { bg: "#F1F5F9", color: "#64748B", label: status };
  }
};

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Data States
  const [kajian, setKajian] = useState(INITIAL_KAJIAN);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Media Query State Handle
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsTablet(window.innerWidth <= 768);
    };
    
    // Set initial
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "kajian", label: "Kelola Kajian", Icon: BookOpen },
    { id: "products", label: "Katalog Produk", Icon: ShoppingBag },
    { id: "orders", label: "Pesanan Masuk", Icon: ShoppingCart },
    { id: "users", label: "Data Jamaah", Icon: Users },
    { id: "settings", label: "Pengaturan", Icon: Settings },
  ];

  return (
    <div style={styles.container}>
      <style>{FONTS_CSS}{`
        *, body { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Source Sans Pro', sans-serif !important; }
        input, select, textarea { outline: none; font-family: 'Source Sans Pro', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div style={styles.toast}>
          <CheckCircle2 size={18} color="#fff" />
          <span>{toast}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, transform: (isTablet && !isMobileMenuOpen) ? "translateX(-100%)" : "translateX(0)" }}>
        <div style={styles.sidebarHeader}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0E7490, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>MI</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Admin Panel</h2>
        </div>
        
        <nav style={styles.navContainer}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                style={{ ...styles.navButton, background: isActive ? "#ECFEFF" : "transparent", color: isActive ? "#0891B2" : "#64748B" }}
              >
                <item.Icon size={20} color={isActive ? "#0891B2" : "#64748B"} />
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <button style={{ ...styles.navButton, color: "#EF4444" }}>
            <LogOut size={20} color="#EF4444" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && isTablet && (
        <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      )}

      {/* Main Content */}
      <main style={{ ...styles.mainContent, marginLeft: isTablet ? 0 : 260 }}>
        {/* Header */}
        <header style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
             {isTablet && (
              <button onClick={() => setIsMobileMenuOpen(true)} style={styles.mobileMenuBtn}><Menu size={24} color="#0F172A"/></button>
             )}
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#0F172A" }}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {!isTablet && (
              <div style={{ position: "relative" }}>
                <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input type="text" placeholder="Cari..." style={styles.searchInput} />
              </div>
            )}
            <button style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}>
              <Bell size={22} color="#64748B" />
              <span style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "#EF4444", border: "2px solid #fff" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: "1px solid #E2E8F0", paddingLeft: 20 }}>
              {!isMobile && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Admin Utama</p>
                  <p style={{ fontSize: 12, color: "#64748B" }}>admin@majelis.id</p>
                </div>
              )}
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#CFFAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={20} color="#0891B2" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        <div style={styles.viewContainer}>
          {activeTab === "dashboard" && <DashboardView kajian={kajian} products={products} orders={orders} />}
          {activeTab === "kajian" && <KajianView data={kajian} setData={setKajian} showToast={showToast} />}
          {activeTab === "products" && <ProductView data={products} setData={setProducts} showToast={showToast} />}
          {activeTab === "orders" && <OrderView data={orders} setData={setOrders} showToast={showToast} />}
          {activeTab === "users" && <UserView />}
          {activeTab === "settings" && <SettingsView showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

// ── Views ──

function DashboardView({ kajian, products, orders }) {
  const totalRevenue = orders.filter(o => o.status === 'completed' || o.status === 'shipped').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 30 }}>
        <StatCard title="Total Pendapatan" value={fmt(totalRevenue)} icon={DollarSign} color="#0891B2" bg="#ECFEFF" trend="+12% bulan ini" />
        <StatCard title="Pesanan Pending" value={pendingOrders} icon={Package} color="#D97706" bg="#FEF3C7" trend="Perlu diproses" />
        <StatCard title="Total Kajian Aktif" value={kajian.length} icon={BookOpen} color="#059669" bg="#D1FAE5" trend="Bulan ini" />
        <StatCard title="Total Produk" value={products.length} icon={ShoppingBag} color="#7C3AED" bg="#EDE9FE" trend="Katalog aktif" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Recent Orders */}
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
                  <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{o.customer} • {o.items} Item</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#0891B2" }}>{fmt(o.total)}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Kajian */}
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
                    <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12}/> {k.date.split(',')[0]}</span>
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

function KajianView({ data, setData, showToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleDelete = (id) => {
    if(window.confirm("Hapus kajian ini?")) {
      setData(data.filter(k => k.id !== id));
      showToast("Kajian berhasil dihapus");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.id) {
      setData(data.map(k => k.id === formData.id ? { ...k, ...formData } : k));
      showToast("Kajian berhasil diperbarui");
    } else {
      setData([{ ...formData, id: Date.now(), filled: 0 }, ...data]);
      showToast("Kajian baru berhasil ditambahkan");
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Cari judul kajian..." style={{...styles.searchInput, width: "100%"}} />
        </div>
        <button onClick={() => { setFormData({ type: 'free', spot: 100, price: 0 }); setIsModalOpen(true); }} style={styles.primaryBtn}>
          <Plus size={18} /> Tambah Kajian
        </button>
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Info Kajian</th>
                <th style={styles.th}>Jadwal</th>
                <th style={styles.th}>Tipe & Harga</th>
                <th style={styles.th}>Kuota</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((k) => (
                <tr key={k.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={k.image} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} alt="" />
                      <div>
                        <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{k.title}</p>
                        <p style={{ fontSize: 12, color: "#64748B" }}>{k.ustadz}</p>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <p style={{ fontSize: 13, color: "#0F172A" }}>{k.date}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{k.time}</p>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 12, background: k.type === "free" ? "#F0FDF4" : "#FFF7ED", color: k.type === "free" ? "#15803D" : "#C2410C" }}>
                      {k.type === "free" ? "Infaq" : fmt(k.price)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 4, minWidth: 60 }}>
                        <div style={{ height: "100%", background: "#0891B2", borderRadius: 4, width: `${(k.filled/k.spot)*100}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#64748B" }}>{k.filled}/{k.spot}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setFormData(k); setIsModalOpen(true); }} style={styles.actionBtnEdit}><Edit size={16}/></button>
                      <button onClick={() => handleDelete(k.id)} style={styles.actionBtnDel}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentBase}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>{formData.id ? "Edit Kajian" : "Tambah Kajian"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Judul Kajian</label>
                  <input required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div>
                  <label style={styles.label}>Nama Ustadz</label>
                  <input required value={formData.ustadz || ""} onChange={e => setFormData({...formData, ustadz: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div>
                  <label style={styles.label}>Kategori</label>
                  <input required value={formData.category || ""} onChange={e => setFormData({...formData, category: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div>
                  <label style={styles.label}>Tanggal</label>
                  <input required value={formData.date || ""} onChange={e => setFormData({...formData, date: e.target.value})} style={styles.inputForm} type="text" placeholder="Misal: Ahad, 5 Mei 2026" />
                </div>
                <div>
                  <label style={styles.label}>Waktu</label>
                  <input required value={formData.time || ""} onChange={e => setFormData({...formData, time: e.target.value})} style={styles.inputForm} type="text" placeholder="Misal: 09:00 WIB" />
                </div>
                <div>
                  <label style={styles.label}>Tipe</label>
                  <select value={formData.type || "free"} onChange={e => setFormData({...formData, type: e.target.value})} style={styles.inputForm}>
                    <option value="free">Gratis / Infaq</option>
                    <option value="paid">Berbayar</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Harga (Rp)</label>
                  <input disabled={formData.type === 'free'} value={formData.price || 0} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} style={styles.inputForm} type="number" />
                </div>
                <div>
                  <label style={styles.label}>URL Gambar Cover</label>
                  <input required value={formData.image || ""} onChange={e => setFormData({...formData, image: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div>
                  <label style={styles.label}>Kuota Jamaah</label>
                  <input required value={formData.spot || 100} onChange={e => setFormData({...formData, spot: parseInt(e.target.value) || 0})} style={styles.inputForm} type="number" />
                </div>
              </div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn}>Batal</button>
                <button type="submit" style={{...styles.primaryBtn, width: "auto"}}>Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductView({ data, setData, showToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleDelete = (id) => {
    if(window.confirm("Hapus produk ini?")) {
      setData(data.filter(p => p.id !== id));
      showToast("Produk berhasil dihapus");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.id) {
      setData(data.map(p => p.id === formData.id ? { ...p, ...formData } : p));
      showToast("Produk berhasil diperbarui");
    } else {
      setData([{ ...formData, id: Date.now(), sold: 0, rating: 5.0 }, ...data]);
      showToast("Produk baru ditambahkan");
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Cari nama produk..." style={{...styles.searchInput, width: "100%"}} />
        </div>
        <button onClick={() => { setFormData({ price: 0, stock: 10 }); setIsModalOpen(true); }} style={styles.primaryBtn}>
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Produk</th>
                <th style={styles.th}>Kategori</th>
                <th style={styles.th}>Harga</th>
                <th style={styles.th}>Stok</th>
                <th style={styles.th}>Terjual</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={p.image} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} alt="" />
                      <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{p.name}</p>
                    </div>
                  </td>
                  <td style={styles.td}><span style={{ fontSize: 12, background: "#F1F5F9", padding: "4px 8px", borderRadius: 12, color: "#475569", fontWeight: 600 }}>{p.category}</span></td>
                  <td style={styles.td}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0891B2" }}>{fmt(p.price)}</p>
                    {p.oldPrice && <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through" }}>{fmt(p.oldPrice)}</p>}
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: p.stock < 10 ? "#EF4444" : "#0F172A" }}>{p.stock}</span>
                  </td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B" }}>{p.sold}</span></td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setFormData(p); setIsModalOpen(true); }} style={styles.actionBtnEdit}><Edit size={16}/></button>
                      <button onClick={() => handleDelete(p.id)} style={styles.actionBtnDel}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentBase}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>{formData.id ? "Edit Produk" : "Tambah Produk"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Nama Produk</label>
                  <input required value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div>
                  <label style={styles.label}>Kategori</label>
                  <input required value={formData.category || ""} onChange={e => setFormData({...formData, category: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div>
                  <label style={styles.label}>Stok</label>
                  <input required value={formData.stock || ""} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} style={styles.inputForm} type="number" />
                </div>
                <div>
                  <label style={styles.label}>Harga Jual (Rp)</label>
                  <input required value={formData.price || ""} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} style={styles.inputForm} type="number" />
                </div>
                <div>
                  <label style={styles.label}>Harga Coret/Lama (Rp) - Opsional</label>
                  <input value={formData.oldPrice || ""} onChange={e => setFormData({...formData, oldPrice: parseInt(e.target.value) || null})} style={styles.inputForm} type="number" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>URL Gambar Produk</label>
                  <input required value={formData.image || ""} onChange={e => setFormData({...formData, image: e.target.value})} style={styles.inputForm} type="text" />
                </div>
              </div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn}>Batal</button>
                <button type="submit" style={{...styles.primaryBtn, width: "auto"}}>Simpan Katalog</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderView({ data, setData, showToast }) {
  const [filter, setFilter] = useState("all");

  const filteredData = filter === "all" ? data : data.filter(d => d.status === filter);

  const handleStatusChange = (id, newStatus) => {
    setData(data.map(o => o.id === id ? { ...o, status: newStatus } : o));
    showToast(`Status pesanan ${id} diperbarui`);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 8 }}>
        {[
          { id: "all", label: "Semua Pesanan" },
          { id: "pending", label: "Belum Bayar" },
          { id: "packed", label: "Perlu Dikirim" },
          { id: "shipped", label: "Dikirim" },
          { id: "completed", label: "Selesai" }
        ].map(f => (
          <button 
            key={f.id} 
            onClick={() => setFilter(f.id)}
            style={{ padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", background: filter === f.id ? "#0891B2" : "#fff", color: filter === f.id ? "#fff" : "#64748B", border: filter === f.id ? "1px solid #0891B2" : "1px solid #E2E8F0" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID Pesanan</th>
                <th style={styles.th}>Pelanggan</th>
                <th style={styles.th}>Tanggal</th>
                <th style={styles.th}>Total Belanja</th>
                <th style={styles.th}>Status Saat Ini</th>
                <th style={styles.th}>Ubah Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((o) => (
                <tr key={o.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{o.id}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{o.customer}</span>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>{o.items} Items</p>
                  </td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B" }}>{o.date}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 14, fontWeight: 600, color: "#0891B2" }}>{fmt(o.total)}</span></td>
                  <td style={styles.td}>
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td style={styles.td}>
                    <select 
                      value={o.status} 
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12, background: "#F8FAFC", cursor: "pointer", color: "#0F172A", fontWeight: 600 }}
                    >
                      <option value="pending">Menunggu Pembayaran</option>
                      <option value="packed">Dikemas</option>
                      <option value="shipped">Dikirim</option>
                      <option value="completed">Selesai</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 14 }}>Belum ada pesanan di kategori ini.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserView() {
  const MOCK_USERS = [
    { id: "USR-001", name: "Abdullah Fulan", email: "abdullah@gmail.com", phone: "081234567890", joined: "1 Mei 2026" },
    { id: "USR-002", name: "Siti Aisyah", email: "aisyah.s@yahoo.com", phone: "085711223344", joined: "20 April 2026" },
    { id: "USR-003", name: "Ahmad Zain", email: "zain.ahmad@gmail.com", phone: "081199887766", joined: "15 April 2026" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID Pengguna</th>
                <th style={styles.th}>Nama Lengkap</th>
                <th style={styles.th}>Kontak</th>
                <th style={styles.th}>Tgl Bergabung</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u) => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}><span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>{u.id}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{u.name}</span></td>
                  <td style={styles.td}>
                    <p style={{ fontSize: 13, color: "#0F172A" }}>{u.email}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{u.phone}</p>
                  </td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B" }}>{u.joined}</span></td>
                  <td style={styles.td}>
                    <button style={{ padding: "6px 12px", background: "#ECFEFF", color: "#0891B2", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ showToast }) {
  const saveConfig = () => {
    showToast("Pengaturan berhasil disimpan");
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 800 }}>
      <div style={styles.card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 20, borderBottom: "1px solid #F1F5F9", paddingBottom: 12 }}>Konfigurasi Aplikasi</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><MessageCircle size={18} color="#0891B2"/> Pengaturan Notifikasi WhatsApp</h4>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#475569" }}>Status API WA Gateway:</span>
              <span style={{ fontSize: 12, background: "#D1FAE5", color: "#059669", padding: "4px 10px", borderRadius: 12, fontWeight: 600 }}>Aktif & Terhubung</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={styles.label}>Template Pesan Tiket Kajian</label>
              <textarea style={{...styles.inputForm, height: 80, resize: "none"}} defaultValue={`Ahlan wa sahlan {nama_user},\n\nPendaftaran Anda untuk kajian *{judul_kajian}* telah berhasil dikonfirmasi. Berikut adalah e-tiket Anda...`} />
            </div>
          </div>

          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><Wallet size={18} color="#0891B2"/> Akun Pembayaran Transfer Bank</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={styles.label}>Nomor Rekening BCA Utama</label>
                <input style={styles.inputForm} type="text" defaultValue="123 456 7890" />
              </div>
              <div>
                <label style={styles.label}>Atas Nama (BCA)</label>
                <input style={styles.inputForm} type="text" defaultValue="Yayasan Majelis Ilmu" />
              </div>
              <div>
                <label style={styles.label}>Nomor Rekening BSI Utama</label>
                <input style={styles.inputForm} type="text" defaultValue="987 654 3210" />
              </div>
              <div>
                <label style={styles.label}>Atas Nama (BSI)</label>
                <input style={styles.inputForm} type="text" defaultValue="Yayasan Majelis Ilmu" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={saveConfig} style={{...styles.primaryBtn, width: "auto", padding: "12px 24px"}}>Simpan Pengaturan</button>
        </div>
      </div>
    </div>
  );
}

// ── Components ──
const StatCard = ({ title, value, icon: Icon, color, bg, trend }) => (
  <div style={styles.card}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{title}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", marginTop: 8 }}>{value}</p>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={24} color={color} />
      </div>
    </div>
    <div style={{ marginTop: 16, fontSize: 12, color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
       <TrendingUp size={14} /> {trend}
    </div>
  </div>
);

const OrderStatusBadge = ({ status }) => {
  const { bg, color, label } = getStatusStyle(status);
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: bg, color: color, display: "inline-block", marginTop: 4 }}>
      {label}
    </span>
  );
}

// ── Styles ──
const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#F1F5F9", overflow: "hidden" },
  sidebar: { width: 260, background: "#fff", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 50, transition: "transform 0.3s ease" },
  sidebarHeader: { padding: "24px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F1F5F9" },
  navContainer: { flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" },
  navButton: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", fontSize: 14, cursor: "pointer", transition: "all 0.2s", textAlign: "left" },
  sidebarFooter: { padding: "20px 12px", borderTop: "1px solid #F1F5F9" },
  
  mainContent: { flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", transition: "margin-left 0.3s ease" },
  header: { height: 72, background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  mobileMenuBtn: { background: "none", border: "none", cursor: "pointer" },
  searchInput: { padding: "10px 16px 10px 36px", borderRadius: 20, border: "1px solid #E2E8F0", fontSize: 13, background: "#F8FAFC", width: 240, transition: "all 0.2s" },
  
  viewContainer: { flex: 1, padding: 24, overflowY: "auto" },
  card: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.02)", border: "1px solid #E2E8F0" },
  
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "12px 16px", fontSize: 12, color: "#64748B", fontWeight: 600, borderBottom: "1px solid #E2E8F0", whiteSpace: "nowrap" },
  td: { padding: "16px", borderBottom: "1px solid #F1F5F9", verticalAlign: "middle" },
  tr: { transition: "background 0.2s", ":hover": { background: "#F8FAFC" } },
  
  primaryBtn: { padding: "10px 20px", borderRadius: 12, background: "#0891B2", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
  secondaryBtn: { padding: "10px 20px", borderRadius: 12, background: "transparent", color: "#64748B", fontSize: 14, fontWeight: 600, border: "1px solid #E2E8F0", cursor: "pointer" },
  actionBtnEdit: { width: 32, height: 32, borderRadius: 8, background: "#EFF6FF", border: "none", color: "#2563EB", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  actionBtnDel: { width: 32, height: 32, borderRadius: 8, background: "#FEF2F2", border: "none", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", padding: 20 },
  modalContentBase: { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
  modalHeader: { padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10 },
  
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 },
  inputForm: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", background: "#F8FAFC" },
  
  toast: { position: "fixed", top: 24, right: 24, background: "#0F172A", color: "#fff", padding: "12px 20px", borderRadius: 12, zIndex: 300, display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 14, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" },
};