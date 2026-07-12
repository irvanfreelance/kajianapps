"use client";
import { useState } from "react";
import {
  Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, MessageSquare, Copy, Check, Search, Info
} from "lucide-react";
import { styles, Toast } from "./shared";
import { toast } from 'sonner';

interface NotificationTemplate {
  id: number;
  eventTrigger: string;
  channel: string;
  messageContent: string;
  isActive: boolean;
}

const EMPTY_TEMPLATE: Partial<NotificationTemplate> = {
  eventTrigger: "PRODUCT_CHECKOUT_PENDING",
  channel: "WHATSAPP",
  messageContent: "",
  isActive: true
};

const STANDARD_TRIGGERS = [
  "PRODUCT_CHECKOUT_PENDING",
  "PRODUCT_CHECKOUT_SUCCESS",
  "KAJIAN_CHECKOUT_PENDING",
  "KAJIAN_CHECKOUT_SUCCESS",
  "KAJIAN_FREE_SUCCESS",
  "PRODUCT_PAID"
];

const VARIABLES = [
  { name: "{nama}", desc: "Nama jamaah / pembeli" },
  { name: "{kode_pesanan}", desc: "ID Registrasi atau Kode Pesanan" },
  { name: "{nominal}", desc: "Nominal pembayaran (angka saja / dengan Rp)" },
  { name: "{metode}", desc: "Metode pembayaran yang dipilih" },
  { name: "{link_status}", desc: "Link tautan untuk cek detail/status pesanan" }
];

export function NotificationTemplateView({ initialData }: { initialData: NotificationTemplate[] }) {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<NotificationTemplate>>(EMPTY_TEMPLATE);
  const [isCustomTrigger, setIsCustomTrigger] = useState(false);
  const [customTriggerVal, setCustomTriggerVal] = useState("");
    const [copiedVar, setCopiedVar] = useState<string | null>(null);

  
  const handleCopyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const handleToggleActive = async (template: NotificationTemplate) => {
    const newActive = !template.isActive;
    setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, isActive: newActive } : t));
    try {
      const res = await fetch("/api/admin/notification-templates/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: template.id, isActive: newActive })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newActive ? `${template.eventTrigger} diaktifkan` : `${template.eventTrigger} dinonaktifkan`);
      } else {
        toast.error("Gagal memperbarui status: " + data.error);
        setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, isActive: !newActive } : t));
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
      setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, isActive: !newActive } : t));
    }
  };

  const handleEditClick = (template: NotificationTemplate) => {
    const isStd = STANDARD_TRIGGERS.includes(template.eventTrigger);
    setFormData(template);
    if (isStd) {
      setIsCustomTrigger(false);
      setCustomTriggerVal("");
    } else {
      setIsCustomTrigger(true);
      setCustomTriggerVal(template.eventTrigger);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, trigger: string) => {
    if (!window.confirm(`Hapus template notifikasi untuk "${trigger}"?`)) return;
    try {
      const res = await fetch("/api/admin/notification-templates/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast.success("Template notifikasi berhasil dihapus");
      } else {
        toast.error("Gagal menghapus: " + data.error);
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTrigger = isCustomTrigger ? customTriggerVal.trim() : formData.eventTrigger;
    
    if (!finalTrigger) {
      toast.error("Event trigger tidak boleh kosong!");
      return;
    }

    const payload = {
      ...formData,
      eventTrigger: finalTrigger
    };

    const isUpdate = !!formData.id;
    const endpoint = isUpdate 
      ? "/api/admin/notification-templates/update" 
      : "/api/admin/notification-templates/create";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        if (isUpdate) {
          setTemplates(prev => prev.map(t => t.id === json.data.id ? json.data : t));
          toast.success("Template notifikasi berhasil diperbarui");
        } else {
          setTemplates(prev => [...prev, json.data]);
          toast.success("Template notifikasi berhasil ditambahkan");
        }
        setIsModalOpen(false);
      } else {
        toast.error("Gagal menyimpan: " + json.error);
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      t.eventTrigger.toLowerCase().includes(q) ||
      t.messageContent.toLowerCase().includes(q) ||
      t.channel.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      
      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>Kelola Template Notifikasi</h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            Atur isi pesan otomatis WhatsApp yang dikirimkan ke Jamaah saat terjadi transaksi atau pendaftaran.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Search bar */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={16} color="#94A3B8" style={{ position: "absolute", left: 12 }} />
            <input
              type="text"
              placeholder="Cari template..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button
            onClick={() => {
              setFormData({ ...EMPTY_TEMPLATE });
              setIsCustomTrigger(false);
              setCustomTriggerVal("");
              setIsModalOpen(true);
            }}
            style={{ ...styles.primaryBtn, width: "auto" }}
          >
            <Plus size={16} /> Tambah Template
          </button>
        </div>
      </div>

      {/* Grid / List of Templates */}
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 80px 3fr 110px 100px",
          padding: "12px 16px", gap: 12, background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0"
        }}>
          {["Event Trigger", "Saluran", "Konten Pesan", "Status", "Aksi"].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {h}
            </span>
          ))}
        </div>

        {filteredTemplates.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>
            <MessageSquare size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 14 }}>Tidak ditemukan template notifikasi.</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div key={template.id} style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 80px 3fr 110px 100px",
              padding: "16px", gap: 12, alignItems: "start",
              borderBottom: "1px solid #F1F5F9",
              background: "#fff", transition: "background 0.2s"
            }}>
              {/* Event Trigger */}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", margin: 0, wordBreak: "break-all" }}>
                  {template.eventTrigger}
                </p>
              </div>

              {/* Channel */}
              <div>
                <span style={{ 
                  fontSize: 10, padding: "3px 8px", borderRadius: 8, 
                  background: template.channel === "WHATSAPP" ? "#DCFCE7" : "#F3F4F6", 
                  color: template.channel === "WHATSAPP" ? "#15803D" : "#4B5563", 
                  fontWeight: 700 
                }}>
                  {template.channel}
                </span>
              </div>

              {/* Message Content preview */}
              <div style={{ minWidth: 0 }}>
                <p style={{ 
                  fontSize: 13, color: "#475569", margin: 0, 
                  whiteSpace: "pre-wrap", lineHeight: 1.5,
                  background: "#F8FAFC", padding: "10px 12px", borderRadius: 8,
                  fontFamily: "monospace", border: "1px solid #E2E8F0"
                }}>
                  {template.messageContent}
                </p>
              </div>

              {/* Status */}
              <div>
                <button
                  onClick={() => handleToggleActive(template)}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0 }}
                >
                  {template.isActive
                    ? <ToggleRight size={26} color="#10B981" />
                    : <ToggleLeft size={26} color="#CBD5E1" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: template.isActive ? "#10B981" : "#94A3B8" }}>
                    {template.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  onClick={() => handleEditClick(template)} 
                  style={styles.actionBtnEdit}
                  title="Edit Template"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(template.id, template.eventTrigger)} 
                  style={styles.actionBtnDel}
                  title="Hapus Template"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Template Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContentBase, maxWidth: 640 }}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                {formData.id ? "Edit Template Notifikasi" : "Tambah Template Notifikasi"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={20} color="#64748B" />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Event Trigger select/input */}
              <div>
                <label style={styles.label}>Event Trigger *</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", color: "#475569" }}>
                    <input
                      type="radio"
                      checked={!isCustomTrigger}
                      onChange={() => setIsCustomTrigger(false)}
                      style={{ cursor: "pointer" }}
                    />
                    Pilih Trigger Standar
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", color: "#475569" }}>
                    <input
                      type="radio"
                      checked={isCustomTrigger}
                      onChange={() => setIsCustomTrigger(true)}
                      style={{ cursor: "pointer" }}
                    />
                    Kustom (Tulis Manual)
                  </label>
                </div>

                {!isCustomTrigger ? (
                  <select
                    value={formData.eventTrigger || "PRODUCT_CHECKOUT_PENDING"}
                    onChange={e => setFormData({ ...formData, eventTrigger: e.target.value })}
                    style={styles.inputForm}
                    required
                  >
                    {STANDARD_TRIGGERS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="cth: CUSTOM_EVENT_TRIGGER"
                    value={customTriggerVal}
                    onChange={e => setCustomTriggerVal(e.target.value.toUpperCase().replace(/\s/g, "_"))}
                    style={styles.inputForm}
                  />
                )}
              </div>

              {/* Saluran (Channel) */}
              <div>
                <label style={styles.label}>Saluran Notifikasi *</label>
                <select
                  value={formData.channel || "WHATSAPP"}
                  onChange={e => setFormData({ ...formData, channel: e.target.value })}
                  style={styles.inputForm}
                  required
                >
                  <option value="WHATSAPP">WHATSAPP</option>
                  <option value="EMAIL">EMAIL</option>
                </select>
              </div>

              {/* Message Content */}
              <div>
                <label style={styles.label}>Konten Pesan *</label>
                <textarea
                  value={formData.messageContent || ""}
                  onChange={e => setFormData({ ...formData, messageContent: e.target.value })}
                  style={{ ...styles.inputForm, height: 140, fontFamily: "monospace", resize: "vertical", lineHeight: 1.5 }}
                  placeholder="Tuliskan template notifikasi Anda di sini..."
                  required
                />
              </div>

              {/* Variable helpers */}
              <div style={{ background: "#F8FAFC", border: "1px dashed #CBD5E1", borderRadius: 12, padding: 14 }}>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                  <Info size={14} color="#0891B2" /> Variabel Pendukung (Klik untuk menyalin)
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {VARIABLES.map(v => {
                    const isCopied = copiedVar === v.name;
                    return (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => handleCopyVariable(v.name)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                          background: isCopied ? "#DCFCE7" : "#fff",
                          color: isCopied ? "#15803D" : "#0891B2",
                          border: `1px solid ${isCopied ? "#86EFAC" : "#E2E8F0"}`,
                          cursor: "pointer", transition: "all 0.15s"
                        }}
                        title={v.desc}
                      >
                        {v.name}
                        {isCopied ? <Check size={12} color="#15803D" /> : <Copy size={11} color="#0891B2" />}
                      </button>
                    );
                  })}
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 11, color: "#64748B" }}>
                  Sistem akan otomatis mengganti variabel di atas dengan nilai transaksi asli saat notifikasi dikirimkan.
                </p>
              </div>

              {/* Active Switch */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive !== false} 
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <label htmlFor="isActive" style={{ ...styles.label, margin: 0, cursor: "pointer" }}>
                  Aktifkan Template ini setelah disimpan
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn}>
                  Batal
                </button>
                <button type="submit" style={{ ...styles.primaryBtn, width: "auto" }}>
                  {formData.id ? "Simpan Perubahan" : "Tambah Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
