"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ShoppingBag, Ticket, User } from "lucide-react";

const GOLD = "#8D6E53";
const DARK_NAV = "#FCFAF6";

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
            style={{ ...styles.navBtn, color: isActive ? GOLD : "#9E9083", textDecoration: 'none' }}
            prefetch={true}
          >
            {isActive && <div style={styles.activeDot} />}
            <item.Icon size={22} color={isActive ? GOLD : "#9E9083"} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, marginTop: 4 }}>{item.label}</span>
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
    background: DARK_NAV,
    borderTop: "1px solid #EFEAE0",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 100,
    paddingBottom: 8,
    boxShadow: "0 -4px 30px rgba(141,110,83,0.04)"
  },
  navBtn: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" as const, padding: "4px 12px" },
  activeDot: { position: "absolute" as const, top: 0, left: "50%", transform: "translateX(-50%)", width: 20, height: 3, borderRadius: 2, background: "#8D6E53" },
};
