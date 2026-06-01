"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Search, Layers, Loader2 } from "lucide-react";
import { styles, Toast } from "./shared";

interface KajianCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

const EMPTY_CATEGORY: Partial<KajianCategory> = {
  name: "",
  slug: ""
};

export default function KajianCategoriesView() {
  const [categories, setCategories] = useState<KajianCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<KajianCategory>>(EMPTY_CATEGORY);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/kajian-categories/list");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data || []);
      } else {
        alert("Gagal memuat kategori: " + json.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (category: KajianCategory) => {
    setFormData(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Hapus kategori "${name}"? Kategori tidak dapat dihapus jika masih digunakan oleh kajian.`)) return;
    try {
      const res = await fetch("/api/kajian-categories/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        showToast("Kategori berhasil dihapus");
      } else {
        alert(data.error || "Gagal menghapus kategori");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.slug?.trim()) {
      alert("Nama dan Slug wajib diisi!");
      return;
    }

    setIsSaving(true);
    const isUpdate = !!formData.id;
    const endpoint = isUpdate 
      ? "/api/kajian-categories/update" 
      : "/api/kajian-categories/create";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name.trim(),
          slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast(isUpdate ? "Kategori berhasil diperbarui" : "Kategori berhasil ditambahkan");
        setIsModalOpen(false);
        fetchCategories();
      } else {
        alert(json.error || "Gagal menyimpan kategori");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-generate slug when typing name
  const handleNameChange = (val: string) => {
    const slugged = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-');
    
    // Only auto-generate if slug was empty or matched the old name's slug
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: prev.id ? prev.slug : slugged
    }));
  };

  const filteredCategories = categories.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}

      {/* Header & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>Kelola Kategori Kajian</h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            Atur kategori kajian secara dinamis untuk filter pada aplikasi publik dan form kajian.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Search bar */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={16} color="#94A3B8" style={{ position: "absolute", left: 12 }} />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button
            onClick={() => {
              setFormData({ ...EMPTY_CATEGORY });
              setIsModalOpen(true);
            }}
            style={{ ...styles.primaryBtn, width: "auto" }}
          >
            <Plus size={16} /> Tambah Kategori
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 2fr 100px",
          padding: "12px 16px", gap: 12, background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0"
        }}>
          {["ID", "Nama Kategori", "Slug", "Aksi"].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {h}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, color: "#64748B" }}>
            <Loader2 size={24} className="animate-spin" />
            <span>Memuat kategori...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>
            <Layers size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 14 }}>Tidak ditemukan kategori kajian.</p>
          </div>
        ) : (
          filteredCategories.map(category => (
            <div key={category.id} style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 2fr 100px",
              padding: "16px", gap: 12, alignItems: "center",
              borderBottom: "1px solid #F1F5F9",
              background: "#fff", transition: "background 0.2s"
            }}>
              {/* ID */}
              <div>
                <span style={{ fontSize: 13, color: "#64748B" }}>#{category.id}</span>
              </div>

              {/* Name */}
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#0F172A", margin: 0 }}>
                  {category.name}
                </p>
              </div>

              {/* Slug */}
              <div>
                <code style={{ fontSize: 12, background: "#F1F5F9", padding: "3px 6px", borderRadius: 6, color: "#475569" }}>
                  {category.slug}
                </code>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  onClick={() => handleEditClick(category)} 
                  style={styles.actionBtnEdit}
                  title="Edit Kategori"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(category.id, category.name)} 
                  style={styles.actionBtnDel}
                  title="Hapus Kategori"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContentBase, maxWidth: 480 }}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                {formData.id ? "Edit Kategori Kajian" : "Tambah Kategori Kajian"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={20} color="#64748B" />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Name */}
              <div>
                <label style={styles.label}>Nama Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="cth: Sirah Nabawiyah"
                  value={formData.name || ""}
                  onChange={e => handleNameChange(e.target.value)}
                  style={styles.inputForm}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={styles.label}>Slug Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="cth: sirah-nabawiyah"
                  value={formData.slug || ""}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  style={styles.inputForm}
                />
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                  Gunakan huruf kecil, angka, dan tanda hubung saja.
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn} disabled={isSaving}>
                  Batal
                </button>
                <button type="submit" style={{ ...styles.primaryBtn, width: "auto" }} disabled={isSaving}>
                  {isSaving ? (
                    <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    formData.id ? "Simpan Perubahan" : "Tambah Kategori"
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
