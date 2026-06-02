"use client";
import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { Search, Plus, Edit, Trash2, X, FileDown, Camera, CheckCircle, CreditCard, Upload, Loader2 } from "lucide-react";
import { styles, fmt, formatDate, Pagination, Toast, getStatusStyle } from "./shared";
import { exportToExcel } from "@/lib/excel";
import { useRouter } from "next/navigation";

export function ProductView({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/product-categories/list')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setCategories(json.data || []);
        }
      })
      .catch(err => console.error("Failed to load product categories:", err));
  }, []);
  
  
  const filtered = data.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    const exportData = filtered.map((p, i) => ({
      'No': i + 1,
      'ID Produk': p.id,
      'Nama Produk': p.name,
      'Kategori': p.category,
      'Harga': p.price,
      'Harga Coret': p.old_price || p.oldPrice || "-",
      'Stok': p.stock || 0,
      'Deskripsi': p.description || p.desc || ""
    }));
    exportToExcel(exportData, 'Data_Produk');
  };

  const handleDelete = async (id: number | string) => {
    if(window.confirm("Hapus produk ini?")) {
      try {
        const res = await fetch('/api/products/delete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setData(data.filter(p => p.id !== id));
          showToast("Produk berhasil dihapus");
        } else {
          alert(json.error || "Gagal menghapus produk");
        }
      } catch (err) {
        alert("Gagal menghapus produk: Terjadi kesalahan koneksi");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      alert("Gambar produk wajib diunggah!");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image || "";
      if (selectedFile) {
        const response = await fetch(
          `/api/admin/upload?filename=${encodeURIComponent(selectedFile.name)}`,
          { method: 'POST', body: selectedFile }
        );
        const newBlob = await response.json();
        if (newBlob.url) {
          imageUrl = newBlob.url;
        } else {
          throw new Error("Gagal upload gambar");
        }
      }

      const isUpdate = !!formData.id;
      const endpoint = isUpdate ? '/api/products/update' : '/api/products/create';
      const payload = {
        ...formData,
        image: imageUrl
      };
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      
      if (json.success) {
        if (isUpdate) {
          setData(data.map(p => p.id === formData.id ? { ...p, ...payload } : p));
          showToast("Produk berhasil diperbarui");
        } else {
          setData([{ ...json.data }, ...data]);
          showToast("Produk baru ditambahkan");
        }
        setIsModalOpen(false);
      } else {
        alert("Gagal menyimpan produk: " + json.error);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Cari nama produk..." 
            style={{...styles.searchInput, width: "100%"}} 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleExport} style={styles.excelBtn}>
            <FileDown size={18} /> Export Excel
          </button>
          <button onClick={() => { setFormData({ stock: 0, price: 0, jenis: 'fisik', link: '' }); setSelectedFile(null); setPreviewUrl(""); setIsModalOpen(true); }} style={styles.primaryBtn}>
            <Plus size={18} /> Tambah Produk
          </button>
        </div>
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
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 14, margin: 0 }}>{p.name}</p>
                        <span style={{ 
                          fontSize: 10, 
                          fontWeight: 700, 
                          color: p.jenis === 'digital' ? '#D97706' : '#2563EB', 
                          background: p.jenis === 'digital' ? '#FEF3C7' : '#DBEAFE', 
                          padding: "1px 6px", 
                          borderRadius: 4, 
                          width: "fit-content",
                          marginTop: 4
                        }}>
                          {p.jenis === 'digital' ? 'DIGITAL' : 'FISIK'}
                        </span>
                      </div>
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
                      <button onClick={() => { setFormData(p); setSelectedFile(null); setPreviewUrl(p.image || ""); setIsModalOpen(true); }} style={styles.actionBtnEdit}><Edit size={16}/></button>
                      <button onClick={() => handleDelete(p.id)} style={styles.actionBtnDel}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} setPage={setCurrentPage} />}
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
                  <select 
                    required 
                    value={formData.category || ""} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    style={styles.inputForm}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
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
                <div>
                  <label style={styles.label}>Jenis Produk</label>
                  <select 
                    required 
                    value={formData.jenis || "fisik"} 
                    onChange={e => setFormData({...formData, jenis: e.target.value})} 
                    style={styles.inputForm}
                  >
                    <option value="fisik">Fisik</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
                {formData.jenis === 'digital' && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={styles.label}>Link Produk Digital</label>
                    <input 
                      required 
                      value={formData.link || ""} 
                      onChange={e => setFormData({...formData, link: e.target.value})} 
                      placeholder="https://example.com/download-link"
                      style={styles.inputForm} 
                      type="text" 
                    />
                  </div>
                )}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Gambar Produk</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: "100%", height: 160, borderRadius: 12,
                      border: "2px dashed #E2E8F0", background: "#F8FAFC",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", overflow: "hidden",
                      position: "relative", transition: "all 0.2s"
                    }}
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="Preview" />
                        <div className="image-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                          <p style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Ganti Gambar</p>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                          <Upload size={18} color="#3B82F6" />
                        </div>
                        <p style={{ fontWeight: 600, color: "#0F172A", fontSize: 13 }}>Klik untuk upload gambar</p>
                        <p style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>Format JPG, PNG atau WEBP (Maks. 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
                  <style>{`.image-overlay:hover { opacity: 1 !important; }`}</style>
                </div>
              </div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn} disabled={isSubmitting}>Batal</button>
                <button type="submit" style={{...styles.primaryBtn, width: "auto"}} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    "Simpan Produk"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderView({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderForProof, setSelectedOrderForProof] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const pageSize = 10;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    const exportData = filteredData.map((o, i) => {
      const subtotal = Array.isArray(o.items)
        ? o.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0)
        : (Number(o.total || 0) - Number(o.shippingCost || 0));
      const shippingCost = Number(o.shippingCost || 0);
      return {
        'No': i + 1,
        'ID Pesanan': o.orderCode || o.order_code || o.id,
        'Tanggal': formatDate(o.date || o.order_date),
        'Pelanggan': o.customer || 'Customer',
        'WhatsApp/Phone': o.phone || "-",
        'Kurir': o.courier || "-",
        'Nomor Resi': o.resi || "-",
        'Metode Bayar': o.paymentMethod || 'Manual Transfer',
        'Harga Produk': subtotal,
        'Ongkir': shippingCost,
        'Grand Total': o.total,
        'Status': o.status
      };
    });
    exportToExcel(exportData, 'Data_Pesanan');
  };

  const handleStatusChange = async (id: number | string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setData(data.map(o => (o.id === id || o.order_code === id || o.orderCode === id) ? { ...o, status: newStatus } : o));
        showToast(`Status pesanan diperbarui`);
      } else {
        alert("Gagal memperbarui status pesanan");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch('/api/admin/orders/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(data.filter(o => o.id !== id && o.order_code !== id && o.orderCode !== id));
        showToast("Pesanan berhasil dihapus");
      } else {
        alert("Gagal menghapus pesanan: " + json.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat menghapus");
    }
  };

  const filteredData = data.filter(o => {
    const matchesSearch = 
      o.customer?.toLowerCase().includes(search.toLowerCase()) ||
      (o.id || o.orderCode || o.order_code || '').toString().toLowerCase().includes(search.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      o.status?.toLowerCase() === statusFilter.toLowerCase();

    const methodLabel = o.paymentMethod || 'Manual Transfer';
    const matchesMethod = 
      methodFilter === 'all' || 
      methodLabel === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const uniqueMethods = Array.from(new Set(data.map(o => o.paymentMethod || 'Manual Transfer')));
  
  const checkoutOrders = data.filter(o => (o.status || '').toLowerCase() === 'pending');
  const checkoutCount = checkoutOrders.length;
  const checkoutNominal = checkoutOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const paidOrders = data.filter(o => (o.status || '').toLowerCase() === 'paid');
  const paidCount = paidOrders.length;
  const paidNominal = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}

      {/* Scorecards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{
          background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <p style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>Pesanan Masih Checkout</p>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#D97706", display: "flex", alignItems: "baseline", gap: 6 }}>
              {checkoutCount} <span style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8" }}>Pesanan</span>
            </h3>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginTop: 4 }}>Nominal: {fmt(checkoutNominal)}</p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18 }}>🛒</span>
          </div>
        </div>
        <div style={{
          background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <p style={{ fontSize: 13, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>Pesanan Sudah Paid (Lunas)</p>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#10B981", display: "flex", alignItems: "baseline", gap: 6 }}>
              {paidCount} <span style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8" }}>Pesanan</span>
            </h3>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginTop: 4 }}>Nominal: {fmt(paidNominal)}</p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18 }}>💵</span>
          </div>
        </div>
      </div>

      {/* Advanced Multi Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
            <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Cari pelanggan, ID Pesanan..." 
              style={{...styles.searchInput, width: "100%"}} 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
            style={{ ...styles.searchInput, width: "auto", minWidth: 140, padding: "8px 16px 8px 12px" }}
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
          </select>

          <select 
            value={methodFilter} 
            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }} 
            style={{ ...styles.searchInput, width: "auto", minWidth: 160, padding: "8px 16px 8px 12px" }}
          >
            <option value="all">Semua Metode</option>
            {uniqueMethods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <button onClick={handleExport} style={styles.excelBtn}>
          <FileDown size={18} /> Export Excel
        </button>
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
                <th style={styles.th}>Metode Bayar</th>
                <th style={styles.th}>Harga Produk</th>
                <th style={styles.th}>Ongkir</th>
                <th style={styles.th}>Ongkir + Harga Produk</th>
                <th style={styles.th}>Grand Total</th>
                <th style={styles.th}>Status Saat Ini</th>
                <th style={styles.th}>Ubah Status</th>
                <th style={{...styles.th, textAlign: "center"}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((o, idx) => {
                const subtotal = Array.isArray(o.items)
                  ? o.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0)
                  : (Number(o.total || 0) - Number(o.shippingCost || 0));
                const shippingCost = Number(o.shippingCost || 0);
                const subtotalWithOngkir = subtotal + shippingCost;

                const hasProof = !!o.paymentProof;
                return (
                  <tr key={o.id} style={{
                    ...styles.tr,
                    background: hasProof ? "#F0FDFC" : undefined,
                    borderLeft: hasProof ? "3px solid #0891B2" : "3px solid transparent",
                    position: "relative"
                  }}>
                    <td style={{...styles.td, textAlign: "center"}}><span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</span></td>
                    <td style={styles.td}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{o.orderCode || o.order_code || o.id}</span>
                    </td>
                    <td style={styles.td}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{o.customer || 'Customer'}</p>
                      <p style={{ fontSize: 12, color: "#64748B" }}>
                        {Array.isArray(o.items) ? o.items.reduce((sum: number, item: any) => sum + item.qty, 0) : (o.items || 1)} Item
                      </p>
                    </td>
                    <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B" }}>{formatDate(o.date || o.order_date)}</span></td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontWeight: 600, color: "#475569", fontSize: 13 }}>
                          {o.paymentMethod || 'Manual Transfer'}
                        </span>
                        {hasProof && (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 3,
                            fontSize: 10, fontWeight: 700, color: "#0891B2",
                            background: "#CFFAFE", padding: "2px 7px",
                            borderRadius: 20, border: "1px solid #A5F3FC",
                            width: "fit-content"
                          }}>
                            <CheckCircle size={9} /> Ada Bukti
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{fmt(subtotal)}</span></td>
                    <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{fmt(shippingCost)}</span></td>
                    <td style={styles.td}><span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{fmt(subtotalWithOngkir)}</span></td>
                    <td style={styles.td}><span style={{ fontSize: 14, fontWeight: 700, color: "#0891B2" }}>{fmt(o.total)}</span></td>
                    <td style={styles.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, ...getBadgeColors(o.status), display: "inline-block" }}>
                          {getBadgeLabel(o.status)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select value={o.status} onChange={(e) => handleStatusChange(o.orderCode || o.order_code || o.id, e.target.value)} style={{ ...styles.inputForm, padding: "6px 10px", fontSize: 12, width: "auto" }}>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td style={{...styles.td, textAlign: "center", whiteSpace: "nowrap"}}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
                        {hasProof && (
                          <button 
                            onClick={() => setSelectedOrderForProof(o)}
                            style={{ 
                              display: "flex", alignItems: "center", gap: 5,
                              padding: "6px 12px", borderRadius: 8,
                              border: "none",
                              background: o.status === 'pending' 
                                ? "linear-gradient(135deg, #0891B2, #06B6D4)"
                                : "#0891B2",
                              color: "#fff", fontSize: 12, 
                              fontWeight: 700, cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(8,145,178,0.25)"
                            }}
                          >
                            <Camera size={13} />
                            {o.status === 'pending' ? 'Verifikasi' : 'Bukti'}
                          </button>
                        )}
                        {o.status === 'pending' && (
                          <button 
                            onClick={async () => {
                              if (window.confirm("Tandai pesanan ini sebagai Lunas (Paid)?")) {
                                await handleStatusChange(o.orderCode || o.order_code || o.id, 'paid');
                              }
                            }}
                            style={{ 
                              padding: "6px 12px", borderRadius: 8, border: "none", 
                              background: "#10B981", color: "#fff", fontSize: 12, 
                              fontWeight: 700, cursor: "pointer"
                            }}
                          >
                            Set Paid
                          </button>
                        )}
                        <button 
                          onClick={() => router.push(`/panel/orders/${o.id}`)}
                          style={{ 
                            padding: "6px 12px", borderRadius: 8, border: "1px solid #64748B", 
                            background: "#F8FAFC", color: "#475569", fontSize: 12, 
                            fontWeight: 700, cursor: "pointer"
                          }}
                        >
                          Detail
                        </button>
                        <button 
                          onClick={() => handleDelete(o.id || o.orderCode || o.order_code)}
                          style={{ 
                            padding: "6px 12px", borderRadius: 8, border: "none", 
                            background: "#FEF2F2", color: "#EF4444", fontSize: 12, 
                            fontWeight: 700, cursor: "pointer"
                          }}
                          title="Hapus"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredData.length} setPage={setCurrentPage} />}
      </div>

      {/* Modal Bukti Transfer */}
      {selectedOrderForProof && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: 24,
            maxWidth: 550, width: "90%", maxHeight: "90vh",
            display: "flex", flexDirection: "column", gap: 16,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>Verifikasi Bukti Transfer</h3>
                <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                  {selectedOrderForProof.orderCode || selectedOrderForProof.order_code} · {selectedOrderForProof.customer}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrderForProof(null)}
                style={{
                  background: "#F1F5F9", border: "none", borderRadius: "50%",
                  width: 32, height: 32, display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", fontSize: 14,
                  fontWeight: 700, color: "#64748B"
                }}
              >
                ✕
              </button>
            </div>

            {/* Order Details Metadata */}
            <div style={{
              background: "#F8FAFC", borderRadius: 16, padding: "14px 18px",
              border: "1px solid #E2E8F0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10
            }}>
              <div>
                <p style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>Kode Pesanan</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{selectedOrderForProof.orderCode || selectedOrderForProof.order_code}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>Pelanggan</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{selectedOrderForProof.customer || 'Customer'}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>Metode</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{selectedOrderForProof.paymentMethod || 'Manual Transfer'}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>Ongkir</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>{fmt(selectedOrderForProof.shippingCost || 0)}</p>
              </div>
              <div style={{ gridColumn: "span 2", borderTop: "1px solid #E2E8F0", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>Total Transfer</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#0891B2" }}>{fmt(selectedOrderForProof.total)}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, ...getBadgeColors(selectedOrderForProof.status) }}>
                    {getBadgeLabel(selectedOrderForProof.status)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ 
              flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #F0FDFC, #ECFEFF)",
              borderRadius: 16, padding: 16, border: "2px dashed #A5F3FC", gap: 10
            }}>
              <a href={selectedOrderForProof.paymentProof} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", cursor: "zoom-in" }}
              >
                <img 
                  src={selectedOrderForProof.paymentProof} 
                  alt="Bukti Transfer" 
                  style={{ maxWidth: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }} 
                />
              </a>
              <p style={{ fontSize: 11, color: "#0891B2", fontWeight: 600, margin: 0 }}>
                Klik gambar untuk zoom · Atau buka di tab baru ↗
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {selectedOrderForProof.status === 'pending' ? (
                <button 
                  onClick={async () => {
                    const code = selectedOrderForProof.orderCode || selectedOrderForProof.order_code || selectedOrderForProof.id;
                    await handleStatusChange(code, 'paid');
                    setSelectedOrderForProof(null);
                  }}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 12,
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    color: "#fff", border: "none", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                >
                  <CheckCircle size={17} /> Konfirmasi Lunas
                </button>
              ) : (
                <div style={{
                  flex: 1, padding: "10px 16px", borderRadius: 12,
                  background: "#F8FAFC", border: "1px solid #E2E8F0",
                  fontSize: 12, fontWeight: 600, color: "#64748B",
                  display: "flex", alignItems: "center", gap: 6
                }}>
                  <CheckCircle size={14} color="#10B981" />
                  Pesanan sudah berstatus: <strong>{selectedOrderForProof.status}</strong>
                </div>
              )}
              <button 
                onClick={() => setSelectedOrderForProof(null)}
                style={{
                  padding: "12px 24px", borderRadius: 12, background: "#64748B",
                  color: "#fff", border: "none", fontSize: 14, fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
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

export function UserView({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = data.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase()) ||
    (u.userCode || u.id || '').toString().toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const exportData = filtered.map((u, i) => ({
      'No': i + 1,
      'ID Pengguna': u.userCode || u.id,
      'Nama Lengkap': u.name,
      'Email': u.email,
      'No. WhatsApp': u.phone || "-",
      'Jenis Kelamin': u.gender || "-",
      'Pekerjaan': u.job || "-",
      'Tahun Lahir': u.yearBorn || "-",
      'Tanggal Bergabung': u.joinedDate || u.joined,
      'Total Ikut Kajian': u.total_daftar || 0,
      'Total Hadir': u.total_hadir || 0,
      'Rasio Kehadiran (%)': u.total_daftar > 0 ? Math.round((u.total_hadir / u.total_daftar) * 100) : 0,
    }));
    exportToExcel(exportData, 'Data_Jamaah');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setData(data.map(u => u.id === formData.id ? { ...u, ...formData } : u));
        showToast("Data jamaah berhasil diperbarui");
        setIsModalOpen(false);
      } else {
        alert("Gagal menyimpan data: " + json.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jamaah ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(data.filter(u => u.id !== id));
        showToast("Jamaah berhasil dihapus");
      } else {
        alert("Gagal menghapus jamaah: " + json.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat menghapus");
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [{
      'Nama Lengkap': 'Fulan bin Fulan',
      'Email': 'fulan@example.com',
      'No. WhatsApp': '081234567890',
      'Jenis Kelamin': 'Laki-laki',
      'Pekerjaan': 'Karyawan Swasta',
      'Tahun Lahir': 1990,
      'Tanggal Bergabung': '2026-05-20'
    }];
    exportToExcel(templateData, 'Template_Import_Jamaah');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rowData = XLSX.utils.sheet_to_json(ws);
        
        const payload = rowData.map((row: any) => ({
          name: row['Nama Lengkap'],
          email: row['Email'],
          phone: String(row['No. WhatsApp'] || ""),
          gender: row['Jenis Kelamin'],
          job: row['Pekerjaan'],
          yearBorn: row['Tahun Lahir'],
          joinedDate: row['Tanggal Bergabung']
        }));

        const res = await fetch('/api/user/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (json.success) {
          showToast(`Berhasil mengimpor ${json.count} jamaah. Silakan refresh halaman.`);
          setTimeout(() => window.location.reload(), 2000);
        } else {
          alert("Gagal mengimpor data: " + json.error);
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat membaca file Excel.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePrintMemberCard = (u: any) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${u.userCode || u.id}`;
    
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>Kartu Member - ${u.name}</title>
      <style>
        body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #E2E8F0; }
        .card-container { display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .card { 
          width: 450px; height: 284px; 
          background: linear-gradient(135deg, #0F172A, #1E293B); 
          border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
          color: #fff; position: relative; overflow: hidden;
          display: flex; flex-direction: column; padding: 0;
        }
        .header {
          background: #0891B2; padding: 12px 20px; text-align: center;
          border-bottom: 4px solid #38BDF8;
        }
        .header-title { font-weight: 800; font-size: 18px; letter-spacing: 2px; margin: 0; color: #fff; }
        .header-sub { font-size: 10px; font-weight: 600; letter-spacing: 1px; color: #CFFAFE; margin-top: 2px; text-transform: uppercase; }
        
        .body-content { display: flex; padding: 20px; flex: 1; align-items: center; gap: 20px; }
        .qr-side { background: #fff; padding: 6px; border-radius: 8px; width: 100px; height: 100px; flex-shrink: 0; }
        .qr-side img { width: 100%; height: 100%; display: block; }
        
        .info-side { flex: 1; display: flex; flex-direction: column; gap: 10px; z-index: 10; }
        .info-group { display: flex; flex-direction: column; gap: 2px; }
        .label { font-size: 10px; color: #94A3B8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .value { font-size: 15px; font-weight: 700; color: #fff; }
        .value.name { font-size: 18px; color: #38BDF8; line-height: 1.2; }
        
        .card::after { content: ""; position: absolute; bottom: -50px; right: -50px; width: 150px; height: 150px; background: rgba(8, 145, 178, 0.15); border-radius: 50%; filter: blur(20px); pointer-events: none; }
        
        .print-btn { 
          display: flex; align-items: center; gap: 8px; 
          background: #0891B2; color: white; border: none; 
          padding: 12px 24px; border-radius: 8px; 
          font-weight: 600; font-size: 14px; cursor: pointer;
          transition: background 0.2s;
        }
        .print-btn:hover { background: #0E7490; }

        @media print { 
          body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; align-items: flex-start; justify-content: flex-start; padding: 0; } 
          .card { box-shadow: none; border: 1px solid #0F172A; margin: 20px; } 
          .print-btn { display: none; }
          .card-container { gap: 0; }
        }
      </style></head><body>
      <div class="card-container">
        <div class="card">
          <div class="header">
            <p class="header-title">BADAR</p>
            <p class="header-sub">KARTU ANGGOTA JAMAAH</p>
          </div>
          <div class="body-content">
            <div class="qr-side"><img src="${qrUrl}" alt="QR" /></div>
            <div class="info-side">
              <div class="info-group">
                <span class="label">Nama Lengkap</span>
                <span class="value name">${u.name}</span>
              </div>
              <div class="info-group">
                <span class="label">ID Anggota</span>
                <span class="value" style="font-family: monospace; letter-spacing: 1px;">${u.userCode || u.id}</span>
              </div>
              <div style="display: flex; gap: 20px;">
                <div class="info-group" style="flex: 1; overflow: hidden;">
                  <span class="label">Kontak</span>
                  <span class="value" style="font-size: 12px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${u.phone || u.email}</span>
                </div>
                <div class="info-group">
                  <span class="label">Bergabung</span>
                  <span class="value" style="font-size: 12px;">${u.joinedDate ? new Date(u.joinedDate).getFullYear() : (u.joined ? new Date(u.joined).getFullYear() : new Date().getFullYear())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="print-btn" onclick="window.print()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Cetak Kartu
        </button>
      </div>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
          <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Cari jamaah..." 
            style={{...styles.searchInput, width: "100%"}} 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleDownloadTemplate} style={{...styles.secondaryBtn, display: 'flex', alignItems: 'center', gap: 6}}>
            Unduh Template
          </button>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            ref={fileInputRef} 
            onChange={handleImport} 
            style={{ display: 'none' }} 
          />
          <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} style={{...styles.secondaryBtn, display: 'flex', alignItems: 'center', gap: 6, opacity: isImporting ? 0.7 : 1}}>
            {isImporting ? 'Mengimpor...' : 'Import Excel'}
          </button>
          <button onClick={handleExport} style={styles.excelBtn}>
            <FileDown size={18} /> Export Excel
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: 40, textAlign: "center"}}>No.</th>
                <th style={styles.th}>ID Pengguna</th>
                <th style={styles.th}>Nama Lengkap</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>No. WhatsApp</th>
                <th style={styles.th}>Jenis Kelamin</th>
                <th style={styles.th}>Pekerjaan</th>
                <th style={styles.th}>Tahun Lahir</th>
                <th style={styles.th}>Tgl Bergabung</th>
                <th style={{...styles.th, textAlign: "center"}}>Ikut Kajian</th>
                <th style={{...styles.th, minWidth: 140}}>Kerajinan Hadir</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((u, idx) => {
                const totalDaftar = Number(u.total_daftar || 0);
                const totalHadir = Number(u.total_hadir || 0);
                const pct = totalDaftar > 0 ? Math.round((totalHadir / totalDaftar) * 100) : 0;
                const barColor = pct >= 80 ? '#16A34A' : pct >= 50 ? '#D97706' : pct > 0 ? '#DC2626' : '#CBD5E1';
                return (
                <tr key={u.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: "center"}}><span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>{u.userCode || u.id}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{u.name}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#0F172A" }}>{u.email}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B" }}>{u.phone || '-'}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#475569" }}>{u.gender || '-'}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#475569" }}>{u.job || '-'}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#475569" }}>{u.yearBorn || '-'}</span></td>
                  <td style={styles.td}><span style={{ fontSize: 13, color: "#64748B" }}>{u.joinedDate || u.joined}</span></td>

                  {/* Total ikut kajian */}
                  <td style={{...styles.td, textAlign: "center"}}>
                    {totalDaftar > 0 ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: "50%",
                        background: "#ECFEFF", border: "2px solid #0891B2",
                        fontSize: 13, fontWeight: 800, color: "#0891B2"
                      }}>
                        {totalDaftar}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "#CBD5E1" }}>-</span>
                    )}
                  </td>

                  {/* Kerajinan hadir — progress bar */}
                  <td style={styles.td}>
                    {totalDaftar > 0 ? (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "#64748B" }}>{totalHadir}/{totalDaftar} kajian</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{pct}%</span>
                        </div>
                        <div style={{ height: 6, background: "#F1F5F9", borderRadius: 4 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 4, transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#CBD5E1" }}>Belum daftar kajian</span>
                    )}
                  </td>

                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handlePrintMemberCard(u)} style={{...styles.actionBtnEdit, background: '#F0FDFA', color: '#0F766E'}} title="Cetak Member">
                        <CreditCard size={16} />
                      </button>
                      <button onClick={() => { setFormData(u); setIsModalOpen(true); }} style={styles.actionBtnEdit} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} style={styles.actionBtnDel} title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} setPage={setCurrentPage} />}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentBase}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Edit Data Jamaah</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={styles.label}>Nama Lengkap</label>
                  <input required value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div>
                  <label style={styles.label}>Email</label>
                  <input required value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} style={styles.inputForm} type="email" />
                </div>
                <div>
                  <label style={styles.label}>No. WhatsApp</label>
                  <input value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div>
                  <label style={styles.label}>Jenis Kelamin</label>
                  <select value={formData.gender || ""} onChange={e => setFormData({...formData, gender: e.target.value})} style={styles.inputForm}>
                    <option value="">Pilih</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Pekerjaan</label>
                  <select value={formData.job || ""} onChange={e => setFormData({...formData, job: e.target.value})} style={styles.inputForm}>
                    <option value="">Pilih Pekerjaan</option>
                    <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                    <option value="Pegawai Negeri Sipil (PNS)">Pegawai Negeri Sipil (PNS)</option>
                    <option value="Pegawai Swasta">Pegawai Swasta</option>
                    <option value="Wirausaha/Mandiri">Wirausaha/Mandiri</option>
                    <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                    <option value="Pensiunan">Pensiunan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Tahun Lahir</label>
                  <input value={formData.yearBorn || ""} onChange={e => setFormData({...formData, yearBorn: e.target.value})} style={styles.inputForm} type="number" />
                </div>
              </div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn}>Batal</button>
                <button type="submit" style={{...styles.primaryBtn, width: "auto"}}>Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
            <input defaultValue="BADAR - Baik Dari Rumah" style={styles.inputForm} type="text" />
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
