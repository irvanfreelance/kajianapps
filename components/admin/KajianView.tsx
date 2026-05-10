"use client";
import { useState } from "react";
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import { styles, fmt, Pagination, Toast } from "./shared";

export default function KajianView({ initialData }: { initialData: any[] }) {
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

  const handleDelete = async (id: any) => {
    if(window.confirm("Hapus kajian ini?")) {
      try {
        const res = await fetch('/api/kajian/delete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        if (res.ok) {
          setData(data.filter(k => k.id !== id));
          showToast("Kajian berhasil dihapus");
        }
      } catch (err) {
        alert("Gagal menghapus kajian");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isUpdate = !!formData.id;
      const endpoint = isUpdate ? '/api/kajian/update' : '/api/kajian/create';
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, spot: formData.spot || 100 })
      });
      const json = await res.json();
      
      if (json.success) {
        if (isUpdate) {
          setData(data.map(k => k.id === formData.id ? { ...k, ...formData } : k));
          showToast("Kajian berhasil diperbarui");
        } else {
          setData([{ ...json.data, date: formData.date, time: formData.time }, ...data]);
          showToast("Kajian baru berhasil ditambahkan");
        }
      } else {
        alert("Gagal menyimpan kajian: " + json.error);
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
                <th style={{...styles.th, width: 40, textAlign: "center"}}>No.</th>
                <th style={styles.th}>Info Kajian</th>
                <th style={styles.th}>Jadwal</th>
                <th style={styles.th}>Tipe & Harga</th>
                <th style={styles.th}>Kuota</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((k, idx) => (
                <tr key={k.id} style={styles.tr}>
                  <td style={{...styles.td, textAlign: "center"}}><span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</span></td>
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
                        <div style={{ height: "100%", background: "#0891B2", borderRadius: 4, width: `${((k.filled || 0)/(k.spot || 1))*100}%` }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#64748B" }}>{k.filled || 0}/{k.spot || 0}</span>
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
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} setPage={setCurrentPage} />}
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
                {/* ZOOM & YOUTUBE URLS */}
                <div>
                  <label style={styles.label}>URL Zoom</label>
                  <input value={formData.url_zoom || ""} onChange={e => setFormData({...formData, url_zoom: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div>
                  <label style={styles.label}>URL Youtube</label>
                  <input value={formData.url_youtube || ""} onChange={e => setFormData({...formData, url_youtube: e.target.value})} style={styles.inputForm} type="text" />
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
