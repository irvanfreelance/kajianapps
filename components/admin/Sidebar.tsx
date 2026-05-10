"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, BookOpen, ShoppingBag, ShoppingCart, 
  Users, Settings, LogOut
} from "lucide-react";

const navItems = [
  { id: "dashboard", href: "/panel", label: "Dashboard", Icon: LayoutDashboard },
  { id: "kajian", href: "/panel/kajian", label: "Kelola Kajian", Icon: BookOpen },
  { id: "products", href: "/panel/products", label: "Katalog Produk", Icon: ShoppingBag },
  { id: "orders", href: "/panel/orders", label: "Pesanan Masuk", Icon: ShoppingCart },
  { id: "users", href: "/panel/users", label: "Data Jamaah", Icon: Users },
  { id: "settings", href: "/panel/settings", label: "Pengaturan", Icon: Settings },
];

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen, isTablet }: { isMobileMenuOpen: boolean, setIsMobileMenuOpen: (val: boolean) => void, isTablet: boolean }) {
  const pathname = usePathname();

  return (
    <aside style={{ ...styles.sidebar, transform: (isTablet && !isMobileMenuOpen) ? "translateX(-100%)" : "translateX(0)" }}>
      <div style={styles.sidebarHeader}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0E7490, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>MI</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Admin Panel</h2>
      </div>
      
      <nav style={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.id} 
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ ...styles.navButton, background: isActive ? "#ECFEFF" : "transparent", color: isActive ? "#0891B2" : "#64748B", textDecoration: 'none' }}
              prefetch={true}
            >
              <item.Icon size={20} color={isActive ? "#0891B2" : "#64748B"} />
              <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={styles.sidebarFooter}>
        <button style={{ ...styles.navButton, color: "#EF4444", background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={20} color="#EF4444" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: { width: 260, background: "#fff", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", position: "fixed" as const, top: 0, bottom: 0, left: 0, zIndex: 50, transition: "transform 0.3s ease" },
  sidebarHeader: { padding: "24px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F1F5F9" },
  navContainer: { flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" as const },
  navButton: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "none", fontSize: 14, cursor: "pointer", transition: "all 0.2s", textAlign: "left" as const },
  sidebarFooter: { padding: "20px 12px", borderTop: "1px solid #F1F5F9" },
};
