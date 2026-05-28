"use client";
import { useState, useEffect, useCallback } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Edit, Trash2, X, GripVertical, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, CreditCard, ListOrdered,
} from "lucide-react";
import { styles, Toast } from "./shared";
import { TiptapEditor } from "./TiptapEditor";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  type: string;
  provider: string;
  logoUrl: string | null;
  adminFeeFlat: number;
  adminFeePct: number;
  isActive: boolean;
  isRedirect: boolean;
  sortOrder: number;
}
interface Instruction {
  id: number;
  paymentMethodId: number;
  title: string;
  content: string;
  sortOrder: number;
}

const EMPTY_METHOD: Partial<PaymentMethod> = {
  name: "", code: "", type: "bank_transfer", provider: "manual",
  logoUrl: "", adminFeeFlat: 0, adminFeePct: 0, isActive: true, isRedirect: false,
};

const TYPE_OPTIONS = ["bank_transfer", "ewallet", "qris", "va", "credit_card", "other"];
const PROVIDER_OPTIONS = ["manual", "xendit", "midtrans", "other"];

// ─── Sortable Row ─────────────────────────────────────────────────────────────
function SortableMethodRow({
  method, isExpanded, onToggleExpand, onEdit, onDelete, onToggleActive,
}: {
  method: PaymentMethod;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: method.id });

  const rowStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#F0F9FF" : isExpanded ? "#F8FAFC" : "#fff",
    borderBottom: "1px solid #F1F5F9",
    display: "block",
  };

  return (
    <div ref={setNodeRef} style={rowStyle}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "36px 48px 1fr 100px 100px 100px 120px 110px 120px",
        alignItems: "center", padding: "12px 16px", gap: 8, minWidth: 900,
      }}>
        {/* Drag Handle */}
        <span {...attributes} {...listeners} style={{ cursor: "grab", color: "#CBD5E1", display: "flex", alignItems: "center" }}>
          <GripVertical size={18} />
        </span>

        {/* Logo */}
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {method.logoUrl
            ? <img src={method.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <CreditCard size={18} color="#94A3B8" />}
        </div>

        {/* Name + Code */}
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", margin: 0 }}>{method.name}</p>
          <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{method.code}</p>
        </div>

        {/* Type */}
        <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 8, background: "#EFF6FF", color: "#3B82F6", fontWeight: 600 }}>
          {method.type}
        </span>

        {/* Provider */}
        <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 8, background: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
          {method.provider}
        </span>

        {/* Fee */}
        <div style={{ fontSize: 12, color: "#475569" }}>
          {method.adminFeeFlat > 0 && <p style={{ margin: 0 }}>Rp {method.adminFeeFlat.toLocaleString()}</p>}
          {Number(method.adminFeePct) > 0 && <p style={{ margin: 0 }}>{method.adminFeePct}%</p>}
          {!method.adminFeeFlat && !Number(method.adminFeePct) && <p style={{ margin: 0, color: "#CBD5E1" }}>-</p>}
        </div>

        {/* Active Toggle */}
        <button
          onClick={onToggleActive}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          {method.isActive
            ? <ToggleRight size={28} color="#10B981" />
            : <ToggleLeft size={28} color="#CBD5E1" />}
          <span style={{ fontSize: 11, fontWeight: 600, color: method.isActive ? "#10B981" : "#94A3B8" }}>
            {method.isActive ? "Aktif" : "Nonaktif"}
          </span>
        </button>

        {/* Instructions expand */}
        <button
          onClick={onToggleExpand}
          style={{
            display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600,
            color: "#0891B2", background: isExpanded ? "#ECFEFF" : "#F8FAFC",
            border: `1px solid ${isExpanded ? "#A5F3FC" : "#E2E8F0"}`,
            borderRadius: 8, padding: "5px 10px", cursor: "pointer",
          }}
        >
          <ListOrdered size={14} />
          Instruksi
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onEdit} style={styles.actionBtnEdit}><Edit size={15} /></button>
          <button onClick={onDelete} style={styles.actionBtnDel}><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Instruction Row ─────────────────────────────────────────────────
function SortableInstructionRow({
  instruction, onEdit, onDelete,
}: {
  instruction: Instruction;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: instruction.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "10px 12px", background: isDragging ? "#F0F9FF" : "#fff",
        borderRadius: 10, border: "1px solid #E2E8F0", marginBottom: 8,
      }}
    >
      <span {...attributes} {...listeners} style={{ cursor: "grab", color: "#CBD5E1", paddingTop: 2 }}>
        <GripVertical size={16} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", margin: 0 }}>{instruction.title}</p>
        <div
          className="instruction-content-preview"
          dangerouslySetInnerHTML={{ __html: instruction.content }}
          style={{ fontSize: 12, color: "#64748B", margin: "4px 0 0", lineHeight: 1.6 }}
        />
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={onEdit} style={styles.actionBtnEdit}><Edit size={14} /></button>
        <button onClick={onDelete} style={styles.actionBtnDel}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

// ─── Instructions Panel ───────────────────────────────────────────────────────
function InstructionsPanel({ method }: { method: PaymentMethod }) {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Instruction>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchInstructions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payment-methods/instructions/get?methodId=${method.id}`);
      const data = await res.json();
      setInstructions(Array.isArray(data) ? data : []);
    } catch { setInstructions([]); }
    setLoading(false);
  }, [method.id]);

  useEffect(() => { fetchInstructions(); }, [fetchInstructions]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = instructions.findIndex(i => i.id === active.id);
    const newIdx = instructions.findIndex(i => i.id === over.id);
    const reordered = arrayMove(instructions, oldIdx, newIdx);
    setInstructions(reordered);
    await fetch("/api/admin/payment-methods/instructions/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map(i => i.id) }),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate: content must not be empty or just an empty paragraph
    const strippedContent = (formData.content || "").replace(/<[^>]*>/g, "").trim();
    if (!formData.title?.trim()) { alert("Judul instruksi wajib diisi"); return; }
    if (!strippedContent) { alert("Konten instruksi wajib diisi"); return; }

    const isUpdate = !!formData.id;
    const endpoint = isUpdate
      ? "/api/admin/payment-methods/instructions/update"
      : "/api/admin/payment-methods/instructions/create";
    const res = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, paymentMethodId: method.id }),
    });
    const json = await res.json();
    if (json.success) {
      showToast(isUpdate ? "Instruksi diperbarui" : "Instruksi ditambahkan");
      fetchInstructions();
      setIsModalOpen(false);
    } else {
      alert("Gagal: " + json.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus instruksi ini?")) return;
    const res = await fetch("/api/admin/payment-methods/instructions/delete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if ((await res.json()).success) {
      setInstructions(prev => prev.filter(i => i.id !== id));
      showToast("Instruksi dihapus");
    }
  };

  return (
    <div style={{ padding: "16px 16px 16px 56px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
      {toast && <Toast msg={toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: 0 }}>
          Instruksi Pembayaran — <span style={{ color: "#0891B2" }}>{method.name}</span>
        </p>
        <button
          onClick={() => { setFormData({}); setIsModalOpen(true); }}
          style={{ ...styles.primaryBtn, padding: "7px 14px", fontSize: 13, width: "auto" }}
        >
          <Plus size={14} /> Tambah Instruksi
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#94A3B8", fontSize: 13 }}>Memuat instruksi...</p>
      ) : instructions.length === 0 ? (
        <p style={{ color: "#CBD5E1", fontSize: 13, fontStyle: "italic" }}>Belum ada instruksi. Klik "Tambah Instruksi".</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={instructions.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {instructions.map(ins => (
              <SortableInstructionRow
                key={ins.id}
                instruction={ins}
                onEdit={() => { setFormData(ins); setIsModalOpen(true); }}
                onDelete={() => handleDelete(ins.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContentBase, maxWidth: 520 }}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                {formData.id ? "Edit Instruksi" : "Tambah Instruksi"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={styles.label}>Judul Instruksi</label>
                <input
                  required value={formData.title || ""}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={styles.inputForm} type="text"
                  placeholder="cth: Transfer via ATM BCA"
                />
              </div>
              <div>
                <label style={styles.label}>Konten / Langkah-langkah</label>
                <TiptapEditor
                  value={formData.content || ""}
                  onChange={html => setFormData(prev => ({ ...prev, content: html }))}
                  placeholder="Tuliskan langkah-langkah instruksi..."
                  minHeight={160}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn}>Batal</button>
                <button type="submit" style={{ ...styles.primaryBtn, width: "auto" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export function PaymentMethodView({ initialData }: { initialData: PaymentMethod[] }) {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialData);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>(EMPTY_METHOD);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = methods.findIndex(m => m.id === active.id);
    const newIdx = methods.findIndex(m => m.id === over.id);
    const reordered = arrayMove(methods, oldIdx, newIdx);
    setMethods(reordered);
    await fetch("/api/admin/payment-methods/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map(m => m.id) }),
    });
    showToast("Urutan metode pembayaran disimpan");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!formData.id;
    const endpoint = isUpdate
      ? "/api/admin/payment-methods/update"
      : "/api/admin/payment-methods/create";
    const res = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (json.success) {
      if (isUpdate) {
        setMethods(prev => prev.map(m => m.id === formData.id ? { ...m, ...formData } as PaymentMethod : m));
        showToast("Metode pembayaran diperbarui");
      } else {
        setMethods(prev => [...prev, json.data]);
        showToast("Metode pembayaran ditambahkan");
      }
      setIsModalOpen(false);
    } else {
      alert("Gagal: " + json.error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus metode pembayaran ini? Semua instruksi terkait akan ikut terhapus.")) return;
    const res = await fetch("/api/admin/payment-methods/delete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if ((await res.json()).success) {
      setMethods(prev => prev.filter(m => m.id !== id));
      if (expandedId === id) setExpandedId(null);
      showToast("Metode pembayaran dihapus");
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    const newActive = !method.isActive;
    setMethods(prev => prev.map(m => m.id === method.id ? { ...m, isActive: newActive } : m));
    await fetch("/api/admin/payment-methods/toggle", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: method.id, isActive: newActive }),
    });
    showToast(newActive ? `${method.name} diaktifkan` : `${method.name} dinonaktifkan`);
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {toast && <Toast msg={toast} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>Metode Pembayaran</h2>
          <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
            Kelola metode &amp; instruksi pembayaran · Drag untuk mengubah urutan
          </p>
        </div>
        <button
          onClick={() => { setFormData({ ...EMPTY_METHOD }); setIsModalOpen(true); }}
          style={{ ...styles.primaryBtn, width: "auto" }}
        >
          <Plus size={16} /> Tambah Metode
        </button>
      </div>

      {/* Table */}
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "36px 48px 1fr 100px 100px 100px 120px 110px 120px",
          padding: "10px 16px", gap: 8, background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0", minWidth: 900,
        }}>
          {["", "", "Nama / Kode", "Tipe", "Provider", "Biaya Admin", "Status", "Instruksi", "Aksi"].map((h, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {h}
            </span>
          ))}
        </div>

        {methods.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#CBD5E1" }}>
            <CreditCard size={40} style={{ margin: "0 auto 12px" }} />
            <p>Belum ada metode pembayaran. Klik "Tambah Metode".</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={methods.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {methods.map(method => (
                <div key={method.id}>
                  <SortableMethodRow
                    method={method}
                    isExpanded={expandedId === method.id}
                    onToggleExpand={() => setExpandedId(expandedId === method.id ? null : method.id)}
                    onEdit={() => { setFormData({ ...method }); setIsModalOpen(true); }}
                    onDelete={() => handleDelete(method.id)}
                    onToggleActive={() => handleToggleActive(method)}
                  />
                  {expandedId === method.id && <InstructionsPanel method={method} />}
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Create / Edit Method Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContentBase, maxWidth: 560 }}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>
                {formData.id ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Nama Metode *</label>
                  <input required value={formData.name || ""}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={styles.inputForm} placeholder="cth: BCA Virtual Account" />
                </div>
                <div>
                  <label style={styles.label}>Kode Unik *</label>
                  <input required value={formData.code || ""}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                    style={styles.inputForm} placeholder="cth: bca_va" />
                </div>
                <div>
                  <label style={styles.label}>Tipe *</label>
                  <select required value={formData.type || "bank_transfer"}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    style={styles.inputForm}>
                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Provider *</label>
                  <select required value={formData.provider || "manual"}
                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                    style={styles.inputForm}>
                    {PROVIDER_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={styles.label}>URL Logo (opsional)</label>
                  <input value={formData.logoUrl || ""}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                    style={styles.inputForm} placeholder="https://..." type="url" />
                </div>
                <div>
                  <label style={styles.label}>Biaya Admin Flat (Rp)</label>
                  <input type="number" min={0} value={formData.adminFeeFlat || 0}
                    onChange={e => setFormData({ ...formData, adminFeeFlat: parseInt(e.target.value) || 0 })}
                    style={styles.inputForm} />
                </div>
                <div>
                  <label style={styles.label}>Biaya Admin % </label>
                  <input type="number" min={0} max={100} step={0.01} value={formData.adminFeePct || 0}
                    onChange={e => setFormData({ ...formData, adminFeePct: parseFloat(e.target.value) || 0 })}
                    style={styles.inputForm} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" id="chk-active" checked={formData.isActive !== false}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }} />
                  <label htmlFor="chk-active" style={{ ...styles.label, margin: 0, cursor: "pointer" }}>Aktif</label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" id="chk-redirect" checked={!!formData.isRedirect}
                    onChange={e => setFormData({ ...formData, isRedirect: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer" }} />
                  <label htmlFor="chk-redirect" style={{ ...styles.label, margin: 0, cursor: "pointer" }}>Redirect (gateway)</label>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.secondaryBtn}>Batal</button>
                <button type="submit" style={{ ...styles.primaryBtn, width: "auto" }}>
                  {formData.id ? "Simpan Perubahan" : "Tambah Metode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
