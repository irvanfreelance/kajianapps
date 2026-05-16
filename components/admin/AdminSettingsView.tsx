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
        setSettings(prev => {
          const existing = prev.find(s => s.config_key === key);
          if (existing) return prev.map(s => s.config_key === key ? { ...s, config_value: value } : s);
          return [...prev, { config_key: key, config_value: value }];
        });
        if (key === 'site_title') document.title = value;
      }
    } catch (err) {
      alert("Gagal menyimpan pengaturan");
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

  const getSetting = (key: string) => settings.find(s => s.config_key === key)?.config_value || "";

  return (
    <div style={{ animation: "fadeIn 0.3s ease", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
      {toast && <Toast msg={toast} />}

      <div style={styles.card}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "#0F172A", display: "flex", alignItems: "center", gap: 10 }}>
          <Save size={20} color="#0891B2" /> Pengaturan Platform
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={styles.label}>NAMA PLATFORM / TITLE BROWSER</label>
            <input 
              defaultValue={getSetting('site_title') || 'Majelis Ilmu'} 
              onBlur={(e) => handleUpdateSetting('site_title', e.target.value)}
              style={styles.inputForm} 
              type="text" 
            />
          </div>

          <div>
            <label style={styles.label}>FAVICON PLATFORM</label>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#F8FAFC" }}>
                <img 
                  src={getSetting('site_favicon') || '/favicon.ico'} 
                  style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                  alt="Favicon" 
                />
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const res = await fetch(`/api/admin/settings/upload-favicon?filename=${file.name}`, {
                      method: 'POST',
                      body: file,
                    });
                    const blob = await res.json();
                    if (blob.url) {
                      showToast("Favicon diperbarui");
                      setSettings(prev => {
                        const existing = prev.find(s => s.config_key === 'site_favicon');
                        if (existing) return prev.map(s => s.config_key === 'site_favicon' ? { ...s, config_value: blob.url } : s);
                        return [...prev, { config_key: 'site_favicon', config_value: blob.url }];
                      });
                      const link: any = document.querySelector("link[rel~='icon']");
                      if (link) link.href = blob.url;
                    }
                  }
                }}
                style={{ fontSize: 12 }}
              />
            </div>
          </div>

          {settings.filter(s => !['site_title', 'site_favicon'].includes(s.config_key)).map((s) => (
            <div key={s.config_key}>
              <label style={styles.label}>{s.config_key.replace(/_/g, ' ').toUpperCase()}</label>
              <input 
                defaultValue={s.config_value} 
                onBlur={(e) => handleUpdateSetting(s.config_key, e.target.value)}
                style={styles.inputForm} 
                type="text" 
              />
            </div>
          ))}
        </div>
      </div>

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
