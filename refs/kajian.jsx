import { useState, useEffect } from "react";
import { 
  Star, Moon, Users, Coffee, Compass, Book, CircleDot, Hash, 
  Smartphone, Landmark, Wallet, Copy, ShoppingCart, ShoppingBag, 
  User, Home, Search, Bell, LogOut, Headphones, MessageCircle, 
  CheckCircle2, Heart, Package, ChevronRight, ChevronLeft, 
  ChevronDown, Minus, Plus, X, Calendar, Clock, MapPin, Mail, 
  SunMedium, Check, Info, BookOpen, LogIn
} from "lucide-react";

const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap');
`;

// ── Data ──
const KAJIAN_DATA = [
  { id: 1, title: "Fiqh Muamalah", ustadz: "Ust. Ahmad Zainuddin", date: "Jum'at, 2 Mei 2026", time: "19:30 WIB", type: "free", price: 0, spot: 120, filled: 87, image: "https://images.pexels.com/photos/8164575/pexels-photo-8164575.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Fiqh", desc: "Pembahasan mendalam tentang hukum-hukum transaksi dalam Islam, termasuk jual beli, sewa-menyewa, dan kerja sama bisnis syariah.", location: "Masjid Al-Ikhlas, Bandung" },
  { id: 2, title: "Tahsin Al-Quran Lv.2", ustadz: "Ust. Muhammad Ridwan", date: "Sabtu, 3 Mei 2026", time: "08:00 WIB", type: "paid", price: 150000, spot: 30, filled: 28, image: "https://images.pexels.com/photos/8164568/pexels-photo-8164568.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Tahsin", desc: "Kelas intensif perbaikan bacaan Al-Quran dengan metode talaqqi. Level menengah untuk yang sudah menguasai dasar tajwid.", location: "Graha Dakwah, Bandung" },
  { id: 3, title: "Sirah Nabawiyah", ustadz: "Ust. Khalid Basalamah", date: "Ahad, 4 Mei 2026", time: "09:00 WIB", type: "free", price: 0, spot: 200, filled: 156, image: "https://images.pexels.com/photos/8164563/pexels-photo-8164563.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Sirah", desc: "Menelusuri perjalanan hidup Rasulullah ﷺ dari kelahiran hingga hijrah ke Madinah.", location: "Online via Zoom" },
  { id: 4, title: "Bahasa Arab Dasar", ustadz: "Ust. Fuad Abdurrahman", date: "Senin, 5 Mei 2026", time: "19:00 WIB", type: "paid", price: 200000, spot: 25, filled: 12, image: "https://images.pexels.com/photos/4559592/pexels-photo-4559592.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Bahasa", desc: "Kelas bahasa Arab untuk pemula. Belajar nahwu shorof dasar dengan pendekatan praktis.", location: "Wisma Dakwah, Bandung" },
  { id: 5, title: "Kitab Riyadhus Shalihin", ustadz: "Ust. Syafiq Basalamah", date: "Rabu, 7 Mei 2026", time: "16:00 WIB", type: "free", price: 0, spot: 150, filled: 98, image: "https://images.pexels.com/photos/8164627/pexels-photo-8164627.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Hadits", desc: "Kajian rutin pembahasan kitab Riyadhus Shalihin karya Imam An-Nawawi.", location: "Masjid Al-Ikhlas, Bandung" },
  { id: 6, title: "Parenting Islami", ustadz: "Ustzh. Haneen Akira", date: "Sabtu, 10 Mei 2026", time: "10:00 WIB", type: "paid", price: 75000, spot: 50, filled: 43, image: "https://images.pexels.com/photos/8164571/pexels-photo-8164571.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Tarbiyah", desc: "Seminar mendidik anak sesuai sunnah Rasulullah ﷺ di era digital.", location: "Hall Gedung Sate, Bandung" },
];

const PRODUCTS_DATA = [
  { id: 101, name: "Gamis Premium Al-Haramain", price: 389000, oldPrice: 450000, image: "https://images.pexels.com/photos/935985/pexels-photo-935985.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Fashion", rating: 4.8, sold: 234, desc: "Gamis pria bahan katun Madinah premium, nyaman dan adem." },
  { id: 102, name: "Hijab Voal Luxury Edition", price: 129000, oldPrice: null, image: "https://images.pexels.com/photos/4992410/pexels-photo-4992410.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Fashion", rating: 4.9, sold: 567, desc: "Hijab voal premium dengan pinggiran laser cut." },
  { id: 103, name: "Tumbler Dakwah 'Istiqomah'", price: 89000, oldPrice: 120000, image: "https://images.pexels.com/photos/1342529/pexels-photo-1342529.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Merchandise", rating: 4.7, sold: 189, desc: "Tumbler stainless 500ml dengan kaligrafi motivasi." },
  { id: 104, name: "Minyak Wangi Oud Al-Madinah", price: 175000, oldPrice: null, image: "https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Parfum", rating: 4.9, sold: 412, desc: "Parfum non-alkohol aroma oud premium dari Madinah." },
  { id: 105, name: "Sajadah Travel Premium", price: 159000, oldPrice: 199000, image: "https://images.pexels.com/photos/13508493/pexels-photo-13508493.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Ibadah", rating: 4.8, sold: 321, desc: "Sajadah lipat portable dengan kompas kiblat built-in." },
  { id: 106, name: "Buku 'Jalan Menuju Jannah'", price: 95000, oldPrice: null, image: "https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Buku", rating: 4.6, sold: 876, desc: "Buku best-seller panduan amal yaumiyah lengkap." },
  { id: 107, name: "Koko Anak Seri Ramadhan", price: 145000, oldPrice: 175000, image: "https://images.pexels.com/photos/8164741/pexels-photo-8164741.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Fashion", rating: 4.7, sold: 198, desc: "Baju koko anak motif islami, bahan adem dan lembut." },
  { id: 108, name: "Tasbih Digital Premium", price: 65000, oldPrice: null, image: "https://images.pexels.com/photos/8164585/pexels-photo-8164585.jpeg?auto=compress&cs=tinysrgb&w=600", category: "Ibadah", rating: 4.5, sold: 543, desc: "Tasbih digital dengan counter dan pengingat dzikir." },
];

const CATEGORIES_KAJIAN = ["Semua", "Fiqh", "Tahsin", "Sirah", "Bahasa", "Hadits", "Tarbiyah"];
const CATEGORIES_SHOP = ["Semua", "Fashion", "Merchandise", "Parfum", "Ibadah", "Buku"];

// ── Global Payment Data & Helpers ──
const PAYMENT_METHODS = [
  { id: "va", name: "Virtual Account (Otomatis)", Icon: Hash, desc: "Verifikasi instan otomatis 24/7" },
  { id: "qris", name: "QRIS", Icon: Smartphone, desc: "Scan QR dari semua E-Wallet & M-Banking" },
  { id: "transfer", name: "Transfer Bank Manual", Icon: Landmark, desc: "Perlu transfer sesuai nominal unik" },
  { id: "ewallet", name: "E-Wallet", Icon: Wallet, desc: "Transfer ke nomor handphone" },
];

const PAYMENT_SUB_OPTIONS = {
  va: [
    { id: "bcava", name: "BCA VA", code: "88000" },
    { id: "mandiriva", name: "Mandiri VA", code: "89508" },
    { id: "briva", name: "BRI VA", code: "22000" },
    { id: "bniva", name: "BNI VA", code: "8241" }
  ],
  transfer: [
    { id: "bca", name: "BCA", acc: "123 456 7890", owner: "Majelis Ilmu" },
    { id: "bsi", name: "BSI", acc: "987 654 3210", owner: "Yayasan Majelis Ilmu" },
    { id: "mandiri", name: "Mandiri", acc: "111 222 3333", owner: "Majelis Ilmu" },
    { id: "bni", name: "BNI", acc: "444 555 6666", owner: "Majelis Ilmu" }
  ],
  ewallet: [
    { id: "gopay", name: "GoPay" },
    { id: "ovo", name: "OVO" },
    { id: "dana", name: "DANA" },
    { id: "shopeepay", name: "ShopeePay" }
  ]
};

const copyToClipboard = (text, e) => {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  const originalText = e.target.innerText;
  e.target.innerText = "Tersalin!";
  setTimeout(() => { e.target.innerText = originalText }, 1500);
};

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

// ── Order Tracking Helpers ──
const STATUS_STEPS = [
  { key: "pending", label: "Belum Bayar" },
  { key: "packed", label: "Dikemas" },
  { key: "shipped", label: "Dikirim" },
  { key: "completed", label: "Diterima" }
];

const getStatusStyle = (status) => {
  switch(status) {
    case "pending": return { bg: "#FFFBEB", color: "#B45309", label: "Menunggu Pembayaran" };
    case "packed": return { bg: "#F0FDF4", color: "#15803D", label: "Sedang Dikemas" };
    case "shipped": return { bg: "#ECFEFF", color: "#0891B2", label: "Dalam Pengiriman" };
    case "completed": return { bg: "#F8FAFC", color: "#475569", label: "Pesanan Selesai" };
    default: return { bg: "#F1F5F9", color: "#64748B", label: status };
  }
};

const getVAInstructions = (bankId) => {
  switch(bankId) {
    case "bcava":
      return [
        { title: "m-BCA (BCA mobile)", steps: ["Login ke BCA mobile dan pilih m-BCA.", "Pilih menu m-Transfer > BCA Virtual Account.", "Masukkan nomor Virtual Account di atas.", "Pastikan detail pembayaran sudah benar.", "Masukkan PIN m-BCA Anda."] },
        { title: "ATM BCA", steps: ["Masukkan Kartu ATM & PIN.", "Pilih menu Transaksi Lainnya > Transfer.", "Pilih Ke Rekening BCA Virtual Account.", "Masukkan nomor Virtual Account.", "Ikuti instruksi untuk menyelesaikan transaksi."] }
      ];
    case "mandiriva":
      return [
        { title: "Livin' by Mandiri", steps: ["Login ke Livin' by Mandiri.", "Pilih menu Bayar > e-Commerce / Multipayment.", "Masukkan nomor Virtual Account di atas.", "Pastikan detail pembayaran sudah benar.", "Masukkan PIN Livin' Anda."] },
        { title: "ATM Mandiri", steps: ["Masukkan Kartu ATM & PIN.", "Pilih menu Bayar/Beli > Lainnya > Multipayment.", "Masukkan nomor Virtual Account.", "Konfirmasi detail dan selesaikan transaksi."] }
      ];
    case "briva":
      return [
        { title: "BRImo", steps: ["Login ke aplikasi BRImo.", "Pilih menu BRIVA.", "Pilih Pembayaran Baru dan masukkan nomor VA.", "Konfirmasi detail pembayaran.", "Masukkan PIN BRImo Anda."] },
        { title: "ATM BRI", steps: ["Masukkan Kartu ATM & PIN.", "Pilih menu Transaksi Lain > Pembayaran > Lainnya > BRIVA.", "Masukkan nomor Virtual Account.", "Selesaikan pembayaran."] }
      ];
    case "bniva":
      return [
        { title: "BNI Mobile", steps: ["Login ke BNI Mobile Banking.", "Pilih menu Transfer > Virtual Account Billing.", "Pilih Input Baru dan masukkan nomor VA.", "Konfirmasi nominal dan masukkan Password Transaksi."] },
        { title: "ATM BNI", steps: ["Masukkan Kartu ATM & PIN.", "Pilih Menu Lain > Pembayaran > Virtual Account Billing.", "Masukkan nomor Virtual Account.", "Konfirmasi dan selesaikan transaksi."] }
      ];
    default:
      return [];
  }
};

// ── Shared Payment Components ──
const PaymentMethodAccordion = ({ method, setMethod, selectedSub, setSelectedSub }) => (
  <>
    {PAYMENT_METHODS.map((m) => (
      <div key={m.id} style={{ marginBottom: 10, background: "#fff", borderRadius: 14, border: method === m.id ? "2px solid #0891B2" : "1px solid #E2E8F0", overflow: "hidden", transition: "all 0.3s" }}>
        <button onClick={() => { setMethod(m.id); setSelectedSub(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: 16, background: method === m.id ? "#ECFEFF" : "transparent", border: "none", cursor: "pointer" }}>
          <m.Icon size={24} color={method === m.id ? "#0891B2" : "#64748B"} />
          <div style={{ textAlign: "left", flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{m.name}</p>
            <p style={{ fontSize: 12, color: "#64748B" }}>{m.desc}</p>
          </div>
          <ChevronRight size={20} color={method === m.id ? "#0891B2" : "#CBD5E1"} style={{ transform: method === m.id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
        </button>
        
        {method === m.id && m.id !== "qris" && (
          <div style={{ padding: "0 16px 16px", background: "#ECFEFF", animation: "fadeUp 0.3s ease" }}>
            <p style={{ fontSize: 12, color: "#0F172A", marginBottom: 10 }}>Pilih salah satu:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {PAYMENT_SUB_OPTIONS[m.id]?.map((sub) => (
                <button key={sub.id} onClick={() => setSelectedSub(sub)} style={{ background: selectedSub?.id === sub.id ? "#0891B2" : "#fff", padding: "12px 10px", borderRadius: 12, border: selectedSub?.id === sub.id ? "1px solid #0891B2" : "1px solid #CFFAFE", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: selectedSub?.id === sub.id ? "#fff" : "#0F172A" }}>{sub.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {method === m.id && m.id === "qris" && (
          <div style={{ padding: "0 16px 16px", background: "#ECFEFF", animation: "fadeUp 0.3s ease" }}>
            <p style={{ fontSize: 12, color: "#0891B2", fontWeight: 600 }}>Silakan klik Lanjut Pembayaran untuk melihat kode QRIS.</p>
          </div>
        )}
      </div>
    ))}
  </>
);

const PaymentInstructionsBox = ({ method, selectedSub, finalTotal, uniqueCode }) => (
  <>
    {method === "va" && selectedSub && (
      <div style={{ textAlign: "left", marginTop: 16 }}>
        <p style={{ fontSize: 13, color: "#0F172A", marginBottom: 12 }}>Transfer Virtual Account ({selectedSub.name}):</p>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>Majelis Ilmu - {selectedSub.name}</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#0891B2", marginTop: 4 }}>{selectedSub.code} 081234567890</p>
          </div>
          <button style={{ height: 32, padding: "0 12px", borderRadius: 8, background: "#F1F5F9", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#0F172A" }} onClick={(e) => copyToClipboard(`${selectedSub.code}081234567890`, e)}>
            <Copy size={14}/> Salin
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#FFFBEB", borderRadius: 8, marginTop: 8 }}>
          <Info size={16} color="#B45309" style={{flexShrink:0, marginTop: 2}}/>
          <p style={{ fontSize: 12, color: "#B45309", lineHeight: 1.5 }}>Pembayaran Anda akan otomatis terverifikasi oleh sistem dalam hitungan menit tanpa perlu konfirmasi manual.</p>
        </div>
        
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>Cara Pembayaran</p>
          {getVAInstructions(selectedSub.id).map((inst, i) => (
            <details key={i} style={{ marginBottom: 10, background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <summary style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#0F172A", cursor: "pointer", outline: "none", listStyle: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{inst.title}</span>
                  <ChevronDown size={18} color="#0891B2" />
                </div>
              </summary>
              <div style={{ padding: "0 16px 16px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                <ol style={{ paddingLeft: 16, margin: 0 }}>
                  {inst.steps.map((step, j) => <li key={j} style={{ paddingBottom: 6 }}>{step}</li>)}
                </ol>
              </div>
            </details>
          ))}
        </div>
      </div>
    )}

    {method === "qris" && (
      <div>
        <p style={{ fontSize: 13, color: "#0F172A", marginBottom: 16 }}>Scan QR Code di bawah ini menggunakan aplikasi E-Wallet atau M-Banking Anda.</p>
        <div style={{ width: 180, height: 180, background: "#fff", border: "4px solid #E2E8F0", borderRadius: 16, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ width: "80%", height: "80%", background: "repeating-linear-gradient(45deg, #E2E8F0 0, #E2E8F0 10px, transparent 10px, transparent 20px), repeating-linear-gradient(-45deg, #E2E8F0 0, #E2E8F0 10px, transparent 10px, transparent 20px)" }}></div>
          <div style={{ position: "absolute", background: "#fff", padding: 8, borderRadius: 12 }}>
            <Moon size={32} color="#0891B2" />
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 16 }}>QRIS atas nama <span style={{fontWeight: 600}}>Majelis Ilmu</span></p>
      </div>
    )}

    {method === "transfer" && selectedSub && (
      <div style={{ textAlign: "left", marginTop: 16 }}>
        <p style={{ fontSize: 13, color: "#0F172A", marginBottom: 12 }}>Transfer ke rekening berikut:</p>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{selectedSub.name} - {selectedSub.owner}</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#0891B2", marginTop: 4 }}>{selectedSub.acc}</p>
          </div>
          <button style={{ height: 32, padding: "0 12px", borderRadius: 8, background: "#F1F5F9", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#0F172A" }} onClick={(e) => copyToClipboard(selectedSub.acc.replace(/\s/g, ''), e)}>
            <Copy size={14}/> Salin
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#EF4444", marginTop: 8, lineHeight: 1.5 }}>* Pastikan nominal transfer pas hingga 3 digit terakhir <span style={{fontWeight: 600}}>({uniqueCode})</span> untuk proses verifikasi otomatis.</p>
      </div>
    )}

    {method === "ewallet" && selectedSub && (
      <div style={{ textAlign: "left", marginTop: 16 }}>
        <p style={{ fontSize: 13, color: "#0F172A", marginBottom: 16 }}>Instruksi Pembayaran {selectedSub.name}:</p>
        <ol style={{ paddingLeft: 20, fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
          <li>Buka aplikasi <span style={{fontWeight: 600}}>{selectedSub.name}</span>.</li>
          <li>Pilih menu <span style={{fontWeight: 600}}>Transfer / Kirim Dana</span>.</li>
          <li>Masukkan nomor tujuan <span style={{fontWeight: 600}}>0812-3456-7890</span> (a.n Majelis Ilmu).</li>
          <li>Masukkan nominal persis <span style={{fontWeight: 600}}>{fmt(finalTotal)}</span>.</li>
          <li>Konfirmasi dan selesaikan pembayaran.</li>
        </ol>
      </div>
    )}
  </>
);


// ── App ──
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [tab, setTab] = useState("home");
  const [user, setUser] = useState(null); // null means not logged in
  const [selectedKajian, setSelectedKajian] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [catKajian, setCatKajian] = useState("Semua");
  const [catShop, setCatShop] = useState("Semua");
  const [myKajian, setMyKajian] = useState([]);
  const [orders, setOrders] = useState([
    { id: "ORD-98273", date: "1 Mei 2026", items: [{ name: "Gamis Premium Al-Haramain", qty: 1, price: 389000, image: "https://images.pexels.com/photos/935985/pexels-photo-935985.jpeg?auto=compress&cs=tinysrgb&w=600" }], total: 389000, status: "shipped" },
    { id: "ORD-12837", date: "28 April 2026", items: [{ name: "Tasbih Digital Premium", qty: 2, price: 65000, image: "https://images.pexels.com/photos/8164585/pexels-photo-8164585.jpeg?auto=compress&cs=tinysrgb&w=600" }], total: 130000, status: "completed" }
  ]);
  const [notifs, setNotifs] = useState([
    { id: 1, text: "Kajian Fiqh Muamalah besok Jum'at 19:30 WIB", time: "1 jam lalu", read: false },
    { id: 2, text: "Pesanan Gamis Premium sedang dikirim", time: "3 jam lalu", read: false },
    { id: 3, text: "Selamat bergabung di Majelis Ilmu!", time: "1 hari lalu", read: true },
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  // State for login flow
  const [pendingAction, setPendingAction] = useState(null); // { type: 'kajian'|'checkout', data: any }

  useEffect(() => {
    const t = setTimeout(() => setScreen("main"), 2200);
    return () => clearTimeout(t);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (product) => {
    setCart((p) => {
      const exist = p.find((i) => i.id === product.id);
      if (exist) return p.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...p, { ...product, qty: 1 }];
    });
    showToast("Ditambahkan ke keranjang");
  };

  const joinKajian = (kajian, paidAmount = 0) => {
    if (!user) { 
      setPendingAction({ type: 'kajian', data: { kajian, paidAmount } });
      setScreen("login"); 
      return; 
    }
    processJoinKajian(kajian, paidAmount);
  };

  const processJoinKajian = (kajian, paidAmount) => {
    if (!myKajian.find((k) => k.id === kajian.id)) {
      setMyKajian((p) => [...p, kajian]);
      setNotifs((prev) => [
        { id: Date.now(), text: `Pendaftaran ${kajian.title} berhasil! Tiket & jadwal dikirim via WA`, time: "Baru saja", read: false },
        ...prev
      ]);
      showToast(paidAmount > 0 ? "Pembayaran berhasil! Tiket dikirim via WA" : "Berhasil daftar! Tiket dikirim via WA");
    }
    setScreen("main");
    setSelectedKajian(null);
  };

  const initiateCheckout = () => {
    if (!user) {
      setPendingAction({ type: 'checkout' });
      setScreen("login");
      return;
    }
    setScreen("checkout");
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const unreadNotifs = notifs.filter((n) => !n.read).length;

  const navigateToMain = () => {
    setScreen("main");
    setSelectedKajian(null);
    setSelectedProduct(null);
  };

  // Simulated Google SSO Logic - Bypass registration completely
  const handleGoogleLogin = () => {
    const simulatedGoogleData = {
      name: "Abdullah Fulan",
      email: "abdullah@gmail.com",
      phone: "081234567890"
    };
    
    setUser(simulatedGoogleData);
    showToast("Berhasil masuk sebagai " + simulatedGoogleData.name);
    
    // Resume pending action if exists
    if (pendingAction) {
      if (pendingAction.type === 'kajian') {
        setScreen("kajian-detail");
      } else if (pendingAction.type === 'checkout') {
        setScreen("checkout");
      }
      setPendingAction(null);
    } else {
      setScreen("main");
    }
  };

  // ── Screens ──
  if (screen === "splash") return <Splash />;
  
  if (screen === "login") return (
    <LoginScreen 
      onBack={() => { 
        setPendingAction(null); 
        setScreen("main"); 
        if (selectedKajian) setScreen("kajian-detail");
      }} 
      onGoogleLogin={handleGoogleLogin} 
    />
  );

  if (screen === "kajian-detail") return <KajianDetail kajian={selectedKajian} onClose={navigateToMain} onJoin={joinKajian} joined={user && !!myKajian.find((k) => k.id === selectedKajian?.id)} user={user} />;
  if (screen === "product-detail") return <ProductDetail product={selectedProduct} onClose={navigateToMain} onAdd={addToCart} />;

  if (screen === "checkout") return (
    <CheckoutPage 
      cart={cart} 
      total={cartTotal} 
      onClose={() => setScreen("main")} 
      onDone={(finalTotal) => { 
        const newOrder = {
          id: `ORD-${Math.floor(Math.random() * 1000000)}`,
          date: "4 Mei 2026", 
          items: [...cart],
          total: finalTotal,
          status: "packed" 
        };
        setOrders([newOrder, ...orders]);
        setCart([]); 
        setScreen("main");
        setTab("home");
        showToast("Pesanan berhasil! Konfirmasi dikirim via WA"); 
      }} 
    />
  );

  // ── Main App ──
  return (
    <div style={styles.container}>
      <style>{FONTS_CSS}{`
        *, body { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; font-family: 'Source Sans Pro', sans-serif !important; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { display: none; }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={styles.toast}>
          <CheckCircle2 size={16} color="#fff" style={{flexShrink: 0}} />
          <span style={{ fontSize: 14 }}>{toast}</span>
        </div>
      )}

      {/* Notification Panel */}
      {showNotif && <NotifPanel notifs={notifs} setNotifs={setNotifs} onClose={() => setShowNotif(false)} />}

      {/* Search Overlay */}
      {showSearch && <SearchOverlay query={searchQuery} setQuery={setSearchQuery} onClose={() => { setShowSearch(false); setSearchQuery(""); }} kajian={KAJIAN_DATA} products={PRODUCTS_DATA} onKajian={(k) => { setSelectedKajian(k); setScreen("kajian-detail"); setShowSearch(false); setSearchQuery(""); }} onProduct={(p) => { setSelectedProduct(p); setScreen("product-detail"); setShowSearch(false); setSearchQuery(""); }} />}

      {/* Tab Content */}
      <div style={styles.content}>
        {tab === "home" && <HomeTab user={user} kajian={KAJIAN_DATA} onKajian={(k) => { setSelectedKajian(k); setScreen("kajian-detail"); }} onProduct={(p) => { setSelectedProduct(p); setScreen("product-detail"); }} onNotif={() => setShowNotif(true)} unread={unreadNotifs} onSearch={() => setShowSearch(true)} myKajian={myKajian} onLoginClick={() => setScreen("login")} />}
        {tab === "kajian" && <KajianTab kajian={KAJIAN_DATA} cat={catKajian} setCat={setCatKajian} onKajian={(k) => { setSelectedKajian(k); setScreen("kajian-detail"); }} />}
        {tab === "shop" && <ShopTab products={PRODUCTS_DATA} cat={catShop} setCat={setCatShop} onProduct={(p) => { setSelectedProduct(p); setScreen("product-detail"); }} onAdd={addToCart} />}
        {tab === "cart" && <CartTab cart={cart} setCart={setCart} total={cartTotal} onCheckout={initiateCheckout} />}
        {tab === "profile" && <ProfileTab user={user} myKajian={myKajian} orders={orders} onKajian={(k) => { setSelectedKajian(k); setScreen("kajian-detail"); }} onLogout={() => { setUser(null); setTab("home"); }} onLoginClick={() => setScreen("login")} />}
      </div>

      {/* Bottom Nav */}
      <nav style={styles.nav}>
        {[
          { key: "home", Icon: Home, label: "Beranda" },
          { key: "kajian", Icon: BookOpen, label: "Kajian" },
          { key: "shop", Icon: ShoppingBag, label: "Toko" },
          { key: "cart", Icon: ShoppingCart, label: "Keranjang", badge: cartCount },
          { key: "profile", Icon: User, label: "Profil" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ ...styles.navBtn, color: tab === t.key ? "#0891B2" : "#94A3B8" }}>
            <div style={{ position: "relative" }}>
              <t.Icon size={24} color={tab === t.key ? "#0891B2" : "#94A3B8"} strokeWidth={tab === t.key ? 2.5 : 2} />
              {t.badge > 0 && <span style={styles.badge}>{t.badge}</span>}
            </div>
            <span style={{ fontSize: 11, fontWeight: tab === t.key ? 600 : 500, marginTop: 4 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Splash Screen ──
function Splash() {
  return (
    <div style={{ ...styles.container, background: "linear-gradient(160deg, #0E7490 0%, #06B6D4 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <style>{`@keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.1); opacity: 1; } }`}</style>
      <div style={{ animation: "breathe 2.5s ease-in-out infinite", marginBottom: 20 }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.4)", backdropFilter: "blur(8px)" }}>
          <Moon size={48} color="#fff" fill="#fff" />
        </div>
      </div>
      <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 700, letterSpacing: 1 }}>Majelis Ilmu</h1>
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 8, letterSpacing: 4, textTransform: "uppercase", fontWeight: 600 }}>Menuntut Ilmu Tanpa Batas</p>
      <div style={{ marginTop: 50, width: 48, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: "50%", height: "100%", background: "#fff", borderRadius: 4, animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%", backgroundImage: "linear-gradient(90deg, #fff, rgba(255,255,255,0.4), #fff)" }} />
      </div>
    </div>
  );
}

// ── Login Screen (SSO Simulation) ──
function LoginScreen({ onBack, onGoogleLogin }) {
  return (
    <div style={{ ...styles.container, background: "#F8FAFC", display: "flex", flexDirection: "column", padding: "0 24px" }}>
      <div style={{ paddingTop: 20 }}>
        <button onClick={onBack} style={styles.backBtn}><ChevronLeft size={20}/> Batal</button>
      </div>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeUp 0.5s ease" }}>
        <div style={{ width: 100, height: 100, borderRadius: 30, background: "linear-gradient(135deg, #CFFAFE, #A5F3FC)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", boxShadow: "0 12px 40px rgba(6,182,212,0.15)" }}>
          <LogIn size={48} color="#0891B2" strokeWidth={1.5} />
        </div>
        
        <h2 style={{ fontSize: 26, color: "#0F172A", marginBottom: 12, fontWeight: 700, textAlign: "center" }}>Masuk ke Akun Anda</h2>
        <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.6, textAlign: "center", marginBottom: 40 }}>Untuk mendaftar kajian atau checkout pesanan, silakan login terlebih dahulu.</p>
        
        <div style={{ width: "100%", maxWidth: 320 }}>
          <button onClick={onGoogleLogin} style={{ ...styles.secondaryBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "#fff", borderColor: "#E2E8F0", color: "#0F172A", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.94 16.79 15.79 17.56V20.33H19.34C21.41 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.34 20.33L15.79 17.56C14.77 18.24 13.5 18.66 12 18.66C9.09 18.66 6.63 16.69 5.73 14.04H2.07V16.89C3.91 20.55 8.1 23 12 23Z" fill="#34A853"/>
              <path d="M5.73 14.04C5.5 13.36 5.37 12.63 5.37 11.88C5.37 11.13 5.5 10.4 5.73 9.72V6.87H2.07C1.31 8.38 0.87 10.08 0.87 11.88C0.87 13.68 1.31 15.38 2.07 16.89L5.73 14.04Z" fill="#FBBC05"/>
              <path d="M12 5.34C13.62 5.34 15.06 5.89 16.2 6.98L19.42 3.76C17.46 1.93 14.97 0.88 12 0.88C8.1 0.88 3.91 3.33 2.07 6.87L5.73 9.72C6.63 7.07 9.09 5.34 12 5.34Z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Home Tab ──
function HomeTab({ user, kajian, onKajian, onProduct, onNotif, unread, onSearch, myKajian, onLoginClick }) {
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
            <button onClick={onSearch} style={styles.iconBtn}><Search size={20} color="#fff"/></button>
            {user ? (
              <button onClick={onNotif} style={{ ...styles.iconBtn, position: "relative" }}>
                <Bell size={20} color="#fff"/>
                {unread > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, border: "2px solid #155E75" }}>{unread}</span>}
              </button>
            ) : (
              <button onClick={onLoginClick} style={{ ...styles.iconBtn, background: "#fff", color: "#0891B2" }}>
                <LogIn size={20} />
              </button>
            )}
          </div>
        </div>
        
        {/* Quick Stats or Login Prompt */}
        {user ? (
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {[
              { n: myKajian.length, l: "Kajian Diikuti" },
              { n: "5", l: "Kajian Minggu Ini" },
              { n: "12", l: "Produk Baru" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "14px 10px", textAlign: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: "#fff", fontSize: 22, fontWeight: 600 }}>{s.n}</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 4, fontWeight: 500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 24, background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 16, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div>
               <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Belum Masuk?</p>
               <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }}>Login untuk daftar kajian & belanja</p>
             </div>
             <button onClick={onLoginClick} style={{ padding: "8px 16px", background: "#fff", color: "#0891B2", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none" }}>Masuk</button>
          </div>
        )}
      </div>

      {/* Upcoming Kajian */}
      <div style={{ padding: "28px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, color: "#0F172A", fontWeight: 600 }}>Kajian Terdekat</h2>
          <span style={{ fontSize: 13, color: "#0891B2", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center" }}>Lihat Semua <ChevronRight size={16}/></span>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }}>
          {upcoming.map((k, i) => (
            <div key={k.id} onClick={() => onKajian(k)} style={{ minWidth: 260, background: "#fff", borderRadius: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #F1F5F9", cursor: "pointer", animation: `slideIn 0.4s ease ${i * 0.1}s both`, overflow: "hidden" }}>
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
                <div style={{ marginTop: 16, height: 6, borderRadius: 3, background: "#F1F5F9", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: k.filled / k.spot > 0.8 ? "#EF4444" : "#0891B2", width: `${(k.filled / k.spot) * 100}%`, transition: "width 0.5s" }} />
                </div>
                <p style={{ fontSize: 11, color: "#64748B", marginTop: 8, fontWeight: 500 }}>{k.filled}/{k.spot} jamaah terdaftar</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Tickets */}
      {user && myKajian.length > 0 && (
        <div style={{ padding: "24px 20px 0" }}>
          <h2 style={{ fontSize: 18, color: "#0F172A", marginBottom: 16, fontWeight: 600 }}>Tiket Saya</h2>
          {myKajian.map((k) => (
            <div key={k.id} onClick={() => onKajian(k)} style={{ background: "linear-gradient(135deg, #0E7490, #06B6D4)", borderRadius: 16, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: "0 6px 16px rgba(6,182,212,0.2)" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <img src={k.image} alt={k.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{k.title}</h4>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4, fontWeight: 500 }}>{k.date} • {k.time}</p>
              </div>
              <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 20 }}>
                <span style={{ fontSize: 11, color: "#0891B2", fontWeight: 600 }}>TIKET</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Featured Products */}
      <div style={{ padding: "24px 20px 0" }}>
        <h2 style={{ fontSize: 18, color: "#0F172A", marginBottom: 16, fontWeight: 600 }}>Produk Pilihan</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {PRODUCTS_DATA.slice(0, 4).map((p, i) => (
            <div key={p.id} onClick={() => onProduct(p)} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #F1F5F9", cursor: "pointer", animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}>
              <div style={{ height: 140, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                 <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", lineHeight: 1.4, height: 34, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#0891B2", marginTop: 8 }}>{fmt(p.price)}</p>
                {p.oldPrice && <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through", marginTop: 2 }}>{fmt(p.oldPrice)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Kajian Tab ──
function KajianTab({ kajian, cat, setCat, onKajian }) {
  const filtered = cat === "Semua" ? kajian : kajian.filter((k) => k.category === cat);
  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontSize: 26, color: "#0F172A", fontWeight: 700 }}>Jadwal Kajian</h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Pilih kajian dan daftar sekarang</p>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "20px", overflowX: "auto" }}>
        {CATEGORIES_KAJIAN.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{ ...styles.chip, background: cat === c ? "#0891B2" : "#fff", color: cat === c ? "#fff" : "#475569", border: cat === c ? "1px solid #0891B2" : "1px solid #CBD5E1" }}>{c}</button>
        ))}
      </div>
      <div style={{ padding: "0 20px" }}>
        {filtered.map((k, i) => (
          <div key={k.id} onClick={() => onKajian(k)} style={{ background: "#fff", borderRadius: 20, padding: 16, marginBottom: 16, boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #F1F5F9", cursor: "pointer", animation: `fadeUp 0.3s ease ${i * 0.06}s both`, display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 68, height: 68, borderRadius: 16, background: "#ECFEFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              <img src={k.image} alt={k.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>{k.title}</h3>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 20, background: k.type === "free" ? "#F0FDF4" : "#FFF7ED", color: k.type === "free" ? "#15803D" : "#C2410C", flexShrink: 0, marginLeft: 8 }}>
                  {k.type === "free" ? "INFAQ" : fmt(k.price)}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 4, fontWeight: 500 }}>{k.ustadz}</p>
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} color="#0891B2" /> {k.date}</span>
                <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} color="#0891B2" /> {k.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shop Tab ──
function ShopTab({ products, cat, setCat, onProduct, onAdd }) {
  const filtered = cat === "Semua" ? products : products.filter((p) => p.category === cat);
  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontSize: 26, color: "#0F172A", fontWeight: 700 }}>Toko Islami</h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Produk berkualitas untuk muslim</p>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "20px", overflowX: "auto" }}>
        {CATEGORIES_SHOP.map((c) => (
          <button key={c} onClick={() => setCat(c)} style={{ ...styles.chip, background: cat === c ? "#0891B2" : "#fff", color: cat === c ? "#fff" : "#475569", border: cat === c ? "1px solid #0891B2" : "1px solid #CBD5E1" }}>{c}</button>
        ))}
      </div>
      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {filtered.map((p, i) => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #F1F5F9", animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
            <div onClick={() => onProduct(p)} style={{ height: 140, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              {p.oldPrice && <span style={{ position: "absolute", top: 10, left: 10, background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 12, zIndex: 5 }}>SALE</span>}
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.4, height: 36, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>{p.rating} • {p.sold} terjual</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#0891B2" }}>{fmt(p.price)}</p>
                  {p.oldPrice && <p style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through", marginTop: 2 }}>{fmt(p.oldPrice)}</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); onAdd(p); }} style={{ width: 36, height: 36, borderRadius: 12, background: "#0891B2", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(8,145,178,0.3)" }}>
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Cart Tab ──
function CartTab({ cart, setCart, total, onCheckout }) {
  if (cart.length === 0) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", padding: 20 }}>
      <div style={{ width: 100, height: 100, borderRadius: 30, background: "#ECFEFF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <ShoppingCart size={48} color="#0891B2" />
      </div>
      <h2 style={{ fontSize: 22, color: "#0F172A", fontWeight: 600 }}>Keranjang Kosong</h2>
      <p style={{ fontSize: 14, color: "#64748B", marginTop: 8, textAlign: "center" }}>Yuk belanja produk islami berkualitas!</p>
    </div>
  );
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontSize: 26, color: "#0F172A", fontWeight: 700 }}>Keranjang</h1>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>{cart.length} item tersimpan</p>
      </div>
      <div style={{ padding: "20px" }}>
        {cart.map((item) => (
          <div key={item.id} style={{ display: "flex", gap: 16, background: "#fff", borderRadius: 20, padding: 16, marginBottom: 16, boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #F1F5F9", alignItems: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{item.name}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0891B2", marginTop: 6 }}>{fmt(item.price)}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setCart(cart.map((c) => c.id === item.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))} style={styles.qtyBtn}><Minus size={16}/></button>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", minWidth: 20, textAlign: "center" }}>{item.qty}</span>
              <button onClick={() => setCart(cart.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))} style={styles.qtyBtn}><Plus size={16}/></button>
            </div>
          </div>
        ))}
      </div>
      {/* Checkout Bar */}
      <div style={{ position: "fixed", bottom: 72, left: 0, right: 0, maxWidth: 430, margin: "0 auto", background: "#fff", borderTop: "1px solid #F1F5F9", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
        <div>
          <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>Total Belanja</p>
          <p style={{ fontSize: 22, fontWeight: 600, color: "#0F172A", marginTop: 2 }}>{fmt(total)}</p>
        </div>
        <button onClick={onCheckout} style={{ ...styles.primaryBtn, width: "auto", padding: "14px 32px", display: "flex", alignItems: "center", gap: 8 }}>
          Checkout <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Profile Tab ──
function ProfileTab({ user, myKajian, orders, onKajian, onLogout, onLoginClick }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [showLogout, setShowLogout] = useState(false);

  if (!user) {
    return (
      <div style={{ paddingBottom: 20, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
         <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#CFFAFE", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
           <User size={48} color="#0891B2" strokeWidth={2}/>
         </div>
         <h2 style={{ fontSize: 22, color: "#0F172A", fontWeight: 600, marginBottom: 8 }}>Belum Masuk</h2>
         <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", padding: "0 40px", marginBottom: 32 }}>Silakan login untuk melihat riwayat pesanan, jadwal kajian, dan pengaturan profil Anda.</p>
         <button onClick={onLoginClick} style={{ ...styles.primaryBtn, width: "80%" }}>Masuk ke Akun</button>
      </div>
    );
  }

  const handleMenuClick = (item) => {
    if (item.includes("Keluar")) {
      setShowLogout(true);
    } else {
      setActiveMenu(item);
    }
  };

  const menuItems = [
    { label: "Riwayat Pesanan", Icon: Package },
    { label: "Jadwal Kajian Saya", Icon: Calendar },
    { label: "Metode Pembayaran", Icon: Wallet },
    { label: "Pengaturan Notifikasi", Icon: Bell },
    { label: "Bantuan", Icon: Headphones },
    { label: "Keluar Akun", Icon: LogOut, danger: true },
  ];

  return (
    <div style={{ paddingBottom: 20 }}>
      <div style={{ background: "linear-gradient(160deg, #155E75, #06B6D4)", padding: "32px 20px 40px", borderRadius: "0 0 32px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", border: "4px solid rgba(255,255,255,0.3)" }}>
          <span style={{ fontSize: 32, fontWeight: 600, color: "#155E75" }}>{user.name.charAt(0)}</span>
        </div>
        <h2 style={{ color: "#fff", fontSize: 22, marginTop: 16, fontWeight: 600 }}>{user.name}</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 6, fontWeight: 500 }}>{user.email}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 600 }}>{myKajian.length}</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 4, fontWeight: 500 }}>Kajian</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 600 }}>3</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 4, fontWeight: 500 }}>Pesanan</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", height: 28, alignItems: "center" }}>
              <Star size={24} color="#FBBF24" fill="#FBBF24" />
            </div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 4, fontWeight: 500 }}>Status</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "24px 20px" }}>
        {menuItems.map((item, i) => (
          <button key={i} onClick={() => handleMenuClick(item.label)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", background: "none", border: "none", borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <item.Icon size={20} color={item.danger ? "#EF4444" : "#0891B2"} />
              <span style={{ fontSize: 15, color: item.danger ? "#EF4444" : "#0F172A", fontWeight: 500 }}>{item.label}</span>
            </div>
            <ChevronRight size={20} color="#CBD5E1" />
          </button>
        ))}
      </div>

      {activeMenu && (
        <ProfileSubPage
          title={activeMenu}
          onClose={() => setActiveMenu(null)}
          myKajian={myKajian}
          orders={orders}
          onKajian={(k) => { setActiveMenu(null); onKajian(k); }}
        />
      )}

      {showLogout && (
        <div style={{ ...styles.modal, zIndex: 400 }}>
          <div style={{ background: "#fff", padding: 32, borderRadius: 24, width: "85%", maxWidth: 320, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <LogOut size={32} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: 20, color: "#0F172A", fontWeight: 600 }}>Keluar Akun?</h3>
            <p style={{ fontSize: 14, color: "#64748B", marginTop: 8, marginBottom: 28, lineHeight: 1.5 }}>Apakah Anda yakin ingin keluar dari aplikasi Majelis Ilmu?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowLogout(false)} style={{ ...styles.secondaryBtn, padding: "14px", flex: 1 }}>Batal</button>
              <button onClick={onLogout} style={{ ...styles.primaryBtn, padding: "14px", flex: 1, background: "#EF4444", boxShadow: "none", borderColor: "transparent" }}>Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSubPage({ title, onClose, myKajian, orders, onKajian }) {
  const cleanTitle = title.replace(/[^a-zA-Z\s]/g, '').trim();
  return (
    <div style={styles.modal}>
      <div style={{ ...styles.modalContent, height: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, background: "#F8FAFC", zIndex: 10 }}>
          <button onClick={onClose} style={{...styles.backBtn, padding: 0}}><ChevronLeft size={24} color="#0F172A"/></button>
          <h2 style={{ fontSize: 18, color: "#0F172A", fontWeight: 600 }}>{cleanTitle}</h2>
        </div>
        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
          {title.includes("Jadwal Kajian") && (
            myKajian.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94A3B8", marginTop: 60 }}>
                <Calendar size={64} style={{ margin: "0 auto" }} />
                <p style={{ fontSize: 15, marginTop: 16, fontWeight: 500 }}>Belum ada jadwal kajian.</p>
              </div>
            ) : (
              myKajian.map((k) => (
                <div key={k.id} onClick={() => onKajian(k)} style={{ background: "linear-gradient(135deg, #0E7490, #06B6D4)", borderRadius: 16, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", boxShadow: "0 4px 12px rgba(6,182,212,0.15)" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <img src={k.image} alt={k.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{k.title}</h4>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 6, fontWeight: 500 }}><Calendar size={12} style={{display:"inline"}}/> {k.date} • {k.time}</p>
                  </div>
                </div>
              ))
            )
          )}

          {title.includes("Riwayat Pesanan") && (
            orders.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94A3B8", marginTop: 60 }}>
                <Package size={64} style={{ margin: "0 auto" }} />
                <p style={{ fontSize: 15, marginTop: 16, fontWeight: 500 }}>Belum ada riwayat pesanan.</p>
              </div>
            ) : (
              orders.map((ord) => {
                const styleStatus = getStatusStyle(ord.status);
                const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === ord.status);
                
                return (
                  <div key={ord.id} style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 16, border: "1px solid #F1F5F9", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: 16, marginBottom: 16 }}>
                      <div>
                        <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{ord.date}</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginTop: 4 }}>{ord.id}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 20, height: "fit-content", background: styleStatus.bg, color: styleStatus.color }}>
                        {styleStatus.label}
                      </span>
                    </div>
                    
                    {/* Items Summary */}
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <img src={ord.items[0].image} alt="order" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{ord.items[0].name}</p>
                        <p style={{ fontSize: 12, color: "#64748B", marginTop: 4, fontWeight: 500 }}>
                          {ord.items.length > 1 ? `+ ${ord.items.length - 1} produk lainnya` : `${ord.items[0].qty} x ${fmt(ord.items[0].price)}`}
                        </p>
                      </div>
                    </div>

                    {/* Tracking Steps UI */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, paddingTop: 20, borderTop: "1px dashed #E2E8F0", position: "relative" }}>
                       <div style={{ position: "absolute", top: 31, left: 30, right: 30, height: 2, background: "#E2E8F0", zIndex: 0 }} />
                       {STATUS_STEPS.map((step, idx) => {
                          const isActive = currentStepIdx >= idx;
                          return (
                            <div key={step.key} style={{ textAlign: "center", zIndex: 1, width: 60 }}>
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: isActive ? "#0891B2" : "#F1F5F9", color: isActive ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", transition: "all 0.3s" }}>
                                 {isActive ? <Check size={14} strokeWidth={3}/> : <span style={{fontSize: 10, fontWeight: 600}}>{idx + 1}</span>}
                              </div>
                              <p style={{ fontSize: 10, color: isActive ? "#0F172A" : "#64748B", marginTop: 8, fontWeight: isActive ? 600 : 500 }}>{step.label}</p>
                            </div>
                          )
                       })}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #F1F5F9" }}>
                      <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>Total Belanja</p>
                      <p style={{ fontSize: 16, fontWeight: 600, color: "#0891B2" }}>{fmt(ord.total)}</p>
                    </div>
                  </div>
                );
              })
            )
          )}

          {title.includes("Metode Pembayaran") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["QRIS", "Transfer Bank", "E-Wallet"].map(m => (
                <div key={m} style={{ background: "#fff", padding: 18, borderRadius: 16, border: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                  <span style={{ fontSize: 15, color: "#0F172A", fontWeight: 600 }}>{m}</span>
                  <span style={{ color: "#0891B2", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    Terhubung <CheckCircle2 size={16} />
                  </span>
                </div>
              ))}
            </div>
          )}

          {title.includes("Notifikasi") && (
            <div style={{ background: "#fff", padding: 20, borderRadius: 16, border: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div>
                <p style={{ fontSize: 15, color: "#0F172A", fontWeight: 600 }}>Pesan WhatsApp</p>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>Kirim tiket & info via WA</p>
              </div>
              <div style={{ width: 48, height: 26, background: "#0891B2", borderRadius: 16, position: "relative", cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, right: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
              </div>
            </div>
          )}

          {title.includes("Bantuan") && (
            <div style={{ textAlign: "center", marginTop: 60 }}>
              <Headphones size={64} color="#0891B2" style={{ margin: "0 auto" }} />
              <p style={{ fontSize: 15, color: "#0F172A", marginTop: 24, marginBottom: 32, fontWeight: 500 }}>Ada kendala? Kami siap membantu.</p>
              <button style={{ ...styles.primaryBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "16px 24px" }}>
                <MessageCircle size={20} /> Hubungi CS (WhatsApp)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Kajian Detail Page (Standalone) ──
function KajianDetail({ kajian, onClose, onJoin, joined, user }) {
  const [step, setStep] = useState(0);
  const [infaq, setInfaq] = useState(0);
  const [method, setMethod] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [uniqueCode] = useState(() => Math.floor(Math.random() * 900) + 100);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isFree = kajian.type === "free";
  const totalToPay = isFree ? infaq : kajian.price;
  const finalTotal = method === "transfer" ? totalToPay + uniqueCode : totalToPay;

  const handleProceed = () => {
    if (!user) {
       onJoin(kajian, totalToPay); // This will trigger login screen
       return;
    }
    
    if (totalToPay === 0) {
      onJoin(kajian, 0); 
    } else {
      setStep(1);
      window.scrollTo(0, 0);
    }
  };

  const handleSuccess = () => {
    onJoin(kajian, finalTotal);
  };

  if (step === 3) return (
    <div style={styles.container}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", minHeight: "100vh", background: "#fff" }}>
        <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <CheckCircle2 size={48} color="#15803D" />
        </div>
        <h2 style={{ fontSize: 24, color: "#0F172A", fontWeight: 600 }}>Pendaftaran Berhasil!</h2>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 12, lineHeight: 1.7 }}>Tiket & jadwal kajian akan dikirim ke WhatsApp kamu</p>
        <p style={{ fontSize: 28, fontWeight: 600, color: "#0891B2", marginTop: 24 }}>{fmt(finalTotal)}</p>
        <button onClick={handleSuccess} style={{ ...styles.primaryBtn, marginTop: 40 }}>Kembali ke Beranda</button>
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={styles.container}>
      <div style={{ padding: 24, minHeight: "100vh", background: "#fff" }}>
        <button onClick={() => setStep(1)} style={styles.backBtn}><ChevronLeft size={20}/> Kembali</button>
        <h2 style={{ fontSize: 24, color: "#0F172A", marginTop: 20, fontWeight: 600 }}>Selesaikan Pembayaran</h2>

        <div style={{ background: "#F8FAFC", borderRadius: 20, padding: 24, marginTop: 24, textAlign: "center", border: "1px solid #F1F5F9" }}>
          <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Total Tagihan</p>
          <p style={{ fontSize: 32, fontWeight: 600, color: "#0891B2", margin: "12px 0" }}>{fmt(finalTotal)}</p>

          <PaymentInstructionsBox method={method} selectedSub={selectedSub} finalTotal={finalTotal} uniqueCode={uniqueCode} />
        </div>

        <button onClick={() => setStep(3)} style={{ ...styles.primaryBtn, marginTop: 24, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          Saya Sudah Bayar <CheckCircle2 size={18} />
        </button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={styles.container}>
      <div style={{ padding: 24, minHeight: "100vh", background: "#fff" }}>
        <button onClick={() => setStep(0)} style={styles.backBtn}><ChevronLeft size={20}/> Kembali</button>
        <h2 style={{ fontSize: 24, color: "#0F172A", marginTop: 20, fontWeight: 600 }}>Pilih Pembayaran</h2>
        
        <div style={{ background: "#F8FAFC", borderRadius: 20, padding: 20, marginTop: 20, border: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#CFFAFE", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src={kajian.image} alt={kajian.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>{kajian.title}</p>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: 500 }}>{kajian.ustadz}</p>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, marginTop: 16, borderTop: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>Total Tagihan</span>
            <span style={{ fontSize: 20, fontWeight: 600, color: "#0891B2" }}>{fmt(totalToPay)}</span>
          </div>
        </div>
        
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginTop: 32, marginBottom: 16 }}>Metode Pembayaran</h3>
        
        <PaymentMethodAccordion method={method} setMethod={setMethod} selectedSub={selectedSub} setSelectedSub={setSelectedSub} />

        <button 
          onClick={() => { setStep(2); window.scrollTo(0,0); }} 
          disabled={!method || (method !== "qris" && !selectedSub)} 
          style={{ ...styles.primaryBtn, marginTop: 24, opacity: (!method || (method !== "qris" && !selectedSub)) ? 0.4 : 1 }}
        >
          Lanjut Pembayaran — {fmt(finalTotal)}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ ...styles.container, background: "#fff", overflowY: "auto", height: "100vh", display: "block" }}>
      <div style={{ height: 320, backgroundImage: `url(${kajian.image})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 24px", background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)", display: "flex", alignItems: "center" }}>
          <button onClick={onClose} style={{ ...styles.backBtn, color: "#fff", padding: 0 }}><ChevronLeft size={28}/></button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 24px 32px", background: "linear-gradient(to top, rgba(15,23,42,0.95), transparent)", color: "#fff" }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", display: "inline-block", marginBottom: 12 }}>{kajian.category.toUpperCase()}</span>
          <h2 style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}>{kajian.title}</h2>
          <p style={{ fontSize: 15, marginTop: 6, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>Oleh {kajian.ustadz}</p>
        </div>
      </div>
      
      <div style={{ padding: 24, background: "#fff", marginTop: -16, borderRadius: "24px 24px 0 0", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          {[
            { Icon: Calendar, label: "Tanggal", value: kajian.date },
            { Icon: Clock, label: "Waktu", value: kajian.time },
            { Icon: MapPin, label: "Lokasi", value: kajian.location },
            { Icon: Wallet, label: "Biaya", value: isFree ? "Infaq (Gratis)" : fmt(kajian.price) },
          ].map((d, i) => (
            <div key={i} style={{ background: "#F8FAFC", borderRadius: 16, padding: 16, border: "1px solid #F1F5F9" }}>
              <d.Icon size={22} color="#0891B2" />
              <p style={{ fontSize: 11, color: "#64748B", marginTop: 8, fontWeight: 500 }}>{d.label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginTop: 4 }}>{d.value}</p>
            </div>
          ))}
        </div>
        
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>Deskripsi Kajian</h3>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>{kajian.desc}</p>
        
        <div style={{ marginTop: 24, height: 8, borderRadius: 4, background: "#F1F5F9", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 4, background: kajian.filled / kajian.spot > 0.8 ? "#EF4444" : "#0891B2", width: `${(kajian.filled / kajian.spot) * 100}%` }} />
        </div>
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 8, fontWeight: 500 }}>Kuota: {kajian.filled}/{kajian.spot} jamaah terdaftar (Sisa {kajian.spot - kajian.filled})</p>

        {isFree && !joined && (
          <div style={{ marginTop: 28, padding: 20, background: "#F8FAFC", borderRadius: 16, border: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={20} color="#EF4444" fill="#EF4444" />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Nominal Infaq (Opsional)</h3>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 4, fontWeight: 500 }}>Dukung kegiatan dakwah majelis ilmu</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[0, 25000, 50000].map(val => (
                <button key={val} onClick={() => setInfaq(val)} style={{ padding: "12px 4px", borderRadius: 12, border: infaq === val ? "2px solid #0891B2" : "1px solid #E2E8F0", background: infaq === val ? "#ECFEFF" : "#fff", color: infaq === val ? "#0891B2" : "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {val === 0 ? "Rp 0" : fmt(val)}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
              <span style={{ padding: "14px 16px", color: "#64748B", fontSize: 14, fontWeight: 600, background: "#F1F5F9" }}>Rp</span>
              <input type="number" value={infaq === 0 ? "" : infaq} onChange={(e) => setInfaq(e.target.value ? Math.max(0, parseInt(e.target.value) || 0) : 0)} placeholder="Nominal lainnya..." style={{ flex: 1, border: "none", background: "transparent", padding: "14px", fontSize: 14, color: "#0F172A", outline: "none", fontWeight: 600 }} />
            </div>
          </div>
        )}

        <div style={{ background: "#FFFBEB", borderRadius: 16, padding: 16, marginTop: 24, display: "flex", gap: 14, alignItems: "center", border: "1px solid #FEF3C7" }}>
          <Smartphone size={24} color="#D97706" style={{flexShrink: 0}} />
          <p style={{ fontSize: 12, color: "#B45309", lineHeight: 1.6, fontWeight: 500 }}>Tiket dan jadwal akan dikirim otomatis via WhatsApp setelah pendaftaran berhasil.</p>
        </div>
        
        <button onClick={handleProceed} disabled={joined} style={{ ...styles.primaryBtn, marginTop: 24, marginBottom: 40, ...(joined ? { background: "#D1FAE5", color: "#065F46", boxShadow: "none" } : {}) }}>
          {joined ? "Sudah Terdaftar" : totalToPay === 0 ? "Daftar Sekarang (Rp 0)" : `Bayar & Daftar — ${fmt(totalToPay)}`}
        </button>
      </div>
    </div>
  );
}

// ── Product Detail Page (Standalone) ──
function ProductDetail({ product, onClose, onAdd }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ ...styles.container, background: "#fff", overflowY: "auto", height: "100vh", display: "block" }}>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 24px", background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)", display: "flex", alignItems: "center", zIndex: 10 }}>
          <button onClick={onClose} style={{ ...styles.backBtn, color: "#fff", padding: 0 }}><ChevronLeft size={28}/></button>
        </div>
        <div style={{ height: 350, background: "#F8FAFC", overflow: "hidden" }}>
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
      
      <div style={{ padding: 24, background: "#fff", marginTop: -20, borderRadius: "24px 24px 0 0", position: "relative", zIndex: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 20, background: "#ECFEFF", color: "#0891B2", display: "inline-block" }}>{product.category}</span>
        <h2 style={{ fontSize: 26, color: "#0F172A", marginTop: 16, fontWeight: 600, lineHeight: 1.3 }}>{product.name}</h2>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Star size={16} color="#F59E0B" fill="#F59E0B" />
          <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{product.rating} • {product.sold} terjual</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 24 }}>
          <span style={{ fontSize: 32, fontWeight: 600, color: "#0891B2" }}>{fmt(product.price)}</span>
          {product.oldPrice && <span style={{ fontSize: 15, color: "#94A3B8", textDecoration: "line-through", fontWeight: 500 }}>{fmt(product.oldPrice)}</span>}
        </div>
        
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginTop: 32, marginBottom: 12 }}>Deskripsi Produk</h3>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>{product.desc}</p>
        
        <div style={{ background: "#FFFBEB", borderRadius: 16, padding: 16, marginTop: 24, display: "flex", gap: 14, alignItems: "center", border: "1px solid #FEF3C7" }}>
          <Package size={24} color="#D97706" style={{flexShrink: 0}} />
          <p style={{ fontSize: 12, color: "#B45309", lineHeight: 1.6, fontWeight: 500 }}>Konfirmasi pesanan & resi pengiriman dikirim otomatis via WhatsApp.</p>
        </div>
        
        <button onClick={() => { onAdd(product); onClose(); }} style={{ ...styles.primaryBtn, marginTop: 32, marginBottom: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
          <ShoppingCart size={20}/> Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}

// ── Checkout Page (Standalone) ──
function CheckoutPage({ cart, total, onClose, onDone, setCart }) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(null);
  const [uniqueCode] = useState(() => Math.floor(Math.random() * 900) + 100);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const finalTotal = method === "transfer" ? total + uniqueCode : total;

  if (step === 2) return (
    <div style={styles.container}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", minHeight: "100vh", background: "#fff" }}>
        <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <CheckCircle2 size={48} color="#15803D" />
        </div>
        <h2 style={{ fontSize: 24, color: "#0F172A", fontWeight: 600 }}>Pembayaran Berhasil!</h2>
        <p style={{ fontSize: 14, color: "#64748B", marginTop: 12, lineHeight: 1.7 }}>Konfirmasi & detail pesanan akan dikirim ke WhatsApp kamu</p>
        <p style={{ fontSize: 28, fontWeight: 600, color: "#0891B2", marginTop: 24 }}>{fmt(finalTotal)}</p>
        <button onClick={() => onDone(finalTotal)} style={{ ...styles.primaryBtn, marginTop: 40 }}>Kembali ke Beranda</button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={{ ...styles.container, background: "#fff", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: 24 }}>
        <button onClick={() => setStep(0)} style={styles.backBtn}><ChevronLeft size={20}/> Kembali</button>
        <h2 style={{ fontSize: 24, color: "#0F172A", marginTop: 20, fontWeight: 600 }}>Selesaikan Pembayaran</h2>

        <div style={{ background: "#F8FAFC", borderRadius: 20, padding: 24, marginTop: 24, textAlign: "center", border: "1px solid #F1F5F9" }}>
          <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Total Tagihan</p>
          <p style={{ fontSize: 32, fontWeight: 600, color: "#0891B2", margin: "12px 0" }}>{fmt(finalTotal)}</p>

          <PaymentInstructionsBox method={method} selectedSub={selectedSub} finalTotal={finalTotal} uniqueCode={uniqueCode} />
        </div>

        <button onClick={() => { setStep(2); window.scrollTo(0,0); }} style={{ ...styles.primaryBtn, marginTop: 24, marginBottom: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          Saya Sudah Bayar <CheckCircle2 size={18}/>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ ...styles.container, background: "#fff", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{ padding: 24 }}>
        <button onClick={onClose} style={styles.backBtn}><ChevronLeft size={20}/> Kembali</button>
        <h2 style={{ fontSize: 24, color: "#0F172A", marginTop: 20, fontWeight: 600 }}>Checkout</h2>
        
        <div style={{ background: "#F8FAFC", borderRadius: 20, padding: 20, marginTop: 24, border: "1px solid #F1F5F9" }}>
          {cart.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #E2E8F0" }}>
              <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{item.name} x{item.qty}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{fmt(item.price * item.qty)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, marginTop: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 600, color: "#0891B2" }}>{fmt(total)}</span>
          </div>
        </div>
        
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginTop: 32, marginBottom: 16 }}>Metode Pembayaran</h3>
        
        <PaymentMethodAccordion method={method} setMethod={setMethod} selectedSub={selectedSub} setSelectedSub={setSelectedSub} />

        <button 
          onClick={() => { setStep(1); window.scrollTo(0,0); }} 
          disabled={!method || (method !== "qris" && !selectedSub)} 
          style={{ ...styles.primaryBtn, marginTop: 24, marginBottom: 40, opacity: (!method || (method !== "qris" && !selectedSub)) ? 0.4 : 1 }}
        >
          Lanjut Pembayaran — {fmt(finalTotal)}
        </button>
      </div>
    </div>
  );
}

// ── Notif Panel ──
function NotifPanel({ notifs, setNotifs, onClose }) {
  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 24, color: "#0F172A", fontWeight: 600 }}>Notifikasi</h2>
            <button onClick={onClose} style={{...styles.backBtn, padding: 0}}><X size={24} color="#0F172A" /></button>
          </div>
          <div style={{ marginTop: 24 }}>
            {notifs.map((n) => (
              <div key={n.id} onClick={() => setNotifs(notifs.map((x) => x.id === n.id ? { ...x, read: true } : x))} style={{ padding: "16px 0", borderBottom: "1px solid #F1F5F9", display: "flex", gap: 14, alignItems: "start", cursor: "pointer" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: n.read ? "transparent" : "#0891B2", marginTop: 6, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 14, color: "#0F172A", lineHeight: 1.6, fontWeight: n.read ? 500 : 600 }}>{n.text}</p>
                  <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 6, fontWeight: 500 }}>{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Search Overlay ──
function SearchOverlay({ query, setQuery, onClose, kajian, products, onKajian, onProduct }) {
  const q = query.toLowerCase();
  const rk = kajian.filter((k) => k.title.toLowerCase().includes(q) || k.ustadz.toLowerCase().includes(q));
  const rp = products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={20} color="#94A3B8" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kajian atau produk..." style={{...styles.input, paddingLeft: 46}} autoFocus />
            </div>
            <button onClick={onClose} style={{...styles.backBtn, padding: 8}}><X size={24} color="#0F172A" /></button>
          </div>
          {q.length > 0 && (
            <div style={{ marginTop: 24 }}>
              {rk.length > 0 && <p style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 12, letterSpacing: 1 }}>KAJIAN</p>}
              {rk.map((k) => (
                <div key={k.id} onClick={() => onKajian(k)} style={{ padding: "14px 0", borderBottom: "1px solid #F1F5F9", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={k.image} alt={k.title} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{k.title}</p>
                    <p style={{ fontSize: 12, color: "#64748B", marginTop: 2, fontWeight: 500 }}>{k.ustadz}</p>
                  </div>
                </div>
              ))}
              {rp.length > 0 && <p style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginTop: 24, marginBottom: 12, letterSpacing: 1 }}>PRODUK</p>}
              {rp.map((p) => (
                <div key={p.id} onClick={() => onProduct(p)} style={{ padding: "14px 0", borderBottom: "1px solid #F1F5F9", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: "#64748B", marginTop: 2, fontWeight: 500 }}>{fmt(p.price)}</p>
                  </div>
                </div>
              ))}
              {rk.length === 0 && rp.length === 0 && <p style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", paddingTop: 40, fontWeight: 500 }}>Pencarian tidak ditemukan.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ──
const styles = {
  container: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#F8FAFC", position: "relative", overflowX: "hidden", overflowY: "hidden" },
  content: { paddingBottom: 80, overflowY: "auto", height: "100vh" },
  nav: { position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 430, margin: "0 auto", background: "#fff", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-around", padding: "12px 0 16px", zIndex: 100 },
  navBtn: { display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", cursor: "pointer", gap: 2 },
  primaryBtn: { width: "100%", padding: "18px", borderRadius: 16, background: "#0891B2", color: "#fff", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(8,145,178,0.25)" },
  secondaryBtn: { width: "100%", padding: "18px", borderRadius: 16, background: "transparent", color: "#0891B2", fontSize: 15, fontWeight: 600, border: "2px solid #0891B2", cursor: "pointer" },
  backBtn: { background: "none", border: "none", fontSize: 14, color: "#0F172A", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 },
  input: { width: "100%", padding: "18px 20px", borderRadius: 16, border: "2px solid #E2E8F0", fontSize: 15, color: "#0F172A", background: "#fff", transition: "border 0.2s", fontWeight: 500 },
  chip: { padding: "10px 20px", borderRadius: 24, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(6px)" },
  modalContent: { maxWidth: 430, width: "100%", maxHeight: "92vh", background: "#fff", borderRadius: "32px 32px 0 0", overflowY: "auto", boxShadow: "0 -10px 40px rgba(0,0,0,0.1)" },
  toast: { position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "#0F172A", color: "#fff", padding: "14px 24px", borderRadius: 30, zIndex: 300, animation: "toastIn 0.3s ease", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 10, fontWeight: 500, width: "max-content", maxWidth: "90%" },
  badge: { position: "absolute", top: -4, right: -6, minWidth: 18, height: 18, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, padding: "0 4px", border: "2px solid #fff" },
  qtyBtn: { width: 32, height: 32, borderRadius: 10, background: "#F1F5F9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F172A" },
};