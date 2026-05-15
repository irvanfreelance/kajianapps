"use client";
import { useState } from "react";
import { Save, Trash2, Edit, X, Plus, ShieldCheck } from "lucide-react";
import { styles, Toast } from "./shared";

export default function AdminSettingsView({ 
  settings: initialSettings, 
  admins: initialAdmins 
}: { 
  settings: any[], 
  admins: any[] 
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [admins, setAdmins] = useState(initialAdmins);
  const [toast, setToast] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      const res = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) {
        showToast("Pengaturan berhasil disimpan");
        setSettings(settings.map(s => s.config_key === key ? { ...s, config_value: value } : s));
      }
    } catch (err) {
      alert("Gagal menyimpan pengaturan");
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!window.confirm("Hapus admin ini?")) return;
    try {
      const res = await fetch('/api/admin/admins/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdmins(admins.filter(a => a.id !== id));
        showToast("Admin berhasil dihapus");
      }
    } catch (err) {
      alert("Gagal menghapus admin");
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isUpdate = !!formData.id;
      const endpoint = isUpdate ? '/api/admin/admins/update' : '/api/admin/admins/create';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (res.ok) {
        if (isUpdate) {
          setAdmins(admins.map(a => a.id === formData.id ? formData : a));
          showToast("Data admin diperbarui");
        } else {
          setAdmins([...admins, json.data]);
          showToast("Admin baru ditambahkan");
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      alert("Gagal menyimpan data admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
      {toast && <Toast msg={toast} />}

      {/* LEFT: SETTINGS CRUD */}
      <div style={styles.card}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "#0F172A", display: "flex", alignItems: "center", gap: 10 }}>
          <Save size={20} color="#0891B2" /> Pengaturan Platform
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {settings.map((s) => (
            <div key={s.config_key}>
              <label style={styles.label}>{s.config_key.replace(/_/g, ' ').toUpperCase()}</label>
              <div style={{ display: "flex", gap: 10 }}>
                <input 
                  defaultValue={s.config_value} 
                  onBlur={(e) => {
                    if (e.target.value !== s.config_value) {
                      handleUpdateSetting(s.config_key, e.target.value);
                    }
                  }}
                  style={styles.inputForm} 
                  type="text" 
                />
              </div>
            </div>
          ))}
          {settings.length === 0 && <p style={{ fontSize: 13, color: "#64748B" }}>Belum ada pengaturan.</p>}
        </div>
      </div>

      {/* RIGHT: ADMINS LIST */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={20} color="#0891B2" /> Tim Admin
          </h3>
          <button onClick={() => { setFormData({ role: 'ADMIN', status: 'ACTIVE' }); setIsModalOpen(true); }} style={{ ...styles.primaryBtn, padding: "8px 12px", fontSize: 12 }}>
            <Plus size={16} /> Tambah
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Admin</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} style={styles.tr}>
                  <td style={styles.td}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{admin.name}</p>
                    <p style={{ fontSize: 12, color: "#64748B" }}>{admin.email}</p>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0891B2", background: "#ECFEFF", padding: "4px 8px", borderRadius: 8 }}>{admin.role}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: admin.status === 'ACTIVE' ? "#16A34A" : "#EF4444" }}>{admin.status}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setFormData(admin); setIsModalOpen(true); }} style={styles.actionBtnEdit}><Edit size={14}/></button>
                      <button onClick={() => handleDeleteAdmin(admin.id)} style={styles.actionBtnDel}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FOR ADMIN CRUD */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentBase}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{formData.id ? "Edit Admin" : "Tambah Admin"}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveAdmin} style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Nama Lengkap</label>
                  <input required value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.inputForm} type="text" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Email</label>
                  <input required value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} style={styles.inputForm} type="email" />
                </div>
                <div>
                  <label style={styles.label}>Role</label>
                  <select value={formData.role || "ADMIN"} onChange={e => setFormData({...formData, role: e.target.value})} style={styles.inputForm}>
                    <option value="SUPERADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="FINANCE">Keuangan</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Status</label>
                  <select value={formData.status || "ACTIVE"} onChange={e => setFormData({...formData, status: e.target.value})} style={styles.inputForm}>
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Non-Aktif</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn}>Batal</button>
                <button type="submit" disabled={isSubmitting} style={{ ...styles.primaryBtn, width: "auto" }}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
