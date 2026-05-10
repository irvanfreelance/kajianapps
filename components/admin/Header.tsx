"use client";
import { Search, Bell, User, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "dashboard", href: "/panel", label: "Dashboard" },
  { id: "kajian", href: "/panel/kajian", label: "Kelola Kajian" },
  { id: "products", href: "/panel/products", label: "Katalog Produk" },
  { id: "orders", href: "/panel/orders", label: "Pesanan Masuk" },
  { id: "users", href: "/panel/users", label: "Data Jamaah" },
  { id: "settings", href: "/panel/settings", label: "Pengaturan" },
];

export default function Header({ setIsMobileMenuOpen, isTablet, isMobile }: { setIsMobileMenuOpen: (val: boolean) => void, isTablet: boolean, isMobile: boolean }) {
  const pathname = usePathname();
  const currentLabel = navItems.find(n => n.href === pathname)?.label || "Admin Panel";

  return (
    <header style={styles.header}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {isTablet && (
          <button onClick={() => setIsMobileMenuOpen(true)} style={styles.mobileMenuBtn}><Menu size={24} color="#0F172A"/></button>
        )}
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#0F172A" }}>
          {currentLabel}
        </h1>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {!isTablet && (
          <div style={{ position: "relative" }}>
            <Search size={18} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input type="text" placeholder="Cari..." style={styles.searchInput} />
          </div>
        )}
        <button style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}>
          <Bell size={22} color="#64748B" />
          <span style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "#EF4444", border: "2px solid #fff" }} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: "1px solid #E2E8F0", paddingLeft: 20 }}>
          {!isMobile && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Admin Utama</p>
              <p style={{ fontSize: 12, color: "#64748B" }}>admin@majelis.id</p>
            </div>
          )}
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#CFFAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={20} color="#0891B2" />
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: { height: 72, background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 } as const,
  mobileMenuBtn: { background: "none", border: "none", cursor: "pointer" } as const,
  searchInput: { padding: "10px 16px 10px 36px", borderRadius: 20, border: "1px solid #E2E8F0", fontSize: 13, background: "#F8FAFC", width: 240, transition: "all 0.2s" } as const,
};
