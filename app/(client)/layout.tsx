"use client";
import BottomNav from "@/components/client/BottomNav";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Show BottomNav only on main tab routes
  const mainTabs = ["/", "/kajian", "/toko", "/tiket", "/profil"];
  const showNav = mainTabs.includes(pathname);

  return (
    <div style={styles.outer}>
      <div style={styles.container}>
        <main style={styles.main}>
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}

const styles = {
  outer: { background: "#0D0D14", minHeight: "100vh", display: "flex", justifyContent: "center" } as const,
  container: { 
    width: "100%", 
    maxWidth: 430, 
    minHeight: "100vh", 
    background: "#0D0D14", 
    position: "relative", 
    boxShadow: "0 0 60px rgba(212,175,55,0.05)", 
    display: "flex", 
    flexDirection: "column",
    overflow: "hidden"
  } as const,
  main: { flex: 1, paddingBottom: 100, display: "flex", flexDirection: "column" } as const,
};

