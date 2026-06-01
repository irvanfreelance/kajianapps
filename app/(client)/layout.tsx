"use client";

import BottomNav from "@/components/client/BottomNav";
import Header from "@/components/client/Header";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Show BottomNav only on main tab routes
  const mainTabs = ["/", "/kajian", "/toko", "/tiket", "/profil"];
  const showNav = mainTabs.includes(pathname);

  // Exclude global header on specific transactional/auth pages
  const excludeHeaders = ["/login", "/register", "/checkout"];
  const showHeader = !excludeHeaders.includes(pathname) && 
    !pathname.startsWith("/status/") && 
    !pathname.endsWith("/infaq") && 
    !pathname.startsWith("/tiket/");

  return (
    <div style={styles.outer}>
      <div style={styles.container}>
        {showHeader && <Header />}
        <main style={styles.main}>
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}

const styles = {
  outer: { background: "#E8E2D5", minHeight: "100vh", display: "flex", justifyContent: "center" } as const,
  container: { 
    width: "100%", 
    maxWidth: 430, 
    minHeight: "100vh", 
    background: "#ffffff", 
    position: "relative", 
    boxShadow: "0 0 60px rgba(141,110,83,0.08)", 
    display: "flex", 
    flexDirection: "column",
    overflow: "hidden"
  } as const,
  main: { flex: 1, paddingBottom: 100, display: "flex", flexDirection: "column" } as const,
};

