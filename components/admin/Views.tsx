"use client";
import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { Search, Plus, Edit, Trash2, X, FileDown, Camera, CheckCircle } from "lucide-react";
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
  const pageSize = 10;
  
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
          <button onClick={() => { setFormData({ stock: 0, price: 0 }); setIsModalOpen(true); }} style={styles.primaryBtn}>
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setPage={setCurrentPage} />}
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
      'Tanggal Bergabung': u.joinedDate || u.joined
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
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((u, idx) => (
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
                  <td style={styles.td}>
                    <button onClick={() => { setFormData(u); setIsModalOpen(true); }} style={styles.actionBtnEdit}>
                      <Edit size={16} />
                    </button>
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
                  <input value={formData.job || ""} onChange={e => setFormData({...formData, job: e.target.value})} style={styles.inputForm} type="text" />
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
