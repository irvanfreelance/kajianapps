"use client";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export const getStatusStyle = (status: string) => {
  switch(status) {
    case "pending": return { bg: "#FFFBEB", color: "#B45309", label: "Menunggu Pembayaran" };
    case "packed": return { bg: "#F0FDF4", color: "#15803D", label: "Sedang Dikemas" };
    case "shipped": return { bg: "#ECFEFF", color: "#0891B2", label: "Dalam Pengiriman" };
    case "completed": return { bg: "#F8FAFC", color: "#475569", label: "Pesanan Selesai" };
    default: return { bg: "#F1F5F9", color: "#64748B", label: status };
  }
};

export const OrderStatusBadge = ({ status }: { status: string }) => {
  const { bg, color, label } = getStatusStyle(status);
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: bg, color: color, display: "inline-block", marginTop: 4 }}>
      {label}
    </span>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, setPage }: PaginationProps) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid #F1F5F9", marginTop: 8 }}>
      <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
        Halaman <span style={{ fontWeight: 700, color: "#0F172A" }}>{currentPage}</span> dari <span style={{ fontWeight: 700, color: "#0F172A" }}>{totalPages}</span>
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button 
          onClick={() => setPage(Math.max(1, currentPage - 1))} 
          disabled={currentPage === 1}
          style={{ padding: "6px 12px", borderRadius: 8, background: currentPage === 1 ? "#F8FAFC" : "#fff", color: currentPage === 1 ? "#CBD5E1" : "#0F172A", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))} 
          disabled={currentPage === totalPages}
          style={{ padding: "6px 12px", borderRadius: 8, background: currentPage === totalPages ? "#F8FAFC" : "#fff", color: currentPage === totalPages ? "#CBD5E1" : "#0F172A", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export const Toast = ({ msg }: { msg: string }) => (
  <div style={styles.toast}>
    <CheckCircle2 size={18} color="#fff" />
    <span>{msg}</span>
  </div>
);

export const styles = {
  card: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.02)", border: "1px solid #E2E8F0" } as const,
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" } as const,
  th: { padding: "12px 16px", fontSize: 12, color: "#64748B", fontWeight: 600, borderBottom: "1px solid #E2E8F0", whiteSpace: "nowrap" } as const,
  td: { padding: "16px", borderBottom: "1px solid #F1F5F9", verticalAlign: "middle" } as const,
  tr: { transition: "background 0.2s" } as const,
  primaryBtn: { padding: "10px 20px", borderRadius: 12, background: "#0891B2", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 } as const,
  secondaryBtn: { padding: "10px 20px", borderRadius: 12, background: "transparent", color: "#64748B", fontSize: 14, fontWeight: 600, border: "1px solid #E2E8F0", cursor: "pointer" } as const,
  actionBtnEdit: { width: 32, height: 32, borderRadius: 8, background: "#EFF6FF", border: "none", color: "#2563EB", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } as const,
  actionBtnDel: { width: 32, height: 32, borderRadius: 8, background: "#FEF2F2", border: "none", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } as const,
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", padding: 20 } as const,
  modalContentBase: { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" } as const,
  modalHeader: { padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 10 } as const,
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 } as const,
  inputForm: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, color: "#0F172A", background: "#F8FAFC" } as const,
  searchInput: { padding: "10px 16px 10px 36px", borderRadius: 20, border: "1px solid #E2E8F0", fontSize: 13, background: "#F8FAFC", width: 240, transition: "all 0.2s" } as const,
  toast: { position: "fixed", top: 24, right: 24, background: "#0F172A", color: "#fff", padding: "12px 20px", borderRadius: 12, zIndex: 300, display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 14, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } as const,
};
