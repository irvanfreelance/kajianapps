"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ShoppingBag, Ticket, User } from "lucide-react";

const navItems = [
  { id: "home", href: "/", label: "Home", Icon: Home },
  { id: "kajian", href: "/kajian", label: "Kajian", Icon: BookOpen },
  { id: "toko", href: "/toko", label: "Toko", Icon: ShoppingBag },
  { id: "tiket", href: "/tiket", label: "Tiket", Icon: Ticket },
  { id: "profil", href: "/profil", label: "Profil", Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.id} 
            href={item.href} 
            style={{ ...styles.navBtn, color: isActive ? "#0891B2" : "#94A3B8", textDecoration: 'none' }}
            prefetch={true}
          >
            <item.Icon size={22} color={isActive ? "#0891B2" : "#94A3B8"} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, marginTop: 4 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

const styles = {
  bottomNav: { 
    position: "fixed" as const, 
    bottom: 0, 
    width: "100%", 
    maxWidth: 430, 
    height: 70, 
    background: "#fff", 
    borderTop: "1px solid #F1F5F9", 
    display: "flex", 
    justifyContent: "space-around", 
    alignItems: "center", 
    zIndex: 100, 
    paddingBottom: 10,
    boxShadow: "0 -4px 20px rgba(0,0,0,0.03)"
  },
  navBtn: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", cursor: "pointer" },
};
