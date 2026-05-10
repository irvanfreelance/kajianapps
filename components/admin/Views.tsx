"use client";
import { useState } from "react";
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import { styles, fmt, Pagination, Toast } from "./shared";

export function ProductView({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const pageSize = 10;
  
  const totalPages = Math.ceil(data.length / pageSize);
  const currentData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: number | string) => {
    if(window.confirm("Hapus produk ini?")) {
      try {
        const res = await fetch('/api/products/delete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          setData(data.filter(p => p.id !== id));
          showToast("Produk berhasil dihapus");
        }
      } catch (err) {
        alert("Gagal menghapus produk");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isUpdate = !!formData.id;
      const endpoint = isUpdate ? '/api/products/update' : '/api/products/create';
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      
      if (json.success) {
        if (isUpdate) {
          setData(data.map(p => p.id === formData.id ? { ...p, ...formData } : p));
          showToast("Produk berhasil diperbarui");
        } else {
          setData([{ ...json.data }, ...data]);
          showToast("Produk baru ditambahkan");
        }
      } else {
        alert("Gagal menyimpan produk: " + json.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
    setIsModalOpen(false);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Cari nama produk..." style={{...styles.searchInput, width: "100%"}} />
        </div>
        <button onClick={() => { setFormData({ stock: 0, price: 0 }); setIsModalOpen(true); }} style={styles.primaryBtn}>
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: 40, textAlign: "center"}}>No.</th>
                <th style={styles.th}>Produk</th>
                <th style={styles.th}>Kategori</th>
                <th style={styles.th}>Harga</th>
                <th style={styles.th}>Stok</th>
                <th style={styles.th}>Terjual</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((p, idx) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: "center"}}><span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</span></td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={p.image} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} alt="" />
                      <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{p.name}</p>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 12, padding: "4px 10px", background: "#F1F5F9", borderRadius: 8, color: "#475569" }}>{p.category}</span>
                  </td>
                  <td style={styles.td}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{fmt(p.price)}</p>
                    {p.old_price && <p style={{ fontSize: 12, color: "#94A3B8", textDecoration: "line-through" }}>{fmt(p.old_price)}</p>}
                  </td>
                  <td style={styles.td}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: p.stock < 10 ? "#EF4444" : "#0F172A" }}>{p.stock}</p>
                  </td>
                  <td style={styles.td}><p style={{ fontSize: 14, color: "#64748B" }}>{p.sold || 0}</p></td>
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
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setPage={setCurrentPage} />}
      </div>

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
                  <input required value={formData.stock || 0} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} style={styles.inputForm} type="number" />
                </div>
                <div>
                  <label style={styles.label}>Harga Jual (Rp)</label>
                  <input required value={formData.price || 0} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} style={styles.inputForm} type="number" />
                </div>
                <div>
                  <label style={styles.label}>Harga Coret (Opsional)</label>
                  <input value={formData.old_price || ""} onChange={e => setFormData({...formData, old_price: parseInt(e.target.value) || 0})} style={styles.inputForm} type="number" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>URL Gambar Produk</label>
                  <input required value={formData.image || ""} onChange={e => setFormData({...formData, image: e.target.value})} style={styles.inputForm} type="text" />
                </div>
              </div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn}>Batal</button>
                <button type="submit" style={{...styles.primaryBtn, width: "auto"}}>Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderView({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const pageSize = 10;

  const filteredData = filter === "all" ? data : data.filter(d => d.status === filter);
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id: number | string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setData(data.map(o => (o.id === id || o.order_code === id) ? { ...o, status: newStatus } : o));
        showToast(`Status pesanan diperbarui`);
      } else {
        alert("Gagal memperbarui status pesanan");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, overflowX: "auto", paddingBottom: 10 }}>
        {["all", "pending", "packed", "shipped", "completed"].map(f => (
          <button key={f} onClick={() => { setFilter(f); setCurrentPage(1); }} style={{ padding: "8px 16px", borderRadius: 20, border: filter === f ? "none" : "1px solid #E2E8F0", background: filter === f ? "#0891B2" : "#fff", color: filter === f ? "#fff" : "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {f === "all" ? "Semua Pesanan" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: 40, textAlign: "center"}}>No.</th>
                <th style={styles.th}>ID Pesanan</th>
                <th style={styles.th}>Pelanggan</th>
                <th style={styles.th}>Tanggal</th>
                <th style={styles.th}>Total Belanja</th>
                <th style={styles.th}>Status Saat Ini</th>
                <th style={styles.th}>Ubah Status</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((o, idx) => (
                <tr key={o.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: "center"}}><span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</span></td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{o.id || o.order_code}</span>
                  </td>
                  <td style={styles.td}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{o.customer || 'Customer'}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{o.items || 1} Item</p>
                  </td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B" }}>{o.date || o.order_date}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 14, fontWeight: 600, color: "#0891B2" }}>{fmt(o.total)}</span></td>
                  <td style={styles.td}>
                    {/* Badge uses getStatusStyle internally */}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, ...getBadgeColors(o.status), display: "inline-block" }}>
                        {getBadgeLabel(o.status)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <select value={o.status} onChange={(e) => handleStatusChange(o.order_code || o.id, e.target.value)} style={{ ...styles.inputForm, padding: "6px 10px", fontSize: 12, width: "auto" }}>
                      <option value="pending">Pending</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setPage={setCurrentPage} />}
      </div>
    </div>
  );
}

function getBadgeColors(status: string) {
    const s = getStatusStyle(status);
    return { background: s.bg, color: s.color };
}
function getBadgeLabel(status: string) {
    return getStatusStyle(status).label;
}

export function UserView() {
  const MOCK_USERS = [
    { id: "USR-001", name: "Abdullah Fulan", email: "abdullah@gmail.com", phone: "081234567890", joined: "1 Mei 2026" },
    { id: "USR-002", name: "Siti Aisyah", email: "aisyah.s@yahoo.com", phone: "085711223344", joined: "20 April 2026" },
    { id: "USR-003", name: "Ahmad Zain", email: "zain.ahmad@gmail.com", phone: "081199887766", joined: "15 April 2026" },
  ];
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(MOCK_USERS.length / pageSize);
  const currentData = MOCK_USERS.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: 40, textAlign: "center"}}>No.</th>
                <th style={styles.th}>ID Pengguna</th>
                <th style={styles.th}>Nama Lengkap</th>
                <th style={styles.th}>Kontak</th>
                <th style={styles.th}>Tgl Bergabung</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((u, idx) => (
                <tr key={u.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: "center"}}><span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>{u.id}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{u.name}</span></td>
                  <td style={styles.td}>
                    <p style={{ fontSize: 13, color: "#0F172A" }}>{u.email}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{u.phone}</p>
                  </td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B" }}>{u.joined}</span></td>
                  <td style={styles.td}>
                     <button style={{ ...styles.actionBtnEdit, width: "auto", padding: "0 12px", gap: 4, fontSize: 12 }}>Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setPage={setCurrentPage} />}
      </div>
    </div>
  );
}

export function SettingsView() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 600 }}>
       {toast && <Toast msg={toast} />}
      <div style={styles.card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Pengaturan Umum</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={styles.label}>Nama Platform</label>
            <input defaultValue="Majelis Ilmu" style={styles.inputForm} type="text" />
          </div>
          <div>
            <label style={styles.label}>Email Admin</label>
            <input defaultValue="admin@majelis.id" style={styles.inputForm} type="email" />
          </div>
          <button onClick={() => showToast("Pengaturan disimpan")} style={styles.primaryBtn}>Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}
